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

const GIANT =
  "font-display uppercase text-black text-[length:var(--fs)] leading-[0.82] tracking-[-0.01em]";

const SMALL =
  "font-sans text-[11px] font-medium uppercase leading-[1.03] tracking-[-0.005em] text-black md:text-[clamp(10.5px,0.98vw,15px)]";

/* Folga na máscara do SplitText para não cortar acentos (Á, É, Ã...) */
const MASK_PAD = "[&_.split-mask]:py-[0.2em] [&_.split-mask]:-my-[0.2em]";

/* ---------- Palavra gigante cortada ---------- */
const Sliver: FC<{ text: string; edge: "top" | "bottom" }> = ({ text, edge }) => (
  <div
    aria-hidden="true"
    data-sliver={edge}
    className={`overflow-hidden ${edge === "top" ? "h-[4.6vw]" : "h-[6.2vw]"}`}
  >
    <div className={edge === "top" ? "translate-y-[calc(4.6vw_-_var(--fs)*0.82)]" : ""}>
      <span data-word className={`block text-center ${GIANT}`}>
        {text}
      </span>
    </div>
  </div>
);

/* ---------- Linha do título principal (com máscara própria) ---------- */
const GiantLine: FC<{ text: string }> = ({ text }) => (
  <span data-line className="-my-[0.12em] block overflow-hidden py-[0.12em]">
    <span data-line-inner className="block">
      {text}
    </span>
  </span>
);

const Initial: FC<{ letter: string; side: "left" | "right" }> = ({ letter, side }) => (
  <span
    aria-hidden="true"
    data-initial={side}
    className="block select-none font-script text-[24vw] font-normal italic leading-none text-black md:text-[11vw]"
  >
    {letter}
  </span>
);

