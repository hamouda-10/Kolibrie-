import { useEffect, useState, type CSSProperties } from 'react';
import { ClientLogos } from './components/ClientLogos';
import { CropImage } from './components/CropImage';
import {
  HERO_CARDS,
  HERO_POSTER_URL,
  LOAD_WIPE_PATH,
  TEAM_CARDS,
  WORK_SLIDES,
  type WorkSlide,
} from './data/kolibrieData';
import { initKolibrieMotion } from './lib/initKolibrieMotion';

export default function App() {
  const [activeCase, setActiveCase] = useState<WorkSlide | null>(null);

  useEffect(() => {
    const cleanup = initKolibrieMotion();
    return cleanup;
  }, []);

  useEffect(() => {
    if (!activeCase) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCase(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCase]);

  return (
    <>
      {/* 5.1 Load wipe */}
      <div className="load-wipe" aria-hidden="true">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path
            d={LOAD_WIPE_PATH}
            fill="none"
            stroke="var(--tomato)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0"
          />
        </svg>
      </div>

      {/* 5.2 Cursor label */}
      <div
        className="cursor-marquee"
        data-cursor-marquee-status="not-active"
        data-cursor-marquee-playing="false"
        aria-hidden="true"
      >
        <div className="cursor-marquee-card">
          <span className="cursor-marquee-span">View case →</span>
          <span className="cursor-marquee-span is-clone">View case →</span>
        </div>
      </div>

      {/* 5.3 Nav */}
      <header className="site-nav">
        <a href="#hero" className="nav-logo">
          Kolibrie
        </a>

        <nav className="nav-center" aria-label="Primary">
          <a href="#team" className="nav-link" data-draw-line="">
            <span>About</span>
            <span className="draw-line-box" aria-hidden="true" />
          </a>
          <a href="#work" className="nav-link" data-draw-line="">
            <span>Work</span>
            <span className="draw-line-box" aria-hidden="true" />
          </a>
          <a href="#work" className="nav-link" data-draw-line="">
            <span>Services</span>
            <span className="draw-line-box" aria-hidden="true" />
          </a>
        </nav>

        <a href="#team" className="nav-contact">
          <span className="nav-contact-dot" aria-hidden="true" />
          <span>Contact</span>
        </a>
      </header>

      <main>
        {/* 5.4 Hero */}
        <section
          id="hero"
          className="hero-section"
          data-cursor-cards=""
          data-threshold="300"
        >
          <video
            className="hero-video"
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_POSTER_URL}
            aria-hidden="true"
          />

          <div className="hero-card" aria-hidden="true">
            <div className="hero-card-media">
              {HERO_CARDS.map((item, idx) => (
                <CropImage
                  key={item.crop}
                  crop={item.crop}
                  alt={item.alt}
                  className={`hero-card-crop${idx === 0 ? ' on' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-content" data-text-reveal-group="">
            <h1
              className="hero-h1"
              data-text-reveal="chars"
              data-font-weight-hover=""
              data-fwh-rest="700"
              data-fwh-near="200"
              data-fwh-radius="400"
            >
              Stories that
              <br />
              get{' '}
              <span
                className="alt-word"
                data-font-weight-hover=""
                data-fwh-rest="300"
                data-fwh-near="800"
                data-fwh-radius="400"
              >
                shared
              </span>
            </h1>

            <a
              href="#work"
              className="hero-link"
              data-text-reveal="lines"
              data-draw-line="always"
            >
              <span>See the reel</span>
              <span className="draw-line-box" aria-hidden="true" />
              <span className="hero-arrow-box" aria-hidden="true">
                <span className="hero-arrow-track">
                  <svg className="hero-arrow-copy" viewBox="0 0 14 13" fill="var(--white)">
                    <path d="M12.94 5.7 9.95 8 6.9 10.37l.84 1.86V0h-2.55v12.23l.85-1.86L3 8 0 5.7V9.05l6.47 4.95 6.47-4.95z" />
                  </svg>
                  <span className="hero-arrow-copy is-clone">
                    <svg viewBox="0 0 14 13" fill="var(--white)" style={{ width: '100%', height: '54%' }}>
                      <path d="M12.94 5.7 9.95 8 6.9 10.37l.84 1.86V0h-2.55v12.23l.85-1.86L3 8 0 5.7V9.05l6.47 4.95 6.47-4.95z" />
                    </svg>
                  </span>
                </span>
              </span>
            </a>
          </div>

          <div className="hero-marquee">
            <div className="marquee-wrap">
              <ClientLogos />
            </div>
          </div>
        </section>

        {/* 5.5 Latest drops */}
        <section
          id="work"
          className="work-section"
          data-featured-stack=""
          data-scroll-factor="1.2"
        >
          <div className="work-pin">
            <div className="work-copy" data-scroll-reveal-group="">
              <p className="eyebrow-s work-eyebrow" data-scroll-reveal="lines">
                Made to be watched twice. A handful of what left our edit desk lately.
              </p>
              <h2
                className="section-h2"
                data-scroll-reveal="chars"
                data-font-weight-hover=""
                data-fwh-rest="700"
                data-fwh-near="200"
                data-fwh-radius="400"
              >
                Latest{' '}
                <span
                  className="alt-word"
                  data-font-weight-hover=""
                  data-fwh-rest="300"
                  data-fwh-near="800"
                  data-fwh-radius="400"
                >
                  drops
                </span>
              </h2>
            </div>

            <div className="work-stage">
              <div className="work-stack">
                {WORK_SLIDES.map((slide) => (
                  <a
                    key={slide.id}
                    href={`#${slide.id}`}
                    className="work-slide"
                    style={{ backgroundColor: slide.frameColor }}
                    data-cursor-marquee-text="View case →"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCase(slide);
                    }}
                  >
                    <CropImage
                      crop={slide.crop}
                      alt={slide.alt}
                      className="work-slide-crop"
                    />
                    <div className="work-slide-grad" aria-hidden="true" />
                    <h3 className="work-slide-title">{slide.title}</h3>
                  </a>
                ))}
              </div>

              <div className="work-badge" aria-hidden="true">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <path
                      id="kolibrie-badge-ring"
                      d="M 100,100 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                    />
                  </defs>
                  <circle cx="100" cy="100" r="98" fill="var(--tomato)" />
                  <text className="work-badge-text">
                    <textPath
                      href="#kolibrie-badge-ring"
                      textLength="436"
                      lengthAdjust="spacing"
                    >
                      SCROLL · SAVE · SHARE · REPEAT ·
                    </textPath>
                  </text>
                  <g
                    fill="none"
                    stroke="var(--cream)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  >
                    <circle cx="100" cy="100" r="17" />
                    <line x1="100" y1="64" x2="100" y2="74" />
                    <line x1="100" y1="126" x2="100" y2="136" />
                    <line x1="64" y1="100" x2="74" y2="100" />
                    <line x1="126" y1="100" x2="136" y2="100" />
                    <line x1="74.5" y1="74.5" x2="81.6" y2="81.6" />
                    <line x1="118.4" y1="118.4" x2="125.5" y2="125.5" />
                    <line x1="125.5" y1="74.5" x2="118.4" y2="81.6" />
                    <line x1="81.6" y1="118.4" x2="74.5" y2="125.5" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 5.6 Meet the flock */}
        <section id="team" className="team-section" data-page-theme="dark">
          <div className="team-sticky">
            <div className="team-center" data-scroll-reveal-group="">
              <div className="team-stamp" data-momentum-hover="">
                <div className="team-stamp-rot">
                  <svg viewBox="0 0 220 130" aria-label="Kolibrie stamp">
                    <ellipse
                      cx="110"
                      cy="65"
                      rx="104"
                      ry="58"
                      fill="var(--cream)"
                      stroke="var(--tomato)"
                      strokeWidth="10"
                    />
                    <text
                      x="110"
                      y="68"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="'Yellowtail', cursive"
                      fontSize="54"
                      fill="var(--tomato)"
                      transform="rotate(-8 110 65)"
                    >
                      Kolibrie
                    </text>
                  </svg>
                </div>
              </div>

              <p className="eyebrow-m" data-scroll-reveal="lines">
                The people behind the frames
              </p>

              <h2
                className="section-h2 team-h2"
                data-scroll-reveal="chars"
                data-font-weight-hover=""
                data-fwh-rest="700"
                data-fwh-near="200"
                data-fwh-radius="400"
              >
                <span
                  className="alt-word"
                  data-font-weight-hover=""
                  data-fwh-rest="300"
                  data-fwh-near="800"
                  data-fwh-radius="400"
                >
                  Meet
                </span>{' '}
                the{' '}
                <span
                  className="alt-word"
                  data-font-weight-hover=""
                  data-fwh-rest="300"
                  data-fwh-near="800"
                  data-fwh-radius="400"
                >
                  flock
                </span>
              </h2>

              <p className="body-p team-p" data-scroll-reveal="lines">
                Twelve makers, one group chat. We shoot, cut and animate before the coffee goes cold.
              </p>
            </div>
          </div>

          <div className="team-photos">
            {TEAM_CARDS.map((card) => {
              const posStyle: CSSProperties = {
                top: card.top,
                width: card.width,
                [card.side]: card.offset,
                ['--mob-top' as string]: card.mobTop,
              };
              const rotStyle = {
                '--card-rot': `${card.rotate}deg`,
              } as CSSProperties;
              const stickerStyle = {
                '--sticker-rot': `${card.stickerRotate ?? 0}deg`,
              } as CSSProperties;

              return (
                <div
                  key={card.id}
                  className={`team-photo is-${card.side} ${card.isOdd ? 'is-odd' : 'is-even'}`}
                  style={posStyle}
                  data-speed={card.speed}
                >
                  <div className="team-photo-inertia" data-momentum-hover="">
                    <div className="team-photo-rot" style={rotStyle}>
                      <CropImage
                        crop={card.crop}
                        alt={card.alt}
                        className="team-photo-crop"
                      />
                      {card.isBts ? (
                        <span className="team-caption">{card.label}</span>
                      ) : (
                        <span className="team-name" style={stickerStyle}>
                          {card.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {activeCase && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-modal-title"
          onClick={() => setActiveCase(null)}
        >
          <div
            className="relative w-full max-w-[44rem] bg-[var(--cream)] p-[1.5rem] text-[var(--ink)] shadow-2xl"
            style={{ border: `0.5rem solid ${activeCase.frameColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-[1rem] flex items-center justify-between gap-4">
              <div className="text-[0.95rem] uppercase tracking-tight opacity-75">
                {activeCase.client} · {activeCase.deliverable}
              </div>
              <button
                type="button"
                onClick={() => setActiveCase(null)}
                className="cursor-pointer bg-[var(--ink)] px-[0.9rem] py-[0.45rem] text-[0.9rem] uppercase text-[var(--cream)] transition-transform hover:scale-105"
              >
                Close
              </button>
            </div>
            <div className="aspect-[1.75] w-full overflow-hidden">
              <CropImage
                crop={activeCase.crop}
                alt={activeCase.alt}
                className="h-full w-full"
              />
            </div>
            <h3
              id="case-modal-title"
              className="mt-[1.2rem] text-[2.4rem] uppercase leading-[0.9] tracking-[-0.02em]"
              style={{ fontVariationSettings: '"wght" 800, "wdth" 72' }}
            >
              {activeCase.title}
            </h3>
            <p className="body-p mt-[0.6rem]">{activeCase.summary}</p>
          </div>
        </div>
      )}
    </>
  );
}
