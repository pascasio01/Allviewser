"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/components/AppProvider";

export default function FilesPage() {
  const { projectId } = useAppState();
  const [files, setFiles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState("notas/hola.txt");
  const [draft, setDraft] = useState("Hola desde el espacio autorizado.\n");

  async function list(q = query) {
    if (!projectId) return;
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "fs.list", projectId, input: { query: q } }),
    });
    const json = await res.json();
    if (!json.ok) setError(json.error);
    else setFiles(json.output.files);
  }

  useEffect(() => {
    void list("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function openFile(rel: string) {
    if (!projectId) return;
    setSelected(rel);
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "fs.read", projectId, input: { path: rel } }),
    });
    const json = await res.json();
    if (!json.ok) setError(json.error);
    else setContent(json.output.content);
  }

  async function writeFile() {
    if (!projectId) return;
    setError(null);
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "fs.write", projectId, input: { path, content: draft } }),
    });
    const json = await res.json();
    if (!json.ok) setError(json.error);
    else await list();
  }

  if (!projectId) return <div className="empty">Selecciona un proyecto.</div>;

  return (
    <div className="stack">
      <h1>Archivos</h1>
      <p className="muted">Solo dentro del espacio autorizado del proyecto. Las rutas con .. se rechazan.</p>
      {error && <div className="error">{error}</div>}
      <section className="panel stack">
        <div className="row">
          <input className="input" style={{ maxWidth: 280 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre" />
          <button type="button" className="btn secondary" onClick={() => void list()}>
            Buscar
          </button>
        </div>
        <ul>
          {files.map((f) => (
            <li key={f}>
              <button type="button" className="btn secondary" onClick={() => void openFile(f)}>
                {f}
              </button>
            </li>
          ))}
          {!files.length && <li className="muted">Sin archivos.</li>}
        </ul>
        {selected && (
          <div>
            <h2>{selected}</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
          </div>
        )}
      </section>
      <section className="panel stack">
        <h2>Escribir archivo</h2>
        <input className="input" value={path} onChange={(e) => setPath(e.target.value)} />
        <textarea className="textarea" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="button" className="btn" onClick={() => void writeFile()}>
          Guardar en espacio autorizado
        </button>
      </section>
    </div>
  );
}
