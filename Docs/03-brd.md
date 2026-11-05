# 03 — Business Requirements Document

## 1. Información del documento

| Campo | Valor |
|---|---|
| Proyecto | CRM Operativo para Revestimiento de Piscinas |
| Versión | 1.0 |
| Estado | Aprobado |
| Alcance | MVP |
| Audiencia | Equipo de desarrollo, QA y producto |

## 2. Objetivos

### OBJ-01
Centralizar clientes, oportunidades, cotizaciones, obras, cuadrillas y pagos.

### OBJ-02
Reducir la pérdida de leads mediante seguimiento estructurado.

### OBJ-03
Controlar cotizaciones, precios, costos estimados y márgenes.

### OBJ-04
Conectar ventas con ejecución mediante la conversión de cotización aprobada en obra.

### OBJ-05
Planificar cuadrillas y visualizar su disponibilidad.

### OBJ-06
Controlar anticipos, pagos, adicionales y saldos pendientes.

### OBJ-07
Reducir la dependencia operativa del dueño.

## 3. Alcance

### Dentro del alcance

- Clientes.
- Oportunidades.
- Actividades.
- Pipeline comercial.
- Cotizaciones.
- Obras.
- Cuadrillas.
- Calendario de planificación.
- Pagos y cobranza.
- Dashboard operativo.
- Adjuntos: fotos, PDF y comprobantes.
- Roles y permisos.

### Fuera del alcance

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

## 4. Entidades

### Cliente

Representa al comprador.

Campos mínimos:

- id
- nombre
- telefono
- whatsapp
- email
- comuna
- direccion
- tipo_cliente
- estado
- notas
- created_at
- updated_at

### Oportunidad

Representa una posible venta.

Campos mínimos:

- id
- cliente_id
- origen
- tipo_servicio
- comuna
- etapa
- valor_estimado
- fecha_estimada_cierre
- responsable_id
- motivo_perdida
- proxima_accion
- fecha_proxima_accion
- estado
- notas

Estados:

- nuevo
- contactado
- visita_agendada
- cotizado
- negociacion
- ganado
- perdido

### Cotización

Representa la propuesta comercial.

Campos mínimos:

- id
- numero
- oportunidad_id
- cliente_id
- fecha_emision
- fecha_vencimiento
- estado
- tipo_revestimiento
- superficie_estimada
- precio_total
- costo_estimado
- margen_estimado
- anticipo_requerido
- plazo_estimado_dias
- condiciones
- exclusiones
- documento_url
- fecha_aprobacion
- motivo_rechazo

Estados:

- borrador
- enviada
- aprobada
- rechazada
- vencida
- anulada

### Obra

Representa el trabajo aprobado.

Campos mínimos:

- id
- codigo
- cotizacion_id
- cliente_id
- direccion
- comuna
- estado
- fecha_inicio_comprometida
- fecha_termino_estimada
- fecha_inicio_real
- fecha_termino_real
- valor_contratado
- anticipo_recibido
- adicionales_aprobados
- costo_real_estimado
- saldo_pendiente
- responsable_operativo_id
- tipo_revestimiento
- superficie
- materiales_principales
- observaciones
- garantia_hasta

Estados:

- programada
- en_preparacion
- en_ejecucion
- pausada
- terminada
- cobrada
- cerrada
- cancelada

### Cuadrilla

Representa el equipo operativo.

Campos mínimos:

- id
- nombre
- estado
- jefe_cuadrilla
- integrantes
- capacidad_obras_simultaneas
- zona_habitual
- observaciones

Estados:

- disponible
- asignada
- en_obra
- inactiva

### Pago

Representa dinero esperado o recibido.

Campos mínimos:

- id
- obra_id
- cliente_id
- tipo
- monto_esperado
- monto_pagado
- fecha_esperada
- fecha_pago
- medio_pago
- estado
- comprobante_url
- referencia
- notas

Tipos:

- anticipo
- avance
- saldo_final
- adicional

Estados:

- pendiente
- parcial
- pagado
- vencido
- anulado

### Actividad

Representa tareas y seguimientos.

Campos mínimos:

- id
- tipo
- asunto
- descripcion
- fecha_hora
- responsable_id
- estado
- prioridad
- cliente_id
- oportunidad_id
- cotizacion_id
- obra_id
- resultado

Tipos:

- llamada
- whatsapp
- visita_tecnica
- seguimiento
- coordinacion
- cobranza
- incidencia
- cambio_alcance
- otro

Estados:

- pendiente
- en_curso
- completada
- cancelada

## 5. Casos de uso

### CU-01 — Registrar consulta desde WhatsApp

1. Crear o buscar cliente.
2. Crear oportunidad con origen WhatsApp.
3. Registrar tipo de servicio y comuna.
4. Crear actividad de seguimiento.

### CU-02 — Agendar visita técnica

1. Abrir oportunidad.
2. Crear actividad tipo visita técnica.
3. Definir fecha, hora y responsable.
4. Registrar resultado, medidas y fotos.

### CU-03 — Crear cotización

