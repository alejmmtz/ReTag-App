'use client';

import AssetIcon from '../../../../components/icons/asset-icon';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../../lib/api';
import TransactionGarmentCard from '@/src/components/transactions/transaction-garment-card';

type GarmentImage = {
  id: number;
  url: string;
  isCover: boolean;
};

type Garment = {
  id: string;
  name: string;
  images?: GarmentImage[];
};

type Props = {
  garmentId: string;
};

function getGarmentImage(garment: Garment) {
  const cover = garment.images?.find((image) => image.isCover);

  return cover?.url ?? garment.images?.[0]?.url ?? '';
}

export default function ProposeExchange({ garmentId }: Props) {
  const router = useRouter();

  const [targetGarment, setTargetGarment] = useState<Garment | null>(null);
  const [closet, setCloset] = useState<Garment[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!garmentId) {
        setError('Garment not specified.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('You need to be logged in.');
        }

        const [garmentResponse, closetResponse] = await Promise.all([
          fetch(`${API_URL}/garments/${garmentId}`),

          fetch(`${API_URL}/garments/mine`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!garmentResponse.ok) {
          throw new Error('The garment could not be loaded.');
        }

        if (!closetResponse.ok) {
          throw new Error('Your closet could not be loaded.');
        }

        const garmentData: Garment = await garmentResponse.json();
        const closetData: Garment[] = await closetResponse.json();

        setTargetGarment(garmentData);
        setCloset(closetData);

        if (closetData.length > 0) {
          setSelectedGarment(closetData[0]);
        }
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

    loadData();
  }, [garmentId]);

  function handleContinue() {
    if (!selectedGarment || !targetGarment) return;

    const params = new URLSearchParams({
      garmentId: targetGarment.id,
      tradeGarmentId: selectedGarment.id,
      type: 'trade',
    });

    router.push(`/transaction/review?${params.toString()}`);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        {error}
      </main>
    );
  }

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
            Propose an exchange
          </h1>
        </header>

      <section className="pb-32 pt-8">

    {/* Instructions */}
    <p className="mb-7 text-sm">
      Which Garment of your closet are you going to offer?
    </p>

    {/* Selected garment */}
    {selectedGarment && (
      <TransactionGarmentCard
        garment={selectedGarment}
        label={selectedGarment.name}
        variant="green"
        showCheck
      />
    )}

    {/* Closet */}
    <h2 className="mb-5 mt-10 text-base font-semibold">
      Your Closet
    </h2>

    {/* Closet garments */}
    {closet.length === 0 ? (
      <div className="rounded-xl border border-white/15 p-6 text-center text-foreground/50">
        You don&apos;t have garments in your closet yet.
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 min-w-0">
        {closet.map((garment) => {
          const selected =
            selectedGarment?.id === garment.id;

          return (
            <button
              key={garment.id}
              type="button"
              onClick={() => setSelectedGarment(garment)}
              className={`
                overflow-hidden rounded-xl border-4
                transition-all duration-150
                active:scale-[0.98]
                ${
                  selected
                    ? 'border-green'
                    : 'border-foreground'
                }
              `}
            >
              {getGarmentImage(garment) ? (
                <img
                  src={getGarmentImage(garment)}
                  alt={garment.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface text-sm text-foreground/50">
                  No image
                </div>
              )}
            </button>
          );
        })}
      </div>
    )}

  </section>

        {/* Continue */}
        <div className="fixed mx-auto w-full max-w-lg inset-x-0 bottom-0 border-t border-white/10 bg-background/95 px-8 py-5 backdrop-blur">
          <button
            type="button"
            disabled={!selectedGarment}
            onClick={handleContinue}
            className="button-pill mx-auto block w-full max-w-lg bg-green text-background transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
