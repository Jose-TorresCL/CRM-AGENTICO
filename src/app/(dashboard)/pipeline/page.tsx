import Link from "next/link";
import {
  opportunityReadRoles,
  opportunityWriteRoles,
  hasAnyRole,
  requireRoles,
} from "@/server/auth/authorization";
import { opportunityFiltersSchema } from "@/modules/opportunities/schemas/opportunity-schemas";
import {
  searchPipeline,
} from "@/modules/opportunities/services/opportunity-service";
import { OpportunityStageControl } from "@/modules/opportunities/components/opportunity-stage-control";
import { AppError } from "@/server/errors/app-error";
import { opportunitySourceLabels, opportunityStageLabels, opportunityStatusLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import { firstSearchParams } from "@/shared/lib/search-params";
import type { OpportunityStage } from "@/generated/prisma/enums";

type PipelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const stages: OpportunityStage[] = [
  "nuevo",
  "contactado",
  "visita_agendada",
  "cotizado",
  "negociacion",
  "ganado",
  "perdido",
];
const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const { roles } = await requireRoles(opportunityReadRoles);
  const canWrite = hasAnyRole(roles, opportunityWriteRoles);
  const params = firstSearchParams(await searchParams);
  const parsedFilters = opportunityFiltersSchema.safeParse(params);

  if (!parsedFilters.success) {
    throw new AppError("Uno o más filtros del pipeline no son válidos.", 400);
  }

  const opportunities = await searchPipeline(parsedFilters.data);
  const byStage = new Map(
    stages.map((stage) => [
      stage,
      opportunities.filter((opportunity) => opportunity.etapa === stage),
    ]),
  );

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">CRM Comercial</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pipeline comercial</h1>
        <p className="mt-2 text-sm text-slate-600">Oportunidades agrupadas por etapa. Las canceladas no aparecen.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
        <label className="space-y-1 text-sm font-medium">
          Responsable (UUID)
          <input className={inputClass} defaultValue={params.responsableId} name="responsableId" />
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
          Próxima acción desde
          <input className={inputClass} defaultValue={params.desde} name="desde" type="date" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Próxima acción hasta
          <input className={inputClass} defaultValue={params.hasta} name="hasta" type="date" />
        </label>
        <div className="flex items-end gap-3">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white" type="submit">Filtrar</button>
          <Link className="text-sm underline" href="/pipeline">Limpiar</Link>
        </div>
      </form>

      {opportunities.length === 0 ? (
        <p className="text-sm text-slate-600">No hay oportunidades con estos filtros. Prueba otros filtros o registra una nueva.</p>
      ) : null}
      <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-4">
        {stages.map((stage) => {
          const stageOpportunities = byStage.get(stage) ?? [];
          return (
            <section className="w-72 shrink-0 rounded-lg bg-slate-100 p-3" key={stage}>
              <header className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold">{opportunityStageLabels[stage]}</h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs">{stageOpportunities.length}</span>
              </header>
              <div className="space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <article className="space-y-3 rounded-md border border-slate-200 bg-white p-4" key={opportunity.id}>
                    <Link className="font-medium text-blue-700 underline" href={`/oportunidades/${opportunity.id}`}>
                      {opportunity.cliente.nombre}
                    </Link>
                    <p className="text-xs text-slate-600">
                      {opportunity.comuna ?? opportunity.cliente.comuna ?? "Sin comuna"}
                    </p>
                    <dl className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between gap-2">
                        <dt>Valor estimado</dt><dd>{formatClp(opportunity.valorEstimado)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Responsable</dt><dd>{opportunity.responsableId.slice(0, 8)}…</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Próxima acción</dt><dd>{formatDateTime(opportunity.fechaProximaAccion)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Estado</dt><dd>{opportunityStatusLabels[opportunity.estado]}</dd>
                      </div>
                    </dl>
                    {canWrite && opportunity.estado === "abierta" ? (
                      <OpportunityStageControl
                        canCloseAsOwner={roles.includes("owner")}
                        id={opportunity.id}
                        stage={opportunity.etapa}
                      />
                    ) : null}
                  </article>
                ))}
                {stageOpportunities.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 p-4 text-xs text-slate-500">Sin oportunidades</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
