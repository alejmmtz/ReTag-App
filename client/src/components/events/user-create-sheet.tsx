'use client';

import AssetIcon from '../icons/asset-icon';
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
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        open
          ? 'pointer-events-auto bg-black/55 backdrop-blur-sm opacity-100'
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
        id="user-create-menu"
        role="dialog"
        aria-labelledby="user-create-title"
        className={`absolute bottom-0 left-0 right-0 mx-auto w-full max-w-lg rounded-t-3xl border-t border-foreground/10 bg-background px-8 pb-8 pt-4 shadow-2xl shadow-background/40 transition-transform duration-300 ${
 open
 ? 'translate-y-0'
 : 'translate-y-full'
 }`}
      >
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-grey/40" />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id="user-create-title" className="min-w-0 text-base font-semibold text-foreground">
            What do you want to post?
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close create menu"
            className="button-icon bg-surface text-foreground ring-1 ring-line"
          >
            <span aria-hidden="true" className="inline-block h-6 w-6" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">

          {/* Create post */}
          <Link
            href="/create-post"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface/50 p-4 active:border-grey/60 active:bg-surface"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange">
              <AssetIcon
                name="sparkle"
                width={28}
                height={28}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                Create a post
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-grey">
                Share a look or a recent find.
              </p>
            </div>
          </Link>

          {/* List garment */}
          <Link
            href="/create-garment"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface/50 p-4 active:border-grey/60 active:bg-surface"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green text-background">
              <AssetIcon
                name="garment"
                width={28}
                height={28}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                List a garment
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-grey">
                Sell or exchange a piece.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
