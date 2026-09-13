"use client";

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
  if (loading) return <div className="loading">Cargando…</div>;
  if (offline)
    return (
      <div className="error" role="alert">
        Sin conexión a la API local.{" "}
        {onRetry && (
          <button type="button" className="btn secondary" onClick={onRetry}>
            Reintentar
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
            Reintentar
          </button>
        )}
      </div>
    );
  if (empty) return <div className="empty">No hay elementos todavía.</div>;
  return <>{children}</>;
}
