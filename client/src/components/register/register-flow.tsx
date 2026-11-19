"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StepOne from "./step-1";
import StepTwo from "./step-2";
import StepThree from "./step-3";
import { registerAccount } from "./register-account";
import type { AccountFields } from "./types";

const emptyFields: AccountFields = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
};

export default function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState(emptyFields);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewUrl = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  function updateField(field: keyof AccountFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function goToStep(nextStep: number) {
    setError("");
    setStep(nextStep);
  }

  function updatePhoto(nextPhoto: File | null) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = nextPhoto ? URL.createObjectURL(nextPhoto) : "";
    setPhoto(nextPhoto);
    setPreview(previewUrl.current);
  }

  async function submitRegistration() {
    if (!accepted) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const result = await registerAccount(fields, photo);
      if (result.signedIn) {
        router.replace("/feed");
      } else {
        router.replace("/login?registered=1");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 page-enter">
      <div key={step} className="w-full page-enter">
        {step === 1 && (
          <StepOne
            fields={fields}
            updateField={updateField}
            error={error}
            setError={setError}
            clearError={() => setError("")}
            goToStep={goToStep}
          />
        )}
        {step === 2 && (
          <StepTwo
            fields={fields}
            preview={preview}
            setPhoto={updatePhoto}
            error={error}
            setError={setError}
            clearError={() => setError("")}
            goToStep={goToStep}
          />
        )}
        {step === 3 && (
          <StepThree
            fields={fields}
            preview={preview}
            accepted={accepted}
            setAccepted={setAccepted}
            isSubmitting={isSubmitting}
            submitRegistration={submitRegistration}
            error={error}
            setError={setError}
            clearError={() => setError("")}
            goToStep={goToStep}
          />
        )}
      </div>
    </main>
  );
}
