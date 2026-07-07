-- ════════════════════════════════════════════════════════════════════════
--  ARCANCHILE · Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecutar en: Supabase → SQL Editor → New query → pegar todo → Run.
--  Idempotente: se puede volver a ejecutar sin borrar datos (usa IF NOT EXISTS).
-- ════════════════════════════════════════════════════════════════════════

-- ─────────────────────────── 1. USUARIOS ───────────────────────────
-- Perfil de cada usuario. La autenticación real (contraseña) la gestiona
-- Supabase Auth en la tabla auth.users; aquí guardamos nombre y rol.
create table if not exists public.usuarios (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  nombre        text not null default '',
  rol           text not null default 'comercial' check (rol in ('director', 'comercial', 'admin')),
  password_hash text,                       -- sin uso: la contraseña la maneja auth.users
  created_at    timestamptz not null default now()
);

-- ─────────────────────────── 2. PROYECTOS ──────────────────────────
create table if not exists public.proyectos (
  id                    text primary key,
  name                  text not null,
  owner                 text not null,
  sector                text not null,
  region                text not null,
  investment_musd       numeric,
  investment_label      text,
  stage                 text,
  priority              text,
  timeline              text,
  services              text[] not null default '{}',
  description           text,
  source_label          text,
  source_url            text,
  unconfirmed           boolean not null default false,
  categoria             text,
  relevancia_arcanchile text,
  pipeline_component    text,
  normativas            text[] not null default '{}',
  pipeline_services     text[] not null default '{}',
  created_at            timestamptz not null default now()
);

-- ─────────────────────────── 3. CONTACTOS ──────────────────────────
create table if not exists public.contactos (
  id          text primary key,
  origen      text,
  nombre      text not null,
  fono        text,
  email       text,
  empresa     text,
  empresa_raw text,
  sector      text,
  cargo       text,
  nivel       text,
  prioridad   int,
  nota        text,
  project_ids text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- ───────────────────── 4. ESTADOS DE CONTACTO ──────────────────────
-- Estado CRM actual por contacto (compartido por todo el equipo).
-- contacto_key = 'rc::<id>' (contacto real) o 'projectId::empresa::cargo' (perfil).
create table if not exists public.estados_contacto (
  contacto_key text primary key,
  estado       text not null,
  updated_at   timestamptz not null default now()
);

-- ────────────────────── 5. ACTIVIDADES CRM ─────────────────────────
-- Historial de gestión (compartido). Cada fila registra el usuario real.
create table if not exists public.actividades_crm (
  id              uuid primary key default gen_random_uuid(),
  contacto_key    text not null,
  estado_anterior text not null,
  estado_nuevo    text not null,
  nota            text not null,
  fecha           timestamptz not null default now(),
  usuario_id      uuid references auth.users (id) on delete set null,
  usuario_nombre  text,
  monto           numeric,
  fecha_reunion   date,
  motivo_descarte text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_actividades_contacto on public.actividades_crm (contacto_key);
create index if not exists idx_actividades_fecha on public.actividades_crm (fecha);

-- ─────────────────────── 6. CHECKLIST PLAN ─────────────────────────
-- Avance del plan de acción por usuario (personal).
create table if not exists public.checklist_plan (
  item_id    text not null,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  done       boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (item_id, usuario_id)
);

-- ════════════════════════════════════════════════════════════════════════
--  ALTA AUTOMÁTICA DE PERFIL AL REGISTRAR UN USUARIO
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'rol', 'comercial')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Herramienta interna del equipo: los usuarios autenticados comparten el CRM.
-- ════════════════════════════════════════════════════════════════════════
alter table public.usuarios          enable row level security;
alter table public.proyectos         enable row level security;
alter table public.contactos         enable row level security;
alter table public.estados_contacto  enable row level security;
alter table public.actividades_crm   enable row level security;
alter table public.checklist_plan    enable row level security;

-- usuarios: todos los autenticados pueden verse; cada uno edita su propio perfil.
drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select on public.usuarios for select to authenticated using (true);
drop policy if exists usuarios_update_self on public.usuarios;
create policy usuarios_update_self on public.usuarios for update to authenticated using (auth.uid() = id);

-- proyectos / contactos: datos de referencia de solo lectura para el equipo.
drop policy if exists proyectos_select on public.proyectos;
create policy proyectos_select on public.proyectos for select to authenticated using (true);
drop policy if exists contactos_select on public.contactos;
create policy contactos_select on public.contactos for select to authenticated using (true);

-- estados_contacto: CRM compartido (lectura/escritura para el equipo).
drop policy if exists estados_all on public.estados_contacto;
create policy estados_all on public.estados_contacto for all to authenticated using (true) with check (true);

-- actividades_crm: CRM compartido; al insertar, el usuario debe ser el propio.
drop policy if exists actividades_select on public.actividades_crm;
create policy actividades_select on public.actividades_crm for select to authenticated using (true);
drop policy if exists actividades_insert on public.actividades_crm;
create policy actividades_insert on public.actividades_crm for insert to authenticated
  with check (usuario_id is null or usuario_id = auth.uid());
drop policy if exists actividades_modify on public.actividades_crm;
create policy actividades_modify on public.actividades_crm for update to authenticated using (true) with check (true);
drop policy if exists actividades_delete on public.actividades_crm;
create policy actividades_delete on public.actividades_crm for delete to authenticated using (true);

-- checklist_plan: cada usuario gestiona su propio avance.
drop policy if exists checklist_own on public.checklist_plan;
create policy checklist_own on public.checklist_plan for all to authenticated
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- ════════════════════════════════════════════════════════════════════════
--  REALTIME: transmitir cambios del CRM en vivo
-- ════════════════════════════════════════════════════════════════════════
do $$
begin
  begin
    alter publication supabase_realtime add table public.actividades_crm;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.estados_contacto;
  exception when duplicate_object then null;
  end;
end $$;
