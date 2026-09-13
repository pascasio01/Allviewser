# Arquitectura

## Visión

Monolito modular (no un archivo gigante, no microservicios innecesarios) con separación clara:

| Capa | Ubicación |
|------|-----------|
| Interfaz | `src/app/*`, `src/components/*` |
| i18n | `src/lib/i18n` |
| Configuración / marca | `src/lib/brand.ts`, `src/lib/config` |
| Persistencia | JSON atómico bajo `data/` |
| Proyectos / memoria / conversaciones | `src/lib/projects`, `memory`, `conversations` |
| Motor de tareas | `src/lib/tasks` |
| Adaptadores de modelos | `src/lib/models` |
| Registro de herramientas | `src/lib/tools` |
| Permisos / sandbox | `src/lib/permissions` |
| Ejecución aislada (taller) | `spawn` sin red añadida en herramientas de test |
| Integraciones externas | `src/lib/media`, `src/lib/remote` |
| Actividad | `src/lib/activity` |
| Respaldo | `src/lib/backup` |
| Comercio (aislado) | `src/lib/commerce` |
| Espacio / mantenimiento (aislado) | `src/lib/space` |
| Evolución revisable | `src/lib/evolution` |
| Pruebas | `tests/*` (protegidas frente a autoaprobación del agente) |

## Contratos

- **ModelAdapter:** `chat(messages, signal)` → éxito o error tipado (`not_configured`, `timeout`, `cancelled`, …).
- **Tool:** manifiesto con id/versión, I/O, permisos, red, costes, timeout, cancelación, reversibilidad + `execute`.

## Datos

Árbol típico en `COMPANERO_DATA_DIR` (default `./data`):

```
config.json
projects/
memories/
conversations/
tasks/
workspace/<projectId>/
versions/
backups/
activity/
evolution/
```

## Seguridad

- Path canonicalization y rechazo de `..` / absolutas
- Red off por defecto
- Redacción de secretos en actividad
- Confirmación para acciones sensibles
- Sin exposición deliberada del motor local a Internet

## Decisiones de v0.1

- Next.js App Router + API routes Node para velocidad de entrega y UI única.
- Persistencia JSON (portable, inspeccionable) en lugar de DB servidor.
- Sin 3D en el mundo visual para no degradar accesibilidad.
- Repo GitHub existente `pascasio01/Allviewser` como destino autorizado del proyecto.
