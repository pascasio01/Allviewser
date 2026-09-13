# Revisión de marca (investigación preliminar)

**Fecha de consulta:** 2026-09-13  
**Proyecto / repo:** `pascasio01/Allviewser` (nombre de repositorio **provisional**; no renombrado en esta entrega)  
**Creador, fundador y CEO:** Pascasio Emmanuel Reynoso Reyes  
**Estado declarado en código:** `brand.legalStatus = provisional_unverified` (`src/lib/brand.ts`)

> **Aviso:** Este documento es una **investigación técnica preliminar** para orientar decisiones.  
> **No es un dictamen legal**, no autoriza el uso exclusivo de ningún nombre y **no sustituye** la revisión por un abogado de propiedad intelectual ni búsquedas oficiales completas ante cada oficina.  
> La ausencia de resultados en un buscador web **no** equivale a autorización legal.

## 1. Nombres bajo estudio

| Nombre | Rol actual | Notas |
|--------|------------|--------|
| **Allviewser** | Nombre provisional del **repositorio** GitHub | Se conserva. No se cambian remotos, dominios ni IDs de app sin autorización expresa. |
| **Compañero Digital — Proyecto Independiente** | Nombre **público / UI** provisional | Centralizado en `src/lib/brand.ts` (`publicName` / `shortName`). |
| **Brainluk** | Candidato alternativo pendiente de investigación | Listado en `brand.alternateCandidates`. **No** se usa como marca activa en la UI. |
| `companero-digital` | Identificador **interno** estable | Persistencia / marker (`internalProductId`). Separado de la marca pública. |

No se usa el símbolo ® ni se afirma exclusividad.

## 2. Método y fuentes

| Fuente | Uso | Resultado de acceso en esta sesión |
|--------|-----|-------------------------------------|
| Búsqueda web general (coincidencias exactas / variantes) | Usos comerciales y marcas cercanas | Parcial — ver sección 3 |
| USPTO Trademark Search / TSDR (EE. UU.) | Registro oficial de marcas | **No verificado** de forma interactiva completa en TESS; se revisaron resúmenes de terceros y la página informativa de búsqueda USPTO |
| ONAPI (República Dominicana) — búsqueda de signos / antecedentes | Registro oficial RD | **No verificado** en la base interactiva de signos; se confirmó existencia del servicio y canales oficiales |
| RDAP Verisign (`.com`) | Estado de registro de dominio vía protocolo de registro | Consulta HTTP realizada (ver sección 5) |
| RDAP genérico / WHOIS CLI | Dominios `.io` / `.app` | **No verificado** (WHOIS CLI ausente; RDAP `.io` sin servicio útil en el endpoint probado) |
| Redes sociales (handles exactos) | Disponibilidad de usuario | **No verificado** (no se inició sesión ni se reservó ningún handle) |

## 3. Coincidencias y variantes (Allviewser)

### 3.1 Exactas (`Allviewser` / `allviewser`)

- Búsqueda web de la cadena exacta: **no** apareció un producto/software consolidado con ese nombre exacto en los resultados revisados.
- Limitación: buscadores incompletos; no cubre todos los registros nacionales ni usos no indexados.

### 3.2 Variantes fonéticas / ortográficas relevantes a revisar

| Variante | Hallazgo preliminar | Por qué importa |
|----------|---------------------|-----------------|
| **ALLVIEW** (USPTO, fuentes secundarias) | Marcas **vivas** atribuidas p. ej. a Allview Services Inc. (p. ej. serial 90568648 / reg. 6874995) y QWW, Inc. (serial 87381422 / reg. 5310552), en clases distintas (p. ej. farma/otros; ropa) | Similitud ortográfica; hay que contrastar **clases de Nice** y riesgo de confusión con asesoría |
| **ALLVUE** (USPTO, fuentes secundarias) | Marcas de software/SaaS (p. ej. Allvue / Black Mountain Systems / Allvue Systems) en servicios informáticos | Cercanía fonética + **mismo campo amplio (software)** → prioridad alta de revisión legal |
| **Allview** (Rumanía) | Marca comercial de electrónica (Visual Fan / allview.ro) | Uso comercial consolidado; territorio distinto, pero notoriedad posible |
| **AllViews** | Herramienta de colaboración de diseño (reportes 2017) | Uso histórico en software; verificar vigencia |
| **All Viewer** / cámaras 360 | Productos OEM / listados de comercio | Variante descriptiva; riesgo menor o distinto según clase |
| AWS **AllViewer** | Nombre de política CloudFront (no marca de producto consumidor) | Homónimo técnico; bajo riesgo de marca comercial, pero documentado |

**Antes de adoptar “Allviewser” como marca comercial definitiva**, un abogado debería:

1. Ejecutar búsqueda oficial USPTO (word mark + similar) en clases 9/42 (software / SaaS) y afines.
2. Evaluar similitud con ALLVUE / ALLVIEW en EE. UU. y otros territorios de interés.
3. Completar búsqueda ONAPI (RD) de antecedentes de signos.
4. Valorar riesgo de confusión y estrategia (distintivo + logo + disclaimer territorial).

## 4. Coincidencias y variantes (Brainluk)

