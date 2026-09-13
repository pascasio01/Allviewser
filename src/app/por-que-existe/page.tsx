import Link from "next/link";
import { brand, displayAttribution, repositoryUrl } from "@/lib/brand";
import { COMPANION_CONTRACT, INTENTIONS } from "@/lib/voice/companion";

export default function PorQueExistePage() {
  return (
    <div className="stack">
      <header className="stack" style={{ gap: "0.5rem" }}>
        <p className="badge">
          v{brand.version} · {brand.status}
        </p>
        <h1 className="h-display" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", margin: 0 }}>
          Por qué existe {brand.shortName}
        </h1>
        <p className="muted" style={{ maxWidth: "42rem", fontSize: "1.05rem" }}>
          {brand.tagline}
        </p>
        <p className="muted">{displayAttribution()}</p>
      </header>

      <section className="panel stack companion-presence">
        <h2>La promesa</h2>
        <p>
          Nació para ser un compañero local-first que <strong>no finge</strong> capacidades. En un
          mercado lleno de demos que inventan sensores, cobros y “IA que todo lo sabe”, este proyecto
          elige otra vía: honestidad operable, rastro revisable y roles conscientes.
        </p>
        <p className="muted">{brand.provisionalNotice}</p>
      </section>

      <section className="panel stack">
        <h2>{COMPANION_CONTRACT.title}</h2>
        <p className="muted">{COMPANION_CONTRACT.calmCue}</p>
        <ul>
          {COMPANION_CONTRACT.pledges.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="panel stack">
        <h2>Qué nunca hará (en esta versión)</h2>
        <ul>
          <li>Inventar respuestas cuando no hay modelo configurado.</li>
          <li>Presentar un plano 2D como cámara o gemelo en vivo.</li>
          <li>Cobrar o repartir de verdad en el comercio demo.</li>
          <li>Saltar revisiones cambiando de rol en silencio.</li>
          <li>Reconstruir un pasado que no quedó registrado.</li>
        </ul>
      </section>

      <section className="panel stack">
        <h2>Cuatro intenciones</h2>
        <div className="intention-grid">
          {INTENTIONS.map((i) => (
            <article key={i.id} className="intention-card">
              <h3>{i.label}</h3>
              <p>
                <span className="muted">Necesidad:</span> {i.need}
              </p>
              <p>
                <span className="muted">Ofrece:</span> {i.offer}
              </p>
              <p>
                <span className="muted">Límite:</span> {i.boundary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <h2>Quién lo sostiene</h2>
        <p>
          {brand.founder.role}: <strong>{brand.founder.name}</strong> (@{brand.founder.github})
        </p>
        <p className="muted">
          Repositorio provisional:{" "}
          <a href={repositoryUrl()} target="_blank" rel="noreferrer">
            {brand.repositoryOwner}/{brand.repositoryName}
          </a>
        </p>
        <div className="row">
          <Link className="btn" href="/espacio">
            Entrar al Espacio
          </Link>
          <Link className="btn secondary" href="/confianza">
            Ver diario de confianza
          </Link>
          <Link className="btn secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </div>
  );
}
