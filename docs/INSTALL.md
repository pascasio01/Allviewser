# Instalación

## Desarrollo

```bash
npm install
npm run dev
```

## Variables

Copia `.env.example` → `.env.local`. No subas secretos.

## Datos

Por defecto `./data`. Cambia con `COMPANERO_DATA_DIR=/ruta/segura`.

## Recuperación

1. Detén el servidor.
2. En Configuración o vía API `/api/backup`, elige un respaldo validado.
3. O restaura manualmente copiando un directorio de `data/backups/<id>/` sobre `data/` tras validar `manifest.json`.
4. Vuelve a `npm run dev`.

Procedimiento detallado: [BACKUP.md](./BACKUP.md).

## Fallos comunes

- **Puerto 3000 ocupado:** `npx next dev -p 3001`
- **Sin modelo:** esperado; configura en UI o deja las instrucciones.
- **Permiso de escritura en data/:** asegúrate de que el proceso puede crear el directorio.
