# Allviewser

**Compañero Digital** — Proyecto Independiente  
**Autor:** Pascasio Emmanuel Reynoso Reyes (@pascasio01)

Nombre comercial provisional (pendiente de verificación). La marca vive en `src/lib/brand.ts`.

## Descripción

Aplicación web local-first que actúa como compañero de trabajo digital: conversación con modelos configurables, proyectos, memoria aprobada, tareas, archivos en sandbox y un taller para generar apps pequeñas con pruebas reales.

## Alcance de esta versión (0.1)

Incluye:

- Interfaz en español (i18n preparada)
- Proyectos, memoria, tareas e idempotencia
- Adaptadores de modelo local / OpenAI-compatible (sin respuestas inventadas si no hay proveedor)
- Taller con app CLI de tareas y tests de comportamiento
- Exportación y restauración con checksum
- Mundo visual ligero
- Módulo aparte de comercio inmersivo en sandbox (`/comercio`)
- Módulo **Espacio** de mantenimiento demo (`/espacio`): edificio ficticio, fichas, incidencias, línea de tiempo, borradores, pasaporte, visita local, asistente contextual y extensiones aisladas

No incluye aún (y no se promete):

- Conciencia, emociones ni “IA omnisciente”
- Voz, visión, mapas o 3D activos (el plano de Espacio es SVG 2D)
- Continuidad remota desplegada
- Pagos, reparto u obras reales
- Licencia y términos de contribución de código (decisión del titular)

**Creador, fundador y CEO:** Pascasio Emmanuel Reynoso Reyes.  
**Plataforma entregada:** aplicación web (Next.js) en navegador; no es app nativa.

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Vitest

## Requisitos

- Node.js 20+ (probado con 22)
- npm 10+

## Instalación

```bash
git clone https://github.com/pascasio01/Allviewser.git
cd Allviewser
npm install
cp .env.example .env.local   # opcional
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).  
Datos locales en `./data/` (ignorado por Git). Variable opcional: `COMPANERO_DATA_DIR`.

```bash
npm run build && npm start   # producción local
npm test                     # suite
npm run lint && npm run build
npm run backup:demo
npm run secret-scan
```

## Configurar un modelo

1. Arranca un servidor compatible (por ejemplo Ollama).
2. En **Configuración**, elige `local` u `openai-compatible`.
3. URL base de ejemplo: `http://127.0.0.1:11434/v1`
4. Indica el `modelId`.
5. Si hace falta clave, usa solo el nombre de la variable de entorno (nunca la pegues en el repo).

Sin modelo configurado, la UI muestra instrucciones reales y no simula inteligencia.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Diseño del núcleo |
| [SPACE](docs/SPACE.md) | Módulo de espacio / mantenimiento |
| [DEMO_ESPACIO](docs/guides/DEMO_ESPACIO.md) | Recorrido de mantenimiento |
| [COMMERCE](docs/COMMERCE.md) | Módulo de comercio (aislado) |
| [INSTALL](docs/INSTALL.md) | Instalación detallada |
| [MODELS](docs/MODELS.md) | Adaptadores de modelo |
| [PERMISSIONS](docs/PERMISSIONS.md) | Modelo de permisos |
| [BACKUP](docs/BACKUP.md) | Respaldo y restauración |
| [VALIDATION_REPORT](docs/VALIDATION_REPORT.md) | Comprobaciones ejecutadas |
| [PENDING_DECISIONS](docs/PENDING_DECISIONS.md) | Decisiones abiertas |
| [ROADMAP](ROADMAP.md) | Hoja de ruta |
| [AUTHORS](AUTHORS) | Autoría |
| [CONTRIBUTING](CONTRIBUTING.md) · [SECURITY](SECURITY.md) · [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) | Comunidad |
| [CHANGELOG](CHANGELOG.md) · [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md) | Cambios y avisos |

## Seguridad (resumen)

Espacio de archivos aislado por proyecto, red denegada por defecto en herramientas, secretos fuera del código, y confirmación en acciones sensibles. El agente no puede ampliar sus propios permisos ni alterar pruebas de aceptación para autoaprobarse.

## Contribuciones

Se aceptan propuestas no confidenciales (ideas, bugs, diseño). La fusión de código espera a licencia y términos definidos por el titular. Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Repositorio

https://github.com/pascasio01/Allviewser  

Proyecto independiente. No mezclar secretos, datos ni identidad con otros proyectos.
