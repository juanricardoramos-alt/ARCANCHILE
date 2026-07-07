import { contactosReales } from '../data/contactosReales';
import type { CrmState, RealContact } from '../data/types';
import { CRM_LABEL } from '../data/types';

export { contactosReales };

export function realKey(c: RealContact): string {
  return `rc::${c.id}`;
}

/** Estado CRM efectivo: override guardado, o 'pendiente' por defecto (todos parten en Pendiente). */
export function realStateOf(crm: Record<string, CrmState>, c: RealContact): CrmState {
  return crm[realKey(c)] ?? 'pendiente';
}

export const realByProject: Record<string, RealContact[]> = (() => {
  const map: Record<string, RealContact[]> = {};
  for (const c of contactosReales) {
    for (const pid of c.projectIds) {
      (map[pid] ??= []).push(c);
    }
  }
  // ordenar por prioridad dentro de cada proyecto
  for (const pid of Object.keys(map)) map[pid].sort((a, b) => a.prioridad - b.prioridad);
  return map;
})();

export const realByEmpresa: Record<string, RealContact[]> = (() => {
  const map: Record<string, RealContact[]> = {};
  for (const c of contactosReales) (map[c.empresa] ??= []).push(c);
  return map;
})();

export const empresasReales: string[] = [...new Set(contactosReales.map((c) => c.empresa))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);

/** Enlaces de contacto: teléfono chileno de 9 dígitos → tel: y WhatsApp. */
export function telHref(fono: string): string | null {
  const d = fono.replace(/\D/g, '');
  if (d.length < 8) return null;
  return `tel:+56${d}`;
}
export function waHref(fono: string): string | null {
  const d = fono.replace(/\D/g, '');
  if (d.length !== 9) return null;
  return `https://wa.me/56${d}`;
}

export function exportRealContactsCsv(list: RealContact[], stateOf: (c: RealContact) => CrmState): void {
  const header = [
    'Nombre',
    'Teléfono',
    'Email',
    'Empresa',
    'Sector',
    'Cargo',
    'Nivel',
    'Prioridad',
    'Estado CRM',
    'Nota BBDD',
    'Proyectos vinculados',
  ];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = list.map((c) =>
    [
      esc(c.nombre),
      esc(c.fono),
      esc(c.email),
      esc(c.empresa),
      c.sector,
      esc(c.cargo),
      c.nivel,
      c.prioridad,
      esc(CRM_LABEL[stateOf(c)]),
      esc(c.nota),
      esc(c.projectIds.join(' | ')),
    ].join(';'),
  );
  const csv = '﻿' + [header.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arcanchile_contactos_reales_bbdd.csv';
  a.click();
  URL.revokeObjectURL(url);
}
