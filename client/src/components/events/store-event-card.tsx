'use client';

import Image from 'next/image';
import Link from 'next/link';

type EventItem = {
  id: string;
  title: string;
  location?: string;
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

export default function StoreEventCard({ event }: Props) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="block rounded-[22px] border border-[#6C6C6C] bg-transparent p-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-[78px] w-[78px] items-center justify-center rounded-[18px] bg-[#2864E8]">
          <Image
            src="/illustrations/star.png"
            alt=""
            width={70}
            height={70}
            />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[20px] font-semibold text-white">
            {event.title}
          </h2>

          {/* Store name */}
            <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[13px] font-regular text-[#D0D0D0]">
                {event.store?.storeName ?? 'ReTag Store'}
            </span>

            <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#2864E8] text-[9px] font-bold text-white">
                ✓
            </span>
            </div>

          {/* Date + participants */}
        <div className="mt-2 flex items-center gap-4 text-[12px] font-regular text-[#CFCFCF]">
        {/* Date */}
        <div className="flex min-w-0 items-center gap-1.5">
            <Image
            src="/icons/calendar.svg"
            alt=""
            width={15}
            height={15}
            className="shrink-0"
            />

            <span className="truncate">
            {formatEventDate(event.startsAt)}
            {' · '}
            {formatEventTime(event.startsAt)}
            {' – '}
            {formatEventTime(event.endsAt)}
            </span>
        </div>

        {/* Participants */}
        <div className="flex shrink-0 items-center gap-1.5">
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