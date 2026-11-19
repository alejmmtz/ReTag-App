'use client';

import AssetIcon from '../icons/asset-icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import PostCard from './post-card';
import type { MeResponse, PostItem } from './post-types';

type PostDetail = PostItem & { isFollowingAuthor: boolean };

const ACCENT = { user: '#C8F66F', store: '#1D5CEB' } as const;

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
      <main className="bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
        <p className="text-sm text-grey">{error}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="button-pill mt-6 border border-[#6C6C6C]"
        >
          Go back
        </button>
      </main>
    );
  }

  if (!post || !me) {
    return (
      <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
        <div className="mx-auto w-full max-w-lg">
          <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-surface" />
        </div>
      </main>
    );
  }

  const accent = ACCENT[me.role];
  const accentText = me.role === 'store' ? '#FFFFFF' : '#1A1A1A';
  const isOwner = post.author.id === me.id;

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="mx-auto w-full max-w-lg mb-28">
        <header className="mb-5 flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center text-sm min-h-11 min-w-11"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>
          <h1 className="text-xl font-semibold">Post</h1>
        </header>

        <PostCard
          post={post}
          viewerRole={me.role}
          showFollowing={post.isFollowingAuthor}
          onToggleLike={toggleLike}
        />

        {/* Enlaces a la prenda o al evento del post */}
        {post.garment && (
          <Link
            href={`/garment/${post.garment.id}`}
            className="button-pill mt-4 w-full"
            style={{ backgroundColor: accent, color: accentText }}
          >
            See {post.garment.name}
          </Link>
        )}

        {post.event && (
          <Link
            href={`/event/${post.event.id}`}
            className="button-pill mt-4 w-full"
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
            className="button-pill mt-4 w-full border border-orange text-orange"
          >
            Delete post
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-t-[23px] bg-[#171717] px-7 pb-8 pt-6">
            <h2 className="text-base font-semibold">Delete this post?</h2>
            <p className="mt-2 text-sm text-grey">
              It will disappear from the feed and your profile. This cannot be
              undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-orange" role="alert">
                {deleteError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="button-pill border border-[#6C6C6C] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="button-pill bg-orange disabled:opacity-50"
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
