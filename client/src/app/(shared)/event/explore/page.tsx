'use client';

import CreateAction from '../../../../components/navigation/create-action';
import {
  useEffect,
  useState,
} from 'react';

import UserBottomNav from '../../../../components/navigation/user-bottom-nav';
import UserCreateSheet from '../../../../components/events/user-create-sheet';

import { API_URL } from '../../../../lib/api';

import type {
  Event,
} from '../../../../components/events/event-types';
import StoreEventCard from '../../../../components/events/store-event-card';

type Tab =
  | 'explore'
  | 'mine';

export default function UserEventsPage() {
  const [activeTab, setActiveTab] =
    useState<Tab>('explore');

  const [events, setEvents] =
    useState<Event[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

    const [sheetOpen, setSheetOpen] =
  useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError('');

        if (activeTab === 'explore') {
          const response = await fetch(
            `${API_URL}/events`,
            {
              cache: 'no-store',
            },
          );

          const data = await response
            .json()
            .catch(() => null);

          if (!response.ok) {
            setError(
              'The events could not be loaded.',
            );

            return;
          }

          setEvents(data);

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

        const response = await fetch(
          `${API_URL}/events/joined`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          setError(
            data?.message ??
              'Your events could not be loaded.',
          );

          return;
        }

        setEvents(data);
      } catch {
        setError(
          'The server could not be reached.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [activeTab]);

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="mx-auto w-full max-w-lg mb-28">

        {/* Title */}
        <h1 className="text-xl font-semibold">
          Look at these cool Events
        </h1>

        {/* Tabs */}
        <div className="mt-7 grid grid-cols-2 gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              setActiveTab('explore')
            }
            className={`h-[35px] rounded-full border text-sm font-medium transition ${
              activeTab === 'explore'
                ? 'border-green bg-green text-black'
                : 'border-[#727272] text-grey'
            }`}
          >
            Explore
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('mine')
            }
            className={`h-[35px] rounded-full border text-sm font-medium transition ${
              activeTab === 'mine'
                ? 'border-green bg-green text-black'
                : 'border-[#727272] text-grey'
            }`}
          >
            My Events
          </button>
        </div>

        {/* Events */}
        <div key={activeTab} className="mt-10 space-y-4 page-enter">
          {loading && (
            <p className="text-grey">
              Loading...
            </p>
          )}

          {error && (
            <p className="text-red-400">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            events.map((event) => (
              <StoreEventCard
            key={event.id}
            event={event}
            mode="user"
/>
            ))}

          {!loading &&
            !error &&
            events.length === 0 && (
              <p className="text-grey">
                {activeTab ===
                'explore'
                  ? 'There are no events yet.'
                  : 'You have not joined any events yet.'}
              </p>
            )}
        </div>
      </div>

    {/* Floating button */}
        <CreateAction role={"user"} open={sheetOpen} onClick={() => setSheetOpen(true)} />

        <UserCreateSheet
        open={sheetOpen}
        onClose={() =>
            setSheetOpen(false)
        }
        />

      <UserBottomNav />
    </main>
  );
}
