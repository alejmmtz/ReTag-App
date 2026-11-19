'use client';

import AssetIcon from '../icons/asset-icon';
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
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg">

        {/* Header */}
        <header className="flex items-center gap-4 border-b border-line pb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm min-h-11 min-w-11"
            aria-label="Go back"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>

          <h1 className="text-xl font-semibold">
            Go back
          </h1>
        </header>

        {/* Transaction content */}
        <section
          className={` pt-7 ${
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
                <div className="h-10 w-10 rounded-lg bg-foreground" />
              )}

              {/* User information */}
              <div>
                <p className="text-sm font-medium">
                  {isBuyer
                    ? `You Offered to @${otherUser?.username ?? 'user'}`
                    : `@${otherUser?.username ?? 'user'}`}
                </p>

                {transaction.status === 'pending' &&
                  !isBuyer && (
                    <p className="text-sm">
                      Wants to trade with you
                    </p>
                  )}

                {transaction.status ===
                  'in_progress' &&
                  isBuyer && (
                    <p className="text-sm">
                      Your proposal was accepted
                    </p>
                  )}
              </div>
            </div>

            {/* Status */}
            <div className="rounded-full border-2 border-[#1465FF] bg-[#1466ff51] px-4 py-2 text-sm">
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

          <div className="flex items-center justify-center py-6">
            <span aria-hidden="true" className="inline-block h-6 w-6" />
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
            <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 px-8 py-5 backdrop-blur">

              <div className="mx-auto flex max-w-lg gap-3">

                {/* Reject */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus('canceled')
                  }
                  className="button-pill w-1/2 border border-foreground active:scale-[0.98] disabled:opacity-40"
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
                  className="button-pill w-1/2 bg-green text-background active:scale-[0.98] disabled:opacity-40"
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
