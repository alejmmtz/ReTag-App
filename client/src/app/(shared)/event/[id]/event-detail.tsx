'use client';

import AssetIcon from '../../../../components/icons/asset-icon';
import Image from 'next/image';
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

type Props = {
  eventId: string;
  mode: 'user' | 'store';
};


export default function EventDetail({
  eventId,
  mode,
}: Props) {
  const router = useRouter();

  const [event, setEvent] =
    useState<Event | null>(null);

  const [isOwner, setIsOwner] =
    useState(false);

    const [joined, setJoined] =
    useState(false);

const [updatingParticipation, setUpdatingParticipation] =
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

        const owner =
        eventData.store?.userId ===
        currentUser.id;

        setIsOwner(owner);

        //in user mode, check whether this user already participates in the event
        if (mode === 'user' && !owner) {
        const participationResponse =
            await fetch(
            `${API_URL}/events/${eventId}/participation`,
            {
                headers: {
                Authorization:
                    `Bearer ${token}`,
                },
                cache: 'no-store',
            },
            );

        if (participationResponse.ok) {
            const participation =
            await participationResponse.json();

            setJoined(
            participation.joined === true,
            );
        }
        }
      } catch {
        setError(
          'The server could not be reached.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, mode]);

  //participation

    async function handleParticipation() {
    if (!event || isOwner) return;

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
        setUpdatingParticipation(true);
        setError('');

        const response = await fetch(
        `${API_URL}/events/${event.id}/${
            joined ? 'leave' : 'join'
        }`,
        {
            method: joined
            ? 'PATCH'
            : 'POST',

            headers: {
            Authorization:
                `Bearer ${token}`,
            },
        },
        );

        const data = await response
        .json()
        .catch(() => null);

        if (!response.ok) {
        setError(
            data?.message ??
            'The participation could not be updated.',
        );

        return;
        }

        // Update UI immediately
        setJoined(!joined);

        setEvent((currentEvent) => {
        if (!currentEvent) {
            return currentEvent;
        }

        return {
            ...currentEvent,

            participantsCount:
            joined
                ? Math.max(
                    currentEvent.participantsCount -
                    1,
                    0,
                )
                : currentEvent.participantsCount +
                1,
        };
        });
    } catch {
        setError(
        'The server could not be reached.',
        );
    } finally {
        setUpdatingParticipation(false);
    }
    }

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
      <main className="flex items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        Loading...
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex items-center justify-center bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        {error || 'Event not found.'}
      </main>
    );
  }

  const profileImage =
  event.store?.images?.find(
    (image) => image.isProfile,
  );

    const hasCapacity =
    typeof event.capacity === 'number';

    const spotsRemaining =
    hasCapacity
        ? Math.max(
            event.capacity! -
            event.participantsCount,
            0,
        )
        : null;

  return (
    <main className="flex flex-col bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="min-w-0 flex-1 pb-8">

        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="text-sm font-light leading-none min-h-11 min-w-11"
        >
          <AssetIcon name="chevron" width={9} height={16} />
        </button>

        {/* Event content*/}
        <h1 className="mt-8 text-xl font-semibold">
          {event.title}
        </h1>

        {/* Store */}
        <div className="mt-7 flex items-center rounded-[18px] border border-line px-4 py-4">

          <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-surface">
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
              <p className="text-sm font-medium">
                {event.store?.storeName ??
                  'ReTag Store'}
              </p>

              {/* Verified */}
              <Image src="/icons/verified-badge.svg" alt="Verified" width={16} height={16} className="shrink-0" />
            </div>

            <p className="mt-0 text-sm text-grey">
              Organizer
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="mt-8 space-y-5">
            
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-line">
            <AssetIcon
                name="clock"
                width={22}
                height={22}
            />
            </div>

            <div>
              <p className="text-sm font-medium">
                {formatDate(
                  event.startsAt,
                )}
              </p>

              <p className="mt-0 text-sm text-grey">
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
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-line">
                <AssetIcon
                name="location"
                width={22}
                height={22}
                />
              </div>

              <div>
                <p className="text-sm font-medium">
                  {event.location}
                </p>

                <p className="mt-0 text-sm text-grey">
                  Event location
                </p>
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-line">
              <AssetIcon
                name="participants"
                width={22}
                height={22}
                />
            </div>

            <div>
              <p className="text-sm font-medium">
                {event.participantsCount}{' '}
                {event.participantsCount === 1
                  ? 'participant'
                  : 'participants'}
              </p>

              {hasCapacity && (
                <p className="mt-1 text-sm text-grey">
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
          <h2 className="text-base font-semibold">
            About the event
          </h2>

          <p className="mt-2 text-sm leading-[1.6] text-foreground">
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
    {/* Bottom actions */}

{/* Store mode - owner */}
{mode === 'store' && isOwner && (
  <div className="shrink-0 border-t border-line bg-background py-5">
    <div className="grid grid-cols-2 gap-3 min-w-0">
      {/* Edit */}
      <button
        type="button"
        onClick={() =>
          router.push(
            `/event/${event.id}/edit`,
          )
        }
        className="button-pill bg-blue text-foreground"
      >
        Edit event
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="button-pill border border-white bg-transparent text-foreground disabled:opacity-50"
      >
        {deleting
          ? 'Deleting...'
          : 'Delete event'}
      </button>
    </div>
  </div>
)}

        {/* user mode and other stores event */}
        {mode === 'user' && !isOwner && (
        <div className="shrink-0 border-t border-line bg-background py-5">
            <button
            type="button"
            onClick={handleParticipation}
            disabled={updatingParticipation}
            className={`button-pill  w-full    transition ${
                joined
                ? 'bg-green/20 text-green'
                : 'bg-green text-black'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            >
            {updatingParticipation
                ? 'Updating...'
                : joined
                ? 'Participated'
                : 'Participate'}
            </button>
        </div>
        )}
    </main>
  );
}
