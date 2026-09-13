"use client";

import { t } from "@/lib/i18n/es";

export function StateBlock({
  loading,
  error,
  offline,
  empty,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  offline?: boolean;
  empty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  const messages = t();
  if (loading) return <div className="loading">{messages.states.loading}</div>;
  if (offline)
    return (
      <div className="error" role="alert">
        {messages.states.offline}{" "}
        {onRetry && (
          <button type="button" className="btn secondary" onClick={onRetry}>
            {messages.states.recovery}
          </button>
        )}
      </div>
    );
  if (error)
    return (
      <div className="error" role="alert">
        {error}{" "}
        {onRetry && (
          <button type="button" className="btn secondary" onClick={onRetry}>
            {messages.states.recovery}
          </button>
        )}
      </div>
    );
  if (empty) return <div className="empty">{messages.states.empty}</div>;
  return <>{children}</>;
}
