# Changelog

## 0.2.3 — 2026-09-13

### Añadido / cambiado

- Voz psicológica del compañero (`src/lib/voice/companion.ts`): contrato emocional, cuatro intenciones, SPACE_VOICE y MODULE_VOICE.
- Inicio rediseñado alrededor de presencia honesta + grid de intenciones.
- Espacio: rail de intenciones con necesidad/límite, copy calmado en carga, vacíos, asistente y acciones.
- Conversación, proyectos, memoria, archivos, tareas, herramientas, mundo, comercio y configuración usan la misma voz (puertas de proyecto, vacíos, límites).
- Shell con susurro del contrato; estados vacíos/error/offline calmados; `docs/PRODUCT_VOICE.md`.
- Pruebas de coherencia de voz (`tests/companion-voice.test.ts`).

## 0.2.2 — 2026-09-13

### Añadido / cambiado

- Etiquetas de procedencia de datos (`en_vivo`, `periodico`, `grabado`, `estimado`, `simulado`, `generado`) en objetos y evidencias del Espacio.
- Acciones de UI respetan el actor activo (sin hardcodear admin/técnico/revisor); botones deshabilitados explican el rol faltante.
- Guía de «siguiente paso», rail Explorar/Crear/Resolver/Revisar e indicador de conexión.
- Navegación móvil colapsable; paneles de Espacio apilados en pantallas estrechas.
- Pruebas de procedencia y disponibilidad por rol; README bilingüe con estado real.

## 0.2.1 — 2026-09-13

### Añadido / cambiado

- Configuración de marca centralizada (`src/lib/brand.ts`): nombre público, logo, fundador, aviso provisional.
- Separación entre identidad pública, `internalProductId` estable y `repositoryName` (Allviewser, sin renombrar remotos).
- Investigación preliminar de nombres en `docs/brand-review.md` (no es dictamen legal).
- Logo provisional en `/brand/logo.svg`.

## 0.2.0 — 2026-09-13

### Añadido

- Módulo aislado **Espacio / mantenimiento** (`src/lib/space`, UI `/espacio`, API `/api/space`).
- Edificio demo ficticio con objetos seleccionables, fichas, incidencias por rol, evidencia, línea de tiempo.
- Borradores «probar antes de cambiar», memoria de decisiones, pasaporte de resultado.
- Visita compartida local (presencia, comentarios, bloqueos; sin voz/grabación).
- Asistente contextual que declara «Información no disponible» cuando falta el dato.
- Contrato e instalación aislada de extensiones por lugar.
- Modos directo (listas) e inmersivo (plano SVG 2D).
- Pruebas de aceptación en `tests/space.test.ts` y guía `docs/guides/DEMO_ESPACIO.md`.

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
