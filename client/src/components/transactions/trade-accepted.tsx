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
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg pb-28">

        <section className="flex flex-col items-center text-center">

          <h1 className="text-xl font-semibold">
            Your proposal was accepted!
          </h1>

          {/* Illustration */}
          <img
            src="/illustrations/proposal-sent.png"
            alt="Trade accepted"
            className="mt-6 w-[148px]"
          />

          <p className="mt-6 text-sm text-foreground/50">
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
              <div className="h-10 w-10 rounded-lg bg-foreground" />
            )}

            <p className="text-sm font-medium">
              @{otherUser?.username ?? 'user'}
            </p>
          </div>

          <div className="my-3 h-px bg-white/30" />

          <div className="flex gap-3">

            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex w-1/2 items-center justify-center rounded-full bg-foreground py-3 text-sm font-medium text-background active:scale-[0.98] min-h-11"
              >
                ☎  Contact
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 rounded-full bg-foreground py-2 text-sm font-medium text-background opacity-40 min-h-11 min-w-11"
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

        {/* garment = garment the buyer wanted to receive */}

        <section className="mt-7">
          <TransactionGarmentCard
            garment={transaction.garment}
            label={`He Offers a ${transaction.garment.name}`}
            variant="white"
          />
        </section>

        <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/95 px-8 py-5 backdrop-blur">
        <div className="mx-auto w-full max-w-lg">
            <button
            type="button"
            onClick={() => router.push('/activity')}
            className="button-pill w-full bg-green text-background transition-all duration-150 active:scale-[0.98]"
            >
            Go to activity
            </button>
        </div>
        </div>

        {transaction.tradeGarment && (
          <>
            <div className="flex items-center justify-center py-6">
              <span aria-hidden="true" className="inline-block h-6 w-6" />
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
