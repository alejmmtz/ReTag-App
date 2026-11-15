'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiError, authFetch, clearSession } from '../../lib/http';
import type { MeResponse } from '../posts/post-types';
import type { GarmentDetail } from './garment-detail-types';
import GarmentForm from './garment-form';

// Carga la prenda y, si es del usuario y sigue disponible, muestra el formulario.
export default function GarmentEditLoader({ garmentId }: { garmentId: string }) {
  const router = useRouter();
  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, data] = await Promise.all([
          authFetch<MeResponse>('/auth/me'),
          authFetch<GarmentDetail>(`/garments/${garmentId}`),
        ]);

        if (cancelled) {
          return;
        }

        if (data.seller.id !== me.id) {
          setError('You can only edit your own garments.');
        } else if (data.status !== 'available') {
          setError('Only available garments can be edited.');
        } else {
          setGarment(data);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace('/login');
          return;
        }

        setError(
          err instanceof ApiError && err.status === 404
            ? 'This garment does not exist.'
            : 'We could not load this garment.',
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [garmentId, router]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-24 text-center text-white">
        <p className="text-[15px] text-[#8A8A8A]">{error}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 h-[44px] rounded-full border border-[#6C6C6C] px-6 text-[14px]"
        >
          Go back
        </button>
      </main>
    );
  }

  if (!garment) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        <div className="h-[48px] w-full animate-pulse rounded-full bg-[#262626]" />
      </main>
    );
  }

  return <GarmentForm garment={garment} />;
}