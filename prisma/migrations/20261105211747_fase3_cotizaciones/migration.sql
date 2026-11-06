CREATE TYPE "quote_status" AS ENUM (
    'borrador',
    'enviada',
    'aprobada',
    'rechazada',
    'vencida',
    'anulada'
);

CREATE TYPE "quote_surface_unit" AS ENUM ('m2', 'unidad');

CREATE TYPE "work_status" AS ENUM ('programada');

ALTER TABLE "opportunities"
ADD CONSTRAINT "opportunities_id_cliente_id_key" UNIQUE ("id", "cliente_id");

CREATE TABLE "quote_number_counters" (
    "year" INTEGER NOT NULL,
    "last_value" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_number_counters_pkey" PRIMARY KEY ("year"),
    CONSTRAINT "quote_number_counters_year_check" CHECK ("year" BETWEEN 2000 AND 9999),
    CONSTRAINT "quote_number_counters_last_value_check" CHECK ("last_value" > 0)
);

CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero" VARCHAR(24) NOT NULL,
    "oportunidad_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "fecha_emision" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" DATE NOT NULL,
    "estado" "quote_status" NOT NULL DEFAULT 'borrador',
    "alcance" TEXT NOT NULL,
    "tipo_revestimiento" "service_type" NOT NULL,
    "superficie" DECIMAL(10,2) NOT NULL,
    "unidad_superficie" "quote_surface_unit" NOT NULL DEFAULT 'm2',
    "precio_total" DECIMAL(14,0) NOT NULL,
    "costo_estimado" DECIMAL(14,0) NOT NULL,
    "margen_estimado" DECIMAL(14,0) NOT NULL,
    "anticipo_requerido" DECIMAL(14,0) NOT NULL,
    "plazo_dias_habiles" INTEGER NOT NULL,
    "condiciones" TEXT NOT NULL,
    "exclusiones" TEXT,
    "enviada_at" TIMESTAMPTZ(6),
    "enviada_por_id" UUID,
    "aprobada_at" TIMESTAMPTZ(6),
    "aprobada_por_id" UUID,
    "vencida_at" TIMESTAMPTZ(6),
    "vencida_por_id" UUID,
    "motivo_rechazo" TEXT,
    "rechazada_at" TIMESTAMPTZ(6),
    "rechazada_por_id" UUID,
    "motivo_anulacion" TEXT,
    "anulada_at" TIMESTAMPTZ(6),
    "anulada_por_id" UUID,
    "creada_por_id" UUID NOT NULL,
    "actualizada_por_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "quotes_surface_positive_check" CHECK ("superficie" > 0),
    CONSTRAINT "quotes_price_nonnegative_check" CHECK ("precio_total" >= 0),
    CONSTRAINT "quotes_cost_nonnegative_check" CHECK ("costo_estimado" >= 0),
    CONSTRAINT "quotes_margin_matches_check" CHECK ("margen_estimado" = "precio_total" - "costo_estimado"),
    CONSTRAINT "quotes_deposit_range_check" CHECK ("anticipo_requerido" >= 0 AND "anticipo_requerido" <= "precio_total"),
    CONSTRAINT "quotes_duration_positive_check" CHECK ("plazo_dias_habiles" > 0),
    CONSTRAINT "quotes_expiry_check" CHECK ("fecha_vencimiento" >= ("fecha_emision" AT TIME ZONE 'America/Santiago')::DATE),
    CONSTRAINT "quotes_rejection_reason_check" CHECK ("estado" <> 'rechazada' OR NULLIF(BTRIM("motivo_rechazo"), '') IS NOT NULL),
    CONSTRAINT "quotes_cancellation_reason_check" CHECK ("estado" <> 'anulada' OR NULLIF(BTRIM("motivo_anulacion"), '') IS NOT NULL),
    CONSTRAINT "quotes_sent_metadata_check" CHECK ("estado" NOT IN ('enviada', 'aprobada', 'rechazada', 'vencida') OR ("enviada_at" IS NOT NULL AND "enviada_por_id" IS NOT NULL)),
    CONSTRAINT "quotes_approved_metadata_check" CHECK ("estado" <> 'aprobada' OR ("aprobada_at" IS NOT NULL AND "aprobada_por_id" IS NOT NULL)),
    CONSTRAINT "quotes_expired_metadata_check" CHECK ("estado" <> 'vencida' OR ("vencida_at" IS NOT NULL AND "vencida_por_id" IS NOT NULL)),
    CONSTRAINT "quotes_rejected_metadata_check" CHECK ("estado" <> 'rechazada' OR ("rechazada_at" IS NOT NULL AND "rechazada_por_id" IS NOT NULL)),
    CONSTRAINT "quotes_cancelled_metadata_check" CHECK ("estado" <> 'anulada' OR ("anulada_at" IS NOT NULL AND "anulada_por_id" IS NOT NULL))
);

