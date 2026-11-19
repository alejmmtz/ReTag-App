"use client";

import Image from "next/image";
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
        <div
          className={`relative w-full overflow-hidden bg-[#262626] ${variant === "garment" ? "aspect-square rounded-[18px]" : "aspect-[4/3] "}`}
        >
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
          className={`flex w-full flex-col items-center justify-center gap-3 bg-[#202020] text-grey ${variant === "garment" ? "aspect-square rounded-[18px] text-[16px]" : "aspect-[4/3] rounded-[22px] text-[15px]"}`}
        >
          <Image
            src="/icons/image.svg"
            alt=""
            width={variant === "garment" ? 42 : 26}
            height={variant === "garment" ? 42 : 26}
          />
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
              style={{
                borderColor: index === selected ? accent : "transparent",
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
