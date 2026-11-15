'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { ProfileGarment, ProfilePost } from './profile-types';

function coverOf(images: { url: string; isCover: boolean }[]) {
  return (images.find((image) => image.isCover) ?? images[0])?.url ?? null;
}

const RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]'];

export function PostsGrid({ posts, accent }: { posts: ProfilePost[]; accent: string }) {
  return (
    <div className="columns-2 gap-3">
      {posts.map((post, index) => {
        const cover = coverOf(post.images);

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className={`relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[18px] bg-[#262626] ${RATIOS[index % RATIOS.length]}`}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={post.caption}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center p-4 text-[13px] leading-snug text-[#D6D6D6]">
                {post.caption.slice(0, 90)}
              </div>
            )}

            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-[2px] text-[12px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill={accent} aria-hidden>
                <path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.7 5 6.2 5c2 0 3.3 1.1 4 2.2L12 9.5l1.8-2.3C14.5 6.1 15.8 5 17.8 5c3.5 0 5.3 3.6 3.8 6.9C19.5 16.4 12 21 12 21z" />
              </svg>
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
      <h2 className="mb-3 text-[18px] font-semibold">{title}</h2>

      {categories.length > 1 && (
        <div className="-mx-6 mb-4 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
          {categories.map((name) => {
            const active = name === category;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className="h-[34px] shrink-0 rounded-full border px-4 text-[13px] font-medium"
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

      <div className="grid grid-cols-2 gap-3">
        {visible.map((garment) => {
          const cover = coverOf(garment.images);

          return (
            <Link key={garment.id} href={`/garment/${garment.id}`} className="block">
              <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-[#262626]">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={garment.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[12px] text-[#6C6C6C]">
                    No photo
                  </div>
                )}
              </div>

              <p className="mt-2 truncate text-[14px] font-medium">{garment.name}</p>
              <p className="truncate text-[12px] text-[#8A8A8A]">
                {[garment.brand?.name, garment.size?.label].filter(Boolean).join(' · ')}
              </p>
              <p className="text-[13px] font-medium" style={{ color: accent }}>
                {priceLabel(garment)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