| Consulta | Resultado preliminar |
|----------|----------------------|
| Exacta `Brainluk` / `brainluk` | No se identificó marca/app consolidada con esa grafía en los resultados revisados |
| Cercanas (`Brainturk`, `BrainUp`, `Brainary`, etc.) | Existen productos/marcas de entrenamiento cognitivo / software con prefijo “Brain…” | Revisar si la estrategia de marca acepta proximidad en clase 9/42 |

**Antes de adoptar “Brainluk”:** misma batería USPTO + ONAPI + usos comerciales + dominios/redes. Estado actual: **candidato, no recomendado como definitivo**.

## 5. Dominios (distinto de marca)

Consulta RDAP Verisign (registro `.com`), 2026-09-13:

| Dominio | Resultado RDAP | Interpretación cautelosa |
|---------|----------------|---------------------------|
| `allviewser.com` | HTTP **404** en `rdap.verisign.com/com/v1/domain/ALLVIEWSER.COM` | Suele indicar que **no está registrado** en el registry `.com`. **No** es una orden de compra ni garantía de disponibilidad futura. Confirmar con registrador autorizado antes de cualquier adquisición. |
| `brainluk.com` | HTTP **404** análogo | Igual que arriba. |
| `allviewser.io` / `brainluk.io` / `.app` | **No verificado** (endpoints RDAP probados no devolvieron estado útil; sin WHOIS CLI) | Confirmar vía registrador ICANN-acreditado. |

**No se compró ningún dominio** en esta entrega.

Recordatorio: dominio disponible ≠ marca libre ≠ usuario social libre.

## 6. Usuarios sociales

| Plataforma | Allviewser | Brainluk |
|------------|------------|----------|
| X / Twitter, Instagram, GitHub org, etc. | **No verificado** | **No verificado** |

## 7. ONAPI (República Dominicana)

- Sitio / servicios de signos distintivos y búsqueda de antecedentes: documentados en canales ONAPI (p. ej. búsqueda de signos; búsqueda de antecedentes presencial con tasa).
- Consulta nominal exacta de `Allviewser` y `Brainluk` en la base ONAPI en esta sesión: **No verificado**.
- Acción recomendada: búsqueda preliminar en línea (si el portal lo permite) +, si se avanza a registro, **búsqueda de antecedentes** formal.

## 8. USPTO (Estados Unidos)

- Búsqueda interactiva completa en Trademark Search / TESS para el string exacto `ALLVIEWSER` y `BRAINLUK`: **No verificado** en esta sesión (no se obtuvo listado oficial primario exportable aquí).
- Fuentes secundarias sí muestran marcas **ALLVIEW** y **ALLVUE** activas o relevantes → requieren revisión humana contra clases de software.

## 9. Marca vs licencia de código vs autoría

| Concepto | Qué implica | Qué **no** implica |
|----------|-------------|-------------------|
| Marca / nombre comercial | Distingue origen empresarial en el mercado (tras registro o uso según jurisdicción) | No se obtiene solo por poner el nombre en un README |
| Licencia del código | Condiciones de uso/copia/modificación del software | No se modifica en esta entrega (`UNLICENSED` / pendiente del titular) |
| Autoría / copyright del código propio | Titularidad del código creado; créditos a colaboradores reales | **No impide** que terceros copien el código si la licencia lo permite, ni “protege la marca” por sí sola |
| Avisos de terceros | Se conservan (`THIRD_PARTY_NOTICES.md`) | No se alteran para “proteger” el nombre |

El nombre del fundador en créditos **no** sustituye registro de marca ni impide la copia del proyecto bajo los términos de licencia que el titular elija.

## 10. Conclusión operativa (no jurídica)

1. Seguir desarrollando con marca **provisional** (`Compañero Digital` en UI; repo `Allviewser`).
2. **No** adoptar aún Allviewser ni Brainluk como marca definitiva.
3. Priorizar revisión legal de similitudes **ALLVUE / ALLVIEW** si se insiste en la familia “Allview…”.
4. Completar USPTO + ONAPI oficiales y cotizar dominios con registrador antes de cualquier compra o solicitud de registro.
5. Cualquier cambio de nombre público debe hacerse vía `src/lib/brand.ts` sin renombrar `internalProductId` ni el remoto Git salvo autorización expresa.

## 11. Registro de consultas (resumen)

| # | Consulta | Herramienta | Hallazgo breve |
|---|----------|-------------|----------------|
| 1 | Exacta / variantes Allviewser | Web search | Sin producto exacto obvio; variantes ALLVIEW/ALLVUE/Allview relevantes |
| 2 | Exacta Brainluk | Web search | Sin marca consolidada exacta; cercanas “Brain*” |
| 3 | USPTO primario interactivo | Trademark Search | **No verificado** |
| 4 | USPTO secundario ALLVIEW/ALLVUE | Markinton / Furm / Justia (secundario) | Coincidencias a revisar con abogado |
| 5 | ONAPI signos | Portal ONAPI | Servicio existe; búsqueda nominal **No verificada** |
| 6 | Dominios `.com` | RDAP Verisign | 404 → probablemente libres; confirmar con registrador |
| 7 | Dominios `.io`/`.app` | RDAP | **No verificado** |
| 8 | Redes | — | **No verificado** |
