import { projects } from './projects';
import { DEFAULT_INFO, pipelineClassification } from './pipelineClassification';
import type { EnrichedProject } from './types';

/** Proyectos con la clasificación pipeline/ductos fusionada. Fuente única para toda la app. */
export const enrichedProjects: EnrichedProject[] = projects.map((p) => ({
  ...p,
  ...(pipelineClassification[p.id] ?? DEFAULT_INFO),
}));
