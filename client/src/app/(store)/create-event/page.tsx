import CreateEventForm from "./create-event-form";
import RoleGuard from "../../../components/auth/role-guard";

export default function CreateEventPage() {
  return (
    <RoleGuard role="store">
      <CreateEventForm />
    </RoleGuard>
  );
}