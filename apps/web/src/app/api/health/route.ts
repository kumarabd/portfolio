import { NextResponse } from "next/server";
import type { HealthStatus } from "@mespace/core";

export function GET() {
  const body: HealthStatus = { status: "ok", timestamp: new Date().toISOString() };
  return NextResponse.json(body);
}
