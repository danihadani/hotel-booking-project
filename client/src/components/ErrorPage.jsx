import { Link } from 'react-router-dom';

/**
 * The three reservation error pages all look the same,
 * so they share one component and only the texts change.
 */
export default function ErrorPage({ title, subtitle }) {
  return (
    <div className="error-page">
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      <p className="back">
        <Link to="/book">חזרה לטופס ההזמנה</Link>
      </p>
    </div>
  );
}
