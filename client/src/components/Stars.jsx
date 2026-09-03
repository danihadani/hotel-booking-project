/** Shows a hotel rating as filled / empty stars, plus the number for screen readers. */
export default function Stars({ count }) {
  return (
    <span className="stars" aria-label={`${count} כוכבים`}>
      {'★'.repeat(count)}
      {'☆'.repeat(5 - count)}
    </span>
  );
}
