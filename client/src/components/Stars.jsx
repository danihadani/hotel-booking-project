/** A hotel's rating, drawn as filled and empty stars. */
export default function Stars({ count }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.14em]" aria-label={`${count} stars`}>
      <span className="text-ink">{'★'.repeat(count)}</span>
      <span className="text-hairline">{'★'.repeat(5 - count)}</span>
    </span>
  );
}
