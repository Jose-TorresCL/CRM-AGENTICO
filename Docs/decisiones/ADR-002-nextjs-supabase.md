# ADR-002 — Next.js + Supabase

## Estado

Aceptado.

## Contexto

Se requiere una arquitectura simple, rápida de desarrollar y fácil de mantener
por una sola persona.

## Decisión

Se usará Next.js como framework fullstack y Supabase como proveedor de
PostgreSQL, autenticación y almacenamiento.

## Consecuencias

### Positivas

- Un solo proyecto para frontend y backend.
- Autenticación lista para producción.
- Base de datos relacional administrada.
- Almacenamiento de archivos integrado.
- Despliegue simple en Vercel.

### Negativas

- Dependencia parcial de Supabase.
- Requiere buenas prácticas para evitar acoplamiento con el proveedor.