const Index: FC = () => {
  const root = useRef<HTMLElement>(null);
  const [left, right] = CONTENT.initials;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      el.setAttribute("data-pending", "");
      let cancelled = false;
      let mm: gsap.MatchMedia | undefined;

      // Espera as fontes (com limite) antes de medir e dividir textos
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
            wide: "(min-width: 768px)",
          },
          (ctx) => {
            const { reduce, wide } = ctx.conditions as { reduce: boolean; wide: boolean };

            const one = <T extends HTMLElement = HTMLElement>(s: string) =>
              el.querySelector<T>(s)!;
            const all = (s: string) => gsap.utils.toArray<HTMLElement>(s, el);

            /* ===== Pontinhos laterais (sempre ativos) ===== */
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

            /* ===== Rolagem suave para âncoras (sempre ativa) ===== */
            const onClick = (e: MouseEvent) => {
              const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
              const id = a?.getAttribute("href")?.slice(1);
              const target = id ? document.getElementById(id) : null;
              if (!id || !target) return;

              e.preventDefault();
              gsap.to(window, {
                scrollTo: { y: target, autoKill: true },
                duration: reduce ? 0 : 1.5,
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

            /* ===== CAPÍTULO 1 · ABERTURA (timeline mestra) ===== */
            const hero = one("#topo");
            const topWrap = one("[data-sliver='top']");
            const topWord = one("[data-sliver='top'] [data-word]");
            const nav = one("[data-nav]");
            const role = one("[data-role]");
            const arrow = one("[data-arrow]");

            const navSplit = SplitText.create(all("[data-nav] a"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
            });

            gsap
              .timeline({ defaults: { ease: "editorial" } })
              // 1) palavra gigante sobe por trás da máscara
              .from(topWord, { yPercent: 105, duration: 1.5, ease: "poster" }, 0.15)
              // 2) menu entra linha a linha
              .from(navSplit.lines, { yPercent: 110, duration: 1, stagger: 0.09 }, 0.8)
              // 3) convite para rolar
              .from(role, { y: "1.2em", opacity: 0, duration: 0.9 }, 1.3)
              // 4) movimento final: a seta indica o caminho (4 batidas e para)
              .to(arrow, { y: 5, duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2);

            // Saída do hero: camadas com velocidades diferentes
            gsap.to(topWrap, {
              yPercent: -100,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "35% top", scrub: true },
            });
            gsap.to(nav, {
              yPercent: -40,
              opacity: 0,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "65% top", scrub: true },
            });

            /* ===== CAPÍTULO 2 · HOMENAGEM ===== */
            const homenagem = one("#homenagem");
            const leftInitial = one("[data-initial='left']");
            const rightInitial = one("[data-initial='right']");
            const OPEN = "inset(-30% -30% -30% -30%)";

            // Caligrafia: "escrita" por máscara, vindo de cada lado
            gsap.fromTo(
              leftInitial,
              { clipPath: "inset(-30% 100% -30% -30%)", x: wide ? "-4vw" : "-8vw" },
              {
                clipPath: OPEN,
                x: 0,
                duration: 1.8,
                ease: "poster",
                scrollTrigger: { trigger: homenagem, start: "top 60%", once: true },
              },
            );
            gsap.fromTo(
              rightInitial,
              { clipPath: "inset(-30% -30% -30% 100%)", x: wide ? "4vw" : "8vw" },
              {
                clipPath: OPEN,
                x: 0,
                duration: 1.8,
                delay: 0.15,
                ease: "poster",
                scrollTrigger: { trigger: homenagem, start: "top 60%", once: true },
              },
            );

            // Parallax em sentidos opostos (mais discreto no mobile)
            const drift = wide ? 18 : 6;
            gsap.to(leftInitial, {
              yPercent: -drift,
              ease: "none",
              scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
            });
            gsap.to(rightInitial, {
              yPercent: drift,
              ease: "none",
              scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
            });
            if (wide) {
              gsap.to("[data-paras]", {
                yPercent: -6,
                ease: "none",
                scrollTrigger: { trigger: homenagem, start: "top bottom", end: "bottom top", scrub: true },
              });
            }

            // Parágrafos linha a linha (re-divide sozinho ao redimensionar)
            SplitText.create(all("[data-para]"), {
              type: "lines",
              mask: "lines",
              maskClass: "split-mask",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 1.3,
                  ease: "editorial",
                  stagger: 0.05,
                  scrollTrigger: { trigger: homenagem, start: "top 55%", once: true },
                }),
            });

            /* ===== CAPÍTULO 3 · FESTA ===== */
            const festa = one("#festa");
            const lines = all("[data-line]");
            const inners = all("[data-line-inner]");
            const botWord = one("[data-sliver='bottom'] [data-word]");

            // Título sobe pela máscara
            gsap.from(inners, {
              yPercent: 110,
              duration: 1.5,
              ease: "editorial",
              stagger: 0.14,
              scrollTrigger: { trigger: festa, start: "top 60%", once: true },
            });

            // Linhas deslizam em direções opostas até se alinharem
            const slide = wide ? 10 : 6;
            lines.forEach((line, i) => {
              gsap.fromTo(
                line,
                { xPercent: i % 2 === 0 ? -slide : slide },
                {
                  xPercent: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: festa,
                    start: "top bottom",
                    end: "center center",
                    scrub: true,
                  },
                },
              );
            });

            // Fecho: a palavra gigante do rodapé emerge conforme a página termina
            gsap.fromTo(
              botWord,
              { yPercent: 100 },
              {
                yPercent: 0,
                ease: "none",
                scrollTrigger: { trigger: festa, start: "top 60%", end: "bottom bottom", scrub: true },
              },
            );

            return cleanup;
          },
        );

        el.removeAttribute("data-pending");
      });

      return () => {
        cancelled = true;
        mm?.revert(); // desfaz timelines, ScrollTriggers e SplitTexts
      };
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      data-pending=""
      className="w-full overflow-x-clip bg-brand text-black [--fs:18vw] md:[--fs:17vw]"
    >
      {/* Indicador lateral */}
      <nav aria-label="Seções" className="fixed right-3 top-1/2 z-50 -translate-y-1/2 md:right-6">
        <ul className="flex flex-col gap-3">
          {SECTIONS.map(({ id, label }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                data-dot={id}
                data-active={i === 0}
                aria-label={label}
                aria-current={i === 0 ? "true" : undefined}
                className="group flex h-4 w-4 items-center justify-center focus-visible:outline-none"
              >
                <span className="block h-2 w-2 rounded-full border border-black bg-transparent transition-all duration-300 group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-black group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand group-data-[active=true]:h-2.5 group-data-[active=true]:w-2.5 group-data-[active=true]:bg-black" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 1 · INÍCIO */}
      <section id="topo" tabIndex={-1} data-hide className="flex min-h-svh flex-col focus:outline-none">
        <Sliver text={CONTENT.cropped} edge="top" />

        <nav data-nav aria-label="Principal" className="mt-[12vw] md:mt-[5.4vw]">
          <ul className={`flex flex-col items-center ${SMALL} ${MASK_PAD}`}>
            {CONTENT.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="block underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          data-role
          href="#homenagem"
          className={`mt-auto pb-8 text-center underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none ${SMALL}`}
        >
          ROLE{" "}
          <span data-arrow className="inline-block">
            ↓
          </span>
        </a>
      </section>

      {/* 2 · HOMENAGEM */}
      <section
        id="homenagem"
        tabIndex={-1}
        data-hide
        className="flex min-h-svh items-center focus:outline-none"
      >
        <div className="grid w-full grid-cols-2 items-center gap-y-6 px-6 md:grid-cols-[1fr_minmax(260px,28%)_1fr] md:gap-y-0 md:px-0">
          <div className="flex justify-start md:justify-center">
            <Initial letter={left} side="left" />
          </div>
          <div className="flex justify-end md:order-3 md:justify-center">
            <Initial letter={right} side="right" />
          </div>

          <div
            data-paras
            className="col-span-2 mx-auto flex w-full max-w-[26rem] flex-col gap-[1.1em] md:order-2 md:col-span-1 md:max-w-none"
          >
            {CONTENT.paragraphs.map((text) => (
              <p
                key={text}
                data-para
                className={`hyphens-none [text-align-last:justify] [text-align:justify] ${SMALL} ${MASK_PAD}`}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · FESTA */}
      <section
        id="festa"
        tabIndex={-1}
        data-hide
        className="flex min-h-svh flex-col justify-center focus:outline-none"
      >
        <h2 className={`text-center ${GIANT}`}>
          {CONTENT.headline.map((line) => (
            <GiantLine key={line} text={line} />
          ))}
        </h2>
        <Sliver text={CONTENT.cropped} edge="bottom" />
      </section>
    </main>
  );
};

export default Index;