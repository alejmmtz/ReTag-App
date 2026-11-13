'use client';

import {
  useEffect,
  useState,
} from 'react';

import UserBottomNav from '../../../../components/navigation/store-bottom-nav';

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
    <main className="min-h-screen bg-[#191919] pb-[115px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-20">

        {/* Title */}
        <h1 className="text-[20px] font-medium">
          Look at these cool Events
        </h1>

        {/* Tabs */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveTab('explore')
            }
            className={`h-[35px] rounded-full border text-[13px] font-medium transition ${
              activeTab === 'explore'
                ? 'border-[#C8F66F] bg-[#C8F66F] text-black'
                : 'border-[#727272] text-[#929292]'
            }`}
          >
            Explore
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('mine')
            }
            className={`h-[35px] rounded-full border text-[13px] font-medium transition ${
              activeTab === 'mine'
                ? 'border-[#C8F66F] bg-[#C8F66F] text-black'
                : 'border-[#727272] text-[#929292]'
            }`}
          >
            My Events
          </button>
        </div>

        {/* Events */}
        <div className="mt-10 space-y-4">
          {loading && (
            <p className="text-[#858585]">
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
              <p className="text-[#858585]">
                {activeTab ===
                'explore'
                  ? 'There are no events yet.'
                  : 'You have not joined any events yet.'}
              </p>
            )}
        </div>
      </div>

      <UserBottomNav />
    </main>
  );
}