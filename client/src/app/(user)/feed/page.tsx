'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import UserBottomNav from '../../../components/navigation/user-bottom-nav';
import UserCreateSheet from '../../../components/events/user-create-sheet';
import HeartIcon from '../../../components/icons/heart-icon';
import BagIcon from '../../../components/icons/bag-icon';
import SearchIcon from '../../../components/icons/search-icon';
import FeedFilterSelect from '@/src/components/posts/feed-filter-select';
import PostCard from '../../../components/posts/post-card';
import type {
  FeedFilter,
  MeResponse,
  PostItem,
  PostsPage,
  PublicUser,
} from '../../../components/posts/post-types';
import { ApiError, authFetch, clearSession } from '../../../lib/http';

const PAGE_SIZE = 10;

export default function FeedPage() {
  const router = useRouter();

  const [filter, setFilter] = useState<FeedFilter>('for_you');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleSessionError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.replace('/login');
        return true;
      }

      return false;
    },
    [router],
  );

  useEffect(() => {
    async function loadMe() {
      try {
        const me = await authFetch<MeResponse>('/auth/me');

        if (me.role === 'store') {
          router.replace('/home');
          return;
        }

        const user = await authFetch<PublicUser>(`/users/${me.id}`);

        setName(user.name ?? user.username);
      } catch (error) {
        handleSessionError(error);
      }
    }

    loadMe();
  }, [router, handleSessionError]);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      setLoading(true);
      setError('');

      try {
        const result = await authFetch<PostsPage>(
          `/posts?feed=${filter}&page=1&limit=${PAGE_SIZE}`,
        );

        if (cancelled) {
          return;
        }

        setPosts(result.data);
        setPage(1);
        setTotalPages(result.meta.totalPages);
      } catch (error) {
        if (cancelled || handleSessionError(error)) {
          return;
        }

        setPosts([]);
        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey, handleSessionError]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= totalPages) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = page + 1;

      const result = await authFetch<PostsPage>(
        `/posts?feed=${filter}&page=${nextPage}&limit=${PAGE_SIZE}`,
      );

      setPosts((previous) => [
        ...previous,
        ...result.data.filter(
          (post) => !previous.some((item) => item.id === post.id),
        ),
      ]);
      setPage(nextPage);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      handleSessionError(error);
    } finally {
      setLoadingMore(false);
    }
  }, [filter, loading, loadingMore, page, totalPages, handleSessionError]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  async function toggleLike(post: PostItem) {
    const liked = !post.likedByMe;

    function setLike(likedByMe: boolean, likesCount: number) {
      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id ? { ...item, likedByMe, likesCount } : item,
        ),
      );
    }

    setLike(liked, post.likesCount + (liked ? 1 : -1));

    try {
      await authFetch(`/posts/${post.id}/like`, {
        method: liked ? 'POST' : 'DELETE',
      });
    } catch (error) {
      setLike(post.likedByMe, post.likesCount);
      handleSessionError(error);
    }
  }

  return (
    <main className="min-h-screen bg-[#191919] pb-[130px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-16">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-[22px] font-medium leading-tight">
            Keep it Circular{name ? `, ${name}` : ''}!
          </h1>

          <div className="flex items-center gap-4">
            <Link href="/activity" aria-label="Activity">
              <HeartIcon />
            </Link>

            <button type="button" aria-label="Bag">
              <BagIcon />
            </button>
          </div>
        </header>

        <label className="mt-6 flex h-[48px] items-center gap-3 rounded-full border border-[#6C6C6C] px-4 text-[#8A8A8A]">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search for users and stores..."
            className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#8A8A8A]"
          />
        </label>

        <div className="mt-5">
          <FeedFilterSelect value={filter} onChange={setFilter} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 space-y-5">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-[#262626]"
              />
            ))}
          </div>
        )}

        {/* Empty or error */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-24 text-center">
            <Image
              src="/illustrations/error.png"
              alt=""
              width={150}
              height={94}
              className="h-auto w-[150px] brightness-0 invert"
            />

            <h2 className="mt-8 text-[20px] font-medium">
              We couldn’t find any posts
            </h2>

            <p className="mt-2 text-[15px] text-[#8A8A8A]">
              {error
                ? 'Don’t worry, looks like you are offline.'
                : filter === 'following'
                  ? 'Follow someone to see their posts here.'
                  : 'Be the first to post something.'}
            </p>

            {error && (
              <button
                type="button"
                onClick={() => setReloadKey((previous) => previous + 1)}
                className="mt-6 h-[44px] rounded-full bg-[#C8F66F] px-8 text-[15px] font-medium text-[#1A1A1A]"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Posts */}
        {!loading && posts.length > 0 && (
          <div className="mt-6 space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showFollowing={filter === 'following'}
                onToggleLike={toggleLike}
              />
            ))}

            {loadingMore && (
              <p className="py-4 text-center text-[#8A8A8A]">Loading...</p>
            )}

            <div ref={sentinelRef} className="h-1" />
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed bottom-[112px] left-1/2 z-40 flex w-full max-w-[560px] -translate-x-1/2 justify-end px-6">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Create"
          className="pointer-events-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#C8F66F] text-[30px] font-light text-[#1A1A1A] shadow-[0_0_24px_rgba(200,246,111,0.45)]"
        >
          +
        </button>
      </div>

      <UserCreateSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <UserBottomNav />
    </main>
  );
}
