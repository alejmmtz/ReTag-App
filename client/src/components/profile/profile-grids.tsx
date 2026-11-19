'use client';

import AssetIcon from '../icons/asset-icon';
import Link from 'next/link';
import { useState } from 'react';

import type { ProfileGarment, ProfilePost } from './profile-types';

function coverOf(images: { url: string; isCover: boolean }[]) {
  return (images.find((image) => image.isCover) ?? images[0])?.url ?? null;
}

const RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]'];

export function PostsGrid({ posts }: { posts: ProfilePost[] }) {
  return (
    <div className="columns-2 gap-6">
      {posts.map((post, index) => {
        const cover = coverOf(post.images);

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className={`relative mb-6 block w-full break-inside-avoid overflow-hidden rounded-xl bg-surface ${RATIOS[index % RATIOS.length]}`}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={post.caption}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center p-4 text-sm leading-snug text-[#D6D6D6]">
                {post.caption.slice(0, 90)}
              </div>
            )}

            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium tabular-nums text-foreground">
              <AssetIcon name="like" width={20} height={20} />
              {post.likesCount ?? 0}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function priceLabel(garment: ProfileGarment) {
  if (garment.transactionType === 'trade' || garment.price == null) {
    return 'Trade';
  }

  return `$${Number(garment.price)}`;
}

export function ClosetGrid({
  garments,
  accent,
  accentText,
  title,
}: {
  garments: ProfileGarment[];
  accent: string;
  accentText: string;
  title: string;
}) {
  const [category, setCategory] = useState<string>('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(
        garments
          .map((garment) => garment.category?.name)
          .filter((name): name is string => !!name),
      ),
    ),
  ];

  const visible =
    category === 'All'
      ? garments
      : garments.filter((garment) => garment.category?.name === category);

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>

      {categories.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((name) => {
            const active = name === category;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                aria-pressed={active}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium"
                style={
                  active
                    ? { backgroundColor: accent, borderColor: accent, color: accentText }
                    : { borderColor: '#3A3A3A', color: '#D6D6D6' }
                }
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-6">
        {visible.map((garment) => {
          const cover = coverOf(garment.images);

          return (
            <Link key={garment.id} href={`/garment/${garment.id}`} className="block">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={garment.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#6C6C6C]">
                    No photo
                  </div>
                )}
              </div>

              <p className="mt-2 truncate text-sm font-medium">{garment.name}</p>
              <p className="truncate text-xs text-grey">
                {[garment.brand?.name, garment.size?.label].filter(Boolean).join(' · ')}
              </p>
              <p className="text-sm font-medium" style={{ color: accent }}>
                {priceLabel(garment)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
