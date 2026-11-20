"use client";

import AssetIcon from "../icons/asset-icon";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import UserBottomNav from "../navigation/user-bottom-nav";
import type { MeResponse } from "../posts/post-types";
import { ApiError, authFetch, clearSession } from "../../lib/authInfo";

const PAGE_SIZE = 10;
const ACCENT = "#C8F66F";

type BagItem = {
  addedAt: string;
  garment: {
    id: string;
    name: string;
    price: number | string | null;
    transactionType: "sale" | "trade" | "both" | null;
    status: string;
    brand: { id: number; name: string } | null;
    size: { id: number; label: string } | null;
    seller: { id: string; username: string };
    images: { id: number; url: string; isCover: boolean }[];
  };
};

type BagPage = {
  data: BagItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

function priceLabel(garment: BagItem["garment"]) {
  if (garment.transactionType === "trade" || garment.price == null) {
    return "Trade";
  }

  return `$${Number(garment.price)}`;
}

export default function BagView() {
  const router = useRouter();

  const [items, setItems] = useState<BagItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

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

  const loadPage = useCallback(
    async (next: number) => {
      try {
        const data = await authFetch<BagPage>(
          `/bags?page=${next}&limit=${PAGE_SIZE}`,
        );

        setItems((previous) =>
          next === 1 ? data.data : [...previous, ...data.data],
        );
        setPage(next);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      } catch (err) {
        if (!handleSessionError(err)) {
          setError("We could not load your bag.");
        }
      } finally {
        setLoading(false);
      }
    },
    [handleSessionError],
  );

  useEffect(() => {
    // Las tiendas no tienen bolsa: se mandan a su inicio.
    authFetch<MeResponse>("/auth/me")
      .then((me) => {
        if (me.role === "store") {
          router.replace("/home");
        }
      })
      .catch(() => undefined);

    // Carga inicial del listado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(1);
  }, [loadPage, router]);

  async function handleRemove(garmentId: string) {
    if (removing) {
      return;
    }

    setRemoving(garmentId);

    try {
      await authFetch(`/bags/${garmentId}`, { method: "DELETE" });
      setItems((previous) =>
        previous.filter((item) => item.garment.id !== garmentId),
      );
      setTotal((previous) => Math.max(0, previous - 1));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Ya no estaba en la bolsa: se quita de la lista igualmente.
        setItems((previous) =>
          previous.filter((item) => item.garment.id !== garmentId),
        );
      } else {
        handleSessionError(err);
      }
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="mx-auto w-full max-w-lg mb-28">
        <header className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-[40px] w-[40px] items-center justify-center text-sm min-h-11 min-w-11"
          >
            <AssetIcon name="chevron" width={9} height={16} />
          </button>
          <h1 className="text-xl font-semibold">My bag</h1>
          {total > 0 && <span className="text-sm text-grey">({total})</span>}
        </header>

        {loading && (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-[112px] w-full animate-pulse rounded-[18px] bg-surface"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="mt-10 text-center text-sm text-orange" role="alert">
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
            <h2 className="text-base font-semibold">Your bag is empty</h2>
            <p className="mt-2 max-w-[260px] text-sm text-grey">
              Save garments you like with &ldquo;Add to bag&rdquo; and find them
              here.
            </p>
            <Link
              href="/feed"
              className="button-pill mt-6 text-background"
              style={{ backgroundColor: ACCENT }}
            >
              Explore the feed
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <ul className="mt-6 space-y-3">
            {items.map((item) => {
              const { garment } = item;
              const cover = (
                garment.images.find((image) => image.isCover) ??
                garment.images[0]
              )?.url;
              const available = garment.status === "available";

              return (
                <li key={garment.id} className="relative">
                  <Link
                    href={`/garment/${garment.id}`}
                    className="flex gap-3 rounded-[18px] bg-surface p-3 pr-12"
                  >
                    <span className="h-[88px] w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-[#333]">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={garment.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {garment.name}
                      </span>
                      <span className="block truncate text-xs text-grey">
                        {[garment.brand?.name, garment.size?.label]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <span className="block truncate text-xs text-grey">
                        by @{garment.seller.username}
                      </span>
                      <span
                        className="mt-1 flex items-center gap-2 text-sm font-medium"
                        style={{ color: ACCENT }}
                      >
                        {priceLabel(garment)}
                        {!available && (
                          <span className="rounded-full bg-orange px-2 py-px text-xs capitalize text-foreground">
                            {garment.status}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>

                  <button
                    type="button"
                    aria-label={`Remove ${garment.name} from bag`}
                    onClick={() => handleRemove(garment.id)}
                    disabled={removing === garment.id}
                    className="absolute right-3 top-3 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-black/40 text-sm text-[#D6D6D6] disabled:opacity-40 min-h-11 min-w-11"
                  >
                    <AssetIcon name="x icon" width={16} height={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && page < totalPages && (
          <button
            type="button"
            onClick={() => loadPage(page + 1)}
            className="button-pill mx-auto mt-6 block border border-[#6C6C6C]"
          >
            Load more
          </button>
        )}
      </div>

      <UserBottomNav />
    </main>
  );
}
