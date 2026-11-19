"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AccountFields, RegisterStepProps } from "./types";
import { validateAccountFields } from "./validate-account";

type StepOneProps = RegisterStepProps & {
  fields: AccountFields;
  updateField: (field: keyof AccountFields, value: string) => void;
};

export default function StepOne({
  fields,
  updateField,
  goToStep,
  setError,
  clearError,
  error,
}: StepOneProps) {
  const inputClass =
    "h-9 w-full border-0 border-b border-grey bg-transparent px-0 pb-2 text-[14px] text-foreground outline-none placeholder:text-grey focus:border-green focus:ring-0";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section>
      <h1 className="text-[28px] font-medium tracking-[-0.03em] sm:text-[32px]">
        This is your first step toward{" "}
        <span className="font-semibold text-green">ReTagging</span> the way you
        treat your Garments.
      </h1>
      <div className="my-8 flex justify-center">
        <Image
          src="/illustrations/retag-recycle.png"
          alt="ReTag world"
          width={116}
          height={116}
          className="w-46 object-contain"
        />
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const validationError = validateAccountFields(fields);
          if (validationError) {
            setError(validationError);
            return;
          }
          clearError();
          goToStep(2);
        }}
        className="space-y-4"
      >
        <label className="block text-[14px]">
          Name
          <input
            className={inputClass}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            value={fields.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label className="block text-[14px]">
          Username
          <input
            className={inputClass}
            name="username"
            autoComplete="username"
            placeholder="@cool_username"
            required
            value={fields.username}
            onChange={(event) => updateField("username", event.target.value)}
          />
        </label>
        <label className="block text-[14px]">
          Email
          <input
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
        <label className="block text-[14px]">
          Phone
          <input
            className={inputClass}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="123 456 7890"
            required
            value={fields.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>
        <label className="block text-[14px]">
          Password
          <span className="flex h-9 items-center border-b border-grey focus-within:border-green">
            <input
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 pb-2 text-[14px] text-foreground outline-none placeholder:text-grey focus:ring-0"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 10 characters"
              required
              value={fields.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-8 w-8 items-center justify-end"
            >
              <Image
                src={
                  showPassword
                    ? "/illustrations/eye.svg"
                    : "/illustrations/eye-off-icon.svg"
                }
                alt=""
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            </button>
          </span>
          <span className="mt-2 block text-[12px] text-grey">
            10+ characters with uppercase, lowercase, number, and @$!%*?&
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-white">
            <span className="text-green font-medium">
              A little piece of advice!
            </span>{" "}
            {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-green px-5 py-3 text-[15px] font-semibold text-background"
        >
          Continue
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-grey">
        Have an account?{" "}
        <Link className="font-semibold text-green underline" href="/login">
          Log In
        </Link>
      </p>
    </section>
  );
}
