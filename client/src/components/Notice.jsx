/**
 * The line a page shows while it is waiting for the server, or when the
 * request came back with an error. Every page that loads data uses it.
 */
export default function Notice({ children }) {
  return <p className="label mx-auto max-w-6xl px-6 py-16 text-smoke sm:px-9">{children}</p>;
}
