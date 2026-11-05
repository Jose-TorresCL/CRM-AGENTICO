import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/modules/activities/components/activity-form";
import { findActivity } from "@/modules/activities/services/activity-service";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { findClient, searchClients } from "@/modules/clients/services/client-service";
import { listOpportunitiesForClient } from "@/modules/opportunities/services/opportunity-service";
import { activityWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { opportunityStageLabels } from "@/shared/constants/crm-labels";
import { parseRouteId } from "@/shared/validations/route-params";

type EditActivityPageProps = { params: Promise<{ id: string }> };

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { user } = await requireRoles(activityWriteRoles);
  const id = parseRouteId((await params).id);
  const activity = await findActivity(id).catch((error: unknown) => {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  if (activity.estado === "completada" || activity.estado === "cancelada") {
    throw new AppError("No se puede editar una actividad cerrada.", 409);
  }

  const [clients, selectedClient, opportunities, users] = await Promise.all([
    searchClients({}),
    findClient(activity.clienteId),
    listOpportunitiesForClient(activity.clienteId),
    getAssignableUserOptions(),
  ]);
  const clientOptions = clients.map(({ id: clientId, nombre }) => ({
    id: clientId,
    label: nombre,
  }));
  if (!clientOptions.some(({ id: clientId }) => clientId === selectedClient.id)) {
    clientOptions.unshift({ id: selectedClient.id, label: selectedClient.nombre });
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href="/actividades">← Actividades</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar actividad</h1>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ActivityForm
          clients={clientOptions}
          initial={activity}
          initialUserId={user.id}
          opportunities={opportunities.map(({ id: opportunityId, etapa }) => ({
              id: opportunityId,
              label: `${opportunityStageLabels[etapa]}`,
            }))}
          users={users}
        />
      </div>
    </section>
  );
}
