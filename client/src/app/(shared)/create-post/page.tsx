'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ImagePicker, { type PickedImage } from '../../../components/posts/image-picker';
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

const TYPES_BY_ROLE: Record<'user' | 'store', { value: PostType; label: string }[]> = {
  user: [
    { value: 'community', label: 'Community' },
    { value: 'offer', label: 'Offer' },
    { value: 'show off', label: 'Show Off' },
  ],
  store: [
    { value: 'offer', label: 'Offer' },
    { value: 'show off', label: 'Show Off' },
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await authFetch<MeResponse>('/auth/me');
        if (cancelled) return;

        setRole(me.role);
        setPostType(TYPES_BY_ROLE[me.role][0].value);

        const [myGarments, myEvents] = await Promise.all([
          authFetch<Garment[]>('/garments/mine'),
          me.role === 'store'
            ? authFetch<EventItem[]>('/events/mine')
            : Promise.resolve([] as EventItem[]),
        ]);

        if (!cancelled) {
          setGarments(myGarments.filter((garment) => garment.status === 'available'));
          setEvents(myEvents);
        }
      } catch (loadError) {
        if (cancelled) return;
        if (loadError instanceof ApiError && loadError.status === 401) {
          clearSession();
          router.replace('/login');
        } else {
          setError('We could not load your data. Try again later.');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!role || !postType) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
        {error ? (
          <p role="alert" className="text-center text-sm text-orange">{error}</p>
        ) : (
          <div className="h-12 w-full max-w-md animate-pulse rounded-xl bg-[#262626]" />
        )}
      </main>
    );
  }

  const accent = ACCENT[role];
  const accentText = role === 'user' ? '#1A1A1A' : '#FFFFFF';
  const needsGarment = postType === 'offer';
  const showsGarment = postType === 'offer' || postType === 'show off';
  const needsEvent = postType === 'event';
  const missingLink = (needsGarment && !garmentId) || (needsEvent && !eventId);
  const canSubmit = caption.trim().length > 0 && !missingLink && !submitting;
  const selectedGarment = garments.find((garment) => garment.id === garmentId);
  const garmentPhoto = selectedGarment
    ? (selectedGarment.images?.find((image) => image.isCover) ?? selectedGarment.images?.[0])?.url
    : null;
  const captionPlaceholder = postType === 'community'
    ? "Tell the community something, make sure it's cool."
    : 'What do you offer to the community?';

  function changeType(value: PostType) {
    setPostType(value);
    setGarmentId('');
    setEventId('');
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const imageUrls = await uploadImages(images.map((image) => image.file), 'Posts');
      await authFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          caption: caption.trim(),
          postType,
          ...(showsGarment && garmentId ? { garmentId } : {}),
          ...(needsEvent ? { eventId } : {}),
          ...(imageUrls.length ? { images: imageUrls } : {}),
        }),
      });
      router.push('/create-post/sent');
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        clearSession();
        router.replace('/login');
        return;
      }
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'We could not publish your post. Try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background text-foreground">
      <header className="flex h-[72px] shrink-0 items-center gap-2 border-b border-white/10 px-5">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-start text-3xl leading-none"
        >
          ‹
        </button>
        <h1 className="text-[18px] font-medium">New post</h1>
      </header>

      <section className="flex min-h-[280px] flex-1 items-center justify-center px-6 py-5">
        {needsGarment && garmentPhoto ? (
          <div className="relative aspect-square w-full max-w-[360px] overflow-hidden rounded-[22px] border-[4px] border-[#F5F5F5] bg-[#262626]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={garmentPhoto} alt={selectedGarment?.name ?? 'Selected garment'} className="h-full w-full object-cover" />
            <select
              value={garmentId}
              onChange={(event) => setGarmentId(event.target.value)}
              aria-label="Garment to offer"
              className="absolute left-0 top-0 h-[64px] w-[54%] max-w-[82%] appearance-none rounded-br-[20px] rounded-tl-[16px] bg-[#F5F5F5] py-3 pl-4 pr-12 text-left text-[16px] font-medium leading-tight text-[#1A1A1A] outline-none sm:text-[20px]"
            >
              <option value="">Choose a garment</option>
              {garments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}
            </select>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-[calc(54%-2.75rem)] top-[18px] h-7 w-7 text-[#1A1A1A]">
              <path d="m5 8 7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-full max-w-[360px]">
            <ImagePicker images={images} onChange={setImages} accent={accent} />
          </div>
        )}
      </section>

      <section className="shrink-0 border-t border-white/10 bg-[#191919] px-6 pb-6 pt-5">
        {needsGarment && !garmentPhoto && (
          <div className="mb-4">
            <p className="mb-2 text-[13px]">Which Garment of your closet are you going to post?</p>
            {garments.length ? (
              <select value={garmentId} onChange={(event) => setGarmentId(event.target.value)} aria-label="Garment to offer" className="h-10 w-full rounded-lg bg-white px-3 text-[13px] text-[#1A1A1A]">
                <option value="">Select a garment</option>
                {garments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}
              </select>
            ) : (
              <p className="text-xs text-grey">You have no available garments yet. <button type="button" onClick={() => router.push('/create-garment')} className="underline" style={{ color: accent }}>List one</button></p>
            )}
          </div>
        )}

        {postType === 'show off' && (
          <div className="mb-4">
            <p className="mb-2 text-[13px]">Which Garment are you going to show off?</p>
            <select value={garmentId} onChange={(event) => setGarmentId(event.target.value)} aria-label="Garment to show off" className="h-10 w-full rounded-lg px-3 text-[13px]" style={{ backgroundColor: accent, color: accentText }}>
              <option value="">Select a garment (optional)</option>
              {garments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}
            </select>
          </div>
        )}

        {needsEvent && (
          <div className="mb-4">
            <p className="mb-2 text-[13px]">Which event are you promoting?</p>
            {events.length ? (
              <select value={eventId} onChange={(event) => setEventId(event.target.value)} aria-label="Event to promote" className="h-10 w-full rounded-lg px-3 text-[13px]" style={{ backgroundColor: accent, color: accentText }}>
                <option value="">Select an event</option>
                {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
              </select>
            ) : (
              <p className="text-xs text-grey">You have no events yet. <button type="button" onClick={() => router.push('/create-event')} className="underline" style={{ color: accent }}>Create one</button></p>
            )}
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {TYPES_BY_ROLE[role].map((type) => {
            const active = type.value === postType;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => changeType(type.value)}
                aria-pressed={active}
                className="h-10 flex-1 rounded-full border px-2 text-[12px] font-medium transition-colors"
                style={active
                  ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF', color: '#1A1A1A' }
                  : { backgroundColor: 'transparent', borderColor: '#6C6C6C', color: '#898989' }}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value.slice(0, MAX_CAPTION))}
          rows={4}
          aria-label="Post caption"
          placeholder={captionPlaceholder}
          className="w-full resize-none rounded-2xl border border-white/5 bg-[#202020] p-4 text-[13px] leading-5 text-foreground outline-none placeholder:text-grey focus:border-white/20"
        />
        <p className="mt-1 text-right text-[11px] text-grey">{caption.length}/{MAX_CAPTION}</p>
        {error && <p role="alert" className="mt-2 text-[13px] text-orange">{error}</p>}

        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-[50px] w-full rounded-full text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: accent, color: accentText }}
          >
            {submitting ? 'Posting…' : 'Post it'}
          </button>
        </div>
      </section>
    </main>
  );
}
