# 05 — Roadmap

## 1. Estrategia

El sistema se construirá en fases incrementales.

Cada fase debe terminar con una versión funcional y demostrable.

La prioridad es siempre:

```text
Vender → Ejecutar → Cobrar
```

## 2. Fase 1 — Fundación

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

- Un usuario puede iniciar sesión.
- Los roles están definidos.
- La base de datos está migrada.
- El proyecto se despliega correctamente.

## 3. Fase 2 — CRM Comercial

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

- Un lead puede registrarse.
- Una oportunidad puede avanzar por etapas.
- Una actividad puede crearse y completarse.
- El pipeline muestra oportunidades por etapa.

## 4. Fase 3 — Cotizaciones

**Objetivo:**  
Cerrar el ciclo comercial.

**Alcance:**

- Crear cotizaciones.
- Enviar cotizaciones.
- Aprobar cotizaciones.
- Rechazar cotizaciones.
- Vencer cotizaciones.
- Calcular margen estimado.
- Convertir cotización aprobada en obra.

**Entregable:**  
Proceso comercial cerrado.

**Criterio de cierre:**

- Una cotización puede crearse y enviarse.
- Una cotización puede aprobarse o rechazarse.
- Una cotización aprobada puede generar una obra.
- El margen estimado se calcula automáticamente.

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