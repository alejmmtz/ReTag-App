'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../../../../lib/api';

import TradeDetail from '../../../../components/transactions/trade-detail';
import SaleDetail from '../../../../components/transactions/sale-detail';
import TransactionDone from '../../../../components/transactions/transaction-done';
import TradeAccepted from '../../../../components/transactions/trade-accepted';
import SaleAccepted from '../../../../components/transactions/sale-accepted';

import type {
  Transaction,
  CurrentUser,
} from '../../../../components/transactions/transaction-types';

type Props = {
  transactionId: string;
};

export default function TransactionDetail({
  transactionId,
}: Props) {
  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  //load transaction

  useEffect(() => {
    async function loadTransaction() {
      try {
        const token =
          localStorage.getItem('access_token');

        if (!token) {
          throw new Error(
            'You need to be logged in.',
          );
        }

        const [
          transactionResponse,
          userResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/transactions/${transactionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!transactionResponse.ok) {
          throw new Error(
            'The transaction could not be loaded.',
          );
        }

        if (!userResponse.ok) {
          throw new Error(
            'The current user could not be loaded.',
          );
        }

        const transactionData: Transaction =
          await transactionResponse.json();

        const userData: CurrentUser =
          await userResponse.json();

        setTransaction(transactionData);
        setCurrentUser(userData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId]);

  //accept and reject

  async function updateStatus(
    status: 'in_progress' | 'canceled',
  ) {
    try {
      const token =
        localStorage.getItem('access_token');

      if (!token) return;

      setUpdating(true);
      setError('');

      const response = await fetch(
        `${API_URL}/transactions/${transactionId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message ??
            'The transaction could not be updated.',
        );
      }

      const updatedTransaction: Transaction =
        await response.json();

      setTransaction(updatedTransaction);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong.',
      );
    } finally {
      setUpdating(false);
    }
  }


  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] text-[#F5F5F5]">
        Loading...
      </main>
    );
  }


  if (error && !transaction) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#1A1A1A] px-6 text-center text-[#F5F5F5]">
        {error}
      </main>
    );
  }

  if (!transaction || !currentUser) {
    return null;
  }

  //users
  const isBuyer =
    transaction.buyerId === currentUser.id;

  const otherUser = isBuyer
    ? transaction.garment.seller
    : transaction.buyer;

    const isStoreSale =
    Boolean(transaction.garment.store);

    //seller accepted the proposal.
    //now waits for the buyer to contact them

if (
  transaction.transactionType === 'trade' &&
  transaction.status === 'in_progress' &&
  !isBuyer
) {
  return (
    <TransactionDone
      otherUser={otherUser}
    />
  );
}

    //buyer sees that their proposal was accepted
    //and can contact the seller

    if (
    transaction.transactionType === 'trade' &&
    transaction.status === 'in_progress' &&
    isBuyer
    ) {
    return (
        <TradeAccepted
        transaction={transaction}
        otherUser={otherUser}
        />
    );
    }

    //sale
    //seller accepted the purchase

    if (
    transaction.transactionType === 'sale' &&
    transaction.status === 'in_progress' &&
    !isBuyer
    ) {
    return (
        <SaleAccepted
        transaction={transaction}
        otherUser={otherUser}
        isStoreSale={isStoreSale}
        />
    );
    }

    //accepted sale buyer

    if (
    transaction.transactionType === 'sale' &&
    transaction.status === 'in_progress' &&
    isBuyer
    ) {
    return (
        <TransactionDone
        otherUser={otherUser}
        />
    );
    }

    //pending sale

    if (transaction.transactionType === 'sale') {
    return (
        <SaleDetail
        transaction={transaction}
        isBuyer={isBuyer}
        otherUser={otherUser}
        updating={updating}
        error={error}
        isStoreSale={isStoreSale}
        onUpdateStatus={updateStatus}
        />
    );
    }

    //pending tarde

    return (
    <TradeDetail
        transaction={transaction}
        isBuyer={isBuyer}
        otherUser={otherUser}
        updating={updating}
        error={error}
        onUpdateStatus={updateStatus}
    />
    );
}