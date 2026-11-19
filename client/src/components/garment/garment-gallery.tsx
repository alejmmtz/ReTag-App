'use client';

import { useState } from 'react';

type Props = {
  images: { id: number; url: string; isCover: boolean }[];
  alt: string;
};

// Carrusel horizontal con deslizamiento y contador 
export default function GarmentGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[2/3] w-full items-center justify-center bg-surface text-sm text-[#6C6C6C]">
        No photo
      </div>
    );
  }
  const ordered = [...images].sort(
    (a, b) => Number(b.isCover) - Number(a.isCover),
  );

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        onScroll={(event) => {
          const el = event.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {ordered.map((image, position) => (
          <div
            key={image.id}
            className="aspect-[2/3] w-full shrink-0 snap-center bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={`${alt} ${position + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {ordered.length > 1 && (
        <span aria-live="polite" aria-atomic="true" className="image-overlay absolute left-1/2 top-18 flex min-h-11 -translate-x-1/2 items-center rounded-full px-4 py-2 text-xs tabular-nums">
          {index + 1} / {ordered.length}
        </span>
      )}
    </div>
  );
}
