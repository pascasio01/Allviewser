import { NextResponse } from "next/server";
import {
  appendMessage,
  createConversation,
  getConversation,
  listConversations,
} from "@/lib/conversations/store";
import { loadConfig } from "@/lib/config/store";
import { createModelAdapter } from "@/lib/models/adapters";
import { logActivity } from "@/lib/activity/log";

export const runtime = "nodejs";

const controllers = new Map<string, AbortController>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
  const conversationId = searchParams.get("conversationId");
  if (conversationId) {
    const conversation = await getConversation(projectId, conversationId);
    return NextResponse.json({ conversation });
  }
  return NextResponse.json({ conversations: await listConversations(projectId) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const projectId = body.projectId as string;
  if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });

  if (body.action === "create") {
    const conversation = await createConversation(projectId, body.title);
    return NextResponse.json({ conversation }, { status: 201 });
  }

  if (body.action === "cancel") {
    const c = controllers.get(body.requestId);
    if (c) c.abort();
    return NextResponse.json({ ok: true });
  }

  let conversationId = body.conversationId as string | undefined;
  if (!conversationId) {
    const convo = await createConversation(projectId);
    conversationId = convo.id;
  }

  await appendMessage(projectId, conversationId!, { role: "user", content: body.content });

  const config = await loadConfig();
  const adapter = createModelAdapter(config);
  const requestId = body.requestId ?? crypto.randomUUID();
  const controller = new AbortController();
  controllers.set(requestId, controller);

  const history = await getConversation(projectId, conversationId!);
  const messages =
    history?.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })) ?? [];

  try {
    const result = await adapter.chat({ messages, signal: controller.signal });
    if (!result.ok) {
      const content =
        result.code === "not_configured" || result.code === "unavailable"
          ? result.instructions ?? result.error
          : `Error (${result.code}): ${result.error}`;
      const conversation = await appendMessage(projectId, conversationId!, {
        role: "assistant",
        content,
        meta: {
          provider: adapter.id,
          error: result.error,
          cancelled: result.code === "cancelled",
        },
      });
      await logActivity({
        type: "chat.error",
        projectId,
        message: result.error,
        meta: { code: result.code },
      });
      return NextResponse.json({ conversation, requestId, modelOk: false, code: result.code });
    }

    const conversation = await appendMessage(projectId, conversationId!, {
      role: "assistant",
      content: result.content,
      meta: { provider: result.provider },
    });
    return NextResponse.json({ conversation, requestId, modelOk: true });
  } finally {
    controllers.delete(requestId);
  }
}
