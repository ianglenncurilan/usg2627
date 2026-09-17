import { NextResponse } from "next/server";
import { deleteFromR2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 });
    }

    const { success, error } = await deleteFromR2(fileUrl);
    if (!success) {
      return NextResponse.json({ error: error || "Failed to delete file from Cloudflare R2" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "File deleted from Cloudflare R2" });
  } catch (err: any) {
    console.error("API /api/delete Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error during delete" }, { status: 500 });
  }
}
