'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';
import { ClosetGrid, PostsGrid } from './profile-grids';
import ProfileHeader from './profile-header';
import type {
  MyStatistics,
  Paginated,
  ProfileGarment,
  ProfilePost,
  ProfileUser,
} from './profile-types';

const PAGE_SIZE = 12;
const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

type Tab = 'posts' | 'closet';

type Props = {
  userId?: string;
};

export default function ProfileView({ userId }: Props) {
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

  // 1) Quién soy
  useEffect(() => {
    let cancelled = false;

    authFetch<MeResponse>('/auth/me')
      .then((data) => !cancelled && setMe(data))
      .catch((err) => {
        if (!cancelled && !handleSessionError(err)) {
          setError('We could not load this profile.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handleSessionError]);

  // 2) Datos del perfil, sus posts, su clóset y (si es el propio) estadísticas
  useEffect(() => {
    if (!targetId || !me) {
      return;
    }

    let cancelled = false;
    const own = targetId === me.id;

    async function load() {
      try {
        const [userData, postsData, garmentsData, statsData] =
          await Promise.all([
            authFetch<ProfileUser>(`/users/${targetId}`),
            authFetch<Paginated<ProfilePost>>(
              `/users/${targetId}/posts?page=1&limit=${PAGE_SIZE}`,
            ),
            authFetch<Paginated<ProfileGarment>>(
              `/users/${targetId}/garments?page=1&limit=${PAGE_SIZE}`,
            ),
            own
              ? authFetch<MyStatistics>('/users/me/statistics')
              : Promise.resolve(null),
          ]);

        if (!cancelled) {
          setUser(userData);
          setPosts(postsData);
          setGarments(garmentsData);
          setStats(statsData);
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
  }, [targetId, me, handleSessionError]);

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

  if (!user || !me || !posts || !garments) {
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
        { label: 'Posts', value: stats.posts },
        { label: 'Closet', value: stats.garments.available },
        { label: 'Followers', value: stats.community.followers },
        { label: 'Following', value: stats.community.following },
      ]
    : [];

  const current = tab === 'posts' ? posts : garments;
  const hasMore = current.meta.page < current.meta.totalPages;

  return (
    <main className="min-h-screen bg-[#191919] pb-[130px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-14">
        <ProfileHeader
          user={user}
          accent={accent}
          accentText={accentText}
          stats={headerStats}
          action={
            !isOwn ? (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={followBusy}
                className="h-[40px] shrink-0 rounded-full border px-5 text-[14px] font-medium disabled:opacity-50"
                style={
                  following
                    ? { borderColor: '#6C6C6C', color: '#F5F5F5' }
                    : {
                        backgroundColor: accent,
                        borderColor: accent,
                        color: accentText,
                      }
                }
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : undefined
          }
        />

        {/* Pestañas */}
        <div className="mt-6 grid grid-cols-2 border-b border-[#2A2A2A]">
          {(['posts', 'closet'] as Tab[]).map((item) => {
            const active = item === tab;
            const total = (item === 'posts' ? posts : garments).meta.total;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className="pb-3 text-[15px] font-medium capitalize"
                style={{
                  color: active ? '#F5F5F5' : '#8A8A8A',
                  borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                }}
              >
                {item} <span className="text-[12px]">({total})</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {current.data.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-[#8A8A8A]">
              {tab === 'posts'
                ? 'No posts yet.'
                : 'Nothing in the closet yet.'}
            </p>
          ) : tab === 'posts' ? (
            <PostsGrid posts={posts.data} />
          ) : (
            <ClosetGrid garments={garments.data} />
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

      {me.role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}