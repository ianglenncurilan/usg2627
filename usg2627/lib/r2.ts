import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Lazy-initialized S3 client configured for Cloudflare R2
let s3Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null; // R2 environment variables not yet configured
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return s3Client;
}

/**
 * Uploads a file buffer directly to Cloudflare R2 bucket
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ url: string | null; error?: string }> {
  const client = getR2Client();
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!client || !bucketName) {
    return {
      url: null,
      error: "Cloudflare R2 environment variables are not set up in .env.local",
    };
  }

  // Clean filename and add timestamp
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${Date.now()}-${sanitizedFileName}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    // Format final public URL
    let baseUrl = publicDomain ? publicDomain.replace(/\/$/, "") : "";
    if (!baseUrl) {
      baseUrl = `https://${bucketName}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.dev`;
    }

    const publicUrl = `${baseUrl}/${key}`;
    return { url: publicUrl };
  } catch (err: any) {
    console.error("Cloudflare R2 Upload Error:", err);
    return {
      url: null,
      error: err.message || "Failed to upload to Cloudflare R2",
    };
  }
}
