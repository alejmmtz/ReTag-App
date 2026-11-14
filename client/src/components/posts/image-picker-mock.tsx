'use client';

import { useEffect, useRef } from 'react';

export type PickedImage = {
  id: string;
  previewUrl: string;
};

type Props = {
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  max?: number;
  accent: string;
};

export default function ImagePickerMock({
  images,
  onChange,
  max = 10,
  accent,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);

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

    onChange(images.filter((image) => image.id !== id));
  }

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

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[132px] w-[110px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed text-[13px]"
            style={{ borderColor: accent, color: accent }}
          >
            <span className="text-[28px] leading-none">+</span>
            Add photo
          </button>
        )}

        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative h-[132px] w-[110px] shrink-0 overflow-hidden rounded-[18px] bg-[#262626]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt={`Selected photo ${index + 1}`}
              className="h-full w-full object-cover"
            />

            {index === 0 && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-[2px] text-[10px] text-white">
                Cover
              </span>
            )}

            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => handleRemove(image.id)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[14px] text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[12px] text-[#8A8A8A]">
        {images.length}/{max} photos
      </p>
    </div>
  );
}
