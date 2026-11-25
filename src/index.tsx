import { useRef, type FC } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "./lib/gsap";

/* ========================= EDITE AQUI ========================= */
const CONTENT = {
  initials: ["N", "S"] as const,
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

/* Títulos gigantes — fonte responsiva com clamp para evitar overflow */
const GIANT =
  "font-display uppercase text-white text-[length:var(--fs)] leading-[1] tracking-[-0.01em]";

/* Menu: pequeno, mas confortável de ler */
const NAV_TEXT =
  "font-sans text-sm font-semibold uppercase tracking-[0.1em] text-white md:text-base";

/* Corpo de leitura */
const READ =
  "font-sans text-base font-medium leading-[1.65] text-white md:text-lg [text-wrap:pretty]";

/* Folga na máscara do SplitText para não cortar acentos */
const MASK_PAD = "[&_.split-mask]:py-[0.15em] [&_.split-mask]:-my-[0.15em]";

/* ---------- Palavra gigante cortada ---------- */
const Sliver: FC<{ text: string; edge: "top" | "bottom" }> = ({ text, edge }) => (
  <div
    aria-hidden="true"
    data-sliver={edge}
    className={`w-full overflow-hidden ${
      edge === "top"
        ? "h-[calc(var(--fs)*0.32)]"
        : "h-[calc(var(--fs)*0.42)]"
    }`}
  >
    <div className={edge === "top" ? "-translate-y-[72%]" : "translate-y-[-58%]"}>
      <span data-word className={`block w-full text-center ${GIANT}`}>
        {text}
      </span>
    </div>
  </div>
);

/* Linha do headline com overflow seguro — sem margem negativa */
const GiantLine: FC<{ text: string }> = ({ text }) => (
  <span data-line className="block overflow-hidden py-[0.05em]">
    <span data-line-inner className="block leading-[1.05]">
      {text}
    </span>
  </span>
);

const Initial: FC<{ letter: string; side: "left" | "right" }> = ({ letter, side }) => (
  <span
    aria-hidden="true"
    data-initial={side}
    className="block select-none font-script text-[clamp(4rem,15vw,8rem)] font-normal italic leading-none text-white lg:text-[clamp(5rem,9vw,10rem)]"
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
      className="w-full overflow-x-clip bg-brand text-white [--fs:clamp(2.5rem,15vw,14rem)] md:[--fs:clamp(3rem,13vw,14rem)]"
    >
      {/* ── Indicador lateral de seção ── */}
      <nav aria-label="Seções" className="fixed right-3 top-1/2 z-50 -translate-y-1/2 md:right-6">
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
                <span className="block h-2 w-2 rounded-full border border-white/70 bg-transparent transition-all duration-300 group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand group-data-[active=true]:h-3 group-data-[active=true]:w-3 group-data-[active=true]:border-white group-data-[active=true]:bg-white" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── 1 · INÍCIO ── */}
      <section id="topo" tabIndex={-1} data-hide className="focus:outline-none">
        {/* Fatia superior de PARABÉNS */}
        <Sliver text={CONTENT.cropped} edge="top" />

        {/* Navegação principal — layout horizontal em qualquer tela */}
        <nav data-nav aria-label="Principal" className="border-t border-white/20">
          <ul className={`flex items-center justify-center gap-6 px-4 py-5 ${NAV_TEXT} ${MASK_PAD} sm:gap-10 md:gap-14 md:py-7`}>
            {CONTENT.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="relative py-1 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* ── 2 · HOMENAGEM ── */}
      <section
        id="homenagem"
        tabIndex={-1}
        data-hide
        className="px-6 py-16 focus:outline-none md:px-12 md:py-24"
      >
        {/* Grid: iniciais nas pontas, texto no centro */}
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr_auto] md:gap-12 lg:gap-20">
          {/* Inicial esquerda */}
          <div className="hidden justify-center md:flex">
            <Initial letter={left} side="left" />
          </div>

          {/* Parágrafos centrais */}
          <div
            data-paras
            className="mx-auto flex w-full max-w-[42rem] flex-col gap-6"
          >
            {/* Iniciais em mobile (acima do texto) */}
            <div className="flex items-center justify-between md:hidden">
              <Initial letter={left} side="left" />
              <Initial letter={right} side="right" />
            </div>

            {CONTENT.paragraphs.map((text) => (
              <p key={text} data-para className={`hyphens-auto ${READ} ${MASK_PAD}`}>
                {text}
              </p>
            ))}
          </div>

          {/* Inicial direita */}
          <div className="hidden justify-center md:flex">
            <Initial letter={right} side="right" />
          </div>
        </div>
      </section>

      {/* ── 3 · FESTA ── */}
      <section id="festa" tabIndex={-1} data-hide className="pt-8 focus:outline-none md:pt-14">
        {/* Headline "NO SEU / GRANDE DIA" — sem margens negativas */}
        <h2 className={`overflow-hidden text-center ${GIANT}`}>
          {CONTENT.headline.map((line) => (
            <GiantLine key={line} text={line} />
          ))}
        </h2>
        {/* Fatia inferior de PARABÉNS */}
        <Sliver text={CONTENT.cropped} edge="bottom" />
      </section>
    </main>
  );
};

export default Appx;