import type { Activity, CrmState } from '../data/types';

export interface CrmBackup {
  app: 'ARCANCHILE';
  tipo: 'crm-backup';
  version: 1;
  exportadoEl: string;
  crmState: Record<string, CrmState>;
  crmActivities: Record<string, Activity[]>;
}

function descargar(nombre: string, contenido: string, mime: string): void {
  const blob = new Blob([contenido], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exporta todo el estado del CRM (estados + historial) a un archivo JSON. */
export function exportarBackup(
  crmState: Record<string, CrmState>,
  crmActivities: Record<string, Activity[]>,
): void {
  const data: CrmBackup = {
    app: 'ARCANCHILE',
    tipo: 'crm-backup',
    version: 1,
    exportadoEl: new Date().toISOString(),
    crmState,
    crmActivities,
  };
  const fecha = new Date().toISOString().slice(0, 10);
  descargar(`backup_crm_ARCANCHILE_${fecha}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export interface BackupLeido {
  crmState: Record<string, CrmState>;
  crmActivities: Record<string, Activity[]>;
  nContactos: number;
  nActividades: number;
}

/** Lee y valida un archivo de backup. Lanza si el archivo no es válido. */
export async function leerBackup(file: File): Promise<BackupLeido> {
  const text = await file.text();
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const b = obj as Partial<CrmBackup>;
  if (!b || b.tipo !== 'crm-backup' || typeof b.crmState !== 'object' || typeof b.crmActivities !== 'object') {
    throw new Error('El archivo no es un backup de CRM de ARCANCHILE.');
  }
  const crmState = b.crmState as Record<string, CrmState>;
  const crmActivities = b.crmActivities as Record<string, Activity[]>;
  const nContactos = Object.keys(crmActivities).length;
  const nActividades = Object.values(crmActivities).reduce(
    (n, a) => n + (Array.isArray(a) ? a.length : 0),
    0,
  );
  return { crmState, crmActivities, nContactos, nActividades };
}
