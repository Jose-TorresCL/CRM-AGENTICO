# ADR-001 — Monolito Modular

## Estado

Aceptado.

## Contexto

El sistema será construido inicialmente por una sola persona. El negocio requiere
velocidad de desarrollo, simplicidad operativa y mantenibilidad.

## Decisión

Se implementará un monolito modular con Next.js.

## Consecuencias

### Positivas

- Menor complejidad.
- Un solo despliegue.
- Desarrollo más rápido.
- Más fácil de depurar.
- Menor costo operativo.

### Negativas

- Requiere disciplina para mantener límites entre módulos.
- Escalar a microservicios requeriría refactorización posterior.