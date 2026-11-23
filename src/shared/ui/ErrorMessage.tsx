interface ErrorMessageProps {
  message: string;
  title?: string;
  details?: string[];
  onRetry?: () => void;
}

export function ErrorMessage({ message, title = 'Error', details = [], onRetry }: ErrorMessageProps) {
  return (
    <div className="state state--error" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      {details.length > 0 && (
        <ul>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
