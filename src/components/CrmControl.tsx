import { useApp } from '../context/AppContext';
import { CRM_LABEL, CRM_STATES } from '../data/types';
import type { CrmState } from '../data/types';
import { crmSelectClass } from './ui';

/** Selector de estado CRM para un contacto (persistente vía contexto). */
export function CrmControl({ contactKey, initial = 'pendiente' }: { contactKey: string; initial?: CrmState }) {
  const { crm, setCrm } = useApp();
  const value: CrmState = crm[contactKey] ?? initial;
  return (
    <select
      value={value}
      onChange={(e) => setCrm(contactKey, e.target.value as CrmState)}
      onClick={(e) => e.stopPropagation()}
      className={`rounded border px-2 py-1 text-xs font-semibold outline-none focus:border-navy-500 ${crmSelectClass[value]}`}
    >
      {CRM_STATES.map((s) => (
        <option key={s} value={s}>
          {CRM_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
