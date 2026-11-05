import Link from "next/link";
import { opportunityReadRoles, opportunityWriteRoles, hasAnyRole, requireRoles } from "@/server/auth/authorization";
import { opportunityFiltersSchema } from "@/modules/opportunities/schemas/opportunity-schemas";
import { searchOpportunities } from "@/modules/opportunities/services/opportunity-service";
import { AppError } from "@/server/errors/app-error";
import { opportunitySourceLabels, opportunityStageLabels, opportunityStatusLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import { firstSearchParams } from "@/shared/lib/search-params";

type OpportunitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const { roles } = await requireRoles(opportunityReadRoles);
  const canWrite = hasAnyRole(roles, opportunityWriteRoles);
  const params = firstSearchParams(await searchParams);
  const parsedFilters = opportunityFiltersSchema.safeParse(params);

  if (!parsedFilters.success) {
    throw new AppError("Uno o más filtros de oportunidades no son válidos.", 400);
  }

  const opportunities = await searchOpportunities(parsedFilters.data);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">CRM Comercial</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Oportunidades</h1>
          <p className="mt-2 text-sm text-slate-600">Gestiona etapas, responsables y próximos seguimientos.</p>
        </div>
        {canWrite ? (
          <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/oportunidades/nueva">
            Crear oportunidad
          </Link>
        ) : null}
      </header>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <label className="space-y-1 text-sm font-medium">
          Buscar cliente o próxima acción
          <input className={inputClass} defaultValue={params.search} maxLength={120} name="search" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Etapa
          <select className={inputClass} defaultValue={params.etapa ?? ""} name="etapa">
            <option value="">Todas</option>
            {Object.entries(opportunityStageLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Origen
          <select className={inputClass} defaultValue={params.origen ?? ""} name="origen">
            <option value="">Todos</option>
            {Object.entries(opportunitySourceLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Responsable (UUID)
          <input className={inputClass} defaultValue={params.responsableId} name="responsableId" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Comuna
          <input className={inputClass} defaultValue={params.comuna} maxLength={120} name="comuna" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Estado
          <select className={inputClass} defaultValue={params.estado ?? ""} name="estado">
            <option value="">Todos</option>
            {Object.entries(opportunityStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Seguimiento desde
          <input className={inputClass} defaultValue={params.desde} name="desde" type="date" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Seguimiento hasta
          <input className={inputClass} defaultValue={params.hasta} name="hasta" type="date" />
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white" type="submit">Filtrar</button>
          <Link className="text-sm underline" href="/oportunidades">Limpiar</Link>
        </div>
      </form>

      {opportunities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-medium">No hay oportunidades que coincidan</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ajusta los filtros{canWrite ? " o crea una oportunidad" : ""}.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {opportunities.map((opportunity) => (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
              href={`/oportunidades/${opportunity.id}`}
              key={opportunity.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{opportunity.cliente.nombre}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {[opportunity.comuna ?? opportunity.cliente.comuna, opportunitySourceLabels[opportunity.origen]].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  {opportunityStageLabels[opportunity.etapa]} · {opportunityStatusLabels[opportunity.estado]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <span>Valor: {formatClp(opportunity.valorEstimado)}</span>
                <span>Responsable: {opportunity.responsableId.slice(0, 8)}…</span>
                <span>Seguimiento: {formatDateTime(opportunity.fechaProximaAccion)}</span>
                <span>{opportunity._count.activities} actividades</span>
              </div>
              {opportunity.proximaAccion ? (
                <p className="mt-2 text-sm">Próxima acción: {opportunity.proximaAccion}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
