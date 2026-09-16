import { NextResponse } from "next/server";
import { uploadToR2, getR2Client } from "@/lib/r2";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if Cloudflare R2 is configured
    const r2Client = getR2Client();

    if (r2Client) {
      // 1. Upload to Cloudflare R2 (Zero Egress Fees)
      const { url, error } = await uploadToR2(buffer, file.name, file.type, folder);
      if (error || !url) {
        return NextResponse.json({ error: error || "Cloudflare R2 upload failed" }, { status: 500 });
      }
      return NextResponse.json({ success: true, url, provider: "cloudflare_r2" });
    } else {
      // 2. Fallback to Supabase Storage if Cloudflare R2 credentials are not set yet
      const fileExt = file.name.split(".").pop() || "bin";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        return NextResponse.json(
          {
            error: `Upload failed: ${uploadError.message}. Please configure Cloudflare R2 variables in .env.local to enable $0 egress storage.`,
          },
          { status: 500 }
        );
      }

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: "supabase_storage_fallback",
        note: "Cloudflare R2 env vars not detected yet. Operating on Supabase Storage fallback.",
      });
    }
  } catch (err: any) {
    console.error("API /api/upload Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
