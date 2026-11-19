import LoginForm from "../../../components/login/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex flex-col bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 page-enter">
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex justify-center">
          <Image
            src="/illustrations/retag-world.png"
            alt="ReTag World"
            width={260}
            height={260}
            priority
            className="h-auto w-[min(68vw,260px)]"
          />
        </div>

        <section className="mt-8">
          <h1 className="mb-6 text-center text-2xl font-semibold leading-tight tracking-tight">
            Hey there! <br />
            Welcome Back.
          </h1>

          <LoginForm />
          <p className="mt-4 text-center text-sm text-grey">
            No account yet?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-green underline decoration-1 underline-offset-2 active:brightness-110"
            >
              Sign Up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
