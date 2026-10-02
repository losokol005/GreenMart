export const Loading = ({ label = 'Loading…' }) => <p role="status" className="muted">{label}</p>;
export const ErrorMessage = ({ error, onRetry }) =>
  error ? (
    <div role="alert" className="alert">
      {error.message || String(error)}
      {onRetry && <button className="link" onClick={onRetry}>Try again</button>}
    </div>
  ) : null;
export const Empty = ({ children }) => <p className="empty">{children}</p>;

export function Pager({ data, onPage }) {
  if (!data || data.pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>Previous</button>
      <span>Page {data.page} of {data.pages}</span>
      <button disabled={data.page >= data.pages} onClick={() => onPage(data.page + 1)}>Next</button>
    </nav>
  );
}
