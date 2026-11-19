'use client';

import { useRouter } from 'next/navigation';
import type {
  Transaction,
  User,
} from './transaction-types';

type Props = {
  transaction: Transaction;
  otherUser?: User;
  isStoreSale?: boolean;
};

function getGarmentImage(transaction: Transaction) {
  const cover = transaction.garment.images?.find(
    (image) => image.isCover,
  );

  return (
    cover?.url ??
    transaction.garment.images?.[0]?.url ??
    ''
  );
}

export default function SaleAccepted({
  transaction,
  otherUser,
  isStoreSale = false,
}: Props) {
  const router = useRouter();

  const image = getGarmentImage(transaction);

  const phone = otherUser?.phone ?? '';
  const whatsappPhone = phone.replace(/\D/g, '');

  //Store=blue / User=green
  const accentBackground = isStoreSale
    ? 'bg-[#1465FF]'
    : 'bg-[#C8F66F]';

  const accentText = isStoreSale
    ? 'text-white'
    : 'text-[#1A1A1A]';

  const username =
    otherUser?.username ?? 'user';

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg pb-28">

        <section className="flex flex-col items-center text-center">

          {/* Title */}
          <h1 className="text-xl font-semibold">
            You sold a Garment
          </h1>

          {/* Illustration */}
          <img
            src="/illustrations/proposal-sent.png"
            alt="Garment sold"
            className="mt-6 w-[148px]"
          />

          {/* Message */}
          <p className="mt-6 max-w-[360px] text-sm text-foreground/50">
            <span
              className={
                isStoreSale
                  ? 'text-[#1465FF]'
                  : 'text-green'
              }
            >
              @{username}
            </span>{' '}
            can now contact you to arrange payment and delivery.
          </p>
        </section>

        {/*Contact card */}

        <section className="mt-10 rounded-[16px] border border-white/50 p-4">

          {/* Buyer */}
          <div className="flex items-center gap-3">

            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={username}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-foreground" />
            )}

            <p className="text-sm font-medium">
              @{username}
            </p>
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-white/30" />

          {/* Contact buttons */}
          <div className="flex gap-3">

            {/* Phone */}
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex w-1/2 items-center justify-center rounded-full bg-foreground py-3 text-sm font-medium text-background active:scale-[0.98] min-h-11"
              >
                ☎ Contact
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-foreground py-3 text-sm font-medium text-background opacity-40 min-h-11 min-w-11"
              >
                ☎ Contact
              </button>
            )}

            {/* WhatsApp */}
            {whatsappPhone ? (
              <a
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-1/2 items-center justify-center rounded-full bg-green py-3 text-sm font-medium text-background active:scale-[0.98] min-h-11"
              >
                WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-green py-3 text-sm font-medium text-background opacity-40 min-h-11 min-w-11"
              >
                WhatsApp
              </button>
            )}
          </div>
        </section>

        {/* sold garment */}

        <section className="mt-8">

          <div className="relative overflow-hidden rounded-2xl border-4 border-foreground">

            {/* Garment label */}
            <div className="absolute left-0 top-0 z-10 max-w-[85%] rounded-br-[24px] bg-foreground px-3 py-2 text-background">
              <p className="truncate text-sm font-medium">
                {transaction.garment.name}
              </p>
            </div>

            {/* Garment image */}
            {image ? (
              <img
                src={image}
                alt={transaction.garment.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-surface text-foreground/50">
                No image
              </div>
            )}
          </div>

        </section>
      </div>

      {/* go to activity*/}

      <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/95 px-8 py-5 backdrop-blur">
        <div className="mx-auto w-full max-w-lg">

          <button
            type="button"
            onClick={() => router.push('/activity')}
            className={`button-pill 
              w-full
              
              
              
              
              transition-all
              duration-150
              active:scale-[0.98]
              ${accentBackground}
              ${accentText}
            `}
          >
            Go to activity
          </button>

        </div>
      </div>
    </main>
  );
}
