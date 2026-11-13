'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_URL } from '../../../../../lib/api';

type Props = {
  eventId: string;
};

type EventData = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  capacity?: number;
};

export default function EditEventForm({
  eventId,
}: Props) {
  const router = useRouter();

  //form

  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] =
    useState('');
  const [endsAt, setEndsAt] =
    useState('');
  const [location, setLocation] =
    useState('');
  const [capacity, setCapacity] =
    useState('');
  const [description, setDescription] =
    useState('');


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');


  function toDateTimeLocal(
    value: string,
  ) {
    const date = new Date(value);

    const pad = (number: number) =>
      String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1,
    )}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }


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
            'The event could not be loaded.',
          );

          return;
        }

        const data: EventData =
          await response.json();

        setTitle(data.title);

        setDescription(
          data.description,
        );

        setStartsAt(
          toDateTimeLocal(
            data.startsAt,
          ),
        );

        setEndsAt(
          toDateTimeLocal(
            data.endsAt,
          ),
        );

        setLocation(
          data.location ?? '',
        );

        setCapacity(
          data.capacity
            ? String(data.capacity)
            : '',
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

  //update event

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    if (
      !title.trim() ||
      !startsAt ||
      !endsAt ||
      !description.trim()
    ) {
      setError(
        'Please complete all required fields.',
      );

      return;
    }

    if (
      new Date(endsAt) <=
      new Date(startsAt)
    ) {
      setError(
        'The event must end after it starts.',
      );

      return;
    }

    const capacityNumber =
      Number(capacity);

    if (
      !Number.isInteger(capacityNumber) ||
      capacityNumber < 1
    ) {
      setError(
        'Capacity must be at least 1.',
      );

      return;
    }

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
      setSaving(true);

      const response = await fetch(
        `${API_URL}/events/${eventId}`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: title.trim(),

            description:
              description.trim(),

            startsAt:
              new Date(
                startsAt,
              ).toISOString(),

            endsAt:
              new Date(
                endsAt,
              ).toISOString(),

            location:
              location.trim() ||
              undefined,

            capacity:
              capacityNumber,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        setError(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message ??
                'The event could not be updated.',
        );

        return;
      }

      // Return to event detail
      router.push(
        `/event/${eventId}`,
      );
    } catch {
      setError(
        'The server could not be reached.',
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#191919] text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-[#191919] text-white">
      {/* Header */}
      <header className="border-b border-[#303030] px-8 pb-8 pt-20">
        <div className="mx-auto flex w-full max-w-[560px] items-center gap-5">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            aria-label="Go back"
            className="text-[30px] font-light leading-none"
          >
            ‹
          </button>

          <h1 className="text-[20px] font-medium">
            Edit event
          </h1>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-[calc(100vh-130px)] w-full max-w-[560px] flex-col"
      >
        <div className="flex-1 px-6 pb-10 pt-5">

          {/* Name */}
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-[12px] text-[#969696]"
            >
              Name
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              required
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none focus:border-[#555555]"
            />
          </div>

          {/* Dates */}
          <div className="mt-5 grid grid-cols-2 gap-4">

            {/* Starts */}
            <div>
              <label
                htmlFor="startsAt"
                className="mb-1 block text-[12px] text-[#969696]"
              >
                Starts at
              </label>

              <input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value,
                  )
                }
                onClick={(event) => {
                  event.currentTarget.showPicker();
                }}
                required
                className="h-[60px] w-full cursor-pointer rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none focus:border-[#555555]"
              />
            </div>

            {/* Ends */}
            <div>
              <label
                htmlFor="endsAt"
                className="mb-1 block text-[12px] text-[#969696]"
              >
                Ends at
              </label>

              <input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(event) =>
                  setEndsAt(
                    event.target.value,
                  )
                }
                onClick={(event) => {
                  event.currentTarget.showPicker();
                }}
                required
                className="h-[60px] w-full cursor-pointer rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mt-5">
            <label
              htmlFor="location"
              className="mb-1 block text-[12px] text-[#969696]"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none focus:border-[#555555]"
            />
          </div>

          {/* Capacity */}
          <div className="mt-5">
            <label
              htmlFor="capacity"
              className="mb-1 block text-[12px] text-[#969696]"
            >
              Capacity
            </label>

            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(event) =>
                setCapacity(
                  event.target.value,
                )
              }
              required
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none focus:border-[#555555]"
            />
          </div>

          {/* Description */}
          <div className="mt-5">
            <label
              htmlFor="description"
              className="mb-2 block text-[12px] text-[#969696]"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              required
              maxLength={650}
              className="h-[110px] w-full resize-none rounded-[14px] border border-[#363636] bg-[#202020] px-5 py-4 text-[13px] leading-[1.5] text-white outline-none focus:border-[#555555]"
            />

            <p className="mt-1 text-right text-[12px] text-[#707070]">
              {description.length}/650
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="mt-5 text-sm text-red-400"
            >
              {error}
            </p>
          )}
        </div>

        {/* Bottom action */}
        <div className="sticky bottom-0 border-t border-[#303030] bg-[#191919] px-6 py-5">
          <button
            type="submit"
            disabled={saving}
            className="h-[47px] w-full rounded-full bg-[#2864E8] text-[15px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  );
}