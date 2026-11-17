import { DRAW_LINE_PATHS, HERO_VIDEO_URL } from '../data/kolibrieData';

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    SplitText?: any;
    DrawSVGPlugin?: any;
    InertiaPlugin?: any;
    Lenis?: any;
  }
}

let initialized = false;

export function initKolibrieMotion(): () => void {
  if (initialized) return () => {};
  initialized = true;

  const cleanupFns: Array<() => void> = [];
  const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const touchMq = window.matchMedia('(hover: none), (pointer: coarse)');
  let isReduced = reducedMotionMq.matches;
  const isTouch = touchMq.matches;

  const revealAllFallback = () => {
    document.documentElement.setAttribute('data-page-ready', '');
    const main = document.querySelector('main');
    if (main instanceof HTMLElement) {
      main.style.visibility = 'visible';
      main.style.opacity = '1';
    }
    document
      .querySelectorAll<HTMLElement>('[data-text-reveal], [data-scroll-reveal]')
      .forEach((el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
    const wipe = document.querySelector('.load-wipe');
    if (wipe) {
      wipe.setAttribute('data-transition-ready', '');
    }
  };

  // 4-second failsafe
  const failsafeTimer = window.setTimeout(revealAllFallback, 4000);
  cleanupFns.push(() => window.clearTimeout(failsafeTimer));

  // Hero video reduced-motion sync
  const syncHeroVideo = (reduced: boolean) => {
    const video = document.querySelector<HTMLVideoElement>('.hero-video');
    if (!video) return;
    if (reduced) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    } else {
      if (video.getAttribute('src') !== HERO_VIDEO_URL) {
        video.setAttribute('src', HERO_VIDEO_URL);
        video.load();
      }
      video.play().catch(() => {});
    }
  };

  syncHeroVideo(isReduced);
  const onReducedChange = (e: MediaQueryListEvent) => {
    isReduced = e.matches;
    syncHeroVideo(isReduced);
  };
  reducedMotionMq.addEventListener('change', onReducedChange);
  cleanupFns.push(() => reducedMotionMq.removeEventListener('change', onReducedChange));

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  const DrawSVGPlugin = window.DrawSVGPlugin;
  const InertiaPlugin = window.InertiaPlugin;
  const Lenis = window.Lenis;

  if (!gsap || !ScrollTrigger || !SplitText || !DrawSVGPlugin || !InertiaPlugin) {
    window.clearTimeout(failsafeTimer);
    revealAllFallback();
    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, InertiaPlugin);

  const splitCharsMap = new WeakMap<HTMLElement, HTMLElement[]>();

  // 6.1 Smooth scroll (Lenis)
  let lenis: any = null;
  if (!isReduced && Lenis) {
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on('scroll', ScrollTrigger.update);
    const lenisTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
    cleanupFns.push(() => {
      gsap.ticker.remove(lenisTick);
      lenis.destroy();
    });
  }

  // Smooth anchor scrolling
  const onAnchorClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };
  document.addEventListener('click', onAnchorClick);
  cleanupFns.push(() => document.removeEventListener('click', onAnchorClick));

  // 6.3 Text reveal on load
  const initTextReveal = (baseDelay: number) => {
    const groups = document.querySelectorAll<HTMLElement>('[data-text-reveal-group]');
    const handled = new Set<HTMLElement>();

    const animateEl = (el: HTMLElement, delay: number) => {
      handled.add(el);
      const mode = el.getAttribute('data-text-reveal');
      const hasFwh =
        el.hasAttribute('data-font-weight-hover') ||
        !!el.querySelector('[data-font-weight-hover]');

      gsap.set(el, { visibility: 'visible' });
      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'chars,words,lines' : 'lines,words',
        linesClass: 'line',
        charsClass: 'char',
        mask: 'lines',
        autoSplit: !hasFwh,
      });

      if (mode === 'chars' && split.chars) {
        splitCharsMap.set(el, split.chars as HTMLElement[]);
      }

      const targets = mode === 'chars' ? split.chars : split.lines;
      const stagger = mode === 'chars' ? 0.07 * 0.25 : 0.07;

      gsap.from(targets, {
        yPercent: 135,
        duration: 1,
        ease: 'expo.out',
        stagger,
        delay,
        onComplete: () => {
          el.dispatchEvent(new CustomEvent('reveal:done'));
        },
      });
    };

    groups.forEach((group) => {
      const children = group.querySelectorAll<HTMLElement>('[data-text-reveal]');
      children.forEach((child, index) => {
        animateEl(child, baseDelay + index * 0.12);
      });
    });

    document.querySelectorAll<HTMLElement>('[data-text-reveal]').forEach((el) => {
      if (!handled.has(el)) {
        animateEl(el, baseDelay);
      }
    });
  };

  // 6.4 Scroll reveal
  const initScrollReveal = () => {
    if (isReduced) {
      document.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });
      });
      return;
    }

    const handled = new Set<HTMLElement>();

    document.querySelectorAll<HTMLElement>('[data-scroll-reveal-group]').forEach((group) => {
      const children = Array.from(
        group.querySelectorAll<HTMLElement>('[data-scroll-reveal]')
      );
      if (!children.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          once: true,
        },
      });

      children.forEach((child, index) => {
        handled.add(child);
        const mode = child.getAttribute('data-scroll-reveal');
        const hasFwh =
          child.hasAttribute('data-font-weight-hover') ||
          !!child.querySelector('[data-font-weight-hover]');

        gsap.set(child, { visibility: 'visible' });

        if (mode === 'element') {
          tl.fromTo(
            child,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' },
            index * 0.12
          );
          return;
        }

        const split = SplitText.create(child, {
          type: mode === 'chars' ? 'chars,words,lines' : 'lines,words',
          linesClass: 'line',
          charsClass: 'char',
          mask: 'lines',
          autoSplit: !hasFwh,
        });

        if (mode === 'chars' && split.chars) {
          splitCharsMap.set(child, split.chars as HTMLElement[]);
        }

        const targets = mode === 'chars' ? split.chars : split.lines;
        const stagger = mode === 'chars' ? 0.07 * 0.25 : 0.07;

        tl.from(
          targets,
          {
            yPercent: 135,
            duration: 1,
            ease: 'expo.out',
            stagger,
          },
          index * 0.12
        );
      });
    });

    document.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) => {
      if (handled.has(el)) return;
      const mode = el.getAttribute('data-scroll-reveal');
      const hasFwh =
        el.hasAttribute('data-font-weight-hover') ||
        !!el.querySelector('[data-font-weight-hover]');
      gsap.set(el, { visibility: 'visible' });

      if (mode === 'element') {
        gsap.fromTo(
          el,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
        return;
      }

      const split = SplitText.create(el, {
        type: mode === 'chars' ? 'chars,words,lines' : 'lines,words',
        linesClass: 'line',
        charsClass: 'char',
        mask: 'lines',
        autoSplit: !hasFwh,
      });
      if (mode === 'chars' && split.chars) {
        splitCharsMap.set(el, split.chars as HTMLElement[]);
      }
      const targets = mode === 'chars' ? split.chars : split.lines;
      const stagger = mode === 'chars' ? 0.07 * 0.25 : 0.07;
      gsap.from(targets, {
        yPercent: 135,
        duration: 1,
        ease: 'expo.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
  };

  // 6.5 Draw underline
  let variantCursor = Math.floor(Math.random() * DRAW_LINE_PATHS.length);
  const alwaysDrawCallbacks: Array<() => void> = [];

  const createLineSvg = (): { svg: SVGSVGElement; path: SVGPathElement } => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 310 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS(ns, 'path');
    const d = DRAW_LINE_PATHS[variantCursor % DRAW_LINE_PATHS.length];
    variantCursor += 1;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '10');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return { svg, path };
  };

  const initDrawLines = () => {
    document.querySelectorAll<HTMLElement>('[data-draw-line]').forEach((el) => {
      const box = el.querySelector<HTMLElement>('.draw-line-box');
      if (!box) return;
      const mode = el.getAttribute('data-draw-line');

      if (mode === 'always') {
        const triggerAlways = () => {
          if (box.childElementCount > 0) return;
          const { svg, path } = createLineSvg();
          box.appendChild(svg);
          if (isReduced) {
            gsap.set(path, { drawSVG: '0% 100%' });
          } else {
            gsap.set(path, { drawSVG: '0%' });
            gsap.to(path, {
              drawSVG: '100%',
              duration: 0.6,
              ease: 'power2.inOut',
            });
          }
        };
        alwaysDrawCallbacks.push(triggerAlways);
        return;
      }

      let currentSvg: SVGSVGElement | null = null;
      let isHovering = false;
      let isDrawingIn = false;

      const eraseLine = () => {
        if (!currentSvg) return;
        const svgToErase = currentSvg;
        const path = svgToErase.querySelector('path');
        if (!path) {
          svgToErase.remove();
          if (currentSvg === svgToErase) currentSvg = null;
          return;
        }
        gsap.to(path, {
          drawSVG: '100% 100%',
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            svgToErase.remove();
            if (currentSvg === svgToErase) {
              currentSvg = null;
            }
          },
        });
      };

      const onEnter = () => {
        isHovering = true;
        if (currentSvg) {
          gsap.killTweensOf(currentSvg.querySelector('path'));
          currentSvg.remove();
          currentSvg = null;
        }
        const { svg, path } = createLineSvg();
        currentSvg = svg;
        box.appendChild(svg);
        isDrawingIn = true;
        gsap.set(path, { drawSVG: '0%' });
        gsap.to(path, {
          drawSVG: '100%',
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            isDrawingIn = false;
            if (!isHovering) {
              eraseLine();
            }
          },
        });
      };

      const onLeave = () => {
        isHovering = false;
        if (!isDrawingIn) {
          eraseLine();
        }
      };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      cleanupFns.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    });
  };

  // 6.6 Font weight follows cursor
  const initFontWeightHover = () => {
    if (isTouch || isReduced) return;

    interface CharRecord {
      el: HTMLElement;
      rest: number;
      near: number;
      radius: number;
      cx: number;
      cy: number;
      lastTarget: number;
      quickTo: (val: number) => void;
    }

    const records: CharRecord[] = [];
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
    let lastScrollY = window.scrollY;

    const measureAll = () => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      for (let i = 0; i < records.length; i++) {
        const rec = records[i];
        const r = rec.el.getBoundingClientRect();
        rec.cx = r.left + r.width / 2 + sx;
        rec.cy = r.top + r.height / 2 + sy;
      }
    };

    const registerHeading = (heading: HTMLElement) => {
      let chars = splitCharsMap.get(heading);
      if (!chars) {
        const split = SplitText.create(heading, {
          type: 'chars,words',
          charsClass: 'char',
          autoSplit: false,
        });
        chars = split.chars as HTMLElement[];
      }

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const owner =
          (char.closest('[data-font-weight-hover]') as HTMLElement | null) || heading;
        const rest = Number(owner.dataset.fwhRest ?? 700);
        const near = Number(owner.dataset.fwhNear ?? 200);
        const radius = Number(owner.dataset.fwhRadius ?? 400);

        char.style.setProperty('--wght', String(rest));
        const computed = getComputedStyle(char).fontVariationSettings;
        if (computed && /['"]?wght['"]?/i.test(computed)) {
          char.style.fontVariationSettings = computed.replace(
            /(['"]?wght['"]?\s+)[\d.]+/i,
            '$1var(--wght)'
          );
        } else if (owner.classList.contains('alt-word')) {
          char.style.fontVariationSettings = '"wght" var(--wght), "wdth" 87.5, "opsz" 120';
        } else {
          char.style.fontVariationSettings = '"wght" var(--wght), "wdth" 72';
        }

        const quickTo = gsap.quickTo(char, '--wght', {
          duration: 0.4,
          ease: 'power2.out',
        });

        records.push({
          el: char,
          rest,
          near,
          radius,
          cx: 0,
          cy: 0,
          lastTarget: rest,
          quickTo,
        });
      }

      measureAll();
    };

    const topLevelFwh = Array.from(
      document.querySelectorAll<HTMLElement>('[data-font-weight-hover]')
    ).filter((el) => !el.parentElement?.closest('[data-font-weight-hover]'));

    topLevelFwh.forEach((heading) => {
      if (heading.hasAttribute('data-text-reveal')) {
        const onRevealDone = () => {
          registerHeading(heading);
        };
        heading.addEventListener('reveal:done', onRevealDone, { once: true });
        cleanupFns.push(() => heading.removeEventListener('reveal:done', onRevealDone));
      } else {
        registerHeading(heading);
      }
    });

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX + window.scrollX;
      pointerY = e.clientY + window.scrollY;
      hasPointer = true;
    };

    const onScroll = () => {
      const curY = window.scrollY;
      if (hasPointer) {
        pointerY += curY - lastScrollY;
      }
      lastScrollY = curY;
      measureAll();
    };

    const onResize = () => {
      measureAll();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    const tick = () => {
      if (!hasPointer) return;
      for (let i = 0; i < records.length; i++) {
        const rec = records[i];
        const d = Math.hypot(pointerX - rec.cx, pointerY - rec.cy);
        const f = d >= rec.radius ? 0 : 1 - d / rec.radius;
        const minW = Math.min(rec.rest, rec.near);
        const maxW = Math.max(rec.rest, rec.near);
        const target = Math.max(
          minW,
          Math.min(maxW, rec.rest + (rec.near - rec.rest) * f)
        );
        if (Math.abs(target - rec.lastTarget) >= 1) {
          rec.lastTarget = target;
          rec.quickTo(target);
        }
      }
    };

    gsap.ticker.add(tick);
    cleanupFns.push(() => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    });
  };

  // 6.7 Hero cursor card (desktop >= 992px with fine hover pointer)
  const initHeroCursorCard = () => {
    if (isTouch) return;
    const hero = document.querySelector<HTMLElement>('[data-cursor-cards]');
    const card = hero?.querySelector<HTMLElement>('.hero-card');
    const media = card?.querySelector<HTMLElement>('.hero-card-media');
    if (!hero || !card || !media) return;

    const crops = Array.from(card.querySelectorAll<HTMLElement>('.hero-card-crop'));
    const threshold = Number(hero.dataset.threshold ?? 300);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', () => {
      let currentIdx = 0;
      crops.forEach((c, idx) => c.classList.toggle('on', idx === 0));

      gsap.set(card, { autoAlpha: 0, x: 0, y: 0, rotation: 0 });
      gsap.set(media, { scale: 1.2, xPercent: 0, yPercent: 0 });

      const xTo = gsap.quickTo(card, 'x', { duration: 1, ease: 'power4' });
      const yTo = gsap.quickTo(card, 'y', { duration: 1, ease: 'power4' });
      const rotTo = gsap.quickTo(card, 'rotation', { duration: 1, ease: 'power4' });
      const mxTo = gsap.quickTo(media, 'xPercent', { duration: 0.6, ease: 'power2' });
      const myTo = gsap.quickTo(media, 'yPercent', { duration: 0.7, ease: 'power2' });

      let active = false;
      let lastX = 0;
      let lastY = 0;
      let travel = 0;
      let settleTimer: number | undefined;

      const clamp = (min: number, max: number, v: number) =>
        Math.max(min, Math.min(max, v));

      const onMove = (e: MouseEvent) => {
        if ((e.target as Element | null)?.closest('a, button')) {
          gsap.to(card, {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          return;
        }

        const heroRect = hero.getBoundingClientRect();
        const x = e.clientX - window.innerWidth / 2;
        const y = e.clientY - window.innerHeight / 2 - heroRect.top;

        if (!active) {
          active = true;
          lastX = x;
          lastY = y;
          gsap.set(card, { x, y });
          gsap.to(card, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
        } else {
          gsap.to(card, {
            autoAlpha: 1,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }

        const dx = (x - lastX) / 2;
        const dy = (y - lastY) / 2;
        const rot = (x - lastX) / 4;
        lastX = x;
        lastY = y;

        xTo(x);
        yTo(y);
        rotTo(rot);
        mxTo(-clamp(-8, 8, dx));
        myTo(-clamp(-8, 8, dy));

        travel += Math.abs(dx) + Math.abs(dy);
        if (travel > threshold) {
          travel = 0;
          crops[currentIdx]?.classList.remove('on');
          currentIdx = (currentIdx + 1) % crops.length;
          crops[currentIdx]?.classList.add('on');
        }

        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          rotTo(0);
          mxTo(0);
          myTo(0);
        }, 66);
      };

      const onLeave = () => {
        window.clearTimeout(settleTimer);
        active = false;
        travel = 0;
        rotTo(0);
        mxTo(0);
        myTo(0);
        gsap.to(card, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' });
      };

      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', onLeave);

      return () => {
        window.clearTimeout(settleTimer);
        hero.removeEventListener('mousemove', onMove);
        hero.removeEventListener('mouseleave', onLeave);
      };
    });

    cleanupFns.push(() => mm.revert());
  };

  // 6.8 Client marquee that flips with scroll direction
  const initMarquee = () => {
    if (isReduced) return;
    const marquee = document.querySelector<HTMLElement>('.hero-marquee');
    const wrap = marquee?.querySelector<HTMLElement>('.marquee-wrap');
    const baseCollection = wrap?.querySelector<HTMLElement>('.marquee-collection');
    if (!marquee || !wrap || !baseCollection) return;

    // Ensure exactly two clones exist
    while (wrap.querySelectorAll('.marquee-collection').length < 3) {
      const clone = baseCollection.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      wrap.appendChild(clone);
    }

    const collections = wrap.querySelectorAll<HTMLElement>('.marquee-collection');
    const vw = window.innerWidth;
    const f = vw <= 479 ? 0.25 : vw <= 991 ? 0.5 : 1;
    const collectionWidth = baseCollection.getBoundingClientRect().width || vw;
    const duration = 30 * (collectionWidth / vw) * f;
    const direction = -1; // left

    gsap.set(collections, { xPercent: 0 });
    const loop = gsap.to(collections, {
      xPercent: -100,
      repeat: -1,
      duration,
      ease: 'none',
    });
    loop.totalProgress(0.5);

    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self: any) => {
        const ts = self.direction === 1 ? -direction : direction;
        loop.timeScale(ts);
      },
    });

    gsap.fromTo(
      wrap,
      { x: '10vw' },
      {
        x: '-10vw',
        ease: 'none',
        scrollTrigger: {
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0,
        },
      }
    );
  };

  // 6.9 "Latest drops" 3D stack
  const initFeaturedStack = () => {
    const section = document.querySelector<HTMLElement>('[data-featured-stack]');
    const pinEl = section?.querySelector<HTMLElement>('.work-pin');
    const stackRoot = section?.querySelector<HTMLElement>('.work-stack');
    const slides = Array.from(section?.querySelectorAll<HTMLElement>('.work-slide') || []);
    const badge = section?.querySelector<HTMLElement>('.work-badge');
    if (!section || !pinEl || !stackRoot || slides.length < 2) return;

    const depth = 120;
    const offset = 40;
    const tiltX = 6;
    const tiltY = 10;
    const badgeSpin = 180;
    const scrollFactor = Number(section.dataset.scrollFactor ?? 1.2);
    const count = slides.length;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', () => {
      slides.forEach((slide, b) => {
        gsap.set(slide, {
          z: -b * depth,
          y: -b * offset,
          zIndex: count - b,
          autoAlpha: 1,
        });
      });

      const tl = gsap.timeline({ paused: true });

      for (let b = 0; b < count - 1; b++) {
        tl.to(
          slides[b],
          {
            y: `+=${window.innerHeight * 0.9}`,
            duration: 1,
            ease: 'power2.in',
          },
          b
        );
        tl.to(
          slides[b],
          {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'none',
          },
          b + 0.7
        );

        for (let j = b + 1; j < count; j++) {
          const nextIndex = j - b - 1;
          tl.to(
            slides[j],
            {
              z: -nextIndex * depth,
              y: -nextIndex * offset,
              duration: 1,
              ease: 'none',
            },
            b
          );
        }
      }

      if (badge) {
        tl.to(
          badge,
          {
            rotation: badgeSpin,
            duration: count - 1,
            ease: 'none',
          },
          0
        );
      }

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * scrollFactor * (count - 1)}`,
        pin: pinEl,
        pinSpacing: true,
        scrub: 0.3,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: any) => {
          tl.progress(self.progress);
        },
      });

      let cleanTilt: (() => void) | null = null;
      if (!isReduced && !isTouch) {
        const rxTo = gsap.quickTo(stackRoot, 'rotationX', {
          duration: 0.6,
          ease: 'power3',
        });
        const ryTo = gsap.quickTo(stackRoot, 'rotationY', {
          duration: 0.6,
          ease: 'power3',
        });

        const onMove = (e: MouseEvent) => {
          const r = pinEl.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rxTo(-ny * tiltX);
          ryTo(nx * tiltY);
        };

        const onLeave = () => {
          rxTo(0);
          ryTo(0);
        };

        pinEl.addEventListener('mousemove', onMove);
        pinEl.addEventListener('mouseleave', onLeave);
        cleanTilt = () => {
          pinEl.removeEventListener('mousemove', onMove);
          pinEl.removeEventListener('mouseleave', onLeave);
        };
      }

      return () => {
        st.kill();
        tl.kill();
        cleanTilt?.();
        gsap.set([...slides, stackRoot], { clearProps: 'all' });
        if (badge) gsap.set(badge, { clearProps: 'all' });
      };
    });

    cleanupFns.push(() => mm.revert());
  };

  // 6.10 "View case →" cursor label
  const initCursorMarquee = () => {
    if (isTouch) return;
    const labelWrap = document.querySelector<HTMLElement>('.cursor-marquee');
    const spans = labelWrap?.querySelectorAll<HTMLElement>('.cursor-marquee-span');
    if (!labelWrap || !spans || spans.length < 2) return;

    const xTo = gsap.quickTo(labelWrap, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(labelWrap, 'y', { duration: 0.4, ease: 'power3' });

    let lastClientX = -9999;
    let lastClientY = -9999;
    let hasMoved = false;
    let activeTarget: HTMLElement | null = null;
    let pauseTimer: number | undefined;

    const checkUnderPointer = () => {
      if (!hasMoved) return;
      const el = document
        .elementFromPoint(lastClientX, lastClientY)
        ?.closest<HTMLElement>('[data-cursor-marquee-text]') ?? null;

      if (el && el !== activeTarget) {
        activeTarget = el;
        const txt = el.getAttribute('data-cursor-marquee-text') || 'View case →';
        spans.forEach((s) => {
          s.textContent = txt;
        });
        labelWrap.style.setProperty('--marquee-dur', `${txt.length / 5}s`);
        window.clearTimeout(pauseTimer);
        labelWrap.setAttribute('data-cursor-marquee-playing', 'true');
        labelWrap.setAttribute('data-cursor-marquee-status', 'active');
      } else if (!el && activeTarget) {
        activeTarget = null;
        labelWrap.setAttribute('data-cursor-marquee-status', 'not-active');
        window.clearTimeout(pauseTimer);
        pauseTimer = window.setTimeout(() => {
          labelWrap.setAttribute('data-cursor-marquee-playing', 'false');
        }, 400);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(labelWrap, { x: lastClientX, y: lastClientY });
      } else {
        xTo(lastClientX);
        yTo(lastClientY);
      }
      checkUnderPointer();
    };

    const onScroll = () => {
      checkUnderPointer();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanupFns.push(() => {
      window.clearTimeout(pauseTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    });
  };

  // 6.11 Team photo parallax
  const initTeamParallax = () => {
    if (isReduced) return;
    const teamSection = document.querySelector<HTMLElement>('.team-section');
    const photos = Array.from(document.querySelectorAll<HTMLElement>('.team-photo'));
    if (!teamSection || !photos.length) return;

    const mm = gsap.matchMedia();
    const bindWithFactor = (k: number) => {
      const distance = 320 * k;
      const tweens = photos.map((photo) => {
        const speed = Number(photo.dataset.speed ?? 1);
        return gsap.fromTo(
          photo,
          { y: distance * speed },
          {
            y: -distance * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: teamSection,
              start: 'clamp(top bottom)',
              end: 'clamp(bottom top)',
              scrub: true,
              invalidateOnRefresh: true,
              refreshPriority: -1,
            },
          }
        );
      });
      return () => {
        tweens.forEach((tw) => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      };
    };

    mm.add('(min-width: 992px)', () => bindWithFactor(1));
    mm.add('(min-width: 480px) and (max-width: 991px)', () => bindWithFactor(0.5));
    mm.add('(max-width: 479px)', () => bindWithFactor(0.3));

    cleanupFns.push(() => mm.revert());
  };

  // 6.12 Momentum hover (InertiaPlugin)
  const initMomentumHover = () => {
    if (isReduced || isTouch) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-momentum-hover]'));
    if (!targets.length) return;

    let curX = 0;
    let curY = 0;
    let prevX = 0;
    let prevY = 0;
    let vx = 0;
    let vy = 0;
    let hasPointer = false;

    const onPointerMove = (e: PointerEvent) => {
      curX = e.clientX;
      curY = e.clientY;
      if (!hasPointer) {
        prevX = curX;
        prevY = curY;
        hasPointer = true;
      }
    };

    const tick = () => {
      if (!hasPointer) return;
      vx = curX - prevX;
      vy = curY - prevY;
      prevX = curX;
      prevY = curY;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    gsap.ticker.add(tick);

    const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

    const listeners: Array<{ el: HTMLElement; fn: () => void }> = [];
    targets.forEach((target) => {
      const onEnter = () => {
        if (!hasPointer) return;
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const F = curX - cx;
        const R = curY - cy;
        const dist = Math.hypot(F, R) || 1;
        const torque = (F * vy - R * vx) / dist;

        gsap.to(target, {
          inertia: {
            x: { velocity: clamp(-1080, 1080, vx * 30), end: 0 },
            y: { velocity: clamp(-1080, 1080, vy * 30), end: 0 },
            rotation: { velocity: clamp(-60, 60, torque * 20), end: 0 },
            resistance: 200,
          },
          overwrite: 'auto',
        });
      };
      target.addEventListener('mouseenter', onEnter);
      listeners.push({ el: target, fn: onEnter });
    });

    cleanupFns.push(() => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onPointerMove);
      listeners.forEach(({ el, fn }) => el.removeEventListener('mouseenter', fn));
    });
  };

  // 6.13 Page theme switch
  const initPageThemeSwitch = () => {
    document.querySelectorAll<HTMLElement>('[data-page-theme]').forEach((el) => {
      const theme = el.getAttribute('data-page-theme') || 'dark';
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        refreshPriority: -1,
        onToggle: (self: any) => {
          if (self.isActive) {
            document.documentElement.setAttribute('data-theme', theme);
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        },
      });
      cleanupFns.push(() => st.kill());
    });
  };

  const initPageSystems = () => {
    initScrollReveal();
    initDrawLines();
    initFontWeightHover();
    initHeroCursorCard();
    initMarquee();
    initFeaturedStack();
    initCursorMarquee();
    initTeamParallax();
    initMomentumHover();
    initPageThemeSwitch();
    ScrollTrigger.refresh();
  };

  // 6.2 Load sequence
  const readyPromise = Promise.race([
    document.fonts.ready,
    new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
  ]);

  let cancelled = false;
  cleanupFns.push(() => {
    cancelled = true;
  });

  readyPromise.then(() => {
    if (cancelled) return;
    window.clearTimeout(failsafeTimer);
    document.documentElement.setAttribute('data-page-ready', '');

    const main = document.querySelector<HTMLElement>('main');
    const wipe = document.querySelector<HTMLElement>('.load-wipe');
    const wipePath = wipe?.querySelector<SVGPathElement>('path');

    if (isReduced) {
      if (wipe) wipe.setAttribute('data-transition-ready', '');
      if (main) gsap.set(main, { autoAlpha: 1 });
      document
        .querySelectorAll<HTMLElement>('[data-text-reveal], [data-scroll-reveal]')
        .forEach((el) => gsap.set(el, { visibility: 'visible' }));
      initPageSystems();
      alwaysDrawCallbacks.forEach((fn) => fn());
      return;
    }

    const loadTl = gsap.timeline();
    if (main) {
      loadTl.set(main, { autoAlpha: 0 }, 0);
    }
    if (wipePath) {
      loadTl.set(
        wipePath,
        {
          drawSVG: '0% 100%',
          strokeWidth: '30%',
        },
        0
      );
    }

    loadTl.addLabel('reveal', 0.4);
    if (main) {
      loadTl.set(main, { autoAlpha: 1 }, 'reveal');
    }
    loadTl.call(
      () => {
        initTextReveal(0.6);
        initPageSystems();
      },
      [],
      'reveal'
    );

    if (wipePath) {
      loadTl.to(
        wipePath,
        {
          drawSVG: '100% 100%',
          strokeWidth: '5%',
          duration: 1.25,
          ease: 'power1.inOut',
          onComplete: () => {
            wipe?.setAttribute('data-transition-ready', '');
          },
        },
        'reveal'
      );
    }

    // ~1.3 s after init, hero link's always-on underline draws in (0.6 s)
    loadTl.call(
      () => {
        alwaysDrawCallbacks.forEach((fn) => fn());
      },
      [],
      'reveal+=1.3'
    );

    cleanupFns.push(() => loadTl.kill());
  });

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}
