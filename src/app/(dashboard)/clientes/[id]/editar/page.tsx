import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientWriteRoles, requireRoles } from "@/server/auth/authorization";
import { findClient } from "@/modules/clients/services/client-service";
import { parseRouteId } from "@/shared/validations/route-params";

type EditClientPageProps = { params: Promise<{ id: string }> };

export default async function EditClientPage({ params }: EditClientPageProps) {
  await requireRoles(clientWriteRoles);
  const id = parseRouteId((await params).id);
  const client = await findClient(id).catch((error: unknown) => {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link className="text-sm text-blue-700 underline" href={`/clientes/${id}`}>← Ficha de cliente</Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar cliente</h1>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ClientForm initial={client} />
      </div>
    </section>
  );
}
