import Link from 'next/link';

import type { ProfileGarment, ProfilePost } from './profile-types';

function coverOf(images: { url: string; isCover: boolean }[]) {
  return (images.find((image) => image.isCover) ?? images[0])?.url ?? null;
}

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#262626] text-[12px] text-[#6C6C6C]">
      No photo
    </div>
  );
}

export function PostsGrid({ posts }: { posts: ProfilePost[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post) => {
        const cover = coverOf(post.images);

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="relative aspect-square overflow-hidden rounded-[14px]"
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={post.caption}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#262626] p-2 text-center text-[11px] text-[#8A8A8A]">
                {post.caption.slice(0, 60)}
              </div>
            )}

            {post.images.length > 1 && (
              <span className="absolute right-1 top-1 rounded-full bg-black/70 px-[6px] text-[10px]">
                +{post.images.length - 1}
              </span>
            )}
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

// Cuadrícula del clóset: foto, nombre, talla y precio.
export function ClosetGrid({ garments }: { garments: ProfileGarment[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {garments.map((garment) => {
        const cover = coverOf(garment.images);

        return (
          <Link
            key={garment.id}
            href={`/garment/${garment.id}`}
            className="block"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[18px]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={garment.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Placeholder />
              )}
            </div>

            <p className="mt-2 truncate text-[14px] font-medium">
              {garment.name}
            </p>
            <p className="truncate text-[12px] text-[#8A8A8A]">
              {[garment.brand?.name, garment.size?.label]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="text-[13px]">{priceLabel(garment)}</p>
          </Link>
        );
      })}
    </div>
  );
}