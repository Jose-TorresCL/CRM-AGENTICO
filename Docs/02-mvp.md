# 02 — MVP

## 1. Objetivo del MVP

Construir un CRM operativo mínimo que permita controlar ventas, ejecución y cobranza.

El MVP debe entregar el 80% del valor con el 20% de la complejidad.

## 2. Regla principal

El MVP debe responder siempre:

1. ¿Quién es el cliente?
2. ¿En qué etapa está la venta?
3. ¿Qué se cotizó?
4. ¿Qué obra se está ejecutando?
5. ¿Qué cuadrilla está trabajando?
6. ¿Cuánto se cobró?
7. ¿Cuánto falta cobrar?

## 3. Entidades MVP

| Entidad | Propósito |
|---|---|
| Cliente | Representa al comprador |
| Oportunidad | Representa una posible venta |
| Cotización | Representa la propuesta comercial enviada |
| Obra | Representa el trabajo aprobado y programado |
| Cuadrilla | Representa el equipo que ejecuta la obra |
| Pago | Representa dinero esperado o recibido |
| Actividad | Representa llamadas, visitas, seguimientos y tareas |

## 4. Flujo principal

```text
Cliente → Oportunidad → Cotización → Obra → Cuadrilla → Pago
```

Relaciones complementarias:

```text
Obra ↔ Cuadrilla
Actividad ↔ Cliente
Actividad ↔ Oportunidad
Actividad ↔ Obra
```

## 5. Alcance incluido

- Gestión de clientes.
- Gestión de oportunidades.
- Pipeline comercial.
- Actividades y seguimientos.
- Creación, envío, aprobación y rechazo de cotizaciones.
- Conversión de cotización aprobada en obra.
- Gestión de obras.
- Asignación de cuadrillas.
- Calendario de planificación.
- Registro de avance y fotos.
- Registro de anticipos, pagos y saldos.
- Cobranza básica.
- Dashboard operativo.

## 6. Fuera de alcance MVP

- Inventario.
- Stock.
- Compras.
- Proveedores.
- Garantías formales.
- Postventa avanzada.
- IA agéntica.
- WhatsApp automatizado.
- Facturación electrónica.
- Integración contable.
- App nativa.
- Multiempresa.

## 7. Reglas esenciales

1. Toda oportunidad debe pertenecer a un cliente.
2. Toda cotización debe pertenecer a una oportunidad.
3. Solo una cotización aprobada puede generar una obra.
4. Toda obra debe pertenecer a un cliente.
5. Una obra puede tener una o más cuadrillas asignadas.
6. Todo pago debe estar asociado a una obra.
7. Una obra no debe iniciar sin anticipo, salvo excepción autorizada.
8. El saldo pendiente debe calcularse automáticamente.
9. No se permite borrado físico de información comercial o financiera.
10. Las transiciones de estado deben validarse en el backend.

## 8. Definición de listo

El MVP está listo cuando el dueño puede:

1. Registrar una consulta desde WhatsApp.
2. Crear una oportunidad.
3. Agendar una visita.
4. Crear y enviar una cotización.
5. Aprobar la cotización.
6. Crear la obra.
7. Asignar una cuadrilla.
8. Registrar avance y fotos.
9. Registrar anticipo y pago final.
10. Ver cuánto falta por cobrar.