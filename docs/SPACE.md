# Espacio / mantenimiento (Allviewser)

Módulo **aislado** del núcleo del agente y del comercio. Primera entrega: edificio ficticio de demostración.

**Creador, fundador y CEO:** Pascasio Emmanuel Reynoso Reyes.

## Qué incluye (entregado)

- Edificio demo con objetos seleccionables (tubería, válvula, panel, puerta, sala, mesa)
- Ficha por objeto: hechos conocidos, campos desconocidos, documentos, historial, acciones
- Recorrido de incidencia: crear → asignar → progreso → evidencia → revisión → cierre
- Línea de tiempo del lugar (evento / captura / carga cuando aplica)
- Borradores «probar antes de cambiar» (no autorizan obra física)
- Memoria de decisiones (humana vs sugerencia)
- Pasaporte de resultado con criterios de aceptación
- Visita compartida local (presencia, comentarios, bloqueos; sin voz/grabación)
- Asistente contextual que no inventa precios ni diagnósticos
- Contrato de extensiones con permisos y alcance por lugar
- Modo **directo** (listas) y **inmersivo** (plano SVG 2D)

## Qué no hace

- No autoriza obras reales
- No procesa pagos ni reservas reales
- No es una app nativa; es una **aplicación web** (Next.js)
- El plano 2D no es un motor 3D

## Cómo ejecutar la demo

```bash
npm install
npm run dev
# Abrir http://localhost:3000/espacio
# Botón «Ejecutar recorrido completo» o pasos manuales por rol
```

Pruebas:

```bash
npm test -- tests/space.test.ts
```

API: `GET/POST /api/space` (acciones documentadas en la ruta).

Detalle de recorrido: [guides/DEMO_ESPACIO.md](guides/DEMO_ESPACIO.md).

## Aislamiento

| Carpeta | Responsabilidad |
|---------|-----------------|
| `src/lib/space/` | Dominio, roles, persistencia |
| `src/app/api/space/` | HTTP |
| `src/app/espacio/` | UI |
| `data/space/` | Estado local (no versionado) |

## Hoja de ruta (ordenado por dependencia)

1. Persistencia remota opcional del lugar (tras continuidad remota del núcleo)
2. Adjuntos binarios reales con cuotas
3. Visita multi-dispositivo con canal en tiempo real
4. Extensiones con sandbox de proceso (hoy: registro de manifiesto)
5. Capa 3D opcional sin romper modo directo
6. Módulos de reservas/comercio reutilizando solo componentes compartidos de ficha/permisos
