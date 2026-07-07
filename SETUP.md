# ARCANCHILE · Guía de puesta en producción

Plataforma de gestión comercial (CRM + inteligencia de proyectos) para ARCANCHILE.
Esta guía explica cómo pasar de la **demo local** a una **aplicación en producción**
con backend real (Supabase), autenticación por usuarios y PWA instalable.

> **Modo demo (sin configurar nada):** si no creas el archivo `.env`, la app funciona
> de inmediato con datos en `localStorage` y login `admin / arcanchile2026`. Útil para
> probar la interfaz. Para uso real y multiusuario, sigue esta guía.

---

## 0. Requisitos

- Node.js 20.6+ (recomendado 22)
- Una cuenta gratuita en [supabase.com](https://supabase.com)

```bash
npm install
npm run dev        # http://localhost:5173  (modo demo)
```

---

## 1. Crear el proyecto en Supabase

1. Entra a [app.supabase.com](https://app.supabase.com) → **New project**.
2. Nombre: `arcanchile`. Elige una contraseña de base de datos y una región cercana
   (por ejemplo *South America (São Paulo)*).
3. Espera ~2 minutos a que el proyecto quede *Active*.

---

## 2. Crear las tablas (SQL)

1. En el panel de Supabase abre **SQL Editor → New query**.
2. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este repo,
   copia **todo** su contenido y pégalo en el editor.
3. Presiona **Run**.

Esto crea las tablas `usuarios`, `proyectos`, `contactos`, `estados_contacto`,
`actividades_crm` y `checklist_plan`, junto con:

- El **trigger** que crea el perfil del usuario automáticamente al registrarse.
- Las políticas **RLS** (seguridad por fila): datos de referencia de solo lectura,
  CRM compartido por el equipo y checklist personal por usuario.
- La activación de **Realtime** para el CRM (`actividades_crm` y `estados_contacto`).

El script es idempotente: puedes volver a ejecutarlo sin perder datos.

---

## 3. Configurar las variables de entorno

1. Copia la plantilla:

   ```bash
   cp .env.example .env
   ```

2. En Supabase ve a **Project Settings → API** y copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (solo para el seed)

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

> ⚠️ La `service_role` key es secreta y omite la seguridad RLS. Úsala **solo**
> localmente para el seed. Nunca la subas al repositorio ni la pongas en el
> navegador. El archivo `.env` ya está en `.gitignore`.

---

## 4. Cargar los datos (seed)

Con el `.env` completo, carga los **69 proyectos** y los **612 contactos**:

```bash
npm run seed
```

Deberías ver:

```
▶ Sembrando proyectos…
  proyectos: 69/69
▶ Sembrando contactos…
  contactos: 612/612
✓ Listo: 69 proyectos y 612 contactos cargados.
```

El seed usa *upsert*, así que puedes ejecutarlo de nuevo sin duplicar filas.

---

## 5. Crear los usuarios

Con Supabase configurado, el login usa **correo + contraseña**.

### Primer usuario (administrador)

1. En Supabase: **Authentication → Users → Add user → Create new user**.
2. Correo (p. ej. `contacto@arcanchile.com`) y una contraseña.
3. Márcalo como *Auto Confirm User* para no requerir verificación por correo.
4. Para darle rol **admin**, ve a **SQL Editor** y ejecuta:

   ```sql
   update public.usuarios set rol = 'admin'
   where email = 'contacto@arcanchile.com';
   ```

### Usuarios siguientes (desde la app)

Inicia sesión como admin y entra a **Usuarios** (visible solo para admins).
Desde ahí puedes crear usuarios con rol **director**, **comercial** o **admin**.

> Si activaste la verificación por correo en Supabase (**Authentication →
> Providers → Email → Confirm email**), los nuevos usuarios deberán confirmar
> su correo antes de ingresar. Para uso interno puedes desactivarla.

### Roles

| Rol         | Acceso                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| `director`  | Toda la plataforma y el CRM compartido.                                |
| `comercial` | Toda la plataforma y el CRM compartido.                                |
| `admin`     | Igual que los anteriores + página **Usuarios** para registrar cuentas. |

---

## 6. Compilar y desplegar

```bash
npm run build      # genera dist/  (compila TS + Vite + PWA)
npm run preview    # sirve dist/ localmente para probar
```

Sube la carpeta `dist/` a cualquier hosting estático (Vercel, Netlify,
Cloudflare Pages, etc.). Configura allí las variables `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` en el panel del proveedor.

En **Supabase → Authentication → URL Configuration** agrega la URL de tu sitio
en *Site URL* y *Redirect URLs*.

---

## 7. PWA (aplicación instalable)

La app se compila como **PWA** (Progressive Web App):

- **Instalable**: en móvil aparece el banner *"Instalar ARCANCHILE"*; en escritorio,
  el icono de instalar de la barra de direcciones. Al instalarse, se abre en modo
  *standalone* con su icono en la pantalla de inicio.
- **Offline**: un *service worker* cachea la app y las últimas lecturas del CRM,
  de modo que se puede abrir sin conexión (los cambios se sincronizan al reconectar).
- **Modo oscuro**: botón sol/luna en la barra superior (se recuerda la preferencia).
- **Móvil**: menú hamburguesa, botón flotante (FAB) de accesos rápidos y **swipe**
  en las tarjetas del CRM para avanzar/retroceder de estado.

> La PWA solo se activa en la build de producción (`npm run build` + `npm run preview`),
> no en `npm run dev`.

### Notificaciones push (opcional)

El service worker ya incluye los *handlers* de `push` y `notificationclick`
(ver [`public/push-sw.js`](./public/push-sw.js)) para alertas de licitaciones urgentes.
Para enviar notificaciones reales necesitas un servidor de push con **claves VAPID**:

1. Genera un par de claves VAPID (p. ej. con `web-push`).
2. Suscribe al usuario con `pushManager.subscribe({ applicationServerKey })` y guarda
   la suscripción en Supabase.
3. Desde un backend (Supabase Edge Function, por ejemplo) envía el push cuando entre
   una licitación urgente.

Sin este paso, la app funciona igual: las notificaciones push quedan disponibles
para cuando se configure el servidor.

---

## 8. ¿Cómo sé en qué modo está corriendo?

- **Login con "Usuario / Contraseña"** y aviso de *acceso demo* → modo **local**
  (no hay `.env`).
- **Login con "Correo electrónico"** → modo **Supabase** (backend real).

---

## Resumen de archivos

| Archivo                 | Qué es                                              |
| ----------------------- | --------------------------------------------------- |
| `.env.example`          | Plantilla de variables de entorno.                  |
| `supabase/schema.sql`   | Esquema completo de la base de datos + RLS.         |
| `scripts/seed.ts`       | Carga proyectos y contactos (`npm run seed`).       |
| `src/lib/supabase.ts`   | Cliente de Supabase (modo local si no hay `.env`).  |
| `src/lib/crmDb.ts`      | Capa de datos del CRM (lecturas, escritura, realtime). |
| `public/push-sw.js`     | Handlers de notificaciones push del service worker. |
