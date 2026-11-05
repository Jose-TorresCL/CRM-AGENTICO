# CRM Operativo — Revestimiento de Piscinas

CRM comercial para gestión de clientes, oportunidades y actividades. El proyecto
usa Next.js App Router, TypeScript, Tailwind CSS, componentes shadcn/ui, Prisma,
PostgreSQL de Supabase y Supabase Auth.

## Requisitos

- Node.js 20.9 o superior.
- npm.
- Un proyecto Supabase con PostgreSQL, Auth y Storage habilitados.

## Configuración local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`.
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: credenciales del proyecto Supabase.
   - `DATABASE_URL`: conexión del pooler de Supabase para la aplicación.
   - `DIRECT_URL`: conexión directa PostgreSQL para migraciones.

3. Genera el cliente de Prisma y aplica las migraciones en una base local/de desarrollo:

   ```bash
   npm run db:generate
   npm run db:migrate:dev
   ```

   Las migraciones no se ejecutan contra producción durante el desarrollo. En
   producción, tras revisar y desplegar cada migración, se usa
   `npm run db:migrate:deploy`. La fundación enlaza `users.id` con `auth.users`
   y crea el perfil mínimo mediante trigger. Las tablas CRM nuevas tienen RLS
   habilitado y las operaciones se realizan en el servidor con Prisma y controles
   de autorización por rol.

4. Crea usuarios en Supabase Auth y asigna sus roles insertando filas en `user_roles`.
   La migración crea automáticamente la fila base de `users` al crear un usuario
   de Supabase. Los roles disponibles son `owner`, `sales`, `operations`,
   `crew_leader`, `finance` y `viewer`. Por ejemplo, para asignar el rol inicial:

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<supabase-auth-user-uuid>'::uuid, 'owner');
   ```

5. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000/login](http://localhost:3000/login). El endpoint
   de disponibilidad de la aplicación es [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate:dev
npm run db:migrate:deploy
npm run db:studio
```

## Fase 2 — CRM Comercial

Las pantallas disponibles para usuarios autorizados son clientes, oportunidades,
pipeline y actividades. Los roles `owner` y `sales` pueden gestionar clientes y
oportunidades; `owner`, `sales`, `operations` y `finance` pueden gestionar
actividades. `viewer` tiene acceso de lectura. Las referencias de responsable
usan el UUID de usuario de Supabase Auth.

La migración `20261105182000_fase2_crm_comercial` crea únicamente las tablas,
índices, relaciones y tipos necesarios para clientes, oportunidades y
actividades. Para aplicarla en desarrollo, después de configurar las variables
de entorno:

```bash
npm run db:generate
npm run db:migrate:dev
```

Para un despliegue controlado, revisa primero la migración SQL y luego ejecuta
`npm run db:migrate:deploy`. No se crean tablas de cotizaciones, obras,
cuadrillas ni pagos. La oportunidad solo puede marcarse como ganada por un
`owner` mientras no haya cotizaciones; se exige motivo y se registra en
`audit_logs`.

## Supabase y Vercel

- En Supabase, configura Auth para permitir correo y contraseña. Añade
  `http://localhost:3000/auth/callback` como URL de redirección local.
- Supabase Storage queda disponible mediante la configuración del cliente; no
  se crean buckets ni flujos de archivos en esta fase.
- En Vercel, importa el repositorio y configura las mismas variables de entorno
  para cada ambiente. Usa la URL del pooler en `DATABASE_URL` y la conexión
  directa en `DIRECT_URL`.
- Ejecuta las migraciones de forma controlada desde un entorno seguro con
  `npm run db:migrate:deploy`; no expongas credenciales en el repositorio.
- Configura en Supabase Auth las URL de callback de cada ambiente Vercel.

## Documentación de producto y arquitectura

Consulta [`Docs/00-indice.md`](./Docs/00-indice.md) y los documentos enlazados
desde allí para conocer las reglas y decisiones de producto.