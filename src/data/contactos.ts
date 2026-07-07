import { projects } from './projects';
import { pipelineClassification } from './pipelineClassification';
import type { ContactoClave } from './types';

/**
 * Contactos clave (CARGOS genéricos, no personas reales) por proyecto.
 * Se generan a partir de plantillas por arquetipo de empresa (mandante minero, EPC, energía,
 * ENAP, gas, estatal, industrial) y del mapeo proyecto → arquetipos. Para proyectos con mandante
 * Y EPC conocida se incluyen contactos de AMBAS.
 */

type Archetype = 'minero' | 'epc' | 'energia' | 'enap' | 'gas' | 'estatal' | 'industrial';

const CANAL = {
  decisor: 'LinkedIn directo, referencia en común o eventos del sector (Expomin / Exponor / Elecgas)',
  decisorAbast: 'Portal de proveedores, RedNegocios CCS / SICEP, email de registro',
  influ: 'LinkedIn o visita a la oficina de proyecto / faena',
  tecnico: 'LinkedIn, email corporativo o redes de inspectores (ACEND / ASNT)',
  acceso: 'Portal de proveedores, RedNegocios CCS / SICEP, email de registro',
};

const OBJ_TECNICO = 'Validar competencias técnicas, revisar CVs y certificaciones (ASNT / ISO 9712) del equipo y alinear procedimientos.';
const OBJ_ACCESO = 'Inscripción como proveedor homologado, entrega de carpeta de presentación y requisitos de precalificación.';

