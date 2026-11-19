'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function EventSentPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="flex w-full max-w-lg flex-col items-center text-center">

        <Image
          src="/illustrations/sent-event.png"
          alt="Event published"
          width={300}
          height={200}
          className="mb-8 h-auto w-[290px]"
          priority
        />

        {/* Message */}
        <h1 className="text-xl font-semibold">
          Your event was published!
        </h1>

        <p className="mt-2 text-sm text-[#8C8C8C]">
          Check it on events
        </p>

        {/* Go to events */}
        <button
          type="button"
          onClick={() => router.push('/event/discover')}
          className="button-pill mt-8 w-[197px] max-w-[320px] bg-blue text-foreground"
        >
          Go to events
        </button>
      </div>
    </main>
  );
}