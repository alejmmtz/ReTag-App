'use client';

import AssetIcon from '../icons/asset-icon';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import type { GarmentDetail } from './garment-detail-types';
import GarmentHero from './garment-hero';

const ACCENT = { user: '#C8F66F', store: '#1D5CEB' } as const;

type SellerProfile = {
  id: string;
  name: string | null;
  username: string;
  profilePicture: string | null;
  createdAt: string;
};

type SellerGarment = {
  id: string;
  name: string;
  images: { id: number; url: string; isCover: boolean }[];
};

type SellerGarmentsPage = { data: SellerGarment[] };

type SellerStatistics = {
  community?: { bagsReceived: number };
  transactions?: { completed: number };
  environment?: { waterSaved: number | null };
};

function priceLabel(garment: GarmentDetail) {
  if (garment.transactionType === 'trade' || garment.price == null) {
    return 'Trade';
  }

  return `$${Number(garment.price).toFixed(2)}`;
}

function timeAgo(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

function memberSince(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function purchaseDetails(value: string) {
  const date = new Date(value);
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  return {
    days,
    date: new Intl.DateTimeFormat('en', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
  };
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
  if (clean.length === 0) return <>{text}</>;

  const escaped = clean.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));

  return parts.map((part, index) =>
    clean.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
      <span key={index} style={{ color }} className="font-medium">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[82px_1fr] gap-4 border-b border-[#454545] py-2.5 text-sm last:border-b-0 min-w-0">
      <span className="font-medium">{label}</span>
      <span className="min-w-0 break-words text-[#E3E3E3]">{value}</span>
    </div>
  );
}

export default function GarmentDetailView({ garmentId }: { garmentId: string }) {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerGarments, setSellerGarments] = useState<SellerGarment[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [inBag, setInBag] = useState(false);
  const [bagBusy, setBagBusy] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meData, garmentData] = await Promise.all([
          authFetch<MeResponse>('/auth/me'),
          authFetch<GarmentDetail>(`/garments/${garmentId}`),
        ]);

        if (cancelled) return;
        setMe(meData);
        setGarment(garmentData);

        const [profile, garments, statistics] = await Promise.all([
          authFetch<SellerProfile>(`/users/${garmentData.seller.id}`).catch(
            () => null,
          ),
          authFetch<SellerGarmentsPage>(
            `/users/${garmentData.seller.id}/garments?page=1&limit=5`,
          ).catch(() => null),
          meData.id === garmentData.seller.id
            ? authFetch<SellerStatistics>('/users/me/statistics').catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!cancelled) {
          setSellerProfile(profile);
          setSellerStats(statistics);
          setSellerGarments(
            (garments?.data ?? []).filter((item) => item.id !== garmentData.id),
          );
        }
      } catch (err) {
        if (cancelled) return;
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [garmentId, router]);

  const canUseBag =
    !!me && !!garment && me.role === 'user' && garment.seller.id !== me.id;

  useEffect(() => {
    if (!canUseBag) return;
    let cancelled = false;
    authFetch(`/bags/${garmentId}`)
      .then(() => !cancelled && setInBag(true))
      .catch(() => !cancelled && setInBag(false));
    return () => {
      cancelled = true;
    };
  }, [canUseBag, garmentId]);

  const categoryLabel = useMemo(() => garment?.category?.name ?? '', [garment]);

  async function handlePurchase() {
    if (!canUseBag || !garment || bagBusy) return;
    if (inBag) {
      router.push('/bag');
      return;
    }

    setBagBusy(true);
    try {
      await authFetch('/bags', {
        method: 'POST',
        body: JSON.stringify({ garmentId: garment.id }),
      });
      setInBag(true);
      router.push('/bag');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        router.replace('/login');
      }
    } finally {
      setBagBusy(false);
    }
  }

  async function handleDelete() {
    if (!garment || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await authFetch(`/garments/${garment.id}`, { method: 'DELETE' });
      router.replace('/profile');
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'We could not delete this garment.',
      );
      setDeleting(false);
    }
  }

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

  if (!garment || !me) {
    return (
      <main aria-busy="true" aria-label="Loading garment" className="mx-auto min-h-dvh w-full max-w-lg bg-background pb-12 text-foreground">
        <div className="aspect-[2/3] w-full animate-pulse bg-surface" />
        <div className="space-y-4 px-8 pt-6">
          <div className="h-11 w-full animate-pulse rounded-full bg-surface" />
          <div className="h-7 w-2/3 animate-pulse rounded-full bg-surface" />
        </div>
      </main>
    );
  }

  const isOwner = garment.seller.id === me.id;
  const available = garment.status === 'available';
  const accent = ACCENT[me.role];
  const accentText = me.role === 'store' ? '#FFFFFF' : '#1A1A1A';
  const sellerName = garment.seller.name || garment.seller.username;
  const offersPurchase = garment.transactionType === 'sale' || garment.transactionType === 'both';
  const offersTrade = garment.transactionType === 'trade' || garment.transactionType === 'both';
  const waterSaved = garment.waterSaved == null ? null : Number(garment.waterSaved);
  const detailColors = garment.colors.map((color) => color.name).join(', ');
  const purchaseInfo = purchaseDetails(garment.datePurchased);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg bg-background pb-12 text-foreground page-enter">
      <div className="mx-auto w-full max-w-lg mb-48 min-[440px]:mb-40">
        <GarmentHero
          garment={garment}
          showBag={canUseBag}
          onBack={() => router.back()}
          onOpenBag={() => router.push('/bag')}
        />

        <section className="px-8">
          {garment.category && (
            <div className="flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: accent, color: accentText }}>
              {categoryLabel}
            </div>
          )}

          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="min-w-0 text-xl font-semibold leading-tight">{garment.name}</h1>
            <p className="shrink-0 text-sm font-semibold" style={{ color: accent }}>{priceLabel(garment)}</p>
          </div>
          {!available && (
            <p className="mt-2 text-xs capitalize text-[#B8B8B8]">{garment.status}</p>
          )}
          <p className="mt-1 text-xs text-[#B0B0B0]">
            {timeAgo(garment.createdAt)} <span className="px-1">·</span>
            {sellerStats?.community?.bagsReceived != null
              ? `Currently on ${sellerStats.community.bagsReceived} bags`
              : offersPurchase && offersTrade
                ? 'Available for purchase or trade'
                : offersTrade
                  ? 'Available for trade'
                  : 'Available for purchase'}
          </p>

          {garment.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {garment.tags.map((tag) => (
                <span key={tag.id} className="rounded-full px-4 py-2 text-xs font-medium text-background" style={{ backgroundColor: accent }}>#{tag.name}</span>
              ))}
            </div>
          )}

          <section className="mt-7">
            <h2 className="text-base font-semibold">About this Garment</h2>
            <p className="mt-2 text-sm leading-[1.55] text-[#D1D1D1]">
              <Highlighted
                text={`@${garment.seller.username} purchased this garment ${purchaseInfo.days} days ago on ${purchaseInfo.date}. It has ${detailColors || 'no listed'} colors. The brand is ${garment.brand?.name ?? 'not listed'}.`}
                color={accent}
                words={[
                  `@${garment.seller.username}`,
                  `${purchaseInfo.days} days ago`,
                  detailColors,
                  garment.brand?.name ?? '',
                ]}
              />
            </p>
            {garment.description && (
              <div className="relative ml-5 mt-6 rounded-[14px] rounded-tl-[4px] bg-foreground px-5 py-4 text-sm leading-[1.45] text-surface">
                <Image
                  src="/icons/message-bubble-opener.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="absolute -left-4 top-0"
                />
                {garment.description}
              </div>
            )}
          </section>

          <section className="mt-7">
            <h2 className="text-base font-semibold">Care &amp; Details</h2>
            <p className="mt-2 text-sm leading-[1.55] text-[#D1D1D1]">
              This garment is made of <b className="font-semibold text-foreground">{garment.material}</b>
              {garment.care ? <> and should be <b className="font-semibold text-foreground">{garment.care.name.toLowerCase()}</b></> : null}.
              {garment.condition ? <> It is currently in <b className="font-semibold text-foreground">{garment.condition.toLowerCase()}</b> condition.</> : null}
              {' '}Check its details below to learn more.
            </p>
          </section>

          <section className="mt-7">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <AssetIcon name="leaf" width={16} height={16} />
              The impact of choosing this garment
            </h2>
            <div className="mt-3 overflow-hidden">
              <Image src="/illustrations/forest.png" alt="Illustration of trees" width={680} height={190} className="h-auto w-full" />
            </div>
            <p className="mt-3 text-sm leading-[1.55] text-[#D1D1D1]">
              Choosing this garment helps extend its life and reduce the resources used to make something new.
              {waterSaved != null && <> This choice would save <b className="font-semibold text-foreground">{waterSaved.toLocaleString()} L of water</b>.</>}
            </p>
          </section>

          <section className="mt-7">
            <button type="button" aria-expanded={summaryOpen} onClick={() => setSummaryOpen((open) => !open)} className="flex w-full items-center justify-between border-b border-[#747474] pb-2 text-left text-sm font-semibold min-h-11 min-w-11">
              <span className="flex items-center gap-2">
                <AssetIcon name="clipboard" width={16} height={18} />
                Summary
              </span>
              <AssetIcon name="chevron-down" width={16} height={9} className={`transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
            </button>
            {summaryOpen && (
              <div>
                <DetailRow label="Name" value={garment.name} />
                <DetailRow label="Category" value={categoryLabel || '—'} />
                <DetailRow label="Size" value={garment.size ? `${garment.size.label} (${garment.size.type})` : '—'} />
                <DetailRow label="Colors" value={detailColors || '—'} />
                <DetailRow label="Brand" value={garment.brand?.name ?? '—'} />
                <DetailRow label="Material" value={garment.material} />
                <DetailRow label="Condition" value={garment.condition ?? '—'} />
                <DetailRow label="Use" value={`First purchased ${purchaseInfo.days} days ago`} />
                <DetailRow label="Care" value={garment.care?.name ?? '—'} />
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-base font-semibold">Meet the seller</h2>
            <Link href={`/profile/${garment.seller.id}`} className="relative mt-3 block min-h-[210px] overflow-hidden rounded-[14px] bg-green p-4 text-[#171717] shadow-[0_6px_16px_#0005]">
              <span className="flex items-center justify-between text-xs font-semibold">
                <span>ReTag member</span>
                <span>Member Card</span>
              </span>
              <span className="mt-3 grid grid-cols-[1fr_1fr] min-[440px]:grid-cols-[1fr_1fr_0.85fr] gap-3">
              <span className="flex aspect-square items-center justify-center overflow-hidden rounded-[9px] bg-white text-xl font-semibold">
                {garment.seller.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={garment.seller.profilePicture} alt={sellerName} className="h-full w-full object-cover" />
                ) : sellerName.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 text-xs leading-tight">
                <span className="block text-[#323232]">name</span>
                <span className="mt-1 block break-words text-sm font-bold">{sellerProfile?.name ?? sellerName}</span>
                <span className="mt-3 block text-[#323232]">username</span>
                <span className="mt-1 block break-words text-sm font-bold">@{garment.seller.username}</span>
                <span className="mt-3 block text-[#323232]">joined in</span>
                <span className="mt-1 block text-xs font-bold">{sellerProfile?.createdAt ? memberSince(sellerProfile.createdAt) : '—'}</span>
                <span className="mt-3 block text-[#323232]">transactions</span>
                <span className="mt-1 block text-sm font-bold">{sellerStats?.transactions?.completed ?? '—'} completed</span>
              </span>
              <span className="min-w-0 pt-1 text-center text-xs leading-tight">
                <span className="block">CO₂ Emissions</span>
                <span className="mt-1 block text-base font-bold">—</span>
                <span className="mt-5 block">Water Saved</span>
                <span className="mt-1 flex items-center justify-center gap-1 text-sm font-bold">
                  <Image src="/icons/water-drop.svg" alt="" width={15} height={18} />
                  {sellerStats?.environment?.waterSaved == null ? '—' : `${Number(sellerStats.environment.waterSaved).toLocaleString()} L`}
                </span>
              </span>
              </span>
            </Link>
          </section>

          <section className="mt-7 pb-3">
            <h2 className="text-base font-semibold">More of @{garment.seller.username}</h2>
            {sellerGarments.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2 min-w-0">
                {sellerGarments.slice(0, 3).map((item) => {
                  const image = item.images.find((photo) => photo.isCover)?.url ?? item.images[0]?.url;
                  return (
                    <Link key={item.id} href={`/garment/${item.id}`} className="overflow-hidden rounded-[10px] bg-surface">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={item.name} className="aspect-square w-full object-cover" />
                      ) : <div className="aspect-square" />}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-grey">No other garments listed yet.</p>
            )}
          </section>
        </section>
      </div>

      {available && (
        <div className="fixed inset-x-0 bottom-23 z-40 mx-auto w-full max-w-lg border-t border-[#454545] bg-background/95 px-8 py-3 backdrop-blur">
          {isOwner ? (
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <button type="button" onClick={() => router.push(`/garment/${garment.id}/edit`)} className="button-pill bg-white text-background">Edit garment</button>
              <button type="button" onClick={() => { setDeleteError(null); setConfirmDelete(true); }} className="button-pill border border-orange/40 bg-orange/10 text-orange">Delete</button>
            </div>
          ) : (
            <div className={`grid gap-3 ${canUseBag && offersPurchase && offersTrade ? 'grid-cols-1 min-[440px]:grid-cols-2' : 'grid-cols-1'}`}>
              {canUseBag && offersPurchase && (
                <button type="button" onClick={handlePurchase} disabled={bagBusy} className="button-pill flex-1 gap-2 bg-foreground text-background disabled:opacity-60">
                  <AssetIcon name="bag" width={16} height={16} />
                  {bagBusy ? 'Adding…' : 'Purchase'}
                </button>
              )}
              {offersTrade && (
                <Link href={`/transaction/propose?garmentId=${garment.id}`} className="button-pill" style={{ backgroundColor: accent, color: accentText }}>
                  <span aria-hidden="true" className="inline-block h-[17px] w-[17px]" />
                  Propose a Trade
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-t-[23px] bg-[#171717] px-7 pb-8 pt-6">
            <h2 className="text-base font-semibold">Delete this garment?</h2>
            <p className="mt-2 text-sm text-grey">This removes it from your closet for good. It cannot be undone.</p>
            {deleteError && <p className="mt-3 text-sm text-orange" role="alert">{deleteError}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3 min-w-0">
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className="button-pill border border-[#6C6C6C] disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="button-pill bg-orange disabled:opacity-50">{deleting ? 'Deleting…' : 'Yes, delete'}</button>
            </div>
          </div>
        </div>
      )}

      {me.role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
