'use client';

import { useEffect, useRef, useState } from 'react';

export type PickedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type Props = {
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  max?: number;
  accent: string;
  label?: string;
};

export default function ImagePicker({
  images,
  onChange,
  max = 10,
  accent,
  label = 'Add images',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const available = max - images.length;
    const picked = Array.from(files)
      .slice(0, available)
      .map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    onChange([...images, ...picked]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleRemove(id: string) {
    const removed = images.find((image) => image.id === id);

    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }

    setSelected(0);
    onChange(images.filter((image) => image.id !== id));
  }

  const current = images[selected] ?? images[0];

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {/* Foto grande */}
      {current ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-[#262626]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.previewUrl}
            alt="Selected photo"
            className="h-full w-full object-cover"
          />

          {images[0]?.id === current.id && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px]">
              Cover
            </span>
          )}

          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => handleRemove(current.id)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-[18px] text-white"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[22px] bg-[#262626] text-[15px] text-[#D6D6D6]"
        >
          <span
            className="flex h-[56px] w-[56px] items-center justify-center rounded-full"
            style={{ backgroundColor: accent, color: accent === '#C8F66F' ? '#1A1A1A' : '#FFFFFF' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          {label}
        </button>
      )}

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[12px] border-2"
              style={{ borderColor: index === selected ? accent : 'transparent' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}

          {images.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Add more photos"
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[12px] border border-dashed text-[24px]"
              style={{ borderColor: accent, color: accent }}
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
}
