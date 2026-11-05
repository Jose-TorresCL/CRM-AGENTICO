import Link from "next/link";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { ActivityControls } from "@/modules/activities/components/activity-controls";
import { activityFiltersSchema } from "@/modules/activities/schemas/activity-schemas";
import { searchActivities } from "@/modules/activities/services/activity-service";
import { activityReadRoles, activityWriteRoles, hasAnyRole, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { searchClients } from "@/modules/clients/services/client-service";
import { searchOpportunities } from "@/modules/opportunities/services/opportunity-service";
import { activityPriorityLabels, activityStatusLabels, activityTypeLabels, opportunityStageLabels } from "@/shared/constants/crm-labels";
import { getChileDayBounds, formatDateTime } from "@/shared/lib/chile-datetime";
import { firstSearchParams } from "@/shared/lib/search-params";

type ActivitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const { roles } = await requireRoles(activityReadRoles);
  const canWrite = hasAnyRole(roles, activityWriteRoles);
  const params = firstSearchParams(await searchParams);
  const parsedFilters = activityFiltersSchema.safeParse(params);

  if (!parsedFilters.success) {
    throw new AppError("Uno o más filtros de actividades no son válidos.", 400);
  }

  const { start, end } = getChileDayBounds();
  const [activities, clients, opportunities, users] = await Promise.all([
    searchActivities(parsedFilters.data, { start, end }),
    searchClients({}),
    searchOpportunities({}),
    getAssignableUserOptions(),
  ]);
  const userLabels = new Map(users.map(({ id, label }) => [id, label]));
  const opportunityLabels = new Map(
    opportunities.map(({ id, cliente, etapa }) => [
      id,
      `${cliente.nombre} · ${opportunityStageLabels[etapa]}`,
    ]),
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">CRM Comercial</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Actividades</h1>
          <p className="mt-2 text-sm text-slate-600">Revisa seguimientos de hoy, vencidos y pendientes.</p>
        </div>
        {canWrite ? (
          <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/actividades/nueva">
            Crear actividad
          </Link>
        ) : null}
      </header>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <label className="space-y-1 text-sm font-medium">
          Tipo
          <select className={inputClass} defaultValue={params.tipo ?? ""} name="tipo">
            <option value="">Todos</option>
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Estado
          <select className={inputClass} defaultValue={params.estado ?? ""} name="estado">
            <option value="">Todos</option>
            {Object.entries(activityStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Responsable (UUID)
          <input className={inputClass} defaultValue={params.responsableId} name="responsableId" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Cliente
          <select className={inputClass} defaultValue={params.clienteId ?? ""} name="clienteId">
            <option value="">Todos</option>
            {clients.map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Oportunidad
          <select className={inputClass} defaultValue={params.oportunidadId ?? ""} name="oportunidadId">
            <option value="">Todas</option>
            {opportunities.map(({ id, cliente, etapa }) => (
              <option key={id} value={id}>{cliente.nombre} · {opportunityStageLabels[etapa]}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Periodo
          <select className={inputClass} defaultValue={params.periodo ?? ""} name="periodo">
            <option value="">Todos</option>
            <option value="hoy">Hoy</option>
            <option value="vencidas">Vencidas</option>
          </select>
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white" type="submit">Filtrar</button>
          <Link className="text-sm underline" href="/actividades">Limpiar</Link>
        </div>
      </form>

      {activities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-medium">No hay actividades que coincidan</h2>
          <p className="mt-2 text-sm text-slate-600">Ajusta los filtros o registra un seguimiento nuevo.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {activities.map((activity) => (
            <article className="space-y-4 rounded-lg border border-slate-200 bg-white p-5" key={activity.id}>
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{activity.asunto}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {activityTypeLabels[activity.tipo]} · {formatDateTime(activity.fechaHora)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activityStatusLabels[activity.estado]}</span>
                  <span className={`rounded-full px-3 py-1 ${activity.prioridad === "critica" ? "bg-red-100 text-red-800" : "bg-slate-100"}`}>
                    {activityPriorityLabels[activity.prioridad]}
                  </span>
                </div>
              </header>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                <Link className="underline" href={`/clientes/${activity.clienteId}`}>
                  Cliente: {activity.cliente.nombre}
                </Link>
                {activity.oportunidad ? (
                  <Link className="underline" href={`/oportunidades/${activity.oportunidad.id}`}>
                    Oportunidad: {opportunityLabels.get(activity.oportunidad.id) ?? "Ver"}
                  </Link>
                ) : null}
                <span>Responsable: {userLabels.get(activity.responsableId) ?? activity.responsableId.slice(0, 8)}</span>
              </div>
              {activity.descripcion ? <p className="text-sm">{activity.descripcion}</p> : null}
              {activity.resultado ? <p className="text-sm"><strong>Resultado:</strong> {activity.resultado}</p> : null}
              {canWrite && activity.estado !== "completada" && activity.estado !== "cancelada" ? (
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
                  <Link className="text-sm text-blue-700 underline" href={`/actividades/${activity.id}/editar`}>Editar</Link>
                  <ActivityControls canEdit id={activity.id} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
