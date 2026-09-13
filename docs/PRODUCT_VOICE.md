# Voz del producto — coherencia psicológica

Compañero Digital se diferencia por **cómo acompaña**, no por inventar capacidades.

## Principios

1. **Honestidad radical** — Nunca finge sensores, modelos, permisos ni conexiones.
2. **Presencia guiada** — Siempre hay un siguiente paso claro según el rol activo.
3. **Cambio de rol consciente** — Cambiar de actor es empatía operativa, no un truco para saltarse reglas.
4. **Evidencia como ritual de confianza** — Lo ocurrido se puede revisar; no se reconstruye un pasado inexistente.
5. **Calma demo** — El usuario puede explorar, equivocarse y reiniciar sin consecuencias reales.

## Intenciones

| Intención | Necesidad | Oferta | Límite |
|-----------|-----------|--------|--------|
| Explorar | Orientarme sin miedo | Fichas y plano con procedencia | No es cámara en vivo |
| Crear | Probar antes de comprometer | Borradores y taller | No es obra ni pago real |
| Resolver | Actuar con el rol correcto | Incidencias y evidencias | No inventa permisos |
| Revisar | Confiar en lo ocurrido | Línea de tiempo y pasaporte | No inventa historial |

Código fuente de la voz: `src/lib/voice/companion.ts`.

## Superficies

| Superficie | Fuente de voz |
|------------|---------------|
| Inicio | `COMPANION_CONTRACT` + `INTENTIONS` |
| Espacio | `SPACE_VOICE` + rail de intenciones |
| Resto de módulos | `MODULE_VOICE` (puertas, vacíos, límites) |
| Roles / botones | `roleNeedReason` en `ui-actions` |

La unicidad del producto es **cómo acompaña**: honestidad, siguiente paso, rol consciente y evidencia revisable — no “más IA fingida”.

## Capas de élite (v0.2.4)

1. **Diario de confianza** — Qué ocurrió / qué no se afirma / qué queda pendiente.
2. **Contrato por acción** — Antes de firmar: quién firma, qué se registra, qué no se afirma.
3. **Modo sombra** — Ver permisos de otro rol sin firmar en su nombre.
4. **Replay narrado** — Relato breve de la línea de tiempo; silencio si no hay hechos.
5. **Ritual de memoria** — sugerido → propuesto → aprobado.
6. **Ticket ético de comercio** — cobro/reparto/impuesto declarados como no reales.
7. **Por qué existe** — Promesa pública del fundador y lista de cosas que el producto nunca hará.
