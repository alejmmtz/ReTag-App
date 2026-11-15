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

function Highlighted({
  text,
  words,
  color,
}: {
  text: string;
  words: string[];
  color: string;
}) {
  const clean = words.filter((word) => word && word.length > 2);

  if (clean.length === 0) {
    return <>{text}</>;
  }

  const escaped = clean.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        clean.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
          <span key={index} style={{ color }} className="font-medium">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#2A2A2A] py-3 text-[14px] last:border-b-0">
      <span className="text-[#9A9A9A]">{label}</span>
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

  const [inBag, setInBag] = useState(false);
  const [bagBusy, setBagBusy] = useState(false);

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

  // Solo los usuarios (no tiendas) tienen bolsa, y no con sus propias prendas.
  const canUseBag =
    !!me && !!garment && me.role === 'user' && garment.seller.id !== me.id;

  useEffect(() => {
    if (!canUseBag) {
      return;
    }

    let cancelled = false;

    authFetch(`/bags/${garmentId}`)
      .then(() => !cancelled && setInBag(true))
      .catch(() => !cancelled && setInBag(false));

    return () => {
      cancelled = true;
    };
  }, [canUseBag, garmentId]);

  async function toggleBag() {
    if (bagBusy) {
      return;
    }

    setBagBusy(true);

    try {
      if (inBag) {
        await authFetch(`/bags/${garmentId}`, { method: 'DELETE' });
        setInBag(false);
      } else {
        await authFetch('/bags', {
          method: 'POST',
          body: JSON.stringify({ garmentId }),
        });
        setInBag(true);
      }
    } catch (err) {
      // 409: ya estaba en la bolsa. 404: ya no estaba.
      if (err instanceof ApiError && err.status === 409) {
        setInBag(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setInBag(false);
      }
    } finally {
      setBagBusy(false);
    }
  }

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
    <main className="min-h-screen bg-[#191919] pb-[170px] text-white">
      <div className="mx-auto w-full max-w-[560px]">
        {/* Foto principal a todo el ancho, con degradado hacia el fondo */}
        <div className="relative">
          <GarmentGallery images={garment.images} alt={garment.name} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#191919] to-transparent" />

          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="absolute left-5 top-5 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/50 text-[22px] backdrop-blur"
          >
            ‹
          </button>

          {garment.brand && (
            <span className="absolute right-5 top-5 max-w-[45%] truncate rounded-full bg-black/50 px-4 py-2 text-[13px] font-semibold uppercase tracking-wide backdrop-blur">
              {garment.brand.name}
            </span>
          )}
        </div>

        <div className="-mt-10 px-6">
          {/* Vendedor y talla */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/profile/${garment.seller.id}`}
              className="flex min-w-0 items-center gap-2 text-[14px]"
            >
              <span
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-medium"
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
              <span className="truncate">
                by <span className="font-medium">@{garment.seller.username}</span>
              </span>
            </Link>

            {garment.size && (
              <span className="shrink-0 text-[13px] text-[#D6D6D6]">
                Size: <span className="font-medium">{garment.size.label}</span>{' '}
                <span className="capitalize text-[#9A9A9A]">({garment.size.type})</span>
              </span>
            )}
          </div>

          {garment.category && (
            <span
              className="mt-4 inline-block rounded-full px-4 py-[6px] text-[13px] font-medium"
              style={{ backgroundColor: ACCENT[garment.seller.role], color: garment.seller.role === 'store' ? '#FFFFFF' : '#1A1A1A' }}
            >
              {garment.category.name}
            </span>
          )}

          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="text-[28px] font-semibold leading-tight">{garment.name}</h1>
            <p className="pt-1 text-[20px] font-medium" style={{ color: accent }}>
              {priceLabel(garment)}
            </p>
          </div>

          {!available && (
            <span className="mt-2 inline-block rounded-full bg-[#FB3F0F] px-3 py-1 text-[12px] capitalize">
              {garment.status}
            </span>
          )}

          {/* About */}
          <h2 className="mt-6 text-[18px] font-semibold">About this Garment</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#D6D6D6]">
            <Highlighted
              text={garment.description}
              color={accent}
              words={[
                garment.brand?.name ?? '',
                garment.material,
                garment.condition ?? '',
              ]}
            />
          </p>

          {/* ReTags */}
          {garment.tags.length > 0 && (
            <>
              <h2 className="mt-6 text-[18px] font-semibold">ReTags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {garment.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full px-4 py-[6px] text-[13px] font-medium"
                    style={{ backgroundColor: accent, color: accentText }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Care & Details */}
          <h2 className="mt-6 text-[18px] font-semibold">Care &amp; Details</h2>
          <div className="mt-2 rounded-[18px] border border-[#2A2A2A] px-4">
            {garment.care && <DetailRow label="Care" value={garment.care.name} />}
            <DetailRow label="Material" value={garment.material} />
            {garment.condition && (
              <DetailRow label="Condition" value={garment.condition} />
            )}
            <DetailRow label="Purchased" value={garment.datePurchased} />
            {garment.waterSaved != null && (
              <DetailRow
                label="Water saved"
                value={`${Number(garment.waterSaved).toLocaleString()} L`}
              />
            )}
          </div>

          {garment.colors.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {garment.colors.map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-[28px] w-[28px] rounded-full border border-white/30"
                  style={{ backgroundColor: color.hexcode }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones fijas abajo */}
      {available && (
        <div className="fixed inset-x-0 bottom-[96px] z-40 mx-auto w-full max-w-[560px] px-6">
          {isOwner ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push(`/garment/${garment.id}/edit`)}
                className="h-[51px] rounded-full bg-white text-[15px] font-medium text-[#1A1A1A]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setConfirmDelete(true);
                }}
                className="h-[51px] rounded-full text-[15px] font-medium"
                style={{ backgroundColor: accent, color: accentText }}
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {canUseBag && (
                <button
                  type="button"
                  onClick={toggleBag}
                  disabled={bagBusy}
                  aria-pressed={inBag}
                  className="h-[51px] shrink-0 rounded-full bg-white px-5 text-[15px] font-medium text-[#1A1A1A] disabled:opacity-50"
                >
                  {inBag ? 'In your bag ✓' : 'Add to bag'}
                </button>
              )}

              <Link
                href={`/transaction/propose?garmentId=${garment.id}`}
                className="flex h-[51px] flex-1 items-center justify-center rounded-full text-[15px] font-medium"
                style={{ backgroundColor: accent, color: accentText }}
              >
                Make a proposal
              </Link>
            </div>
          )}
        </div>
      )}

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