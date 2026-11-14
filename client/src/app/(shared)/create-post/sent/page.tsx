'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { MeResponse } from '../../../../components/posts/post-types';
import { authFetch } from '../../../../lib/http';

export default function PostSentPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'store'>('user');

  // El botón lleva al inicio de cada rol: /feed (user) o /home (store).
  useEffect(() => {
    authFetch<MeResponse>('/auth/me')
      .then((me) => setRole(me.role))
      .catch(() => undefined);
  }, []);

  const isStore = role === 'store';

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[#191919] px-8 text-white">
      <div className="flex w-full max-w-[560px] flex-col items-center text-center">
        <Image
          src="/illustrations/star.png"
          alt="Post published"
          width={300}
          height={200}
          className="mb-8 h-auto w-[200px]"
          priority
        />

        <h1 className="text-[20px] font-medium">
          Wow! Your post was published!
        </h1>

        <p className="mt-2 text-[15px] text-[#8A8A8A]">
          Check it on your feed
        </p>

        <button
          type="button"
          onClick={() => router.push(isStore ? '/home' : '/feed')}
          className="mt-8 h-[51px] w-[197px] max-w-[320px] rounded-full text-[15px] font-medium"
          style={{
            backgroundColor: isStore ? '#2864E8' : '#C8F66F',
            color: isStore ? '#FFFFFF' : '#1A1A1A',
          }}
        >
          Go to home
        </button>
      </div>
    </main>
  );
}