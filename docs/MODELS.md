# Configuración de modelos

## Proveedores en v0.1

| Proveedor | Descripción |
|-----------|-------------|
| `none` | Predeterminado. No hay inferencia. Se muestran instrucciones. |
| `local` | Alias de cliente OpenAI-compatible hacia un host local. |
| `openai-compatible` | Igual que local; útil para proxies. |

## Campos

- `baseUrl` — p. ej. `http://127.0.0.1:11434/v1`
- `modelId` — nombre del modelo en el servidor
- `apiKeyEnv` — nombre de variable de entorno (no el valor)
- `timeoutMs` — tiempo máximo por solicitud

## Comportamiento

- Cancelación vía `AbortSignal` / botón Detener
- Errores tipados; no se inventa una respuesta “inteligente”
- Capacidades que requieren modelo descargado deben indicarlo en el servidor de modelos (fuera de este repo)

## Costes

Cualquier proveedor remoto de pago es responsabilidad del usuario. Este software no incluye facturación.
