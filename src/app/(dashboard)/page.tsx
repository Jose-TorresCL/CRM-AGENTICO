import { getAuthenticatedUser } from "@/server/auth/session";
import { requireRoles, clientReadRoles } from "@/server/auth/authorization";
import { getCommercialDashboard } from "@/modules/dashboard/services/commercial-dashboard-service";
import { activityPriorityLabels, activityTypeLabels, opportunityStageLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  await requireRoles(clientReadRoles);
  const metrics = await getCommercialDashboard();
  const stageCounts = new Map(
    metrics.stages.map(({ etapa, _count }) => [etapa, _count._all]),
  );

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-medium text-blue-700">CRM Comercial</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-slate-600">Hola, {user.email}. Estas son las prioridades comerciales.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Oportunidades nuevas sin contactar" value={metrics.newOpportunities} href="/oportunidades?etapa=nuevo&estado=abierta" />
        <MetricCard label="Oportunidades sin próxima acción" value={metrics.opportunitiesWithoutNextAction} href="/oportunidades?estado=abierta" />
        <MetricCard label="Actividades de hoy" value={metrics.activitiesTodayCount} href="/actividades?periodo=hoy" />
        <MetricCard label="Actividades vencidas" value={metrics.overdueActivitiesCount} href="/actividades?periodo=vencidas" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Pipeline abierto</h2>
            <p className="font-semibold">{formatClp(metrics.pipelineValue)}</p>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(opportunityStageLabels)
              .filter(([stage]) => !["ganado", "perdido"].includes(stage))
              .map(([stage, label]) => (
                <li className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm" key={stage}>
                  <span>{label}</span>
                  <span className="font-medium">{stageCounts.get(stage as keyof typeof opportunityStageLabels) ?? 0}</span>
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-lg border border-red-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Actividades críticas</h2>
          {metrics.criticalActivities.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No hay actividades críticas pendientes.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {metrics.criticalActivities.map((activity) => (
                <li className="py-3" key={activity.id}>
                  <Link className="font-medium text-blue-700 underline" href="/actividades">
                    {activity.asunto}
                  </Link>
                  <p className="mt-1 text-xs text-slate-600">
                    {activity.cliente.nombre} · {activityTypeLabels[activity.tipo]} · {formatDateTime(activity.fechaHora)} · {activityPriorityLabels[activity.prioridad]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList title="Actividades de hoy" activities={metrics.activitiesToday} />
        <ActivityList title="Actividades vencidas" activities={metrics.overdueActivities} />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400" href={href}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}

function ActivityList({
  title,
  activities,
}: {
  title: string;
  activities: Awaited<ReturnType<typeof getCommercialDashboard>>["activitiesToday"];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {activities.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No hay actividades para mostrar.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {activities.map((activity) => (
            <li className="py-3" key={activity.id}>
              <Link className="font-medium text-blue-700 underline" href={`/actividades?clienteId=${activity.clienteId}`}>
                {activity.asunto}
              </Link>
              <p className="mt-1 text-xs text-slate-600">
                {activity.cliente.nombre} · {activityTypeLabels[activity.tipo]} · {formatDateTime(activity.fechaHora)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
