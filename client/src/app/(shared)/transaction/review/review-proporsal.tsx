'use client';

import AssetIcon from '../../../../components/icons/asset-icon';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../../lib/api';
import TransactionGarmentCard from './../../../../components/transactions/transaction-garment-card'

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
      <main className="flex items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        Loading...
      </main>
    );
  }

  if (error && (!offerGarment || !receiveGarment)) {
    return (
      <main className="flex items-center justify-center bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        {error}
      </main>
    );
  }

  if (!offerGarment || !receiveGarment) return null;

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg">

        {/* Header */}
        <header className="flex items-center gap-5 border-b border-line pb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center text-sm min-h-11 min-w-11"
            aria-label="Go back"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>

          <h1 className="text-xl font-semibold">
            Review proposal
          </h1>
        </header>

        <section
          className={` pt-8 ${
 showContinue ? 'pb-32' : 'pb-10'
 }`}
        >

        {/* Garment offered */}
        <TransactionGarmentCard
        garment={offerGarment}
        label={`You Offer a ${offerGarment.name}`}
        variant="green"
        />

        <div className="flex items-center justify-center py-6">
        <span aria-hidden="true" className="inline-block h-6 w-6" />
        </div>

        {/* Garment received */}
        <TransactionGarmentCard
        garment={receiveGarment}
        label={`You Receive a ${receiveGarment.name}`}
        variant="white"
        />

        {/* Send proporsal */}
          <div className="mt-8 rounded-[20px] border border-foreground px-5 py-5">
            <p className="mb-3 text-sm text-foreground">
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
                <div className="h-8 w-8 rounded-lg bg-foreground" />
              )}

              <span className="text-sm">
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
          <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 border-t border-white/10 bg-background/95 px-8 py-5 backdrop-blur">
            <button
              type="button"
              onClick={handleContinue}
              disabled={sending}
              className="button-pill mx-auto block w-full max-w-lg bg-green text-background transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
            >
              {sending ? 'Sending...' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
