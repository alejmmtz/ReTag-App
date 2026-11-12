'use client';

import { useRouter } from 'next/navigation';
import TransactionGarmentCard from './transaction-garment-card';
import type {
  Transaction,
  User,
} from './transaction-types';

type Props = {
  transaction: Transaction;
  otherUser?: User;
};

export default function TradeAccepted({
  transaction,
  otherUser,
}: Props) {
  const router = useRouter();

  //Phone used for Contact / WhatsApp
  const phone = otherUser?.phone ?? '';
  const whatsappPhone = phone.replace(/\D/g, '');

  return (
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-[520px] px-6 pb-[140px] pt-20">

        <section className="flex flex-col items-center text-center">

          <h1 className="text-[20px] font-medium">
            Your proposal was accepted!
          </h1>

          {/* Illustration */}
          <img
            src="/illustrations/proporsal-sent-2.png"
            alt="Trade accepted"
            className="mt-6 w-[148px]"
          />

          <p className="mt-6 text-[14px] text-white/50">
            Get in touch to coordinate the exchange.
          </p>
        </section>

        {/* contact card */}

        <section className="mt-10 mb-10 rounded-[10px] border border-white/50 p-4">

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

            <p className="text-[14px] font-medium">
              @{otherUser?.username ?? 'user'}
            </p>
          </div>

          <div className="my-3 h-px bg-white/30" />

          <div className="flex gap-3">

            {phone ? (
              <a
                href={`tel:${phone}`}
                className="
                  flex w-1/2
                  items-center justify-center
                  rounded-full
                  bg-[#F5F5F5]
                  py-3
                  text-[12px]
                  font-medium
                  text-[#1A1A1A]
                  active:scale-[0.98]
                "
              >
                ☎  Contact
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-[#F5F5F5] py-2 text-[14px] font-medium text-[#1A1A1A] opacity-40"
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
                className="
                  flex w-1/2
                  items-center justify-center
                  rounded-full
                  bg-[#C8F66F]
                  py-3
                  text-[12px]
                  font-medium
                  text-[#1A1A1A]
                  active:scale-[0.98]
                "
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

        {/* garment = garment the buyer wanted to receive */}

        <section className="mt-7">
          <TransactionGarmentCard
            garment={transaction.garment}
            label={`He Offers a ${transaction.garment.name}`}
            variant="white"
          />
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#1A1A1A]/95 px-6 py-5 backdrop-blur">
        <div className="mx-auto w-full max-w-[520px]">
            <button
            type="button"
            onClick={() => router.push('/activity')}
            className="
                w-full
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
        </div>

        {transaction.tradeGarment && (
          <>
            <div className="flex items-center justify-center py-6 text-[42px] leading-none">
              <span className="text-[#F5F5F5]">
                ↓
              </span>

              <span className="text-[#C8F66F]">
                ↑
              </span>
            </div>

            {/* tradeGarment = garment the buyer gives */}

            <TransactionGarmentCard
              garment={transaction.tradeGarment}
              label={`You Give a ${transaction.tradeGarment.name}`}
              variant="green"
            />
          </>
        )}

      </div>
    </main>
  );
}