'use client';

import ErrorScreen from '../components/feedback/error-screen';

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <ErrorScreen
          title="It’s not you. It’s us..."
          message="Something went wrong."
        />
      </body>
    </html>
  );
}