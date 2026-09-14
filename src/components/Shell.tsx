"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { t } from "@/lib/i18n/es";
import { useAppState } from "./AppProvider";
import { AiCorePanel } from "./AiCorePanel";

const links = [
  { href: "/", key: "home" as const },
  { href: "/conversacion", key: "chat" as const },
  { href: "/proyectos", key: "projects" as const },
  { href: "/tareas", key: "tasks" as const },
  { href: "/archivos", key: "files" as const },
  { href: "/memoria", key: "memory" as const },
  { href: "/herramientas", key: "tools" as const },
  { href: "/comercio", key: "commerce" as const },
  { href: "/mundo", key: "world" as const },
  { href: "/configuracion", key: "settings" as const },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const messages = t();
  const { projectId, projects, setProjectId, config } = useAppState();

  return (
    <div className={`app-shell theme-dim ${config?.reducedMotion ? "reduce-motion" : ""}`} data-theme={config?.theme ?? "dim"}>
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand-block">
          <p className="brand-mark">{brand.shortName}</p>
          <p className="brand-sub">{brand.provisionalName}</p>
          <AiCorePanel compact />
        </div>
        <nav className="nav-list">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {messages.nav[l.key]}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "1.5rem" }}>
          <label htmlFor="project-select" className="brand-sub">
            Proyecto activo
          </label>
          <select
            id="project-select"
            className="select"
            style={{ marginTop: "0.35rem", color: "#102a28" }}
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value || null)}
          >
            <option value="">— seleccionar —</option>
            {projects
              .filter((p) => p.status === "activo")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
      </aside>
      <div className="main">
        <a href="#contenido" className="sr-only" style={{ position: "absolute", left: "-9999px" }}>
          Saltar al contenido
        </a>
        <main id="contenido">{children}</main>
      </div>
    </div>
  );
}
