import Link from "next/link";
import { notFound } from "next/navigation";
import { clientReadRoles, clientWriteRoles, hasAnyRole, requireRoles } from "@/server/auth/authorization";
import { findClient } from "@/modules/clients/services/client-service";
import { activityStatusLabels, activityTypeLabels, opportunityStageLabels, opportunityStatusLabels } from "@/shared/constants/crm-labels";
import { formatDateTime } from "@/shared/lib/chile-datetime";
import { parseRouteId } from "@/shared/validations/route-params";

type ClientDetailProps = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: ClientDetailProps) {
  const { roles } = await requireRoles(clientReadRoles);
  const id = parseRouteId((await params).id);
  const canWrite = hasAnyRole(roles, clientWriteRoles);
  const client = await findClient(id).catch((error: unknown) => {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <section className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-blue-700 underline" href="/clientes">← Clientes</Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{client.nombre}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {[client.telefono, client.whatsapp, client.email, client.comuna, client.direccion].filter(Boolean).join(" · ")}
          </p>
        </div>
        {canWrite ? (
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm" href={`/clientes/${client.id}/editar`}>
            Editar cliente
          </Link>
        ) : null}
      </header>

      {canWrite ? (
        <Link className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href={`/oportunidades/nueva?clienteId=${client.id}`}>
          Crear oportunidad
        </Link>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Oportunidades</h2>
          {client.opportunities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">Este cliente todavía no tiene oportunidades.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {client.opportunities.map((opportunity) => (
                <li className="py-3" key={opportunity.id}>
                  <Link className="font-medium text-blue-700 underline" href={`/oportunidades/${opportunity.id}`}>
                    {opportunityStageLabels[opportunity.etapa]} · {opportunityStatusLabels[opportunity.estado]}
                  </Link>
                  <p className="mt-1 text-xs text-slate-600">{opportunity._count.activities} actividades</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Historial de actividades</h2>
            {roles.some((role) => ["owner", "sales", "operations", "finance"].includes(role)) ? (
              <Link className="text-sm text-blue-700 underline" href={`/actividades/nueva?clienteId=${client.id}`}>
                Crear actividad
              </Link>
            ) : null}
          </div>
          {client.activities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No hay actividades registradas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {client.activities.map((activity) => (
                <li className="py-3" key={activity.id}>
                  <p className="font-medium">{activity.asunto}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {activityTypeLabels[activity.tipo]} · {activityStatusLabels[activity.estado]} · {formatDateTime(activity.fechaHora)}
                  </p>
                  {activity.resultado ? <p className="mt-2 text-sm">{activity.resultado}</p> : null}
                  {activity.oportunidad ? (
                    <Link className="mt-2 inline-block text-xs text-blue-700 underline" href={`/oportunidades/${activity.oportunidad.id}`}>
                      Ver oportunidad ({opportunityStageLabels[activity.oportunidad.etapa]})
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
