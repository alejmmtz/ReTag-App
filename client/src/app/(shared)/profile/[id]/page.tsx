import { Suspense } from 'react';

import ProfileView from '../../../../components/profile/profile-view';

type Props = {
  params: Promise<{ id: string }>;
};

async function ProfileById({ params }: Props) {
  const { id } = await params;

  return <ProfileView userId={id} />;
}

export default function ProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<main className="bg-background mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter" />}>
      <ProfileById params={params} />
    </Suspense>
  );
}