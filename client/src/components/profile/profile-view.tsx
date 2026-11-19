'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import StoreCreateSheet from '../events/store-create-sheet';
import StoreEventCard from '../events/store-event-card';
import UserCreateSheet from '../events/user-create-sheet';
import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import { ClosetGrid, PostsGrid } from './profile-grids';
import ProfileHeader from './profile-header';
import type {
  MyStatistics,
  Paginated,
  ProfileEvent,
  ProfileGarment,
  ProfilePost,
  ProfileUser,
  StoreProfile,
} from './profile-types';

const PAGE_SIZE = 12;
const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

type Tab = 'posts' | 'closet' | 'events';

type Props = {
  userId?: string;
  storeMode?: boolean;
};

export default function ProfileView({ userId, storeMode = false }: Props) {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<MyStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Paginated<ProfilePost> | null>(null);
  const [garments, setGarments] = useState<Paginated<ProfileGarment> | null>(
    null,
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [events, setEvents] = useState<ProfileEvent[]>([]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const handleSessionError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        router.replace('/login');
        return true;
      }

      return false;
    },
    [router],
  );

  const targetId = userId ?? me?.id;
  const isOwn = !!me && targetId === me.id;

  useEffect(() => {
    let cancelled = false;

    authFetch<MeResponse>('/auth/me')
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (storeMode && data.role !== 'store') {
          router.replace('/profile');
          return;
        }

        setMe(data);
      })
      .catch((err) => {
        if (!cancelled && !handleSessionError(err)) {
          setError('We could not load this profile.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handleSessionError, router, storeMode]);

  useEffect(() => {
    if (!targetId || !me) {
      return;
    }

    let cancelled = false;
    const own = targetId === me.id;

    async function load() {
      try {
        const userData = await authFetch<ProfileUser>(`/users/${targetId}`);
        const [postsData, garmentsData, statsData, storeData, eventsData] =
          await Promise.all([
            authFetch<Paginated<ProfilePost>>(
              `/users/${targetId}/posts?page=1&limit=${PAGE_SIZE}`,
            ),
            authFetch<Paginated<ProfileGarment>>(
              `/users/${targetId}/garments?page=1&limit=${PAGE_SIZE}`,
            ),
            own
              ? authFetch<MyStatistics>('/users/me/statistics')
              : Promise.resolve(null),
            storeMode
              ? authFetch<StoreProfile>('/stores/me')
              : userData.role === 'store'
                ? authFetch<StoreProfile>(`/stores/user/${targetId}`).catch(
                    () => null,
                  )
                : Promise.resolve(null),
            storeMode
              ? authFetch<ProfileEvent[]>('/events/mine')
              : Promise.resolve([] as ProfileEvent[]),
          ]);

        if (!cancelled) {
          setUser(userData);
          setPosts(postsData);
          setGarments(garmentsData);
          setStats(statsData);
          setStore(storeData);
          setEvents(eventsData);
        }
      } catch (err) {
        if (cancelled || handleSessionError(err)) {
          return;
        }

        setError(
          err instanceof ApiError && err.status === 404
            ? 'This user does not exist.'
            : 'We could not load this profile.',
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [targetId, me, storeMode, handleSessionError]);

  async function loadMore() {
    const current = tab === 'posts' ? posts : garments;

    if (!current || loadingMore || current.meta.page >= current.meta.totalPages) {
      return;
    }

    setLoadingMore(true);

    try {
      const next = current.meta.page + 1;
      const path = tab === 'posts' ? 'posts' : 'garments';
      const data = await authFetch<Paginated<ProfilePost & ProfileGarment>>(
        `/users/${targetId}/${path}?page=${next}&limit=${PAGE_SIZE}`,
      );

      if (tab === 'posts') {
        setPosts((prev) =>
          prev ? { ...data, data: [...prev.data, ...data.data] } : data,
        );
      } else {
        setGarments((prev) =>
          prev ? { ...data, data: [...prev.data, ...data.data] } : data,
        );
      }
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoadingMore(false);
    }
  }

  // Follow / unfollow0.
  async function toggleFollow() {
    if (!user || followBusy) {
      return;
    }

    setFollowBusy(true);

    try {
      await authFetch(`/users/${user.id}/follow`, {
        method: following ? 'DELETE' : 'POST',
      });
      setFollowing(!following);
    } catch (err) {
      if (handleSessionError(err)) {
        return;
      }

      if (err instanceof ApiError && err.status === 409) {
        setFollowing(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setFollowing(false);
      }
    } finally {
      setFollowBusy(false);
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

  if (!user || !me || !posts || !garments || (storeMode && !store)) {
    return (
      <main className="min-h-screen bg-[#191919] px-6 pt-16 text-white">
        <div className="mx-auto w-full max-w-[560px] space-y-4">
          <div className="h-[84px] w-full animate-pulse rounded-[22px] bg-[#262626]" />
          <div className="h-[72px] w-full animate-pulse rounded-[18px] bg-[#262626]" />
          <div className="h-[240px] w-full animate-pulse rounded-[18px] bg-[#262626]" />
        </div>
      </main>
    );
  }

  const accent = ACCENT[user.role];
  const accentText = user.role === 'store' ? '#FFFFFF' : '#1A1A1A';

  const headerStats = stats
    ? [
        { label: 'Follow', value: stats.community.following },
        { label: 'Followers', value: stats.community.followers },
        { label: 'Likes', value: stats.community.likesReceived },
      ]
    : [
        { label: 'Posts', value: posts.meta.total },
        { label: 'Closet', value: garments.meta.total },
      ];

  function logout() {
    clearSession();
    router.replace('/login');
  }

  const tabs: Tab[] = storeMode ? ['posts', 'closet', 'events'] : ['posts', 'closet'];
  const showingEvents = tab === 'events';
  const current = tab === 'closet' ? garments : posts;
  const hasMore = !showingEvents && current.meta.page < current.meta.totalPages;

  const dim = '#8A8A8A';

  return (
    <main className="min-h-screen bg-[#191919] pb-[190px] text-white">
      <div className="mx-auto w-full max-w-[560px]">
        <ProfileHeader
          user={user}
          store={store}
          accent={accent}
          accentText={accentText}
          stats={headerStats}
          isOwn={isOwn}
          onLogout={logout}
          onBack={() => router.back()}
          action={
            !isOwn ? (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={followBusy}
                className="h-[40px] rounded-full border px-6 text-[14px] font-medium disabled:opacity-50"
                style={
                  following
                    ? { borderColor: '#6C6C6C', color: '#F5F5F5' }
                    : { backgroundColor: accent, borderColor: accent, color: accentText }
                }
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : (
              <Link
                href="/profile/edit"
                className="inline-flex h-[40px] items-center rounded-full border px-6 text-[14px] font-medium"
                style={{ borderColor: accent, color: accent }}
              >
                Edit profile
              </Link>
            )
          }
        />

        <div className="px-6">
          {/* Pestañas */}
          <div
            className="mt-6 grid border-b border-[#2A2A2A]"
            style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
          >
            {tabs.map((item) => {
              const active = item === tab;
              const label =
                item === 'closet' ? (store ? 'Garments' : 'Closet') : item === 'posts' ? 'Posts' : 'Events';

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className="flex items-center justify-center gap-2 pb-3 text-[15px] font-medium"
                  style={{
                    color: active ? '#F5F5F5' : dim,
                    borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                  }}
                >
                  {item === 'posts' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  )}
                  {item === 'closet' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7a2 2 0 1 0-2-2"/><path d="m12 7 9 6a1 1 0 0 1-.6 1.8H3.6A1 1 0 0 1 3 13l9-6z"/></svg>
                  )}
                  {item === 'events' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {showingEvents ? (
              events.length === 0 ? (
                <p className="py-12 text-center text-[14px] text-[#8A8A8A]">No events yet.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <StoreEventCard key={event.id} event={event} mode="store" />
                  ))}
                </div>
              )
            ) : current.data.length === 0 ? (
              <p className="py-12 text-center text-[14px] text-[#8A8A8A]">
                {tab === 'posts' ? 'No posts yet.' : 'Nothing in the closet yet.'}
              </p>
            ) : tab === 'posts' ? (
              <PostsGrid posts={posts.data} accent={accent} />
            ) : (
              <ClosetGrid
                garments={garments.data}
                accent={accent}
                accentText={accentText}
                title={
                  store
                    ? 'Our garments'
                    : isOwn
                      ? 'Welcome to my Closet!'
                      : `${user.name ?? user.username}'s Closet`
                }
              />
            )}

            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mx-auto mt-6 block h-[44px] rounded-full border border-[#6C6C6C] px-6 text-[14px] disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOwn && (
        <>
          <div className="pointer-events-none fixed bottom-[112px] left-1/2 z-40 flex w-full max-w-[560px] -translate-x-1/2 justify-end px-6">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Create"
              className="pointer-events-auto flex h-[60px] w-[60px] items-center justify-center rounded-full text-[30px] font-light"
              style={{
                backgroundColor: accent,
                color: accentText,
                boxShadow: `0 0 24px ${accent}66`,
              }}
            >
              +
            </button>
          </div>

          {me.role === 'store' ? (
            <StoreCreateSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
          ) : (
            <UserCreateSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
          )}
        </>
      )}

      {me.role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
