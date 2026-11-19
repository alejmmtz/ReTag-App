export type StoreFields = {
  storeName: string;
  location: string;
  socialmedia: string;
  schedule: string;
  description: string;
};

export type StoreErrors = Partial<Record<keyof StoreFields, string>>;

export const EMPTY_STORE: StoreFields = {
  storeName: '', location: '', socialmedia: '', schedule: '', description: '',
};

export function normalizeStore(fields: StoreFields): StoreFields {
  return {
    storeName: fields.storeName.trim(),
    location: fields.location.trim(),
    socialmedia: fields.socialmedia.trim().replace(/^@/, ''),
    schedule: fields.schedule.trim(),
    description: fields.description.trim(),
  };
}

export function validateStore(fields: StoreFields): StoreErrors {
  const data = normalizeStore(fields);
  const errors: StoreErrors = {};
  if (!data.storeName || data.storeName.length > 40) errors.storeName = 'Use a store name between 1 and 40 characters.';
  if (data.location.length > 255) errors.location = 'Keep the location under 256 characters.';
  if (data.socialmedia && !/^[a-zA-Z_0-9]{1,20}$/.test(data.socialmedia)) {
    errors.socialmedia = 'Use up to 20 letters, numbers or underscores.';
  }
  if (data.schedule.length > 100) errors.schedule = 'Keep your schedule under 101 characters.';
  if (data.description.length > 350) errors.description = 'Use up to 350 characters.';
  return errors;
}

export function validateStorePhoto(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    return 'Choose a JPG, PNG, WebP or GIF image.';
  }
  if (file.size === 0 || file.size > 5 * 1024 * 1024) return 'Choose an image smaller than 5 MB.';
  return null;
}