function minero(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Proyectos / VP de Proyectos', departamento: 'Gerencia de Proyectos', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar capacidades de ARCANCHILE y proponer un marco contractual de ingeniería e inspección de piping para ${empresa}.` },
    { cargo: 'Gerente de Ingeniería', departamento: 'Gerencia de Ingeniería', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Posicionar a ARCANCHILE en ingeniería de ductos, análisis de flexibilidad y stress para el proyecto.' },
    { cargo: 'Gerente de Contratos y Abastecimiento', departamento: 'Abastecimiento y Contratos', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisorAbast, objetivo: 'Acordar la vía de homologación y el marco de contratación de servicios de inspección/END.' },
    { cargo: 'Superintendente de Ingeniería de Piping / Mecánica', departamento: 'Ingeniería', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostración técnica de experiencia en ${norma} y disponibilidad de equipo de piping para el proyecto.` },
    { cargo: 'Jefe de Inspección / Superintendente QA/QC', departamento: 'Calidad', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Presentar procedimientos de QA/QC y END de soldaduras (${norma}) y capacidad de inspección en terreno.` },
    { cargo: 'Jefe de Planificación de Mantención', departamento: 'Mantenimiento', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Explorar inspección en servicio (API 570/510) y monitoreo de corrosión en líneas de proceso.' },
    { cargo: 'Coordinador de Paradas de Planta (Shutdowns)', departamento: 'Mantenimiento', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Ofrecer dotación de inspectores END/QA-QC para las próximas paradas programadas.' },
    { cargo: 'Ingeniero de Piping Senior', departamento: 'Ingeniería', nivel: 'tecnico', prioridad: 3, empresa, canalSugerido: CANAL.tecnico, objetivo: OBJ_TECNICO },
    { cargo: 'Inspector de Soldadura / END Senior', departamento: 'Calidad', nivel: 'tecnico', prioridad: 3, empresa, canalSugerido: CANAL.tecnico, objetivo: 'Alinear criterios de aceptación de soldaduras y revisar certificaciones del equipo de END.' },
    { cargo: 'Analista de Abastecimiento / Comprador de Servicios', departamento: 'Abastecimiento', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: CANAL.acceso, objetivo: OBJ_ACCESO },
    { cargo: 'Administrador de Contratos', departamento: 'Contratos', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: CANAL.acceso, objetivo: 'Entender el modelo contractual vigente y las bases de licitación de servicios.' },
  ];
}

function epc(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Proyecto (del proyecto)', departamento: 'Dirección de Proyecto', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar a ARCANCHILE como subcontratista de inspección/QA-QC de piping para el EPC de ${empresa}.` },
    { cargo: 'Gerente de Ingeniería de Piping', departamento: 'Ingeniería', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Proponer apoyo en ingeniería de detalle de piping, isométricos y análisis de flexibilidad.' },
    { cargo: 'Gerente de Construcción / Site Manager', departamento: 'Construcción', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Ofrecer ITO de montaje de cañerías y control de calidad en terreno.' },
    { cargo: 'Lead Piping Engineer / Jefe de Disciplina Piping', departamento: 'Ingeniería', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostrar experiencia en ${norma} y capacidad de modelado/ruteo de piping.` },
    { cargo: 'QA/QC Manager del proyecto', departamento: 'Calidad', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Presentar procedimientos de END de soldaduras (${norma}) y dotación de inspectores.` },
    { cargo: 'Gerente de Subcontratos', departamento: 'Contratos', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Acordar la vía de precalificación como subcontratista y el paquete de servicios.' },
    { cargo: 'Jefe de Comisionamiento', departamento: 'Comisionamiento', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Ofrecer apoyo en pruebas hidrostáticas/neumáticas y precomisionamiento de sistemas de piping.' },
    { cargo: 'Piping Designer / Stress Engineer', departamento: 'Ingeniería', nivel: 'tecnico', prioridad: 3, empresa, canalSugerido: CANAL.tecnico, objetivo: OBJ_TECNICO },
    { cargo: 'Inspector de Terreno', departamento: 'Calidad', nivel: 'tecnico', prioridad: 3, empresa, canalSugerido: CANAL.tecnico, objetivo: 'Coordinar criterios de inspección de montaje y reportería en terreno.' },
    { cargo: 'Coordinador de Subcontratos', departamento: 'Contratos', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: CANAL.acceso, objetivo: OBJ_ACCESO },
  ];
}

function energia(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Desarrollo de Proyectos', departamento: 'Desarrollo de Proyectos', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar capacidades de ARCANCHILE y proponer marco de servicios de ingeniería/inspección para ${empresa}.` },
    { cargo: 'Gerente de Operaciones y Mantenimiento', departamento: 'O&M', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Ofrecer inspección en servicio, END y comisionamiento de sistemas de piping/BOP.' },
    { cargo: 'Gerente de Abastecimiento', departamento: 'Abastecimiento', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisorAbast, objetivo: 'Acordar la homologación como proveedor y el marco de contratación.' },
    { cargo: 'Jefe de Integridad de Activos', departamento: 'Integridad', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostrar experiencia en integridad de ductos y ${norma}; monitoreo de corrosión.` },
    { cargo: 'Jefe de Inspección', departamento: 'Calidad', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Presentar procedimientos de END y dotación de inspectores para el proyecto.' },
    { cargo: 'Coordinador de Proyectos de Capital', departamento: 'Proyectos de Capital', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Alinear alcances de ITO y QA/QC de las obras en cartera.' },
    { cargo: 'Analista de Abastecimiento', departamento: 'Abastecimiento', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: CANAL.acceso, objetivo: OBJ_ACCESO },
  ];
}

function enap(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Integridad Mecánica', departamento: 'Integridad Mecánica', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar capacidades de inspección de equipos estáticos y cañerías (${norma}) para ${empresa}.` },
    { cargo: 'Gerente de Mantención de Refinería', departamento: 'Mantención', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Proponer dotación de inspección para paradas de planta y mantención mayor.' },
    { cargo: 'Gerente de Proyectos de Capital', departamento: 'Proyectos de Capital', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Posicionar servicios de QA/QC e ITO en proyectos de estanques y unidades nuevas.' },
    { cargo: 'Jefe de Inspección de Equipos Estáticos', departamento: 'Inspección', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostración técnica en API 510/570/653 y ${norma}; disponibilidad de inspectores certificados.` },
    { cargo: 'Ingeniero de Integridad / Fitness for Service', departamento: 'Integridad', nivel: 'tecnico', prioridad: 2, empresa, canalSugerido: CANAL.tecnico, objetivo: 'Alinear metodología de evaluación API 579 (FFS) y análisis de aptitud para el servicio.' },
    { cargo: 'Jefe de Paradas de Planta (Turnaround)', departamento: 'Paradas', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Ofrecer equipo de inspección END/QA-QC para el próximo turnaround.' },
    { cargo: 'Coordinador API (510/570/653)', departamento: 'Inspección', nivel: 'tecnico', prioridad: 2, empresa, canalSugerido: CANAL.tecnico, objetivo: OBJ_TECNICO },
    { cargo: 'Analista de Abastecimiento / Compras', departamento: 'Abastecimiento', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: 'Portal de proveedores ENAP, Achilles / RePro', objetivo: OBJ_ACCESO },
  ];
}

function gas(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Integridad de Ductos', departamento: 'Integridad de Ductos', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar capacidades de inspección y evaluación de integridad de ductos (${norma}) para ${empresa}.` },
    { cargo: 'Gerente de Operaciones', departamento: 'Operaciones', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: 'Proponer servicios de inspección en servicio, monitoreo de corrosión y END de gasoductos/líneas.' },
    { cargo: 'Jefe de Inspección de Gasoductos', departamento: 'Inspección', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostrar experiencia en soldadura y END de líneas de gas (API 1104 / ${norma}).` },
    { cargo: 'Coordinador de Pigging / ILI', departamento: 'Integridad', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Coordinar inspección interna de líneas y complementos de END en soldaduras.' },
    { cargo: 'Ingeniero de Corrosión', departamento: 'Integridad', nivel: 'tecnico', prioridad: 2, empresa, canalSugerido: CANAL.tecnico, objetivo: 'Alinear estrategia de monitoreo de corrosión y protección catódica.' },
  ];
}

function estatal(concesionaria: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Director Regional MOP', departamento: 'MOP Regional', nivel: 'decisor', prioridad: 1, empresa: 'MOP', canalSugerido: CANAL.decisor, objetivo: 'Presentar capacidades de asesoría a la inspección técnica/fiscal de obras (AIF/ITO).' },
    { cargo: 'Inspector Fiscal de la Obra', departamento: 'Inspección Fiscal', nivel: 'decisor', prioridad: 1, empresa: 'MOP', canalSugerido: CANAL.influ, objetivo: 'Ofrecer equipo de AIF/ITO con especialidad en piping e inspección de obras hidráulicas.' },
    { cargo: 'Gerente de Concesión', departamento: 'Gerencia de Concesión', nivel: 'decisor', prioridad: 1, empresa: concesionaria, canalSugerido: CANAL.decisor, objetivo: `Presentar servicios de ITO, QA/QC y END a la concesionaria (${concesionaria}).` },
    { cargo: 'Jefe de Inspección Técnica de Obras (ITO)', departamento: 'Calidad', nivel: 'influenciador', prioridad: 2, empresa: concesionaria, canalSugerido: CANAL.influ, objetivo: `Demostración técnica de inspección de obras y ${norma}; dotación disponible.` },
    { cargo: 'Coordinador de Calidad', departamento: 'Calidad', nivel: 'influenciador', prioridad: 2, empresa: concesionaria, canalSugerido: CANAL.tecnico, objetivo: OBJ_TECNICO },
  ];
}

function industrial(empresa: string, norma: string): ContactoClave[] {
  return [
    { cargo: 'Gerente de Proyectos de Capital', departamento: 'Proyectos de Capital', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Presentar capacidades de ingeniería e inspección de piping para ${empresa}.` },
    { cargo: 'Gerente de Integridad Mecánica', departamento: 'Integridad Mecánica', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisor, objetivo: `Proponer inspección de equipos estáticos, estanques y cañerías (${norma}).` },
    { cargo: 'Gerente de Mantenimiento y Abastecimiento', departamento: 'Mantenimiento / Abastecimiento', nivel: 'decisor', prioridad: 1, empresa, canalSugerido: CANAL.decisorAbast, objetivo: 'Acordar homologación como proveedor y marco de servicios de mantención/inspección.' },
    { cargo: 'Jefe de Inspección', departamento: 'Inspección', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: `Demostración técnica en END de soldaduras y ${norma}; capacidad en terreno.` },
    { cargo: 'Coordinador de Paradas de Planta', departamento: 'Mantenimiento', nivel: 'influenciador', prioridad: 2, empresa, canalSugerido: CANAL.influ, objetivo: 'Ofrecer dotación de inspectores END/QA-QC para las paradas programadas.' },
    { cargo: 'Ingeniero de Integridad', departamento: 'Integridad', nivel: 'tecnico', prioridad: 2, empresa, canalSugerido: CANAL.tecnico, objetivo: 'Alinear metodología de inspección en servicio y aptitud para el servicio (API 579).' },
    { cargo: 'Inspector END Senior', departamento: 'Calidad', nivel: 'tecnico', prioridad: 3, empresa, canalSugerido: CANAL.tecnico, objetivo: OBJ_TECNICO },
    { cargo: 'Analista de Abastecimiento', departamento: 'Abastecimiento', nivel: 'acceso', prioridad: 3, empresa, canalSugerido: CANAL.acceso, objetivo: OBJ_ACCESO },
  ];
}

const BUILDERS: Record<Archetype, (empresa: string, norma: string) => ContactoClave[]> = {
  minero,
  epc,
  energia,
  enap,
  gas,
  estatal,
  industrial,
};

/** Mapeo proyecto → arquetipos (mandante + EPC cuando aplica). */
const profiles: Record<string, { a: Archetype; empresa: string }[]> = {
  // Codelco
  'chuqui-subterranea-nivel1': [{ a: 'minero', empresa: 'Codelco' }],
  'teniente-andes-norte': [{ a: 'minero', empresa: 'Codelco' }],
  'teniente-diamante': [{ a: 'minero', empresa: 'Codelco' }],
  'rajo-inca': [{ a: 'minero', empresa: 'Codelco' }],
  'ovejeria-etapa-v': [{ a: 'minero', empresa: 'Codelco' }],
  'desaladora-distrito-norte': [
    { a: 'minero', empresa: 'Codelco' },
    { a: 'epc', empresa: 'Techint E&C' },
  ],
  'plan-conjunto-andina-bronces': [
    { a: 'minero', empresa: 'Codelco' },
    { a: 'minero', empresa: 'Anglo American' },
  ],
  // BHP
  'nueva-concentradora-escondida': [{ a: 'minero', empresa: 'BHP / Escondida' }],
  'laguna-seca-optimizacion': [{ a: 'minero', empresa: 'BHP / Escondida' }],
  'escondida-lixiviacion': [{ a: 'minero', empresa: 'BHP / Escondida' }],
  'cerro-colorado-reapertura': [{ a: 'minero', empresa: 'BHP Pampa Norte' }],
  'spence-optimizaciones': [{ a: 'minero', empresa: 'BHP Pampa Norte' }],
  // Collahuasi / Anglo / AMSA
  'collahuasi-c20': [
    { a: 'minero', empresa: 'Collahuasi' },
    { a: 'epc', empresa: 'ACCIONA' },
    { a: 'epc', empresa: 'Techint E&C' },
  ],
  'collahuasi-rosario': [{ a: 'minero', empresa: 'Collahuasi' }],
  'los-bronces-integrado': [{ a: 'minero', empresa: 'Anglo American' }],
  'centinela-segunda-concentradora': [
    { a: 'minero', empresa: 'Antofagasta Minerals' },
    { a: 'epc', empresa: 'Fluor-Salfa (JV)' },
  ],
  'centinela-agua-mar': [
    { a: 'minero', empresa: 'Antofagasta Minerals' },
    { a: 'epc', empresa: 'Almar Water Solutions / Transelec' },
  ],
  'pelambres-pao': [{ a: 'minero', empresa: 'Antofagasta Minerals' }],
  'pelambres-futuro': [{ a: 'minero', empresa: 'Antofagasta Minerals' }],
  'zaldivar-extension': [{ a: 'minero', empresa: 'Antofagasta Minerals / Barrick' }],
  // Otras mineras
  'qb-debottlenecking': [{ a: 'minero', empresa: 'Teck / Anglo Teck' }],
  'el-abra-continuidad': [{ a: 'minero', empresa: 'Freeport / El Abra' }],
  'sierra-gorda-4ta-linea': [{ a: 'minero', empresa: 'KGHM / South32' }],
  'caserones-continuidad': [{ a: 'minero', empresa: 'Lundin Mining' }],
  'candelaria-2040': [{ a: 'minero', empresa: 'Lundin Mining' }],
  'mantoverde-optimizado': [{ a: 'minero', empresa: 'Capstone Copper' }],
  'santo-domingo': [{ a: 'minero', empresa: 'Capstone Copper' }],
  'salares-norte': [{ a: 'minero', empresa: 'Gold Fields' }],
  'lobo-marte': [{ a: 'minero', empresa: 'Kinross' }],
  'cerro-negro-norte': [{ a: 'minero', empresa: 'CMP (Grupo CAP)' }],
  'huachipato-aza': [{ a: 'industrial', empresa: 'Aceros AZA / Huachipato' }],
  'relaves-monitoreo': [{ a: 'minero', empresa: 'Mineras fiscalizadas (SERNAGEOMIN)' }],
  'paipote-modernizacion': [{ a: 'industrial', empresa: 'ENAMI' }],
  // Litio
  'salar-futuro': [{ a: 'minero', empresa: 'NovaAndino Litio (Codelco-SQM)' }],
  'albemarle-ted': [{ a: 'minero', empresa: 'Albemarle' }],
  'maricunga-litio': [{ a: 'minero', empresa: 'Codelco / Rio Tinto' }],
  'salares-altoandinos': [{ a: 'minero', empresa: 'ENAMI / Rio Tinto' }],
  // Energía
  'kimal-lo-aguirre': [
    { a: 'energia', empresa: 'Conexión Energía' },
    { a: 'epc', empresa: 'Kalpataru Power' },
  ],
  'coordinador-obras-nuevas-2026': [{ a: 'energia', empresa: 'Coordinador Eléctrico / adjudicatarios' }],
  'tineo-nueva-ancud': [{ a: 'energia', empresa: 'Transelec' }],
  'bess-oasis-atacama': [{ a: 'energia', empresa: 'Grenergy' }],
  'bess-celda-solar': [{ a: 'energia', empresa: 'Colbún' }],
  'bess-patache': [{ a: 'energia', empresa: 'Copenhagen Infrastructure Partners' }],
  'bess-lile': [{ a: 'energia', empresa: 'Engie Chile' }],
  'iem-conversion-gas': [
    { a: 'energia', empresa: 'Engie Chile' },
    { a: 'gas', empresa: 'Engie Chile' },
  ],
  'los-guindos-gas': [
    { a: 'energia', empresa: 'Generadora Metropolitana / Trafigura' },
    { a: 'gas', empresa: 'Generadora Metropolitana / Trafigura' },
  ],
  'bocamina-desmantelamiento': [{ a: 'energia', empresa: 'Enel Generación' }],
  // Hidrógeno verde
  'volta-amoniaco': [
    { a: 'industrial', empresa: 'MAE' },
    { a: 'gas', empresa: 'MAE' },
  ],
  'hif-cabo-negro': [
    { a: 'industrial', empresa: 'HIF Global' },
    { a: 'epc', empresa: 'Techint E&C' },
  ],
  'hnh-energy': [
    { a: 'industrial', empresa: 'HNH Energy' },
    { a: 'gas', empresa: 'HNH Energy' },
  ],
  'h2-magallanes-total': [
    { a: 'industrial', empresa: 'TotalEnergies H2' },
    { a: 'gas', empresa: 'TotalEnergies H2' },
  ],
  'inna-aes': [{ a: 'energia', empresa: 'AES Andes' }],
  // Celulosa / Petróleo y Gas
  'arauco-osb': [{ a: 'industrial', empresa: 'Arauco' }],
  'celulosa-paradas': [{ a: 'industrial', empresa: 'Arauco / CMPC' }],
  'enap-inspeccion-paros': [{ a: 'enap', empresa: 'ENAP' }],
  'enap-estanques-biobio': [{ a: 'enap', empresa: 'ENAP' }],
  'enap-magallanes-fracking': [{ a: 'gas', empresa: 'ENAP (E&P Magallanes)' }],
  'glencore-reuso-aguas': [
    { a: 'minero', empresa: 'Glencore' },
    { a: 'estatal', empresa: 'Econssa' },
  ],
  // Infraestructura / Puertos / Agua
  'puerto-exterior-san-antonio': [
    { a: 'estatal', empresa: 'EPSA (Puerto San Antonio)' },
    { a: 'epc', empresa: 'Consorcio EPC adjudicatario' },
  ],
  'puerto-coronel-expansion': [{ a: 'estatal', empresa: 'Puerto Coronel' }],
  'embalse-zapallar': [{ a: 'estatal', empresa: 'Contratista adjudicatario' }],
  'concesiones-mop-2026': [{ a: 'estatal', empresa: 'Concesionarias adjudicatarias' }],
  'hospitales-red-maule': [{ a: 'estatal', empresa: 'Concesionaria hospitalaria' }],
  'ruta-austral': [{ a: 'estatal', empresa: 'Contratistas viales' }],
  'desaladora-coquimbo': [
    { a: 'estatal', empresa: 'MOP DGC' },
    { a: 'epc', empresa: 'Sacyr Agua' },
  ],
  'cramsa-aguas-maritimas': [{ a: 'industrial', empresa: 'CRAMSA' }],
  'aguas-pacifico-aconcagua': [
    { a: 'industrial', empresa: 'Aguas Pacífico' },
    { a: 'epc', empresa: 'Veolia (O&M)' },
  ],
  enapac: [{ a: 'industrial', empresa: 'ENAPAC (Aguasol / Solaer)' }],
  'aguas-andinas-biociudad': [{ a: 'industrial', empresa: 'Aguas Andinas' }],
};

function normaFor(id: string): string {
  return pipelineClassification[id]?.normativas[0] ?? 'ASME B31.3 / API 570';
}

export const contactosPorProyecto: Record<string, ContactoClave[]> = Object.fromEntries(
  projects.map((p) => {
    const profs = profiles[p.id] ?? [];
    const norma = normaFor(p.id);
    const contactos = profs.flatMap((pr) => BUILDERS[pr.a](pr.empresa, norma));
    return [p.id, contactos];
  }),
);
