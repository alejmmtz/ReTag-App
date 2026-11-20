"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import StepOne from "../register/step-1";
import type { AccountFields } from "../register/types";

import StoreInformation from "./store-information";
import StoreIdentity from "./store-identity";
import { registerStoreAccount } from "./register-store-account";

import {
  EMPTY_STORE,
  validateStore,
  validateStorePhoto,
  type StoreErrors,
  type StoreFields,
} from "./store-fields";

const EMPTY_ACCOUNT: AccountFields = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
};

export default function StoreRegisterFlow() {
  const router = useRouter();

  // 1 = account
  // 2 = store information
  // 3 = visual identity
  const [step, setStep] = useState(1);

  // Account information
  const [account, setAccount] =
    useState<AccountFields>(EMPTY_ACCOUNT);

  // Store information
  const [fields, setFields] =
    useState<StoreFields>(EMPTY_STORE);

  const [errors, setErrors] =
    useState<StoreErrors>({});

  // Store images
  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [profilePreview, setProfilePreview] =
    useState("");

  const [coverPreview, setCoverPreview] =
    useState("");

  const [hasSelectedProfile, setHasSelectedProfile] =
    useState(false);

  const [globalError, setGlobalError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }

      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [profilePreview, coverPreview]);

  // Account fields
  function updateAccount(
    field: keyof AccountFields,
    value: string,
  ) {
    setAccount((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // Store fields
  function updateField(
    field: keyof StoreFields,
    value: string,
  ) {
    setFields((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  // Store information → visual identity
  function handleContinue(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationErrors =
      validateStore(fields);

    if (
      Object.keys(validationErrors).length
    ) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setGlobalError("");
    setStep(3);
  }

  function handleSelectImage(
    kind: "profile" | "cover",
    file: File | null,
  ) {
    if (file) {
      const photoError =
        validateStorePhoto(file);

      if (photoError) {
        setGlobalError(photoError);
        return;
      }
    }

    setGlobalError("");

    if (kind === "profile") {
      if (profilePreview) {
        URL.revokeObjectURL(
          profilePreview,
        );
      }

      const url = file
        ? URL.createObjectURL(file)
        : "";

      setProfileFile(file);
      setProfilePreview(url);
      setHasSelectedProfile(!!file);
    } else {
      if (coverPreview) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }

      const url = file
        ? URL.createObjectURL(file)
        : "";

      setCoverFile(file);
      setCoverPreview(url);
    }
  }

  function handleClearImage(
    kind: "profile" | "cover",
  ) {
    if (kind === "profile") {
      if (profilePreview) {
        URL.revokeObjectURL(
          profilePreview,
        );
      }

      setProfileFile(null);
      setProfilePreview("");
      setHasSelectedProfile(false);
    } else {
      if (coverPreview) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }

      setCoverFile(null);
      setCoverPreview("");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setGlobalError("");

    try {
      await registerStoreAccount(
        account,
        fields,
        profileFile,
        coverFile,
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

  function goBack() {
    if (step === 1) {
      router.push("/sign-up");
      return;
    }

    setStep(step - 1);
  }

  const progress =
    step === 1
      ? "33%"
      : step === 2
        ? "66%"
        : "100%";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-6 py-8 page-enter">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            aria-label="Go back"
            className="flex size-10 min-h-11 min-w-11 items-center justify-center rounded-full text-foreground active:bg-surface"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <h1 className="flex-1 text-lg font-semibold">
            Create your store
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-blue transition-all duration-300"
            style={{ width: progress }}
          />
        </div>

        <div
          key={step}
          className="page-enter"
        >

          {/* Step 1: Account */}
          {step === 1 && (
            <StepOne
              fields={account}
              updateField={updateAccount}
              error={globalError}
              setError={setGlobalError}
              clearError={() =>
                setGlobalError("")
              }
              goToStep={setStep}
            />
          )}

          {/* Step 2: Store information */}
          {step === 2 && (
            <>
              <h2 className="mb-6 text-lg font-semibold">
                Store information
              </h2>

              <StoreInformation
                fields={fields}
                errors={errors}
                onChange={updateField}
                onContinue={
                  handleContinue
                }
              />

              {globalError && (
                <p
                  role="alert"
                  className="mt-4 text-sm text-orange"
                >
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

          {/* Step 3: Visual identity */}
          {step === 3 && (
            <>
              <h2 className="mb-6 text-lg font-semibold">
                Visual identity
              </h2>

              <StoreIdentity
                fields={fields}
                profile={profilePreview}
                cover={coverPreview}
                hasSelectedProfile={
                  hasSelectedProfile
                }
                onSelect={
                  handleSelectImage
                }
                onClear={
                  handleClearImage
                }
              />

              {globalError && (
                <p
                  role="alert"
                  className="mt-6 text-sm text-orange"
                >
                  {globalError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="button-pill mt-8 w-full bg-blue text-white disabled:opacity-70"
              >
                {isSubmitting
                  ? "Creating store…"
                  : "Create store"}
              </button>
            </>
          )}

        </div>
      </div>
    </main>
  );
}