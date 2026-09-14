# Instalación

Guía para **probar**, **revisar** y **aportar** a Allviewser / Compañero Digital.

> Presentación visual (hero, arquitectura, ecosistema): ver el [README](../README.md).
> Esta guía se centra en arrancar en serio.

## Resumen

| | Path 1 — Arranque rápido | Path 2 — Terminal / coding agent |
|--|--------------------------|----------------------------------|
| Para quién | Quien quiere mirar la demo y abrir issues | Quien valida, desarrolla o usa un agente de código |
| Node | 20.x o 22.x (recomendado 22 LTS) | Igual; CI usa **22** |
| Comando clave | `npm run doctor` → `npm run dev` | `npm ci` → `doctor` → `dev` / `validate` |
| Claves | Opcionales (upgrades en la UI) | Opcionales |

Compatible con **Windows**, **macOS** y **Linux**.

---

## Claves = upgrades, no requisitos

No hace falta token ni `.env` para arrancar. Sin proveedor de modelo, la UI muestra instrucciones reales.

Cuando quieras potenciar conversación:

1. Servidor compatible (p. ej. Ollama) en marcha.
2. En la app: **Configuración** → proveedor `local` u `openai-compatible`.
3. URL base (ej. `http://127.0.0.1:11434/v1`) + `modelId`.
4. Si hace falta API key: solo el **nombre** de la variable de entorno en Configuración; el valor vive en `.env.local` o en tu shell.

Opcional:

```bash
cp .env.example .env.local
```

Variables documentadas en `.env.example`. Costes y proveedores: [MODELS.md](./MODELS.md).

---

## Path 1 — Arranque rápido

1. Ten **Node.js 20+** (mejor **22 LTS**) y **npm 10+** en el PATH.
2. Clona e instala (bloque del Path 2).
3. Corre el doctor y arranca:

```bash
npm run doctor
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000).
5. Desde el centro de control prueba **Proyectos**, **Conversación**, **Taller / tareas**, **Comercio** o **Mundo visual**.

¿Instalación anterior fallida? Actualiza Node a 22 LTS, borra `node_modules` y `.next`, vuelve a `npm ci` y ejecuta `npm run doctor`.

---

## Path 2 — Terminal / coding agent

Usa **Node.js 20.x o 22.x**. El doctor avisa sobre versiones intermedias (21/23) o ≥25. **npm 10+** obligatorio.

```bash
git clone https://github.com/pascasio01/Allviewser.git
cd Allviewser
npm ci
npm run doctor
npm run dev
```

Abre `http://localhost:3000`.

### Qué comprueba el doctor

- Versión de Node y npm
- Presencia de `package-lock.json` y `node_modules`
- Permiso de escritura en `./data` (o `COMPANERO_DATA_DIR`)
- `.env.example` legible
- Si hay variables de upgrade definidas (solo **nombres**, nunca valores)

Salida con error (`exit 1`) → corrige antes de `dev`. Avisos → puedes continuar.

### Después del arranque

1. Abre el centro de control en `/`.
2. Crea o selecciona un **proyecto** en la barra lateral.
3. Explora **Conversación**, **Tareas**, **Archivos**, **Memoria**, **Comercio**.
4. Si quieres modelo: **Configuración** (ver arriba).

### Validación (antes de un PR o revisión seria)

```bash
npm run secret-scan
npm test
npm run lint
npm run build
# o de un golpe:
npm run validate
```

Demo de respaldo:

```bash
npm run backup:demo
```

Producción local:

```bash
npm run build && npm start
```

---

## Datos locales

- Por defecto: `./data/` (ignorado por Git).
- Alternativa: `COMPANERO_DATA_DIR=/ruta/segura`.
- No mezclar este directorio con otros proyectos ni con secretos en claro.

## Recuperación

1. Detén el servidor.
2. En **Configuración** o vía API `/api/backup`, elige un respaldo validado.
3. O restaura manualmente copiando `data/backups/<id>/` sobre `data/` tras validar `manifest.json`.
4. Vuelve a `npm run dev`.

Procedimiento detallado: [BACKUP.md](./BACKUP.md).

## Fallos comunes

| Síntoma | Qué hacer |
|---------|-----------|
| Puerto 3000 ocupado | `npx next dev -p 3001` |
| Sin modelo / sin respuestas “inteligentes” | Esperado. Configura en **Configuración** o deja las instrucciones. |
| `doctor` falla por dependencias | `npm ci` y vuelve a correr el doctor. |
| Permiso de escritura en `data/` | Asegura que el proceso puede crear el directorio, o define `COMPANERO_DATA_DIR`. |
| Node raro / build raro | Usa Node **22 LTS** (misma que CI). |
| Sospecha de secreto en el árbol | `npm run secret-scan` y no commits de `.env.local`. |

## Aportar después de instalar

Míralo en local y aporta con Issues (ideas, bugs, accesibilidad, diseño, seguridad responsable). La fusión de código de terceros espera licencia y términos del titular. Ver [CONTRIBUTING.md](../CONTRIBUTING.md).
