'use client';

import {
  useEffect,
  useState,
} from 'react';

import type {
  CurrentUser,
  Event,
} from '../../../../components/events/event-types';

import { useRouter } from 'next/navigation';
import { API_URL } from '../../../../lib/api';
import Image from 'next/image';


type Props = {
  eventId: string;
};

export default function EventDetail({
  eventId,
}: Props) {
  const router = useRouter();

  const [event, setEvent] =
    useState<Event | null>(null);

  const [isOwner, setIsOwner] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState('');


  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(
          `${API_URL}/events/${eventId}`,
          {
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          setError(
            'The event could not be found.',
          );
          return;
        }

        const eventData: Event =
          await response.json();

        setEvent(eventData);

        const token =
          localStorage.getItem(
            'access_token',
          );

        if (!token) return;

        const userResponse = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        );

        if (!userResponse.ok) return;

        const currentUser: CurrentUser =
          await userResponse.json();

        setIsOwner(
          eventData.store?.userId ===
            currentUser.id,
        );
      } catch {
        setError(
          'The server could not be reached.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  //delete
  async function handleDelete() {
    if (!event) return;

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this event?',
      );

    if (!confirmed) return;

    const token =
      localStorage.getItem(
        'access_token',
      );

    if (!token) {
      setError(
        'No active session was found.',
      );
      return;
    }

    try {
      setDeleting(true);
      setError('');

      const response = await fetch(
        `${API_URL}/events/${event.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        setError(
          data?.message ??
            'The event could not be deleted.',
        );

        return;
      }

      router.push('/event/discover');
    } catch {
      setError(
        'The server could not be reached.',
      );
    } finally {
      setDeleting(false);
    }
  }

  //Date

  function formatDate(dateValue: string) {
    const date = new Date(dateValue);

    const weekday =
      date.toLocaleDateString(
        'en-US',
        {
          weekday: 'short',
        },
      );

    const day = date.getDate();

    const month =
      date.toLocaleDateString(
        'en-US',
        {
          month: 'short',
        },
      );

    return `${weekday} ${day} ${month}`;
  }

  function formatTime(dateValue: string) {
    return new Date(
      dateValue,
    ).toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    );
  }

  //states

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#191919] text-white">
        Loading...
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#191919] px-6 text-center text-white">
        {error || 'Event not found.'}
      </main>
    );
  }

  const profileImage =
  event.store?.images?.find(
    (image) => image.isProfile,
  );

  const spotsRemaining =
    event.capacity !== undefined
      ? Math.max(
          event.capacity -
            event.participantsCount,
          0,
        )
      : null;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#191919] text-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-10 pt-16">

        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="text-[38px] font-light leading-none"
        >
          ‹
        </button>

        {/* Event content*/}
        <h1 className="mt-8 text-[24px] font-semibold">
          {event.title}
        </h1>

        {/* Store */}
        <div className="mt-7 flex items-center rounded-[18px] border border-[#343434] px-4 py-4">

          <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-[#252525]">
        {profileImage ? (
            <img
            src={profileImage.url}
            alt={event.store?.storeName ?? 'Store'}
            className="h-full w-full object-cover"
            />
        ) : (
            <Image
            src="/illustrations/store-placeholder.png"
            alt="Store"
            width={52}
            height={52}
            className="h-full w-full object-cover"
            />
        )}
        </div>

          <div className="ml-4">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-medium">
                {event.store?.storeName ??
                  'ReTag Store'}
              </p>

              {/* Verified */}
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#2864E8] text-[10px] font-bold text-white">
                ✓
              </span>
            </div>

            <p className="mt-0 text-[13px] text-[#8B8B8B]">
              Organizer
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 space-y-5">
            
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#343434]">
            <Image
                src="/icons/clock.svg"
                alt=""
                width={22}
                height={22}
            />
            </div>

            <div>
              <p className="text-[16px] font-medium">
                {formatDate(
                  event.startsAt,
                )}
              </p>

              <p className="mt-0 text-[13px] text-[#858585]">
                {formatTime(
                  event.startsAt,
                )}
                {' – '}
                {formatTime(
                  event.endsAt,
                )}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-4">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#343434]">
                <Image
                src="/icons/location.svg"
                alt=""
                width={22}
                height={22}
                />
              </div>

              <div>
                <p className="text-[16px] font-medium">
                  {event.location}
                </p>

                <p className="mt-0 text-[13px] text-[#858585]">
                  Event location
                </p>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#343434]">
              <Image
                src="/icons/participants.svg"
                alt=""
                width={22}
                height={22}
                />
            </div>

            <div>
              <p className="text-[16px] font-medium">
                {event.participantsCount}{' '}
                {event.participantsCount === 1
                  ? 'participant'
                  : 'participants'}
              </p>

              {event.capacity !==
                undefined && (
                <p className="mt-1 text-[13px] text-[#858585]">
                  Capacity{' '}
                  {event.capacity}
                  {' · '}
                  {spotsRemaining}{' '}
                  spots remaining
                </p>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <section className="mt-10">
          <h2 className="text-[16px] font-medium">
            About the event
          </h2>

          <p className="mt-2 text-[15px] leading-[1.6] text-[#F5F5F2]">
            {event.description}
          </p>
        </section>

        {error && (
          <p className="mt-6 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Store owner actions */}
      {isOwner && (
        <div className="shrink-0 border-t border-[#303030] bg-[#191919] px-7 py-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Edit */}
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/event/${event.id}/edit`,
                )
              }
              className="h-[47px] rounded-full bg-[#2864E8] text-[15px] font-medium text-white"
            >
              Edit event
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="h-[47px] rounded-full border border-white bg-transparent text-[15px] font-medium text-white disabled:opacity-50"
            >
              {deleting
                ? 'Deleting...'
                : 'Delete event'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}