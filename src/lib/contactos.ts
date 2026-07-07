import { enrichedProjects } from '../data/enriched';
import type { Categoria, ContactoClave, CrmState, EnrichedProject } from '../data/types';
import { CRM_LABEL } from '../data/types';

export interface FlatContact {
  projectId: string;
  projectName: string;
  owner: string;
  sector: string;
  categoria: Categoria;
  c: ContactoClave;
  key: string;
}

export function contactKey(projectId: string, c: ContactoClave): string {
  return `${projectId}::${c.empresa}::${c.cargo}`;
}

/** Proyectos gestionables comercialmente (excluye desistidos). */
export const contactableProjects = enrichedProjects.filter((p) => p.stage !== 'Desistido');

export const allContacts: FlatContact[] = contactableProjects.flatMap((p) =>
  p.contactosClave.map((c) => ({
    projectId: p.id,
    projectName: p.name,
    owner: p.owner,
    sector: p.sector,
    categoria: p.categoria,
    c,
    key: contactKey(p.id, c),
  })),
);

export const empresasList: string[] = [...new Set(allContacts.map((f) => f.c.empresa))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);

/** Contacto de mayor prioridad de un proyecto (prioridad 1 primero). */
export function primaryContact(p: EnrichedProject): ContactoClave | undefined {
  return [...p.contactosClave].sort((a, b) => a.prioridad - b.prioridad)[0];
}

export function exportContactsCsv(list: FlatContact[], stateOf: (key: string) => CrmState): void {
  const header = [
    'Proyecto',
    'Mandante/Dueño',
    'Empresa del contacto',
    'Cargo',
    'Departamento',
    'Nivel',
    'Prioridad',
    'Canal sugerido',
    'Objetivo de la reunión',
    'Estado CRM',
  ];
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = list.map((f) =>
    [
      esc(f.projectName),
      esc(f.owner),
      esc(f.c.empresa),
      esc(f.c.cargo),
      esc(f.c.departamento),
      f.c.nivel,
      f.c.prioridad,
      esc(f.c.canalSugerido),
      esc(f.c.objetivo),
      esc(CRM_LABEL[stateOf(f.key)]),
    ].join(';'),
  );
  const csv = '﻿' + [header.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arcanchile_contactos_gestion_comercial.csv';
  a.click();
  URL.revokeObjectURL(url);
}
