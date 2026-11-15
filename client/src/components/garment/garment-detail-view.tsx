'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import type { GarmentDetail } from './garment-detail-types';
import GarmentGallery from './garment-gallery';

const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

function priceLabel(garment: GarmentDetail) {
  if (garment.transactionType === 'trade' || garment.price == null) {
    return 'Trade';
  }

  return `$${Number(garment.price)}`;
}

const TYPE_LABEL = { sale: 'For sale', trade: 'For trade', both: 'Sale or trade' };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#2A2A2A] py-3 text-[14px]">
      <span className="text-[#8A8A8A]">{label}</span>
      <span className="text-right capitalize">{value}</span>
    </div>
  );
}

export default function GarmentDetailView({ garmentId }: { garmentId: string }) {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meData, garmentData] = await Promise.all([
          authFetch<MeResponse>('/auth/me'),
          authFetch<GarmentDetail>(`/garments/${garmentId}`),
        ]);

        if (!cancelled) {
          setMe(meData);
          setGarment(garmentData);
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

  async function handleDelete() {
    if (!garment || deleting) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await authFetch(`/garments/${garment.id}`, { method: 'DELETE' });
      // Vuelve al perfil: la prenda ya no está en el clóset.
      router.replace('/profile');
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'We could not delete this garment.',
      );
      setDeleting(false);
    }
  }

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

  if (!garment || !me) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        <div className="mx-auto w-full max-w-[560px] space-y-4">
          <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-[#262626]" />
          <div className="h-[28px] w-2/3 animate-pulse rounded-full bg-[#262626]" />
        </div>
      </main>
    );
  }

  const isOwner = garment.seller.id === me.id;
  const available = garment.status === 'available';
  const accent = ACCENT[me.role];
  const accentText = me.role === 'store' ? '#FFFFFF' : '#1A1A1A';
  const sellerName = garment.seller.name || garment.seller.username;

  return (
    <main className="min-h-screen bg-[#191919] pb-[140px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="mb-4 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#303030] text-[20px]"
        >
          ‹
        </button>

        <GarmentGallery images={garment.images} alt={garment.name} />

        {/* Título y precio */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <h1 className="text-[22px] font-medium leading-tight">
            {garment.name}
          </h1>
          <p className="text-[20px] font-medium">{priceLabel(garment)}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {garment.transactionType && (
            <span className="rounded-full border border-[#6C6C6C] px-3 py-1">
              {TYPE_LABEL[garment.transactionType]}
            </span>
          )}
          {garment.condition && (
            <span className="rounded-full border border-[#6C6C6C] px-3 py-1 capitalize">
              {garment.condition}
            </span>
          )}
          {!available && (
            <span className="rounded-full bg-[#FB3F0F] px-3 py-1 capitalize">
              {garment.status}
            </span>
          )}
        </div>

        {/* Vendedor */}
        <Link
          href={`/profile/${garment.seller.id}`}
          className="mt-5 flex items-center gap-3"
        >
          <span
            className="flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-full text-[16px] font-medium"
            style={{
              backgroundColor: ACCENT[garment.seller.role],
              color: garment.seller.role === 'store' ? '#FFFFFF' : '#1A1A1A',
            }}
          >
            {garment.seller.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={garment.seller.profilePicture}
                alt={sellerName}
                className="h-full w-full object-cover"
              />
            ) : (
              sellerName.charAt(0).toUpperCase()
            )}
          </span>
          <span>
            <span className="block text-[14px] font-medium">{sellerName}</span>
            <span className="block text-[12px] text-[#8A8A8A]">
              @{garment.seller.username}
            </span>
          </span>
        </Link>

        <p className="mt-5 text-[14px] leading-relaxed text-[#D6D6D6]">
          {garment.description}
        </p>

        {/* Detalles */}
        <div className="mt-6">
          <Row label="Brand" value={garment.brand?.name ?? '-'} />
          <Row label="Category" value={garment.category?.name ?? '-'} />
          <Row
            label="Size"
            value={
              garment.size ? `${garment.size.type} · ${garment.size.label}` : '-'
            }
          />
          <Row label="Material" value={garment.material} />
          <Row label="Purchased" value={garment.datePurchased} />
          {garment.care && <Row label="Care" value={garment.care.name} />}
          {garment.waterSaved != null && (
            <Row
              label="Water saved"
              value={`${Number(garment.waterSaved).toLocaleString()} L`}
            />
          )}
        </div>

        {garment.colors.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {garment.colors.map((color) => (
              <span
                key={color.id}
                className="flex items-center gap-2 rounded-full border border-[#6C6C6C] px-3 py-1 text-[12px]"
              >
                <span
                  className="h-[12px] w-[12px] rounded-full border border-white/40"
                  style={{ backgroundColor: color.hexcode }}
                />
                {color.name}
              </span>
            ))}
          </div>
        )}

        {garment.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {garment.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-[#262626] px-3 py-1 text-[12px] text-[#D6D6D6]"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Acciones */}
        {isOwner && available && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push(`/garment/${garment.id}/edit`)}
              className="h-[51px] rounded-full text-[15px] font-medium"
              style={{ backgroundColor: accent, color: accentText }}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmDelete(true);
              }}
              className="h-[51px] rounded-full border border-[#FB3F0F] text-[15px] font-medium text-[#FB3F0F]"
            >
              Delete
            </button>
          </div>
        )}

        {!isOwner && available && (
          <Link
            href={`/transaction/propose?garmentId=${garment.id}`}
            className="mt-8 flex h-[51px] w-full items-center justify-center rounded-full text-[15px] font-medium"
            style={{ backgroundColor: accent, color: accentText }}
          >
            Make a proposal
          </Link>
        )}
      </div>

      {/* Confirmación para borrar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[560px] rounded-t-[23px] bg-[#171717] px-7 pb-8 pt-6">
            <h2 className="text-[20px] font-medium">Delete this garment?</h2>
            <p className="mt-2 text-[14px] text-[#8A8A8A]">
              This removes it from your closet for good. It cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-[13px] text-[#FB3F0F]" role="alert">
                {deleteError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-[48px] rounded-full border border-[#6C6C6C] text-[15px] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-[48px] rounded-full bg-[#FB3F0F] text-[15px] font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {me.role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}