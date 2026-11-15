// Carpeta (relativa a donde corre el servidor) donde se guardan las fotos subidas.
export const UPLOADS_DIR = 'uploads';

// Ruta pública desde la que se sirven las fotos: http://localhost:3001/uploads/<archivo>
export const UPLOADS_PUBLIC_PREFIX = '/uploads/';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Solo se aceptan imágenes; la extensión se define según el tipo real recibido.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
