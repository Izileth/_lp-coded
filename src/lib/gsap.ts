import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText, CustomEase);

// Curvas próprias: "poster" (entra e sai firme) e "editorial" (chega e assenta)
CustomEase.create("poster", "0.76, 0, 0.24, 1");
CustomEase.create("editorial", "0.16, 1, 0.3, 1");

// Evita saltos quando a barra do navegador mobile aparece/some
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };