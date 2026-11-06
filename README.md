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

3. Genera el cliente de Prisma:

   ```bash
   npm run db:generate
   ```

   La base Supabase verificada tiene las migraciones de Fundación y Fase 2
   aplicadas. La migración de Fase 3 está preparada y pendiente de autorización;
   no ejecutes `npm run db:migrate:dev` ni `npm run db:migrate:deploy` contra
   ese destino hasta recibir autorización separada. El cliente de Prisma puede
   generarse sin aplicar cambios de esquema.

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

## Estado de las fases

- **Fase 1 — Fundación:** validada localmente con Supabase real (login,
  dashboard autenticado, roles, logout y recuperación de contraseña).
  Vercel está conectado y el usuario informó un primer despliegue `Ready` en
  https://crm-agentico-tau.vercel.app/, del commit inicial `6197dba`.
  Todavía no se validaron desde ese dominio login, Supabase, roles ni
  recuperación de contraseña; por tanto, el despliegue no está validado
  funcionalmente.
- **Fase 2 — CRM Comercial:** funcionalmente validada en local mediante las
  pruebas manuales confirmadas por el usuario; la migración
  `20261105182000_fase2_crm_comercial` está aplicada. El usuario confirmó
  en local la creación de clientes (incluido un segundo cliente), oportunidades, tareas
  y actividades, la creación de actividades críticas y el uso general positivo
  de las pantallas. Posteriormente confirmó también como correctos el historial
  separado por cliente, persistencia de ediciones y etapas, motivos obligatorios
  al perder/cancelar, resultado obligatorio al completar actividades, actividad
  crítica visible en el dashboard y filtros de hoy/vencidas. Son pruebas
  manuales reportadas por el usuario, no ejecutadas por el asistente. La prueba
  directa de rechazo de una Server Action sigue pendiente y no se considera
  realizada. La presencia del despliegue inicial no demuestra validación
  funcional de Fase 2 en Vercel.

### Checklist manual de Fase 2

Resultados confirmados manualmente por el usuario; no ejecutados por el
asistente:

- [x] Historial separado entre los dos clientes.
- [x] Persistencia de ediciones y cambios de etapa después de recargar.
- [x] Motivo obligatorio para perder o cancelar una oportunidad.
- [x] Resultado obligatorio al completar una actividad.
- [x] Actividades críticas visibles en el dashboard.
- [x] Filtros de actividades de hoy y vencidas.
- [x] Con la cuenta de prueba de rol único `viewer`, el usuario confirmó que
  el dashboard muestra ese rol; Clientes, Oportunidades, Pipeline y Actividades
  son legibles; no aparecen controles de creación/edición; y las rutas directas
  de creación/edición rechazan acceso. También confirmó que no puede cambiar
  etapas ni completar/cancelar actividades. Estos resultados fueron probados
  manualmente por el usuario.

Pendiente, aún no confirmado:

- [ ] Comprobar una denegación de escritura en una Server Action usando un UUID
  aleatorio inexistente, nunca un ID de un registro real. La ocultación de
  controles y el rechazo de páginas no prueban por sí solos la seguridad de las
  Server Actions. No compartir cookies, tokens ni credenciales.

Esta revisión no valida los permisos de `operations`, `finance` ni otros roles.
No se reutilizó ni modificó la cuenta owner. No se crearon registros CRM como
parte de la asignación del rol.

**Prueba de Server Action propuesta (no ejecutada):** probar
`updateOpportunityAction` con la sesión `viewer` y un UUID aleatorio para el
campo `id`. En `src/modules/opportunities/actions.ts`, la acción ejecuta
`requireRoles(opportunityWriteRoles)` antes de validar el formulario o llamar a
`editOpportunity`. `viewer` no pertenece a `opportunityWriteRoles`, así que
debe devolver el error de permisos antes del acceso a la oportunidad. El guard
solo valida sesión y lee roles; no hace escrituras. La consulta de la oportunidad
y la actualización condicional ocurren después del guard. La invalidación de
rutas (`revalidatePath`) solo ocurre después de una actualización exitosa.

Procedimiento propuesto, requiere aprobación antes de ejecutarse:

1. En un único perfil de navegador, abre como owner la edición de una oportunidad
   existente, pero no guardes ni envíes el formulario.
2. En otra pestaña del mismo perfil, cierra sesión e inicia sesión como la
   cuenta de prueba `viewer`. No recargues la pestaña de edición que quedó
   abierta.
3. En la pestaña de edición abierta, usa solo datos ficticios en el formulario
   y sustituye los campos `id`, `clienteId` y `responsableId` por UUID aleatorios
   nuevos. No uses ni envíes identificadores reales; no compartas solicitudes,
   cookies, tokens ni capturas con datos sensibles.
