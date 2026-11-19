import { Suspense } from 'react';

import GarmentDetailView from '../../../../components/garment/garment-detail-view';

type Props = {
  params: Promise<{ id: string }>;
};
async function GarmentById({ params }: Props) {
  const { id } = await params;

  return <GarmentDetailView garmentId={id} />;
}

export default function GarmentPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="bg-background mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter" />}>
      <GarmentById params={params} />
    </Suspense>
  );
}