'use client';

import Image from 'next/image';
import Link from 'next/link';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UserCreateSheet({
  open,
  onClose,
}: Props) {
  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-500 ${
        open
          ? 'pointer-events-auto bg-black/55 backdrop-blur-[1px] opacity-100'
          : 'pointer-events-none bg-black/0 opacity-0'
      }`}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[560px] rounded-t-[23px] bg-[#171717] px-[28px] pb-8 pt-5 transition-transform duration-600 ${
          open
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-8 h-[8px] w-[92px] rounded-full bg-[#2B2B2B]" />

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="mt-2 text-[20px] font-medium text-white">
            What do you want to post?
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#303030] text-[25px] text-white"
          >
            ×
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">

          {/* Create post */}
          <Link
            href="/create-post"
            onClick={onClose}
            className="flex items-center gap-4 rounded-[20px] border border-[#2E2E2E] bg-transparent px-4 py-4"
          >
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[11px] bg-[#FF4A14]">
              <Image
                src="/icons/sparkle.svg"
                alt=""
                width={35}
                height={35}
              />
            </div>

            <div>
              <h3 className="text-[16px] font-medium text-white">
                Create a post
              </h3>

              <p className="mt-1 text-[13px] text-[#7A7A7A]">
                Share a look or a recent find.
              </p>
            </div>
          </Link>

          {/* List garment */}
          <Link
            href="/create-garment"
            onClick={onClose}
            className="flex items-center gap-4 rounded-[20px] border border-[#2E2E2E] bg-transparent px-4 py-4"
          >
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[11px] bg-[#C8F66F]">
              <Image
                src="/icons/garment.svg"
                alt=""
                width={35}
                height={35}
              />
            </div>

            <div>
              <h3 className="text-[16px] font-medium text-white">
                List a garment
              </h3>

              <p className="mt-1 text-[13px] text-[#7A7A7A]">
                Sell or exchange a piece.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}