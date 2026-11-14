'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function EventSentPage() {
  const router = useRouter();

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[#191919] px-8 text-white">
      <div className="flex w-full max-w-[560px] flex-col items-center text-center">

        <Image
          src="/illustrations/sent-event.png"
          alt="Event published"
          width={300}
          height={200}
          className="mb-8 h-auto w-[290px]"
          priority
        />

        {/* Message */}
        <h1 className="text-[20px] font-medium">
          Your event was published!
        </h1>

        <p className="mt-2 text-[15px] text-[#8C8C8C]">
          Check it on events
        </p>

        {/* Go to events */}
        <button
          type="button"
          onClick={() => router.push('/event/discover')}
          className="mt-8 h-[51px] w-[197px] max-w-[320px] rounded-full bg-[#2864E8] text-[15px] font-medium text-white"
        >
          Go to events
        </button>
      </div>
    </main>
  );
}