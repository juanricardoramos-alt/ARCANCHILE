export type Priority = 'A' | 'B' | 'C';

export type Sector =
  | 'Minería'
  | 'Litio'
  | 'Energía'
  | 'Hidrógeno verde'
  | 'Celulosa y Forestal'
  | 'Petróleo y Gas'
  | 'Infraestructura y Puertos'
  | 'Agua y Desalación'
  | 'Industria';

export type Stage =
  | 'Estudio / Prefactibilidad'
  | 'EIA en trámite'
  | 'Aprobado (RCA/FID)'
  | 'En licitación'
  | 'Construcción'
  | 'Puesta en marcha'
  | 'Operación'
  | 'Recurrente'
  | 'Suspendido / En riesgo'
  | 'Desistido';

export type ServiceTag =
  | 'Ingeniería'
  | 'ITO / Supervisión'
  | 'QA/QC'
  | 'END'
  | 'Comisionamiento'
  | 'Monitoreo geotécnico'
  | 'Escaneo 3D / BIM'
  | 'Inspección en servicio'
  | 'Peritajes / Reglamentaria'
  | 'Inspección con drones';

export interface Project {
  id: string;
  name: string;
  owner: string;
  sector: Sector;
  region: string;
  /** Monto de inversión en millones de USD (null si no está publicado). */
  investmentMUSD: number | null;
  investmentLabel: string;
  stage: Stage;
  priority: Priority;
  timeline: string;
  services: ServiceTag[];
  description: string;
  sourceLabel: string;
  sourceUrl: string;
  unconfirmed?: boolean;
}

export type CompanyType =
  | 'Mandante minero'
  | 'Mandante energía'
  | 'Mandante industrial'
  | 'Estatal / Público'
  | 'EPC / Contratista';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  description: string;
  registration: string;
  portalUrl: string;
  portalLabel: string;
}

export interface Tender {
  id: string;
  title: string;
  entity: string;
  scope: string;
  status: string;
  dates: string;
  amount: string;
  url: string;
  highlight?: boolean;
}

export interface ChecklistItem {
  id: string;
  phase: 1 | 2 | 3;
  label: string;
  detail: string;
}

export interface TimelinePhase {
  phase: 1 | 2 | 3;
  title: string;
  days: string;
  color: string;
  summary: string;
}

// ══════════════ Clasificación Pipeline / Ductos (core ARCANCHILE) ══════════════

export type Categoria = 'pipeline' | 'otros';

/**
 * Relevancia del proyecto para el core de ductos/pipeline de ARCANCHILE.
 * - alta: el proyecto es esencialmente ductos/piping (acueductos, mineroductos, inspección de cañerías).
 * - media: tiene un componente relevante de piping pero no es exclusivamente ductos (p. ej. una concentradora).
 * - baja: no tiene relación con ductos/pipeline.
 */
export type RelevanciaArcanchile = 'alta' | 'media' | 'baja';

export type PipelineServiceCategory =
  | 'Diseño / Ingeniería de ductos'
  | 'Inspección END de soldaduras'
  | 'QA/QC de piping'
  | 'ITO de montaje'
  | 'Inspección en servicio'
  | 'Comisionamiento y pruebas';

export const PIPELINE_SERVICE_ORDER: PipelineServiceCategory[] = [
  'Diseño / Ingeniería de ductos',
  'Inspección END de soldaduras',
  'QA/QC de piping',
  'ITO de montaje',
  'Inspección en servicio',
  'Comisionamiento y pruebas',
];

export interface PipelineInfo {
  categoria: Categoria;
  relevanciaArcanchile: RelevanciaArcanchile;
  /** Qué trabajo concreto de ductos/pipeline requiere el proyecto (vacío si es 'otros'). */
  pipelineComponent: string;
  /** Normativas API/ASME/AWWA aplicables al componente de piping. */
  normativas: string[];
  pipelineServices: PipelineServiceCategory[];
}

// ══════════════ Contactos clave / gestión comercial (CRM) ══════════════

export type ContactoNivel = 'decisor' | 'influenciador' | 'tecnico' | 'acceso';

export interface ContactoClave {
  cargo: string;
  departamento: string;
  nivel: ContactoNivel;
  prioridad: 1 | 2 | 3;
  /** Qué buscar en esa reunión. */
  objetivo: string;
  /** Cómo llegar a esa persona. */
  canalSugerido: string;
  /** Empresa a la que pertenece el cargo (mandante o EPC). */
  empresa: string;
}

export type CrmState = 'pendiente' | 'contactado' | 'reunion' | 'propuesta' | 'seguimiento';

export const CRM_STATES: CrmState[] = ['pendiente', 'contactado', 'reunion', 'propuesta', 'seguimiento'];

export const CRM_LABEL: Record<CrmState, string> = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  reunion: 'Reunión agendada',
  propuesta: 'Propuesta enviada',
  seguimiento: 'En seguimiento',
};

/** Proyecto con la clasificación pipeline y los contactos clave fusionados. */
export interface EnrichedProject extends Project, PipelineInfo {
  contactosClave: ContactoClave[];
}

// ══════════════ Contactos reales (BBDD LinkedIn de ARCANCHILE) ══════════════

export type ContactSector =
  | 'MINERO'
  | 'EPC'
  | 'ENERGIA'
  | 'OIL_GAS'
  | 'PIPELINE'
  | 'AGUA'
  | 'CELULOSA'
  | 'INSPECCION'
  | 'INDUSTRIAL';

export const SECTOR_LABEL: Record<ContactSector, string> = {
  MINERO: 'Minería',
  EPC: 'EPC / Ingeniería',
  ENERGIA: 'Energía',
  OIL_GAS: 'Petróleo y Gas',
  PIPELINE: 'Ductos / Pipeline',
  AGUA: 'Agua / Desalación',
  CELULOSA: 'Celulosa',
  INSPECCION: 'Inspección / Certificación',
  INDUSTRIAL: 'Industrial',
};

export interface RealContact {
  id: string;
  nombre: string;
  fono: string;
  empresa: string;
  empresaRaw: string;
  sector: ContactSector;
  cargo: string;
  nivel: ContactoNivel;
  prioridad: 1 | 2 | 3;
  /** Estado CRM inicial derivado de la columna de gestión original de la BBDD. */
  crmInicial: CrmState;
  /** Nota original de gestión (columna A del Excel). */
  nota: string;
  email: string;
  /** Proyectos de la plataforma cuya empresa coincide con la del contacto. */
  projectIds: string[];
}
