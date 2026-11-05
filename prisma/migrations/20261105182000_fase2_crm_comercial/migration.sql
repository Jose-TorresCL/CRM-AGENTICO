-- CreateEnum
CREATE TYPE "client_type" AS ENUM ('persona_natural', 'empresa', 'condominio', 'otro');

-- CreateEnum
CREATE TYPE "client_status" AS ENUM ('activo', 'inactivo', 'bloqueado');

-- CreateEnum
CREATE TYPE "opportunity_source" AS ENUM ('whatsapp', 'telefono', 'instagram', 'google', 'referido', 'postventa', 'otro');

-- CreateEnum
CREATE TYPE "service_type" AS ENUM ('revestimiento', 'reparacion', 'mantencion', 'otro');

-- CreateEnum
CREATE TYPE "opportunity_stage" AS ENUM ('nuevo', 'contactado', 'visita_agendada', 'cotizado', 'negociacion', 'ganado', 'perdido');

-- CreateEnum
CREATE TYPE "opportunity_status" AS ENUM ('abierta', 'ganada', 'perdida', 'cancelada');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM ('llamada', 'whatsapp', 'visita_tecnica', 'seguimiento', 'coordinacion', 'cobranza', 'incidencia', 'cambio_alcance', 'otro');

-- CreateEnum
CREATE TYPE "activity_status" AS ENUM ('pendiente', 'en_curso', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "activity_priority" AS ENUM ('baja', 'media', 'alta', 'critica');

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(160) NOT NULL,
    "telefono" VARCHAR(40),
    "whatsapp" VARCHAR(40),
    "email" VARCHAR(254),
    "comuna" VARCHAR(120),
    "direccion" VARCHAR(240),
    "tipo_cliente" "client_type" NOT NULL,
    "estado" "client_status" NOT NULL DEFAULT 'activo',
    "notas" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "origen" "opportunity_source" NOT NULL,
    "tipo_servicio" "service_type" NOT NULL,
    "comuna" VARCHAR(120),
    "etapa" "opportunity_stage" NOT NULL DEFAULT 'nuevo',
    "valor_estimado" DECIMAL(14,0),
    "fecha_estimada_cierre" DATE,
    "responsable_id" UUID NOT NULL,
    "motivo_perdida" TEXT,
    "motivo_cancelacion" TEXT,
    "proxima_accion" TEXT,
    "fecha_proxima_accion" TIMESTAMPTZ(6),
    "estado" "opportunity_status" NOT NULL DEFAULT 'abierta',
    "notas" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" "activity_type" NOT NULL,
    "asunto" VARCHAR(180) NOT NULL,
    "descripcion" TEXT,
    "fecha_hora" TIMESTAMPTZ(6) NOT NULL,
    "responsable_id" UUID NOT NULL,
    "estado" "activity_status" NOT NULL DEFAULT 'pendiente',
    "prioridad" "activity_priority" NOT NULL DEFAULT 'media',
    "cliente_id" UUID NOT NULL,
    "oportunidad_id" UUID,
    "resultado" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_nombre_idx" ON "clients"("nombre");

-- CreateIndex
CREATE INDEX "clients_telefono_idx" ON "clients"("telefono");

-- CreateIndex
CREATE INDEX "clients_whatsapp_idx" ON "clients"("whatsapp");

-- CreateIndex
CREATE INDEX "clients_comuna_idx" ON "clients"("comuna");

-- CreateIndex
CREATE INDEX "clients_estado_idx" ON "clients"("estado");

-- CreateIndex
CREATE INDEX "clients_tipo_cliente_idx" ON "clients"("tipo_cliente");

-- CreateIndex
CREATE INDEX "opportunities_cliente_id_idx" ON "opportunities"("cliente_id");

-- CreateIndex
CREATE INDEX "opportunities_etapa_idx" ON "opportunities"("etapa");

-- CreateIndex
CREATE INDEX "opportunities_estado_idx" ON "opportunities"("estado");

-- CreateIndex
CREATE INDEX "opportunities_responsable_id_idx" ON "opportunities"("responsable_id");

-- CreateIndex
CREATE INDEX "opportunities_fecha_proxima_accion_idx" ON "opportunities"("fecha_proxima_accion");

-- CreateIndex
CREATE INDEX "opportunities_origen_idx" ON "opportunities"("origen");

-- CreateIndex
CREATE INDEX "opportunities_comuna_idx" ON "opportunities"("comuna");

-- CreateIndex
CREATE INDEX "activities_cliente_id_idx" ON "activities"("cliente_id");

-- CreateIndex
CREATE INDEX "activities_oportunidad_id_idx" ON "activities"("oportunidad_id");

-- CreateIndex
CREATE INDEX "activities_responsable_id_idx" ON "activities"("responsable_id");

-- CreateIndex
CREATE INDEX "activities_estado_idx" ON "activities"("estado");

-- CreateIndex
CREATE INDEX "activities_fecha_hora_idx" ON "activities"("fecha_hora");

-- CreateIndex
CREATE INDEX "activities_tipo_idx" ON "activities"("tipo");

-- CreateIndex
CREATE INDEX "activities_prioridad_idx" ON "activities"("prioridad");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_oportunidad_id_fkey" FOREIGN KEY ("oportunidad_id") REFERENCES "opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES
ON TABLE public.clients, public.opportunities, public.activities
FROM PUBLIC, anon, authenticated;

GRANT SELECT
ON TABLE public.clients, public.opportunities, public.activities
TO authenticated;

CREATE POLICY clients_read_crm_roles
ON public.clients FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('owner', 'sales', 'operations', 'finance', 'viewer')
  )
);

CREATE POLICY opportunities_read_crm_roles
ON public.opportunities FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('owner', 'sales', 'operations', 'finance', 'viewer')
  )
);

CREATE POLICY activities_read_crm_roles
ON public.activities FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role IN ('owner', 'sales', 'operations', 'finance', 'viewer')
  )
);
