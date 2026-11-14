'use client';

import Link from 'next/link';
import { useState } from 'react';

import HeartIcon from '../icons/heart-icon';
import SendIcon from '../icons/send-icon';
import TagIcon from '../icons/tag-icon';
import type { PostItem } from './post-types';

type Props = {
  post: PostItem;
  // On the "Following" feed every author is followed, so the badge is shown.
  showFollowing?: boolean;
  onToggleLike: (post: PostItem) => void;
};

// 13-9-2026
function formatPostDate(dateString: string) {
  const date = new Date(dateString);

  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function getSubtitle(post: PostItem) {
  const author = post.author.username;

  if (post.postType === 'show off' && post.garment) {
    return `${author} is Showing Off ${post.garment.name}`;
  }

  if (post.postType === 'offer' && post.garment) {
    return `${author} is offering ${post.garment.name}`;
  }

  if (post.postType === 'event' && post.event) {
    return `${author} is promoting ${post.event.title}`;
  }

  return `${author} shared with the community`;
}

export default function PostCard({
  post,
  showFollowing = false,
  onToggleLike,
}: Props) {
  const [copied, setCopied] = useState(false);

  const cover =
    post.images.find((image) => image.isCover) ?? post.images[0];

  const chipLabel = post.garment?.name ?? post.event?.title;

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
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the link just is not copied.
    }
  }

  return (
    <article className="w-full rounded-[22px] bg-[#F5F5F5] p-[10px] text-[#1A1A1A]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#2A2A2A]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={post.caption}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-8 text-center text-[18px] font-medium text-[#8A8A8A]">
            {post.caption}
          </div>
        )}

        {/* Author */}
        <Link
          href={`/profile/${post.author.id}`}
          className="absolute left-3 top-3 flex max-w-[60%] items-center gap-2 rounded-full bg-white/95 py-[5px] pl-[5px] pr-3"
        >
          {post.author.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.profilePicture}
              alt=""
              className="h-[26px] w-[26px] rounded-full object-cover"
            />
          ) : (
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#1A1A1A] text-[12px] font-medium uppercase text-white">
              {post.author.username.charAt(0)}
            </span>
          )}

          <span className="truncate text-[13px] font-medium">
            @{post.author.username}
          </span>
        </Link>

        {showFollowing && (
          <span className="absolute right-3 top-3 rounded-full bg-[#C8F66F] px-4 py-[6px] text-[13px] font-medium">
            Following
          </span>
        )}

        {/* Garment or event linked to the post */}
        {chipLabel && (
          <span className="absolute bottom-3 left-3 flex max-w-[58%] items-center gap-2 rounded-full bg-[#C8F66F] px-4 py-[8px] text-[13px] font-medium">
            <span className="truncate">{chipLabel}</span>
            <TagIcon />
          </span>
        )}

        {/* Like and share */}
        <div className="absolute bottom-3 right-3 flex items-center gap-4 rounded-full bg-white px-4 py-[7px]">
          <button
            type="button"
            onClick={() => onToggleLike(post)}
            aria-pressed={post.likedByMe}
            aria-label={post.likedByMe ? 'Remove like' : 'Like post'}
            className={`flex items-center gap-1 text-[15px] font-medium ${
              post.likedByMe ? 'text-[#FB3F0F]' : 'text-[#1A1A1A]'
            }`}
          >
            <HeartIcon filled={post.likedByMe} size={22} />
            {post.likesCount}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share post"
            className="text-[#1A1A1A]"
          >
            <SendIcon />
          </button>
        </div>

        {copied && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-4 py-2 text-[13px] text-white">
            Link copied
          </span>
        )}
      </div>

      <div className="px-2 pb-2 pt-3">
        <p className="text-[16px] font-medium">{post.caption}</p>

        <p className="mt-1 text-[13px] text-[#8A8A8A]">
          {getSubtitle(post)}
        </p>

        <p className="text-[13px] text-[#8A8A8A]">
          {formatPostDate(post.createdAt)}
        </p>
      </div>
    </article>
  );
}
