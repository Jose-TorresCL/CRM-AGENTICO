# ADR-003 — Modelo de Datos MVP

## Estado

Aceptado.

## Contexto

El negocio requiere controlar clientes, ventas, obras, cuadrillas y cobranza
sin incorporar la complejidad completa de un ERP.

## Decisión

El MVP usará siete entidades:

- Cliente.
- Oportunidad.
- Cotización.
- Obra.
- Cuadrilla.
- Pago.
- Actividad.

## Consecuencias

### Positivas

- Modelo simple y suficiente para operar.
- Cobertura del flujo desde WhatsApp hasta pago final.
- Base clara para agregar inventario, postventa e IA después.

### Negativas

- Propiedad, piscina, visita técnica, garantía y cambio de alcance no serán
  entidades independientes en el MVP.
- Algunos datos quedarán como campos o actividades.