import Link from "next/link";
import { searchWorks } from "@/modules/works/services/work-service";
import { workReadRoles, requireRoles } from "@/server/auth/authorization";
import { workStatusLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateTime } from "@/shared/lib/chile-datetime";

export default async function WorksPage() {
  await requireRoles(workReadRoles);
  const works = await searchWorks();

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">Registro inicial</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Obras</h1>
        <p className="mt-2 text-sm text-slate-600">
          Solo se muestran registros iniciales creados desde cotizaciones aprobadas; no incluye planificación ni ejecución.
        </p>
      </header>
      {works.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-medium">No hay obras iniciales</h2>
          <p className="mt-2 text-sm text-slate-600">Convierte una cotización aprobada para crear el primer registro.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {works.map((work) => (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
              href={`/obras/${work.id}`}
              key={work.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{work.cliente.nombre} · {work.quote.numero}</h2>
                  <p className="mt-1 text-sm text-slate-600">{work.direccion}, {work.comuna}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  {workStatusLabels[work.estado]}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Valor contratado: {formatClp(work.precioContratado)} · Creada {formatDateTime(work.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
