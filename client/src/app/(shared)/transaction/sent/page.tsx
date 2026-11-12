'use client';

import { useRouter } from 'next/navigation';

export default function TransactionSentPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col items-center justify-center px-15">
        
        <img
        src="/illustrations/proposal-sent.png"
        alt="Proposal sent"
        className="mb-4 w-[100%]"
        />

        <div className="mb-8 text-center">
          <h1 className="text-[20px] font-medium">
            Your proposal was sent!
          </h1>

          <p className="mt-2 text-[14px] text-[#8A8A8A]">
            Check its status in Activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/activity')}
          className="
            w-[197px]
            rounded-full
            bg-[#C8F66F]
            py-3
            text-[14px]
            font-medium
            text-[#1A1A1A]
            transition-all
            duration-150
            active:scale-[0.98]
          "
        >
          Go to activity
        </button>
      </div>
    </main>
  );
}