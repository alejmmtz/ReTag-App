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
    <Suspense fallback={<main className="min-h-screen bg-[#191919]" />}>
      <GarmentById params={params} />
    </Suspense>
  );
}