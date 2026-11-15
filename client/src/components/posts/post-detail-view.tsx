'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import PostCard from './post-card';
import type { MeResponse, PostItem } from './post-types';

type PostDetail = PostItem & { isFollowingAuthor: boolean };

const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

export default function PostDetailView({ postId }: { postId: string }) {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meData, postData] = await Promise.all([
          authFetch<MeResponse>('/auth/me'),
          authFetch<PostDetail>(`/posts/${postId}`),
        ]);

        if (!cancelled) {
          setMe(meData);
          setPost(postData);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace('/login');
          return;
        }

        setError(
          err instanceof ApiError && (err.status === 404 || err.status === 400)
            ? 'This post does not exist.'
            : 'We could not load this post.',
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [postId, router]);

  async function toggleLike(current: PostItem) {
    const liked = !current.likedByMe;

    function setLike(likedByMe: boolean, likesCount: number) {
      setPost((previous) =>
        previous ? { ...previous, likedByMe, likesCount } : previous,
      );
    }

    setLike(liked, current.likesCount + (liked ? 1 : -1));

    try {
      await authFetch(`/posts/${current.id}/like`, {
        method: liked ? 'POST' : 'DELETE',
      });
    } catch (err) {
      setLike(current.likedByMe, current.likesCount);

      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        router.replace('/login');
      }
    }
  }

  async function handleDelete() {
    if (!post || deleting) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await authFetch(`/posts/${post.id}`, { method: 'DELETE' });
      router.replace(me?.role === 'store' ? '/home' : '/feed');
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'We could not delete this post.',
      );
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-24 text-center text-white">
        <p className="text-[15px] text-[#8A8A8A]">{error}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 h-[44px] rounded-full border border-[#6C6C6C] px-6 text-[14px]"
        >
          Go back
        </button>
      </main>
    );
  }

  if (!post || !me) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-[#262626]" />
        </div>
      </main>
    );
  }

  const accent = ACCENT[me.role];
  const accentText = me.role === 'store' ? '#FFFFFF' : '#1A1A1A';
  const isOwner = post.author.id === me.id;

  return (
    <main className="min-h-screen bg-[#191919] pb-[130px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <header className="mb-5 flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center text-[28px]"
          >
            ‹
          </button>
          <h1 className="text-[20px] font-medium">Post</h1>
        </header>

        <PostCard
          post={post}
          showFollowing={post.isFollowingAuthor}
          onToggleLike={toggleLike}
        />

        {/* Enlaces a la prenda o al evento del post */}
        {post.garment && (
          <Link
            href={`/garment/${post.garment.id}`}
            className="mt-4 flex h-[51px] w-full items-center justify-center rounded-full text-[15px] font-medium"
            style={{ backgroundColor: accent, color: accentText }}
          >
            See {post.garment.name}
          </Link>
        )}

        {post.event && (
          <Link
            href={`/event/${post.event.id}`}
            className="mt-4 flex h-[51px] w-full items-center justify-center rounded-full text-[15px] font-medium"
            style={{ backgroundColor: accent, color: accentText }}
          >
            See {post.event.title}
          </Link>
        )}

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmDelete(true);
            }}
            className="mt-4 h-[51px] w-full rounded-full border border-[#FB3F0F] text-[15px] font-medium text-[#FB3F0F]"
          >
            Delete post
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[560px] rounded-t-[23px] bg-[#171717] px-7 pb-8 pt-6">
            <h2 className="text-[20px] font-medium">Delete this post?</h2>
            <p className="mt-2 text-[14px] text-[#8A8A8A]">
              It will disappear from the feed and your profile. This cannot be
              undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-[13px] text-[#FB3F0F]" role="alert">
                {deleteError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="h-[48px] rounded-full border border-[#6C6C6C] text-[15px] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-[48px] rounded-full bg-[#FB3F0F] text-[15px] font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {me.role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
