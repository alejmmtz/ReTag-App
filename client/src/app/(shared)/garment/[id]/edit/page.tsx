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
    <Suspense fallback={<main className="bg-background mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-24 page-enter" />}>
      <EditById params={params} />
    </Suspense>
  );
}