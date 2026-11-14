export const instant = false;

import ReviewProposal from './review-proporsal';

type Props = {
  searchParams: Promise<{
    garmentId?: string;
    tradeGarmentId?: string;
    type?: string;
  }>;
};

export default async function ReviewPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  return (
    <ReviewProposal
      garmentId={params.garmentId ?? ''}
      tradeGarmentId={params.tradeGarmentId ?? ''}
      showContinue={true}
    />
  );
}