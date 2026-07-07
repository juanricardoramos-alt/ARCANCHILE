import { contactosReales, realKey } from './realContacts';
import { enrichedProjects } from '../data/enriched';
import { CRM_LABEL, CRM_STATES, SECTOR_LABEL } from '../data/types';
import type { Activity, ContactSector, CrmState, RealContact } from '../data/types';
import { CRM_COLOR } from './crm';

export interface ReportOpts {
  periodo: 'semana' | 'mes' | 'todo' | 'rango';
  desde?: string;
  hasta?: string;
  sector: '' | ContactSector;
  soloPipeline: boolean;
  incluirDescartados: boolean;
}

const ACTIVOS: CrmState[] = ['contactado', 'respuesta', 'reunion_agendada', 'reunion_realizada', 'propuesta', 'negociacion'];

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] as string);
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000;
}
function fFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}
function fFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
function detectMonto(text: string): string {
  const m = text.match(/US\$\s?[\d.,]+\s?(?:millones|mill\.?|MM|M)?|\bUF\s?[\d.,]+|\$\s?[\d.,]{3,}/i);
  return m ? m[0].trim() : '';
}

interface Rec {
  c: RealContact;
  key: string;
  state: CrmState;
  acts: Activity[];
  last?: Activity;
}

export function generarInformeHtml(
  crmState: Record<string, CrmState>,
  crmActivities: Record<string, Activity[]>,
  opts: ReportOpts,
): string {
  const now = new Date();
  const projName = new Map(enrichedProjects.map((p) => [p.id, p.name]));
  const pipeIds = new Set(enrichedProjects.filter((p) => p.categoria === 'pipeline').map((p) => p.id));

  let recs: Rec[] = contactosReales.map((c) => {
    const key = realKey(c);
    const acts = [...(crmActivities[key] ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
    return { c, key, acts, state: crmState[key] ?? 'pendiente', last: acts[acts.length - 1] };
  });
  if (opts.sector) recs = recs.filter((r) => r.c.sector === opts.sector);
  if (opts.soloPipeline) recs = recs.filter((r) => r.c.sector === 'PIPELINE' || r.c.projectIds.some((id) => pipeIds.has(id)));
  if (!opts.incluirDescartados) recs = recs.filter((r) => r.state !== 'descartado');

  const recByKey = new Map(recs.map((r) => [r.key, r]));

  // Ventana de período (para actividad reciente)
  let periodStart: Date | null = null;
  let periodEnd: Date = now;
  if (opts.periodo === 'semana') periodStart = addDays(now, -7);
  else if (opts.periodo === 'mes') periodStart = addDays(now, -30);
  else if (opts.periodo === 'rango') {
    periodStart = opts.desde ? new Date(opts.desde) : null;
    periodEnd = opts.hasta ? new Date(`${opts.hasta}T23:59:59`) : now;
  }
  const periodoLabel =
    opts.periodo === 'semana'
      ? 'Última semana'
      : opts.periodo === 'mes'
        ? 'Último mes'
        : opts.periodo === 'rango'
          ? `${opts.desde ?? '—'} a ${opts.hasta ?? 'hoy'}`
          : 'Todo el historial';

  const proyecto = (c: RealContact): string => {
    if (!c.projectIds.length) return '—';
    const n = projName.get(c.projectIds[0]) ?? c.projectIds[0];
    return c.projectIds.length > 1 ? `${n} +${c.projectIds.length - 1}` : n;
  };
  const stateChip = (s: CrmState): string =>
    `<span class="chip" style="background:${CRM_COLOR[s]}20;color:${CRM_COLOR[s]};border-color:${CRM_COLOR[s]}55">${esc(CRM_LABEL[s])}</span>`;

  // ── Datos base ──
  const total = recs.length;
  const gestionados = recs.filter((r) => r.acts.length > 0).length;
  const sinGestionar = total - gestionados;
  const tasa = total ? Math.round((gestionados / total) * 100) : 0;

  const countByState = (s: CrmState) => recs.filter((r) => r.state === s).length;

  // Todas las actividades de contactos incluidos
  const allActs: { a: Activity; r: Rec }[] = [];
  for (const r of recs) for (const a of r.acts) allActs.push({ a, r });
  allActs.sort((x, y) => y.a.fecha.localeCompare(x.a.fecha));
  const primeraActividad = allActs.length ? allActs[allActs.length - 1].a.fecha : null;

  const gestionadosSemana = recs.filter((r) => r.acts.some((a) => new Date(a.fecha) >= addDays(now, -7))).length;

  // Tiempo promedio entre estados (días)
  const gaps: number[] = [];
  for (const r of recs) for (let i = 1; i < r.acts.length; i++) gaps.push(daysBetween(r.acts[i - 1].fecha, r.acts[i].fecha));
  const tPromedio = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '—';

  // ── Embudo SVG ──
  const maxCount = Math.max(1, ...CRM_STATES.map(countByState));
  const barW = 520;
  const rowH = 26;
  const funnelSvg = `<svg viewBox="0 0 720 ${CRM_STATES.length * rowH + 8}" width="100%" style="max-width:720px">
    ${CRM_STATES.map((s, i) => {
      const n = countByState(s);
      const w = Math.max(2, (n / maxCount) * barW);
      const y = i * rowH + 4;
      return `<g>
        <text x="0" y="${y + rowH / 2 + 4}" font-size="11" fill="#334155">${esc(CRM_LABEL[s])}</text>
        <rect x="160" y="${y}" width="${w}" height="${rowH - 8}" rx="3" fill="${CRM_COLOR[s]}"/>
        <text x="${160 + w + 6}" y="${y + rowH / 2 + 4}" font-size="11" font-weight="700" fill="#0f2a43">${n}</text>
      </g>`;
    }).join('')}
  </svg>`;

  // ── Secciones ──
  const funnelRows = CRM_STATES.map((s) => {
    const n = countByState(s);
    const pct = total ? ((n / total) * 100).toFixed(1) : '0.0';
    return `<tr><td>${stateChip(s)}</td><td class="num">${n}</td><td class="num">${pct}%</td></tr>`;
  }).join('');

  // Reuniones agendadas
  const reunionesAg = recs.filter((r) => r.state === 'reunion_agendada');
  const reunionesRows = reunionesAg
    .slice()
    .sort((a, b) => (b.last?.fecha ?? '').localeCompare(a.last?.fecha ?? ''))
    .map(
      (r) =>
        `<tr><td>${r.last ? fFechaHora(r.last.fecha) : '—'}</td><td>${esc(r.c.empresa)}</td><td>${esc(r.c.nombre)}</td><td>${esc(r.last?.nota ?? '')}</td></tr>`,
    )
    .join('');

  // Propuestas
  const propuestas = recs.filter((r) => r.state === 'propuesta' || r.state === 'negociacion');
  const propuestasRows = propuestas
    .map((r) => {
      const monto = r.last ? detectMonto(r.last.nota) : '';
      return `<tr><td>${esc(r.c.nombre)}</td><td>${esc(r.c.empresa)}</td><td>${esc(proyecto(r.c))}</td><td>${stateChip(r.state)}</td><td>${monto ? esc(monto) : '—'}</td></tr>`;
    })
    .join('');
  const montosDetectados = propuestas.map((r) => (r.last ? detectMonto(r.last.nota) : '')).filter(Boolean);

  // Descartados
  const descartados = recs.filter((r) => r.state === 'descartado');
  const descartadosRows = descartados
    .map(
      (r) =>
        `<tr><td>${esc(r.c.empresa)}</td><td>${esc(r.c.nombre)}</td><td>${esc(r.last?.nota ?? '')}</td><td>${r.last ? fFecha(r.last.fecha) : '—'}</td></tr>`,
    )
    .join('');

  // Actividad reciente (ventana de período)
  const actsPeriodo = allActs.filter(({ a }) => {
    const d = new Date(a.fecha);
    if (periodStart && d < periodStart) return false;
    if (d > periodEnd) return false;
    return true;
  });
  const actividadRows = actsPeriodo
    .map(
      ({ a, r }) =>
        `<tr><td>${fFechaHora(a.fecha)}</td><td>${esc(r.c.nombre)}</td><td>${esc(r.c.empresa)}</td><td>${esc(proyecto(r.c))}</td><td>${stateChip(a.from)} → ${stateChip(a.to)}</td><td>${esc(a.nota)}</td></tr>`,
    )
    .join('');

  // Pipeline activo
  const activos = recs.filter((r) => ACTIVOS.includes(r.state));
  const pipelineRows = activos
    .slice()
    .sort((a, b) => CRM_STATES.indexOf(b.state) - CRM_STATES.indexOf(a.state))
    .map(
      (r) =>
        `<tr><td>${esc(r.c.nombre)}</td><td>${esc(r.c.empresa)}</td><td>${esc(proyecto(r.c))}</td><td>${stateChip(r.state)}</td><td>${r.last ? fFecha(r.last.fecha) : '—'}</td><td>${esc(r.last?.nota ?? '')}</td></tr>`,
    )
    .join('');

  // Alertas
  const sinActividad7 = recs.filter(
    (r) => r.acts.length > 0 && r.last && new Date(r.last.fecha) < addDays(now, -7) && ACTIVOS.includes(r.state),
  );
  const propuestaSinResp14 = recs.filter(
    (r) => r.state === 'propuesta' && r.last && new Date(r.last.fecha) < addDays(now, -14),
  );
  const reunionSinPropuesta = recs.filter((r) => r.state === 'reunion_realizada');

  const alertaLista = (list: Rec[]) =>
    list.length
      ? `<ul class="alert-list">${list
          .map(
            (r) =>
              `<li><strong>${esc(r.c.nombre)}</strong> · ${esc(r.c.empresa)} — ${stateChip(r.state)} <span class="muted">(última: ${r.last ? fFecha(r.last.fecha) : '—'})</span></li>`,
          )
          .join('')}</ul>`
      : `<p class="muted">Sin contactos en esta condición.</p>`;

  // Resumen por empresa
  const byEmp = new Map<string, { contactos: number; gest: number; reu: number; prop: number; adj: number }>();
  for (const r of recs) {
    const e = byEmp.get(r.c.empresa) ?? { contactos: 0, gest: 0, reu: 0, prop: 0, adj: 0 };
    e.contactos++;
    if (r.acts.length) e.gest++;
    if (r.state === 'reunion_agendada' || r.state === 'reunion_realizada') e.reu++;
    if (r.state === 'propuesta' || r.state === 'negociacion') e.prop++;
    if (r.state === 'adjudicado') e.adj++;
    byEmp.set(r.c.empresa, e);
  }
  const empresaRows = [...byEmp.entries()]
    .sort((a, b) => b[1].contactos - a[1].contactos)
    .map(
      ([emp, e]) =>
        `<tr><td>${esc(emp)}</td><td class="num">${e.contactos}</td><td class="num">${e.gest}</td><td class="num">${e.reu}</td><td class="num">${e.prop}</td><td class="num">${e.adj}</td></tr>`,
    )
    .join('');

  // Resumen por sector
  const sectores = [...new Set(recs.map((r) => r.c.sector))] as ContactSector[];
  const sectorRows = sectores
    .map((sec) => {
      const rs = recs.filter((r) => r.c.sector === sec);
      const gest = rs.filter((r) => r.acts.length).length;
      const adj = rs.filter((r) => r.state === 'adjudicado').length;
      return `<tr><td>${esc(SECTOR_LABEL[sec])}</td><td class="num">${rs.length}</td><td class="num">${gest}</td><td class="num">${adj}</td></tr>`;
    })
    .join('');

  const filtros = [
    opts.sector ? `Sector: ${SECTOR_LABEL[opts.sector]}` : 'Sector: Todos',
    opts.soloPipeline ? 'Solo Pipeline/Ductos' : 'Todos los contactos',
    opts.incluirDescartados ? 'Incluye descartados' : 'Sin descartados',
    `Período: ${periodoLabel}`,
  ].join(' · ');

  const pie = `Informe generado automáticamente — Plataforma ARCANCHILE — ${fFechaHora(now.toISOString())} — Confidencial`;

  // Marca ARCANCHILE embebida (SVG en línea, para que el informe descargado no dependa de archivos externos).
  const marca = (h: number) =>
    `<svg viewBox="48 6 122 214" height="${h}" xmlns="http://www.w3.org/2000/svg" style="display:block">` +
    `<path d="M134 10 C 80 50, 46 132, 52 216 C 72 150, 96 106, 144 70 C 150 48, 146 26, 134 10 Z" fill="#2B93CF"/>` +
    `<g fill="#2B93CF">` +
    `<rect x="110" y="104" width="60" height="15" rx="2.5"/>` +
    `<rect x="122" y="134" width="48" height="15" rx="2.5"/>` +
    `<rect x="110" y="164" width="60" height="15" rx="2.5"/>` +
    `<path d="M104 101 L123 101 L97 182 L78 182 Z"/>` +
    `<rect x="78" y="168" width="18" height="15" rx="2.5"/>` +
    `<rect x="151" y="164" width="18" height="19" rx="2.5"/>` +
    `</g></svg>`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de Gestión Comercial — ARCANCHILE</title>
<style>
  :root{--navy:#0f2a43;--navy2:#1e4265;--amber:#f59e0b;--brand:#2B93CF;--steel:#64748b;--line:#e2e8f0;}
  *{box-sizing:border-box}
  body{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#0f172a;margin:0;padding:0 0 60px;background:#fff;font-size:12px;line-height:1.45}
  .wrap{max-width:900px;margin:0 auto;padding:24px}
  h1{font-size:26px;margin:0}
  h2{font-size:16px;color:var(--navy);border-bottom:2px solid var(--amber);padding-bottom:4px;margin:26px 0 12px}
  h3{font-size:13px;color:var(--navy2);margin:14px 0 6px}
  .logo{display:inline-flex;align-items:center;gap:12px}
  .logo .name{font-weight:900;letter-spacing:1px;font-size:24px;line-height:1}
  .logo .name .a{color:var(--navy)}
  .logo .name .c{color:var(--brand)}
  .cover{border:1px solid var(--line);border-radius:12px;padding:28px;background:linear-gradient(135deg,#f8fafc,#fff)}
  .muted{color:var(--steel)}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:8px 0}
  .kpi{border:1px solid var(--line);border-radius:8px;padding:10px 12px}
  .kpi .v{font-size:22px;font-weight:800;color:var(--navy)}
  .kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--steel);font-weight:700}
  table{width:100%;border-collapse:collapse;margin:6px 0 4px;font-size:11px}
  th{background:var(--navy);color:#fff;text-align:left;padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:.4px}
  td{padding:5px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  tbody tr:nth-child(even){background:#f8fafc}
  td.num,th.num{text-align:right}
  .chip{display:inline-block;padding:1px 7px;border-radius:999px;border:1px solid;font-size:10px;font-weight:700;white-space:nowrap}
  .section{page-break-inside:avoid}
  .alert-list{margin:4px 0;padding-left:18px}
  .alert-list li{margin:2px 0}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .print-footer{position:fixed;bottom:0;left:0;right:0;font-size:9px;color:var(--steel);text-align:center;padding:6px;border-top:1px solid var(--line);background:#fff}
  .toolbar{position:sticky;top:0;background:#0f2a43;color:#fff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px}
  .toolbar button{background:var(--amber);color:var(--navy);border:0;font-weight:800;padding:8px 14px;border-radius:6px;cursor:pointer}
  @media print{.toolbar{display:none}.print-footer{position:fixed}body{padding-bottom:40px}@page{size:A4;margin:14mm 12mm 18mm}}
</style></head><body>
<div class="toolbar no-print">
  <span>Informe de Gestión Comercial · ARCANCHILE</span>
  <button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
</div>
<div class="wrap">

  <div class="cover section">
    <div class="logo">${marca(56)}<span class="name"><span class="a">ARCAN</span><span class="c">CHILE</span></span></div>
    <h1 style="margin-top:14px">Informe de Gestión Comercial</h1>
    <p class="muted" style="margin:6px 0 0">Generado el ${fFechaHora(now.toISOString())}</p>
    <p class="muted" style="margin:2px 0 0">Período: desde ${primeraActividad ? fFecha(primeraActividad) : 'sin actividades registradas'} hasta hoy</p>
    <p class="muted" style="margin:2px 0 0">Filtros: ${esc(filtros)}</p>
  </div>

  <h2>1. Resumen ejecutivo</h2>
  <div class="section">
    <div class="kpis">
      <div class="kpi"><div class="v">${total}</div><div class="l">Contactos</div></div>
      <div class="kpi"><div class="v">${gestionados}</div><div class="l">Gestionados</div></div>
      <div class="kpi"><div class="v">${sinGestionar}</div><div class="l">Sin gestionar</div></div>
      <div class="kpi"><div class="v">${tasa}%</div><div class="l">Tasa de avance</div></div>
    </div>
    <div class="grid2">
      <div>${funnelSvg}</div>
      <table>
        <thead><tr><th>Estado</th><th class="num">Cantidad</th><th class="num">% del total</th></tr></thead>
        <tbody>${funnelRows}</tbody>
      </table>
    </div>
  </div>

  <h2>2. KPIs principales</h2>
  <div class="section">
    <div class="kpis">
      <div class="kpi"><div class="v">${gestionadosSemana}</div><div class="l">Gestionados esta semana</div></div>
      <div class="kpi"><div class="v">${reunionesAg.length}</div><div class="l">Reuniones agendadas</div></div>
      <div class="kpi"><div class="v">${propuestas.length}</div><div class="l">Propuestas / negociación</div></div>
      <div class="kpi"><div class="v">${countByState('adjudicado')}</div><div class="l">Adjudicados</div></div>
      <div class="kpi"><div class="v">${descartados.length}</div><div class="l">Descartados</div></div>
      <div class="kpi"><div class="v">${tPromedio}</div><div class="l">Días prom. entre estados</div></div>
    </div>
  </div>

  <h2>3. Actividad reciente (${esc(periodoLabel)})</h2>
  <div class="section">
    ${
      actividadRows
        ? `<table><thead><tr><th>Fecha</th><th>Contacto</th><th>Empresa</th><th>Proyecto</th><th>Cambio de estado</th><th>Nota</th></tr></thead><tbody>${actividadRows}</tbody></table>`
        : '<p class="muted">No hay actividades registradas en el período seleccionado.</p>'
    }
  </div>

  <h2>4. Pipeline de oportunidades activas</h2>
  <div class="section">
    ${
      pipelineRows
        ? `<table><thead><tr><th>Contacto</th><th>Empresa</th><th>Proyecto</th><th>Estado</th><th>Última actividad</th><th>Próximo paso</th></tr></thead><tbody>${pipelineRows}</tbody></table>`
        : '<p class="muted">No hay oportunidades activas (contactos entre Contactado y En negociación).</p>'
    }
  </div>

  <h2>5. Reuniones programadas</h2>
  <div class="section">
    ${
      reunionesRows
        ? `<table><thead><tr><th>Registrada</th><th>Empresa</th><th>Contacto</th><th>Objetivo / nota</th></tr></thead><tbody>${reunionesRows}</tbody></table>`
        : '<p class="muted">No hay reuniones agendadas.</p>'
    }
  </div>

  <h2>6. Propuestas en curso</h2>
  <div class="section">
    ${
      propuestasRows
        ? `<table><thead><tr><th>Contacto</th><th>Empresa</th><th>Proyecto</th><th>Estado</th><th>Monto detectado</th></tr></thead><tbody>${propuestasRows}</tbody></table>
           <p class="muted">Montos detectados automáticamente del texto de las notas${montosDetectados.length ? ` (${montosDetectados.length} con monto)` : ' — ninguno registrado'}.</p>`
        : '<p class="muted">No hay propuestas enviadas ni en negociación.</p>'
    }
  </div>

  <h2>7. Contactos descartados</h2>
  <div class="section">
    ${
      descartadosRows
        ? `<table><thead><tr><th>Empresa</th><th>Contacto</th><th>Motivo del descarte</th><th>Fecha</th></tr></thead><tbody>${descartadosRows}</tbody></table>`
        : '<p class="muted">No hay contactos descartados.</p>'
    }
  </div>

  <h2>8. Alertas y seguimiento</h2>
  <div class="section">
    <h3>Contactos activos sin actividad hace más de 7 días (${sinActividad7.length})</h3>
    ${alertaLista(sinActividad7)}
    <h3>Propuestas sin respuesta hace más de 14 días (${propuestaSinResp14.length})</h3>
    ${alertaLista(propuestaSinResp14)}
    <h3>Reuniones realizadas sin propuesta enviada (${reunionSinPropuesta.length})</h3>
    ${alertaLista(reunionSinPropuesta)}
  </div>

  <h2>9. Resumen por empresa</h2>
  <div class="section">
    <table><thead><tr><th>Empresa</th><th class="num">Contactos</th><th class="num">Gestionados</th><th class="num">Reuniones</th><th class="num">Propuestas</th><th class="num">Adjudicado</th></tr></thead>
    <tbody>${empresaRows}</tbody></table>
  </div>

  <h2>10. Resumen por sector</h2>
  <div class="section">
    <table><thead><tr><th>Sector</th><th class="num">Contactos</th><th class="num">Gestionados</th><th class="num">Adjudicados</th></tr></thead>
    <tbody>${sectorRows}</tbody></table>
  </div>

</div>
<div class="print-footer"><span style="display:inline-flex;align-items:center;gap:6px">${marca(12)}<span>${esc(pie)}</span></span></div>
</body></html>`;
}

export function descargarInforme(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `informe_gestion_ARCANCHILE_${fecha}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
