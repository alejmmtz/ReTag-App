'use client';

import AssetIcon from '../../../components/icons/asset-icon';
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
    <main className="flex flex-col bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      {/* Header */}
      <header className="border-b border-line pb-6">
        <div className="mx-auto flex w-full max-w-lg items-center gap-5">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            aria-label="Go back"
            className="text-sm font-light leading-none min-h-11 min-w-11"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>

          <h1 className="text-xl font-semibold">
            New event
          </h1>
        </div>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-lg flex-col"
      >
        <div className="flex-1 py-8">

          {/* Name */}
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-xs text-grey"
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
              className="h-12 w-full rounded-[11px] border border-line bg-surface px-5 text-sm text-foreground outline-none placeholder:text-[#E7E7E7] focus:border-[#555555] min-h-11"
            />
          </div>

          {/* Dates */}
          <div className="mt-5 grid grid-cols-1 min-[440px]:grid-cols-2 gap-4 min-w-0">
            {/* Starts */}
            <div>
              <label
                htmlFor="startsAt"
                className="mb-1 block text-xs text-grey"
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
                className="h-12 w-full cursor-pointer rounded-[11px] border border-line bg-surface px-5 text-sm text-foreground outline-none focus:border-[#555555] min-h-11"
                />
            </div>

            {/* Ends */}
            <div>
              <label
                htmlFor="endsAt"
                className="mb-1 block text-xs text-grey"              >
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
            className="h-12 w-full cursor-pointer rounded-[11px] border border-line bg-surface px-5 text-sm text-foreground outline-none focus:border-[#555555] min-h-11"
            />
            </div>
          </div>

          {/* Location */}
          <div className="mt-5">
            <label
              htmlFor="location"
            className="mb-1 block text-xs text-grey"            >
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
              className="h-12 w-full rounded-[11px] border border-line bg-surface px-5 text-sm text-foreground outline-none placeholder:text-[#E7E7E7] focus:border-[#555555] min-h-11"
            />
          </div>

          {/* Capacity */}
          <div className="mt-5">
            <label
              htmlFor="capacity"
            className="mb-1 block text-xs text-grey"            >
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
              className="h-12 w-full rounded-[11px] border border-line bg-surface px-5 text-sm text-foreground outline-none placeholder:text-[#E7E7E7] focus:border-[#555555] min-h-11"
            />
          </div>

          {/* Description */}
            <div className="mt-5">
            <label
                htmlFor="description"
                className="mb-2 block text-xs text-grey"
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
                className="h-[110px] w-full resize-none rounded-[14px] border border-line bg-surface px-5 py-4 text-sm leading-[1.5] text-foreground outline-none placeholder:text-[#E7E7E7] focus:border-[#555555]"
            />

            <p className="mt-1 text-right text-xs text-[#707070]">
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
        <div className="sticky bottom-0 border-t border-line bg-background py-5">
        <button
            type="submit"
            disabled={loading}
            className="button-pill w-full bg-blue text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
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
