/**
 * Seed de la base de datos ARCANCHILE.
 *
 * Carga los 69 proyectos (con su clasificación pipeline) y los 612 contactos
 * reales en las tablas `proyectos` y `contactos` de Supabase.
 *
 * Uso:
 *   1. Copia .env.example a .env y completa VITE_SUPABASE_URL.
 *   2. Añade tu SERVICE ROLE KEY (Supabase → Settings → API) como
 *      SUPABASE_SERVICE_ROLE_KEY en .env  (¡nunca la subas al repo!).
 *   3. npm run seed
 *
 * La service role key salta las políticas RLS: por eso el seed se corre
 * localmente y esa clave jamás debe llegar al navegador.
 */
import { createClient } from '@supabase/supabase-js';
import { enrichedProjects } from '../src/data/enriched';
import { contactosReales } from '../src/data/contactosReales';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '\n✗ Faltan variables de entorno.\n' +
      '  Necesitas VITE_SUPABASE_URL (o SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  Ejecuta:  npm run seed   (con un archivo .env completo)\n',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const CHUNK = 200;
async function upsertChunked<T extends object>(table: string, rows: T[]): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(table).upsert(slice, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    process.stdout.write(`  ${table}: ${Math.min(i + CHUNK, rows.length)}/${rows.length}\r`);
  }
  process.stdout.write('\n');
}

async function main() {
  console.log('▶ Sembrando proyectos…');
  const proyectos = enrichedProjects.map((p) => ({
    id: p.id,
    name: p.name,
    owner: p.owner,
    sector: p.sector,
    region: p.region,
    investment_musd: p.investmentMUSD,
    investment_label: p.investmentLabel,
    stage: p.stage,
    priority: p.priority,
    timeline: p.timeline,
    services: p.services,
    description: p.description,
    source_label: p.sourceLabel,
    source_url: p.sourceUrl,
    unconfirmed: p.unconfirmed ?? false,
    categoria: p.categoria,
    relevancia_arcanchile: p.relevanciaArcanchile,
    pipeline_component: p.pipelineComponent,
    normativas: p.normativas,
    pipeline_services: p.pipelineServices,
  }));
  await upsertChunked('proyectos', proyectos);

  console.log('▶ Sembrando contactos…');
  const contactos = contactosReales.map((c) => ({
    id: c.id,
    origen: c.origen,
    nombre: c.nombre,
    fono: c.fono,
    email: c.email,
    empresa: c.empresa,
    empresa_raw: c.empresaRaw,
    sector: c.sector,
    cargo: c.cargo,
    nivel: c.nivel,
    prioridad: c.prioridad,
    nota: c.nota,
    project_ids: c.projectIds,
  }));
  await upsertChunked('contactos', contactos);

  console.log(`\n✓ Listo: ${proyectos.length} proyectos y ${contactos.length} contactos cargados.`);
}

main().catch((e) => {
  console.error('\n✗ Error en el seed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
