'use client';

import { useRouter } from 'next/navigation';
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
  isStoreSale?: boolean;

  onUpdateStatus: (
    status: 'in_progress' | 'canceled',
  ) => void;
};

function getGarmentImage(
  transaction: Transaction,
) {
  const cover =
    transaction.garment.images?.find(
      (image) => image.isCover,
    );

  return (
    cover?.url ??
    transaction.garment.images?.[0]?.url ??
    ''
  );
}

export default function SaleDetail({
  transaction,
  isBuyer,
  otherUser,
  updating,
  error,
  isStoreSale = false,
  onUpdateStatus,
}: Props) {

    const accentBackground = isStoreSale
    ? 'bg-[#1465FF]'
    : 'bg-[#C8F66F]';

    const accentText = isStoreSale
    ? 'text-white'
    : 'text-[#1A1A1A]';

  const router = useRouter();

  const image = getGarmentImage(transaction);

  return (
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-[520px]">

        {/* Header */}
        <header
        className={`
            flex items-center gap-4
            border-b-1
            px-7 pb-5 pt-12
            border-[#2E2E2E]
        `}
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[24px]"
            aria-label="Go back"
          >
            ‹
          </button>

          <h1 className="text-[20px] font-medium">
            Go back
          </h1>
        </header>

        {/* Purchase information */}
        <section
          className={`px-7 pt-10 ${
            transaction.status === 'pending' &&
            !isBuyer
              ? 'pb-32'
              : 'pb-7'
          }`}
        >

          {/* Garment */}
          <div className="flex items-center gap-5 rounded-[22px] border border-white/15 p-4">

            {image ? (
              <img
                src={image}
                alt={transaction.garment.name}
                className="h-[85px] w-[90px] rounded-xl object-cover"
              />
            ) : (
              <div className="h-[85px] w-[110px] rounded-xl bg-[#242424]" />
            )}

            <div>
              <h2 className="text-[18px] font-medium">
                {transaction.garment.name}
                </h2>

                {/* Garment size */}
            {transaction.garment.size && (
            <p className="mt-2 text-[14px] text-white/50">
                Size {transaction.garment.size.label}
            </p>
            )}

                {/* Garment condition */}
            {transaction.garment.condition && (
            <p className="mt-1 text-[14px] text-white/50">
                {transaction.garment.condition.charAt(0).toUpperCase() +
                transaction.garment.condition.slice(1)}
            </p>
            )}
            </div>
          </div>

          {/* Other user */}
          <div className="mt-6 flex items-center gap-3 rounded-[22px] border border-white/15 p-4">

            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.username ?? 'User'}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#F5F5F5]" />
            )}

            <div>
              <p className="text-[14px] font-medium">
                @{otherUser?.username ?? 'user'}
              </p>

              <p className="text-[13px] text-white/50">
                {isBuyer ? 'Seller' : 'Buyer'}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-10">

            <div className="flex justify-between py-3 text-[15px]">
              <span className="text-white/50">
                Price
              </span>

              <span>
                {transaction.garment.price ?? '—'} $
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 py-3 text-[15px]">
              <span className="text-white/50">
                Shipping
              </span>

              <span>
                Free!
              </span>
            </div>

            <div className="flex justify-between py-4 font-medium">
              <span>
                Total
              </span>

              <span>
                {transaction.garment.price ?? '—'} $
              </span>
            </div>
          </div>

          {error && (
            <p className="mt-5 text-center text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Seller can accept or reject purchase */}
        {transaction.status === 'pending' &&
          !isBuyer && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#2E2E2E] bg-[#1A1A1A]/95 px-7 py-5">

              <div className="mx-auto flex max-w-[520px] gap-3">

                {/* Reject */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus('canceled')
                  }
                  className="w-1/2 rounded-full border border-[#F5F5F5] py-3 text-[14px] font-medium active:scale-[0.98] disabled:opacity-40"
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
                className={`
                    w-1/2
                    rounded-full
                    py-4
                    text-[14px]
                    font-medium
                    active:scale-[0.98]
                    disabled:opacity-40
                    ${accentBackground}
                    ${accentText}
                `}
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