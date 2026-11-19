"use client";

import AssetIcon from '../icons/asset-icon';
import { useEffect, useRef, useState } from "react";

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
  variant?: "default" | "garment";
};

export default function ImagePicker({
  images,
  onChange,
  max = 10,
  accent,
  label = "Add images",
  variant = "default",
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
      inputRef.current.value = "";
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

  const currentIndex = images[selected] ? selected : 0;
  const current = images[currentIndex];

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden text-sm"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {/* Foto grande */}
      {current ? (
        <div
          className={`relative w-full overflow-hidden bg-surface ${variant === "garment" ? "aspect-square border-y border-line" : "aspect-[4/3] rounded-2xl border border-line"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.previewUrl}
            alt="Selected photo"
            className="h-full w-full object-cover"
          />

          {images[0]?.id === current.id && (
            <span className="image-overlay absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-xs font-medium">
              Cover
            </span>
          )}

          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => handleRemove(current.id)}
            className="button-icon image-overlay absolute right-3 top-3"
          >
            <AssetIcon name="x icon" width={18} height={18} />
          </button>
          {images.length > 1 && (
            <span className="image-overlay absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-xs tabular-nums">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-3 bg-surface/60 text-sm text-grey active:border-green/60 active:bg-surface ${variant === "garment" ? "aspect-square border-y border-line" : "aspect-[4/3] rounded-2xl border border-dashed border-grey/40"}`}
        >
          <AssetIcon
            name="image"
            width={28}
            height={28}
          />
          {label}
        </button>
      )}

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className={`mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] ${variant === "garment" ? 'px-8' : ''}`}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Select photo ${index + 1}`}
              aria-pressed={index === currentIndex}
              className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-[border-color,opacity] ${index === currentIndex ? 'opacity-100' : 'opacity-60'}`}
              style={{
                borderColor: index === currentIndex ? accent : "transparent",
              }}
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
              className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed bg-surface/60 active:bg-surface"
              style={{ borderColor: accent, color: accent }}
            >
              <AssetIcon name="plus" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