1. Abrir oportunidad.
2. Crear cotización en borrador.
3. Ingresar precio, costo, anticipo y plazo.
4. Calcular margen.
5. Enviar cotización.
6. Crear seguimiento.

### CU-04 — Aprobar cotización y crear obra

1. Aprobar cotización.
2. Crear obra desde cotización.
3. Heredar datos comerciales y técnicos.
4. Crear actividad para cobrar anticipo.

### CU-05 — Registrar anticipo

1. Abrir obra.
2. Crear pago tipo anticipo.
3. Registrar monto, fecha y comprobante.
4. Actualizar saldo pendiente.

### CU-06 — Asignar cuadrilla

1. Abrir obra.
2. Seleccionar cuadrilla disponible.
3. Definir fechas.
4. Crear actividades de coordinación.

### CU-07 — Registrar avance

1. Abrir obra.
2. Registrar avance, actividades y observaciones.
3. Adjuntar fotos.
4. Registrar incidencias si corresponden.

### CU-08 — Registrar cambio de alcance

1. Crear actividad tipo cambio de alcance.
2. Registrar descripción y monto.
3. Registrar aprobación del cliente.
4. Actualizar adicionales aprobados y saldo.

### CU-09 — Cerrar obra y cobrar saldo

1. Registrar término de obra.
2. Revisar evidencia y pendientes.
3. Marcar obra como terminada.
4. Registrar pago final.
5. Marcar obra como cobrada y cerrada.

### CU-10 — Crear oportunidad de postventa

1. Abrir cliente con obra cerrada.
2. Crear nueva oportunidad.
3. Definir tipo mantención o reparación.
4. Crear seguimiento.

## 6. Reglas de negocio

### RN-01
Toda oportunidad debe tener cliente, origen, etapa y responsable.

### RN-02
Una oportunidad no puede marcarse como ganada sin cotización aprobada, salvo excepción autorizada.

### RN-03
Una oportunidad perdida debe registrar motivo.

### RN-04
Toda cotización debe tener número único.

### RN-05
El margen estimado se calcula así:

```text
margen_estimado = precio_total - costo_estimado
```

### RN-06
Solo una cotización en estado aprobada puede generar obra.

### RN-07
Una cotización vencida no puede aprobarse sin regeneración o extensión explícita.

### RN-08
Toda obra debe estar asociada a un cliente y a una cotización aprobada, salvo excepción autorizada.

### RN-09
Una obra no puede pasar a ejecución sin anticipo registrado, salvo autorización explícita.

### RN-10
El saldo pendiente se calcula así:

```text
saldo_pendiente =
  valor_contratado
  + adicionales_aprobados
  - total_pagos_recibidos
```

### RN-11
Una obra no puede cerrarse con saldo pendiente, salvo autorización explícita.

### RN-12
Una cuadrilla no puede exceder su capacidad de obras simultáneas.

### RN-13
Todo pago debe estar asociado a una obra.

### RN-14
No se permite borrado físico de registros comerciales o financieros.

### RN-15
Las transiciones de estado deben validarse en el backend.

## 7. Pantallas

| Pantalla | Objetivo |
|---|---|
| Login | Autenticar usuarios |
| Dashboard | Mostrar acciones prioritarias |
| Pipeline | Visualizar oportunidades por etapa |
| Clientes | Gestionar clientes e historial |
| Oportunidades | Gestionar ventas |
| Cotizaciones | Gestionar propuestas |
| Obras | Controlar ejecución |
| Planificación | Asignar cuadrillas |
| Cobranza | Controlar pagos y saldos |
| Actividades | Gestionar tareas |
| Configuración | Administrar usuarios, roles y catálogos |

## 8. Roles

| Rol | Permisos |
|---|---|
| Owner | Acceso completo |
| Comercial | Clientes, oportunidades, cotizaciones y actividades |
| Operaciones | Obras, cuadrillas, planificación y avances |
| Finanzas | Pagos, cobranza y saldos |
| Jefe de cuadrilla | Obras asignadas, avances, fotos e incidencias |
| Viewer | Solo lectura |

## 9. KPIs

### Comerciales

- Leads generados.
- Leads contactados en menos de 24 horas.
- Cotizaciones enviadas.
- Tasa de aprobación de cotizaciones.
- Tasa de cierre.

### Operacionales

- Obras activas.
- Obras terminadas.
- Duración promedio de obra.
- Obras sin cuadrilla asignada.
- Cumplimiento de plazo.

### Financieros

- Anticipos recibidos.
- Pagos pendientes.
- Pagos vencidos.
- Saldo por cobrar.
- Días promedio entre término de obra y pago final.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| Baja adopción | UI simple, dashboard accionable y capacitación |
| Datos incompletos | Campos obligatorios y validaciones |
| Dependencia de WhatsApp | Registro obligatorio de actividades |
| Cotizaciones sin margen | Costo y margen obligatorios |
| Obras sin anticipo | Regla de bloqueo o alerta |
| Cambios no cobrados | Registro obligatorio de cambio de alcance |
| Alcance creciente | MVP como límite formal |