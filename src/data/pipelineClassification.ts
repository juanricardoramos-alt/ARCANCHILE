import type { PipelineInfo } from './types';

/** Clasificación por defecto: fuera del core de ductos/pipeline. */
export const DEFAULT_INFO: PipelineInfo = {
  categoria: 'otros',
  relevanciaArcanchile: 'baja',
  pipelineComponent: '',
  normativas: [],
  pipelineServices: [],
};

/**
 * Clasificación pipeline/ductos por proyecto (solo se listan los que SÍ tienen componente de
 * ductos/piping — categoría "pipeline"). Los proyectos ausentes heredan DEFAULT_INFO (otros/baja).
 * Criterio: alta = esencialmente ductos; media = incluye piping relevante pero no es exclusivo.
 */
export const pipelineClassification: Record<string, PipelineInfo> = {
  // ── Codelco ──
  'rajo-inca': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'La puesta en marcha de la planta de procesos exige comisionamiento y pruebas de las líneas de pulpa, agua y reactivos, más inspección en servicio del piping existente.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['Comisionamiento y pruebas', 'Inspección en servicio', 'QA/QC de piping'],
  },
  'ovejeria-etapa-v': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'El crecimiento del tranque incorpora líneas de relaves y de agua recuperada: ruteo, ingeniería de detalle e inspección de ductos de transporte de relaves.',
    normativas: ['ASME B31.11 (slurry)', 'ASME B31.4', 'API 1104', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'ITO de montaje', 'QA/QC de piping'],
  },
  'desaladora-distrito-norte': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Acueducto de agua desalada de más de 160 km con 3 estaciones de bombeo hasta +3.000 msnm: inspección de soldaduras, coating, pruebas hidrostáticas, comisionamiento e inspección en servicio del ducto.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'API 570'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
      'Inspección en servicio',
    ],
  },
  // ── BHP ──
  'nueva-concentradora-escondida': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Nueva concentradora con extenso piping de proceso, además de nueva desaladora y sistema de impulsión de agua de mar: ingeniería de detalle, ITO, QA/QC y END de cañerías.',
    normativas: ['ASME B31.3', 'ASME B31.4', 'API 570', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'ITO de montaje',
      'QA/QC de piping',
      'Inspección END de soldaduras',
      'Comisionamiento y pruebas',
    ],
  },
  'laguna-seca-optimizacion': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Optimización de concentradoras: modificación de líneas de pulpa, agua y reactivos con QA/QC, END de soldaduras y levantamiento as-built de piping.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'Inspección END de soldaduras', 'Diseño / Ingeniería de ductos'],
  },
  'escondida-lixiviacion': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Optimización de lixiviación e infraestructura de cátodos: piping de PLS, refino y ácido — ITO, QA/QC y comisionamiento de líneas.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['ITO de montaje', 'QA/QC de piping', 'Comisionamiento y pruebas'],
  },
  'cerro-colorado-reapertura': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'La solución hídrica transporta aguas servidas tratadas por más de 100 km: ingeniería, END de soldaduras e ITO del ducto de impulsión.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'Inspección END de soldaduras', 'ITO de montaje'],
  },
  'spence-optimizaciones': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Ampliación de concentradora y extensión de cátodos: modificación de líneas de proceso y lixiviación con QA/QC y END.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'Inspección END de soldaduras', 'Diseño / Ingeniería de ductos'],
  },
  // ── Collahuasi / Anglo / AMSA ──
  'collahuasi-c20': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Impulsión de agua desalada de 194 km a 4.400 msnm con 5 estaciones de bombeo: inspección de soldaduras, coating, pruebas hidrostáticas e inspección en servicio del ducto.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'API 570'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'Comisionamiento y pruebas',
      'Inspección en servicio',
    ],
  },
  'collahuasi-rosario': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Nueva concentradora (~130 ktpd): ingeniería conceptual y básica del piping de proceso (pulpa, agua, reactivos, aire).',
    normativas: ['ASME B31.3', 'ASME B31.11 (slurry)', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  'los-bronces-integrado': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Nuevas fases de rajo, mina subterránea y refuerzo hídrico: líneas de agua y pulpa más piping de proceso — QA/QC, ITO e ingeniería.',
    normativas: ['ASME B31.3', 'ASME B31.11 (slurry)', 'API 570', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'ITO de montaje', 'Diseño / Ingeniería de ductos'],
  },
  'centinela-segunda-concentradora': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Segunda concentradora con extenso piping de proceso (pulpa, agua, reactivos, aire): QA/QC, END y comisionamiento de cañerías durante el año peak de montaje.',
    normativas: ['ASME B31.3', 'ASME B31.11 (slurry)', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'QA/QC de piping',
      'Inspección END de soldaduras',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'centinela-agua-mar': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Segundo acueducto de agua de mar de 144 km (650 l/s): inspección de soldaduras de gran diámetro, coating, pruebas hidrostáticas y comisionamiento.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'pelambres-pao': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Duplicación de la desaladora y nuevo concentraducto: mineroducto de concentrado y ducto de agua desalada — diseño, END de soldaduras, ITO y comisionamiento.',
    normativas: ['ASME B31.4', 'ASME B31.11 (slurry)', 'API 1104', 'ASME IX', 'API 570'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'pelambres-futuro': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Tres proyectos en desarrollo con conducciones de agua y pulpa: ingeniería temprana de ductos y líneas de proceso.',
    normativas: ['ASME B31.3', 'ASME B31.4', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  'zaldivar-extension': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Acueducto de ~200 km de aguas servidas tratadas: ingeniería, END de soldaduras, ITO, coating y pruebas hidrostáticas del ducto de impulsión.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'API 570'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  // ── Otras mineras ──
  'qb-debottlenecking': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Aumento de throughput: modificación de líneas de proceso y molienda — QA/QC, END e ingeniería de piping.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'Inspección END de soldaduras', 'Diseño / Ingeniería de ductos'],
  },
  'el-abra-continuidad': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Nueva concentradora, desaladora con impulsión y relaves espesados: amplio piping de proceso, ducto de agua de mar y líneas de relaves.',
    normativas: ['ASME B31.3', 'ASME B31.4', 'ASME B31.11 (slurry)', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'ITO de montaje',
      'QA/QC de piping',
      'Inspección END de soldaduras',
    ],
  },
  'sierra-gorda-4ta-linea': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Cuarta línea de molienda: nuevas líneas de pulpa, agua y reactivos — ingeniería de detalle, ITO, QA/QC y END de piping.',
    normativas: ['ASME B31.3', 'ASME B31.11 (slurry)', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'ITO de montaje',
      'QA/QC de piping',
      'Inspección END de soldaduras',
    ],
  },
  'caserones-continuidad': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Continuidad operacional: mantención e inspección en servicio de líneas de proceso y de relaves.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['Inspección en servicio', 'QA/QC de piping', 'Inspección END de soldaduras'],
  },
  'mantoverde-optimizado': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Optimización de concentradora (32→45 ktpd): nuevas líneas de proceso — QA/QC, END y comisionamiento de piping.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'Inspección END de soldaduras', 'Comisionamiento y pruebas'],
  },
  'santo-domingo': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Proyecto Cu-Fe con ampliación de la desaladora Mantoverde y reutilización de tuberías de distrito: piping de proceso, agua de mar y concentrado.',
    normativas: ['ASME B31.3', 'ASME B31.4', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'ITO de montaje',
      'QA/QC de piping',
      'Inspección END de soldaduras',
    ],
  },
  'salares-norte': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Operación en régimen: inspección en servicio y END de líneas de proceso, agua y reactivos.',
    normativas: ['ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['Inspección en servicio', 'Inspección END de soldaduras'],
  },
  'lobo-marte': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Lixiviación en pilas: piping de riego, PLS y refino — ingeniería, QA/QC e inspección de líneas.',
    normativas: ['ASME B31.3', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'QA/QC de piping'],
  },
  'cerro-negro-norte': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Optimización de planta de concentrado de hierro: líneas de pulpa y agua — ingeniería, QA/QC y END.',
    normativas: ['ASME B31.3', 'ASME B31.11 (slurry)', 'ASME IX'],
    pipelineServices: ['QA/QC de piping', 'Diseño / Ingeniería de ductos', 'Inspección END de soldaduras'],
  },
  'huachipato-aza': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Reconversión siderúrgica a horno eléctrico: piping de proceso, gases y servicios industriales — ingeniería, QA/QC e inspección.',
    normativas: ['ASME B31.1', 'ASME B31.3', 'API 570', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'QA/QC de piping', 'Inspección en servicio'],
  },
  'paipote-modernizacion': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Modernización de fundición: piping de ácido, gases, agua y servicios; planta de ácido con extenso piping y ductos de gases — ingeniería, ITO, QA/QC, END y comisionamiento.',
    normativas: ['ASME B31.3', 'API 570', 'API 574', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'ITO de montaje',
      'QA/QC de piping',
      'Inspección END de soldaduras',
      'Comisionamiento y pruebas',
    ],
  },
  // ── Litio ──
  'salar-futuro': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Evaporación mecánica, membranas y reinyección de salmuera: salmueroductos y piping de proceso — ingeniería, QA/QC e ITO.',
    normativas: ['ASME B31.3', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'QA/QC de piping', 'ITO de montaje'],
  },
  'albemarle-ted': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Extracción directa de litio (DLE): extensas líneas de salmuera y de proceso — ingeniería e inspección de piping.',
    normativas: ['ASME B31.3', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos', 'QA/QC de piping'],
  },
  'maricunga-litio': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent: 'Proyecto DLE de litio: salmueroductos y piping de proceso — ingeniería temprana.',
    normativas: ['ASME B31.3', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  'salares-altoandinos': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent: 'Proyecto DLE de litio: salmueroductos y piping de proceso — ingeniería temprana.',
    normativas: ['ASME B31.3', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  // ── Energía ──
  'iem-conversion-gas': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Reconversión a gas natural: nuevas líneas de gas, quemadores y sistemas de combustible — END de soldaduras, ITO y comisionamiento de piping.',
    normativas: ['ASME B31.1', 'ASME B31.8', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'ITO de montaje',
      'Comisionamiento y pruebas',
      'QA/QC de piping',
    ],
  },
  'los-guindos-gas': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Conversión de turbinas de diésel a gas natural: nuevas líneas de gas y combustible — END, ITO y comisionamiento.',
    normativas: ['ASME B31.1', 'ASME B31.8', 'API 1104', 'ASME IX'],
    pipelineServices: ['Inspección END de soldaduras', 'ITO de montaje', 'Comisionamiento y pruebas'],
  },
  // ── Hidrógeno verde ──
  'volta-amoniaco': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Planta de amoníaco verde: extenso piping de proceso, hidrógeno y amoníaco, más ducto de reúso de aguas — ingeniería, END, ITO y comisionamiento.',
    normativas: ['ASME B31.3', 'ASME B31.12 (hidrógeno)', 'API 570', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'hif-cabo-negro': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Planta de e-combustibles: piping de proceso, H2, CO2 y metanol — ingeniería, END, QA/QC y comisionamiento de cañerías.',
    normativas: ['ASME B31.3', 'ASME B31.12 (hidrógeno)', 'API 570', 'ASME IX'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'Comisionamiento y pruebas',
    ],
  },
  'hnh-energy': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Amoníaco verde: piping de proceso, H2 y amoníaco, desaladora y ducto — ingeniería temprana de cañerías.',
    normativas: ['ASME B31.3', 'ASME B31.12 (hidrógeno)', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  'h2-magallanes-total': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Megaproyecto H2/amoníaco (suspendido): piping de proceso, H2, amoníaco y desaladora — ingeniería temprana cuando se reactive.',
    normativas: ['ASME B31.3', 'ASME B31.12 (hidrógeno)', 'ASME IX'],
    pipelineServices: ['Diseño / Ingeniería de ductos'],
  },
  // ── Celulosa / Petróleo y Gas ──
  'celulosa-paradas': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Paradas de planta de celulosa: inspección END de cañerías de proceso, calderas recuperadoras, digestores y estanques; medición de espesores por corrosión.',
    normativas: ['API 570', 'API 574', 'API 510', 'API 653', 'ASME B31.1', 'ASME B31.3', 'ASME IX'],
    pipelineServices: ['Inspección END de soldaduras', 'Inspección en servicio', 'QA/QC de piping'],
  },
  'enap-inspeccion-paros': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Inspección de equipos estáticos, intercambiadores y cañerías de proceso en paradas de refinería bajo API 510/570: el calce más directo con el core de ARCANCHILE.',
    normativas: ['API 510', 'API 570', 'API 572', 'API 574', 'API 579 (FFS)', 'ASME IX'],
    pipelineServices: ['Inspección en servicio', 'Inspección END de soldaduras', 'QA/QC de piping'],
  },
  'enap-estanques-biobio': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Fabricación y montaje de estanques de crudo (API 650) y cañerías asociadas: QA/QC, END de soldaduras, pruebas e inspección en servicio.',
    normativas: ['API 650', 'API 653', 'API 570', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'QA/QC de piping',
      'Inspección END de soldaduras',
      'ITO de montaje',
      'Inspección en servicio',
    ],
  },
  'enap-magallanes-fracking': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Líneas de recolección, piping de superficie y equipos de pozos: inspección de soldaduras (API 1104), QA/QC, ITO y pruebas.',
    normativas: ['ASME B31.3', 'ASME B31.4', 'ASME B31.8', 'API 1104', 'ASME IX'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'glencore-reuso-aguas': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Ducto de reúso de aguas servidas tratadas (900 l/s) y obras hidráulicas: inspección de soldaduras, ITO, coating y pruebas del ducto.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'AWWA'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  // ── Agua y Desalación (infra) ──
  'desaladora-coquimbo': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Planta desaladora e impulsión de ~20 km: inspección de soldaduras, coating, pruebas hidrostáticas e ITO del ducto y del piping de planta.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'AWWA', 'API 570'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'cramsa-aguas-maritimas': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Mayor desaladora del país con sistemas de impulsión multipropósito: ingeniería, END, ITO y comisionamiento de ductos de gran diámetro.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'AWWA'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
      'Comisionamiento y pruebas',
    ],
  },
  'aguas-pacifico-aconcagua': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Desaladora y acueducto de 105 km: inspección de soldaduras, coating, pruebas hidrostáticas, comisionamiento e inspección en servicio del ducto.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'AWWA', 'API 570'],
    pipelineServices: [
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'Comisionamiento y pruebas',
      'Inspección en servicio',
    ],
  },
  enapac: {
    categoria: 'pipeline',
    relevanciaArcanchile: 'alta',
    pipelineComponent:
      'Desaladora multipropósito con dos líneas de distribución (166 y 157 km): diseño, END, ITO y pruebas de ductos.',
    normativas: ['ASME B31.3', 'API 1104', 'ASME IX', 'AWWA'],
    pipelineServices: [
      'Diseño / Ingeniería de ductos',
      'Inspección END de soldaduras',
      'QA/QC de piping',
      'ITO de montaje',
    ],
  },
  'aguas-andinas-biociudad': {
    categoria: 'pipeline',
    relevanciaArcanchile: 'media',
    pipelineComponent:
      'Redes y conducciones de agua potable y saneamiento: ITO e inspección de tuberías, colectores e impulsiones.',
    normativas: ['ASME B31.3', 'AWWA', 'NCh'],
    pipelineServices: ['ITO de montaje', 'QA/QC de piping', 'Inspección en servicio'],
  },
};
