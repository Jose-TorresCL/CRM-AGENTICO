import Link from "next/link";
import { notFound } from "next/navigation";
import { findOpportunity } from "@/modules/opportunities/services/opportunity-service";
import { QuoteForm } from "@/modules/quotes/components/quote-form";
import { quoteWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { parseRouteId } from "@/shared/validations/route-params";

type NewQuotePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  await requireRoles(quoteWriteRoles);
  const params = await searchParams;
  const rawId = Array.isArray(params.oportunidadId)
    ? params.oportunidadId[0]
    : params.oportunidadId;

  if (!rawId) {
    throw new AppError("Selecciona una oportunidad para crear la cotización.", 400);
  }

  const opportunityId = parseRouteId(rawId);
  const opportunity = await findOpportunity(opportunityId).catch((error: unknown) => {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  if (opportunity.estado !== "abierta") {
    throw new AppError("Solo se pueden cotizar oportunidades abiertas.", 409);
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href={`/oportunidades/${opportunity.id}`}>
          ← {opportunity.cliente.nombre}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crear cotización</h1>
        <p className="mt-2 text-sm text-slate-600">
          La propuesta quedará vinculada a {opportunity.cliente.nombre}. Se asignará un número anual al guardar.
        </p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <QuoteForm opportunityId={opportunity.id} />
      </div>
    </section>
  );
}
