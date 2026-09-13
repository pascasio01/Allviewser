# Comercio inmersivo y seguimiento visual

Módulo **independiente del núcleo del agente** (conversación, tareas, memoria, taller).  
Fase de hoja de ruta: `roadmap-commerce-v1` · versión `0.1.0-demo`.

**Titular del proyecto:** Pascasio Emmanuel Reynoso Reyes (creador, fundador y CEO).

## Qué incluye esta entrega

- Demo completa con restaurante ficticio **Sabores del Patio (FICTICIO)**
- Menú pequeño con medios etiquetados (fotografía, reconstrucción, marcador 3D, video demo)
- Carrito, personalización, cálculo de importes (subtotal, entrega, impuestos, total)
- Pedidos de prueba con idempotencia (sin duplicados)
- Seguimiento por estados del sistema del negocio + línea de tiempo con hora
- Estimaciones etiquetadas; animaciones = estados (no cámara real)
- Recuperación tras desconexión (último estado conocido)
- Panel de negocio: disponibilidad, aceptación/seguimiento, sustituciones con confirmación del cliente
- Roles: administrador, preparación, reparto, cliente
- Conectores sandbox: pagos, notificaciones, webhooks firmados, ubicación de repartidor desactivada
- UI ligera en `/comercio` (sin obligación de 3D)

## Qué no hace (a propósito)

- No cobra dinero real
- No activa reparto real ni GPS de repartidor
- No afirma ausencia de alérgenos ni seguridad alimentaria (usa notas del negocio + aviso)
- No mezcla datos ni identidad con otros proyectos

## Cómo probar

```bash
npm test -- tests/commerce.test.ts
npm run dev
# Abrir http://localhost:3000/comercio
```

API: `GET/POST /api/commerce` (acciones documentadas en la ruta).

## Arquitectura (aislamiento)

```
src/lib/commerce/     # dominio, persistencia, roles, integraciones sandbox
src/app/api/commerce/ # HTTP del módulo
src/app/comercio/     # UI demo
data/commerce/        # estado local (gitignored vía data/)
```

Flags en `src/lib/commerce/flags.ts` permiten activar/desactivar capacidades por etapa.

## Pendiente / dependencias externas

| Capacidad | Estado |
|-----------|--------|
| Pagos de producción | Conector preparado; requiere cuentas y permisos |
| Notificaciones push/email reales | Sandbox in-app |
| Reparto y ubicación autorizada | Interfaz; desactivada en demo |
| Tour 3D / AR / cocina en vivo / anfitrión virtual | Futuro (flags en off) |
| Pedidos grupales, repetir pedido, fotos de empaque | Posterior |

## Métricas a observar (cuando haya uso real)

- Facilidad para completar un pedido
- Errores de carrito/pago/estado
- Rendimiento de la vista ligera
- Consultas de seguimiento y recuperación tras desconexión

Mejoras solo tras demostrar utilidad; siempre mantener alternativa accesible sin 3D.
