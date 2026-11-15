'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { MeResponse } from '../../../../components/posts/post-types';
import { authFetch } from '../../../../lib/http';

export default function GarmentSentPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'store'>('user');

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
          alt="Garment added"
          width={300}
          height={200}
          className="mb-8 h-auto w-[200px]"
          priority
        />

        <h1 className="text-[20px] font-medium">Upa! Your garment was added!</h1>

        <p className="mt-2 text-[15px] text-[#8A8A8A]">
          You can find it in your {isStore ? 'store' : 'closet'}
        </p>

        {/* Perfil de cada rol: /profile (user) o /store (store). */}
        <button
          type="button"
          onClick={() => router.push(isStore ? '/store' : '/profile')}
          className="mt-8 h-[51px] w-[197px] max-w-[320px] rounded-full text-[15px] font-medium"
          style={{
            backgroundColor: isStore ? '#2864E8' : '#C8F66F',
            color: isStore ? '#FFFFFF' : '#1A1A1A',
          }}
        >
          {isStore ? 'Go to my store' : 'Go to my closet'}
        </button>
      </div>
    </main>
  );
}