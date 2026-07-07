# ARCANCHILE — Plataforma de Oportunidades e Investigación de Mercado 2026-2030

## Plataforma web (directorio)

Aplicación interna para los directores de ARCANCHILE construida con **Vite + React + TypeScript + Tailwind CSS + Recharts**, con todos los datos de la investigación (69 oportunidades, 30 empresas, 10 licitaciones, plan de 90 días) importados desde los archivos de `informe/`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de producción
```

**Acceso demo (login simulado, sin backend):** usuario `admin` · contraseña `arcanchile2026`

### Clasificación Core Pipeline vs Otros

Cada uno de los 69 proyectos está clasificado según el core de ARCANCHILE (ingeniería e inspección de **ductos / pipeline**):

- **`categoria`**: `pipeline` (47 proyectos con componente de ductos/piping) u `otros` (22 sin relación con ductos).
- **`relevanciaArcanchile`**: `alta` (ductos puros: acueductos, mineroductos, inspección de cañerías — 14 proyectos), `media` (incluye piping de proceso pero no es exclusivo, p. ej. una concentradora — 33), `baja` (sin ductos — 22).
- Cada proyecto pipeline incluye el **componente de ductos concreto**, las **normativas aplicables** (ASME B31.1/.3/.4/.8/.11/.12, API 510/570/574/579/650/653/1104, ASME IX, AWWA) y los **servicios de ductos** que aplican.

La clasificación vive en `src/data/pipelineClassification.ts` y se fusiona con los proyectos en `src/data/enriched.ts` (fuente única para toda la app).

| Vista | Contenido |
|---|---|
| Dashboard | Filtro principal **Todos / Core Pipeline / Otros**; KPIs separados Pipeline vs Otros; inversión por sector, dona por estado, **barra apilada Pipeline vs Otros por sector**, top 10 (coloreado por categoría) y mapa esquemático de Chile |
| Proyectos | Catálogo con **toggle prominente "Solo Pipeline/Ductos"**, filtros (relevancia, sector, región, servicio, estado, prioridad, inversión), badge/borde azul de pipeline, **columna Relevancia**, y chips de servicio de ductos al filtrar por pipeline; vista tabla/tarjetas, orden por columnas y exportación CSV (con columnas de clasificación) |
| Pipeline | **Página dedicada al core**: oportunidades de ductos organizadas por tipo de servicio (Diseño, END, QA/QC, ITO, Inspección en servicio, Comisionamiento), con relevancia, cronograma y normativas |
| Detalle | Ficha completa, **sección "Componente Pipeline/Ductos"** con normativas y servicios de ductos, servicios ARCANCHILE, fuente, relacionados y botón "Marcar como contactado" (persistente) |
| Empresas | Directorio de mandantes, EPCs y organismos con vías de inscripción de proveedores y links a portales |
| Plan de Acción | Timeline de 90 días, checklist interactivo (persistente) y tabla maestra A/B/C con filtros (marca los proyectos pipeline) |
| Alertas | Licitaciones activas con la alerta ENAP destacada como prioritaria y plan de monitoreo |

---

# Investigación de mercado — Oportunidades de Ingeniería e Inspección en Chile 2026-2030

**Cliente**: ARCANCHILE — servicios de ingeniería (conceptual/básica/detalle, estructural/FEA, piping, mecánica, E&I, civil, escaneo láser 3D/BIM, terreno) e inspección (ITO, QA/QC, END UT/PAUT/MT/PT/RT/VT, drones, equipos a presión, comisionamiento, monitoreo geotécnico, inspección reglamentaria SEC/SERNAGEOMIN, peritajes).

**Fecha de corte**: 7 de julio de 2026.
**Metodología**: investigación web multi-fuente con verificación adversarial de los datos macro (3 verificadores independientes por afirmación; 24 de 25 confirmadas, 1 refutada y excluida) + 10 investigaciones sectoriales complementarias con triangulación de fuentes. Todo dato de fuente única/débil está marcado **[SIN CONFIRMAR]**.

## Resumen ejecutivo

1. **El mercado está en máximos históricos.** La cartera minera de Cochilco 2025-2034 alcanza **US$104.549 millones** (+25,7%, máximo en 11 años) y el catastro CBC registra **853 proyectos por US$87.702 millones** a materializar en 2026-2030. Minería (41%), obras públicas (23%) y energía (20%) concentran más del 80%.

2. **La demanda inmediata está en proyectos en ejecución** (41% de las iniciativas; 81% brownfield): estructurales de Codelco (Chuquicamata Subterránea 92%, Rajo Inca 95%, Andes Norte 81%, Diamante 55%), Nueva Concentradora Centinela (US$4.400M, año peak 2026, operación 2027), Los Pelambres PAO (US$2.000M), Zaldívar (obras desde jul-2026), Kimal–Lo Aguirre (en construcción desde feb-2026, 1.346 km) y ~74 BESS en construcción (6.358 MW). → **QA/QC, END, ITO, comisionamiento ahora.**

3. **2026 es el año de los mega-EIA**: El Abra (US$7.500M), Nueva Concentradora Escondida (US$4.400-5.900M), Salar Futuro (US$3.000M), Albemarle TED (US$3.100M), Lobo-Marte (US$1.500M), Cerro Colorado (US$1.500M). → **Ingeniería temprana hoy; detalle e inspección desde 2027-2028.**

4. **Decisiones ya tomadas que gatillan contratos en 6-18 meses**: Sierra Gorda 4ª línea (US$725M, aprobada jul-2026, obras 2027), Santo Domingo (FID 4T-2026), ENAMI Paipote (US$1.700M, obras oct-2026), Puerto Exterior San Antonio (adjudicación 2026), Coordinador Eléctrico (US$480M, ofertas sep-2026), Volta amoníaco verde (construcción 2027).

5. **Hallazgo más accionable**: licitación ENAP de **inspección técnica de equipos estáticos e intercambiadores 2026-2030 (API 510)** para ambas refinerías — calce exacto con ARCANCHILE; verificar estado de adjudicación de inmediato.

6. **Sectores fríos**: celulosa en Chile es mercado de mantención (capex nuevo se fue a Brasil); hidrógeno verde en Magallanes en pausa (INNA desistido, Total suspendido) salvo HIF Cabo Negro y Volta en Mejillones; Collahuasi C20+ con RCA anulada (may-2026) es el mayor riesgo regulatorio del norte.

7. **Llaves de acceso**: SICEP (habilita BHP, Collahuasi, AMSA, Teck y 30+ mandantes), RedNegocios CCS (Codelco), SAP Ariba, Registro de Proveedores del Estado (obligatorio desde dic-2024) y Registro de Consultores MOP (3ª categoría sin experiencia exigida). "REDELE" no existe; el equivalente real es Achilles/RePro + Registro Energético.

## Índice del informe

| Archivo | Contenido |
|---|---|
| [informe/01_contexto_mercado.md](informe/01_contexto_mercado.md) | Carteras Cochilco y CBC, coyuntura del cobre, cambio de gobierno |
| [informe/02_mineria.md](informe/02_mineria.md) | Codelco, BHP, Collahuasi, Anglo, AMSA, Teck, El Abra, Sierra Gorda, Lundin, Capstone, oro, CAP, litio, ENAMI, relaves |
| [informe/03_energia.md](informe/03_energia.md) | Transmisión (Kimal-Lo Aguirre), renovables, BESS, hidrógeno verde, descarbonización térmica |
| [informe/04_celulosa_petroleo_gas.md](informe/04_celulosa_petroleo_gas.md) | Arauco, CMPC, ENAP, fundiciones |
| [informe/05_infraestructura_puertos_agua.md](informe/05_infraestructura_puertos_agua.md) | Puerto Exterior San Antonio, concesiones MOP, embalses, sanitarias, desalinización y Ley 21.813 |
| [informe/06_licitaciones_activas.md](informe/06_licitaciones_activas.md) | Licitaciones abiertas/recientes y plan de monitoreo |
| [informe/07_acceso_portales_certificaciones.md](informe/07_acceso_portales_certificaciones.md) | Portales de proveedores, registros, certificaciones, ferias |
| [informe/08_plan_accion_comercial.md](informe/08_plan_accion_comercial.md) | Tabla maestra priorizada (A/B/C) y checklist de acción |

## Advertencias de uso

- Las carteras (Cochilco, CBC, ACADES) son **proyecciones**, no inversión garantizada.
- El catastro CBC se actualiza trimestralmente y Cochilco anualmente; los avances de Codelco son del Q1-2026 — **refrescar los datos antes de decisiones mayores** (próximos hitos: catastro CBC ~ago-2026; resultados semestrales de las mineras ~ago-2026).
- La nómina de los "7 proyectos de cobre que inician operación en 2026" publicada por prensa fue **refutada en verificación** — este informe solo usa los agregados (13 proyectos / US$14.800M).
- La asignación de servicios ARCANCHILE a cada proyecto es análisis propio, no dato de fuente.
