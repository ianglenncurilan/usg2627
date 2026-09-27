import { NextResponse } from "next/server";
import { executeD1QueryServer, executeD1BatchServer } from "@/lib/d1-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sql, params = [], batch } = body;

    if (batch && Array.isArray(batch)) {
      const results = await executeD1BatchServer(batch);
      return NextResponse.json({ success: true, data: results });
    }

    if (!sql) {
      return NextResponse.json({ error: "Missing SQL query or batch array" }, { status: 400 });
    }

    const results = await executeD1QueryServer(sql, params);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error("D1 API Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute D1 query" },
      { status: 500 }
    );
  }
}
