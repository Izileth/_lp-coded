import { useEffect, useRef, type FC, type ReactNode } from "react";

/* ========================= EDITE AQUI ========================= */
const CONTENT = {
  initials: ["N", "S"] as const, // iniciais nas laterais
  cropped: "PARABÉNS", // palavra cortada no topo e no fim da página
  headline: ["NO SEU", "GRANDE DIA"] as const, // título principal
  nav: [
    { label: "HOMENAGEM", href: "#homenagem" },
    { label: "FESTA", href: "#festa" },
    { label: "SOBRE", href: "#parabens" },
  ],
  paragraphs: [
    "No sábado à tarde a família inteira se reúne. Os balões já estão no ar, o bolo espera na mesa e todo mundo aguarda o momento de abraçar o aniversariante. Entre risadas, fotos e uma conversa rápida com os amigos de sempre, chega a hora de acender as velas, fazer um pedido e respirar fundo. Quando começam os parabéns, o novo capítulo dessa história começa.",
    "Ao olharmos para trás, depois de tantos anos, sentamos com ele para entender o que passa em seu coração neste novo ciclo. Uma jornada que até aqui entregou muitas conquistas, viagens, brincadeiras, lutas vencidas, memórias inesquecíveis e uma amizade que não cabe em nenhum cartão de aniversário.",
  ],
};
/* ============================================================== */

/* Classe base dos títulos gigantes (tamanho controlado por --fs no <main>) */
const GIANT =
  "font-display uppercase text-black text-[length:var(--fs)] leading-[0.82] tracking-[-0.01em]";

/* Revela o conteúdo ao entrar na tela (respeita prefers-reduced-motion) */
const Reveal: FC<{ children: ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transitionDelay = `${delay}ms`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition duration-1000 ease-out motion-safe:translate-y-6 motion-safe:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 ${className}`}
    >
      {children}
    </div>
  );
};

/* Palavra gigante cortada: "top" mostra só a base das letras, "bottom" só o topo */
const CroppedWord: FC<{ text: string; edge: "top" | "bottom" }> = ({ text, edge }) => (
  <div
    aria-hidden="true"
    className={`overflow-hidden ${edge === "top" ? "h-[4.6vw]" : "h-[6.2vw]"}`}
  >
    <span
      className={`block text-center ${GIANT} ${
        edge === "top" ? "translate-y-[calc(4.6vw_-_var(--fs)*0.82)]" : ""
      }`}
    >
      {text}
    </span>
  </div>
);

const Initial: FC<{ letter: string }> = ({ letter }) => (
  <span
    aria-hidden="true"
    className="select-none font-script text-[24vw] font-normal italic leading-none text-black md:text-[11vw]"
  >
    {letter}
  </span>
);

const Paragraph: FC<{ children: string }> = ({ children }) => (
  <p className="hyphens-none font-sans text-[11px] font-medium uppercase leading-[1.03] tracking-[-0.005em] text-black [text-align-last:justify] [text-align:justify] md:text-[clamp(10.5px,0.98vw,15px)]">
    {children}
  </p>
);

const Index: FC = () => {
  const [left, right] = CONTENT.initials;

  return (
    <main
      id="topo"
      className="min-h-screen w-full overflow-x-hidden bg-brand text-black [--fs:18vw] md:[--fs:17vw]"
    >
      {/* Palavra cortada (topo) */}
      <CroppedWord text={CONTENT.cropped} edge="top" />

      {/* Menu */}
      <Reveal className="mt-[12vw] md:mt-[5.4vw]">
        <nav aria-label="Principal">
          <ul className="flex flex-col items-center font-sans text-[11px] font-medium uppercase leading-[1.05] md:text-[clamp(10.5px,0.98vw,15px)]">
            {CONTENT.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="underline-offset-2 transition-opacity hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>

      {/* Texto + iniciais */}
      <section
        id="homenagem"
        className="mx-auto mt-[14vw] grid w-full grid-cols-2 items-center gap-y-6 px-6 md:mt-[5vw] md:grid-cols-[1fr_minmax(260px,28%)_1fr] md:gap-y-0 md:px-0"
      >
        <div className="flex justify-start md:justify-center">
          <Initial letter={left} />
        </div>
        <div className="flex justify-end md:order-3 md:justify-center">
          <Initial letter={right} />
        </div>

        <Reveal className="col-span-2 mx-auto flex w-full max-w-[26rem] flex-col gap-[1.1em] md:order-2 md:col-span-1 md:max-w-none">
          {CONTENT.paragraphs.map((text) => (
            <Paragraph key={text}>{text}</Paragraph>
          ))}
        </Reveal>
      </section>

      {/* Título principal */}
      <h1
        id="festa"
        className={`mt-[14vw] text-center md:mt-[5.8vw] ${GIANT}`}
      >
        {CONTENT.headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      {/* Palavra cortada (fim) */}
      <div id="parabens">
        <CroppedWord text={CONTENT.cropped} edge="bottom" />
      </div>
    </main>
  );
};

export default Index;