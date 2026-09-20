import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const fadeInOnScroll = (element: HTMLElement | string, vars: gsap.TweenVars = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 24,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    ...vars,
  });
};

export const staggerFadeIn = (elements: HTMLElement[] | string, vars: gsap.TweenVars = {}) => {
  return gsap.from(elements, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: elements,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    ...vars,
  });
};
