import { useRef, useState, type FC } from "react";
import { gsap, SplitText, useGSAP } from "./lib/gsap";


/* ========================= EDITE AQUI ========================= */
const CONTENT = {
  name: "Kawê Kleber",          // Nome exibido no hero principal
  initials: ["K", "C"] as const,
  cropped: "PARABÉNS",
  headline: ["FEITO PELO", "SEU IRMÂO"] as const,
  splash: {
    eyebrow: "UMA HOMENAGEM ESPECIAL",
    word: "PARABÉNS",
  },
  nav: [
    { label: "HOMENAGEM", href: "#homenagem" },
    { label: "FESTA", href: "#festa" },
    { label: "INÍCIO", href: "#topo" },
  ],
  paragraphs: [
    "Bom, eu não sei como designar esse texto, mas é uma homenagem a você, meu irmão. Eu sei que você não gosta de muitas palavras, então vou tentar ser breve.",
    "Estamos contigo, eu e mamãe, e queremos que você saiba que te amamos muito. Que você viva como mais um dia, pois sabemos que não és fã de comemorações, apenas persita em busca de seus o objetivos, e estaremos sempre a te apoiando em cada decisão que você tomar",
  ],
  footer: {
    dedication: "Com todo amor da sua família.",
    signature: "Feito pelo seu irmão",
    year: "2026",
  },
};

/* ============================================================== */

/*
 * TOKENS TIPOGRÁFICOS
 * Sem --fs nem clamp: tamanhos explícitos por breakpoint via Tailwind.
 */

/** Palavra decorativa gigante no topo/rodapé (PARABÉNS cortado) */
const DISPLAY_WORD =
  "font-display uppercase text-white tracking-tight leading-none select-none";

/** Headline de seção (NO SEU / GRANDE DIA) */
const HEADLINE =
  "font-display uppercase text-white leading-[1.05] tracking-tight";


/** Corpo de texto */
const READ =
  "font-sans text-base font-medium leading-relaxed text-white/90 md:text-lg [text-wrap:pretty]";

/** Padding vertical da máscara SplitText (evita corte de acentos) */
const MASK_PAD = "[&_.split-mask]:py-[0.18em] [&_.split-mask]:-my-[0.18em]";

/* ------------------------------------------------------------------ */
/*  PARABÉNS quase completo — apenas as extremidades levemente cortadas */
/* ------------------------------------------------------------------ */
const Sliver: FC<{ text: string; edge: "top" | "bottom" }> = ({ text, edge }) => {
  /*
   * Altura ≈ 92% da linha real → corta ~8% da borda externa.
   * Nenhum translate além disso: a palavra aparece quase inteira,
   * com um corte sutil e quase imperceptível nas bordas.
   */
  const isTop = edge === "top";
  return (
    <div
      aria-hidden="true"
      data-sliver={edge}
      className={[
        "w-full overflow-hidden",
        // alturas ajustadas: quase o tamanho da fonte real, cortando só as bordas
        isTop
          ? "h-[4.6rem] sm:h-[7.4rem] md:h-[10.2rem] lg:h-[13.9rem] xl:h-[16.6rem]"
          : "h-[4.6rem] sm:h-[7.4rem] md:h-[10.2rem] lg:h-[13.9rem] xl:h-[16.6rem]",
      ].join(" ")}
    >
      {/* translate sutil apenas para alinhar topo vs rodapé */}
      <div className={isTop ? "-translate-y-[0.00em]" : "translate-y-[0.00em]"}>
        <span
          data-word
          className={`block w-full text-center text-[5rem] sm:text-[8rem] md:text-[11rem] lg:text-[15rem] xl:text-[18rem] ${DISPLAY_WORD}`}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Linha do headline — overflow seguro, sem margens negativas         */
/* ------------------------------------------------------------------ */
const GiantLine: FC<{ text: string }> = ({ text }) => (
  <span data-line className="block overflow-hidden">
    <span
      data-line-inner
      className={`block py-1 text-[2.8rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] xl:text-[8.5rem] ${HEADLINE}`}
    >
      {text}
    </span>
  </span>
);

/* ------------------------------------------------------------------ */
/*  Splash Screen — abertura editorial no mesmo tema do projeto        */
/* ------------------------------------------------------------------ */
const SplashScreen: FC<{ onDone: () => void }> = ({ onDone }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [left, right] = CONTENT.initials;

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        onDone();
        return;
      }

      const tl = gsap.timeline({
        onComplete: onDone,
      });

      tl.from("[data-splash-eyebrow]", {
        yPercent: 100,
        opacity: 0,
        duration: 0.55,
        ease: "editorial",
      })
        .from(
          "[data-splash-initials]",
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.7,
            ease: "editorial",
          },
          "-=0.35",
        )
        .from(
          "[data-splash-word]",
          {
            yPercent: 105,
            duration: 0.75,
            ease: "poster",
          },
          "-=0.45",
        )
        .fromTo(
          "[data-splash-bar]",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.85,
            ease: "poster",
          },
          "-=0.4",
        )
        .to(overlay, {
          yPercent: -100,
          duration: 0.85,
          ease: "poster",
          delay: 0.15,
        });
    },
    { scope: overlayRef },
  );

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label="Carregando homenagem"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-brand px-6 text-white"
    >
      {/* Iniciais sutis ao fundo, combinando com a seção Homenagem */}
      <span
        aria-hidden="true"
        data-splash-initials
        className="pointer-events-none select-none font-script text-[9rem] font-normal italic leading-none text-white/15 sm:text-[13rem] md:text-[16rem]"
      >
        {left}&thinsp;{right}
      </span>

      {/* Bloco central sobreposto */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="overflow-hidden">
          <p
            data-splash-eyebrow
            className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-white/75 sm:text-xs"
          >
            {CONTENT.splash.eyebrow}
          </p>
        </div>

        <div className="overflow-hidden">
          <span
            data-splash-word
            className="block font-display text-[3.25rem] uppercase leading-none tracking-tight text-white sm:text-[5rem] md:text-[6.5rem]"
          >
            {CONTENT.splash.word}
          </span>
        </div>

        {/* Barra de progresso editorial */}
        <div className="mt-2 h-px w-36 overflow-hidden bg-white/25 sm:w-48">
          <div
            data-splash-bar
            className="h-full w-full origin-left bg-white"
          />
        </div>
      </div>
    </div>
  );
};

