'use client';

import { useEffect, useState } from 'react';
import StoreBottomNav from '../../../../components/navigation/store-bottom-nav';
import StoreEventCard from '../../../../components/events/store-event-card';
import StoreCreateSheet from '../../../../components/events/store-create-sheet';
import { API_URL } from '../../../../lib/api';

type EventItem = {
  id: string;
  title: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  participantsCount?: number;
};

export default function StoreEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    async function loadMyEvents() {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('No active session was found.');
        }

        const response = await fetch(`${API_URL}/events/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ?? 'The events could not be loaded.',
          );
        }

        setEvents(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadMyEvents();
  }, []);

  return (
    <main className="min-h-screen bg-[#191919] pb-[120px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-24">
        <h1 className="text-[24px] font-medium">
          This are your events
        </h1>

        {loading && (
          <p className="mt-8 text-[#8C8C8C]">Loading...</p>
        )}

        {error && (
          <p className="mt-8 text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <div className="mt-8 space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <StoreEventCard
                key={event.id}
                event={event}
                mode="store"
                />
              ))
            ) : (
              <p className="text-[#8C8C8C]">
                You have not created any events yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-[120px] left-[210px] z-40 ml-[120px] flex h-[60px] w-[60px] -translate-x-1/2 items-center justify-center rounded-full bg-[#2864E8] text-[30px] font-light text-white shadow-[0_0_24px_rgba(40,100,232,0.45)]"
      >
        +
      </button>

      <StoreCreateSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <StoreBottomNav />
    </main>
  );
}