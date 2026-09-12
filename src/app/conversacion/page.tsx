"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";
import { StateBlock } from "@/components/StateBlock";
import type { Conversation } from "@/lib/conversations/types";

export default function ChatPage() {
  const { projectId, refresh } = useAppState();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    void (async () => {
      const res = await fetch(`/api/chat?projectId=${projectId}`);
      const json = await res.json();
      if (json.conversations?.[0]) {
        const full = await fetch(
          `/api/chat?projectId=${projectId}&conversationId=${json.conversations[0].id}`,
        );
        const data = await full.json();
        setConversation(data.conversation);
      } else {
        setConversation(null);
      }
    })();
  }, [projectId]);

  async function send() {
    if (!projectId || !text.trim()) return;
    setLoading(true);
    setError(null);
    const rid = crypto.randomUUID();
    setRequestId(rid);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          conversationId: conversation?.id,
          content: text.trim(),
          requestId: rid,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error de chat");
      setConversation(json.conversation);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRequestId(null);
    }
  }

  async function stop() {
    if (!requestId) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", requestId, projectId }),
    });
  }

  if (!projectId) {
    return <div className="empty">Selecciona o crea un proyecto para conversar.</div>;
  }

  return (
    <div className="stack">
      <h1>Conversación</h1>
      <p className="muted">
        Las respuestas solo proceden del proveedor configurado. Si no hay modelo, verás instrucciones reales.
      </p>
      <StateBlock error={error} onRetry={() => void refresh()}>
        <section className="panel">
          <div className="chat-log" aria-live="polite">
            {!conversation?.messages?.length && (
              <div className="empty">Aún no hay mensajes en esta conversación.</div>
            )}
            {conversation?.messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role === "user" ? "user" : "assistant"}`}>
                <strong>{m.role === "user" ? "Tú" : "Compañero"}</strong>
                {"\n"}
                {m.content}
                {m.meta?.error && (
                  <p className="muted" style={{ marginTop: "0.5rem" }}>
                    Estado: {m.meta.cancelled ? "cancelado" : "error de proveedor"}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="stack" style={{ marginTop: "1rem" }}>
            <label htmlFor="msg">Mensaje</label>
            <textarea
              id="msg"
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje…"
            />
            <div className="row">
              <button type="button" className="btn" disabled={loading || !text.trim()} onClick={() => void send()}>
                {loading ? "Enviando…" : "Enviar"}
              </button>
              <button type="button" className="btn secondary" disabled={!loading} onClick={() => void stop()}>
                Detener
              </button>
            </div>
          </div>
        </section>
      </StateBlock>
    </div>
  );
}
