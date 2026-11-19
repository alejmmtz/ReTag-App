import Image from "next/image";
import type { AccountFields, RegisterStepProps } from "./types";

type StepThreeProps = RegisterStepProps & {
  fields: AccountFields;
  preview: string;
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
  isSubmitting: boolean;
  submitRegistration: () => void;
};

export default function StepThree({
  fields,
  preview,
  accepted,
  setAccepted,
  isSubmitting,
  submitRegistration,
  error,
  clearError,
  goToStep,
}: StepThreeProps) {
  return (
    <section className="w-full">
      <h1 className="text-2xl leading-tight font-semibold tracking-tight">
        An overview of your{" "}
        <span className="font-semibold text-green">Brand New Self</span> at
        ReTag
      </h1>
      <div className="mt-8 aspect-square overflow-hidden rounded-xl border-8 border-green bg-background">
        {preview ? (
          <Image
            src={preview}
            alt="Profile preview"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src="/illustrations/man.png"
            width={80}
            height={120}
            alt="Profile preview"
            className="w-72"
          />
        )}
      </div>
      <p className="mt-4 rounded-xl border border-white px-4 py-4 text-sm">
        {fields.name} is @
        <span className="underline">{fields.username.replace(/^@/, "")}</span>
      </p>
      <p className="mt-6 text-center text-xs mx-6 text-grey">
        We’re ReShaping fashion into a more constructive, circular cycle. Are
        you ready to be part of the change?
      </p>
      <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => {
            setAccepted(event.target.checked);
            clearError();
          }}
          className="accent-green text-sm"
        />
        <span>
          I accept{" "}
          <a href="#terms" className="font-semibold text-green underline">
            terms &amp; conditions
          </a>
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-4 text-sm text-orange">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={submitRegistration}
        disabled={isSubmitting}
        className="button-pill mt-7 w-full bg-green text-background disabled:opacity-70"
      >
        {isSubmitting ? "Signing Up…" : "Sign Up"}
      </button>
      <button
        type="button"
        onClick={() => goToStep(2)}
        disabled={isSubmitting}
        className="mt-4 block w-full text-center text-sm font-semibold text-green underline min-h-11 min-w-11"
      >
        Return
      </button>
    </section>
  );
}
