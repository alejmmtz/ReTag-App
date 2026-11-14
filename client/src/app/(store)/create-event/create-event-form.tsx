'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_URL } from '../../../lib/api';

export default function CreateEventForm() {
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
    useState(false);

  const [error, setError] =
    useState('');

  //create event

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
      setLoading(true);

      const response = await fetch(
        `${API_URL}/events`,
        {
          method: 'POST',

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
                'The event could not be created.',
        );

        return;
      }

      //Open the event that was just created
      router.push('/create-event/sent');
    } catch {
      setError(
        'The server could not be reached.',
      );
    } finally {
      setLoading(false);
    }
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
            New event
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
              placeholder="Great Spring Exchange"
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none placeholder:text-[#E7E7E7] focus:border-[#555555]"
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
                    setStartsAt(event.target.value)
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
                className="mb-1 block text-[12px] text-[#969696]"              >
                Ends at
              </label>

            <input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(event) =>
                setEndsAt(event.target.value)
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
            className="mb-1 block text-[12px] text-[#969696]"            >
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
              placeholder="Parque del Perro, San Fernando, Cali"
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none placeholder:text-[#E7E7E7] focus:border-[#555555]"
            />
          </div>

          {/* Capacity */}
          <div className="mt-5">
            <label
              htmlFor="capacity"
            className="mb-1 block text-[12px] text-[#969696]"            >
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
              placeholder="30"
              className="h-[60px] w-full rounded-[11px] border border-[#363636] bg-[#202020] px-5 text-[13px] text-white outline-none placeholder:text-[#E7E7E7] focus:border-[#555555]"
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
                setDescription(event.target.value)
                }
                required
                maxLength={650}
                placeholder="Tell people about your event..."
                className="h-[110px] w-full resize-none rounded-[14px] border border-[#363636] bg-[#202020] px-5 py-4 text-[13px] leading-[1.5] text-white outline-none placeholder:text-[#E7E7E7] focus:border-[#555555]"
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
            disabled={loading}
            className="h-[47px] w-full rounded-full bg-[#2864E8] text-[15px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
            {loading
            ? 'Posting...'
            : 'Post it'}
        </button>
        </div>
      </form>
    </main>
  );
}