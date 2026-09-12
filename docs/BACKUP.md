# Respaldo y restauración

## Qué hay

- Exportación a `data/backups/<id>/`
- `manifest.json` con checksum SHA-256 del contenido
- Validación antes de restaurar
- Advertencia: **misma unidad de disco ≠ respaldo independiente**

## Procedimiento

### Crear

UI → Configuración → Exportar copia local, o:

```bash
curl -X POST http://localhost:3000/api/backup \
  -H 'content-type: application/json' \
  -d '{"action":"create","note":"manual"}'
```

### Validar

```bash
curl -X POST http://localhost:3000/api/backup \
  -H 'content-type: application/json' \
  -d '{"action":"validate","id":"BACKUP_ID"}'
```

### Restaurar

Detén escrituras activas. Luego restaura desde la UI o API `{"action":"restore","id":"..."}`.

### Prueba automatizada

```bash
npm run backup:demo
```

## Cifrado

No se inventa criptografía casera. Si se añade cifrado en el futuro, se usarán bibliotecas mantenidas y se documentará la gestión de claves.

## Versionado de proyectos de taller

Herramienta `workshop.diff_versions` guarda snapshots bajo `data/versions/<projectId>/`.
