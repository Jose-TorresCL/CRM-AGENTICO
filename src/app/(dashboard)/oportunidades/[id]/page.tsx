import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/modules/activities/components/activity-form";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { CancelOpportunityForm } from "@/modules/opportunities/components/cancel-opportunity-form";
import { OpportunityStageControl } from "@/modules/opportunities/components/opportunity-stage-control";
import { clientReadRoles, hasAnyRole, opportunityWriteRoles, requireRoles } from "@/server/auth/authorization";
import { findOpportunity } from "@/modules/opportunities/services/opportunity-service";
import { searchClients } from "@/modules/clients/services/client-service";
import { listOpportunitiesForClient } from "@/modules/opportunities/services/opportunity-service";
import { activityStatusLabels, activityTypeLabels, opportunitySourceLabels, opportunityStageLabels, opportunityStatusLabels, serviceTypeLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import { parseRouteId } from "@/shared/validations/route-params";

type OpportunityDetailProps = { params: Promise<{ id: string }> };

export default async function OpportunityDetailPage({ params }: OpportunityDetailProps) {
  const { user, roles } = await requireRoles(clientReadRoles);
  const id = parseRouteId((await params).id);
  const canWrite = hasAnyRole(roles, opportunityWriteRoles);
  const canCloseAsOwner = roles.includes("owner");
  const opportunity = await findOpportunity(id).catch((error: unknown) => {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });
  const [clients, users] = canWrite
    ? await Promise.all([searchClients({}), getAssignableUserOptions()])
    : [[], []];
  const activityOpportunities = await listOpportunitiesForClient(opportunity.clienteId);

  return (
    <section className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-blue-700 underline" href="/oportunidades">← Oportunidades</Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{opportunity.cliente.nombre}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {opportunityStageLabels[opportunity.etapa]} · {opportunityStatusLabels[opportunity.estado]} · {opportunitySourceLabels[opportunity.origen]}
          </p>
        </div>
        {canWrite && opportunity.estado === "abierta" ? (
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`/oportunidades/${id}/editar`}>
            Editar oportunidad
          </Link>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
            <p><span className="text-sm text-slate-500">Tipo de servicio</span><br />{serviceTypeLabels[opportunity.tipoServicio]}</p>
            <p><span className="text-sm text-slate-500">Comuna</span><br />{opportunity.comuna ?? "Sin comuna"}</p>
            <p><span className="text-sm text-slate-500">Valor estimado</span><br />{formatClp(opportunity.valorEstimado)}</p>
            <p><span className="text-sm text-slate-500">Responsable (UUID)</span><br />{opportunity.responsableId}</p>
            <p><span className="text-sm text-slate-500">Próxima acción</span><br />{opportunity.proximaAccion ?? "Sin acción"}</p>
            <p><span className="text-sm text-slate-500">Seguimiento</span><br />{formatDateTime(opportunity.fechaProximaAccion)}</p>
            {opportunity.motivoPerdida ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Motivo de pérdida</span><br />{opportunity.motivoPerdida}</p> : null}
            {opportunity.motivoCancelacion ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Motivo de cancelación</span><br />{opportunity.motivoCancelacion}</p> : null}
            {opportunity.notas ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Notas</span><br />{opportunity.notas}</p> : null}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Actividades</h2>
              {roles.some((role) => ["owner", "sales", "operations", "finance"].includes(role)) ? (
                <Link className="text-sm text-blue-700 underline" href={`/actividades/nueva?clienteId=${opportunity.clienteId}&oportunidadId=${opportunity.id}`}>
                  Crear actividad
                </Link>
              ) : null}
            </div>
            {opportunity.activities.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No hay actividades asociadas.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {opportunity.activities.map((activity) => (
                  <li className="py-3" key={activity.id}>
                    <p className="font-medium">{activity.asunto}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {activityTypeLabels[activity.tipo]} · {activityStatusLabels[activity.estado]} · {formatDateTime(activity.fechaHora)}
                    </p>
                    {activity.resultado ? <p className="mt-2 text-sm">{activity.resultado}</p> : null}
                    {roles.some((role) => ["owner", "sales", "operations", "finance"].includes(role)) &&
                    activity.estado !== "completada" &&
                    activity.estado !== "cancelada" ? (
                      <Link className="mt-2 inline-block text-xs text-blue-700 underline" href={`/actividades/${activity.id}/editar`}>
                        Editar actividad
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {canWrite && opportunity.estado === "abierta" ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Registrar actividad</h2>
              <ActivityForm
                clientId={opportunity.clienteId}
                clients={clients.map(({ id: clientId, nombre }) => ({ id: clientId, label: nombre }))}
                initialUserId={user.id}
                opportunities={activityOpportunities.map(({ id: opportunityId, etapa }) => ({
                    id: opportunityId,
                    label: opportunityStageLabels[etapa],
                  }))}
                opportunityId={opportunity.id}
                users={users}
              />
            </section>
          ) : null}
        </div>

        {canWrite && opportunity.estado === "abierta" ? (
          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Cambiar etapa</h2>
              <OpportunityStageControl
                canCloseAsOwner={canCloseAsOwner}
                id={opportunity.id}
                stage={opportunity.etapa}
              />
            </section>
            <section className="rounded-lg border border-red-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold">Cancelar oportunidad</h2>
              <CancelOpportunityForm id={opportunity.id} />
            </section>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
