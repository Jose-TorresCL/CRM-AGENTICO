import { findQuote } from "@/modules/quotes/services/quote-service";
import { generateDownloadablePdf } from "@/modules/quotes/services/pdf-generator";
import { quoteReadRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { quoteSurfaceUnitLabels, quoteStatusLabels, serviceTypeLabels } from "@/shared/constants/crm-labels";
import { formatClp, formatDateOnly, formatDateTime } from "@/shared/lib/chile-datetime";
import { parseRouteId } from "@/shared/validations/route-params";

type PdfRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: PdfRouteContext) {
  try {
    await requireRoles(quoteReadRoles);
    const id = parseRouteId((await params).id);
    const quote = await findQuote(id);
    const bytes = await generateDownloadablePdf([
      { text: "COTIZACION", emphasized: true },
      { text: `Numero: ${quote.numero}`, emphasized: true },
      { text: `Estado: ${quoteStatusLabels[quote.estado]}` },
      { text: `Fecha de emision: ${formatDateTime(quote.fechaEmision)}` },
      { text: `Valida hasta: ${formatDateOnly(quote.fechaVencimiento)}` },
      { text: `Cliente: ${quote.cliente.nombre}` },
      { text: `Direccion: ${quote.cliente.direccion ?? ""}` },
      { text: `Comuna: ${quote.cliente.comuna ?? ""}` },
      { text: `Tipo de revestimiento: ${serviceTypeLabels[quote.tipoRevestimiento]}` },
      { text: `Superficie estimada: ${quote.superficie.toString()} ${quoteSurfaceUnitLabels[quote.unidadSuperficie]}` },
      { text: `Alcance: ${quote.alcance}` },
      { text: `Precio total bruto (CLP, incluye IVA): ${formatClp(quote.precioTotal)}`, emphasized: true },
      { text: `Costo estimado bruto (CLP, incluye IVA): ${formatClp(quote.costoEstimado)}` },
      { text: `Margen estimado bruto comercial (no utilidad neta): ${formatClp(quote.margenEstimado)}` },
      { text: `Anticipo requerido (condicion comercial; no recibido): ${formatClp(quote.anticipoRequerido)}` },
      { text: `Plazo estimado: ${quote.plazoDiasHabiles} dias habiles` },
      { text: `Condiciones: ${quote.condiciones}` },
      { text: `Exclusiones: ${quote.exclusiones ?? "Sin exclusiones especificadas"}` },
      { text: "Documento generado para descarga. El sistema no envio correos ni mensajes." },
    ]);
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${quote.numero}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }

    throw error;
  }
}
