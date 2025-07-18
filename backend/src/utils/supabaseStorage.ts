import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bucket = process.env.SUPABASE_BUCKET!;

export async function uploadFileToSupabase(fileBuffer: Buffer, fileName: string, mimetype: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw error;

  // Obtén la URL pública
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrlData.publicUrl;
} 