CREATE TABLE "works" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quote_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "estado" "work_status" NOT NULL DEFAULT 'programada',
    "direccion" VARCHAR(240) NOT NULL,
    "comuna" VARCHAR(120) NOT NULL,
    "alcance" TEXT NOT NULL,
    "tipo_revestimiento" "service_type" NOT NULL,
    "superficie" DECIMAL(10,2) NOT NULL,
    "unidad_superficie" "quote_surface_unit" NOT NULL DEFAULT 'm2',
    "precio_contratado" DECIMAL(14,0) NOT NULL,
    "costo_estimado_snapshot" DECIMAL(14,0) NOT NULL,
    "margen_estimado_snapshot" DECIMAL(14,0) NOT NULL,
    "anticipo_requerido" DECIMAL(14,0) NOT NULL,
    "plazo_dias_habiles" INTEGER NOT NULL,
    "condiciones" TEXT NOT NULL,
    "exclusiones" TEXT,
    "creada_por_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "works_surface_positive_check" CHECK ("superficie" > 0),
    CONSTRAINT "works_price_nonnegative_check" CHECK ("precio_contratado" >= 0),
    CONSTRAINT "works_cost_nonnegative_check" CHECK ("costo_estimado_snapshot" >= 0),
    CONSTRAINT "works_margin_matches_check" CHECK ("margen_estimado_snapshot" = "precio_contratado" - "costo_estimado_snapshot"),
    CONSTRAINT "works_deposit_range_check" CHECK ("anticipo_requerido" >= 0 AND "anticipo_requerido" <= "precio_contratado"),
    CONSTRAINT "works_duration_positive_check" CHECK ("plazo_dias_habiles" > 0)
);

CREATE UNIQUE INDEX "quotes_numero_key" ON "quotes"("numero");
CREATE UNIQUE INDEX "quotes_id_cliente_id_key" ON "quotes"("id", "cliente_id");
CREATE INDEX "quotes_oportunidad_id_estado_created_at_idx" ON "quotes"("oportunidad_id", "estado", "created_at");
CREATE INDEX "quotes_cliente_id_created_at_idx" ON "quotes"("cliente_id", "created_at");
CREATE INDEX "quotes_estado_fecha_vencimiento_idx" ON "quotes"("estado", "fecha_vencimiento");
CREATE UNIQUE INDEX "quotes_one_approved_per_opportunity_key"
ON "quotes"("oportunidad_id")
WHERE "estado" = 'aprobada';

