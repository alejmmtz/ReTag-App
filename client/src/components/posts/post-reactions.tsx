import Link from 'next/link';

import AssetIcon from '../icons/asset-icon';

export type PostReactor = {
  id: string;
  username: string;
  profilePicture: string | null;
};

type Props = {
  reactors: readonly PostReactor[];
  store: boolean;
};

export default function PostReactions({ reactors, store }: Props) {
  const visible: PostReactor[] = [];
  const seen = new Set<string>();

  for (const reactor of reactors) {
    if (seen.has(reactor.id)) continue;
    seen.add(reactor.id);
    visible.push(reactor);
    if (visible.length === 3) break;
  }

  if (visible.length === 0) return null;

  const positions = visible.length === 1
    ? ['bottom-0 left-6 -rotate-6']
    : visible.length === 2
      ? ['bottom-0 left-1 -rotate-6', 'right-0 top-1 rotate-6']
      : ['left-0 top-0 -rotate-6', 'right-0 top-3 rotate-6', 'bottom-0 left-3 -rotate-6'];

  return (
    <div className="pointer-events-none absolute bottom-14 right-12 z-20 h-20 w-20">
      {visible.map((reactor, index) => {
        const username = reactor.username.replace(/^@/, '');

        return (
          <Link
            key={reactor.id}
            href={`/profile/${encodeURIComponent(reactor.id)}`}
            aria-label={`Liked by @${username}. View profile`}
            className={`pointer-events-auto absolute flex size-8 items-center justify-center rounded-md border-2 text-xs font-semibold shadow-sm ${positions[index]} ${store ? 'text-foreground' : 'text-background'}`}
            style={{
              borderColor: 'var(--post-card-surface)',
              backgroundColor: 'var(--post-card-surface)',
            }}
          >
            {reactor.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reactor.profilePicture} alt="" className="size-full rounded-sm object-cover" />
            ) : username.charAt(0).toUpperCase()}
            <AssetIcon
              name="like"
              width={16}
              height={16}
              className={`absolute -bottom-1 -right-2 ${store ? 'text-foreground' : 'text-orange'}`}
              style={{
                filter: 'drop-shadow(1px 0 0 var(--post-card-surface)) drop-shadow(-1px 0 0 var(--post-card-surface)) drop-shadow(0 1px 0 var(--post-card-surface)) drop-shadow(0 -1px 0 var(--post-card-surface))',
              }}
            />
          </Link>
        );
      })}
    </div>
  );
}
