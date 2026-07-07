import { projects } from './projects';
import { DEFAULT_INFO, pipelineClassification } from './pipelineClassification';
import { contactosPorProyecto } from './contactos';
import type { EnrichedProject } from './types';

/**
 * Proyectos con la clasificación pipeline/ductos y los contactos clave fusionados.
 * Fuente única para toda la app.
 */
export const enrichedProjects: EnrichedProject[] = projects.map((p) => ({
  ...p,
  ...(pipelineClassification[p.id] ?? DEFAULT_INFO),
  contactosClave: contactosPorProyecto[p.id] ?? [],
}));
