/**
 * The picture on the home page: a sunset over the sea.
 * Drawn as an inline SVG so the project has no external image files to lose.
 */
export default function Hero() {
  return (
    <div className="hero">
      <svg viewBox="0 0 1000 420" role="img" aria-label="שקיעה מעל הים" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2b56" />
            <stop offset="38%" stopColor="#a8446b" />
            <stop offset="68%" stopColor="#f4794a" />
            <stop offset="100%" stopColor="#ffc978" />
          </linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6893f" />
            <stop offset="22%" stopColor="#a85a63" />
            <stop offset="60%" stopColor="#2c5f7d" />
            <stop offset="100%" stopColor="#123c52" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffd27d" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sky */}
        <rect width="1000" height="270" fill="url(#sky)" />
        <circle cx="500" cy="268" r="150" fill="url(#glow)" />
        <circle cx="500" cy="268" r="62" fill="#fff0b8" />

        {/* clouds */}
        <g fill="#ffffff" opacity="0.25">
          <ellipse cx="185" cy="82" rx="105" ry="17" />
          <ellipse cx="250" cy="104" rx="70" ry="11" />
          <ellipse cx="800" cy="63" rx="120" ry="15" />
          <ellipse cx="726" cy="86" rx="62" ry="10" />
        </g>

        {/* birds */}
        <g stroke="#40243a" strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round">
          <path d="M150 150 l14 -11 l14 11" />
          <path d="M196 132 l11 -9 l11 9" />
          <path d="M832 168 l13 -10 l13 10" />
        </g>

        {/* sea */}
        <rect y="270" width="1000" height="150" fill="url(#water)" />

        {/* the sun's reflection on the water */}
        <g fill="#ffe6a3" opacity="0.75">
          <rect x="455" y="279" width="90" height="5" rx="2.5" />
          <rect x="440" y="294" width="120" height="6" rx="3" opacity="0.85" />
          <rect x="462" y="310" width="76" height="5" rx="2.5" opacity="0.7" />
          <rect x="430" y="327" width="140" height="6" rx="3" opacity="0.55" />
          <rect x="466" y="346" width="68" height="5" rx="2.5" opacity="0.45" />
          <rect x="415" y="366" width="170" height="6" rx="3" opacity="0.35" />
        </g>

        {/* waves */}
        <g stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round">
          <path d="M40 300 q18 -7 36 0 t36 0" />
          <path d="M700 292 q18 -7 36 0 t36 0" />
          <path d="M120 344 q22 -8 44 0 t44 0" />
          <path d="M760 356 q22 -8 44 0 t44 0" />
          <path d="M280 392 q22 -8 44 0 t44 0" />
        </g>
      </svg>

      <div className="hero-text">
        <h1>הזמנת חדרים במלונות מסביב לעולם</h1>
        <p>שקיעה, ים, ומיטה נוחה — הכול במרחק כמה קליקים.</p>
      </div>
    </div>
  );
}
