import type { ProfileUser } from './profile-types';

type Stat = { label: string; value: number | string };

type Props = {
  user: ProfileUser;
  accent: string;
  accentText: string;
  stats: Stat[];
  action?: React.ReactNode;
};

export default function ProfileHeader({
  user,
  accent,
  accentText,
  stats,
  action,
}: Props) {
  const displayName = user.name || user.username;

  return (
    <header>
      <div className="flex items-center gap-4">
        {/* Foto de perfil, o la inicial si no tiene */}
        <div
          className="flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[30px] font-medium"
          style={{ backgroundColor: accent, color: accentText }}
        >
          {user.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePicture}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] font-medium leading-tight">
            {displayName}
          </h1>
          <p className="truncate text-[14px] text-[#8A8A8A]">
            @{user.username}
          </p>
        </div>

        {action}
      </div>

      {user.description && (
        <p className="mt-4 text-[14px] leading-relaxed text-[#D6D6D6]">
          {user.description}
        </p>
      )}

      {stats.length > 0 && (
        <div className="mt-5 grid grid-cols-4 gap-2 rounded-[18px] border border-[#2A2A2A] py-3 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-[18px] font-medium">{stat.value}</p>
              <p className="text-[11px] text-[#8A8A8A]">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}