import { ApiError, authFetch } from '../../lib/http';
import { uploadImage } from '../../lib/uploads';
import { normalizeStore, validateStore, validateStorePhoto, type StoreFields } from './store-fields';

type StoreResult = { id: string };

export async function createStore(
  fields: StoreFields,
  profile: File | null,
  cover: File | null,
  existingProfile: string | null,
  uploaded: Map<File, string>,
): Promise<StoreResult> {
  const errors = validateStore(fields);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);

  for (const file of [profile, cover]) {
    const error = file && validateStorePhoto(file);
    if (error) throw new Error(error);
  }

  async function upload(file: File | null) {
    if (!file) return null;
    const cached = uploaded.get(file);
    if (cached) return cached;
    const url = await uploadImage(file, 'Users');
    uploaded.set(file, url);
    return url;
  }

  const [profileUrl, coverUrl] = await Promise.all([upload(profile), upload(cover)]);
  const photo = profileUrl ?? existingProfile;
  const data = normalizeStore(fields);
  try {
    return await authFetch<StoreResult>('/stores', {
      method: 'POST',
      body: JSON.stringify({
        storeName: data.storeName,
        ...(data.location ? { location: data.location } : {}),
        ...(data.socialmedia ? { socialmedia: data.socialmedia } : {}),
        ...(data.schedule ? { schedule: data.schedule } : {}),
        ...(data.description ? { description: data.description } : {}),
        images: [
          ...(coverUrl ? [{ url: coverUrl, isCover: true, isProfile: false }] : []),
          ...(photo ? [{ url: photo, isCover: false, isProfile: true }] : []),
        ],
      }),
    });
  } catch (error) {
    // A retry after a lost response can find a store that was already saved.
    if (error instanceof ApiError && error.status === 409) {
      const existing = await authFetch<StoreResult>('/stores/me').catch(() => null);
      if (existing) return existing;
    }
    throw error;
  }
}
