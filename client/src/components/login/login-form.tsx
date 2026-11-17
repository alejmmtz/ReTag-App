"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginResult = { token: string } | { error: string };

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return { error: "Enter your email and password to continue." };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return {
        error: "We couldn't connect to the server. Please try again later.",
      };
    }

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      const message = Array.isArray(body?.message)
        ? body.message.join(", ")
        : (body?.message ??
          "We couldn't log you in. Check your details and try again.");
      return { error: message };
    }

    const data = await response.json().catch(() => null);
    const token = data?.access_token;

    if (typeof token !== "string" || !token) {
      return { error: "The server response was unexpected. Please try again." };
    }

    return { token };
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      localStorage.setItem("access_token", result.token);
      router.replace("/feed");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <fieldset className="space-y-6" disabled={isSubmitting}>
        <div>
          <label htmlFor="email" className="mb-2 block text-[16px]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="h-8 w-full border-b border-grey bg-transparent px-0 pb-2 text-[14px] text-foreground outline-none placeholder:text-grey focus:border-white focus:ring-0"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-[16px]">
            Password
          </label>
          <div className="flex h-8 items-center border-b border-grey focus-within:border-white">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 pb-2 text-[14px] text-foreground outline-none placeholder:text-grey focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="mb-1 flex h-8 w-8 items-center justify-end text-grey transition-colors hover:text-foreground"
            >
              <Image
                src={
                  showPassword
                    ? "/illustrations/eye.svg"
                    : "/illustrations/eye-off-icon.svg"
                }
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                className="h-5 w-5 brightness-0 invert"
              />
            </button>
          </div>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-[14px] mb-[-12] leading-5 text-orange">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 flex w-full items-center justify-center rounded-full bg-green p-3 px-5 text-[16px] font-semibold text-background transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Logging In…" : "Log In"}
      </button>
    </form>
  );
}
