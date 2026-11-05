import Link from "next/link";
import { OpportunityForm } from "@/modules/opportunities/components/opportunity-form";
import { findClient, searchClients } from "@/modules/clients/services/client-service";
import { getAssignableUserOptions } from "@/modules/auth/services/get-user-options";
import { opportunityWriteRoles, requireRoles } from "@/server/auth/authorization";
import { parseRouteId } from "@/shared/validations/route-params";

type NewOpportunityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewOpportunityPage({ searchParams }: NewOpportunityPageProps) {
  const { user } = await requireRoles(opportunityWriteRoles);
  const params = await searchParams;
  const rawClientId = Array.isArray(params.clienteId) ? params.clienteId[0] : params.clienteId;
  const selectedClient = rawClientId ? parseRouteId(rawClientId) : undefined;

  const [clients, selectedClientRecord, users] = await Promise.all([
    searchClients({}),
    selectedClient ? findClient(selectedClient) : Promise.resolve(undefined),
    getAssignableUserOptions(),
  ]);
  const clientOptions = clients.map(({ id, nombre, estado }) => ({
    id,
    label: `${nombre} · ${estado}`,
  }));

  if (
    selectedClientRecord &&
    !clientOptions.some(({ id }) => id === selectedClientRecord.id)
  ) {
    clientOptions.unshift({
      id: selectedClientRecord.id,
      label: `${selectedClientRecord.nombre} · ${selectedClientRecord.estado}`,
    });
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href="/oportunidades">← Oportunidades</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crear oportunidad</h1>
        <p className="mt-2 text-sm text-slate-600">Toda oportunidad se asocia a un cliente y una próxima acción.</p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <OpportunityForm
          clients={clientOptions}
          initial={{ clienteId: selectedClient }}
          initialUserId={user.id}
          users={users}
        />
      </div>
    </section>
  );
}
