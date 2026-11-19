'use client';

import { useRouter } from 'next/navigation';
import type { User } from './transaction-types';

type Props = {
  otherUser?: User;
};

export default function TransactionDone({
  otherUser,
}: Props) {
  const router = useRouter();

  return (
    <main className="flex items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="flex w-full max-w-lg flex-col items-center text-center">

          <img
            src="/illustrations/proposal-sent.png"
            alt="Trade accepted"
            className="mb-8 w-[180px]"
          />

          <h1 className="text-xl font-semibold">
            Done!
          </h1>

          <p className="mt-1 text-sm text-foreground/50">
            Wait for @{otherUser?.username ?? 'user'} to contact you
          </p>

          <button
            type="button"
            onClick={() => router.push('/activity')}
            className="button-pill mt-8 w-full max-w-[240px] bg-green text-background transition-all duration-150 active:scale-[0.98]"
          >
            Go to activity
          </button>

        </div>
    </main>
  );
}
