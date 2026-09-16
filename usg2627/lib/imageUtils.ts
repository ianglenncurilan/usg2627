/**
 * Image Utilities for Egress Optimization & Bandwidth Reduction
 */

/**
 * Resizes and compresses an image File using HTML Canvas before uploading to storage.
 * Converts camera/high-res photos into lightweight WebP format.
 */
export async function compressImageBeforeUpload(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  // If file is SVG, PDF, or non-image, return as is
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to original file
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const compressedFile = new File([blob], `${fileNameWithoutExt}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            // If compressed file is larger than original, stick with original
            if (compressedFile.size >= file.size) {
              resolve(file);
            } else {
              console.log(
                `[Egress Optimizer] Compressed "${file.name}" (${(file.size / 1024).toFixed(1)} KB) -> "${compressedFile.name}" (${(compressedFile.size / 1024).toFixed(1)} KB)`
              );
              resolve(compressedFile);
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

/**
 * Validates file upload size against a maximum MB threshold.
 */
export function validateFileUploadSize(
  file: File,
  maxMb: number = 2
): { valid: boolean; error?: string } {
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed upload limit of ${maxMb} MB.`,
    };
  }
  return { valid: true };
}
