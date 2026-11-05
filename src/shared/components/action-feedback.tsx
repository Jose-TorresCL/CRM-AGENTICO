export function ActionFeedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`text-sm ${error ? "text-red-700" : "text-green-700"}`}
      role={error ? "alert" : "status"}
    >
      {error ?? message}
    </p>
  );
}
