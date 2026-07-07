import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportarBackup, leerBackup } from '../lib/crmBackup';
import { contactosReales, exportRealContactsCsv, realStateOf } from '../lib/realContacts';
import { descargarInforme, generarInformeHtml } from '../lib/informe';
import type { ReportOpts } from '../lib/informe';
import { SECTOR_LABEL } from '../data/types';
import type { ContactSector } from '../data/types';

const SECTORES: ContactSector[] = ['MINERO', 'EPC', 'ENERGIA', 'OIL_GAS', 'PIPELINE', 'AGUA', 'CELULOSA', 'INSPECCION', 'INDUSTRIAL'];

export function CrmActions() {
  const { crmState, crmActivities, restoreCrm } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showInforme, setShowInforme] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { crmState: s, crmActivities: a, nContactos, nActividades } = await leerBackup(file);
      if (!window.confirm('¿Está seguro? Esto reemplazará toda la gestión actual.')) return;
      restoreCrm(s, a);
      setMsg({ ok: true, text: `Backup restaurado: ${nContactos} contactos, ${nActividades} actividades.` });
    } catch (err) {
      setMsg({ ok: false, text: `No se pudo importar: ${err instanceof Error ? err.message : 'archivo inválido'}` });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowInforme(true)}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-bold text-navy-950 shadow-sm hover:bg-amber-400"
        >
          🟡 Descargar Informe de Gestión
        </button>
        <button
          onClick={() => exportarBackup(crmState, crmActivities)}
          className="rounded border border-navy-300 bg-white px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        >
          ⬇️ Exportar Backup CRM
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded border border-navy-300 bg-white px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        >
          ⬆️ Importar Backup CRM
        </button>
        <button
          onClick={() => exportRealContactsCsv(contactosReales, (c) => realStateOf(crmState, c))}
          className="rounded border border-navy-300 bg-white px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50"
        >
          📊 Exportar CSV
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </div>
      {msg && (
        <div
          className={`flex items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${
            msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-lg leading-none opacity-70 hover:opacity-100" aria-label="Cerrar">
            ×
          </button>
        </div>
      )}
      {showInforme && <InformeModal crmState={crmState} crmActivities={crmActivities} onClose={() => setShowInforme(false)} />}
    </div>
  );
}

function InformeModal({
  crmState,
  crmActivities,
  onClose,
}: {
  crmState: ReturnType<typeof useApp>['crmState'];
  crmActivities: ReturnType<typeof useApp>['crmActivities'];
  onClose: () => void;
}) {
  const [periodo, setPeriodo] = useState<ReportOpts['periodo']>('mes');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [sector, setSector] = useState<'' | ContactSector>('');
  const [soloPipeline, setSoloPipeline] = useState(false);
  const [incluirDescartados, setIncluirDescartados] = useState(true);

  function generar() {
    const html = generarInformeHtml(crmState, crmActivities, { periodo, desde, hasta, sector, soloPipeline, incluirDescartados });
    descargarInforme(html);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:max-w-md sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-steel-200 px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">Informe de gestión comercial</div>
            <h3 className="font-black text-navy-900">Opciones del informe</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-steel-500 hover:bg-steel-100" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as ReportOpts['periodo'])}
              className="w-full rounded border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500"
            >
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
              <option value="todo">Todo</option>
              <option value="rango">Rango personalizado</option>
            </select>
            {periodo === 'rango' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded border border-steel-300 px-2 py-1.5 text-sm" />
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded border border-steel-300 px-2 py-1.5 text-sm" />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as '' | ContactSector)}
              className="w-full rounded border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500"
            >
              <option value="">Todos</option>
              {SECTORES.map((s) => (
                <option key={s} value={s}>
                  {SECTOR_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-steel-700">
            <input type="checkbox" checked={soloPipeline} onChange={(e) => setSoloPipeline(e.target.checked)} className="h-4 w-4 accent-sky-600" />
            Solo Pipeline / Ductos
          </label>
          <label className="flex items-center gap-2 text-sm text-steel-700">
            <input type="checkbox" checked={incluirDescartados} onChange={(e) => setIncluirDescartados(e.target.checked)} className="h-4 w-4 accent-navy-700" />
            Incluir contactos descartados
          </label>

          <div className="flex justify-end gap-2 border-t border-steel-200 pt-3">
            <button onClick={onClose} className="rounded border border-steel-300 px-4 py-2 text-sm font-semibold text-steel-600 hover:bg-steel-50">
              Cancelar
            </button>
            <button onClick={generar} className="rounded bg-amber-500 px-4 py-2 text-sm font-bold text-navy-950 hover:bg-amber-400">
              Generar y descargar
            </button>
          </div>
          <p className="text-[11px] text-steel-400">
            Se descargará un archivo HTML. Ábrelo y usa Ctrl+P → “Guardar como PDF” para el PDF final.
          </p>
        </div>
      </div>
    </div>
  );
}
