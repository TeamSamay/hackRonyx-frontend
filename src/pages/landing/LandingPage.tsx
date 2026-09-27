import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gavel,
  HelpCircle,
  Lock,
  Menu,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useVelocity,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import Lenis from 'lenis';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { HeroScene } from './HeroScene';
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from '@/lib/gsap';
import { easeOutExpo, fadeUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { TRUST_STATE_META, type TrustStatus } from '@/types/verdict';

const trustOrder: TrustStatus[] = [
  'SUFFICIENT',
  'INCOMPLETE',
  'CONFLICTING',
  'LOW_QUALITY',
  'NEED_MORE_INFO',
  'REFUSE',
];

const trustIcons: Record<TrustStatus, typeof Lock> = {
  SUFFICIENT: CheckCircle2,
  INCOMPLETE: FileText,
  CONFLICTING: AlertTriangle,
  LOW_QUALITY: HelpCircle,
  NEED_MORE_INFO: ShieldCheck,
  REFUSE: XCircle,
};

const lightTone: Record<TrustStatus, string> = {
  SUFFICIENT: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
  INCOMPLETE: 'border-amber-200 bg-amber-50/80 text-amber-900',
  CONFLICTING: 'border-orange-200 bg-orange-50/80 text-orange-900',
  LOW_QUALITY: 'border-yellow-200 bg-yellow-50/80 text-yellow-900',
  NEED_MORE_INFO: 'border-sky-200 bg-sky-50/80 text-sky-900',
  REFUSE: 'border-rose-200 bg-rose-50/80 text-rose-900',
};

const nav = [
  { href: '#product', label: 'Product' },
  { href: '#gate', label: 'Decision Gate' },
  { href: '#pipeline', label: 'Pipeline' },
  { href: '#case', label: 'TX-92831' },
];

const sources = ['PostgreSQL', 'MySQL', 'Device telemetry', 'KYC files', 'Excel', 'CSV', 'REST APIs', 'PDF + OCR'];

const stats: Array<{ prefix?: string; to: number; suffix?: string; label: string }> = [
  { to: 6, label: 'Trust states, each with a required action' },
  { to: 9, label: 'Pipeline stages from source to packet' },
  { prefix: 'SHA-', to: 256, label: 'Lineage back to the source record' },
  { to: 100, suffix: '%', label: 'Read-only connectors — sources stay unchanged' },
];

const principles = [
  {
    index: '01',
    title: 'Read-only ingestion',
    body: 'PostgreSQL, MySQL, spreadsheets, KYC files, and REST endpoints arrive through authorized connectors. The gateway reads those systems and leaves them unchanged.',
  },
  {
    index: '02',
    title: 'Traceable Evidence Objects',
    body: 'Every claim keeps its subject, predicate, value, quality, and a path back to the table, page, or device record — with a SHA-256 hash.',
  },
  {
    index: '03',
    title: 'The gate holds the verdict',
    body: 'Retrieval and risk models inform the case. Python rules then lock one of six trust states, and the required action travels with that state.',
  },
];

const stages = [
  { n: '01', title: 'Sources', body: 'Banking databases, device telemetry, KYC files, and spreadsheet history.' },
  { n: '02', title: 'Gateway', body: 'Authorized connectors admit evidence and leave source systems unchanged.' },
  { n: '03', title: 'Normalize', body: 'Claims become Evidence Objects with quality scores and hashes.' },
  { n: '04', title: 'Retrieve', body: 'Retrieval pulls the claims that belong to this case.' },
  { n: '05', title: 'Score', body: 'Fraud and anomaly models attach a risk score and feature contributions.' },
  { n: '06', title: 'Contradict', body: 'Location, device, and identity clashes are caught in deterministic rules.' },
  { n: '07', title: 'Challenge', body: 'A counter-hypothesis is stress-tested before the state is final.' },
  { n: '08', title: 'Decide', body: 'The Decision Gate enforces one trust state and its required action.' },
  { n: '09', title: 'Deliver', body: 'A canonical Decision Packet opens in the analyst console.' },
];

const wordReveal: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.8, ease: easeOutExpo } },
};

const flipUp: Variants = {
  hidden: { opacity: 0, y: 48, rotateX: 38, transformPerspective: 900 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transformPerspective: 900,
    transition: { type: 'spring', stiffness: 140, damping: 20, mass: 0.9 },
  },
};

