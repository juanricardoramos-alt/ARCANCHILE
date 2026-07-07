import { useState } from 'react';
import { Link } from 'react-router-dom';
import { companies } from '../data/companies';
import { contactosReales, empresasReales, realByEmpresa } from '../lib/realContacts';
import type { CompanyType } from '../data/types';

const TYPES: CompanyType[] = [
  'Mandante minero',
  'Mandante energía',
  'Mandante industrial',
  'Estatal / Público',
  'EPC / Contratista',
];

const typeStyles: Record<CompanyType, string> = {
  'Mandante minero': 'bg-amber-100 text-amber-800',
  'Mandante energía': 'bg-navy-100 text-navy-800',
  'Mandante industrial': 'bg-cyan-100 text-cyan-800',
  'Estatal / Público': 'bg-emerald-100 text-emerald-800',
  'EPC / Contratista': 'bg-steel-200 text-steel-700',
};

export function Companies() {
  const [type, setType] = useState<CompanyType | ''>('');
  const list = type ? companies.filter((c) => c.type === type) : companies;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">Directorio de empresas</h1>
        <p className="text-sm text-steel-500">
          Mandantes, EPCs y organismos con sus vías de registro de proveedores · {list.length} de {companies.length} entidades
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setType('')}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            type === '' ? 'bg-navy-900 text-white' : 'border border-steel-300 bg-white text-steel-600 hover:bg-steel-50'
          }`}
        >
          Todas
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              type === t ? 'bg-navy-900 text-white' : 'border border-steel-300 bg-white text-steel-600 hover:bg-steel-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="flex flex-col rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold leading-snug text-navy-900">{c.name}</h3>
              <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${typeStyles[c.type]}`}>{c.type}</span>
            </div>
            <p className="mt-2 text-sm text-steel-600">{c.description}</p>
            <div className="mt-3 flex-1 rounded border border-steel-200 bg-steel-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-steel-500">Inscripción de proveedores</div>
              <p className="mt-1 text-xs leading-relaxed text-steel-700">{c.registration}</p>
            </div>
            <a
              href={c.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:underline"
            >
              {c.portalLabel} ↗
            </a>
          </div>
        ))}
      </div>

      {/* Contactos reales por empresa (BBDD) */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
            Contactos reales en la BBDD por empresa ({contactosReales.length} en {empresasReales.length} empresas)
          </h2>
          <Link to="/gestion-comercial" className="text-xs font-semibold text-emerald-700 hover:underline">
            Ir al CRM →
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {empresasReales
            .map((e) => ({ e, n: realByEmpresa[e].length, d: realByEmpresa[e].filter((c) => c.nivel === 'decisor').length }))
            .sort((a, b) => b.n - a.n)
            .slice(0, 40)
            .map(({ e, n, d }) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs">
                <span className="font-semibold text-navy-800">{e}</span>
                <span className="rounded-full bg-emerald-600 px-1.5 font-bold text-white">{n}</span>
                {d > 0 && <span className="text-red-600" title={`${d} decisor(es)`}>· {d} dec.</span>}
              </span>
            ))}
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-navy-50 p-4 text-sm text-navy-800">
        <strong>Registros transversales:</strong> SICEP (36 mandantes del norte minero) · SAP Ariba Standard (Codelco, BHP,
        Anglo, AMSA, Transelec, AES) · Achilles/RePro (ENAP, Colbún, utilities) · Registro de Proveedores del Estado
        (obligatorio para Mercado Público desde dic-2024) · Registro de Consultores MOP D.S. 48/1994 (AIF/ITO — 3ª categoría
        sin experiencia exigida). "REDELE" no existe como registro chileno.
      </div>
    </div>
  );
}
