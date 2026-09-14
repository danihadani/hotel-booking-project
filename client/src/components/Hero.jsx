/**
 * The home page banner: oversized type next to a sunset over the sea.
 *
 * The picture is not a photograph - it is drawn from gradients and noise by
 * tools/make_hero.py, then reduced to pure black and white with no greys at
 * all. That keeps it in step with the rest of the design, and means the
 * project carries no image file it did not make itself.
 */
export default function Hero() {
  return (
    <section className="grid gap-0 border-b-2 border-ink md:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col justify-between gap-10 px-6 py-12 sm:px-9 md:py-16">
        <div>
          <p className="label mb-6 text-smoke">Est. 2026 — Five properties</p>
          <h1 className="text-[clamp(2.75rem,9vw,5.5rem)] font-extrabold leading-[0.84] tracking-[-0.06em]">
            SLEEP
            <br />
            SOMEWHERE
            <br />
            <span className="bg-acid px-2">BETTER</span>
          </h1>
        </div>

        <p className="max-w-[42ch] font-mono text-[13px] leading-[1.9] text-smoke">
          A small collection of hotels, from Jerusalem to Kyoto. Browse the rooms,
          pick your dates, and book — we check the room is genuinely free before
          we confirm anything.
        </p>
      </div>

      <div
        className="min-h-[260px] border-ink bg-ink bg-cover bg-center md:min-h-full md:border-l-2"
        style={{ backgroundImage: "url('/hero.png')" }}
        role="img"
        aria-label="A sunset over the sea, drawn in black and white"
      />
    </section>
  );
}
