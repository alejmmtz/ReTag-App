"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import StoreInformation from "./store-information";
import StoreIdentity from "./store-identity";
import { createStore } from "./create-store";
import {
  EMPTY_STORE,
  validateStore,
  validateStorePhoto,
  type StoreErrors,
  type StoreFields,
} from "./store-fields";

export default function StoreRegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<StoreFields>(EMPTY_STORE);
  const [errors, setErrors] = useState<StoreErrors>({});

  // Image state
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [hasSelectedProfile, setHasSelectedProfile] = useState(false);

  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploaded = useRef(new Map<File, string>());

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(field: keyof StoreFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateStore(fields);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setGlobalError("");
    setStep(2);
  }

  function handleSelectImage(kind: "profile" | "cover", file: File | null) {
    if (file) {
      const photoError = validateStorePhoto(file);
      if (photoError) {
        setGlobalError(photoError);
        return;
      }
    }
    setGlobalError("");

    if (kind === "profile") {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      const url = file ? URL.createObjectURL(file) : "";
      setProfileFile(file);
      setProfilePreview(url);
      setHasSelectedProfile(!!file);
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      const url = file ? URL.createObjectURL(file) : "";
      setCoverFile(file);
      setCoverPreview(url);
    }
  }

  function handleClearImage(kind: "profile" | "cover") {
    if (kind === "profile") {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      setProfileFile(null);
      setProfilePreview("");
      setHasSelectedProfile(false);
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverFile(null);
      setCoverPreview("");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setGlobalError("");
    try {
      await createStore(
        fields,
        profileFile,
        coverFile,
        null,
        uploaded.current,
      );
      router.replace("/home");
    } catch (cause) {
      setGlobalError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Step 0: Welcome ──
  if (step === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-8 text-foreground page-enter">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <Image
              src="/illustrations/retag-recycle.png"
              alt="Store"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your store starts here
          </h1>
          <p className="mt-2 text-sm text-grey">
            Set it up and connect with the ReTag community.
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="button-pill mt-8 bg-blue px-10 text-white"
          >
            Create store
          </button>
        </div>
      </main>
    );
  }

  // ── Progress bar ──
  const progress = step === 1 ? "50%" : "100%";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-6 py-8 page-enter">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={isSubmitting}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-surface min-h-11 min-w-11"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="flex-1 text-lg font-semibold">Create your store</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-blue transition-all duration-300"
            style={{ width: progress }}
          />
        </div>

        <div key={step} className="page-enter">
          {/* ── Step 1: Store Information ── */}
          {step === 1 && (
            <>
              <h2 className="mb-6 text-lg font-semibold">
                Store information
              </h2>
              <StoreInformation
                fields={fields}
                errors={errors}
                onChange={updateField}
                onContinue={handleContinue}
              />
              {globalError && (
                <p role="alert" className="mt-4 text-sm text-orange">
                  {globalError}
                </p>
              )}
              <button
                type="submit"
                form="store-information"
                className="button-pill mt-8 w-full bg-blue text-white"
              >
                Continue
              </button>
            </>
          )}

          {/* ── Step 2: Visual Identity ── */}
          {step === 2 && (
            <>
              <h2 className="mb-6 text-lg font-semibold">Visual identity</h2>
              <StoreIdentity
                fields={fields}
                profile={profilePreview}
                cover={coverPreview}
                hasSelectedProfile={hasSelectedProfile}
                onSelect={handleSelectImage}
                onClear={handleClearImage}
              />
              {globalError && (
                <p role="alert" className="mt-6 text-sm text-orange">
                  {globalError}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="button-pill mt-8 w-full bg-blue text-white disabled:opacity-70"
              >
                {isSubmitting ? "Creating store…" : "Create store"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
