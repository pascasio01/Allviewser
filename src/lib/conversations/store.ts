import path from "node:path";
import { v4 as uuid } from "uuid";
import { ensureDataLayout, readJsonFile, writeJsonFile } from "../config/store";
import { ConversationSchema, type Conversation, type ChatMessage } from "./types";

async function convoFile(projectId: string, conversationId: string, dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.conversations, projectId, `${conversationId}.json`);
}

async function indexFile(projectId: string, dataRoot?: string) {
  const paths = await ensureDataLayout(dataRoot);
  return path.join(paths.conversations, projectId, "index.json");
}

export async function listConversations(projectId: string, dataRoot?: string) {
  const file = await indexFile(projectId, dataRoot);
  return readJsonFile<{ id: string; title: string; updatedAt: string }[]>(file, []);
}

export async function getConversation(
  projectId: string,
  conversationId: string,
  dataRoot?: string,
): Promise<Conversation | null> {
  const file = await convoFile(projectId, conversationId, dataRoot);
  const raw = await readJsonFile<Conversation | null>(file, null);
  return raw ? ConversationSchema.parse(raw) : null;
}

export async function createConversation(
  projectId: string,
  title = "Conversación",
  dataRoot?: string,
): Promise<Conversation> {
  const now = new Date().toISOString();
  const convo = ConversationSchema.parse({
    id: uuid(),
    projectId,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  });
  await writeJsonFile(await convoFile(projectId, convo.id, dataRoot), convo);
  const index = await listConversations(projectId, dataRoot);
  index.unshift({ id: convo.id, title: convo.title, updatedAt: convo.updatedAt });
  await writeJsonFile(await indexFile(projectId, dataRoot), index);
  return convo;
}

export async function appendMessage(
  projectId: string,
  conversationId: string,
  message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string; createdAt?: string },
  dataRoot?: string,
): Promise<Conversation> {
  const convo = await getConversation(projectId, conversationId, dataRoot);
  if (!convo) throw new Error("Conversación no encontrada.");
  const msg: ChatMessage = {
    id: message.id ?? uuid(),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt ?? new Date().toISOString(),
    meta: message.meta,
  };
  convo.messages.push(msg);
  convo.updatedAt = msg.createdAt;
  await writeJsonFile(await convoFile(projectId, conversationId, dataRoot), convo);
  const index = await listConversations(projectId, dataRoot);
  const next = [{ id: convo.id, title: convo.title, updatedAt: convo.updatedAt }, ...index.filter((i) => i.id !== convo.id)];
  await writeJsonFile(await indexFile(projectId, dataRoot), next);
  return convo;
}
