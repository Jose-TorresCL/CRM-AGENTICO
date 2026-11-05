import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "crm-operativo",
    timestamp: new Date().toISOString(),
  });
}
