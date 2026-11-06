import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteControls } from "@/modules/quotes/components/quote-controls";
import { QuoteWorkConversionForm } from "@/modules/quotes/components/quote-work-conversion-form";
import { findQuote } from "@/modules/quotes/services/quote-service";
import {
  hasAnyRole,
  quoteReadRoles,
  quoteWriteRoles,
  requireRoles,
} from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import {
  quoteStatusLabels,
  quoteSurfaceUnitLabels,
  serviceTypeLabels,
} from "@/shared/constants/crm-labels";
import {
  formatClp,
  formatDateOnly,
  formatDateTime,
} from "@/shared/lib/chile-datetime";
import { isQuoteExpired } from "@/modules/quotes/services/quote-domain";
import { parseRouteId } from "@/shared/validations/route-params";

type QuoteDetailProps = { params: Promise<{ id: string }> };

export default async function QuoteDetailPage({ params }: QuoteDetailProps) {
  const { roles } = await requireRoles(quoteReadRoles);
  const canWrite = hasAnyRole(roles, quoteWriteRoles);
  const id = parseRouteId((await params).id);
  const quote = await findQuote(id).catch((error: unknown) => {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });
  const expired = quote.estado === "enviada" && isQuoteExpired(quote.fechaVencimiento);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-blue-700 underline" href="/cotizaciones">← Cotizaciones</Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{quote.numero}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {quote.cliente.nombre} · <Link className="underline" href={`/oportunidades/${quote.oportunidad.id}`}>Ver oportunidad</Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{quoteStatusLabels[quote.estado]}</span>
          <a
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            href={`/api/cotizaciones/${quote.id}/pdf`}
          >
            Descargar PDF
          </a>
          {canWrite && quote.estado === "borrador" ? (
            <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`/cotizaciones/${quote.id}/editar`}>
              Editar borrador
            </Link>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <p><span className="text-sm text-slate-500">Emisión</span><br />{formatDateTime(quote.fechaEmision)}</p>
          <p><span className="text-sm text-slate-500">Vencimiento (Chile)</span><br />{formatDateOnly(quote.fechaVencimiento)}</p>
          <p><span className="text-sm text-slate-500">Tipo</span><br />{serviceTypeLabels[quote.tipoRevestimiento]}</p>
          <p><span className="text-sm text-slate-500">Superficie</span><br />{quote.superficie.toString()} {quoteSurfaceUnitLabels[quote.unidadSuperficie]}</p>
          <p className="sm:col-span-2"><span className="text-sm text-slate-500">Alcance</span><br />{quote.alcance}</p>
          <p><span className="text-sm text-slate-500">Precio total bruto (incluye IVA)</span><br />{formatClp(quote.precioTotal)}</p>
          <p><span className="text-sm text-slate-500">Costo estimado bruto (incluye IVA)</span><br />{formatClp(quote.costoEstimado)}</p>
          <p><span className="text-sm text-slate-500">Margen estimado bruto comercial</span><br />{formatClp(quote.margenEstimado)}</p>
          <p><span className="text-sm text-slate-500">Anticipo requerido</span><br />{formatClp(quote.anticipoRequerido)} · condición comercial, no pago recibido</p>
          <p><span className="text-sm text-slate-500">Plazo estimado</span><br />{quote.plazoDiasHabiles} días hábiles</p>
          <p className="sm:col-span-2"><span className="text-sm text-slate-500">Condiciones</span><br />{quote.condiciones}</p>
          {quote.exclusiones ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Exclusiones</span><br />{quote.exclusiones}</p> : null}
          {quote.motivoRechazo ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Motivo de rechazo</span><br />{quote.motivoRechazo}</p> : null}
          {quote.motivoAnulacion ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Motivo de anulación</span><br />{quote.motivoAnulacion}</p> : null}
          {quote.aprobadaAt ? <p><span className="text-sm text-slate-500">Aprobada</span><br />{formatDateTime(quote.aprobadaAt)}</p> : null}
          {quote.enviadaAt ? <p><span className="text-sm text-slate-500">Envío registrado</span><br />{formatDateTime(quote.enviadaAt)} · registro manual</p> : null}
          {expired ? <p className="sm:col-span-2 text-amber-800">La cotización está fuera de vigencia; la aprobación está bloqueada.</p> : null}
        </section>

        <aside className="space-y-5">
          {canWrite && (quote.estado === "borrador" || quote.estado === "enviada") ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Acciones</h2>
              <QuoteControls expired={expired} id={quote.id} status={quote.estado} />
            </section>
          ) : null}

          {canWrite && quote.estado === "aprobada" && !quote.obra ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Crear obra inicial</h2>
              <QuoteWorkConversionForm
                address={quote.cliente.direccion ?? ""}
                commune={quote.cliente.comuna ?? ""}
                id={quote.id}
              />
            </section>
          ) : null}

          {quote.obra ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="font-semibold">Obra inicial</h2>
              <Link className="mt-2 inline-block text-sm text-blue-700 underline" href={`/obras/${quote.obra.id}`}>
                Ver obra programada
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
