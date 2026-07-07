import type { ChecklistItem, TimelinePhase } from './types';

export const timelinePhases: TimelinePhase[] = [
  {
    phase: 1,
    title: 'Registros habilitantes',
    days: 'Días 1–30',
    color: '#f59e0b',
    summary:
      'Abrir las puertas: SICEP, RedNegocios CCS (Codelco), SAP Ariba, Registro de Proveedores del Estado, Registro de Consultores MOP y portales eléctricos.',
  },
  {
    phase: 2,
    title: 'Ofertas y contactos inmediatos',
    days: 'Días 31–60',
    color: '#35648f',
    summary:
      'Atacar las ventanas abiertas: licitación ENAP, EPCs en peak de construcción (Fluor-Salfa, Kalpataru, Techint), monitoreo de licitaciones y oferta de monitoreo geotécnico de relaves.',
  },
  {
    phase: 3,
    title: 'Capacidades, certificaciones y agenda',
    days: 'Días 61–90',
    color: '#0f2a43',
    summary:
      'Cerrar brechas: ISO 9001/14001/45001, Written Practice ASNT, acreditación INN 17020, flujo SERNAGEOMIN, licencias SEC y agenda comercial (Minería Digital, EXPOMIN 2027).',
  },
];

export const checklist: ChecklistItem[] = [
  {
    id: 'chk-sicep',
    phase: 1,
    label: 'Inscripción en SICEP (sistemasicep.cl)',
    detail: 'Habilita BHP, Collahuasi, AMSA, Teck, SQM, Glencore, El Abra y 30+ mandantes. Apuntar a categoría A/B; actualización anual abril-junio.',
  },
  {
    id: 'chk-rednegocios',
    phase: 1,
    label: 'RedNegocios CCS con Codelco como mandante (Acreditación Full)',
    detail: 'Cargar documentos legales, financieros y laborales en 10 días; validación ~10 días hábiles → segmentación Codelco.',
  },
  {
    id: 'chk-ariba',
    phase: 1,
    label: 'Cuenta SAP Ariba Standard (supplier.ariba.com)',
    detail: 'Común a Codelco, BHP, Anglo, AMSA, Transelec y AES. Gratuita.',
  },
  {
    id: 'chk-anglo',
    phase: 1,
    label: 'Auto-registro Anglo American (Ariba SLP) + manifestación de interés BHP',
    detail: 'Anglo es gratuito e inmediato; BHP vía interestedsupplier.bhp.com. Enviar además carta de capacidades a abastecimiento@aminerals.cl.',
  },
  {
    id: 'chk-estado',
    phase: 1,
    label: 'Registro de Proveedores del Estado (proveedor.mercadopublico.cl)',
    detail: 'Obligatorio desde dic-2024 para ofertar al Estado. Elegir rubros UNSPSC de ingeniería, gerencia de proyectos y control de calidad/inspección.',
  },
  {
    id: 'chk-mop',
    phase: 1,
    label: 'Registro de Consultores MOP — 3ª categoría (sin experiencia exigida)',
    detail: 'Especialidades de inspección; expediente MINVU D.S. 135 en paralelo. Vigencia anual renovable.',
  },
  {
    id: 'chk-electricas',
    phase: 1,
    label: 'Portales eléctricos: Colbún, Enel WeBUY, ISA Mi Proveedor; invitación Ariba de Transelec',
    detail: 'Registro abierto en los tres primeros; Transelec requiere gestionar invitación con Abastecimiento. Evaluar Achilles/RePro (ENAP, Colbún).',
  },
  {
    id: 'chk-enap',
    phase: 2,
    label: 'Verificar estado de la licitación ENAP inspección 2026-2030',
    detail: 'Si está adjudicada, ofrecer subcontrato END al ganador; si no, preparar oferta. Es el calce más directo del catálogo.',
  },
  {
    id: 'chk-epcs',
    phase: 2,
    label: 'Contactar EPCs en peak: Fluor-Salfa (Centinela), Kalpataru (Kimal-Lo Aguirre), Techint (desaladoras)',
    detail: 'Ofrecer QA/QC, END de soldaduras, topografía y comisionamiento. Sumar al adjudicatario de Puerto Exterior San Antonio (2S-2026).',
  },
  {
    id: 'chk-monitoreo',
    phase: 2,
    label: 'Configurar plan de monitoreo de licitaciones',
    detail: 'Semanal: Codelco + Mercado Público + visor MOP. Mensual: Coordinador, concesiones DGC, Portal Minero. Trimestral: portales privados.',
  },
  {
    id: 'chk-relaves',
    phase: 2,
    label: 'Oferta estándar de monitoreo geotécnico de relaves',
    detail: 'Paquete de reportes trimestrales normativos (sísmico, piezométrico, deformaciones) para mineras medianas de Atacama/Coquimbo.',
  },
  {
    id: 'chk-visitas',
    phase: 2,
    label: 'Gira comercial Antofagasta/Calama',
    detail: 'El 65% del desembolso minero 2026-2030 está en Antofagasta (cartera Cochilco: US$40.209M).',
  },
  {
    id: 'chk-iso',
    phase: 3,
    label: 'Auditar vigencia ISO 9001 / 14001 / 45001',
    detail: 'Tríada de facto en precalificaciones de Codelco, BHP, AMSA, ENAMI y ENAP. Cerrar brechas detectadas.',
  },
  {
    id: 'chk-end',
    phase: 3,
    label: 'Written Practice ASNT SNT-TC-1A con Nivel III; evaluar INN NCh-ISO 17020',
    detail: 'ISO 9712 vía organismo extranjero si el proyecto lo exige. La 17020 es el diferenciador más citado en bases técnicas de inspección.',
  },
  {
    id: 'chk-sernageomin',
    phase: 3,
    label: 'Flujo SERNAGEOMIN operativo',
    detail: 'Experto en prevención inscrito, procedimiento de aviso de faena (15 días) y reporte E-200 mensual (obligatorio incluso sin incidentes).',
  },
  {
    id: 'chk-sec',
    phase: 3,
    label: 'Licencias SEC clase A/B para el equipo eléctrico',
    detail: 'Trámite gratuito en línea; Clase A requiere ingeniero civil electricista o de ejecución.',
  },
  {
    id: 'chk-ferias',
    phase: 3,
    label: 'Agenda comercial: Minería Digital (5-7 ago-2026) y EXPOMIN 2027',
    detail: 'EXPOMIN 2027: 20-24 abr-2027, Espacio Riesco (+ CESCO Week la misma semana). Paper para MAPLA-Mantemin 2027 en 2S-2026.',
  },
  {
    id: 'chk-rnito',
    phase: 3,
    label: 'Expediente listo para el Registro Nacional de ITO (MINVU, Ley 20.703)',
    detail: 'El reglamento aún no se publica — monitorear proveedorestecnicos.minvu.gob.cl y presentar apenas abra.',
  },
];
