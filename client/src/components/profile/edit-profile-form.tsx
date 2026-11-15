'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import { uploadImage } from '../../lib/uploads';
import type { ProfileUser, StoreProfile } from './profile-types';

const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;
const MAX_DESCRIPTION = 300;

const UNDERLINE =
  'w-full border-b border-[#4A4A4A] bg-transparent pb-2 text-[16px] text-white outline-none placeholder:text-[#8A8A8A] focus:border-white';

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
      <main className="min-h-screen bg-[#191919] px-6 pt-24 text-center text-white">
        <p className="text-[15px] text-[#8A8A8A]">{loadError}</p>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        <div className="mx-auto w-full max-w-[560px] space-y-4">
          <div className="mx-auto h-[112px] w-[112px] animate-pulse rounded-full bg-[#262626]" />
          <div className="h-[40px] w-full animate-pulse rounded-full bg-[#262626]" />
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
        photoFile ? uploadImage(photoFile) : Promise.resolve(null),
        coverFile ? uploadImage(coverFile) : Promise.resolve(null),
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
    <main className="min-h-screen bg-[#191919] pb-[170px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <header className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center text-[28px]"
          >
            ‹
          </button>
          <h1 className="text-[20px] font-medium">Edit profile</h1>
        </header>

        {/* Portada (solo tienda) */}
        {isStore && (
          <section className="mt-5">
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => pick(event, setCoverFile, setCoverUrl)}
            />
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-[#262626] text-[14px] text-[#D6D6D6]"
            >
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              )}
              <span className="relative rounded-full bg-black/60 px-4 py-2">
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
            className="hidden"
            onChange={(event) => pick(event, setPhotoFile, setPhotoUrl)}
          />
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            aria-label="Change profile photo"
            className="relative"
          >
            <span
              className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full text-[40px] font-medium"
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
              className="absolute bottom-0 right-0 flex h-[36px] w-[36px] items-center justify-center rounded-full border-[3px] border-[#191919]"
              style={{ backgroundColor: accent, color: accentText }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </button>
          <p className="mt-3 text-[13px] text-[#9A9A9A]">Tap to change your photo</p>
        </section>

        {/* Campos */}
        {isStore ? (
          <>
            <section className="mt-6">
              <label className="text-[13px] text-[#9A9A9A]" htmlFor="store-name">Store name</label>
              <input
                id="store-name"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value.slice(0, 40))}
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-[13px] text-[#9A9A9A]" htmlFor="store-handle">Social media handle</label>
              <input
                id="store-handle"
                value={handle}
                onChange={(event) => setHandle(event.target.value.replace(/[^a-zA-Z_0-9]/g, '').slice(0, 20))}
                placeholder="your_store"
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-[13px] text-[#9A9A9A]" htmlFor="store-location">Location</label>
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
              <label className="text-[13px] text-[#9A9A9A]" htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 20))}
                className={`mt-1 ${UNDERLINE}`}
              />
            </section>

            <section className="mt-6">
              <label className="text-[13px] text-[#9A9A9A]" htmlFor="profile-username">Username</label>
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
            className="w-full resize-none rounded-[22px] bg-[#262626] p-4 text-[14px] text-white outline-none placeholder:text-[#8A8A8A]"
          />
          <p className="mt-1 text-right text-[12px] text-[#8A8A8A]">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </section>

        {error && (
          <p className="mt-2 text-[13px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent pb-8 pt-6">
        <div className="mx-auto w-full max-w-[560px] px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="h-[51px] w-full rounded-full text-[15px] font-medium disabled:opacity-40"
            style={{ backgroundColor: accent, color: accentText }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
