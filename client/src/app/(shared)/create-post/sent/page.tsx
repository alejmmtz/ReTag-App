'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { MeResponse } from '../../../../components/posts/post-types';
import { authFetch } from '../../../../lib/http';

export default function PostSentPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'store'>('user');

  useEffect(() => {
    authFetch<MeResponse>('/auth/me')
      .then((me) => setRole(me.role))
      .catch(() => undefined);
  }, []);

  const isStore = role === 'store';

  return (
    <main className="flex flex-col items-center justify-center bg-background text-foreground mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/illustrations/wow.png"
          alt="Post published"
          width={297}
          height={157}
          className="mb-8 h-auto w-[260px]"
          priority
        />

        <h1 className="text-xl font-semibold">
          Your post was published!
        </h1>

        <p className="mt-2 text-sm text-grey">
          Check it on home
        </p>

        <button
          type="button"
          onClick={() => router.push(isStore ? '/home' : '/feed')}
          className="button-pill mt-8 w-[197px] max-w-[320px]"
          style={{
            backgroundColor: isStore ? '#1D5CEB' : '#C8F66F',
            color: isStore ? '#FFFFFF' : '#1A1A1A',
          }}
        >
          Go to home
        </button>
      </div>
    </main>
  );
}