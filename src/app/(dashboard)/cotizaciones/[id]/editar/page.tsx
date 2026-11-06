import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteForm } from "@/modules/quotes/components/quote-form";
import { findQuote } from "@/modules/quotes/services/quote-service";
import { quoteWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { parseRouteId } from "@/shared/validations/route-params";

type EditQuotePageProps = { params: Promise<{ id: string }> };

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  await requireRoles(quoteWriteRoles);
  const id = parseRouteId((await params).id);
  const quote = await findQuote(id).catch((error: unknown) => {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  if (quote.estado !== "borrador") {
    throw new AppError("Solo se pueden editar cotizaciones en borrador.", 409);
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href={`/cotizaciones/${id}`}>← {quote.numero}</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar borrador</h1>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <QuoteForm
          initial={{
            id: quote.id,
            fechaVencimiento: quote.fechaVencimiento.toISOString().slice(0, 10),
            alcance: quote.alcance,
            tipoRevestimiento: quote.tipoRevestimiento,
            superficie: quote.superficie.toString(),
            unidadSuperficie: quote.unidadSuperficie,
            precioTotal: quote.precioTotal.toString(),
            costoEstimado: quote.costoEstimado.toString(),
            anticipoRequerido: quote.anticipoRequerido.toString(),
            plazoDiasHabiles: quote.plazoDiasHabiles,
            condiciones: quote.condiciones,
            exclusiones: quote.exclusiones,
          }}
        />
      </div>
    </section>
  );
}
