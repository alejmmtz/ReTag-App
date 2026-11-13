type ErrorScreenProps = {
  title?: string;
  message?: string;
};

export default function ErrorScreen({
  title = "It’s not you. It’s us...",
  message = 'Something went wrong.',
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-dvh bg-[#1A1A1A] px-6 text-[#F5F5F5]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col items-center justify-center text-center">

        <img
          src="/illustrations/error.png"
          alt="Error"
          className="mb-8 w-[150px]"
        />

        <h1 className="text-[20px] font-medium">
          {title}
        </h1>

        <p className="mt-2 text-[16px] text-[#8A8A8A]">
          {message}
        </p>
      </div>
    </main>
  );
}