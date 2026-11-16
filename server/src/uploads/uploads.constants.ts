export enum UploadBucket {
  Posts = 'Posts',
  Events = 'Events',
  Users = 'Users',
  Garments = 'Garments',
}

export enum ImageTypes {
  jpg = 'image/jpeg',
  png = 'image/png',
  webp = 'image/webp',
  gif = 'image/gif',
}

// Mantiene accesibles las imágenes locales creadas antes de migrar a Storage.
export const LEGACY_UPLOADS_DIR = 'uploads';
export const LEGACY_UPLOADS_PREFIX = '/uploads/';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_URL_TTL_SECONDS = 300;
