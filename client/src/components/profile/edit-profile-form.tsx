'use client';

import AssetIcon from '../icons/asset-icon';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import { uploadImage } from '../../lib/uploads';
import type { ProfileUser, StoreProfile } from './profile-types';

const ACCENT = { user: '#C8F66F', store: '#1D5CEB' } as const;
const MAX_DESCRIPTION = 300;

const UNDERLINE =
  'min-h-11 w-full border-b border-line bg-transparent pb-2 text-sm text-foreground outline-none placeholder:text-grey focus:border-foreground';

export default function EditProfileForm() {
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [storeName, setStoreName] = useState('');
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSessionError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      router.replace('/login');
      return true;
    }

    return false;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const meData = await authFetch<MeResponse>('/auth/me');
        const [user, storeData] = await Promise.all([
          authFetch<ProfileUser>(`/users/${meData.id}`),
          meData.role === 'store'
            ? authFetch<StoreProfile>('/stores/me')
            : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setMe(meData);
        setStore(storeData);
        setName(user.name ?? '');
        setUsername(user.username);
        setPhotoUrl(
          storeData?.images.find((image) => image.isProfile)?.url ??
            user.profilePicture,
        );
        setCoverUrl(
          storeData?.images.find((image) => image.isCover && !image.isProfile)
            ?.url ?? null,
        );
        setStoreName(storeData?.storeName ?? '');
        setHandle(storeData?.socialmedia ?? '');
        setLocation(storeData?.location ?? '');
        setDescription(storeData?.description ?? user.description ?? '');
      } catch (err) {
        if (!cancelled && !handleSessionError(err)) {
          setLoadError('We could not load your profile.');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadError) {
    return (
      <main className="bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
        <p className="text-sm text-grey">{loadError}</p>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
        <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="mx-auto h-[112px] w-[112px] animate-pulse rounded-full bg-surface" />
          <div className="h-[40px] w-full animate-pulse rounded-full bg-surface" />
        </div>
      </main>
    );
  }

  const isStore = me.role === 'store';
  const accent = ACCENT[me.role];
  const accentText = isStore ? '#FFFFFF' : '#1A1A1A';
  const displayName = isStore ? storeName : name || username;

  const canSave =
    !saving &&
    (isStore ? storeName.trim() !== '' : username.trim() !== '');

  function pick(
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File) => void,
    setPreview: (url: string) => void,
  ) {
    const file = event.target.files?.[0];

    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    if (!canSave || !me) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const [newPhoto, newCover] = await Promise.all([
        photoFile ? uploadImage(photoFile, 'Users') : Promise.resolve(null),
        coverFile ? uploadImage(coverFile, 'Users') : Promise.resolve(null),
      ]);

      const finalPhoto = newPhoto ?? photoUrl;
      const finalCover = newCover ?? coverUrl;

      if (isStore && store) {
        const images = [
          ...(finalCover ? [{ url: finalCover }] : []),
          ...(finalPhoto ? [{ url: finalPhoto, isProfile: true }] : []),
        ];

        await authFetch(`/stores/${store.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            storeName: storeName.trim(),
            ...(handle.trim() ? { socialmedia: handle.trim() } : {}),
            ...(location.trim() ? { location: location.trim() } : {}),
            description: description.trim(),
            images,
          }),
        });

        router.push('/store');
        return;
      }

      await authFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          description: description.trim(),
          ...(newPhoto ? { profilePicture: newPhoto } : {}),
        }),
      });

      router.push('/profile');
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not save your profile. Try again.',
      );
      setSaving(false);
    }
  }

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="mx-auto w-full max-w-lg mb-32">
        <header className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center text-sm min-h-11 min-w-11"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>
          <h1 className="text-xl font-semibold">Edit profile</h1>
        </header>

        {/* Portada (solo tienda) */}
        {isStore && (
          <section className="mt-5">
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="hidden text-sm"
              onChange={(event) => pick(event, setCoverFile, setCoverUrl)}
            />
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-surface text-sm text-[#D6D6D6] min-h-11 min-w-11"
            >
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              )}
              <span className="image-overlay relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2">
                <AssetIcon name={coverUrl ? "image" : "plus"} width={18} height={18} />
                {coverUrl ? 'Change cover' : 'Add a cover photo'}
              </span>
            </button>
          </section>
        )}

        {/* Foto de perfil */}
        <section className="mt-6 flex flex-col items-center">
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden text-sm"
            onChange={(event) => pick(event, setPhotoFile, setPhotoUrl)}
          />
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            aria-label="Change profile photo"
            className="relative min-h-11 min-w-11"
          >
            <span
              className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full text-xl font-medium"
              style={{ backgroundColor: accent, color: accentText }}
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (displayName || '?').charAt(0).toUpperCase()
              )}
            </span>
            <span
              className="absolute bottom-0 right-0 flex h-[36px] w-[36px] items-center justify-center rounded-full border-[3px] border-background"
              style={{ backgroundColor: accent, color: accentText }}
            >
              <AssetIcon name="image" width={20} height={20} />
            </span>
          </button>
          <p className="mt-3 text-sm text-grey">Tap to change your photo</p>
        </section>

        {/* Campos */}
        {isStore ? (
          <>
            <section className="mt-6">
              <label className="text-sm text-grey" htmlFor="store-name">Store name</label>
              <input
                id="store-name"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value.slice(0, 40))}
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-sm text-grey" htmlFor="store-handle">Social media handle</label>
              <input
                id="store-handle"
                value={handle}
                onChange={(event) => setHandle(event.target.value.replace(/[^a-zA-Z_0-9]/g, '').slice(0, 20))}
                placeholder="your_store"
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-sm text-grey" htmlFor="store-location">Location</label>
              <input
                id="store-location"
                value={location}
                onChange={(event) => setLocation(event.target.value.slice(0, 255))}
                placeholder="Street, city"
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>
          </>
        ) : (
          <>
            <section className="mt-6">
              <label className="text-sm text-grey" htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 20))}
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-sm text-grey" htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                value={username}
                onChange={(event) => setUsername(event.target.value.slice(0, 20))}
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>
          </>
        )}

        <section className="mt-6">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION))}
            rows={4}
            placeholder="Bio: tell the community about you..."
            className="w-full resize-none rounded-[22px] bg-surface p-4 text-sm text-foreground outline-none placeholder:text-grey"
          />
          <p className="mt-1 text-right text-xs text-grey">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </section>

        {error && (
          <p className="mt-2 text-sm text-orange" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background to-transparent pb-8 pt-6 px-8">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="button-pill w-full disabled:opacity-40"
            style={{ backgroundColor: accent, color: accentText }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
