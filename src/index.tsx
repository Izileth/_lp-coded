import { useRef, type FC } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "./lib/gsap";


/* ========================= EDITE AQUI ========================= */
const CONTENT = {
  initials: ["K", "C"] as const,
  cropped: "PARABÉNS",
  headline: ["NO SEU", "GRANDE DIA"] as const,
  nav: [
    { label: "HOMENAGEM", href: "#homenagem" },
    { label: "FESTA", href: "#festa" },
    { label: "INÍCIO", href: "#topo" },
  ],
  paragraphs: [
    "No sábado à tarde a família inteira se reúne. Os balões já estão no ar, o bolo espera na mesa e todo mundo aguarda o momento de abraçar o aniversariante. Entre risadas, fotos e uma conversa rápida com os amigos de sempre, chega a hora de acender as velas, fazer um pedido e respirar fundo. Quando começam os parabéns, o novo capítulo dessa história começa.",
    "Ao olharmos para trás, depois de tantos anos, sentamos com ele para entender o que passa em seu coração neste novo ciclo. Uma jornada que até aqui entregou muitas conquistas, viagens, brincadeiras, lutas vencidas, memórias inesquecíveis e uma amizade que não cabe em nenhum cartão de aniversário.",
  ],
};

const SECTIONS = [
  { id: "topo", label: "Início" },
  { id: "homenagem", label: "Homenagem" },
  { id: "festa", label: "Festa" },
] as const;


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

/** Nav links */
const NAV_ITEM =
  "font-sans text-xs font-semibold uppercase tracking-[0.12em] text-white sm:text-sm md:text-base";

/** Corpo de texto */
const READ =
  "font-sans text-base font-medium leading-relaxed text-white/90 md:text-lg [text-wrap:pretty]";

/** Padding vertical da máscara SplitText (evita corte de acentos) */
const MASK_PAD = "[&_.split-mask]:py-[0.18em] [&_.split-mask]:-my-[0.18em]";

