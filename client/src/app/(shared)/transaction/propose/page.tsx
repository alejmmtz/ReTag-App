export const instant = false;

import ProposeExchange from './propose-exchange';

type Props = {
  searchParams: Promise<{
    garmentId?: string;
  }>;
};

export default async function ProposeTransactionPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  return (
    <ProposeExchange garmentId={params.garmentId ?? ''} />
  );
}