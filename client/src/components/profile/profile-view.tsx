"use client";

import CreateAction from "../navigation/create-action";
import AssetIcon from "../icons/asset-icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import StoreCreateSheet from "../events/store-create-sheet";
import StoreEventCard from "../events/store-event-card";
import UserCreateSheet from "../events/user-create-sheet";
import StoreBottomNav from "../navigation/store-bottom-nav";
import UserBottomNav from "../navigation/user-bottom-nav";
import type { MeResponse } from "../posts/post-types";
import { withOfferImagesForPosts } from "../posts/post-images";
import { ApiError, authFetch, clearSession } from "../../lib/authInfo";
import { ClosetGrid, PostsGrid } from "./profile-grids";
import ProfileHeader from "./profile-header";
import type {
  MyStatistics,
  Paginated,
  ProfileEvent,
  ProfileGarment,
  ProfilePost,
  ProfileUser,
  StoreProfile,
} from "./profile-types";

const PAGE_SIZE = 12;
const ACCENT = { user: "#C8F66F", store: "#1D5CEB" } as const;

type Tab = "posts" | "closet" | "events";

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

  const [tab, setTab] = useState<Tab>("posts");
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
        router.replace("/login");
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

    authFetch<MeResponse>("/auth/me")
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (storeMode && data.role !== "store") {
          router.replace("/profile");
          return;
        }

        setMe(data);
      })
      .catch((err) => {
        if (!cancelled && !handleSessionError(err)) {
          setError("We could not load this profile.");
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
            ).then(async (result) => ({
              ...result,
              data: await withOfferImagesForPosts(result.data),
            })),
            authFetch<Paginated<ProfileGarment>>(
              `/users/${targetId}/garments?page=1&limit=${PAGE_SIZE}`,
            ),
            own
              ? authFetch<MyStatistics>("/users/me/statistics")
              : Promise.resolve(null),
            storeMode
              ? authFetch<StoreProfile>("/stores/me")
              : userData.role === "store"
                ? authFetch<StoreProfile>(`/stores/user/${targetId}`).catch(
                    () => null,
                  )
                : Promise.resolve(null),
            storeMode
              ? authFetch<ProfileEvent[]>("/events/mine")
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
            ? "This user does not exist."
            : "We could not load this profile.",
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [targetId, me, storeMode, handleSessionError]);

  async function loadMore() {
    const current = tab === "posts" ? posts : garments;

    if (
      !current ||
      loadingMore ||
      current.meta.page >= current.meta.totalPages
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const next = current.meta.page + 1;
      const path = tab === "posts" ? "posts" : "garments";
      const data = await authFetch<Paginated<ProfilePost & ProfileGarment>>(
        `/users/${targetId}/${path}?page=${next}&limit=${PAGE_SIZE}`,
      );

      if (tab === "posts") {
        const postsPage = {
          ...data,
          data: await withOfferImagesForPosts(data.data),
        };
        setPosts((prev) =>
          prev
            ? { ...postsPage, data: [...prev.data, ...postsPage.data] }
            : postsPage,
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
        method: following ? "DELETE" : "POST",
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
      <main className="bg-background text-center text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
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

  if (!user || !me || !posts || !garments || (storeMode && !store)) {
    return (
      <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
        <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="h-[84px] w-full animate-pulse rounded-[22px] bg-surface" />
          <div className="h-[72px] w-full animate-pulse rounded-[18px] bg-surface" />
          <div className="h-[240px] w-full animate-pulse rounded-[18px] bg-surface" />
        </div>
      </main>
    );
  }

  const accent = ACCENT[user.role];
  const accentText = user.role === "store" ? "#FFFFFF" : "#1A1A1A";

  const headerStats = stats
    ? [
        { label: "Follow", value: stats.community.following },
        { label: "Followers", value: stats.community.followers },
        { label: "Likes", value: stats.community.likesReceived },
      ]
    : [
        { label: "Posts", value: posts.meta.total },
        { label: "Closet", value: garments.meta.total },
      ];

  function logout() {
    clearSession();
    router.replace("/login");
  }

  const tabs: Tab[] = storeMode
    ? ["posts", "closet", "events"]
    : ["posts", "closet"];
  const showingEvents = tab === "events";
  const current = tab === "closet" ? garments : posts;
  const hasMore = !showingEvents && current.meta.page < current.meta.totalPages;

  const dim = "#898989";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg bg-background pb-12 text-foreground page-enter">
      <div className="mx-auto w-full max-w-lg mb-40">
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
                className="button-pill border disabled:opacity-50"
                style={
                  following
                    ? { borderColor: "#6C6C6C", color: "#F5F5F5" }
                    : {
                        backgroundColor: accent,
                        borderColor: accent,
                        color: accentText,
                      }
                }
              >
                {following ? "Following" : "Follow"}
              </button>
            ) : (
              <Link
                href="/profile/edit"
                className="button-pill border"
                style={{ borderColor: accent, color: accent }}
              >
                Edit profile
              </Link>
            )
          }
        />

        <div className="min-w-0 px-8">
          {/* Pestañas */}
          <div
            role="tablist"
            aria-label="Profile content"
            className="grid min-w-0 border-b border-line"
            style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
          >
            {tabs.map((item) => {
              const active = item === tab;
              const label =
                item === "closet"
                  ? store
                    ? "Garments"
                    : "Closet"
                  : item === "posts"
                    ? "Posts"
                    : "Events";

              return (
                <button
                  key={item}
                  id={`profile-${item}-tab`}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`profile-${item}-panel`}
                  type="button"
                  onClick={() => setTab(item)}
                  className="flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-t-3xl px-3 py-4 text-sm font-medium transition-[color,background-color,border-color]"
                  style={{
                    color: active ? "#F5F5F5" : dim,
                    backgroundColor: active
                      ? "var(--color-surface)"
                      : "transparent",
                    borderBottom: `2px solid ${active ? "#F5F5F5" : "transparent"}`,
                  }}
                >
                  {item === "posts" && (
                    <AssetIcon name="posts" width={20} height={20} />
                  )}
                  {item === "closet" && (
                    <AssetIcon name="garment" width={20} height={20} />
                  )}
                  {item === "events" && (
                    <AssetIcon name="calendar" width={20} height={20} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <div
            key={tab}
            id={`profile-${tab}-panel`}
            role="tabpanel"
            aria-labelledby={`profile-${tab}-tab`}
            className="mt-8 page-enter"
          >
            {showingEvents ? (
              events.length === 0 ? (
                <p className="py-12 text-center text-sm text-grey">
                  No events yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <StoreEventCard key={event.id} event={event} mode="store" />
                  ))}
                </div>
              )
            ) : current.data.length === 0 ? (
              <p className="py-12 text-center text-sm text-grey">
                {tab === "posts"
                  ? "No posts yet."
                  : "Nothing in the closet yet."}
              </p>
            ) : tab === "posts" ? (
              <PostsGrid posts={posts.data} />
            ) : (
              <ClosetGrid
                garments={garments.data}
                accent={accent}
                accentText={accentText}
                title={
                  store
                    ? "Our garments"
                    : isOwn
                      ? "Welcome to my Closet!"
                      : `${user.name ?? user.username}'s Closet`
                }
              />
            )}

            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="button-pill mx-auto mt-6 block border border-[#6C6C6C] disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOwn && (
        <>
          <CreateAction
            role={me.role}
            open={sheetOpen}
            onClick={() => setSheetOpen(true)}
          />

          {me.role === "store" ? (
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
        </>
      )}

      {me.role === "store" ? <StoreBottomNav /> : <UserBottomNav />}
    </main>
  );
}
