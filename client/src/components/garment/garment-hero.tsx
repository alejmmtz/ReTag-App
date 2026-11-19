import Link from 'next/link';

import AssetIcon from '../icons/asset-icon';
import type { GarmentDetail } from './garment-detail-types';
import GarmentGallery from './garment-gallery';

type Props = {
  garment: Pick<GarmentDetail, 'name' | 'images' | 'seller' | 'size'>;
  showBag: boolean;
  onBack: () => void;
  onOpenBag: () => void;
};

export default function GarmentHero({ garment, showBag, onBack, onOpenBag }: Props) {
  const sellerName = garment.seller.name || garment.seller.username;

  return (
    <section className="relative isolate w-full">
      <GarmentGallery images={garment.images} alt={garment.name} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background via-background/75 to-transparent" />

      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="button-icon image-overlay absolute left-8 top-18"
      >
        <AssetIcon name="chevron" width={10} height={18} />
      </button>

      {showBag && (
        <button
          type="button"
          onClick={onOpenBag}
          aria-label="Open bag"
          className="button-icon image-overlay absolute right-8 top-18"
        >
          <AssetIcon name="bag" width={19} height={19} />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-between gap-3 px-8 text-sm">
        <Link href={`/profile/${garment.seller.id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green text-xs font-semibold text-background">
            {garment.seller.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={garment.seller.profilePicture} alt="" className="size-full object-cover" />
            ) : sellerName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">By <b className="font-medium">@{garment.seller.username}</b></span>
        </Link>
        {garment.size && (
          <span className="max-w-[48%] text-right leading-5">
            Size: <b className="font-medium">{garment.size.label}</b>{' '}
            <span className="text-foreground/80">({garment.size.type})</span>
          </span>
        )}
      </div>
    </section>
  );
}
