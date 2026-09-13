"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { COMPANION_CONTRACT } from "@/lib/voice/companion";
import { t } from "@/lib/i18n/es";
import { useAppState } from "./AppProvider";

const links = [
  { href: "/", key: "home" as const },
  { href: "/conversacion", key: "chat" as const },
  { href: "/proyectos", key: "projects" as const },
  { href: "/tareas", key: "tasks" as const },
  { href: "/archivos", key: "files" as const },
  { href: "/memoria", key: "memory" as const },
  { href: "/herramientas", key: "tools" as const },
  { href: "/comercio", key: "commerce" as const },
  { href: "/espacio", key: "space" as const },
  { href: "/mundo", key: "world" as const },
  { href: "/configuracion", key: "settings" as const },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const messages = t();
  const { projectId, projects, setProjectId, config } = useAppState();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className={`app-shell ${config?.reducedMotion ? "reduce-motion" : ""}`}>
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand-block" style={{ display: "flex", gap: "0.65rem", alignItems: "center", marginBottom: "0.35rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logoPath} alt="" width={40} height={40} style={{ borderRadius: 10 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="brand-mark" style={{ margin: 0 }}>{brand.shortName}</p>
            <p className="brand-sub" style={{ margin: 0 }}>{brand.publicName}</p>
          </div>
          <button
            type="button"
            className="btn secondary mobile-nav-toggle"
            aria-expanded={navOpen}
            aria-controls="primary-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? "Cerrar" : "Menú"}
          </button>
        </div>
        <p className="brand-sub" style={{ fontSize: "0.7rem", opacity: 0.85, marginBottom: "1rem" }}>
          {brand.provisionalNotice}
        </p>
        <p className="brand-sub" style={{ fontSize: "0.72rem", opacity: 0.9, marginBottom: "0.85rem", lineHeight: 1.35 }}>
          {COMPANION_CONTRACT.calmCue}
        </p>
        <nav id="primary-nav" className={`nav-list ${navOpen ? "open" : ""}`}>
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
            Proyecto en el que te acompaño
          </label>
          <select
            id="project-select"
            className="select"
            style={{ marginTop: "0.35rem", color: "#102a28" }}
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value || null)}
          >
            <option value="">elige un proyecto para empezar</option>
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
