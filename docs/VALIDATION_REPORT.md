# Informe de validación — v0.2.2

Fecha: 2026-09-13  
Entorno: Linux x86_64, Node 22, repositorio `pascasio01/Allviewser`.  
**No presupone el hardware del usuario final.**

## Resultados

| Comprobación | Resultado | Notas |
|--------------|-----------|-------|
| `npm test` (35 tests) | OK | Núcleo, espacio, comercio, marca, procedencia/UI |
| `npm run lint` | OK | Sin errores |
| `npm run build` | OK | Next.js 15.5.25 producción |
| `npm run secret-scan` | OK | Sin secretos en el árbol revisado |
| API `/api/health` | OK | 200 en `localhost:3000` |
| API `/api/space?action=snapshot` | OK | Semilla ficticia con procedencia |
| UI `/espacio` (escritorio) | OK | Captura `docs/screenshots/espacio-desktop.png` |
| UI `/espacio` (móvil 390px) | OK | Captura `docs/screenshots/espacio-mobile.png` |
| Chat sin modelo | OK | Instrucciones reales, sin simular IA |
| Roles en UI de incidencias | OK | Actor activo; botones deshabilitados con motivo |
| Continuidad remota real | No verificado | Sin despliegue |
| Voz / 3D en vivo / mapas | No verificado | Módulos inactivos a propósito |
| Video del recorrido | No grabado en este entorno | Capturas estáticas disponibles |

## Cómo repetir

```bash
npm ci
npm test
npm run lint
npm run build
npm run secret-scan
npm run start
# Abrir http://localhost:3000/espacio
```
