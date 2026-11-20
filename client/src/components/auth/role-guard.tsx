"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ApiError,
  authFetch,
  clearSession,
} from "../../lib/authInfo";

type Role = "user" | "store";

type MeResponse = {
  id: string;
  email: string;
  role: Role;
};

type Props = {
  role: Role;
  children: React.ReactNode;
};

export default function RoleGuard({
  role,
  children,
}: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      try {
        const me =
          await authFetch<MeResponse>("/auth/me");

        if (cancelled) return;

        if (me.role !== role) {
          router.replace(
            me.role === "store"
              ? "/home"
              : "/feed",
          );
          return;
        }

        setAllowed(true);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401
        ) {
          clearSession();
          router.replace("/login");
          return;
        }

        router.replace("/login");
      }
    }

    checkRole();

    return () => {
      cancelled = true;
    };
  }, [role, router]);

  if (!allowed) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <p className="text-sm text-grey">
          Loading...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}