export const instant = false;

import EventDetail from './event-detail';

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    mode?: string;
  }>;
};

export default async function EventDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { mode } = await searchParams;

  return (
    <EventDetail
      eventId={id}
      mode={
        mode === 'store'
          ? 'store'
          : 'user'
      }
    />
  );
}