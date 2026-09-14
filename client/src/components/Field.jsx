/** One labelled input. Every form on the site is built from these. */
export default function Field({ label, hint, ...input }) {
  return (
    <label className="block">
      <span className="label mb-2 block text-smoke">{label}</span>
      <input
        {...input}
        className="w-full border-2 border-ink bg-paper px-3.5 py-3 font-mono text-sm text-ink outline-none focus:bg-acid/25"
      />
      {hint && <span className="label mt-2 block font-normal tracking-[0.1em] text-smoke">{hint}</span>}
    </label>
  );
}

export function Select({ label, hint, children, ...select }) {
  return (
    <label className="block">
      <span className="label mb-2 block text-smoke">{label}</span>
      <select
        {...select}
        className="w-full appearance-none border-2 border-ink bg-paper px-3.5 py-3 font-mono text-sm text-ink outline-none focus:bg-acid/25"
      >
        {children}
      </select>
      {hint && <span className="label mt-2 block font-normal tracking-[0.1em] text-smoke">{hint}</span>}
    </label>
  );
}

export function Errors({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="border-2 border-ink bg-acid px-4 py-3">
      {items.map((message) => (
        <li key={message} className="label font-normal tracking-[0.08em] leading-relaxed">
          {message}
        </li>
      ))}
    </ul>
  );
}

export function Submit({ busy, children }) {
  return (
    <button
      disabled={busy}
      className="label cursor-pointer border-0 bg-ink px-7 py-4 text-paper hover:bg-acid hover:text-ink disabled:cursor-not-allowed disabled:bg-smoke"
    >
      {busy ? 'Working…' : children}
    </button>
  );
}

export function FormShell({ eyebrow, title, children }) {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-9">
      <p className="label mt-12 text-smoke">{eyebrow}</p>
      <h1 className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]">
        {title}
      </h1>
      <div className="mt-10 max-w-xl border-t-2 border-ink pt-8 pb-20">{children}</div>
    </div>
  );
}
