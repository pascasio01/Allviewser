# Permisos

## Principios

1. Acceso mínimo necesario
2. Archivos solo en `data/workspace/<projectId>/`
3. Red restringida por defecto
4. Acciones sensibles (pagos, publicaciones, borrados permanentes externos, cambios de acceso, envíos a terceros) requieren confirmación previa
5. El agente **no** puede ampliar sus permisos, desactivar controles ni alterar pruebas de aceptación

## Acciones declaradas

`fs.read`, `fs.write`, `fs.list`, `fs.delete`, `net.fetch`, `shell.run`, `memory.write`, `project.write`, `sensitive.external`

## Herramientas

Cada herramienta publica su manifiesto (ver pantalla Herramientas o `GET /api/tools`).

## Contenido no confiable

El texto de documentos, repositorios y resultados de herramientas **nunca** autoriza cambiar las reglas del sistema.
