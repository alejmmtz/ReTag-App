type ErrorScreenProps = {
  title?: string;
  message?: string;
};

export default function ErrorScreen({
  title = "It’s not you. It’s us...",
  message = 'Something went wrong.',
}: ErrorScreenProps) {
  return (
    <main className="flex bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 page-enter">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center text-center">

        <img
          src="/illustrations/error.png"
          alt="Error"
          className="mb-8 w-[150px]"
        />

        <h1 className="text-xl font-semibold">
          {title}
        </h1>

        <p className="mt-2 text-sm text-grey">
          {message}
        </p>
      </div>
    </main>
  );
}