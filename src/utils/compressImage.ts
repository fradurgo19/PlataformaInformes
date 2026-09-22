/** Max edge length and JPEG quality for upload (keeps Vercel body under ~4.5MB). */
const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.72;
const SKIP_IF_UNDER_BYTES = 350_000;

const isRasterImage = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/') && !type.includes('svg')) return true;
  return /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name);
};

const canvasToJpegBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image compression failed'));
      },
      'image/jpeg',
      quality
    );
  });

/**
 * Compress a photo in the browser before upload.
 * Returns the original file when compression is unnecessary or unsupported.
 */
export async function compressImageFile(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<File> {
  if (!isRasterImage(file)) return file;
  if (file.size > 0 && file.size <= SKIP_IF_UNDER_BYTES && /image\/jpeg/i.test(file.type)) {
    return file;
  }

  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvasToJpegBlob(canvas, quality);
    // Keep original if compression did not shrink meaningfully
    if (blob.size >= file.size * 0.95 && file.size < 2_000_000) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('compressImageFile skipped:', file.name, err);
    return file;
  }
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  const result: File[] = [];
  for (const file of files) {
    // Sequential to limit memory on mobile
    result.push(await compressImageFile(file));
  }
  return result;
}
