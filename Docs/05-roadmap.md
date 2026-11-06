# 05 — Roadmap

## 1. Estrategia

El sistema se construirá en fases incrementales.

Cada fase debe terminar con una versión funcional y demostrable.

La prioridad es siempre:

```text
Vender → Ejecutar → Cobrar
```

## 2. Fase 1 — Fundación

**Estado actual:** Validada localmente con Supabase real según las pruebas
confirmadas por el usuario (login, dashboard autenticado, roles, logout,
recuperación de contraseña y conexión de base de datos). Vercel ya está
conectado y el usuario informó un primer despliegue `Ready` desde el commit
inicial `6197dba` en https://crm-agentico-tau.vercel.app/. El despliegue existe,
pero login, Supabase, roles y recuperación todavía no se han probado en ese
dominio; no se declara validado funcionalmente.

**Objetivo:**  
Dejar la base técnica funcionando.

**Alcance:**

- Repositorio GitHub.
- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Prisma.
- PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Login.
- Roles.
- Estructura modular.
- Configuración de ambientes.

**Entregable:**  
Sistema funcionando con autenticación, roles y base de datos conectada.

**Criterio de cierre:**

- [x] Un usuario puede iniciar sesión y acceder al dashboard autenticado.
- [x] Los roles están definidos y el usuario owner fue validado en local.
- [x] La base de datos de Fundación está migrada y conectada.
- [x] Vercel conectado y primer despliegue con estado `Ready` (informado por el usuario).
- [ ] Validar login, Supabase, roles y recuperación desde el dominio Vercel.

## 3. Fase 2 — CRM Comercial

**Estado actual:** Funcionalmente validada en local según las pruebas manuales
confirmadas por el usuario; la migración está aplicada al proyecto Supabase de
destino. El usuario confirmó creación
de clientes (incluido un segundo), oportunidades, tareas y actividades,
actividades críticas y uso general positivo de las pantallas. Después confirmó
como correctos el historial separado por cliente, persistencia de ediciones y
cambios de etapa, motivos obligatorios de pérdida/cancelación, resultado
obligatorio al completar actividades, actividad crítica visible en dashboard y
filtros de hoy/vencidas. Estos son resultados manuales informados por el usuario,
no pruebas ejecutadas por el asistente. El usuario también confirmó acceso de
lectura y bloqueos visibles de UI/rutas con una cuenta de rol único `viewer`.
La prueba directa de rechazo de Server Action sigue pendiente y no está marcada
como ejecutada. Existe un despliegue inicial `Ready` en Vercel, pero la
funcionalidad de Fase 2 no se ha validado en ese dominio. El commit desplegado
`6197dba` es el commit inicial y no incluye las modificaciones locales posteriores
de Fase 2.

**Pendiente de QA de autorización:** rechazo directo de una Server Action no
autorizada mediante UUID inexistente. El 2026-11-05 se comprobó que la cuenta
de prueba no tenía roles; tras autorización explícita se asignó únicamente
`viewer` y una consulta posterior confirmó esa asignación. El usuario confirmó
manualmente que dashboard muestra `viewer`, las pantallas
Clientes, Oportunidades, Pipeline y Actividades son legibles, no aparecen
controles de escritura, las rutas directas de creación/edición rechazan acceso,
y no puede cambiar etapas ni completar/cancelar actividades. Esto no demuestra
por sí solo el rechazo de las Server Actions. No se modificó la cuenta owner ni
se crearon registros CRM. Los permisos de `operations`, `finance` y otros roles
no se han probado.

**Objetivo:**  
Digitalizar el proceso comercial inicial.

**Alcance:**

- Clientes.
- Oportunidades.
- Actividades.
- Pipeline comercial.
- Seguimientos.
- Orígenes de lead.

**Entregable:**  
Proceso comercial completo desde consulta hasta oportunidad gestionada.

**Criterio de cierre:**

- [x] Se confirmó manualmente la creación de clientes, oportunidades y
  actividades en local; también el uso general de las pantallas.
- [x] El usuario confirmó historial separado entre clientes, persistencia de
  ediciones y cambios de etapa, motivos obligatorios de pérdida/cancelación,
  resultado obligatorio al completar actividades, actividad crítica en el
  dashboard y filtros de hoy/vencidas.
- [x] El usuario confirmó la validación manual de lectura y denegación en
  controles/rutas de UI con la cuenta `viewer`.
- [ ] (Pendiente, no ejecutado) Comprobar directamente el rechazo de
  `updateOpportunityAction` con `viewer` y UUID inexistente. El código aplica
  `requireRoles` antes de validar
  el formulario o consultar/escribir oportunidades; esta prueba propuesta no se
  ha ejecutado y no valida otras acciones ni otros roles.

La Fase 2 está funcionalmente validada en local según las pruebas manuales
confirmadas. La comprobación de Server Action y la validación funcional del
despliegue Vercel siguen pendientes; ninguna de las dos se declara realizada.

## 4. Fase 3 — Cotizaciones

**Estado actual:** El código de cotizaciones y del registro inicial de obra está
implementado localmente y sus comprobaciones estáticas/build pasan. La nueva
migración `20261105211747_fase3_cotizaciones` está preparada como archivo, pero
no se ha aplicado. La base configurada sigue teniendo únicamente las dos
migraciones anteriores aplicadas. La fase no está cerrada: falta autorización y
aplicación controlada de la migración, y faltan las pruebas manuales del flujo
completo. No se insertaron datos de prueba.

