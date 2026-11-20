import Link from "next/link";
import AssetIcon from "../../../components/icons/asset-icon";

export default function SignUpRolePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-8 page-enter">
        <div className="w-full">

          <h1 className="text-[35px] font-semibold leading-none">
            Hey!
          </h1>

          <p className="mt-4 text-[15px] text-grey">
            How would you like to use ReTag?
          </p>

          <div className="mt-6 space-y-5">

            {/* Consumer */}
            <Link
              href="/sign-up/user"
              className="flex min-h-[132px] items-center gap-6 rounded-[22px] border border-line px-7 py-5 active:scale-[0.99]"
            >
              <div className="flex size-[86px] shrink-0 items-center justify-center rounded-2xl bg-green text-background">
                <AssetIcon
                  name="bag"
                  width={35}
                  height={35}
                />
              </div>

              <div>
                <h2 className="text-[15px] font-medium text-green">
                  I’m a Consumer
                </h2>

                <p className="mt-2 max-w-[190px] text-[15px] leading-snug text-grey">
                  Browse and buy from student entrepreneurs
                </p>
              </div>
            </Link>

            {/* Store */}
            <Link
              href="/sign-up/store"
              className="flex min-h-[132px] items-center gap-6 rounded-[22px] border border-line px-7 py-5 active:scale-[0.99]"
            >
              <div className="flex size-[86px] shrink-0 items-center justify-center rounded-2xl bg-blue text-white">
                <AssetIcon
                  name="store"
                  width={35}
                  height={35}
                />
              </div>

              <div>
                <h2 className="text-[15px] font-medium text-blue">
                  I’m a Store
                </h2>

                <p className="mt-2 max-w-[190px] text-[15px] leading-snug text-grey">
                  Sell your products to fellow students
                </p>
              </div>
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}