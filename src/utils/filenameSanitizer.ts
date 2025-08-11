/**
 * Función para sanitizar nombres de archivo removiendo caracteres especiales
 * y reemplazándolos con caracteres seguros para sistemas de archivos
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ÁÄÂÀ]/g, 'A')
    .replace(/[ÉËÊÈ]/g, 'E')
    .replace(/[ÍÏÎÌ]/g, 'I')
    .replace(/[ÓÖÔÒ]/g, 'O')
    .replace(/[ÚÜÛÙ]/g, 'U')
    .replace(/[Ñ]/g, 'N')
    .replace(/[^a-zA-Z0-9\s\-_\.]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/\s+/g, '_') // Reemplazar espacios con _
    .replace(/_+/g, '_') // Reemplazar múltiples _ con uno solo
    .trim();
};
