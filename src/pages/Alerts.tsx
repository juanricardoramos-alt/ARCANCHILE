import { tenders } from '../data/tenders';
import { SectionTitle } from '../components/ui';

const MONITORING = [
  { freq: 'Semanal', what: 'codelco.com/licitaciones-en-proceso · Mercado Público (alertas por rubro) · visor MOP' },
  { freq: 'Mensual', what: 'Coordinador Eléctrico (obras nuevas/ampliación) · concesiones.mop.gob.cl · Portal Minero' },
  { freq: 'Trimestral', what: 'Portales privados: Conexión Energía, AMSA/Fluor-Salfa, EPSA, ENAP, Arauco, CMPC, Enel WeBUY' },
];

export function Alerts() {
  const highlighted = tenders.filter((t) => t.highlight);
  const rest = tenders.filter((t) => !t.highlight);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Alertas y licitaciones activas</h1>
        <p className="text-sm text-steel-500">
          Procesos abiertos o recientes a jul-2026 — verificar estado vigente antes de movilizar recursos
        </p>
      </div>

      {/* Alerta prioritaria */}
      {highlighted.map((t) => (
        <div key={t.id} className="overflow-hidden rounded-lg border-2 border-amber-400 bg-white shadow-md">
          <div className="flex items-center gap-2 bg-amber-500 px-4 py-2">
            <span className="animate-pulse text-lg">⚠</span>
            <span className="text-sm font-black uppercase tracking-wide text-navy-950">
              Alerta prioritaria · calce exacto con ARCANCHILE
            </span>
          </div>
          <div className="p-5">
            <h2 className="text-lg font-black text-navy-900">{t.title}</h2>
            <p className="mt-1 text-sm font-semibold text-steel-600">{t.entity}</p>
            <p className="mt-2 text-steel-700">{t.scope}</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded border border-amber-200 bg-amber-50 p-3">
                <div className="text-[11px] font-bold uppercase text-steel-500">Estado</div>
                <div className="mt-0.5 text-sm font-bold text-red-700">{t.status}</div>
              </div>
              <div className="rounded border border-steel-200 bg-steel-50 p-3">
                <div className="text-[11px] font-bold uppercase text-steel-500">Fechas</div>
                <div className="mt-0.5 text-sm text-steel-700">{t.dates}</div>
              </div>
              <div className="rounded border border-steel-200 bg-steel-50 p-3">
                <div className="text-[11px] font-bold uppercase text-steel-500">Monto</div>
                <div className="mt-0.5 text-sm font-bold text-navy-900">{t.amount}</div>
              </div>
            </div>
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-700"
            >
              Ver fuente ↗
            </a>
          </div>
        </div>
      ))}

      {/* Resto de licitaciones */}
      <div>
        <SectionTitle>Licitaciones y procesos activos</SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rest.map((t) => (
            <div key={t.id} className="flex flex-col rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold leading-snug text-navy-900">{t.title}</h3>
              <p className="mt-0.5 text-sm font-semibold text-steel-500">{t.entity}</p>
              <p className="mt-2 flex-1 text-sm text-steel-600">{t.scope}</p>
              <div className="mt-3 space-y-1 border-t border-steel-100 pt-3 text-xs text-steel-600">
                <div>
                  <span className="font-bold text-navy-800">Estado:</span> {t.status}
                </div>
                <div>
                  <span className="font-bold text-navy-800">Fechas:</span> {t.dates}
                </div>
                <div>
                  <span className="font-bold text-navy-800">Monto:</span> {t.amount}
                </div>
              </div>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm font-bold text-amber-600 hover:underline"
              >
                Ver fuente ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Plan de monitoreo */}
      <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-navy-800">Plan de monitoreo recomendado</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-navy-900">
          {MONITORING.map((m) => (
            <li key={m.freq} className="flex gap-2">
              <span className="w-24 shrink-0 font-black text-amber-600">{m.freq}</span>
              <span className="text-steel-700">{m.what}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
