import Link from "next/link";
import { requireRoles, clientReadRoles, clientWriteRoles, hasAnyRole } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { clientFiltersSchema } from "@/modules/clients/schemas/client-schemas";
import { searchClients } from "@/modules/clients/services/client-service";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientStatusLabels, clientTypeLabels } from "@/shared/constants/crm-labels";
import { firstSearchParams } from "@/shared/lib/search-params";

type ClientsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { roles } = await requireRoles(clientReadRoles);
  const canWrite = hasAnyRole(roles, clientWriteRoles);
  const params = firstSearchParams(await searchParams);
  const parsedFilters = clientFiltersSchema.safeParse(params);

  if (!parsedFilters.success) {
    throw new AppError("Uno o más filtros de clientes no son válidos.", 400);
  }

  const clients = await searchClients(parsedFilters.data);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">CRM Comercial</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-2 text-sm text-slate-600">Busca clientes y revisa su actividad comercial.</p>
        </div>
      </header>

      {canWrite ? (
        <details className="rounded-lg border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer font-medium">Crear cliente</summary>
          <div className="mt-5">
            <ClientForm />
          </div>
        </details>
      ) : null}

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
        <label className="text-sm font-medium lg:col-span-2">
          Buscar por nombre, teléfono o WhatsApp
          <input className={inputClass} defaultValue={params.search} maxLength={120} name="search" />
        </label>
        <label className="text-sm font-medium">
          Estado
          <select className={inputClass} defaultValue={params.estado ?? ""} name="estado">
            <option value="">Todos</option>
            {Object.entries(clientStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Tipo
          <select className={inputClass} defaultValue={params.tipoCliente ?? ""} name="tipoCliente">
            <option value="">Todos</option>
            {Object.entries(clientTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Comuna
          <input className={inputClass} defaultValue={params.comuna} maxLength={120} name="comuna" />
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-5">
          <button className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white" type="submit">Filtrar</button>
          <Link className="text-sm underline" href="/clientes">Limpiar</Link>
        </div>
      </form>

      {clients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-medium">No hay clientes que coincidan</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ajusta los filtros{canWrite ? " o crea el primer cliente desde el formulario superior" : ""}.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
              href={`/clientes/${client.id}`}
              key={client.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{client.nombre}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {[client.telefono, client.whatsapp, client.comuna].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {clientTypeLabels[client.tipoCliente]} · {clientStatusLabels[client.estado]}
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {client._count.opportunities} oportunidades · {client._count.activities} actividades
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
