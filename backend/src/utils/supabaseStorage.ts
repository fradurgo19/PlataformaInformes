import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bucket = process.env.SUPABASE_BUCKET!;

export async function uploadFileToSupabase(fileBuffer: Buffer, fileName: string, mimetype: string) {
  let bufferToUpload = fileBuffer;
  let uploadMime = mimetype;

  // Comprimir solo imágenes JPEG o PNG
  if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
    // Redimensionar a máximo 1024px de ancho/alto y comprimir
    bufferToUpload = await sharp(fileBuffer)
      .resize({ width: 1024, height: 1024, fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();
    uploadMime = 'image/jpeg';
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, bufferToUpload, {
      contentType: uploadMime,
      upsert: true,
    });

  if (error) throw error;

  // Obtén la URL pública
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return {
    publicUrl: publicUrlData.publicUrl,
    size: bufferToUpload.length,
    mimetype: uploadMime,
  };
} 