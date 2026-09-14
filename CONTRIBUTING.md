# Guía de contribución

Gracias por tu interés en **Compañero Digital — Proyecto Independiente** (Allviewser).

**Creador, fundador y CEO:** Pascasio Emmanuel Reynoso Reyes.

Queremos que la gente **lo mire y aporte**: prueba la app en local, abre Issues útiles y ayuda a mejorar el producto con propuestas claras.

## Primero: instálalo y míralo

Sigue la guía profesional de instalación:

1. [README — Path 1 / Path 2](README.md)
2. [docs/INSTALL.md](docs/INSTALL.md) (`npm ci` → `npm run doctor` → `npm run dev`)

Abre [http://localhost:3000](http://localhost:3000) y recorre **Proyectos**, **Conversación**, **Comercio** y **Configuración**. Anota lo que no encaje: eso ya es una aportación valiosa.

## Estado de las contribuciones

Hasta que el titular publique **licencia** y **términos de contribución de código**:

- **Sí (ahora):** propuestas no confidenciales — ideas, diseños, informes de errores, mejoras de accesibilidad, hallazgos de seguridad responsable, feedback tras probar la demo.
- **No todavía:** pull requests de código destinados a fusionarse como contribución aceptada bajo una licencia indefinida.

Puedes abrir un Issue con la plantilla adecuada. No envíes secretos ni datos personales de terceros.

## Roles bienvenidos (propuestas)

Desarrolladores, diseñadores, investigadores, científicos, especialistas en accesibilidad, hackers éticos y usuarios que detecten problemas útiles.

## Cómo proponer

1. Busca Issues existentes.
2. Abre uno nuevo con el contexto mínimo reproducible (pasos, SO, versión de Node del doctor si aplica).
3. Indica impacto en seguridad, accesibilidad o coste si aplica.
4. Si puedes, adjunta capturas o el mensaje del `npm run doctor`.

## Código (cuando se habilite)

Flujo previsto:

1. Fork / rama
2. `npm run doctor` y `npm test`
3. `npm run secret-scan`
4. Pull request con la plantilla
5. Revisión humana según riesgo

No alteres las pruebas de aceptación para hacer pasar un cambio defectuoso.

## Reconocimientos

Los colaboradores se listarán en `docs/ACKNOWLEDGEMENTS.md` cuando haya términos claros. No se prometen pagos ni empleo sin presupuesto aprobado.
