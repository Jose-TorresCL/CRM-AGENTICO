# 03 — Business Requirements Document

## 1. Información del documento

| Campo | Valor |
|---|---|
| Proyecto | CRM Operativo para Revestimiento de Piscinas |
| Versión | 1.1 |
| Estado | Aprobado; decisiones de Fase 3 confirmadas |
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

El alcance general del MVP está secuenciado por fases. La implementación actual
de Fase 3 se limita a cotizaciones y al registro inicial de obra descrito en
este documento; obras operativas, cuadrillas, planificación y finanzas quedan
para fases posteriores.

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
- numero único anual (`QUO-AAAA-000001`)
- oportunidad_id
- cliente_id
- fecha_emision
- fecha_vencimiento
- estado
- alcance
- tipo_revestimiento
- superficie_estimada
- unidad_superficie
- precio_total
- costo_estimado
- margen_estimado
- anticipo_requerido
- plazo_estimado_dias
- condiciones
- exclusiones
- registro de envío y sus actores/fechas
- fecha_aprobacion
- motivo_rechazo
- motivo_anulacion

El PDF se genera al descargar y no se conserva como adjunto ni se transmite
desde el sistema.

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
- cotizacion_id
- cliente_id
- direccion
- comuna
- estado
- alcance aprobado
- tipo_revestimiento
- superficie y unidad
- valor_contratado
- costo y margen estimados como snapshot comercial
- anticipo_requerido (condición; no dinero recibido)
- plazo_estimado_dias_habiles
- condiciones y exclusiones aprobadas

En Fase 3, la obra inicial solo se crea desde una cotización aprobada y queda
en estado `programada`. Se solicita y confirma dirección y comuna al convertir.
No se inventan código de obra, fechas de planificación ni responsable
operativo. Fechas de planificación, responsable operativo, cuadrillas,
ejecución, pagos y cobranza pertenecen a fases posteriores.

Estados:

- programada
- en_preparacion
- en_ejecucion
- pausada
- terminada
- cobrada
- cerrada
- cancelada

Fase 3 implementa únicamente `programada`; los demás estados operativos se
reservan para fases posteriores.

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
4. Calcular margen estimado bruto en servidor.
5. Descargar el PDF si corresponde y registrar manualmente el envío.
6. El sistema no envía correo ni mensajería.

### CU-04 — Aprobar cotización y crear obra

1. Aprobar cotización.
2. La oportunidad se marca ganada en la misma transacción.
3. Las otras propuestas abiertas de esa oportunidad se anulan con motivo y
   auditoría.
4. Confirmar dirección y comuna y crear manualmente el registro inicial de obra
   en estado `programada`.
5. Heredar el snapshot comercial aprobado.

La creación de obra no registra anticipos recibidos, pagos ni actividades de
cobranza; esos flujos no pertenecen a Fase 3.

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
La fecha de vencimiento es inclusiva hasta las 23:59 de `America/Santiago`.
Una acción de aprobación posterior registra la cotización como vencida y la
rechaza; se debe crear una nueva propuesta para continuar.

### RN-08
Toda obra inicial de Fase 3 debe estar asociada a un cliente y a una cotización
aprobada; no existe excepción de conversión en esta fase.

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

### Decisiones confirmadas para Fase 3

- Los importes se expresan en CLP y precio/costo son montos brutos con IVA. El
  margen se calcula como `precio_total - costo_estimado`; es una estimación
  comercial bruta, no utilidad neta contable.
- El anticipo requerido es un monto fijo en CLP entre cero y el precio total.
  Es una condición de la cotización, no un pago recibido.
- La numeración es anual y secuencial: `QUO-AAAA-000001`.
- “Enviar” solo registra fecha y actor de forma manual. El PDF se genera para
  descarga; no hay correo, WhatsApp, mensajería ni archivo asociado en Storage.
- Un borrador se puede editar. Una cotización enviada es inmutable; los cambios
  requieren un nuevo borrador y la anterior puede anularse con motivo. No hay
  borrado físico.
- Owner y sales pueden crear, editar borradores, registrar envío, aprobar,
  rechazar, anular, vencer y convertir. Operations, finance, crew_leader y
  viewer mantienen lectura solamente en cotizaciones y obras iniciales.
- Una oportunidad puede tener varias propuestas, pero solo una puede aprobarse.
  La aprobación marca la oportunidad ganada y anula automáticamente las demás
  cotizaciones en borrador o enviadas, con motivo y auditoría. Rechazar una
  propuesta no cambia la etapa/estado de la oportunidad.
- La excepción existente para que solo owner gane una oportunidad sin
  cotización aprobada se conserva sin cambios y mantiene su auditoría.
- La obra inicial requiere dirección y comuna confirmadas; conserva alcance,
  tipo, superficie, valores comerciales, anticipo requerido, plazo y condiciones
  aprobadas. No requiere fecha de inicio ni responsable operativo en esta fase.
- La conversión es transaccional y una cotización solo puede generar una obra.
  Los valores aprobados y el snapshot comercial de la obra son inmutables.
- Esta fase no implementa planificación, cuadrillas, asignaciones, avances,
  incidencias, cambios de alcance operacionales, pagos, anticipos recibidos,
  saldos ni cobranza.

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