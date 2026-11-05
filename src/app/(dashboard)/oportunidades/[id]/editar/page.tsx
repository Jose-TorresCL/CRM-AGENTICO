import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityForm } from "@/modules/opportunities/components/opportunity-form";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { searchClients } from "@/modules/clients/services/client-service";
import { findOpportunity } from "@/modules/opportunities/services/opportunity-service";
import { opportunityWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { formatChileLocalDateTime, formatDateInput } from "@/shared/lib/chile-datetime";
import { parseRouteId } from "@/shared/validations/route-params";

type EditOpportunityPageProps = { params: Promise<{ id: string }> };

export default async function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const { user } = await requireRoles(opportunityWriteRoles);
  const id = parseRouteId((await params).id);
  const opportunity = await findOpportunity(id).catch((error: unknown) => {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  if (opportunity.estado !== "abierta") {
    throw new AppError("No se puede editar una oportunidad cerrada.", 409);
  }

  const [clients, users] = await Promise.all([
    searchClients({}),
    getAssignableUserOptions(),
  ]);
  const clientOptions = clients.map(({ id: clientId, nombre, estado }) => ({
    id: clientId,
    label: `${nombre} · ${estado}`,
  }));
  if (!clientOptions.some(({ id: clientId }) => clientId === opportunity.clienteId)) {
    clientOptions.unshift({
      id: opportunity.cliente.id,
      label: `${opportunity.cliente.nombre} · ${opportunity.cliente.estado}`,
    });
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href={`/oportunidades/${id}`}>← Ficha de oportunidad</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar oportunidad</h1>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <OpportunityForm
          clients={clientOptions}
          initial={{
            ...opportunity,
            valorEstimado: opportunity.valorEstimado?.toString(),
            fechaEstimadaCierre: formatDateInput(opportunity.fechaEstimadaCierre),
            fechaProximaAccion: opportunity.fechaProximaAccion
              ? formatChileLocalDateTime(opportunity.fechaProximaAccion)
              : "",
          }}
          initialUserId={user.id}
          users={users}
        />
      </div>
    </section>
  );
}
