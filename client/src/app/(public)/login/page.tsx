import LoginForm from "../../../components/login/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background px-8 text-foreground sm:px-10 sm:pt-12">
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
          <h1 className="mb-6 text-center text-[32px] font-medium leading-tight tracking-[-0.03em]">
            Hey there! <br />
            Welcome Back.
          </h1>

          <LoginForm />
          <p className="mt-4 text-center text-[14px] text-grey">
            No account yet?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-green underline decoration-1 underline-offset-2 hover:brightness-110"
            >
              Sign Up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
