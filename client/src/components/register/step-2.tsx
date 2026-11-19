import Image from "next/image";
import type { AccountFields, RegisterStepProps } from "./types";

type StepTwoProps = RegisterStepProps & {
  fields: AccountFields;
  preview: string;
  setPhoto: (photo: File | null) => void;
};

export default function StepTwo({
  fields,
  preview,
  setPhoto,
  error,
  clearError,
  goToStep,
}: StepTwoProps) {
  return (
    <section>
      <h1 className="text-[28px] leading-tight font-medium tracking-tighter sm:text-[32px]">
        What does the person leading the change look like?
      </h1>
      <div
        className={`mt-8 flex aspect-square w-full ${
          preview ? "border-8 border-green" : " "
        } flex-col items-center justify-end overflow-hidden rounded-xl bg-green text-background transition-all`}
      >
        {" "}
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
      <p className="mt-4 text-[16px]">
        Leave a good impression, {fields.name}!
      </p>
      <label className="mt-8 flex py-6 cursor-pointer flex-col items-center justify-center rounded-2xl bg-grey/25 border-2 border-grey text-[16px] transition-all text-white font-medium focus:border-green focus:text-green">
        {preview
          ? "Change your Profile Picture"
          : "Upload your Profile Picture"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            setPhoto(event.target.files?.[0] ?? null);
            clearError();
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-4 text-sm text-orange">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => goToStep(3)}
        className="mt-4 flex w-full items-center justify-center rounded-full bg-green p-3 px-5 text-[16px] font-semibold text-background transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-wait disabled:opacity-70"
      >
        {preview ? "Looking Good!" : "Continue Without a Picture"}
      </button>
      <button
        type="button"
        onClick={() => goToStep(1)}
        className="mt-4 block w-full text-center text-sm font-semibold text-green underline"
      >
        Return
      </button>
    </section>
  );
}
