'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { authFetch } from '../../lib/http';

type SearchUser = {
  id: string;
  username: string;
  name: string | null;
  profilePicture: string | null;
  role: 'user' | 'store';
};

type SearchPage = { data: SearchUser[] };

type Props = {
  query: string;
  accent: string;
  accentText: string;
};

// Resultados del buscador del feed (usuarios y tiendas), con espera al escribir.
export default function UserSearchResults({ query, accent, accentText }: Props) {
  const [results, setResults] = useState<SearchUser[]>([]);
  const [settledQuery, setSettledQuery] = useState('');
  const [failed, setFailed] = useState(false);

  const term = query.trim();

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await authFetch<SearchPage>(
          `/users?q=${encodeURIComponent(term)}&limit=20`,
        );

        if (!cancelled) {
          setResults(data.data);
          setFailed(false);
          setSettledQuery(term);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setSettledQuery(term);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const loading = settledQuery !== term;

  if (loading) {
    return (
      <div className="mt-6 space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-[64px] w-full animate-pulse rounded-[18px] bg-[#262626]"
          />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <p className="mt-10 text-center text-[14px] text-[#FB3F0F]" role="alert">
        We could not search right now.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="mt-10 text-center text-[14px] text-[#9A9A9A]">
        No users or stores match &ldquo;{term}&rdquo;.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {results.map((user) => {
        const shownName = user.name || user.username;

        return (
          <li key={user.id}>
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 rounded-[18px] bg-[#262626] p-3"
            >
              <span
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[16px] font-medium"
                style={{
                  backgroundColor: user.role === 'store' ? '#2864E8' : '#C8F66F',
                  color: user.role === 'store' ? '#FFFFFF' : '#1A1A1A',
                }}
              >
                {user.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
                ) : (
                  shownName.charAt(0).toUpperCase()
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{shownName}</span>
                <span className="block truncate text-[13px] text-[#9A9A9A]">@{user.username}</span>
              </span>

              {user.role === 'store' && (
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium"
                  style={{ backgroundColor: accent, color: accentText }}
                >
                  Store
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
