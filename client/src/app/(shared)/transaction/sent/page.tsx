'use client';

import { useRouter } from 'next/navigation';

export default function TransactionSentPage() {
  const router = useRouter();

  return (
    <main className="flex bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center">
        
        <img
        src="/illustrations/proposal-sent.png"
        alt="Proposal sent"
        className="mb-4 w-[100%]"
        />

        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold">
            Your proposal was sent!
          </h1>

          <p className="mt-2 text-sm text-grey">
            Check its status in Activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/activity')}
          className="w-[197px] rounded-full bg-green py-3 text-sm font-medium text-background transition-all duration-150 active:scale-[0.98] min-h-11 min-w-11"
        >
          Go to activity
        </button>
      </div>
    </main>
  );
}