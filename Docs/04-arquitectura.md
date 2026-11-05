# 04 — Arquitectura Técnica

## 1. Principios

- Monolito modular.
- Un repositorio.
- Una base de datos.
- Un despliegue.
- Simplicidad antes que sofisticación.
- Mantenibilidad por una sola persona.
- Reglas de negocio centralizadas.
- Evolución futura sin reescritura.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui |
| Backend | Next.js Server Actions y Route Handlers |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | Supabase Auth |
| Archivos | Supabase Storage |
| Hosting | Vercel |
| Control de versiones | GitHub |
| Monitoreo | Sentry |

## 3. Arquitectura general

```text
Navegador / Móvil
      ↓
Next.js
      ↓
Server Actions / Route Handlers
      ↓
Servicios de dominio
      ↓
Prisma
      ↓
PostgreSQL
      ↓
Supabase Storage
```

## 4. Estilo arquitectónico

El sistema es un **monolito modular**.

- Un solo repositorio.
- Un solo despliegue.
- Una sola base de datos.
- Módulos internos con límites claros.
- Sin microservicios.
- Sin colas distribuidas.
- Sin múltiples bases de datos.

## 5. Módulos

```text
src/modules/
├── auth/
├── clients/
├── opportunities/
├── quotes/
├── works/
├── crews/
├── payments/
├── activities/
├── dashboard/
└── files/
```

Cada módulo debe contener:

```text
components/
services/
repositories/
schemas/
types.ts
```

Reglas:

- La UI no contiene reglas de negocio.
- Los servicios de dominio contienen reglas y transiciones.
- Los repositorios acceden a la base de datos.
- Los módulos no importan repositorios de otros módulos.
- Los componentes reutilizables van en `src/shared`.

## 6. Estructura de carpetas

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── recuperar-clave/
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── clientes/
│   │   ├── oportunidades/
│   │   ├── cotizaciones/
│   │   ├── obras/
│   │   ├── cuadrillas/
│   │   ├── planificacion/
│   │   ├── cobranza/
│   │   ├── actividades/
│   │   └── configuracion/
│   └── api/
│       ├── health/
│       └── webhooks/
├── modules/
├── shared/
└── server/
```

## 7. Modelo de datos

```text
Cliente → Oportunidad → Cotización → Obra → Pago
Obra ↔ Cuadrilla
Actividad ↔ Cliente
Actividad ↔ Oportunidad
Actividad ↔ Obra
```

Tablas principales:

- users
- clients
- opportunities
- quotes
- works
- crews
- work_crew_assignments
- payments
- activities
- attachments
- audit_logs

## 8. Reglas de integridad

- Todas las relaciones críticas usan foreign keys.
- Todos los estados usan enums.
- Toda tabla tiene `created_at` y `updated_at`.
- Los montos se almacenan como enteros o decimal preciso, nunca float.
- Las fechas se almacenan en UTC.
- La zona horaria de presentación es `America/Santiago`.
- No se permite borrado físico de información comercial o financiera.
- Las migraciones se ejecutan con Prisma Migrate.

## 9. API

Se usará:

- Server Actions para operaciones internas.
- Route Handlers solo para health check, webhooks futuros e integraciones externas.

Operaciones principales:

```text
clients.create
clients.update
clients.list

opportunities.create
opportunities.updateStage
opportunities.close

quotes.create
quotes.send
quotes.approve
quotes.reject
quotes.convertToWork

works.create
works.assignCrew
works.updateProgress
works.complete
works.close

crews.create
crews.assignToWork

payments.create
payments.registerPartialPayment
payments.annul

activities.create
activities.complete
activities.cancel
```

## 10. Autenticación y autorización

- Supabase Auth para login por correo y contraseña.
- Roles: owner, sales, operations, crew_leader, finance, viewer.
- Autorización en dos niveles:
  - Aplicación: Server Actions y Route Handlers.
  - Base de datos: Row Level Security.

## 11. Archivos

Todo archivo debe asociarse a una entidad:

- Cliente.
- Oportunidad.
- Cotización.
- Obra.
- Pago.
- Actividad.

Tipos permitidos:

- Fotos.
- PDF.
- Comprobantes.
- Documentos.

Reglas:

- Límite de tamaño por archivo.
- Compresión o redimensionamiento de imágenes.
- Acceso mediante URL firmada.
- Registro de usuario y fecha de carga.

## 12. Despliegue

| Ambiente | Propósito | Rama |
|---|---|---|
| Local | Desarrollo | feature/* |
| Staging | Validación | develop |
| Producción | Uso real | main |

Flujo:

```text
feature branch → Pull Request → main → Vercel → Producción
```

Reglas:

- `main` siempre debe estar desplegable.
- Las migraciones se ejecutan de forma controlada.
- No se permiten cambios manuales al esquema en producción.
- Los secretos nunca se suben al repositorio.
- Respaldo diario de base de datos con retención mínima de 30 días.