# Hoja de ruta

## v0.1 — Primera versión funcional (núcleo del agente)

- Aplicación web local-first en español
- Proyectos, conversación, memoria tipada, tareas con cancelación/reanudación
- Herramientas de archivos y taller de creación (app de tareas verificada)
- Exportación/restauración con integridad
- Mundo visual ligero y módulos de media/remoto preparados pero inactivos
- Documentación comunitaria y CI básica

## Fase paralela — Comercio inmersivo v1 (demo; no bloquea el núcleo)

Módulo aislado en `src/lib/commerce` + UI `/comercio`. Detalle: [docs/COMMERCE.md](docs/COMMERCE.md).

- Restaurante ficticio, carrito, importes, pedidos sandbox
- Seguimiento por estados, sustituciones, roles, webhooks firmados
- Sin cobros ni reparto reales; 3D/AR/cocina en vivo desactivados

## Fase paralela — Espacio / mantenimiento v1 (demo; no bloquea el núcleo)

Módulo aislado en `src/lib/space` + UI `/espacio`. Detalle: [docs/SPACE.md](docs/SPACE.md).

- Edificio ficticio, objetos con ficha, incidencias con roles
- Línea de tiempo, borradores, decisiones, pasaporte, visita local
- Asistente contextual sin inventar datos; extensiones con alcance por lugar
- Sin obras, pagos ni reservas reales; plano 2D (no 3D nativo)

### Mejoras siguientes (por dependencia)

1. Adjuntos binarios con cuotas
2. Visita multi-dispositivo
3. Sandbox de ejecución de extensiones
4. 3D opcional sin romper modo directo
5. Reutilizar ficha/permisos en reservas/comercio cuando existan

## v0.2 — Modelos y taller

- Asistente de configuración de modelos locales con comprobación de disponibilidad
- Más plantillas de taller (web estática pequeña, utilidades)
- Diff visual de versiones de proyecto
- Mejoras de accesibilidad auditadas

## v0.3 — Continuidad remota opcional

- Servicio separado con autenticación y TLS
- Cola idempotente entre dispositivos
- Políticas de conflicto y recuperación documentadas y probadas
- Sin sincronización indiscriminada de secretos

## Posterior (evaluado)

- Transcripción / TTS con permisos explícitos de micrófono
- Análisis de imágenes autorizado
- Capas espaciales 3D opcionales sin romper modo directo
- Evolución asistida con revisión humana según riesgo
- Comercio: pagos/reparto de producción, pedidos grupales, AR, cocina en vivo (con autorización)

Los experimentos sobre datos reales requieren permiso explícito.
