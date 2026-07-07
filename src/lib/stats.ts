import { projects } from '../data/projects';
import type { Priority, Project } from '../data/types';

/** Proyectos no desistidos (se muestran en catálogo). */
export const activeProjects = projects.filter((p) => p.stage !== 'Desistido');

/** Proyectos accionables para KPIs/gráficos (excluye desistidos y suspendidos). */
export const actionableProjects = projects.filter(
  (p) => p.stage !== 'Desistido' && p.stage !== 'Suspendido / En riesgo',
);

export function fmtMusd(v: number | null): string {
  if (v === null) return 's/d';
  return `US$${v.toLocaleString('es-CL')}M`;
}

export function totalInvestment(list: Project[]): number {
  return list.reduce((acc, p) => acc + (p.investmentMUSD ?? 0), 0);
}

export function investmentBySector(list: Project[]): { sector: string; inversion: number; proyectos: number }[] {
  const map = new Map<string, { inversion: number; proyectos: number }>();
  for (const p of list) {
    const e = map.get(p.sector) ?? { inversion: 0, proyectos: 0 };
    e.inversion += p.investmentMUSD ?? 0;
    e.proyectos += 1;
    map.set(p.sector, e);
  }
  return [...map.entries()]
    .map(([sector, e]) => ({ sector, ...e }))
    .sort((a, b) => b.inversion - a.inversion);
}

export function projectsByStage(list: Project[]): { stage: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of list) map.set(p.stage, (map.get(p.stage) ?? 0) + 1);
  return [...map.entries()].map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count);
}

export function projectsByPriority(list: Project[]): Record<Priority, number> {
  const acc: Record<Priority, number> = { A: 0, B: 0, C: 0 };
  for (const p of list) acc[p.priority] += 1;
  return acc;
}

export function topByInvestment(list: Project[], n: number): Project[] {
  return [...list]
    .filter((p) => p.investmentMUSD !== null)
    .sort((a, b) => (b.investmentMUSD ?? 0) - (a.investmentMUSD ?? 0))
    .slice(0, n);
}

export function investmentByRegion(list: Project[]): Map<string, { count: number; investment: number }> {
  const map = new Map<string, { count: number; investment: number }>();
  for (const p of list) {
    const e = map.get(p.region) ?? { count: 0, investment: 0 };
    e.count += 1;
    e.investment += p.investmentMUSD ?? 0;
    map.set(p.region, e);
  }
  return map;
}

export function exportProjectsCsv(list: Project[]): void {
  const header = [
    'Nombre',
    'Mandante',
    'Sector',
    'Región',
    'Inversión (MUSD)',
    'Inversión (detalle)',
    'Etapa',
    'Prioridad',
    'Cronograma',
    'Servicios ARCANCHILE',
    'Fuente',
  ];
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = list.map((p) =>
    [
      esc(p.name),
      esc(p.owner),
      esc(p.sector),
      esc(p.region),
      p.investmentMUSD ?? '',
      esc(p.investmentLabel),
      esc(p.stage),
      p.priority,
      esc(p.timeline),
      esc(p.services.join(' | ')),
      esc(p.sourceUrl),
    ].join(';'),
  );
  const csv = '﻿' + [header.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arcanchile_oportunidades_2026-2030.csv';
  a.click();
  URL.revokeObjectURL(url);
}
