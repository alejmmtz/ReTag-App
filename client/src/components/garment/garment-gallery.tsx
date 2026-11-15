'use client';

import { useState } from 'react';

type Props = {
  images: { id: number; url: string; isCover: boolean }[];
  alt: string;
};

// Carrusel horizontal con deslizamiento (snap) y contador 1/N.
export default function GarmentGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[22px] bg-[#262626] text-[13px] text-[#6C6C6C]">
        No photo
      </div>
    );
  }
  const ordered = [...images].sort(
    (a, b) => Number(b.isCover) - Number(a.isCover),
  );

  return (
    <div className="relative">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto rounded-[22px] [scrollbar-width:none]"
        onScroll={(event) => {
          const el = event.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {ordered.map((image, position) => (
          <div
            key={image.id}
            className="aspect-[4/5] w-full shrink-0 snap-center bg-[#262626]"
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
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[12px]">
          {index + 1}/{ordered.length}
        </span>
      )}
    </div>
  );
}