# Política de seguridad

## Reportes

Si descubres una vulnerabilidad en **Compañero Digital / Allviewser**, por favor **no** abras un Issue público con detalles explotables.

Envía un reporte privado al titular del repositorio (`pascasio01` en GitHub) describiendo:

- Impacto
- Pasos para reproducir
- Versión / commit
- Posible mitigación

## Alcance

Incluye: escape del espacio de archivos, exposición de secretos, ejecución aislada insuficiente, escalada de permisos del agente, manipulación de pruebas de aceptación.

Fuera de alcance habitual: denegación de servicio trivial en entorno local de desarrollo, o hallazgos en dependencias ya publicados con parche disponible (indícalos igual si afectan el despliegue por defecto).

## Principios del producto

- Contenido de páginas, documentos y salidas de herramientas = no confiable
- Mínimo privilegio; red restringida por defecto
- Secretos fuera del código y de los registros
- Acciones sensibles requieren confirmación
- El agente no puede ampliar sus permisos ni desactivar controles

## Divulgación

Coordinaremos una corrección antes de la divulgación pública cuando sea razonable.
