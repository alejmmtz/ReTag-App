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

// Colores por rol: verde para user, azul para store.
const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

type Garment = { id: string; name: string; status: string };
type EventItem = { id: string; title: string };

// Qué tipos de post puede crear cada rol (lo mismo que valida el backend).
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
      const imageUrls = await uploadImages(images.map((image) => image.file));

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

  return (
    <main className="min-h-screen bg-[#191919] pb-[120px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <header className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#303030] text-[20px]"
          >
            ‹
          </button>

          <h1 className="text-[22px] font-medium">Create a post</h1>
        </header>

        {/* Tipo de post */}
        <section className="mt-8">
          <p className="mb-3 text-[14px] text-[#8A8A8A]">Post type</p>

          <div className="flex flex-wrap gap-2">
            {TYPES_BY_ROLE[role].map((type) => {
              const active = type.value === postType;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => changeType(type.value)}
                  className="h-[40px] rounded-full border px-5 text-[14px] font-medium"
                  style={
                    active
                      ? {
                          backgroundColor: accent,
                          borderColor: accent,
                          color: role === 'user' ? '#1A1A1A' : '#FFFFFF',
                        }
                      : { borderColor: '#6C6C6C', color: '#F5F5F5' }
                  }
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Fotos */}
        <section className="mt-8">
          <p className="mb-3 text-[14px] text-[#8A8A8A]">Photos</p>
          <ImagePicker images={images} onChange={setImages} accent={accent} />
        </section>

        {/* Prenda enlazada */}
        {showsGarment && (
          <section className="mt-8">
            <p className="mb-3 text-[14px] text-[#8A8A8A]">
              {needsGarment ? 'Garment to offer' : 'Garment (optional)'}
            </p>

            {garments.length === 0 ? (
              <p className="rounded-[18px] border border-[#2A2A2A] px-4 py-3 text-[13px] text-[#8A8A8A]">
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
            ) : (
              <select
                value={garmentId}
                onChange={(event) => setGarmentId(event.target.value)}
                className="h-[48px] w-full rounded-full border border-[#6C6C6C] bg-[#191919] px-4 text-[14px] text-white outline-none"
              >
                <option value="">Select a garment</option>
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
          <section className="mt-8">
            <p className="mb-3 text-[14px] text-[#8A8A8A]">Event to promote</p>

            {events.length === 0 ? (
              <p className="rounded-[18px] border border-[#2A2A2A] px-4 py-3 text-[13px] text-[#8A8A8A]">
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
                className="h-[48px] w-full rounded-full border border-[#6C6C6C] bg-[#191919] px-4 text-[14px] text-white outline-none"
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
        <section className="mt-8">
          <p className="mb-3 text-[14px] text-[#8A8A8A]">Caption</p>

          <textarea
            value={caption}
            onChange={(event) =>
              setCaption(event.target.value.slice(0, MAX_CAPTION))
            }
            rows={5}
            placeholder="Write something about your post..."
            className="w-full resize-none rounded-[18px] border border-[#6C6C6C] bg-transparent p-4 text-[14px] text-white outline-none placeholder:text-[#8A8A8A]"
          />

          <p className="mt-1 text-right text-[12px] text-[#8A8A8A]">
            {caption.length}/{MAX_CAPTION}
          </p>
        </section>

        {error && (
          <p className="mt-4 text-[13px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-8 h-[51px] w-full rounded-full text-[15px] font-medium disabled:opacity-40"
          style={{
            backgroundColor: accent,
            color: role === 'user' ? '#1A1A1A' : '#FFFFFF',
          }}
        >
          {submitting ? 'Posting...' : 'Post it'}
        </button>
      </div>
    </main>
  );
}