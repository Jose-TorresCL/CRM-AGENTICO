import Link from "next/link";
import { notFound } from "next/navigation";
import { findWork } from "@/modules/works/services/work-service";
import { workReadRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { quoteSurfaceUnitLabels, serviceTypeLabels, workStatusLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";
import { parseRouteId } from "@/shared/validations/route-params";

type WorkDetailProps = { params: Promise<{ id: string }> };

export default async function WorkDetailPage({ params }: WorkDetailProps) {
  await requireRoles(workReadRoles);
  const id = parseRouteId((await params).id);
  const work = await findWork(id).catch((error: unknown) => {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <section className="space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href="/obras">← Obras</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Obra inicial</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cliente: {work.cliente.nombre} · Cotización: <Link className="underline" href={`/cotizaciones/${work.quote.id}`}>{work.quote.numero}</Link>
        </p>
      </header>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <p><span className="text-sm text-slate-500">Estado</span><br />{workStatusLabels[work.estado]}</p>
        <p><span className="text-sm text-slate-500">Creada</span><br />{formatDateTime(work.createdAt)}</p>
        <p><span className="text-sm text-slate-500">Ubicación confirmada</span><br />{work.direccion}, {work.comuna}</p>
        <p><span className="text-sm text-slate-500">Tipo y superficie</span><br />{serviceTypeLabels[work.tipoRevestimiento]} · {work.superficie.toString()} {quoteSurfaceUnitLabels[work.unidadSuperficie]}</p>
        <p className="sm:col-span-2"><span className="text-sm text-slate-500">Alcance aprobado</span><br />{work.alcance}</p>
        <p><span className="text-sm text-slate-500">Valor contratado bruto (incluye IVA)</span><br />{formatClp(work.precioContratado)}</p>
        <p><span className="text-sm text-slate-500">Costo estimado bruto snapshot</span><br />{formatClp(work.costoEstimadoSnapshot)}</p>
        <p><span className="text-sm text-slate-500">Margen estimado bruto comercial snapshot</span><br />{formatClp(work.margenEstimadoSnapshot)}</p>
        <p><span className="text-sm text-slate-500">Anticipo requerido</span><br />{formatClp(work.anticipoRequerido)} · no representa un pago</p>
        <p><span className="text-sm text-slate-500">Plazo estimado</span><br />{work.plazoDiasHabiles} días hábiles</p>
        <p className="sm:col-span-2"><span className="text-sm text-slate-500">Condiciones</span><br />{work.condiciones}</p>
        {work.exclusiones ? <p className="sm:col-span-2"><span className="text-sm text-slate-500">Exclusiones</span><br />{work.exclusiones}</p> : null}
      </section>
      <p className="text-sm text-slate-600">
        Este registro no incluye planificación, fechas de ejecución, cuadrillas, avances ni pagos.
      </p>
    </section>
  );
}
