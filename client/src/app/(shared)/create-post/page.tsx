'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ImagePicker, {
  type PickedImage,
} from '../../../components/posts/image-picker';
import type { MeResponse, PostType } from '../../../components/posts/post-types';
import { ApiError, authFetch, clearSession } from '../../../lib/http';
import { uploadImages } from '../../../lib/uploads';

const MAX_CAPTION = 350;

const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

type Garment = {
  id: string;
  name: string;
  status: string;
  images?: { url: string; isCover: boolean }[];
};
type EventItem = { id: string; title: string };

const TYPES_BY_ROLE: Record<
  'user' | 'store',
  { value: PostType; label: string }[]
> = {
  user: [
    { value: 'community', label: 'Community' },
    { value: 'offer', label: 'Offer' },
    { value: 'show off', label: 'Show off' },
  ],
  store: [
    { value: 'offer', label: 'Offer' },
    { value: 'show off', label: 'Show off' },
    { value: 'event', label: 'Event' },
  ],
};

export default function CreatePostPage() {
  const router = useRouter();

  const [role, setRole] = useState<'user' | 'store' | null>(null);
  const [postType, setPostType] = useState<PostType | null>(null);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [caption, setCaption] = useState('');
  const [garments, setGarments] = useState<Garment[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [garmentId, setGarmentId] = useState('');
  const [eventId, setEventId] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
        const me = await authFetch<MeResponse>('/auth/me');

        if (cancelled) {
          return;
        }

        setRole(me.role);
        setPostType(TYPES_BY_ROLE[me.role][0].value);

        const [myGarments, myEvents] = await Promise.all([
          authFetch<Garment[]>('/garments/mine'),
          me.role === 'store'
            ? authFetch<EventItem[]>('/events/mine')
            : Promise.resolve([] as EventItem[]),
        ]);

        if (!cancelled) {
          setGarments(myGarments.filter((g) => g.status === 'available'));
          setEvents(myEvents);
        }
      } catch (err) {
        if (!cancelled && !handleSessionError(err)) {
          setError('We could not load your data. Try again later.');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!role || !postType) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        {error ? (
          <p className="text-center text-[14px] text-[#FB3F0F]">{error}</p>
        ) : (
          <div className="h-[48px] w-full animate-pulse rounded-full bg-[#262626]" />
        )}
      </main>
    );
  }

  const accent = ACCENT[role];
  const needsGarment = postType === 'offer';
  const showsGarment = postType === 'offer' || postType === 'show off';
  const needsEvent = postType === 'event';

  const missingLink =
    (needsGarment && !garmentId) || (needsEvent && !eventId);
  const canSubmit =
    caption.trim().length > 0 && !missingLink && !submitting;

  function changeType(value: PostType) {
    setPostType(value);
    setGarmentId('');
    setEventId('');
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const imageUrls = await uploadImages(
        images.map((image) => image.file),
        'Posts',
      );

      await authFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          caption: caption.trim(),
          postType,
          ...(showsGarment && garmentId ? { garmentId } : {}),
          ...(needsEvent ? { eventId } : {}),
          ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
        }),
      });

      router.push('/create-post/sent');
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not publish your post. Try again.',
      );
      setSubmitting(false);
    }
  }

  const accentText = role === 'user' ? '#1A1A1A' : '#FFFFFF';
  const selectedGarment = garments.find((garment) => garment.id === garmentId);
  const garmentPhoto = selectedGarment
    ? (selectedGarment.images?.find((image) => image.isCover) ??
      selectedGarment.images?.[0])?.url
    : null;
  const placeholder =
    postType === 'community'
      ? "Tell the community something, make sure it's cool."
      : 'What do you offer to the community?';

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

          <h1 className="text-[20px] font-medium">New post</h1>
        </header>

        {/* Fotos (área grande arriba) */}
        <section className="mt-5">
          <ImagePicker images={images} onChange={setImages} accent={accent} />
        </section>

        {/* Tipo de post: el activo va en blanco */}
        <section className="mt-6 flex flex-wrap gap-2">
          {TYPES_BY_ROLE[role].map((type) => {
            const active = type.value === postType;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => changeType(type.value)}
                className="h-[38px] rounded-full border px-5 text-[14px] font-medium"
                style={
                  active
                    ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF', color: '#1A1A1A' }
                    : { borderColor: '#6C6C6C', color: '#F5F5F5' }
                }
              >
                {type.label}
              </button>
            );
          })}
        </section>

        {/* Prenda enlazada */}
        {showsGarment && (
          <section className="mt-6">
            <p className="mb-3 text-[15px] font-medium">
              {needsGarment
                ? 'Which Garment of your closet are you going to post?'
                : 'Which Garment are you going to show off?'}
            </p>

            {garments.length === 0 ? (
              <p className="rounded-[18px] bg-[#262626] px-4 py-3 text-[13px] text-[#9A9A9A]">
                You have no available garments yet.{' '}
                <button
                  type="button"
                  onClick={() => router.push('/create-garment')}
                  className="underline"
                  style={{ color: accent }}
                >
                  List one
                </button>
              </p>
            ) : needsGarment ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[#262626]">
                {garmentPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={garmentPhoto} alt="" className="h-full w-full object-cover" />
                )}
                <select
                  value={garmentId}
                  onChange={(event) => setGarmentId(event.target.value)}
                  aria-label="Garment to offer"
                  className="absolute inset-x-3 bottom-3 h-[44px] rounded-full bg-black/70 px-4 text-[14px] text-white outline-none backdrop-blur"
                >
                  <option value="">Select a garment</option>
                  {garments.map((garment) => (
                    <option key={garment.id} value={garment.id}>
                      {garment.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <select
                value={garmentId}
                onChange={(event) => setGarmentId(event.target.value)}
                aria-label="Garment to show off"
                className="h-[48px] w-full rounded-full px-4 text-[14px] font-medium outline-none"
                style={{ backgroundColor: accent, color: accentText }}
              >
                <option value="">Select a garment (optional)</option>
                {garments.map((garment) => (
                  <option key={garment.id} value={garment.id}>
                    {garment.name}
                  </option>
                ))}
              </select>
            )}
          </section>
        )}

        {/* Evento enlazado */}
        {needsEvent && (
          <section className="mt-6">
            <p className="mb-3 text-[15px] font-medium">Which event are you promoting?</p>

            {events.length === 0 ? (
              <p className="rounded-[18px] bg-[#262626] px-4 py-3 text-[13px] text-[#9A9A9A]">
                You have no events yet.{' '}
                <button
                  type="button"
                  onClick={() => router.push('/create-event')}
                  className="underline"
                  style={{ color: accent }}
                >
                  Create one
                </button>
              </p>
            ) : (
              <select
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="h-[48px] w-full rounded-full px-4 text-[14px] font-medium outline-none"
                style={{ backgroundColor: accent, color: accentText }}
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            )}
          </section>
        )}

        {/* Descripción */}
        <section className="mt-6">
          <textarea
            value={caption}
            onChange={(event) =>
              setCaption(event.target.value.slice(0, MAX_CAPTION))
            }
            rows={5}
            placeholder={placeholder}
            className="w-full resize-none rounded-[22px] bg-[#262626] p-4 text-[14px] text-white outline-none placeholder:text-[#8A8A8A]"
          />

          <p className="mt-1 text-right text-[12px] text-[#8A8A8A]">
            {caption.length}/{MAX_CAPTION}
          </p>
        </section>

        {error && (
          <p className="mt-2 text-[13px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Botón fijo abajo */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent pb-8 pt-6">
        <div className="mx-auto w-full max-w-[560px] px-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-[51px] w-full rounded-full text-[15px] font-medium disabled:opacity-40"
            style={{ backgroundColor: accent, color: accentText }}
          >
            {submitting ? 'Posting...' : 'Post it'}
          </button>
        </div>
      </div>
    </main>
  );
}
