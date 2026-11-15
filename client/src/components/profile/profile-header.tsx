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
}: {
  src: string | null;
  name: string;
  accent: string;
  accentText: string;
}) {
  return (
    <div className="relative">
      <div
        className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#191919] text-[40px] font-medium"
        style={{ backgroundColor: accent, color: accentText }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Stickers del diseño */}
      <Image
        src="/illustrations/upa.png"
        alt=""
        width={285}
        height={215}
        className="pointer-events-none absolute -bottom-3 -right-8 w-[64px] -rotate-6"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 top-0 text-[26px] -rotate-12"
      >
        ✨
      </span>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9 4.5 4h15L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 12v8h14v-8" />
    </svg>
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
  const displayName = store?.storeName ?? user.name ?? user.username;
  const handle = store?.socialmedia ?? user.username;
  const picture =
    store?.images.find((image) => image.isProfile)?.url ?? user.profilePicture;
  const cover = store?.images.find((image) => image.isCover)?.url;
  const description = store?.description ?? user.description;

  return (
    <header className="relative">
      {/* Fondo: banner de la tienda o foto de perfil difuminada */}
      <div className="absolute inset-x-0 top-0 h-[260px] overflow-hidden">
        {(isStore ? cover : picture) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(isStore ? cover : picture) as string}
            alt=""
            className={`h-full w-full object-cover ${
              isStore ? 'opacity-60' : 'scale-125 opacity-40 blur-2xl'
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#191919]/60 to-[#191919]" />
      </div>

      <div className="relative px-6 pt-5">
        {/* Barra superior */}
        <div className="flex h-[44px] items-center justify-between">
          {isStore && !isOwn ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-[36px] items-center gap-1 rounded-full bg-[#C8F66F] px-4 text-[14px] font-medium text-[#1A1A1A]"
            >
              ‹ Back
            </button>
          ) : isOwn ? (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/40 text-[#FF8A3D]"
            >
              <LogoutIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/40 text-[20px]"
            >
              ‹
            </button>
          )}

          {isOwn && !isStore && user.role === 'user' && (
            <Link
              href="/create-store"
              aria-label="Open a store"
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#2864E8] text-white"
            >
              <StoreIcon />
            </Link>
          )}
        </div>

        {/* Avatar, nombre y usuario */}
        <div className="mt-6 flex flex-col items-center text-center">
          <Avatar
            src={picture}
            name={displayName}
            accent={accent}
            accentText={accentText}
          />
          <h1 className="mt-5 max-w-full truncate text-[24px] font-semibold leading-tight">
            {displayName}
          </h1>
          <p className="max-w-full truncate text-[14px] text-[#9A9A9A]">
            @{handle}
          </p>

          {action && <div className="mt-4">{action}</div>}
        </div>

        {/* Estadísticas */}
        {stats.length > 0 && (
          <div
            className="mt-6 grid text-center"
            style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index > 0 ? 'border-l border-[#333]' : ''}
              >
                <p className="text-[22px] font-semibold">{stat.value}</p>
                <p className="text-[13px] text-[#9A9A9A]">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ubicación y descripción de la tienda */}
        {isStore && store?.location && (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex max-w-full items-center gap-2 truncate rounded-full border border-[#3A3A3A] px-4 py-[6px] text-[13px]">
              <span aria-hidden style={{ color: accent }}>●</span>
              {store.location}
            </span>
          </div>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-[420px] text-center text-[14px] leading-relaxed text-[#D6D6D6]">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
