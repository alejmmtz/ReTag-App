'use client';

import AssetIcon from '../icons/asset-icon';
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
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg">

        {/* Header */}
        <header
        className={`
 flex items-center gap-4
 border-b-1
 pb-6 
 border-line
 `}
        >
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

        {/* Purchase information */}
        <section
          className={` pt-10 ${
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
              <div className="h-[85px] w-[110px] rounded-xl bg-surface" />
            )}

            <div>
              <h2 className="text-base font-semibold">
                {transaction.garment.name}
                </h2>

                {/* Garment size */}
            {transaction.garment.size && (
            <p className="mt-2 text-sm text-foreground/50">
                Size {transaction.garment.size.label}
            </p>
            )}

                {/* Garment condition */}
            {transaction.garment.condition && (
            <p className="mt-1 text-sm text-foreground/50">
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
              <div className="h-10 w-10 rounded-full bg-foreground" />
            )}

            <div>
              <p className="text-sm font-medium">
                @{otherUser?.username ?? 'user'}
              </p>

              <p className="text-sm text-foreground/50">
                {isBuyer ? 'Seller' : 'Buyer'}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-10">

            <div className="flex justify-between py-3 text-sm">
              <span className="text-foreground/50">
                Price
              </span>

              <span>
                {transaction.garment.price ?? '—'} $
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 py-3 text-sm">
              <span className="text-foreground/50">
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
            <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 px-8 py-5">

              <div className="mx-auto flex max-w-lg gap-3">

                {/* Reject */}
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus('canceled')
                  }
                  className="w-1/2 rounded-full border border-foreground py-3 text-sm font-medium active:scale-[0.98] disabled:opacity-40 min-h-11 min-w-11"
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
                className={`button-pill 
                    w-1/2
                    
                    
                    
                    
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
