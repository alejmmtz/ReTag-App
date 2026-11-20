"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import CreateAction from "../../../components/navigation/create-action";
import StoreCreateSheet from "../../../components/events/store-create-sheet";
import UserCreateSheet from "../../../components/events/user-create-sheet";

import StoreBottomNav from "../../../components/navigation/store-bottom-nav";
import UserBottomNav from "../../../components/navigation/user-bottom-nav";

import {
  ApiError,
  authFetch,
  clearSession,
} from "../../../lib/authInfo";

type Role = "user" | "store";

type MeResponse = {
  id: string;
  email: string;
  role: Role;
};

type ActivityUser = {
  id: string;
  name: string | null;
  username: string;
  createdAt: string;
};

type TransactionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "canceled";

type Transaction = {
  id: string;

  transactionType:
    | "sale"
    | "trade"
    | "both";

  status: TransactionStatus;

  buyerId: string;

  buyer?: {
    id: string;
    username?: string;
    profilePicture?: string | null;
  };

  garment: {
    id: string;
    name: string;

    seller?: {
      id: string;
      username?: string;
      profilePicture?: string | null;
    };

    images?: {
      id: number;
      url: string;
      isCover: boolean;
    }[];
  };
};

type Tab =
  | "ongoing"
  | "completed";

function statusLabel(
  status: TransactionStatus,
) {
  switch (status) {
    case "pending":
      return "Pending";

    case "in_progress":
      return "Accepted";

    case "completed":
      return "Completed";

    case "canceled":
      return "Rejected";
  }
}

function transactionLabel(
  type: Transaction["transactionType"],
) {
  if (type === "sale") {
    return "PURCHASE";
  }

  if (type === "trade") {
    return "TRADE";
  }

  return "OFFER";
}

function statusStyle(
  status: TransactionStatus,
) {
  if (status === "pending") {
    return "border-yellow-400 text-yellow-400";
  }

  if (status === "in_progress") {
    return "border-blue text-blue";
  }

  if (status === "completed") {
    return "border-green text-green";
  }

  return "border-orange text-orange";
}

const CURRENT_TIME = new Date().getTime();

