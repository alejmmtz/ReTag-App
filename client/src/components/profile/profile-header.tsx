import AssetIcon from '../icons/asset-icon';
import Image from 'next/image';
import Link from 'next/link';

import type { ProfileUser, StoreProfile } from './profile-types';

type Stat = { label: string; value: number | string };

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
  decorated,
}: {
  src: string | null;
  name: string;
  accent: string;
  accentText: string;
  decorated: boolean;
}) {
  return (
    <div className="relative isolate w-fit">
      {decorated && (
        <Image
          src="/illustrations/wow.png"
          alt=""
          aria-hidden
          width={297}
          height={157}
          className="pointer-events-none absolute -left-4 -top-7 z-0 h-auto w-20 -rotate-12 select-none min-[440px]:-left-10 min-[440px]:w-24"
        />
      )}
      <div
        className="relative z-10 flex size-36 items-center justify-center overflow-hidden rounded-full border-4 border-background text-xl font-medium shadow-xl shadow-background/40 min-[440px]:size-44"
        style={{ backgroundColor: accent, color: accentText }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      {decorated && (
        <>
          <Image
            src="/illustrations/upa.png"
            alt=""
            aria-hidden
            width={285}
            height={215}
            className="pointer-events-none absolute -bottom-4 -left-10 z-20 h-auto w-28 -rotate-6 select-none"
          />
          <Image
            src="/illustrations/star.png"
            alt=""
            aria-hidden
            width={178}
            height={202}
            className="pointer-events-none absolute -bottom-2 -right-9 z-20 h-auto w-16 rotate-6 select-none"
          />
        </>
      )}
    </div>
  );
}

function LogoutIcon() {
  return <AssetIcon name="logout" className="text-orange" width={20} height={20} />;
}

function StoreIcon() {
  return <AssetIcon name="store" width={20} height={20} />;
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
  const displayName = store?.storeName ?? user.name ?? user.username;
  const handle = store?.socialmedia ?? user.username;
  const picture =
    store?.images.find((image) => image.isProfile)?.url ?? user.profilePicture;
  const cover = store?.images.find((image) => image.isCover)?.url;
  const description = store?.description ?? user.description;

  return (
    <header className="relative isolate overflow-hidden px-8 pb-8 pt-28">
      {/* Fondo: banner de la tienda o foto de perfil difuminada */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden">
        {(isStore ? cover : picture) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(isStore ? cover : picture) as string}
            alt=""
            className={`h-full w-full object-cover ${
              isStore ? 'opacity-45' : 'scale-125 opacity-15 blur-3xl'
            }`}
          />
        ) : (
          <div
            className="h-full w-full opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${accent}, transparent 70%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/60 to-background" />
      </div>

      <div>
        {/* Barra superior */}
        <div className="absolute inset-x-8 top-24 z-30 flex h-11 items-center justify-between">
          {isStore && !isOwn ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-[36px] items-center gap-1 rounded-full bg-green px-4 text-sm font-medium text-background min-h-11 min-w-11"
            >
              <AssetIcon name="chevron" width={9} height={16} />
              Back
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
              <AssetIcon name="chevron" width={9} height={16} />
            </button>
          )}

          {isOwn && !isStore && user.role === 'user' && (
            <Link
              href="/create-store"
              aria-label="Open a store"
              className="button-icon bg-blue text-foreground shadow-sm"
            >
              <StoreIcon />
            </Link>
          )}
        </div>

        {/* Avatar, nombre y usuario */}
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={picture}
            name={displayName}
            accent={accent}
            accentText={accentText}
            decorated={!isStore}
          />
          <h1 className="mt-8 max-w-full truncate text-xl font-semibold leading-tight">
            {displayName}
          </h1>
          <p className="mt-2 max-w-full truncate text-sm text-grey">
            @{handle}
          </p>

          {action && <div className="mt-4">{action}</div>}
        </div>

        {/* Estadísticas */}
        {stats.length > 0 && (
          <div
            className="mt-8 grid min-w-0 gap-4 text-center"
            style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-1 text-xs text-grey">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ubicación y descripción de la tienda */}
        {isStore && store?.location && (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex max-w-full items-center gap-2 truncate rounded-full border border-[#3A3A3A] px-4 py-1.5 text-sm">
              <AssetIcon name="location" width={14} height={14} />
              {store.location}
            </span>
          </div>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-[420px] text-center text-sm leading-relaxed text-[#D6D6D6]">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
