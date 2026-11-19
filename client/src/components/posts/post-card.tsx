'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import AssetIcon from '../icons/asset-icon';
import PostCaption from './post-caption';
import PostInnerCorner from './post-inner-corner';
import PostReactions, { type PostReactor } from './post-reactions';
import type { PostItem } from './post-types';

type Props = {
  post: PostItem;
  // On the "Following" feed every author is followed, so the badge is shown.
  showFollowing?: boolean;
  onToggleLike: (post: PostItem) => void;
  viewerRole?: 'user' | 'store';
  authorName?: string;
  // Real liker profiles can be supplied when the API exposes them.
  reactors?: readonly PostReactor[];
};

function formatPostDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function getSubtitle(post: PostItem, author: string) {
  if (post.postType === 'show off') {
    return post.garment ? `${author} is Showing Off ${post.garment.name}` : `${author} is Showing Off`;
  }

  if (post.postType === 'offer') {
    return `${author} is offering ${post.garment?.name ?? 'a garment'}`;
  }

  if (post.postType === 'event') {
    return `${author} is hosting an Event`;
  }

  return `${author} is Making the Difference`;
}

function getBadge(post: PostItem, viewerRole: 'user' | 'store') {
  if (post.postType === 'community') {
    return { label: 'Community', icon: 'leaf', href: null };
  }
  if (post.postType === 'event') {
    return { label: 'Event', icon: 'clipboard', href: post.event ? `/event/${post.event.id}?mode=${viewerRole}` : null };
  }
  return {
    label: post.garment?.name ?? (post.postType === 'offer' ? 'Offer' : 'Show Off'),
    icon: 'tag',
    href: post.garment ? `/garment/${post.garment.id}` : null,
  };
}

export default function PostCard({
  post,
  showFollowing = false,
  onToggleLike,
  viewerRole = 'user',
  authorName,
  reactors = [],
}: Props) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const cover =
    post.images.find((image) => image.isCover) ?? post.images[0];

  const store = post.author.role === 'store';
  const surface = store ? 'bg-blue' : 'bg-foreground';
  const cornerColor = store ? 'text-blue' : 'text-foreground';
  const ink = store ? 'text-foreground' : 'text-background';
  const displayName = authorName?.trim() || post.author.username;
  const badge = getBadge(post, viewerRole);
  const dateLabel = formatPostDate(post.createdAt);
  const cardStyle = {
    '--post-card-surface': store ? 'var(--blue)' : 'var(--foreground)',
  } as CSSProperties;
  const badgeContent = (
    <>
      <span className="truncate">{badge.label}</span>
      <AssetIcon name={badge.icon} width={16} height={16} />
    </>
  );
  const badgeClassName = `mb-2 inline-flex min-h-9 min-w-0 shrink items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${store ? 'bg-blue text-foreground' : 'bg-green text-background'}`;

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ReTag', text: post.caption, url });
        return;
      } catch {
        // The user closed the share sheet, nothing else to do.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the link just is not copied.
    }
  }

  return (
    <article
      data-post-type={post.postType}
      data-author-role={post.author.role}
      style={cardStyle}
      className={`relative isolate w-full min-w-0 overflow-hidden rounded-2xl p-1 ${surface} ${ink}`}
    >
      <div className={`relative w-full overflow-hidden rounded-xl bg-line ${cover ? 'aspect-[6/7]' : 'min-h-44'}`}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={post.caption}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-grey/50">
            <AssetIcon name="image" width={28} height={28} />
          </div>
        )}

        <Link
          href={`/post/${post.id}`}
          aria-label={`View post by @${post.author.username}`}
          className="absolute inset-0 rounded-xl focus-visible:outline-offset-[-4px]"
        />

        <Link
          href={`/profile/${post.author.id}`}
          className={`absolute left-0 top-0 z-10 flex min-h-10 min-w-0 items-center gap-2 rounded-br-2xl pb-2 pl-1 pr-3 pt-1 text-sm font-medium ${surface} ${showFollowing ? 'max-w-[calc(100%-6.5rem)]' : 'max-w-[calc(100%-1rem)]'}`}
        >
          {post.author.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.profilePicture} alt="" loading="lazy" className="size-6 shrink-0 rounded-md object-cover" />
          ) : (
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs uppercase ${store ? 'bg-foreground/15' : 'bg-background/10'}`}>
              {post.author.username.charAt(0)}
            </span>
          )}
          <span className="min-w-0 truncate">{store ? displayName : `@${post.author.username}`}</span>
          {store && (
            <Image
              src="/icons/verified-badge.svg"
              alt="Store"
              width={16}
              height={16}
              className="shrink-0"
              style={{ filter: 'invert(100%) hue-rotate(292.43deg) saturate(324.3%) contrast(80.57%) brightness(117.07%)' }}
            />
          )}
          <PostInnerCorner corner="left-top" className={`absolute left-full top-0 -ml-px ${cornerColor}`} />
          <PostInnerCorner corner="left-top" className={`absolute left-0 top-full -mt-px ${cornerColor}`} />
        </Link>

        {showFollowing && (
          <span className={`absolute right-2 top-2 z-20 rounded-md px-3 py-2 text-xs font-semibold ${store ? 'bg-blue text-foreground' : 'bg-green text-background'}`}>
            Following
          </span>
        )}

        <PostReactions reactors={reactors} store={store} />

        <div className="pointer-events-none absolute bottom-0 left-2 right-0 z-20 flex items-end gap-5">
          {badge.href ? (
            <Link href={badge.href} className={`pointer-events-auto ${badgeClassName}`}>{badgeContent}</Link>
          ) : (
            <span className={badgeClassName}>{badgeContent}</span>
          )}
        <div className={`pointer-events-auto relative ml-auto flex min-h-11 shrink-0 items-center rounded-tl-2xl pl-2 pt-1 ${surface}`}>
          <PostInnerCorner corner="right-bottom" className={`absolute bottom-full right-0 -mb-px ${cornerColor}`} />
          <PostInnerCorner corner="right-bottom" className={`absolute bottom-0 right-full -mr-px ${cornerColor}`} />
          <button
            type="button"
            onClick={() => onToggleLike(post)}
            aria-pressed={post.likedByMe}
            aria-label={`${post.likedByMe ? 'Remove like' : 'Like post'}, ${post.likesCount} likes`}
            className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-1 text-sm font-medium tabular-nums active:scale-95"
          >
            <AssetIcon name="like" width={20} height={20} className={store ? (post.likedByMe ? 'text-foreground' : 'text-foreground/70') : (post.likedByMe ? 'text-orange' : 'text-background')} />
            <span>
              {Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(post.likesCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share post"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg p-2.5 active:scale-95"
          >
            <AssetIcon name="send" width={20} height={20} />
          </button>
        </div>
        </div>

        {copied && (
          <span role="status" className="image-overlay page-enter absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-4 py-2 text-sm">
            Link copied
          </span>
        )}
      </div>

      <Link href={`/post/${post.id}`} className="block px-2 pb-2.5 pt-2.5">
        <PostCaption caption={post.caption} store={store} />
        <p className={`mt-1.5 text-xs leading-4 ${store ? 'text-foreground/85' : 'text-grey'}`}>
          {getSubtitle(post, displayName)}
        </p>
        {dateLabel && (
          <time dateTime={post.createdAt} className={`block text-xs leading-4 ${store ? 'text-foreground/85' : 'text-grey'}`}>
            {dateLabel}
          </time>
        )}
      </Link>
    </article>
  );
}
