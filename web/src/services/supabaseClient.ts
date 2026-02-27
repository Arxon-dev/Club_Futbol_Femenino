import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = 'profile-photos';

/**
 * Sube una foto de perfil a Supabase Storage.
 * Retorna la URL pública de la imagen.
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}.${ext}`;

  // Upsert: si ya existe, se sobreescribe
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Error al subir imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  // Append timestamp to bust cache
  return `${data.publicUrl}?t=${Date.now()}`;
}
