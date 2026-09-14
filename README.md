# Allviewser

**Compañero Digital** — Proyecto Independiente  
**Autor:** Pascasio Emmanuel Reynoso Reyes ([@pascasio01](https://github.com/pascasio01))

Nombre comercial provisional (pendiente de verificación). La marca vive en `src/lib/brand.ts`.

## Descripción

Aplicación web local-first que actúa como compañero de trabajo digital: conversación con modelos configurables, proyectos, memoria aprobada, tareas, archivos en sandbox, taller verificable y un módulo de comercio inmersivo en demo.

## Alcance de esta versión (0.1)

Incluye:

- Interfaz en español (i18n preparada)
- Proyectos, memoria, tareas e idempotencia
- Adaptadores de modelo local / OpenAI-compatible (sin respuestas inventadas si no hay proveedor)
- Taller con app CLI de tareas y tests de comportamiento
- Exportación y restauración con checksum
- Mundo visual ligero
- Módulo aparte de comercio inmersivo en sandbox (`/comercio`)

No incluye aún (y no se promete):

- Conciencia, emociones ni “IA omnisciente”
- Voz, visión, mapas o 3D activos
- Continuidad remota desplegada
- Pagos o reparto reales en el módulo de comercio
- Licencia y términos de contribución de código (decisión del titular)

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Vitest

---

## Claves = upgrades, no requisitos

Puedes arrancar **sin** modelo ni API keys. La app muestra instrucciones reales y no simula inteligencia.

Cuando quieras conversación con un modelo:

1. Arranca un servidor compatible (por ejemplo **Ollama**).
2. En la app, abre **Configuración**.
3. Elige proveedor `local` u `openai-compatible`, URL base (ej. `http://127.0.0.1:11434/v1`) y `modelId`.
4. Si el proveedor exige clave, indica solo el **nombre** de la variable de entorno (nunca pegues el secreto en el repo). Detalle: [Keys & costes](docs/MODELS.md).

Opcional: copia `.env.example` → `.env.local` para `COMPANERO_MODEL_API_KEY` u otras variables. Guía completa: [docs/INSTALL.md](docs/INSTALL.md).

---

## Path 1 — Arranque rápido (probar y mirar)

Para revisar la demo, explorar la UI y aportar ideas o issues — sin flujo de contribución de código.

1. Clona el repositorio e instala dependencias (comando del Path 2 más abajo).
2. Ejecuta `npm run doctor` y luego `npm run dev`.
3. Abre [http://localhost:3000](http://localhost:3000).

Compatible con **Windows**, **macOS** y **Linux** (Node en PATH). Los datos quedan en `./data/` (ignorado por Git).

¿Falló un intento anterior? Borra `node_modules` y `.next`, vuelve a `npm ci` y corre el doctor otra vez. Detalles en [docs/INSTALL.md](docs/INSTALL.md#fallos-comunes).

---

## Path 2 — Terminal / coding agent

Usa **Node.js 20.x o 22.x** (recomendado **22 LTS**; es lo que usa CI). El setup doctor avisa si la versión es rara o demasiado nueva. Se requiere **npm 10+**.

```bash
git clone https://github.com/pascasio01/Allviewser.git
cd Allviewser
npm ci
npm run doctor
npm run dev
```

Abre `http://localhost:3000`.

Desde el **centro de control**, elige **Proyectos**, **Conversación**, **Taller / tareas**, **Comercio** o **Mundo visual**. Sin modelo configurado verás instrucciones honestas, no respuestas inventadas.

<details>
<summary>Comandos útiles (validación, producción local, seguridad)</summary>

```bash
npm test                 # suite
npm run lint && npm run build
npm run validate         # test + lint + build
npm run backup:demo      # demo de respaldo/restauración
npm run secret-scan      # no subas secretos
npm run build && npm start   # producción local
```

Puerto 3000 ocupado: `npx next dev -p 3001`.  
Directorio de datos: `COMPANERO_DATA_DIR=/ruta/segura`.

</details>

---

## Luego poténcialo — en la app, no en un archivo

Las claves y el proveedor de modelo son **upgrades**, no prerequisitos. Cuando quieras uno, ve a **Configuración** en la barra lateral, guarda, y vuelve a **Conversación**.

Más detalle: [docs/MODELS.md](docs/MODELS.md) · [docs/INSTALL.md](docs/INSTALL.md).

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [INSTALL](docs/INSTALL.md) | Instalación detallada (paths, doctor, fallos) |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Diseño del núcleo |
| [COMMERCE](docs/COMMERCE.md) | Módulo de comercio (aislado) |
| [MODELS](docs/MODELS.md) | Adaptadores de modelo / costes |
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

## Contribuciones — míralo y aporta

Queremos que la gente **lo pruebe, lo mire y aporte**: ideas, bugs, accesibilidad, diseño y hallazgos de seguridad responsable.

- Abre un Issue con la plantilla adecuada.
- La fusión de código de terceros espera a **licencia** y términos definidos por el titular.

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Repositorio

https://github.com/pascasio01/Allviewser  

Proyecto independiente. No mezclar secretos, datos ni identidad con otros proyectos.
