export const instant = false;

import EventDetail from './event-detail';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: Props) {
  const { id } = await params;

  return <EventDetail eventId={id} />;
}