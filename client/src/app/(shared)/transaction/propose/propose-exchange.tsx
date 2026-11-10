'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../../lib/api';

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
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] text-[#F5F5F5]">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] px-6 text-center text-[#F5F5F5]">
        {error}
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#1A1A1A] text-[#F5F5F5]">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="flex items-center gap-5 border-b border-white/30 px-6 py-8 md:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-4xl leading-none"
            aria-label="Go back"
          >
            ‹
          </button>

          <h1 className="text-2xl font-medium md:text-3xl">
            Propose an exchange
          </h1>
        </header>

        <section className="px-6 pb-32 pt-8 md:px-10">
          <p className="mb-7 text-base md:text-lg">
            Which Garment of your closet are you going to offer?
          </p>

          {/* Select garment */}
          {selectedGarment && (
            <div className="overflow-hidden rounded-2xl border-4 border-[#C8F66F]">
              <div className="flex items-center gap-2 bg-[#C8F66F] px-3 py-2 text-[#1A1A1A]">
                <p className="font-medium">
                  {selectedGarment.name}
                </p>

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1A1A] text-xs text-[#C8F66F]">
                  ✓
                </span>
              </div>

              {getGarmentImage(selectedGarment) ? (
                <img
                  src={getGarmentImage(selectedGarment)}
                  alt={selectedGarment.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-[#242424] text-white/50">
                  No image
                </div>
              )}
            </div>
          )}

          {/* Closet */}
          <h2 className="mb-5 mt-10 text-lg font-medium">
            Your Closet
          </h2>

          {closet.length === 0 ? (
            <div className="rounded-xl border border-white/15 p-6 text-center text-white/50">
              You don&apos;t have garments in your closet yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {closet.map((garment) => {
                const selected =
                  selectedGarment?.id === garment.id;

                return (
                  <button
                    key={garment.id}
                    type="button"
                    onClick={() => setSelectedGarment(garment)}
                    className={`overflow-hidden rounded-xl border-4 transition ${
                      selected
                        ? 'border-[#C8F66F]'
                        : 'border-[#F5F5F5]'
                    }`}
                  >
                    {getGarmentImage(garment) ? (
                      <img
                        src={getGarmentImage(garment)}
                        alt={garment.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-[#242424] text-sm text-white/50">
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
        <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#1A1A1A]/95 px-6 py-5 backdrop-blur md:static md:border-t-0 md:px-10">
          <button
            type="button"
            disabled={!selectedGarment}
            onClick={handleContinue}
            className="mx-auto block w-full max-w-3xl rounded-full bg-[#C8F66F] py-4 text-lg font-medium text-[#1A1A1A] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}