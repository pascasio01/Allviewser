# Changelog

## 0.1.3 — 2026-09-14

### Añadido

- Presentación visual de producto: hero, diagrama SVG animado y mapa de ecosistema en `docs/assets/`.
- README estilo “landing” (badges, arquitectura, quick start, casos de uso) para que se vea poderoso y fácil de aportar.
- Mundo visual con profundidad 3D ligera (CSS + parallax suave) y hero animado en inicio; respeta `prefers-reduced-motion`.

## 0.1.2 — 2026-09-14

### Añadido

- Guía de instalación profesional (Path 1 arranque rápido / Path 2 terminal) en `README.md` y `docs/INSTALL.md`.
- Script `npm run doctor` (`scripts/doctor.ts`) para validar Node, npm, lockfile, datos y upgrades opcionales.
- Campo `engines` en `package.json` (Node 20–24, npm 10+).
- `CONTRIBUTING.md` actualizado para invitar a probar, mirar y aportar con Issues.

## 0.1.1 — 2026-09-13

### Añadido

- Módulo aislado de **comercio inmersivo y seguimiento visual** (`src/lib/commerce`, UI `/comercio`).
- Demo con restaurante ficticio, carrito, importes, pedidos sandbox, roles, sustituciones y webhooks firmados.
- Documentación en `docs/COMMERCE.md` y fase propia en `ROADMAP.md` (no bloquea el núcleo del agente).
- Pruebas automatizadas del flujo comercial (sin cobros ni reparto reales).

## 0.1.0 — 2026-09-12

### Añadido

- Primera versión funcional del compañero digital (web Next.js + núcleo TypeScript).
- Marca provisional centralizada; fundador Pascasio Emmanuel Reynoso Reyes.
- Proyectos, conversaciones, memoria (hecho/decisión/propuesta), tareas con cancelación e idempotencia.
- Herramientas de archivos con sandbox y taller de aplicación de tareas con pruebas de comportamiento.
- Exportación/restauración con validación de integridad (mismo disco; advertencia explícita).
- Mundo visual ligero, módulos de media/remoto preparados e inactivos.
- Documentación comunitaria, CI, escaneo básico de secretos e informe de validación.
