'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../../lib/api';

type GarmentImage = {
  id: number;
  url: string;
  isCover: boolean;
};

type Seller = {
  id: string;
  username: string;
  profilePicture?: string | null;
};

type Garment = {
  id: string;
  name: string;
  images?: GarmentImage[];
  seller?: Seller;
};

type Props = {
  garmentId: string;
  tradeGarmentId: string;
  showContinue?: boolean;
};

function getGarmentImage(garment: Garment) {
  const cover = garment.images?.find((image) => image.isCover);

  return cover?.url ?? garment.images?.[0]?.url ?? '';
}

export default function ReviewProposal({
  garmentId,
  tradeGarmentId,
  showContinue = true,
}: Props) {
  const router = useRouter();

  const [receiveGarment, setReceiveGarment] =
    useState<Garment | null>(null);

  const [offerGarment, setOfferGarment] =
    useState<Garment | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGarments() {
      if (!garmentId || !tradeGarmentId) {
        setError('Transaction information is missing.');
        setLoading(false);
        return;
      }

      try {
        const [receiveResponse, offerResponse] =
          await Promise.all([
            fetch(`${API_URL}/garments/${garmentId}`),
            fetch(`${API_URL}/garments/${tradeGarmentId}`),
          ]);

        if (!receiveResponse.ok || !offerResponse.ok) {
          throw new Error('The garments could not be loaded.');
        }

        const receiveData: Garment =
          await receiveResponse.json();

        const offerData: Garment =
          await offerResponse.json();

        setReceiveGarment(receiveData);
        setOfferGarment(offerData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadGarments();
  }, [garmentId, tradeGarmentId]);

  async function handleContinue() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('You need to be logged in.');
      return;
    }

    try {
      setSending(true);
      setError('');

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          garmentId,
          transactionType: 'trade',
          tradeGarmentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message ?? 'The proposal could not be sent.',
        );
      }

      const transaction = await response.json();

    router.push(`/transaction/sent?transactionId=${transaction.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong.',
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] text-[#F5F5F5]">
        Loading...
      </main>
    );
  }

  if (error && (!offerGarment || !receiveGarment)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] px-6 text-center text-[#F5F5F5]">
        {error}
      </main>
    );
  }

  if (!offerGarment || !receiveGarment) return null;

  return (
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto min-h-dvh w-full max-w-3xl">

        {/* Header */}
        <header className="flex items-center gap-5 border-b border-[#2E2E2E] px-6 pb-5 pt-15 md:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center text-[30px] md:text-[40px]"
            aria-label="Go back"
          >
            ‹
          </button>

          <h1 className="text-[20px] font-medium md:text-[25px]">
            Review proposal
          </h1>
        </header>

        <section
          className={`px-6 pt-8 md:px-10 ${
            showContinue ? 'pb-32' : 'pb-10'
          }`}
        >

          {/* You offer */}
          <div className="relative overflow-hidden rounded-2xl border-4 border-[#C8F66F]">
            <div className="absolute left-0 top-0 z-10 max-w-[85%] rounded-br-[24px] bg-[#C8F66F] px-3 py-2 text-[#1A1A1A]">
              <p className="truncate text-[14px] font-medium md:text-[17px]">
                You Offer a {offerGarment.name}
              </p>
            </div>

            {getGarmentImage(offerGarment) ? (
              <img
                src={getGarmentImage(offerGarment)}
                alt={offerGarment.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[#242424] text-white/50">
                No image
              </div>
            )}
          </div>

          {/* Exchange arrows */}
          <div className="flex items-center justify-center py-6 text-[42px] leading-none">
            <span className="text-[#C8F66F]">↓</span>
            <span className="text-[#F5F5F5]">↑</span>
          </div>

          {/* You receive */}
          <div className="relative overflow-hidden rounded-2xl border-4 border-[#F5F5F5]">
            <div className="absolute left-0 top-0 z-10 max-w-[85%] rounded-br-[24px] bg-[#F5F5F5] px-3 py-2 text-[#1A1A1A]">
              <p className="truncate text-[14px] font-medium md:text-[17px]">
                You Receive a {receiveGarment.name}
              </p>
            </div>

            {getGarmentImage(receiveGarment) ? (
              <img
                src={getGarmentImage(receiveGarment)}
                alt={receiveGarment.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[#242424] text-white/50">
                No image
              </div>
            )}
          </div>

          {/* Send proporsal */}
          <div className="mt-8 rounded-[20px] border border-[#F5F5F5] px-5 py-5">
            <p className="mb-3 text-[14px] text-[#F5F5F5]">
              Your proposal will be send to:
            </p>

            <div className="flex items-center gap-3">
              {receiveGarment.seller?.profilePicture ? (
                <img
                  src={receiveGarment.seller.profilePicture}
                  alt={receiveGarment.seller.username}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-[#F5F5F5]" />
              )}

              <span className="text-[15px]">
                @{receiveGarment.seller?.username ?? 'user'}
              </span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Continue */}
        {showContinue && (
          <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#1A1A1A]/95 px-6 py-5 backdrop-blur md:static md:border-t-0 md:px-10">
            <button
              type="button"
              onClick={handleContinue}
              disabled={sending}
              className="
                mx-auto block w-full max-w-3xl
                rounded-full
                bg-[#C8F66F]
                py-4
                text-[15px]
                font-medium
                text-[#1A1A1A]
                transition-all
                duration-150
                active:scale-[0.98]
                disabled:opacity-40
              "
            >
              {sending ? 'Sending...' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}