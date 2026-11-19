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
      <main className="bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        <p className="text-sm text-grey">{error}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="button-pill mt-6 border border-[#6C6C6C]"
        >
          Go back
        </button>
      </main>
    );
  }

  if (!garment) {
    return (
      <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        <div className="h-12 w-full animate-pulse rounded-full bg-surface" />
      </main>
    );
  }

  return <GarmentForm garment={garment} />;
}