'use client';

import { useRouter } from 'next/navigation';
import TransactionGarmentCard from './transaction-garment-card';
import type {
  Transaction,
  User,
} from './transaction-types';

type Props = {
  transaction: Transaction;
  isBuyer: boolean;
  otherUser?: User;
  updating: boolean;
  error: string;
  onUpdateStatus: (
    status: 'in_progress' | 'canceled',
  ) => void;
};

function getStatusLabel(
  status: Transaction['status'],
) {
  switch (status) {
    case 'pending':
      return 'Pending';

    case 'in_progress':
      return 'Accepted';

    case 'completed':
      return 'Completed';

    case 'canceled':
      return 'Rejected';
  }
}

export default function TradeDetail({
  transaction,
  isBuyer,
  otherUser,
  updating,
  error,
  onUpdateStatus,
}: Props) {
  const router = useRouter();

  return (
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-[520px]">

        {/* Header */}
        <header className="flex items-center gap-4 border-b border-[#2E2E2E] px-7 pb-5 pt-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[34px]"
            aria-label="Go back"
          >
            ‹
          </button>

          <h1 className="text-[20px] font-medium">
            Go back
          </h1>
        </header>

        {/* Transaction content */}
        <section
          className={`px-7 pt-7 ${
            transaction.status === 'pending' &&
            !isBuyer
              ? 'pb-32'
              : 'pb-7'
          }`}
        >

          <div className="mb-8 flex items-center justify-between">

            <div className="flex items-center gap-3">

              {otherUser?.profilePicture ? (
                <img
                  src={otherUser.profilePicture}
                  alt={otherUser.username ?? 'User'}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-[#F5F5F5]" />
              )}

              {/* User information */}
              <div>
                <p className="text-[15px] font-medium">
                  {isBuyer
                    ? `You Offered to @${otherUser?.username ?? 'user'}`
                    : `@${otherUser?.username ?? 'user'}`}
                </p>

                {transaction.status === 'pending' &&
                  !isBuyer && (
                    <p className="text-[13px]">
                      Wants to trade with you
                    </p>
                  )}

                {transaction.status ===
                  'in_progress' &&
                  isBuyer && (
                    <p className="text-[13px]">
                      Your proposal was accepted
                    </p>
                  )}
              </div>
            </div>

            {/* Status */}
            <div className="rounded-full border-2 border-[#1465FF] bg-[#1466ff51] px-4 py-2 text-[14px]">
              {getStatusLabel(transaction.status)}
            </div>
          </div>

          {/* Garment offered */}
          {transaction.tradeGarment && (
            <TransactionGarmentCard
              garment={transaction.tradeGarment}
              label={
                isBuyer
                  ? `You Offer a ${transaction.tradeGarment.name}`
                  : `He Offers a ${transaction.tradeGarment.name}`
              }
              variant="green"
            />
          )}

          <div className="flex items-center justify-center py-6 text-[42px] leading-none">
            <span className="text-[#F5F5F5]">
              ↓
            </span>

            <span className="text-[#C8F66F]">
              ↑
            </span>
          </div>

          {/* Garment received / given */}
          <TransactionGarmentCard
            garment={transaction.garment}
            label={
              isBuyer
                ? `You Receive a ${transaction.garment.name}`
                : `You Give a ${transaction.garment.name}`
            }
            variant="white"
          />

          {error && (
            <p className="mt-5 text-center text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Accept / Reject */}
        {transaction.status === 'pending' &&
          !isBuyer && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#2E2E2E] bg-[#1A1A1A]/95 px-7 py-5 backdrop-blur">

              <div className="mx-auto flex max-w-[520px] gap-3">

                {/* Reject */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus('canceled')
                  }
                  className="w-1/2 rounded-full border border-[#F5F5F5] py-4 text-[14px] font-medium active:scale-[0.98] disabled:opacity-40"
                >
                  Reject
                </button>

                {/* Accept */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus('in_progress')
                  }
                  className="w-1/2 rounded-full bg-[#C8F66F] py-4 text-[14px] font-medium text-[#1A1A1A] active:scale-[0.98] disabled:opacity-40"
                >
                  Accept
                </button>

              </div>
            </div>
          )}
      </div>
    </main>
  );
}