CREATE UNIQUE INDEX "works_quote_id_key" ON "works"("quote_id");
CREATE UNIQUE INDEX "works_quote_id_cliente_id_key" ON "works"("quote_id", "cliente_id");
CREATE INDEX "works_cliente_id_created_at_idx" ON "works"("cliente_id", "created_at");
CREATE INDEX "works_estado_idx" ON "works"("estado");

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_oportunidad_id_cliente_id_fkey"
FOREIGN KEY ("oportunidad_id", "cliente_id")
REFERENCES "opportunities"("id", "cliente_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_cliente_id_fkey"
FOREIGN KEY ("cliente_id") REFERENCES "clients"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_enviada_por_id_fkey"
FOREIGN KEY ("enviada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_aprobada_por_id_fkey"
FOREIGN KEY ("aprobada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_vencida_por_id_fkey"
FOREIGN KEY ("vencida_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_rechazada_por_id_fkey"
FOREIGN KEY ("rechazada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_anulada_por_id_fkey"
FOREIGN KEY ("anulada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_creada_por_id_fkey"
FOREIGN KEY ("creada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quotes"
ADD CONSTRAINT "quotes_actualizada_por_id_fkey"
FOREIGN KEY ("actualizada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "works"
ADD CONSTRAINT "works_quote_id_cliente_id_fkey"
FOREIGN KEY ("quote_id", "cliente_id")
REFERENCES "quotes"("id", "cliente_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "works"
ADD CONSTRAINT "works_cliente_id_fkey"
FOREIGN KEY ("cliente_id") REFERENCES "clients"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "works"
ADD CONSTRAINT "works_creada_por_id_fkey"
FOREIGN KEY ("creada_por_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION public.require_approved_quote_for_work()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    source_quote public.quotes%ROWTYPE;
BEGIN
    SELECT *
    INTO source_quote
    FROM public.quotes
    WHERE "id" = NEW."quote_id"
      AND "cliente_id" = NEW."cliente_id"
    FOR SHARE;

    IF NOT FOUND OR source_quote."estado" <> 'aprobada' THEN
        RAISE EXCEPTION 'A work requires an approved quote';
    END IF;

    IF ROW(
        NEW."alcance",
        NEW."tipo_revestimiento",
        NEW."superficie",
        NEW."unidad_superficie",
        NEW."precio_contratado",
        NEW."costo_estimado_snapshot",
        NEW."margen_estimado_snapshot",
        NEW."anticipo_requerido",
        NEW."plazo_dias_habiles",
        NEW."condiciones",
        NEW."exclusiones"
    ) IS DISTINCT FROM ROW(
        source_quote."alcance",
        source_quote."tipo_revestimiento",
        source_quote."superficie",
        source_quote."unidad_superficie",
        source_quote."precio_total",
        source_quote."costo_estimado",
        source_quote."margen_estimado",
        source_quote."anticipo_requerido",
        source_quote."plazo_dias_habiles",
        source_quote."condiciones",
        source_quote."exclusiones"
    ) THEN
        RAISE EXCEPTION 'Work snapshot must match the approved quote';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "works_require_approved_quote"
BEFORE INSERT ON "works"
FOR EACH ROW
EXECUTE FUNCTION public.require_approved_quote_for_work();

CREATE FUNCTION public.prevent_approved_quote_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.estado IN ('aprobada', 'rechazada', 'vencida', 'anulada') THEN
        RAISE EXCEPTION 'Terminal quotes are immutable';
    END IF;

    IF OLD.estado = 'enviada'
       AND ROW(
           NEW.numero,
           NEW.oportunidad_id,
           NEW.cliente_id,
           NEW.fecha_emision,
           NEW.fecha_vencimiento,
           NEW.alcance,
           NEW.tipo_revestimiento,
           NEW.superficie,
           NEW.unidad_superficie,
           NEW.precio_total,
           NEW.costo_estimado,
           NEW.margen_estimado,
           NEW.anticipo_requerido,
           NEW.plazo_dias_habiles,
           NEW.condiciones,
           NEW.exclusiones
       ) IS DISTINCT FROM ROW(
           OLD.numero,
           OLD.oportunidad_id,
           OLD.cliente_id,
           OLD.fecha_emision,
           OLD.fecha_vencimiento,
           OLD.alcance,
           OLD.tipo_revestimiento,
           OLD.superficie,
           OLD.unidad_superficie,
           OLD.precio_total,
           OLD.costo_estimado,
           OLD.margen_estimado,
           OLD.anticipo_requerido,
           OLD.plazo_dias_habiles,
           OLD.condiciones,
           OLD.exclusiones
       ) THEN
        RAISE EXCEPTION 'Sent quote content is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "quotes_prevent_approved_update"
BEFORE UPDATE ON "quotes"
FOR EACH ROW
EXECUTE FUNCTION public.prevent_approved_quote_update();

CREATE FUNCTION public.prevent_work_commercial_snapshot_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF ROW(
        NEW.quote_id,
        NEW.cliente_id,
        NEW.direccion,
        NEW.comuna,
        NEW.alcance,
        NEW.tipo_revestimiento,
        NEW.superficie,
        NEW.unidad_superficie,
        NEW.precio_contratado,
        NEW.costo_estimado_snapshot,
        NEW.margen_estimado_snapshot,
        NEW.anticipo_requerido,
        NEW.plazo_dias_habiles,
        NEW.condiciones,
        NEW.exclusiones
    ) IS DISTINCT FROM ROW(
        OLD.quote_id,
        OLD.cliente_id,
        OLD.direccion,
        OLD.comuna,
        OLD.alcance,
        OLD.tipo_revestimiento,
        OLD.superficie,
        OLD.unidad_superficie,
        OLD.precio_contratado,
        OLD.costo_estimado_snapshot,
        OLD.margen_estimado_snapshot,
        OLD.anticipo_requerido,
        OLD.plazo_dias_habiles,
        OLD.condiciones,
        OLD.exclusiones
    ) THEN
        RAISE EXCEPTION 'Work commercial snapshot is immutable';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "works_prevent_snapshot_update"
BEFORE UPDATE ON "works"
FOR EACH ROW
EXECUTE FUNCTION public.prevent_work_commercial_snapshot_update();

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_number_counters ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES
ON TABLE public.quotes, public.works, public.quote_number_counters
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.quotes, public.works TO authenticated;

CREATE POLICY quotes_read_crm_roles
ON public.quotes FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        WHERE ur.user_id = (SELECT auth.uid())
          AND ur.role IN ('owner', 'sales', 'operations', 'finance', 'viewer', 'crew_leader')
    )
);

CREATE POLICY works_read_crm_roles
ON public.works FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        WHERE ur.user_id = (SELECT auth.uid())
          AND ur.role IN ('owner', 'sales', 'operations', 'finance', 'viewer', 'crew_leader')
    )
);