El código y la migración de Fase 3 siguen sin subir a `main`/GitHub. Como los
push a `main` pueden desplegar automáticamente en Vercel, no publicar el código
hasta coordinarlo con la aplicación controlada de la migración; de lo contrario,
las pantallas podrían consultar tablas todavía inexistentes.

**Objetivo:**  
Cerrar el ciclo comercial.

**Alcance:**

- Crear desde oportunidad abierta; buscar, consultar y editar borradores.
- Registrar manualmente el envío y descargar el PDF, sin correo ni mensajes.
- Aprobar, rechazar, anular y marcar vencida con reglas de servidor.
- Calcular margen bruto comercial como precio bruto menos costo bruto.
- Convertir manualmente una cotización aprobada en obra inicial programada,
  con dirección y comuna confirmadas y snapshot comercial.
- Registrar actor/fecha y auditar transiciones relevantes.

No incluye planificación, fechas de ejecución, responsable operativo,
cuadrillas, asignaciones, avances, incidencias, cambios operacionales, pagos,
anticipos recibidos, saldos ni cobranza.

**Entregable:**  
Proceso comercial cerrado.

**Criterio de cierre:**

- [x] El flujo, los servicios, las rutas, el PDF descargable y la conversión
  transaccional están implementados en código local.
- [x] `npm run lint`, `npm run typecheck`, `npm run build` y
  `npx prisma validate` pasan.
- [x] La migración nueva está revisada como archivo y es la única migración
  pendiente; no se ha aplicado.
- [ ] Aplicar la migración a Supabase, únicamente tras autorización separada.
- [ ] Probar manualmente creación, edición, validaciones y margen.
- [ ] Probar envío registrado y descarga PDF sin comunicaciones reales.
- [ ] Probar rechazo, anulación y vencimiento, incluida la frontera de
  `America/Santiago`.
- [ ] Probar aprobación, cierre de oportunidad y anulación/auditoría de otras
  propuestas abiertas.
- [ ] Probar conversión, coherencia de cliente, snapshot e idempotencia ante
  segunda solicitud.
- [ ] Probar con viewer el acceso de lectura y rechazo de cada acción de
  escritura en servidor.
- [ ] Regresar Fases 1 y 2 tras aplicar la migración.

No se ejecutaron pruebas manuales con registros ni acciones directas del usuario
en esta implementación. La prueba directa de Server Action de Fase 2 y la
validación funcional del despliegue Vercel siguen pendientes. Existe un primer
despliegue `Ready`, informado por el usuario, del commit `6197dba`.

## 5. Fase 4 — Operación

**Objetivo:**  
Controlar la ejecución en terreno.

**Alcance:**

- Obras.
- Cuadrillas.
- Asignaciones.
- Calendario.
- Avances.
- Fotos.
- Incidencias básicas.
- Cambios de alcance.

**Entregable:**  
Control operacional.

**Criterio de cierre:**

- Una obra puede crearse desde una cotización aprobada.
- Una cuadrilla puede asignarse a una obra.
- El calendario muestra asignaciones.
- Se pueden registrar avances y fotos.
- Se pueden registrar incidencias y cambios de alcance.

## 6. Fase 5 — Finanzas

**Objetivo:**  
Controlar el dinero de cada obra.

**Alcance:**

- Anticipos.
- Pagos.
- Pagos parciales.
- Adicionales.
- Saldos.
- Cobranza.
- Pagos vencidos.

**Entregable:**  
Control financiero.

**Criterio de cierre:**

- Se puede registrar un anticipo.
- Se puede registrar un pago final.
- Se puede registrar un adicional.
- El saldo pendiente se calcula automáticamente.
- La cobranza muestra pagos pendientes y vencidos.

## 7. Fase 6 — Optimización

**Objetivo:**  
Estabilizar la versión productiva.

**Alcance:**

- Dashboard final.
- Reportes básicos.
- Auditoría.
- Métricas.
- Mejoras de UX.
- Manejo de errores.
- Respaldos.
- Monitoreo.

**Entregable:**  
Versión productiva estable.

**Criterio de cierre:**

- El dueño puede operar el sistema diariamente.
- El dashboard muestra acciones prioritarias.
- Los reportes básicos están disponibles.
- Los respaldos están configurados.
- Los errores están monitoreados.

## 8. Futuro

Estas capacidades quedan fuera del MVP y deben evaluarse después de la Fase 6.

### IA

- Agente comercial.
- Agente cotizador.
- Agente de planificación.
- Agente de cobranza.
- Automatización de seguimiento.

### Comunicación

- WhatsApp.
- Notificaciones.
- Recordatorios automáticos.

### ERP

- Materiales.
- Compras.
- Proveedores.
- Inventario.
- Consumo por obra.
- Facturación electrónica.

## 9. Orden de prioridad

```text
1. Fundación
2. CRM Comercial
3. Cotizaciones
4. Operación
5. Finanzas
6. Optimización
7. IA y automatizaciones
8. ERP
```

Ninguna fase posterior debe iniciarse sin cerrar los criterios de la fase anterior.