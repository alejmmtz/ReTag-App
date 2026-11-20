import AssetIcon from "../icons/asset-icon";
import Image from "next/image";

import type {
  ProfileUser,
  StoreProfile,
} from "./profile-types";

type Stat = {
  label: string;
  value: number | string;
};

type Props = {
  user: ProfileUser;
  store?: StoreProfile | null;
  accent: string;
  accentText: string;
  stats: Stat[];
  isOwn: boolean;
  onLogout?: () => void;
  onBack?: () => void;
  action?: React.ReactNode;
};

function Avatar({
  src,
  name,
  accent,
  accentText,
  isStore,
}: {
  src: string | null;
  name: string;
  accent: string;
  accentText: string;
  isStore: boolean;
}) {
  return (
    <div className="relative isolate flex h-[290px] w-full items-center justify-center">

      {/* USER: emojis detrás */}
      {!isStore && (
        <Image
          src="/illustrations/emojis.png"
          alt=""
          aria-hidden
          width={180}
          height={130}
          className="pointer-events-none absolute left-[10%] top-[5px] z-0 h-auto w-[120px] select-none"
        />
      )}

      {/* STORE: emoji detrás */}
      {isStore && (
        <Image
          src="/illustrations/emoji2.png"
          alt=""
          aria-hidden
          width={180}
          height={130}
          className="pointer-events-none absolute left-[8%] top-[25px] z-0 h-auto w-[90px] select-none"
        />
      )}

      {/* Foto */}
      <div
        className="relative z-10 flex size-52 items-center justify-center overflow-hidden rounded-full border-4 border-background text-xl font-medium shadow-xl shadow-background/40"
        style={{
          backgroundColor: accent,
          color: accentText,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {/* USER: UPA */}
      {!isStore && (
        <Image
          src="/illustrations/upa2.png"
          alt=""
          aria-hidden
          width={180}
          height={120}
          className="pointer-events-none absolute bottom-[5px] left-[7%] z-20 h-auto w-[155px] -rotate-6 select-none"
        />
      )}

      {/* USER: estrella */}
      {!isStore && (
        <Image
          src="/illustrations/star.png"
          alt=""
          aria-hidden
          width={130}
          height={130}
          className="pointer-events-none absolute bottom-[15px] right-[5%] z-20 h-auto w-[115px] rotate-6 select-none"
        />
      )}

      {/* STORE: estrella azul */}
      {isStore && (
        <Image
          src="/illustrations/start_blue.png"
          alt=""
          aria-hidden
          width={130}
          height={130}
          className="pointer-events-none absolute bottom-[15px] right-[8%] z-20 h-auto w-[100px] rotate-6 select-none"
        />
      )}

    </div>
  );
}

function LogoutIcon() {
  return (
    <AssetIcon
      name="logout"
      className="text-orange"
      width={20}
      height={20}
    />
  );
}

export default function ProfileHeader({
  user,
  store,
  accent,
  accentText,
  stats,
  isOwn,
  onLogout,
  onBack,
  action,
}: Props) {
  const isStore = !!store;

  const displayName =
    store?.storeName ??
    user.name ??
    user.username;

  const handle =
    store?.socialmedia ??
    user.username;

  const picture =
    store?.images.find(
      (image) => image.isProfile,
    )?.url ??
    user.profilePicture;

  const cover =
    store?.images.find(
      (image) => image.isCover,
    )?.url;

  const description =
    store?.description ??
    user.description;

  return (
    <header className="relative isolate overflow-hidden px-8 pb-8 pt-22">

      {/* Fondo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[430px] overflow-hidden">

        {isStore ? (
          cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover opacity-45"
            />
          ) : (
            <div
              className="h-full w-full opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${accent}, transparent 70%)`,
              }}
            />
          )
        ) : (
          <>
            {/* Logo ReTag de fondo */}
            <Image
              src="/illustrations/retag_opacity.png"
              alt=""
              aria-hidden
              width={500}
              height={250}
              className="absolute left-1/2 top-50 h-auto w-[400px] -translate-x-1/2"
            />
          </>
        )}

      </div>

      <div>

        {/* Barra superior */}
        <div className="absolute inset-x-8 top-18 z-30 flex h-11 items-center justify-between">

          {isStore && !isOwn ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="button-icon bg-grey text-foreground"
          >
            <AssetIcon
              name="chevron"
              width={9}
              height={16}
            />
          </button>
          ) : isOwn ? (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              className="button-icon bg-background/75 text-orange ring-1 ring-foreground/10 backdrop-blur-md"
            >
              <LogoutIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="button-icon image-overlay"
            >
              <AssetIcon
                name="chevron"
                width={9}
                height={16}
              />
            </button>
          )}

        </div>

        {/* Avatar, nombre y usuario */}
        <div className="flex flex-col items-center text-center">

          <Avatar
            src={picture}
            name={displayName}
            accent={accent}
            accentText={accentText}
            isStore={isStore}
          />

          <h1 className="mt-8 max-w-full truncate text-xl font-semibold leading-tight">
            {displayName}
          </h1>

          <p className="mt-2 max-w-full truncate text-sm text-grey">
            @{handle}
          </p>

          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}

        </div>

        {/* Estadísticas */}
        {stats.length > 0 && (
          <div
            className="mt-8 grid min-w-0 gap-4 text-center"
            style={{
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0"
              >
                <p className="text-xl font-semibold tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-grey">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Ubicación Store */}
        {isStore && store?.location && (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex max-w-full items-center gap-2 truncate rounded-full border border-[#3A3A3A] px-4 py-1.5 text-sm">
              <AssetIcon
                name="location"
                width={14}
                height={14}
              />

              {store.location}
            </span>
          </div>
        )}

        {/* Descripción */}
        {description && (
          <p className="mx-auto mt-4 max-w-[420px] text-center text-sm leading-relaxed text-[#D6D6D6]">
            {description}
          </p>
        )}

      </div>
    </header>
  );
}