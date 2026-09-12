# Informe de validación — v0.1.0

Fecha: 2026-09-12  
Entorno del agente: Linux x86_64, Node 22.14, repositorio `pascasio01/Allviewser`.  
**No presupone el hardware del usuario final.**

## Resultados ejecutados en el agente

| Comprobación | Resultado | Notas |
|--------------|-----------|-------|
| `npm install` | OK | Dependencias instaladas |
| `npm test` (9 tests) | OK | Persistencia, sandbox, modelo ausente, tareas, taller, backup |
| `npm run backup:demo` | OK | Restauración real en tmp con checksum válido |
| `npm run secret-scan` | OK | 80 archivos; sin coincidencias de secretos |
| `npm run lint` | OK | Sin errores |
| `npm run build` | OK | Next.js 15.5.25 producción |
| API `/api/health` | OK | Smoke en `localhost:3000` |
| Chat sin modelo | OK | Devuelve instrucciones reales (`not_configured`), no simula IA |
| Persistencia tras reinicio lógico | OK | Tests de config/store |
| Separación entre proyectos | OK | Test |
| Restricción de rutas | OK | Test `../` y absolutas |
| Cancelación de tareas | OK | Test |
| Flujo taller + pruebas de comportamiento | OK | App CLI Node.js `version-probada` |
| UI en navegador gráfico | No verificado aquí | Build y rutas OK; conviene revisión visual manual |
| Continuidad remota real | No verificado | Sin servidor desplegado |
| Voz / visión / mapas | No verificado | Módulos inactivos a propósito |

## Fallos pendientes

- Dependencias transitivas de Next/postcss con avisos `npm audit` (actualizar con cuidado en v0.2; `audit fix --force` instalaría Next 16).
- Repositorio remoto actualmente **público** mientras licencia/contribuciones están pendientes (ver `docs/PENDING_DECISIONS.md`).

## Cómo repetir

```bash
npm ci
npm test
npm run backup:demo
npm run secret-scan
npm run lint
npm run build
npm run dev
```
