'use client';

import CreateAction from '../navigation/create-action';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import StoreCreateSheet from '../events/store-create-sheet';
import UserCreateSheet from '../events/user-create-sheet';
import BagIcon from '../icons/bag-icon';
import HeartIcon from '../icons/heart-icon';
import SearchIcon from '../icons/search-icon';
import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import FeedFilterSelect from './feed-filter-select';
import PostCard from './post-card';
import UserSearchResults from './user-search-results';
import type {
  FeedFilter,
  MeResponse,
  PostItem,
  PostsPage,
  PublicUser,
} from './post-types';

const PAGE_SIZE = 10;

const THEME = {
  user: { accent: '#C8F66F', text: '#1A1A1A', glow: 'rgba(200,246,111,0.45)' },
  store: { accent: '#1D5CEB', text: '#FFFFFF', glow: 'rgba(29,92,235,0.5)' },
} as const;

type Props = {
  // Qué pantalla de inicio es: /feed (user) o /home (store).
  role: 'user' | 'store';
};

export default function FeedScreen({ role }: Props) {
  const theme = THEME[role];
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
  const [searchText, setSearchText] = useState('');
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

        // Cada rol tiene su propio inicio: si entra al equivocado, lo mandamos al suyo.
        if (me.role !== role) {
          router.replace(me.role === 'store' ? '/home' : '/feed');
          return;
        }

        const user = await authFetch<PublicUser>(`/users/${me.id}`);

        setName(user.name ?? user.username);
      } catch (error) {
        handleSessionError(error);
      }
    }

    loadMe();
  }, [router, role, handleSessionError]);

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
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter">
      <div className="mx-auto w-full max-w-lg mb-28">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 break-words text-xl font-semibold leading-tight">
            Keep it Circular{name ? `, ${name}` : ''}!
          </h1>

          <div className="flex shrink-0 items-center gap-4">
            <Link href="/notifications" aria-label="Notifications">
              <HeartIcon />
            </Link>

            {role === 'user' && (
              <Link href="/bag" aria-label="Bag">
                <BagIcon />
              </Link>
            )}
          </div>
        </header>

        <label className="mt-6 flex h-12 items-center gap-3 rounded-full border border-[#6C6C6C] px-4 text-grey">
          <SearchIcon />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search for users and stores..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-grey min-h-11"
          />
        </label>

        {searchText.trim() ? (
          <UserSearchResults
            query={searchText}
            accent={theme.accent}
            accentText={theme.text}
          />
        ) : (
          <>
        <div className="mt-5">
          <FeedFilterSelect
            value={filter}
            onChange={setFilter}
            accent={theme.accent}
            accentText={theme.text}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 space-y-5">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-surface"
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

            <h2 className="mt-8 text-base font-semibold">
              We couldn’t find any posts
            </h2>

            <p className="mt-2 text-sm text-grey">
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
                className="mt-6 h-[44px] rounded-full px-8 text-sm font-medium min-h-11 min-w-11"
                style={{ backgroundColor: theme.accent, color: theme.text }}
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
                viewerRole={role}
                showFollowing={filter === 'following'}
                onToggleLike={toggleLike}
              />
            ))}

            {loadingMore && (
              <p className="py-4 text-center text-grey">Loading...</p>
            )}

            <div ref={sentinelRef} className="h-1" />
          </div>
        )}
          </>
        )}
      </div>

      <CreateAction role={role} open={sheetOpen} onClick={() => setSheetOpen(true)} />

      {role === 'store' ? (
        <StoreCreateSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      ) : (
        <UserCreateSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
