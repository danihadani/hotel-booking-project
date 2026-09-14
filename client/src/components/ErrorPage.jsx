import { Link } from 'react-router-dom';

/**
 * The three reservation errors share this page; only the words change.
 * The wording comes straight from the assignment.
 */
export default function ErrorPage({ title, subtitle }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-9">
      <p className="label mb-8 text-smoke">Error — no reservation was made</p>

      <div className="border-t-2 border-ink pt-8">
        <h1 className="max-w-[20ch] text-[clamp(2rem,6vw,3.75rem)] font-extrabold leading-[0.92] tracking-[-0.05em]">
          <span className="bg-acid px-1.5 leading-[1.3] box-decoration-clone">{title}</span>
        </h1>
        <p className="label mt-8">{subtitle}</p>
      </div>

      <Link
        to="/book"
        className="label mt-12 inline-block bg-ink px-5 py-3 text-paper no-underline hover:bg-acid hover:text-ink"
      >
        Back to the booking form
      </Link>
    </div>
  );
}
