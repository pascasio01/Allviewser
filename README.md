# Compañero Digital — Proyecto Independiente

**Creador, fundador y CEO: Pascasio Emmanuel Reynoso Reyes.**

Nombre comercial provisional (pendiente de verificación). La marca está centralizada en `src/lib/brand.ts`.

## Qué es

Un compañero digital local-first con conversación, proyectos, memoria aprobada, tareas, herramientas de archivos y un taller para crear aplicaciones pequeñas mediante un flujo verificable.

## Qué no promete

No promete conciencia, emociones reales, acceso universal, superioridad sobre todas las IA, coste cero de infraestructura ni ausencia absoluta de errores. Una computadora apagada no ejecuta tareas.

## Estado de la versión 0.1.0

| Área | Estado |
|------|--------|
| Interfaz web en español (i18n preparada) | **Implementado** |
| Proyectos, memoria, tareas, archivos | **Implementado** |
| Adaptador de modelo local / OpenAI-compatible | **Implementado** |
| Taller de app de tareas + pruebas de comportamiento | **Implementado** |
| Exportación / restauración con checksum | **Implementado** |
| Mundo visual ligero (sin 3D) | **Implementado** |
| Comercio inmersivo (demo ficticia, sandbox) | **Implementado (módulo aparte)** |
| Voz, visión, mapas, 3D | **Preparado / inactivo** |
| Continuidad remota | **Interfaz documentada / no desplegada** |
| Licencia y términos de contribución de código | **Pendiente del titular** |

### Plataforma entregada

- **Aplicación principal:** web (Next.js 15 + React 19 + TypeScript), ejecutable en navegador de escritorio y móvil.
- **App del taller (caso inicial):** CLI Node.js con persistencia JSON.
- **No es** una aplicación nativa iOS/Android/desktop, aunque la UI web sea adaptable.

## Requisitos

- Node.js 20+ (probado con 22)
- npm 10+

## Instalación y ejecución

```bash
git clone https://github.com/pascasio01/Allviewser.git
cd Allviewser
npm install
cp .env.example .env.local   # opcional
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Datos locales en `./data/` (ignorado por Git). Variable opcional: `COMPANERO_DATA_DIR`.

### Producción local

```bash
npm run build
npm start
```

### Comprobaciones

```bash
npm test
npm run backup:demo
npm run secret-scan
npm run lint
npm run build
```

## Configurar un modelo

1. Arranca un servidor compatible (p. ej. Ollama).
2. En **Configuración**, elige `local` u `openai-compatible`.
3. URL base ejemplo: `http://127.0.0.1:11434/v1`
4. Indica el `modelId`.
5. Si hace falta clave, usa el nombre de variable de entorno (nunca la pegues en el repo).

Sin modelo configurado, la conversación muestra **instrucciones reales** y no inventa respuestas inteligentes.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Comercio inmersivo](docs/COMMERCE.md)
- [Instalación](docs/INSTALL.md)
- [Modelos](docs/MODELS.md)
- [Permisos](docs/PERMISSIONS.md)
- [Respaldo y restauración](docs/BACKUP.md)
- [Informe de validación](docs/VALIDATION_REPORT.md)
- [Decisiones pendientes](docs/PENDING_DECISIONS.md)
- [Hoja de ruta](ROADMAP.md)
- [Contribuir](CONTRIBUTING.md)
- [Seguridad](SECURITY.md)
- [Código de conducta](CODE_OF_CONDUCT.md)
- [Avisos de terceros](THIRD_PARTY_NOTICES.md)
- [Registro de cambios](CHANGELOG.md)

## Seguridad

- Espacio de archivos aislado por proyecto
- Red denegada por defecto en herramientas
- Secretos fuera del código
- El agente no puede ampliar sus permisos ni alterar pruebas de aceptación para autoaprobarse

## Comunidad

Se aceptan **propuestas no confidenciales** (ideas, informes de errores, diseños). La aceptación de **código** espera a que el titular defina licencia y términos. No se prometen empleo, pagos ni recompensas sin presupuesto aprobado.

## Repositorio

GitHub: [pascasio01/Allviewser](https://github.com/pascasio01/Allviewser)

Proyecto independiente. No mezclar secretos, datos ni identidad de otros proyectos.
