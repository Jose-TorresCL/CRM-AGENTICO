import Link from "next/link";
import { ActivityForm } from "@/modules/activities/components/activity-form";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { findClient, searchClients } from "@/modules/clients/services/client-service";
import { findOpportunity, listOpportunitiesForClient } from "@/modules/opportunities/services/opportunity-service";
import { activityWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { opportunityStageLabels } from "@/shared/constants/crm-labels";
import { parseRouteId } from "@/shared/validations/route-params";

type NewActivityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewActivityPage({ searchParams }: NewActivityPageProps) {
  const { user } = await requireRoles(activityWriteRoles);
  const params = await searchParams;
  const rawClientId = getSingleParam(params.clienteId);
  const rawOpportunityId = getSingleParam(params.oportunidadId);
  const clientId = rawClientId ? parseRouteId(rawClientId) : undefined;
  const opportunityId = rawOpportunityId ? parseRouteId(rawOpportunityId) : undefined;
  const selectedOpportunity = opportunityId
    ? await findOpportunity(opportunityId)
    : undefined;
  const selectedClientId = clientId ?? selectedOpportunity?.clienteId;

  if (selectedOpportunity && clientId && selectedOpportunity.clienteId !== clientId) {
    throw new AppError("La oportunidad no pertenece al cliente indicado.", 400);
  }

  const [clients, selectedClient, opportunities, users] = await Promise.all([
    searchClients({}),
    selectedClientId ? findClient(selectedClientId) : Promise.resolve(undefined),
    selectedClientId ? listOpportunitiesForClient(selectedClientId) : Promise.resolve([]),
    getAssignableUserOptions(),
  ]);
  const clientOptions = clients.map(({ id, nombre }) => ({ id, label: nombre }));
  if (selectedClient && !clientOptions.some(({ id }) => id === selectedClient.id)) {
    clientOptions.unshift({ id: selectedClient.id, label: selectedClient.nombre });
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href="/actividades">← Actividades</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crear actividad</h1>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ActivityForm
          clientId={selectedClientId}
          clients={clientOptions}
          initialUserId={user.id}
          opportunities={opportunities.map(({ id, etapa }) => ({
              id,
              label: opportunityStageLabels[etapa],
            }))}
          opportunityId={opportunityId}
          users={users}
        />
      </div>
    </section>
  );
}
