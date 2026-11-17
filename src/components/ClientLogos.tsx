export function ClientLogos() {
  return (
    <div className="marquee-collection">
      {/* 1. Six-spoke asterisk of round-capped strokes */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <g stroke="currentColor" strokeWidth="9" strokeLinecap="round">
            <line x1="40" y1="10" x2="40" y2="70" />
            <line x1="14" y1="25" x2="66" y2="55" />
            <line x1="66" y1="25" x2="14" y2="55" />
          </g>
        </svg>
      </div>

      {/* 2. Two capsule "D" shapes side by side */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 96 64" fill="currentColor">
          <path d="M8 10h16c13.255 0 24 10.745 24 22S37.255 54 24 54H8V10z" />
          <path d="M52 10h16c13.255 0 24 10.745 24 22S81.255 54 68 54H52V10z" />
        </svg>
      </div>

      {/* 3. Three wavy lines */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 96 72" fill="none">
          <g stroke="currentColor" strokeWidth="7.5" strokeLinecap="round">
            <path d="M8 18c8-8 16-8 24 0s16 8 24 0 16-8 24 0 8 4 8 0" />
            <path d="M8 36c8-8 16-8 24 0s16 8 24 0 16-8 24 0 8 4 8 0" />
            <path d="M8 54c8-8 16-8 24 0s16 8 24 0 16-8 24 0 8 4 8 0" />
          </g>
        </svg>
      </div>

      {/* 4. Four diamonds in a diamond pattern */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="currentColor">
          <polygon points="40,6 52,18 40,30 28,18" />
          <polygon points="62,28 74,40 62,52 50,40" />
          <polygon points="40,50 52,62 40,74 28,62" />
          <polygon points="18,28 30,40 18,52 6,40" />
        </svg>
      </div>

      {/* 5. Half sun over three bars */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 88 76" fill="currentColor">
          <path d="M18 38a26 26 0 0 1 52 0H18z" />
          <rect x="12" y="45" width="64" height="7" rx="3.5" />
          <rect x="18" y="56" width="52" height="7" rx="3.5" />
          <rect x="28" y="67" width="32" height="7" rx="3.5" />
        </svg>
      </div>

      {/* 6. Two arches */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 92 72" fill="none">
          <path
            d="M10 62V36a17 17 0 0 1 34 0v26"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M48 62V36a17 17 0 0 1 34 0v26"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 7. Four-point sparkle star */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="currentColor">
          <path d="M40 4C43 26 54 37 76 40 54 43 43 54 40 76 37 54 26 43 4 40 26 37 37 26 40 4Z" />
        </svg>
      </div>

      {/* 8. Circle with a cross inside */}
      <div className="marquee-item" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="9" />
          <line x1="40" y1="18" x2="40" y2="62" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <line x1="18" y1="40" x2="62" y2="40" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
