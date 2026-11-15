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
    <Suspense fallback={<main className="min-h-screen bg-[#191919]" />}>
      <ProfileById params={params} />
    </Suspense>
  );
}