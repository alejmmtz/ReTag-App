'use client';

import Image from 'next/image';
import Link from 'next/link';

type EventItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  participantsCount?: number;

  store?: {
    id: string;
    storeName: string;
  };
};

type Props = {
  event: EventItem;
  mode: 'user' | 'store';
};

function formatEventDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatEventTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function StoreEventCard({
  event,
  mode,
}: Props) {
  return (
    <Link
      href={`/event/${event.id}?mode=${mode}`}
      className="block w-full rounded-[18px] border border-[#6C6C6C] bg-transparent p-4"
    >
      <div className="flex items-center gap-4">
        {/* Illustration */}
        <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#2864E8]">
          <Image
            src="/illustrations/star.png"
            alt=""
            width={70}
            height={70}
            className="h-[70px] w-[70px] object-contain"
          />
        </div>

        {/* Event info */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h2 className="truncate text-[18px] font-semibold leading-tight text-white">
            {event.title}
          </h2>

          {/* Store */}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="truncate text-[14px] text-[#D0D0D0]">
              {event.store?.storeName ?? 'ReTag Store'}
            </span>

            <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[#2864E8] text-[9px] font-bold text-white">
              ✓
            </span>
          </div>

          {/* Date + participants */}
          <div className="mt-2 flex items-center gap-3 text-[12px] text-[#CFCFCF]">
            {/* Date */}
            <div className="flex min-w-0 items-center gap-1.5">
              <Image
                src="/icons/calendar.svg"
                alt=""
                width={15}
                height={15}
                className="shrink-0"
              />

              <span className="truncate whitespace-nowrap">
                {formatEventDate(event.startsAt)}
                {' · '}
                {formatEventTime(event.startsAt)}
                {' – '}
                {formatEventTime(event.endsAt)}
              </span>
            </div>

            {/* Participants */}
            <div className="flex shrink-0 items-center gap-1">
              <Image
                src="/icons/participants.svg"
                alt=""
                width={15}
                height={15}
              />

              <span>
                {event.participantsCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}