export default function ActivityPage() {
  const router = useRouter();

  const [role, setRole] =
    useState<Role | null>(null);

  const [user, setUser] =
    useState<ActivityUser | null>(
      null,
    );

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [tab, setTab] =
    useState<Tab>("ongoing");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    sheetOpen,
    setSheetOpen,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        const me =
          await authFetch<MeResponse>(
            "/auth/me",
          );

        if (cancelled) {
          return;
        }

        setRole(me.role);

        const [
          transactionsData,
          userData,
        ] = await Promise.all([
          authFetch<Transaction[]>(
            "/transactions",
          ),

          authFetch<ActivityUser>(
            `/users/${me.id}`,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setTransactions(
          transactionsData,
        );

        setUser(userData);
      } catch (cause) {
        if (
          cause instanceof ApiError &&
          cause.status === 401
        ) {
          clearSession();
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const visibleTransactions =
    transactions.filter(
      (transaction) => {
        if (tab === "ongoing") {
          return (
            transaction.status ===
              "pending" ||
            transaction.status ===
              "in_progress"
          );
        }

        return (
          transaction.status ===
            "completed" ||
          transaction.status ===
            "canceled"
        );
      },
    );

  const daysInReTag = user
    ? Math.max(
        1,
        Math.floor(
          (CURRENT_TIME -
            new Date(user.createdAt).getTime()) /
            86_400_000,
        ),
      )
    : 0;

  const displayName =
    user?.name ??
    user?.username ??
    "";

  if (loading) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg bg-background px-8 py-12 pt-18 text-foreground">
        <p className="text-sm text-grey">
          Loading...
        </p>
      </main>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg bg-background px-8 pb-32 pt-18 text-foreground page-enter">

      {/* Header */}
      <section>
        <h1 className="text-xl font-semibold">
          {role === "user"
            ? "Your Activity"
            : "Your Activity"}
        </h1>

        {/* User message */}
        {role === "user" &&
          user && (
            <p className="mt-5 text-base leading-relaxed text-foreground">
              {displayName}, you&apos;ve
              been part of the change
              with us for{" "}
              <span className="text-green">
                {daysInReTag}{" "}
                {daysInReTag === 1
                  ? "day"
                  : "days"}
                .
              </span>
            </p>
          )}

        {/* Tabs */}
        <div className="mt-8 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() =>
              setTab("ongoing")
            }
            className={`min-h-14 rounded-full border text-[13px] font-medium h-[30px] transition-colors ${
              tab === "ongoing"
                ? role === "store"
                  ? "border-blue bg-blue text-white"
                  : "border-green bg-green text-background"
                : "border-[#6C6C6C] bg-transparent text-grey"
            }`}
          >
            Ongoing
          </button>

          <button
            type="button"
            onClick={() =>
              setTab("completed")
            }
            className={`min-h-14 rounded-full border text-[13px] font-medium h-[30px] transition-colors ${
              tab === "completed"
                ? role === "store"
                  ? "border-blue bg-blue text-white"
                  : "border-green bg-green text-background"
                : "border-[#6C6C6C] bg-transparent text-grey"
            }`}
          >
            Completed
          </button>

        </div>
      </section>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="mt-8 text-sm text-orange"
        >
          {error}
        </p>
      )}

      {/* Empty */}
      {!error &&
        visibleTransactions.length ===
          0 && (
          <p className="mt-16 text-center text-sm text-grey">
            {tab === "ongoing"
              ? "No ongoing activity yet."
              : "No completed activity yet."}
          </p>
        )}

      {/* Activity list */}
      {!error &&
        visibleTransactions.length >
          0 && (
          <div className="mt-8 space-y-4">

            {visibleTransactions.map(
              (transaction) => {
                const image =
                  transaction.garment.images?.find(
                    (item) =>
                      item.isCover,
                  ) ??
                  transaction.garment
                    .images?.[0];

                const otherUsername =
                  role === "store"
                    ? transaction.buyer
                        ?.username
                    : transaction.garment
                        .seller
                        ?.username;

                return (
                  <button
                    key={
                      transaction.id
                    }
                    type="button"
                    onClick={() =>
                      router.push(
                        `/transaction/${transaction.id}`,
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-[22px] border border-line p-4 text-left transition-transform active:scale-[0.99]"
                  >

                    {/* Garment image */}
                    <div className="h-[110px] w-[100px] shrink-0 overflow-hidden rounded-[16px] bg-surface">
                      {image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            image.url
                          }
                          alt={
                            transaction
                              .garment
                              .name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-grey">
                          No photo
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="min-w-0 flex-1">

                      <h2 className="truncate text-base font-semibold">
                        {
                          transaction
                            .garment
                            .name
                        }
                      </h2>

                      <p className="mt-1 truncate text-sm text-grey">
                        {role ===
                        "store"
                          ? transaction.transactionType ===
                            "trade"
                            ? `@${otherUsername ?? "user"} wants to trade for this item`
                            : `@${otherUsername ?? "user"} wants to buy this item`
                          : `Sent to @${otherUsername ?? "user"}`}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

                        {/* Status */}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${statusStyle(
                            transaction.status,
                          )}`}
                        >
                          {statusLabel(
                            transaction.status,
                          )}
                        </span>

                        {/* Type */}
                        <span
                          className={`rounded-lg px-2 py-2 text-[10px] font-semibold ${
                            role ===
                            "store"
                              ? "bg-blue text-white"
                              : "bg-green text-background"
                          }`}
                        >
                          {transactionLabel(
                            transaction.transactionType,
                          )}
                        </span>

                      </div>
                    </div>
                  </button>
                );
              },
            )}

          </div>
        )}

      {/* Floating create button */}
      <CreateAction
        role={role}
        open={sheetOpen}
        onClick={() =>
          setSheetOpen(true)
        }
      />

      {/* Create sheet */}
      {role === "store" ? (
        <StoreCreateSheet
          open={sheetOpen}
          onClose={() =>
            setSheetOpen(false)
          }
        />
      ) : (
        <UserCreateSheet
          open={sheetOpen}
          onClose={() =>
            setSheetOpen(false)
          }
        />
      )}

      {/* Bottom navigation */}
      {role === "store" ? (
        <StoreBottomNav />
      ) : (
        <UserBottomNav />
      )}

    </main>
  );
}