/* ------------------------------------------------------------------ */
/*  PARABÉNS cortado: só mostra a borda superior ou inferior da letra  */
/* ------------------------------------------------------------------ */
const Sliver: FC<{ text: string; edge: "top" | "bottom" }> = ({ text, edge }) => {
  /*
   * Estratégia sem variável CSS:
   * - Container tem altura fixa (px) por breakpoint — suficiente para ver
   *   o topo ou o rodapé das letras Anton sem sobreposição.
   * - A palavra é posicionada com translate para mostrar apenas a fatia certa.
   */
  const isTop = edge === "top";
  return (
    <div
      aria-hidden="true"
      data-sliver={edge}
      className={[
        "w-full overflow-hidden",
        isTop
          ? "h-14 sm:h-20 md:h-28 lg:h-36 xl:h-44"
          : "h-16 sm:h-24 md:h-32 lg:h-40 xl:h-52",
      ].join(" ")}
    >
      <div className={isTop ? '-translate-y-[0.08em]' : 'translate-y-[0.08em]'  }>
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
/*  Iniciais decorativas em script                                     */
/* ------------------------------------------------------------------ */
const Initial: FC<{ letter: string; side: "left" | "right" }> = ({ letter, side }) => (
  <span
    aria-hidden="true"
    data-initial={side}
    className="block select-none font-script text-[5rem] font-normal italic leading-none text-white sm:text-[7rem] md:text-[9rem] lg:text-[11rem]"
  >
    {letter}
  </span>
);

const Appx: FC = () => {
  const root = useRef<HTMLElement>(null);
  const [left, right] = CONTENT.initials;

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

            /* ===== Pontinhos laterais ===== */
            const dots = all("a[data-dot]");
            const setActive = (id: string) =>
              dots.forEach((a) => {
                const on = a.dataset.dot === id;
                a.dataset.active = String(on);
                if (on) a.setAttribute("aria-current", "true");
                else a.removeAttribute("aria-current");
              });

            SECTIONS.forEach(({ id }) =>
              ScrollTrigger.create({
                trigger: `#${id}`,
                start: "top 50%",
                end: "bottom 50%",
                onToggle: (self) => self.isActive && setActive(id),
              }),
            );

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
                ease: "poster",
                onComplete: () => {
                  history.pushState(null, "", `#${id}`);
                  target.focus({ preventScroll: true });
                },
              });
            };
            document.addEventListener("click", onClick);
            const cleanup = () => document.removeEventListener("click", onClick);

            // Movimento reduzido: tudo estático e legível
            if (reduce) return cleanup;

            /* ===== 1 · ABERTURA ===== */
            const navSplit = SplitText.create(all("[data-nav] a"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
            });

            gsap
              .timeline({ defaults: { ease: "editorial" } })
              .from(one("[data-sliver='top'] [data-word]"), {
                yPercent: 105,
                duration: 1.4,
                ease: "poster",
              }, 0.1)
              .from(navSplit.lines, { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.7);

            /* ===== 2 · HOMENAGEM ===== */
            const homenagem = one("#homenagem");
            const leftInitial = one("[data-initial='left']");
            const rightInitial = one("[data-initial='right']");
            const OPEN = "inset(-30% -30% -30% -30%)";

            gsap.fromTo(
              leftInitial,
              { clipPath: "inset(-30% 100% -30% -30%)", x: "-6vw" },
              {
                clipPath: OPEN,
                x: 0,
                duration: 1.6,
                ease: "poster",
                scrollTrigger: { trigger: homenagem, start: "top 75%", once: true },
              },
            );
            gsap.fromTo(
              rightInitial,
              { clipPath: "inset(-30% -30% -30% 100%)", x: "6vw" },
              {
                clipPath: OPEN,
                x: 0,
                duration: 1.6,
                delay: 0.12,
                ease: "poster",
                scrollTrigger: { trigger: homenagem, start: "top 75%", once: true },
              },
            );

            // Parallax só no desktop e bem discreto
            if (wide) {
              gsap.to(leftInitial, {
                yPercent: -10,
                ease: "none",
                scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
              });
              gsap.to(rightInitial, {
                yPercent: 10,
                ease: "none",
                scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
              });
            }

            // Parágrafos linha a linha (re-divide ao redimensionar)
            SplitText.create(all("[data-para]"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 1.1,
                  ease: "editorial",
                  stagger: 0.04,
                  scrollTrigger: { trigger: homenagem, start: "top 70%", once: true },
                }),
            });

            /* ===== 3 · FESTA ===== */
            const festa = one("#festa");

            gsap.from(all("[data-line-inner]"), {
              yPercent: 110,
              duration: 1.3,
              ease: "editorial",
              stagger: 0.12,
              scrollTrigger: { trigger: festa, start: "top 70%", once: true },
            });

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

            gsap.fromTo(
              one("[data-sliver='bottom'] [data-word]"),
              { yPercent: 100 },
              {
                yPercent: 0,
                ease: "none",
                scrollTrigger: { trigger: festa, start: "top 70%", end: "bottom bottom", scrub: true },
              },
            );

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
    <main
      ref={root}
      data-pending=""
      className="w-full overflow-x-hidden bg-brand text-white"
    >
      {/* ════════════════════════════════════════
          INDICADOR LATERAL DE SEÇÃO (pontinhos)
          ════════════════════════════════════════ */}
      <nav
        aria-label="Seções"
        className="fixed right-3 top-1/2 z-50 -translate-y-1/2 md:right-5"
      >
        <ul className="flex flex-col gap-4">
          {SECTIONS.map(({ id, label }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                data-dot={id}
                data-active={i === 0}
                aria-label={label}
                aria-current={i === 0 ? "true" : undefined}
                className="group flex h-6 w-6 items-center justify-center focus-visible:outline-none"
              >
                <span className="block h-2.5 w-2.5 rounded-full border border-white/60 bg-transparent transition-all duration-300 group-hover:border-white group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white group-data-[active=true]:border-white group-data-[active=true]:bg-white group-data-[active=true]:scale-110" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ════════════════════════════════════════
          SEÇÃO 1 · INÍCIO
          ════════════════════════════════════════ */}
      <section id="topo" tabIndex={-1} data-hide className="focus:outline-none">

        {/* PARABÉNS — fatia superior (topo cortado) */}
        <Sliver text={CONTENT.cropped} edge="top" />

        {/* ── Barra de navegação ── */}
        <div className="border-t border-white/20 bg-brand">
          <nav data-nav aria-label="Principal">
            <ul
              className={`flex items-center justify-center gap-8 px-6 py-5 sm:gap-12 md:gap-16 md:py-6 ${NAV_ITEM} ${MASK_PAD}`}
            >
              {CONTENT.nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={[
                      "relative inline-block pb-0.5",
                      "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full",
                      "after:origin-left after:scale-x-0 after:bg-white",
                      "after:transition-transform after:duration-300",
                      "hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100",
                    ].join(" ")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
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
         * Layout:
         *  Mobile  → tudo empilhado: iniciais em linha, depois parágrafos
         *  Tablet+ → grade 3 colunas: [inicial] [texto] [inicial]
         */}
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 lg:px-16 lg:py-32">

          {/* Grid externo */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,1fr)] md:items-center md:gap-8 lg:gap-14">

            {/* Inicial esquerda — só no md+ */}
            <div className="hidden md:flex md:justify-center md:items-center">
              <Initial letter={left} side="left" />
            </div>

            {/* Coluna central: iniciais mobile + parágrafos */}
            <div className="flex flex-col gap-8">
              {/* Iniciais em mobile: exibidas horizontalmente acima do texto */}
              <div className="flex items-center justify-around md:hidden">
                <Initial letter={left} side="left" />
                <Initial letter={right} side="right" />
              </div>

              {/* Parágrafos */}
              <div data-paras className="flex flex-col gap-6">
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
            </div>

            {/* Inicial direita — só no md+ */}
            <div className="hidden md:flex md:justify-center md:items-center">
              <Initial letter={right} side="right" />
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
        {/* Headline "NO SEU / GRANDE DIA" — centrado, sem overflow */}
        <div className="overflow-hidden px-4 pt-10 pb-6 text-center md:pt-16 md:pb-10">
          <h2 className="inline-block">
            {CONTENT.headline.map((line) => (
              <GiantLine key={line} text={line} />
            ))}
          </h2>
        </div>

        {/* PARABÉNS — fatia inferior (rodapé cortado) */}
        <Sliver text={CONTENT.cropped} edge="bottom" />
      </section>
    </main>
  );
};

export default Appx;