const Appx: FC = () => {
  const root = useRef<HTMLElement>(null);
  const [left, right] = CONTENT.initials;
  const [splashDone, setSplashDone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      el.setAttribute("data-pending", "");
      let cancelled = false;
      let mm: gsap.MatchMedia | undefined;

      const fontsReady = Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);

      fontsReady.then(() => {
        if (cancelled) return;

        mm = gsap.matchMedia(el);
        mm.add(
          {
            reduce: "(prefers-reduced-motion: reduce)",
            wide: "(min-width: 1024px)",
          },
          (ctx) => {
            const { reduce, wide } = ctx.conditions as { reduce: boolean; wide: boolean };

            const one = <T extends HTMLElement = HTMLElement>(s: string) =>
              el.querySelector<T>(s)!;
            const all = (s: string) => gsap.utils.toArray<HTMLElement>(s, el);

            /* ===== Rolagem suave para âncoras ===== */
            const onClick = (e: MouseEvent) => {
              const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
              const id = a?.getAttribute("href")?.slice(1);
              const target = id ? document.getElementById(id) : null;
              if (!id || !target) return;

              e.preventDefault();
              gsap.to(window, {
                scrollTo: { y: target, autoKill: true },
                duration: reduce ? 0 : 1.2,
                ease: "power2.inOut",
                onComplete: () => {
                  history.pushState(null, "", `#${id}`);
                  target.focus({ preventScroll: true });
                },
              });
            };
            document.addEventListener("click", onClick);
            const cleanup = () => document.removeEventListener("click", onClick);

            if (reduce) return cleanup;

            /* ===== 1 · ABERTURA — PARABÉNS top + nome ===== */
            const navSplit = SplitText.create(all("[data-nav] a"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
            });

            gsap
              .timeline({
                defaults: { ease: "power3.out" },
                delay: splashDone ? 0 : 1.75,
              })
              .from(one("[data-sliver='top'] [data-word]"), {
                yPercent: 105,
                duration: 1.4,
                ease: "power4.out",
              }, 0.1)
              .from(one("[data-hero-name]"), {
                yPercent: 40,
                opacity: 0,
                duration: 1.1,
                ease: "power3.out",
              }, 0.3)
              .from(navSplit.lines, { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.8);

            /* ===== 2 · HOMENAGEM — scrub progressivo ===== */
            const homenagem = one("#homenagem");

            // Iniciais: animam conforme o scroll entra na seção (scrub)
            all("[data-initial]").forEach((node) => {
              const side = (node as HTMLElement).dataset.initial;
              const fromX = side === "left" ? "-8vw" : "8vw";
              gsap.fromTo(
                node,
                { opacity: 0, x: fromX },
                {
                  opacity: 1,
                  x: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: homenagem,
                    start: "top 90%",
                    end: "top 30%",
                    scrub: 1.2,
                  },
                },
              );
            });

            // Parallax vertical nas iniciais do desktop (discreto)
            if (wide) {
              all("[data-initial='left']").forEach((node) =>
                gsap.to(node, {
                  yPercent: -12,
                  ease: "none",
                  scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
                }),
              );
              all("[data-initial='right']").forEach((node) =>
                gsap.to(node, {
                  yPercent: 12,
                  ease: "none",
                  scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
                }),
              );
            }

            // Parágrafos: cada linha sobe conforme o scroll avança (scrub progressivo)
            SplitText.create(all("[data-para]"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
              autoSplit: true,
              onSplit: (self) =>
                self.lines.forEach((line, i) =>
                  gsap.fromTo(
                    line,
                    { yPercent: 110, opacity: 0 },
                    {
                      yPercent: 0,
                      opacity: 1,
                      ease: "none",
                      scrollTrigger: {
                        trigger: line,
                        start: "top 95%",
                        end: "top 55%",
                        scrub: 0.8 + i * 0.05,
                      },
                    },
                  ),
                ),
            });

            /* ===== 3 · FESTA — headline scrub ===== */
            const festa = one("#festa");

            // Cada linha do headline: sobe com scrub individual
            all("[data-line-inner]").forEach((inner, i) => {
              gsap.fromTo(
                inner,
                { yPercent: 110, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: festa,
                    start: "top 85%",
                    end: `top ${45 - i * 10}%`,
                    scrub: 1,
                  },
                },
              );
            });

            // Slide horizontal das linhas com scrub
            const slide = wide ? 8 : 4;
            all("[data-line]").forEach((line, i) => {
              gsap.fromTo(
                line,
                { xPercent: i % 2 === 0 ? -slide : slide },
                {
                  xPercent: 0,
                  ease: "none",
                  scrollTrigger: { trigger: festa, start: "top bottom", end: "center center", scrub: true },
                },
              );
            });

            // PARABÉNS rodapé sobe com scrub (se existir no DOM)
            const bottomWord = el.querySelector<HTMLElement>("[data-sliver='bottom'] [data-word]");
            if (bottomWord) {
              gsap.fromTo(
                bottomWord,
                { yPercent: 60 },
                {
                  yPercent: 0,
                  ease: "none",
                  scrollTrigger: { trigger: festa, start: "top 80%", end: "bottom bottom", scrub: true },
                },
              );
            }

            /* ===== 4 · FOOTER ===== */
            const footer = el.querySelector<HTMLElement>("[data-footer]");
            if (footer) {
              gsap.fromTo(
                footer.querySelectorAll("[data-footer-item]"),
                { y: 24, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.1,
                  ease: "editorial",
                  scrollTrigger: { trigger: footer, start: "top 90%", once: true },
                },
              );
            }

            return cleanup;
          },
        );

        el.removeAttribute("data-pending");
      });

      return () => {
        cancelled = true;
        mm?.revert();
      };
    },
    { scope: root },
  );

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <main
        ref={root}
        data-pending=""
        className="w-full overflow-x-hidden bg-brand text-white"
      >
      {/* ════════════════════════════════════════
          SEÇÃO 1 · INÍCIO — Hero com nome do aniversariante
          ════════════════════════════════════════ */}
      <section id="topo" tabIndex={-1} data-hide className="focus:outline-none">

        {/* PARABÉNS — faixa topo, quase completa */}
        <Sliver text={CONTENT.cropped} edge="top" />

        {/* ── Hero central: nome em fonte script ── */}
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center md:gap-5 md:py-14 lg:py-20">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-sm">
            Feliz Aniversário
          </p>
          <h1
            data-hero-name
            className="font-script text-[4.5rem] font-normal italic leading-none text-white sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem]"
          >
            {CONTENT.name}
          </h1>
          <div className="mt-2 h-px w-16 bg-white/30 md:w-24" />
        </div>

        {/* ── Nav ── 
        <div className="border-t border-white/20">
          <nav data-nav aria-label="Principal">
            <ul className={`flex items-center justify-center gap-8 px-6 py-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-white sm:gap-12 sm:text-sm md:gap-16 md:py-5 md:text-base ${MASK_PAD}`}>
              {CONTENT.nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="relative inline-block pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        
        */}
   
      </section>

      {/* ════════════════════════════════════════
          SEÇÃO 2 · HOMENAGEM
          ════════════════════════════════════════ */}
      <section
        id="homenagem"
        tabIndex={-1}
        data-hide
        className="focus:outline-none"
      >
        {/*
         * LAYOUT MOBILE: a seção tem position:relative e as iniciais ficam
         * absolutas atrás do texto — decorativas, espalhadas pelos cantos,
         * com baixa opacidade para não disputar foco com o conteúdo.
         *
         * LAYOUT md+: grid 3 colunas normal [inicial · texto · inicial].
         */}
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-16 lg:py-32">

          {/* ── Iniciais decorativas no mobile (absolutas, atrás do texto) ── */}
          {/* Canto superior esquerdo */}
          <span
            aria-hidden="true"
            data-initial="left"
            className="pointer-events-none absolute -top-4 -left-2 select-none font-script text-[7rem] font-normal italic leading-none text-white/15 md:hidden"
          >
            {left}
          </span>
          {/* Canto inferior direito */}
          <span
            aria-hidden="true"
            data-initial="right"
            className="pointer-events-none absolute -bottom-4 -right-2 select-none font-script text-[7rem] font-normal italic leading-none text-white/15 md:hidden"
          >
            {right}
          </span>

          {/* ── Grid para md+ (iniciais visíveis nas laterais) ── */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,1fr)] md:items-center md:gap-8 lg:gap-14">

            {/* Inicial esquerda — só no md+ */}
            <div className="hidden md:flex md:items-center md:justify-center">
              <span
                aria-hidden="true"
                data-initial="left"
                className="block select-none font-script text-[9rem] font-normal italic leading-none text-white lg:text-[11rem]"
              >
                {left}
              </span>
            </div>

            {/* Parágrafos centrais */}
            <div data-paras className="relative z-10 flex flex-col gap-6">
              {CONTENT.paragraphs.map((text) => (
                <p
                  key={text}
                  data-para
                  className={`hyphens-auto ${READ} ${MASK_PAD}`}
                >
                  {text}
                </p>
              ))}
            </div>

            {/* Inicial direita — só no md+ */}
            <div className="hidden md:flex md:items-center md:justify-center">
              <span
                aria-hidden="true"
                data-initial="right"
                className="block select-none font-script text-[9rem] font-normal italic leading-none text-white lg:text-[11rem]"
              >
                {right}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SEÇÃO 3 · FESTA
          ════════════════════════════════════════ */}
      <section
        id="festa"
        tabIndex={-1}
        data-hide
        className="focus:outline-none"
      >
        <div className="overflow-hidden px-4 pt-10 pb-12 text-center md:pt-16 md:pb-20">
          <h2 className="inline-block">
            {CONTENT.headline.map((line) => (
              <GiantLine key={line} text={line} />
            ))}
          </h2>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER — Editorial no tema da página
          ════════════════════════════════════════ */}
      <footer
        data-footer
        className="border-t border-white/20 bg-brand text-white"
      >
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            {/* Bloco esquerdo: iniciais + nome + dedicatória */}
            <div data-footer-item className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-script text-4xl italic leading-none text-white sm:text-5xl">
                  {CONTENT.name}
                </span>
                <span
                  aria-hidden="true"
                  className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
                >
                  {left}·{right}
                </span>
              </div>
              <p className="font-sans text-sm font-medium text-white/75 md:text-base">
                {CONTENT.footer.dedication}
              </p>
            </div>

            {/* Bloco direito: navegação rápida + voltar ao topo */}
            <nav
              data-footer-item
              aria-label="Rodapé"
              className="flex flex-wrap items-center gap-6 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-white/90 sm:gap-8"
            >
              {CONTENT.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative inline-block pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#topo"
                aria-label="Voltar ao topo"
                className="inline-flex items-center gap-1.5 border border-white/30 px-3 py-1.5 text-[0.7rem] tracking-[0.16em] transition-colors duration-200 hover:border-white hover:bg-white hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                TOPO ↑
              </a>
            </nav>
          </div>

          {/* Barra inferior: assinatura + ano */}
          <div
            data-footer-item
            className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/15 pt-6 font-sans text-xs uppercase tracking-[0.16em] text-white/60 sm:flex-row sm:items-center"
          >
            <span>{CONTENT.footer.signature}</span>
            <span>{CONTENT.cropped} · {CONTENT.footer.year}</span>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
};

export default Appx;