import Link from "next/link";
import { AppError } from "@/server/errors/app-error";
import { quoteReadRoles, quoteWriteRoles, hasAnyRole, requireRoles } from "@/server/auth/authorization";
import { quoteFiltersSchema, type QuoteFilters } from "@/modules/quotes/schemas/quote-schemas";
import { searchQuotes } from "@/modules/quotes/services/quote-service";
import { quoteStatusLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateOnly } from "@/shared/lib/chile-datetime";
import { firstSearchParams } from "@/shared/lib/search-params";

type QuotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const { roles } = await requireRoles(quoteReadRoles);
  const canWrite = hasAnyRole(roles, quoteWriteRoles);
  const params = firstSearchParams(await searchParams);
  const parsed = quoteFiltersSchema.safeParse(params);

  if (!parsed.success) {
    throw new AppError("Uno o más filtros de cotizaciones no son válidos.", 400);
  }

  const filters: QuoteFilters = parsed.data;
  const quotes = await searchQuotes(filters);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">Gestión comercial</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cotizaciones</h1>
        <p className="mt-2 text-sm text-slate-600">Borradores, envíos registrados y decisiones comerciales.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3" method="get">
        <label className="space-y-1 text-sm font-medium">
          Buscar número o cliente
          <input className={inputClass} defaultValue={params.search} maxLength={120} name="search" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Estado
          <select className={inputClass} defaultValue={params.estado ?? ""} name="estado">
            <option value="">Todos</option>
            {Object.entries(quoteStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white" type="submit">Filtrar</button>
          <Link className="text-sm underline" href="/cotizaciones">Limpiar</Link>
        </div>
      </form>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-medium">No hay cotizaciones</h2>
          <p className="mt-2 text-sm text-slate-600">
            Las cotizaciones se crean desde una oportunidad abierta.
          </p>
          <Link className="mt-3 inline-block text-sm text-blue-700 underline" href="/oportunidades">
            Ir a oportunidades
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {quotes.map((quote) => (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
              href={`/cotizaciones/${quote.id}`}
              key={quote.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{quote.numero} · {quote.cliente.nombre}</h2>
                  <p className="mt-1 text-sm text-slate-600">Válida hasta {formatDateOnly(quote.fechaVencimiento)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  {quoteStatusLabels[quote.estado]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <span>Precio bruto: {formatClp(quote.precioTotal)}</span>
                <span>Margen estimado bruto: {formatClp(quote.margenEstimado)}</span>
                {quote.obra ? <span>Obra creada</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
      {!canWrite ? <p className="text-xs text-slate-500">Acceso de solo lectura.</p> : null}
    </section>
  );
}