4. Envía una sola vez. Resultado esperado: el estado de la acción indica
   “No tienes permisos para realizar esta acción.” El guard no llega a la
   validación, lectura o actualización de oportunidad; no hay escrituras
   auxiliares en esta ruta de rechazo. Si aparece “No se encontró la
   oportunidad”, detente: no es el resultado esperado del guard. No repitas la
   prueba ni cambies de rol; registra el error para investigar.

Esta acción específica no representa pruebas de todas las Server Actions ni de
los permisos de otros roles. Las comprobaciones manuales de interfaz/rutas con
`viewer` sí se consideran funcionalmente confirmadas por el usuario; no
sustituyen esta prueba directa.

### Fase 3 — Cotizaciones y obra inicial

**Estado:** Código implementado localmente; migración preparada, no aplicada.
La Fase 3 no se declara cerrada ni se han ejecutado pruebas manuales de
cotizaciones/obras. No se añadieron datos de prueba, no se modificaron usuarios
ni roles y no se aplicó ninguna migración. Las pantallas de cotizaciones y obras
no se deben validar contra la base actual hasta aplicar la migración autorizada;
las tablas de Fase 3 aún no existen en ese destino.

El código y la migración de Fase 3 aún no están en `main` ni en GitHub. No hacer
push ni redeploy hasta coordinar expresamente el orden de publicación y
aplicación de la migración; un push a `main` puede activar despliegue automático
de código que consulta tablas aún inexistentes.

Decisiones implementadas y documentadas en `Docs/03-brd.md`:

- CLP; precio y costo son montos brutos con IVA. El margen es una estimación
  comercial bruta (`precio - costo`), no utilidad neta contable.
- Anticipo fijo en CLP, limitado al precio, como condición comercial y no como
  dinero recibido.
- Numeración anual `QUO-AAAA-000001`.
- Envío registrado manualmente; PDF generado para descarga, sin correo,
  WhatsApp ni Storage.
- Borradores editables; cotizaciones enviadas inmutables. Una nueva propuesta
  se crea como otro borrador.
- Owner y sales pueden escribir; operations, finance, crew_leader y viewer
  tienen lectura en cotizaciones y obras iniciales.
- Una aprobación gana la oportunidad y anula con motivo/auditoría las otras
  propuestas abiertas. Un rechazo no cambia el estado de la oportunidad.
- Vencimiento inclusivo hasta las 23:59 de `America/Santiago`.
- La conversión requiere dirección/comuna confirmadas y crea solo una obra
  `programada` con snapshot comercial. No incluye fechas, responsable
  operativo, planificación, cuadrillas ni pagos.

**Validación automática ejecutada:**

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npx prisma validate`
- [x] Comprobaciones aisladas de Zod, margen y límite de vencimiento local
  (no requieren conexión ni modifican base).
- [x] `prisma migrate status`: dos migraciones anteriores aplicadas y
  `20261105211747_fase3_cotizaciones` como única pendiente.

**Pendiente de validación:**

- [ ] Aplicar la migración en Supabase (requiere autorización separada).
- [ ] Probar manualmente ciclo de cotización/PDF/estados y obra inicial.
- [ ] Probar idempotencia/concurrencia y bloqueo de cambios del snapshot en base.
- [ ] Probar rechazo de escritura de Server Actions con cuenta `viewer`.
- [ ] Regresión manual de Fases 1 y 2 tras migrar.
- [ ] Despliegue en Vercel.

Las pantallas disponibles para usuarios autorizados son clientes, oportunidades,
pipeline y actividades. Los roles `owner` y `sales` pueden gestionar clientes y
oportunidades; `owner`, `sales`, `operations` y `finance` pueden gestionar
actividades. `viewer` tiene acceso de lectura. Las referencias de responsable
usan el UUID de usuario de Supabase Auth.

La migración `20261105182000_fase2_crm_comercial` crea únicamente las tablas,
índices, relaciones y tipos necesarios para clientes, oportunidades y
actividades. Fundación y Fase 2 están aplicadas en el Supabase verificado. La
migración de Fase 3 agrega cotizaciones y el registro mínimo de obras, y sigue
pendiente. No ejecutes una migración en el destino sin autorización expresa.

```bash
npm run db:generate
npm run db:migrate:dev
```

La nueva migración `20261105211747_fase3_cotizaciones` solo crea las estructuras
de cotizaciones/obra inicial, agrega una clave única compuesta a
`opportunities` para integridad referencial y añade controles de lectura RLS.
No toca `auth.users`, usuarios, roles, auditoría ni las migraciones aplicadas.
No se ejecutó sobre ninguna base. `migrate deploy` aplica todas las migraciones
pendientes, por lo que requiere revisar el destino y autorización previa.
Mientras no exista una cotización aprobada, la excepción vigente permite solo
al `owner` ganar sin cotización, con motivo y auditoría; no fue modificada.

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