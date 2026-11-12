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
    <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] px-6 text-[#F5F5F5]">
      <div className="flex w-full max-w-[520px] flex-col items-center text-center">

          <img
            src="/illustrations/proporsal-sent-2.png"
            alt="Trade accepted"
            className="mb-8 w-[180px]"
          />

          <h1 className="text-[20px] font-medium">
            Done!
          </h1>

          <p className="mt-1 text-[14px] text-white/50">
            Wait for @{otherUser?.username ?? 'user'} to contact you
          </p>

          <button
            type="button"
            onClick={() => router.push('/activity')}
            className="
              mt-8
              w-full
              max-w-[240px]
              rounded-full
              bg-[#C8F66F]
              py-4
              text-[15px]
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