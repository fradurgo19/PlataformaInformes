// Cambio trivial para forzar deploy en Vercel
export function getPhotoUrl(photo: any): string {
  if (typeof photo === 'string') return photo;
  if (photo.file_path && photo.file_path.startsWith('http')) return photo.file_path;
  if (photo.file_path) return photo.file_path;
  if (photo.filename) return `/uploads/${photo.filename}`;
  return '';
} 