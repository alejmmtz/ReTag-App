import ErrorScreen from '../components/feedback/error-screen';

export default function NotFound() {
  return (
    <ErrorScreen
      title="It’s not you. It’s us..."
      message="Page not found."
    />
  );
}