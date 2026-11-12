export const instant = false;

import TransactionDetail from './transaction-detail';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TransactionDetailPage({
  params,
}: Props) {
  const { id } = await params;

  return <TransactionDetail transactionId={id} />;
}