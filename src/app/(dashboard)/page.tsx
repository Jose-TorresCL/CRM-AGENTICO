import Link from "next/link";
import { getCommercialDashboard } from "@/modules/dashboard/services/commercial-dashboard-service";
import {
  activityPriorityLabels,
  activityTypeLabels,
  opportunityStageLabels,
} from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import { clientReadRoles, requireRoles } from "@/server/auth/authorization";

export default async function DashboardPage() {
  const { user, roles } = await requireRoles(clientReadRoles);
  const dashboard = await getCommercialDashboard();
  const metrics = [
    { label: "Oportunidades nuevas", value: String(dashboard.newOpportunities) },
    { label: "Sin próxima acción", value: String(dashboard.opportunitiesWithoutNextAction) },
    { label: "Valor del pipeline", value: formatClp(dashboard.pipelineValue) },
    { label: "Actividades de hoy", value: String(dashboard.activitiesTodayCount) },
    { label: "Actividades vencidas", value: String(dashboard.overdueActivitiesCount) },
  ];

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">Resumen comercial</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Bienvenido al CRM Operativo</h1>
        <p className="mt-2 text-sm text-slate-600">
          {user.email ?? "Sesión autenticada"} · Roles: {roles.join(", ")}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4" key={metric.label}>
            <p className="text-sm text-slate-600">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Pipeline por etapa</h2>
          <Link className="text-sm text-blue-700 underline" href="/pipeline">Ver pipeline</Link>
        </div>
        {dashboard.stages.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.stages.map(({ etapa, _count }) => (
              <li className="rounded-md bg-slate-50 p-3" key={etapa}>
                <span>{opportunityStageLabels[etapa]}</span>
                <strong className="float-right">{_count._all}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No hay oportunidades en el pipeline.</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Actividades de hoy</h2>
            <Link className="text-sm text-blue-700 underline" href="/actividades?periodo=hoy">Ver actividades</Link>
          </div>
          {dashboard.activitiesToday.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {dashboard.activitiesToday.map((activity) => (
                <li className="py-3" key={activity.id}>
                  <Link className="font-medium text-blue-700 underline" href={`/clientes/${activity.cliente.id}`}>
                    {activity.asunto} · {activity.cliente.nombre}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {activityTypeLabels[activity.tipo]} · {formatDateTime(activity.fechaHora)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No hay actividades pendientes para hoy.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Seguimientos vencidos</h2>
            <Link className="text-sm text-blue-700 underline" href="/actividades?periodo=vencidas">Revisar vencidas</Link>
          </div>
          {dashboard.overdueActivities.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {dashboard.overdueActivities.map((activity) => (
                <li className="py-3" key={activity.id}>
                  <Link className="font-medium text-blue-700 underline" href={`/clientes/${activity.cliente.id}`}>
                    {activity.asunto} · {activity.cliente.nombre}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {activityTypeLabels[activity.tipo]} · {formatDateTime(activity.fechaHora)} · {activityPriorityLabels[activity.prioridad]}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No hay actividades vencidas.</p>
          )}
        </section>
      </div>

      {dashboard.criticalActivities.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-900">Actividades críticas pendientes</h2>
          <ul className="mt-3 list-inside list-disc text-sm text-red-900">
            {dashboard.criticalActivities.map((activity) => (
              <li key={activity.id}>
                <Link className="underline" href={`/clientes/${activity.cliente.id}`}>
                  {activity.asunto} · {activity.cliente.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
