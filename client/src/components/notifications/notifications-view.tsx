'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import StoreBottomNav from '../navigation/store-bottom-nav';
import UserBottomNav from '../navigation/user-bottom-nav';
import type { MeResponse } from '../posts/post-types';
import { ApiError, authFetch, clearSession } from '../../lib/http';

const PAGE_SIZE = 15;
const ACCENT = { user: '#C8F66F', store: '#2864E8' } as const;

type NotificationItem = {
  type: 'like' | 'follow' | 'bag';
  createdAt: string;
  actor: { id: string; username: string; profilePicture: string | null };
  postId?: string;
  garmentId?: string;
};

type NotificationsPage = {
  data: NotificationItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

const TEXT: Record<NotificationItem['type'], string> = {
  like: 'liked your post',
  follow: 'started following you',
  bag: 'added your garment to their bag',
};

function timeAgo(dateString: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000),
  );

  if (seconds < 60) {
    return 'now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return `${Math.floor(days / 7)}w`;
}

// Cada aviso lleva al post, a la prenda o al perfil de quien lo generó.
function hrefOf(item: NotificationItem) {
  if (item.type === 'like' && item.postId) {
    return `/post/${item.postId}`;
  }

  if (item.type === 'bag' && item.garmentId) {
    return `/garment/${item.garmentId}`;
  }

  return `/profile/${item.actor.id}`;
}

export default function NotificationsView() {
  const router = useRouter();

  const [role, setRole] = useState<'user' | 'store'>('user');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (next: number) => {
      try {
        const data = await authFetch<NotificationsPage>(
          `/notifications?page=${next}&limit=${PAGE_SIZE}`,
        );

        setItems((previous) =>
          next === 1 ? data.data : [...previous, ...data.data],
        );
        setPage(next);
        setTotalPages(data.meta.totalPages);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          router.replace('/login');
          return;
        }

        setError('We could not load your notifications.');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    authFetch<MeResponse>('/auth/me')
      .then((me) => setRole(me.role))
      .catch(() => undefined);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(1);
  }, [loadPage]);

  const accent = ACCENT[role];
  const accentText = role === 'store' ? '#FFFFFF' : '#1A1A1A';

  return (
    <main className="min-h-screen bg-[#191919] pb-[130px] text-white">
      <div className="mx-auto w-full max-w-[560px] px-6 pt-16">
        <h1 className="text-[22px] font-medium leading-tight">Notifications</h1>
        <p className="mt-1 text-[14px] text-[#9A9A9A]">
          Likes, new followers and bags on your garments.
        </p>

        {loading && (
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[68px] w-full animate-pulse rounded-[18px] bg-[#262626]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="mt-10 text-center text-[14px] text-[#FB3F0F]" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center pt-20 text-center">
            <Image
              src="/illustrations/error.png"
              alt=""
              width={220}
              height={160}
              className="mb-6 h-auto w-[180px]"
            />
            <h2 className="text-[18px] font-medium">Nothing here yet</h2>
            <p className="mt-2 max-w-[260px] text-[14px] text-[#9A9A9A]">
              When someone likes your posts or follows you, you will see it here.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <ul className="mt-6 space-y-3">
            {items.map((item, index) => (
              <li key={`${item.type}-${item.actor.id}-${item.createdAt}-${index}`}>
                <Link
                  href={hrefOf(item)}
                  className="flex items-center gap-3 rounded-[18px] bg-[#262626] p-3"
                >
                  <span
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[16px] font-medium"
                    style={{ backgroundColor: accent, color: accentText }}
                  >
                    {item.actor.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.actor.profilePicture}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.actor.username.charAt(0).toUpperCase()
                    )}
                  </span>

                  <p className="min-w-0 flex-1 text-[14px] leading-snug">
                    <span className="font-medium">@{item.actor.username}</span>{' '}
                    <span className="text-[#D6D6D6]">{TEXT[item.type]}</span>
                  </p>

                  <span className="shrink-0 text-[12px] text-[#9A9A9A]">
                    {timeAgo(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {page < totalPages && !loading && (
          <button
            type="button"
            onClick={() => loadPage(page + 1)}
            className="mx-auto mt-6 block h-[44px] rounded-full border border-[#6C6C6C] px-6 text-[14px]"
          >
            Load more
          </button>
        )}
      </div>

      {role === 'store' ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
