import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mermaid-world",
    timestamp: new Date().toISOString(),
  });
}
