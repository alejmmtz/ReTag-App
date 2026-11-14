export const instant = false;

import EditEventForm from './edit-event-form'

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({
  params,
}: Props) {
  const { id } = await params;

  return <EditEventForm eventId={id} />;
}