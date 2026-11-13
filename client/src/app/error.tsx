'use client';

import { useEffect } from 'react';
import ErrorScreen from '../components/feedback/error-screen';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      title="It’s not you. It’s us..."
      message="Something went wrong."
    />
  );
}