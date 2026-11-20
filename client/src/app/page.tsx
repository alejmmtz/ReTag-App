import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col page-enter">

        <section className="relative flex flex-1 overflow-hidden">
          <Image
            src="/illustrations/welcome-bg.png"
            alt="People walking"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 flex w-full flex-col px-8 py-8">

            {/* Tags */}
            <div className="mt-[70%] flex items-center gap-1.5">
              <span className="rounded-full border border-white px-5 py-1.5 text-[10px] text-white">
                LOCAL
              </span>

              <span className="rounded-full border border-white px-5 py-1.5 text-[10px] text-white">
                SWAP
              </span>

              <span className="flex h-[30px] w-[52px] items-center justify-center rounded-full border border-white">
              <Image
                src="/icons/leaf.svg"
                alt=""
                width={19}
                height={19}
                className="invert"
              />
            </span>
            </div>

            {/* Copy */}
            <p className="mt-6 max-w-[235px] text-[14px] font-medium leading-[1.45] text-white">
              Give your Garments a second
              chance. Don&apos;t let the planet
              bear the bill.
            </p>

            {/* Logo */}
            <div className="mt-auto mb-50 flex justify-end">
              <Image
                src="/illustrations/logo_white.png"
                alt="ReTag"
                width={190}
                height={90}
                className="h-auto w-[190px] object-contain"
              />
            </div>

            {/* Button */}
            <Link
              href="/sign-up"
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-white px-6 text-base font-medium text-[#1A1A1A] active:scale-[0.98]"
            >
              Get started
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}