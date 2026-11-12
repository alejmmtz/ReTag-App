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
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-[520px] px-6 pb-[140px] pt-20">

        <section className="flex flex-col items-center text-center">

          {/* Title */}
          <h1 className="text-[20px] font-medium">
            You sold a Garment
          </h1>

          {/* Illustration */}
          <img
            src="/illustrations/proporsal-sent-2.png"
            alt="Garment sold"
            className="mt-6 w-[148px]"
          />

          {/* Message */}
          <p className="mt-6 max-w-[360px] text-[14px] text-white/50">
            <span
              className={
                isStoreSale
                  ? 'text-[#1465FF]'
                  : 'text-[#C8F66F]'
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
              <div className="h-10 w-10 rounded-lg bg-[#F5F5F5]" />
            )}

            <p className="text-[14px] font-medium">
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
                className="flex w-1/2 items-center justify-center rounded-full bg-[#F5F5F5] py-3 text-[12px] font-medium text-[#1A1A1A] active:scale-[0.98]"
              >
                ☎ Contact
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-[#F5F5F5] py-3 text-[14px] font-medium text-[#1A1A1A] opacity-40"
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
                className="flex w-1/2 items-center justify-center rounded-full bg-[#C8F66F] py- text-[12px] font-medium text-[#1A1A1A] active:scale-[0.98]"
              >
                WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-[#C8F66F] py-3 text-[14px] font-medium text-[#1A1A1A] opacity-40"
              >
                WhatsApp
              </button>
            )}
          </div>
        </section>

        {/* sold garment */}

        <section className="mt-8">

          <div className="relative overflow-hidden rounded-2xl border-4 border-[#F5F5F5]">

            {/* Garment label */}
            <div className="absolute left-0 top-0 z-10 max-w-[85%] rounded-br-[24px] bg-[#F5F5F5] px-3 py-2 text-[#1A1A1A]">
              <p className="truncate text-[14px] font-medium">
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
              <div className="flex aspect-square items-center justify-center bg-[#242424] text-white/50">
                No image
              </div>
            )}
          </div>

        </section>
      </div>

      {/* go to activity*/}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#1A1A1A]/95 px-6 py-5 backdrop-blur">
        <div className="mx-auto w-full max-w-[520px]">

          <button
            type="button"
            onClick={() => router.push('/activity')}
            className={`
              w-full
              rounded-full
              py-4
              text-[15px]
              font-medium
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