function wrapRange(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

const cardShadow =
  'shadow-[0_1px_2px_rgba(20,14,40,0.04),0_18px_40px_-18px_rgba(76,29,149,0.18)]';

const primaryBtn =
  'btn-shine inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_28px_-10px_rgba(109,40,217,0.65)] transition hover:shadow-[0_14px_34px_-10px_rgba(109,40,217,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500';

const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-800 backdrop-blur transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500';

export function LandingPage() {
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [intro, setIntro] = useState(!reduce);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLDivElement | null>(null);
  const attachScroller = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScrollerEl(node);
  }, []);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollY, scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 12));

  const { scrollYProgress: heroProgress } = useScroll({
    container: scrollRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const blobY = useTransform(heroProgress, [0, 1], [0, 160]);
  const blobYSlow = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0.25]);
  const previewY = useTransform(heroProgress, [0, 1], [0, -60]);

  useEffect(() => {
    const previous = document.title;
    document.title = 'VERDICT AI — Evidence in. Decision Packet out.';
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = contentRef.current;
    if (reduce || !wrapper || !content) return;
    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.95,
      anchors: { offset: -72 },
    });
    lenis.on('scroll', ScrollTrigger.update);
    return () => lenis.destroy();
  }, [reduce]);

  useEffect(() => {
    if (intro) return;
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [intro]);

  useEffect(() => {
    if (!intro) return;
    const timer = window.setTimeout(() => setIntro(false), 1300);
    return () => window.clearTimeout(timer);
  }, [intro]);

  function trackSpotlight(event: ReactPointerEvent<HTMLDivElement>) {
    const card = (event.target as HTMLElement).closest<HTMLElement>('.spotlight');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={attachScroller}
        id="top"
        className="relative h-full overflow-y-auto bg-[#fbfaff] text-slate-900 [color-scheme:light] selection:bg-violet-200"
        onPointerMove={trackSpotlight}
      >
        <LandingCursor />

        <AnimatePresence>
          {intro ? (
            <motion.div
              key="intro"
              aria-hidden
              className="fixed inset-0 z-[70] grid place-items-center bg-[#fbfaff]"
              initial={false}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              transition={{ duration: 0.9, ease: easeOutExpo }}
            >
              <motion.div
                className="flex flex-col items-center gap-5"
                initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.7, ease: easeOutExpo }}
              >
                <AnimatedOrb />
                <span className="text-sm font-semibold tracking-[0.32em] text-slate-900">VERDICT AI</span>
                <span className="h-px w-40 overflow-hidden rounded-full bg-slate-200">
                  <motion.span
                    className="block h-full origin-left bg-gradient-to-r from-violet-600 to-sky-400"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.1, ease: easeOutExpo }}
                  />
                </span>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400"
          style={{ scaleX: progress }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>

        <div ref={contentRef}>
        <header
          className={cn(
            'sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500',
            scrolled
              ? 'border-b border-slate-200/70 bg-white/75 shadow-[0_8px_30px_-18px_rgba(76,29,149,0.25)] backdrop-blur-xl'
              : 'border-b border-transparent bg-transparent',
          )}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <a href="#top" className="flex min-w-0 shrink items-center gap-2.5">
              <AnimatedOrb size="sm" />
              <span className="truncate text-sm font-semibold tracking-[0.14em] text-slate-900">VERDICT AI</span>
            </a>

            <nav
              className="hidden items-center gap-1 rounded-full border border-transparent p-1 md:flex"
              aria-label="Page"
              onPointerLeave={() => setHoveredNav(null)}
            >
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative rounded-full px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:text-slate-950"
                  onPointerEnter={() => setHoveredNav(item.href)}
                >
                  {hoveredNav === item.href ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_4px_16px_-6px_rgba(76,29,149,0.3)] ring-1 ring-violet-100"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link to="/console" className={cn(primaryBtn, 'px-3.5 sm:px-5')}>
                <span className="sm:hidden">Console</span>
                <span className="hidden sm:inline">Open console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 md:hidden"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {menuOpen ? (
              <motion.nav
                key="mobile-nav"
                aria-label="Page"
                className="overflow-hidden border-t border-slate-200/70 bg-white/90 backdrop-blur-xl md:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: easeOutExpo }}
              >
                <div className="flex flex-col px-5 py-3">
                  {nav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-2 py-3 text-sm text-slate-600 hover:bg-violet-50 hover:text-slate-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </header>

        <main id="main">
          <section ref={heroRef} className="relative -mt-16 overflow-hidden pt-16">
            <div aria-hidden className="landing-grid pointer-events-none absolute inset-0" />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-violet-300/40 blur-[110px]"
              style={{ y: blobY }}
              animate={reduce ? undefined : { x: [0, 40, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-32 top-10 h-[460px] w-[460px] rounded-full bg-sky-300/35 blur-[110px]"
              style={{ y: blobYSlow }}
              animate={reduce ? undefined : { x: [0, -36, 0], scale: [1.05, 1, 1.05] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/3 top-2/3 h-[320px] w-[320px] rounded-full bg-fuchsia-200/40 blur-[100px]"
              animate={reduce ? undefined : { y: [0, -30, 0], x: [0, 24, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-24"
              variants={staggerContainer}
              initial={reduce ? false : 'hidden'}
              animate={intro ? 'hidden' : 'show'}
              style={{ opacity: heroFade }}
            >
              <div>
                <motion.p
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-violet-700 backdrop-blur"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-600" />
                  </span>
                  Truth verification · Fraud analysis
                </motion.p>

                <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-6xl">
                  <RevealLine words={['Evidence', 'in.']} />
                  <RevealLine
                    words={['Decision', 'Packet', 'out.']}
                    wordClassName="gradient-shimmer bg-clip-text text-transparent"
                  />
                </h1>

                <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Files, databases, APIs, and device signals become traceable Evidence Objects. Models score the case.
                  The Decision Gate issues the state — and the action that state requires.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
                  <MagneticLink to="/console" className={primaryBtn}>
                    Open the console
                    <ArrowRight className="h-4 w-4" />
                  </MagneticLink>
                  <a href="#gate" className={secondaryBtn} data-cursor="Scroll">
                    <Gavel className="h-4 w-4 text-violet-600" />
                    Six trust states
                  </a>
                </motion.div>
              </div>

              <motion.aside
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.94, filter: 'blur(10px)' },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    transition: { duration: 1, ease: easeOutExpo, delay: 0.25 },
                  },
                }}
                style={{ y: previewY }}
                aria-label="Scripted walkthrough of case TX-92831 from evidence to decision"
                className="relative"
              >
                <HeroScene />
              </motion.aside>
            </motion.div>
          </section>

          <section aria-label="Supported sources" className="relative border-y border-slate-200/70 bg-white/60 py-5 backdrop-blur">
            <div className="marquee-mask overflow-hidden">
              <div className="marquee-track flex w-max gap-10 pr-10">
                {[...sources, ...sources].map((source, index) => (
                  <span
                    key={`${source}-${index}`}
                    aria-hidden={index >= sources.length}
                    className="inline-flex items-center gap-2.5 whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-slate-500"
                  >
                    <span className="h-1 w-1 rounded-full bg-violet-400" />
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20">
            <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger>
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={cn('spotlight rounded-3xl border border-slate-200/80 bg-white p-6', cardShadow)}
                >
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">
                    {stat.prefix}
                    <CountUp to={stat.to} />
                    {stat.suffix}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </Reveal>
          </section>

          <section aria-hidden className="relative overflow-hidden py-14 sm:py-20">
            <VelocityBand scrollY={scrollY} baseVelocity={-2.4} words={['Trace', 'Score', 'Contradict', 'Decide']} />
            <VelocityBand scrollY={scrollY} baseVelocity={2.4} words={['Evidence', 'Gate', 'Packet', 'Audit']} outlined />
          </section>

          <section id="product" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
            <SectionIntro
              kicker="Product"
              title="A decision you can defend in an audit."
              body="VERDICT separates what a model believes from what the evidence allows. Analysts receive one packet: the claims, the clashes, the score, and the state the gate enforced."
            />
            <Reveal className="mt-12 grid gap-4 lg:grid-cols-3" stagger>
              {principles.map((item) => (
                <motion.article
                  key={item.index}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={cn(
                    'spotlight group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6',
                    cardShadow,
                  )}
                >
                  <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-200/0 blur-2xl transition duration-500 group-hover:bg-violet-200/70" />
                  <div className="relative font-mono text-xs tracking-[0.18em] text-violet-600">{item.index}</div>
                  <h3 className="relative mt-4 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </motion.article>
              ))}
            </Reveal>
          </section>

          <ManifestoSection scroller={scrollerEl} />

          <section id="gate" className="relative scroll-mt-24 overflow-hidden border-y border-slate-200/70 bg-gradient-to-b from-violet-50/70 via-white to-white">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
              <SectionIntro
                kicker="Decision Gate"
                title="Six states. Each one names the next action."
                body="Quality, completeness, and contradictions are evaluated in rules. The gate then locks a trust state and the action that must follow."
              />
              <Reveal className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700">
                  <Lock className="h-3.5 w-3.5" />
                  LLM bypass protection enforced
                </div>
              </Reveal>
              <Reveal className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger>
                {trustOrder.map((status) => {
                  const meta = TRUST_STATE_META[status];
                  const Icon = trustIcons[status];
                  return (
                    <motion.article
                      key={status}
                      variants={flipUp}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className={cn('spotlight rounded-2xl border px-4 py-4', lightTone[status])}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <h3 className="text-sm font-semibold">{meta.label}</h3>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">{meta.action}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed opacity-80">{meta.blurb}</p>
                    </motion.article>
                  );
                })}
              </Reveal>
              <Reveal className="mt-8">
                <Link to="/console?section=decisions" className={secondaryBtn}>
                  Open the Trust Gate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
          </section>

          <PipelineSection scroller={scrollerEl} />

          <CaseSection scroller={scrollerEl} />

          <CtaSection scroller={scrollerEl} />
        </main>

        <footer className="border-t border-slate-200/70 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold tracking-[0.12em] text-slate-900">VERDICT AI</span>
            </div>
            <p className="text-sm text-slate-500">Evidence in. A Decision Packet you can audit.</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <a href="#gate" className="transition hover:text-violet-700">
                Decision Gate
              </a>
              <Link to="/console?section=connectors" className="transition hover:text-violet-700">
                Evidence vault
              </Link>
              <Link to="/console" className="transition hover:text-violet-700">
                Console
              </Link>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </MotionConfig>
  );
}

function RevealLine({ words, wordClassName }: { words: string[]; wordClassName?: string }) {
  return (
    <motion.span className="block" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.25em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
          <motion.span variants={wordReveal} className={cn('inline-block', wordClassName)}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

function LandingCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState<string | false>(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 480, damping: 36, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 480, damping: 36, mass: 0.5 });
  const auraX = useSpring(x, { stiffness: 70, damping: 20, mass: 0.8 });
  const auraY = useSpring(y, { stiffness: 70, damping: 20, mass: 0.8 });

  useEffect(() => {
    if (reduce) {
      setEnabled(false);
      return;
    }
    const query = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('landing-cursor-on');
    let rippleId = 0;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('a, button, [data-cursor]');
      setHover(target ? (target.dataset.cursor ?? '') : false);
    };
    const onDown = (event: PointerEvent) => {
      setPressed(true);
      const id = ++rippleId;
      setRipples((current) => [...current, { id, x: event.clientX, y: event.clientY }]);
    };
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerover', onOver);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.classList.remove('landing-cursor-on');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const hovering = hover !== false;
  const label = typeof hover === 'string' && hover.length > 0 ? hover : null;
  const ringSize = label ? 76 : hovering ? 52 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      <motion.div className="absolute left-0 top-0" style={{ x: auraX, y: auraY }}>
        <motion.div
          style={{ x: '-50%', y: '-50%' }}
          className="rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),rgba(56,189,248,0.12)_40%,transparent_70%)]"
          animate={{ width: hovering ? 460 : 360, height: hovering ? 460 : 360, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
        />
      </motion.div>

      <motion.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          style={{ x: '-50%', y: '-50%' }}
          className={cn(
            'grid place-items-center rounded-full border',
            hovering
              ? 'border-violet-500/40 bg-violet-500/10 backdrop-blur-[2px]'
              : 'border-violet-500/50 bg-transparent',
          )}
          animate={{
            width: ringSize,
            height: ringSize,
            scale: pressed ? 0.82 : 1,
            opacity: visible ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          <AnimatePresence>
            {label ? (
              <motion.span
                key={label}
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          style={{ x: '-50%', y: '-50%' }}
          className="h-1.5 w-1.5 rounded-full bg-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.8)]"
          animate={{ scale: hovering ? 0 : pressed ? 0.6 : 1, opacity: visible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute h-20 w-20 rounded-full border border-violet-500/60"
            style={{ left: ripple.x - 40, top: ripple.y - 40 }}
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            onAnimationComplete={() => setRipples((current) => current.filter((item) => item.id !== ripple.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function VelocityBand({
  scrollY,
  baseVelocity,
  words,
  outlined = false,
}: {
  scrollY: MotionValue<number>;
  baseVelocity: number;
  words: string[];
  outlined?: boolean;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smoothVelocity, [-2500, 2500], [10, -10]);
  const x = useTransform(baseX, (value) => `${wrapRange(-50, 0, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const boost = factor.get();
    if (boost < 0) direction.current = -1;
    else if (boost > 0) direction.current = 1;
    moveBy += direction.current * moveBy * boost;
    baseX.set(baseX.get() + moveBy);
  });

  const run = [...words, ...words];

  return (
    <div className="overflow-hidden whitespace-nowrap py-1">
      <motion.div className="flex w-max" style={{ x, skewX: skew }}>
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center">
            {run.map((word, index) => (
              <span
                key={`${copy}-${word}-${index}`}
                className={cn(
                  'flex items-center px-5 text-5xl font-semibold tracking-tight sm:px-8 sm:text-7xl',
                  outlined
                    ? 'text-transparent [-webkit-text-stroke:1.5px_rgba(109,40,217,0.35)]'
                    : 'text-slate-900/90',
                )}
              >
                {word}
                <span className="ml-10 inline-block h-3 w-3 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 sm:ml-16" />
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Reveal({ children, className, stagger = false }: { children: ReactNode; className?: string; stagger?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : fadeUp}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <Reveal className="max-w-2xl" stagger>
      <motion.p variants={fadeUp} className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-600">
        {kicker}
      </motion.p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        <RevealLine words={title.split(' ')} />
      </h2>
      <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-slate-600">
        {body}
      </motion.p>
    </Reveal>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const rounded = useTransform(value, (latest) => Math.round(latest).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 1.6, ease: easeOutExpo });
    return () => controls.stop();
  }, [inView, reduce, to, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function MagneticLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18 });
  const y = useSpring(0, { stiffness: 260, damping: 18 });

  function onMove(event: ReactPointerEvent<HTMLSpanElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span className="inline-flex" style={{ x, y }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <Link to={to} className={className} data-cursor="Open">
        {children}
      </Link>
    </motion.span>
  );
}

const manifesto =
  'Models inform the case. Rules decide it. Every trust state ships with the action it demands — and a path back to the evidence that forced it.';
const manifestoHighlights = new Set(['inform', 'decide', 'action', 'evidence']);

function ManifestoSection({ scroller }: { scroller: HTMLDivElement | null }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!scroller) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '.m-word',
          { opacity: 0.12, y: 14, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
          },
        );
        gsap.fromTo(
          '.m-orb',
          { yPercent: -40, rotate: -20 },
          {
            yPercent: 40,
            rotate: 40,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
        gsap.fromTo(
          '.m-kicker',
          { letterSpacing: '0.6em', opacity: 0 },
          {
            letterSpacing: '0.22em',
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top 85%', end: 'top 55%', scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [scroller] },
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-slate-200/70 bg-white py-24 sm:py-36">
      <div
        aria-hidden
        className="m-orb pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-[40%] bg-gradient-to-br from-violet-200/70 to-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="m-orb pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-[45%] bg-gradient-to-br from-fuchsia-200/50 to-violet-200/40 blur-3xl"
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <p className="m-kicker text-[11px] font-medium uppercase tracking-[0.22em] text-violet-600">Principle</p>
        <p className="mt-6 text-3xl font-semibold leading-[1.18] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          {manifesto.split(' ').map((word, index) => {
            const key = word.replace(/[^a-z]/gi, '').toLowerCase();
            return (
              <span
                key={`${word}-${index}`}
                className={cn(
                  'm-word mr-[0.25em] inline-block',
                  manifestoHighlights.has(key) && 'gradient-shimmer bg-clip-text text-transparent',
                )}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

function PipelineSection({ scroller }: { scroller: HTMLDivElement | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!scroller || !section || !viewport || !track) return;

      const mm = gsap.matchMedia();

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const distance = () => Math.max(track.scrollWidth - viewport.clientWidth, 0);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            scroller,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(barRef.current, { scaleX: self.progress });
              if (counterRef.current) {
                const current = Math.min(stages.length, Math.floor(self.progress * (stages.length - 0.001)) + 1);
                counterRef.current.textContent = String(current).padStart(2, '0');
              }
            },
          },
        });

        gsap.utils.toArray<HTMLElement>('.stage-card').forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.25, scale: 0.86, rotateY: -24, transformPerspective: 1000 },
            {
              opacity: 1,
              scale: 1,
              rotateY: 0,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, scroller, containerAnimation: tween, start: 'left 98%', end: 'left 62%', scrub: true },
            },
          );
          const digit = card.querySelector('.stage-digit');
          if (digit) {
            gsap.fromTo(
              digit,
              { xPercent: 30 },
              {
                xPercent: -30,
                ease: 'none',
                scrollTrigger: { trigger: card, scroller, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
              },
            );
          }
        });
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        gsap.set('.stage-card', { opacity: 0, y: 40 });
        ScrollTrigger.batch('.stage-card', {
          scroller,
          start: 'top 90%',
          once: true,
          onEnter: (cards) =>
            gsap.to(cards, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', overwrite: true }),
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [scroller] },
  );

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="relative scroll-mt-24 overflow-hidden bg-[#fbfaff] py-20 sm:py-28 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0 lg:pt-16"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            kicker="Pipeline"
            title="Nine stages. One packet."
            body="From the source system to the console, each stage has a job. Scoring happens before the gate. The gate happens before anyone treats the result as final."
          />
          <div className="hidden items-baseline gap-2 font-mono text-slate-400 lg:flex">
            <span ref={counterRef} className="text-6xl font-semibold tracking-tight text-slate-950">
              01
            </span>
            <span className="text-lg">/ {String(stages.length).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="mt-10 hidden h-1 overflow-hidden rounded-full bg-slate-200/70 lg:block">
          <div
            ref={barRef}
            className="h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400"
          />
        </div>
      </div>

      <div ref={viewportRef} className="mt-10">
        <div
          ref={trackRef}
          className="mx-auto grid max-w-6xl gap-3 px-5 sm:grid-cols-2 sm:px-8 lg:mx-0 lg:flex lg:w-max lg:max-w-none lg:gap-6 lg:pl-[max(2rem,calc((100vw_-_72rem)/2_+_2rem))] lg:pr-[18vw]"
        >
          {stages.map((stage) => (
            <article
              key={stage.n}
              className={cn(
                'stage-card spotlight group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 lg:h-[320px] lg:w-[360px] lg:shrink-0 lg:p-8',
                cardShadow,
              )}
            >
              <span
                aria-hidden
                className="stage-digit pointer-events-none absolute -bottom-10 right-2 select-none text-[160px] font-semibold leading-none tracking-tighter text-violet-100/80"
              >
                {stage.n}
              </span>
              <div className="relative flex items-center justify-between">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-mono text-xs text-violet-700">
                  Stage {stage.n}
                </span>
                <span className="h-2 w-2 rounded-full bg-slate-200 transition group-hover:bg-violet-500 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              </div>
              <h3 className="relative mt-6 text-2xl font-semibold tracking-tight text-slate-950">{stage.title}</h3>
              <p className="relative mt-3 max-w-[26ch] text-sm leading-relaxed text-slate-600">{stage.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseSection({ scroller }: { scroller: HTMLDivElement | null }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!scroller) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: '(min-width: 1024px)', ok: MOTION_OK }, (context) => {
        const { desktop, ok } = context.conditions as { desktop: boolean; ok: boolean };
        if (!ok) return;

        if (desktop) {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            scroller,
            start: 'top top',
            end: '+=100%',
            pin: true,
            anticipatePin: 1,
          });
        }

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller,
            start: desktop ? 'top 65%' : 'top 75%',
            end: desktop ? '+=135%' : 'bottom 70%',
            scrub: 1,
          },
        });

        timeline
          .from('.case-copy > *', { y: 50, opacity: 0, stagger: 0.12 })
          .from('.clash-left', { xPercent: -45, opacity: 0, rotate: -5 }, 0.15)
          .from('.clash-right', { xPercent: 45, opacity: 0, rotate: 5 }, 0.3)
          .from('.clash-line', { scaleX: 0 }, '>')
          .from('.clash-badge', { scale: 0.2, opacity: 0, ease: 'back.out(2.6)' }, '<0.15')
          .to('.clash-right', { boxShadow: '0 0 0 6px rgba(251,146,60,0.18)', borderColor: '#fdba74' }, '<')
          .from('.clash-metric', { y: 36, opacity: 0, stagger: 0.1 })
          .from('.clash-stamp', { scale: 2.6, opacity: 0, rotate: -22, ease: 'back.out(1.7)' })
          .from('.clash-route', { x: -20, opacity: 0 }, '<0.2')
          .to({}, { duration: 0.4 });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [scroller] },
  );

  return (
    <section
      ref={sectionRef}
      id="case"
      className="relative scroll-mt-24 overflow-hidden border-t border-slate-200/70 bg-white lg:flex lg:h-screen lg:items-center lg:pt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 h-[480px] w-[480px] -translate-y-1/2 translate-x-1/3 rounded-full bg-orange-100/50 blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-0">
        <div className="case-copy">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-600">Case TX-92831</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Mumbai on the ledger. Delhi on the device.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            An ₹85,000 transfer. Core banking places the terminal in Mumbai. Device telemetry places the handset in
            Delhi at the same time. KYC still reads Mumbai. The fraud model scores 0.91 and the anomaly model 0.84.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            The gate locks <span className="font-semibold text-orange-600">CONFLICTING</span> and routes the packet to
            human review.
          </p>
          <div>
            <Link to="/console?section=demo" className={cn(primaryBtn, 'mt-8')} data-cursor="Run">
              Run this case
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3">
          <ClaimRow className="clash-left" id="E-001" source="Core banking" claim="transaction_location" value="Mumbai" />

          <div className="flex items-center gap-3 px-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-600">
            <span className="clash-line h-px flex-1 origin-right bg-orange-300" />
            <span className="clash-badge inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Location clash
            </span>
            <span className="clash-line h-px flex-1 origin-left bg-orange-300" />
          </div>

          <ClaimRow
            className="clash-right"
            id="E-002"
            source="Device telemetry"
            claim="device_location"
            value="Delhi"
            highlight
          />

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Metric className="clash-metric" label="Fraud" value="0.91" />
            <Metric className="clash-metric" label="Anomaly" value="0.84" />
            <Metric className="clash-metric" label="Completeness" value="0.88" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Gate verdict</span>
            <span className="clash-stamp inline-block -rotate-3 rounded-xl border-2 border-orange-500 px-3 py-1 text-xl font-bold tracking-tight text-orange-600">
              CONFLICTING
            </span>
            <span className="clash-route inline-flex items-center gap-1.5 font-mono text-xs text-orange-700">
              <ArrowRight className="h-3.5 w-3.5" />
              HUMAN_REVIEW
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection({ scroller }: { scroller: HTMLDivElement | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (!scroller) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '.cta-card',
          { clipPath: 'inset(14% 10% 14% 10% round 64px)', scale: 0.92 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 32px)',
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top 95%', end: 'top 35%', scrub: 0.8 },
          },
        );
        gsap.fromTo(
          '.cta-inner > *',
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top 75%', end: 'top 35%', scrub: 0.8 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [scroller] },
  );

  return (
    <section ref={sectionRef} className="px-5 pb-20 pt-4 sm:px-8 sm:pb-28">
      <div className="cta-card relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 px-6 py-14 text-white sm:px-12 sm:py-20">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl"
          animate={reduce ? undefined : { x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="cta-inner relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/75">Console</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Open the case. Read the packet.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Decision chat, the evidence vault, the trust gate, and the audit workspace are wired to the same contract.
            </p>
          </div>
          <MagneticLink
            to="/console"
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-[0_14px_34px_-12px_rgba(15,10,40,0.45)]"
          >
            Enter VERDICT AI
            <ArrowRight className="h-4 w-4" />
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}

function ClaimRow({
  id,
  source,
  claim,
  value,
  highlight = false,
  className,
}: {
  id: string;
  source: string;
  claim: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'spotlight flex items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-4',
        highlight ? 'border-orange-200' : 'border-slate-200/80',
        cardShadow,
        className,
      )}
    >
      <div>
        <div className="font-mono text-[11px] text-violet-600">
          {id} · {source}
        </div>
        <div className="mt-1 text-sm text-slate-500">{claim}</div>
      </div>
      <div className={cn('text-lg font-semibold tracking-tight', highlight ? 'text-orange-600' : 'text-slate-950')}>
        {value}
      </div>
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5', className)}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
