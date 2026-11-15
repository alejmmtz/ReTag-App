import { Suspense } from 'react';

import GarmentEditLoader from '../../../../../components/garment/garment-edit-loader';

type Props = {
  params: Promise<{ id: string }>;
};

// `params` se lee dentro de <Suspense> (requisito de cacheComponents en Next 16).
async function EditById({ params }: Props) {
  const { id } = await params;

  return <GarmentEditLoader garmentId={id} />;
}

// /garment/:id/edit: editar una prenda propia.
export default function EditGarmentPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#191919]" />}>
      <EditById params={params} />
    </Suspense>
  );
}