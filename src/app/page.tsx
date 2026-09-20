"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./homepage.css";

const FAQ_DATA = [
  {
    q: "What does Ostaad do?",
    a: "Ostaad converts your existing construction or architectural drawings into structured material requirements, quantities and cost estimates.",
  },
  {
    q: "Do I need a blueprint?",
    a: "Yes, Ostaad is primarily designed to work from existing project drawings and blueprints.",
  },
  {
    q: "Does Ostaad provide the actual construction cost?",
    a: "Ostaad focuses on creating a structured estimate, particularly around material requirements and costing. Actual project costs can vary based on labour, location, site conditions, specifications and market changes.",
  },
  {
    q: "Can I compare different vendors?",
    a: "Yes. Ostaad is designed to help create a common reference so different material quotes can be compared more meaningfully.",
  },
  {
    q: "Does Ostaad replace my contractor?",
    a: "No. Your contractor builds. Ostaad helps you understand the numbers and material requirements behind the build.",
  },
  {
    q: "Can I use Ostaad for renovation?",
    a: "Yes. Existing drawings or relevant project information can be used to structure renovation requirements where applicable.",
  },
  {
    q: "Is the costing fixed?",
    a: "No. Material prices can change by market, location, specification and supplier. Ostaad provides a structured costing reference rather than pretending construction prices never change.",
  },
  {
    q: "Can I choose my own materials?",
    a: "Yes. Ostaad is designed to help you understand the requirements and cost implications of your choices.",
  },
];

const FLOW_DETAILS = [
  "43 materials identified for your project, matched to specification and ready to compare across suppliers.",
  "12 suppliers compared on price, availability and delivery timelines.",
  "Order confirmed — 1,300 sq ft flooring, ₹1,92,400, arriving 16 Sept.",
  "Truck dispatched. Tracking updates as materials move toward site.",
  "Materials arrive on site — ready for installation.",
];

const MATERIALS = [
  { name: "Cement", color: "#B8A18B" },
  { name: "Steel", color: "#23384F" },
  { name: "Tiles", color: "#A87545" },
  { name: "Pipes", color: "#7C8764" },
  { name: "Electricals", color: "#23384F" },
  { name: "Sanitaryware", color: "#B8A18B" },
  { name: "Paint", color: "#A87545" },
  { name: "Hardware", color: "#7C8764" },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annotsOn, setAnnotsOn] = useState<boolean>(false);
  const [flowStep, setFlowStep] = useState<number>(0);
  const [decisionOpt, setDecisionOpt] = useState<"current" | "alt">("current");

  const heroRef = useRef<HTMLElement>(null);
  const linesGroupRef = useRef<SVGGElement>(null);
  const planCanvasRef = useRef<SVGSVGElement>(null);
  const orbFillRef = useRef<SVGCircleElement>(null);
  const velocityRowARef = useRef<HTMLDivElement>(null);
  const velocityRowBRef = useRef<HTMLDivElement>(null);

  // 1. Reveal on Scroll
  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  // 2. Blueprint Hero Fibonacci Animation
  useEffect(() => {
    const VB_W = 1440;
    const VB_H = 900;
    const svgNS = "http://www.w3.org/2000/svg";
    const group = linesGroupRef.current;
    const canvas = planCanvasRef.current;
    if (!group || !canvas) return;

    let timeoutId: any;
    let intervalId: any;

    function fibSquares(n: number, startDir: number) {
      const seq = [1, 1];
      while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      let bx = 0,
        by = 0,
        bw = seq[0],
        bh = seq[0],
        dir = startDir % 4;
      const squares: any[] = [{ x: 0, y: 0, w: seq[0], h: seq[0] }];
      for (let i = 1; i < seq.length; i++) {
        const s = seq[i];
        let r: any;
        if (dir === 0) {
          r = { x: bx + bw, y: by, w: s, h: s };
          bw += s;
        } else if (dir === 1) {
          r = { x: bx, y: by + bh, w: s, h: s };
          bh += s;
        } else if (dir === 2) {
          r = { x: bx - s, y: by, w: s, h: s };
          bx -= s;
          bw += s;
        } else {
          r = { x: bx, y: by - s, w: s, h: s };
          by -= s;
          bh += s;
        }
        r.fib = s;
        squares.push(r);
        dir = (dir + 1) % 4;
      }
      return { squares, bounds: { x: bx, y: by, w: bw, h: bh } };
    }

    function fit(squares: any[], bounds: any, size: number, cx: number, cy: number, flipX: boolean, flipY: boolean) {
      const scale = size / Math.max(bounds.w, bounds.h);
      return squares.map((s) => {
        let x = (s.x - bounds.x) * scale,
          y = (s.y - bounds.y) * scale,
          w = s.w * scale,
          h = s.h * scale;
        if (flipX) x = bounds.w * scale - x - w;
        if (flipY) y = bounds.h * scale - y - h;
        return {
          x: x + cx - (bounds.w * scale) / 2,
          y: y + cy - (bounds.h * scale) / 2,
          w,
          h,
        };
      });
    }

    function line(x1: number, y1: number, x2: number, y2: number, delay: number, accent: boolean) {
      const el = document.createElementNS(svgNS, "line");
      el.setAttribute("x1", String(x1));
      el.setAttribute("y1", String(y1));
      el.setAttribute("x2", String(x2));
      el.setAttribute("y2", String(y2));
      el.setAttribute("class", "plan-line" + (accent ? " accent" : ""));
      const horizontal = Math.abs(y1 - y2) < 0.01;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      el.style.setProperty("--dx", (horizontal ? (midX < VB_W / 2 ? -520 : 520) : 0) + "px");
      el.style.setProperty("--dy", (!horizontal ? (midY < VB_H / 2 ? -520 : 520) : 0) + "px");
      el.style.animationDelay = delay + "ms";
      return el;
    }

    function label(x: number, y: number, text: string) {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "plan-label");
      g.style.animationDelay = "1450ms";
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", String(x));
      t.setAttribute("y", String(y));
      t.textContent = text;
      g.appendChild(t);
      return g;
    }

    function buildCycle() {
      if (!group) return;
      group.innerHTML = "";
      group.classList.remove("fading");
      const data = fibSquares(10, Math.floor(Math.random() * 4));
      const rooms = fit(data.squares, data.bounds, 680, VB_W / 2, VB_H / 2, Math.random() < 0.5, Math.random() < 0.5);
      let index = 0;
      rooms.forEach((r, i) => {
        const largest = i === rooms.length - 1;
        const second = i === rooms.length - 2;
        [
          [r.x, r.y, r.x + r.w, r.y],
          [r.x, r.y + r.h, r.x + r.w, r.y + r.h],
          [r.x, r.y, r.x, r.y + r.h],
          [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
        ].forEach((e: any) => {
          group.appendChild(line(e[0], e[1], e[2], e[3], index * 22 + Math.random() * 40, largest));
          index++;
        });
        if (largest) {
          group.appendChild(
            label(r.x + r.w * 0.08, r.y + 22, "LIVING · " + Math.round(r.w / 16) + "' × " + Math.round(r.h / 16) + "'")
          );
        } else if (second) {
          group.appendChild(label(r.x + r.w * 0.1, r.y + 20, "BED 01"));
        }
      });

      timeoutId = setTimeout(() => {
        group.classList.add("fading");
        setTimeout(buildCycle, 450);
      }, index * 22 + 2200);
    }

    function ambient() {
      if (!canvas) return;
      const edge = Math.floor(Math.random() * 4);
      const len = 90 + Math.random() * 140;
      let x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0;
      if (edge === 0) {
        x1 = Math.random() * VB_W;
        y1 = 0;
        x2 = x1 + (Math.random() < 0.5 ? -1 : 1) * len * 0.3;
        y2 = len;
      } else if (edge === 1) {
        x1 = VB_W;
        y1 = Math.random() * VB_H;
        x2 = VB_W - len;
        y2 = y1 + (Math.random() < 0.5 ? -1 : 1) * len * 0.3;
      } else if (edge === 2) {
        x1 = Math.random() * VB_W;
        y1 = VB_H;
        x2 = x1 + (Math.random() < 0.5 ? -1 : 1) * len * 0.3;
        y2 = VB_H - len;
      } else {
        x1 = 0;
        y1 = Math.random() * VB_H;
        x2 = len;
        y2 = y1 + (Math.random() < 0.5 ? -1 : 1) * len * 0.3;
      }
      const el = document.createElementNS(svgNS, "line");
      el.setAttribute("class", "ambient-ray" + (Math.random() < 0.18 ? " terracotta" : Math.random() < 0.3 ? " sage" : ""));
      el.setAttribute("x1", String(x1));
      el.setAttribute("y1", String(y1));
      el.setAttribute("x2", String(x2));
      el.setAttribute("y2", String(y2));
      const dist = Math.hypot(x2 - x1, y2 - y1);
      el.setAttribute("stroke-dasharray", String(dist));
      el.setAttribute("stroke-dashoffset", String(dist));
      canvas.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.strokeDashoffset = "0";
      });
      setTimeout(() => {
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 350);
      }, 420 + Math.random() * 260);
    }

    buildCycle();
    intervalId = setInterval(ambient, 180);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // 3. Hero Scroll Exit
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    function updateHeroExit() {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(window.innerHeight * 0.45, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      hero.style.setProperty("--hero-exit", progress.toFixed(3));
    }
    window.addEventListener("scroll", updateHeroExit, { passive: true });
    updateHeroExit();
    return () => window.removeEventListener("scroll", updateHeroExit);
  }, []);

  // 4. Number Tickers & Cost Orb
  useEffect(() => {
    function animateTicker(el: HTMLElement) {
      const target = parseFloat(el.dataset.target || "0");
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const dur = 1400;
      const start = performance.now();
      function frame(now: number) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = (target * eased).toFixed(decimals);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const tickers = document.querySelectorAll("[data-ticker]");
    const tickerObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateTicker(e.target as HTMLElement);
            tickerObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    tickers.forEach((el) => tickerObs.observe(el));

    // Cost orb ring animation
    const orbFill = orbFillRef.current;
    const orbCard = document.getElementById("orbCard");
    if (orbFill && orbCard) {
      const orbObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const circumference = 2 * Math.PI * 90;
              orbFill.style.strokeDashoffset = String(circumference * (1 - 0.92));
              orbObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      orbObs.observe(orbCard);
    }

    return () => tickerObs.disconnect();
  }, []);

  // 5. Velocity Rail Materials Scroller
  useEffect(() => {
    const rowA = velocityRowARef.current;
    const rowB = velocityRowBRef.current;
    if (!rowA || !rowB) return;

    const rows = [rowA, rowB];
    const velocityOffsets = [0, 0];
    let velocityImpulse = 0;
    let lastVelocityScroll = window.scrollY;
    let lastVelocityFrame = performance.now();
    let animId: any;

    rows.forEach((row, index) => {
      const direction = Number(row.dataset.direction || 1);
      row.innerHTML = [...MATERIALS, ...MATERIALS, ...MATERIALS]
        .map(
          (m) =>
            `<span class="velocity-item"><i class="sw" style="background:${m.color}"></i>${m.name}</span>`
        )
        .join("");
      if (direction < 0) velocityOffsets[index] = -row.scrollWidth / 2;
    });

    function animateVelocityRail(now: number) {
      const dt = Math.min((now - lastVelocityFrame) / 1000, 0.05);
      lastVelocityFrame = now;
      velocityImpulse += (0 - velocityImpulse) * Math.min(dt * 4, 1);
      rows.forEach((row, index) => {
        const direction = Number(row.dataset.direction || 1);
        const halfWidth = row.scrollWidth / 2;
        if (!halfWidth) return;
        const speed = 34 + Math.min(Math.abs(velocityImpulse) * 0.24, 54);
        velocityOffsets[index] += direction * speed * dt;
        if (direction > 0 && velocityOffsets[index] >= 0) velocityOffsets[index] -= halfWidth;
        if (direction < 0 && velocityOffsets[index] <= -halfWidth) velocityOffsets[index] += halfWidth;
        row.style.transform = `translate3d(${velocityOffsets[index]}px,0,0)`;
      });
      animId = requestAnimationFrame(animateVelocityRail);
    }

    const onScroll = () => {
      velocityImpulse = Math.max(-180, Math.min(180, (window.scrollY - lastVelocityScroll) * 4));
      lastVelocityScroll = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    animId = requestAnimationFrame(animateVelocityRail);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 6. Spotlight Cursor Follow Glow
  useEffect(() => {
    const spotlights = document.querySelectorAll(".spotlight");
    const handlers: { el: Element; handler: (e: any) => void }[] = [];
    spotlights.forEach((card) => {
      const handler = (e: any) => {
        const r = card.getBoundingClientRect();
        (card as HTMLElement).style.setProperty("--mx", e.clientX - r.left + "px");
        (card as HTMLElement).style.setProperty("--my", e.clientY - r.top + "px");
      };
      card.addEventListener("mousemove", handler);
      handlers.push({ el: card, handler });
    });
    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener("mousemove", handler));
    };
  }, []);

  // 7. AI Field Updates & Stack Observer
  useEffect(() => {
    const aiUpdates = document.querySelectorAll(".ai-update");
    const aiUpdatesContainer = document.getElementById("aiUpdates");
    if (aiUpdatesContainer && aiUpdates.length) {
      const aiObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              aiUpdates.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 220));
              aiObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      aiObs.observe(aiUpdatesContainer);
    }

    const buildStackSection = document.querySelector(".section-stack-transition");
    if (buildStackSection) {
      const stackObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              buildStackSection.classList.add("stack-visible");
              stackObserver.unobserve(buildStackSection);
            }
          });
        },
        { threshold: 0.12 }
      );
      stackObserver.observe(buildStackSection);
    }
  }, []);

  return (
    <main>
  <section ref={heroRef} className="hero blueprint-hero" id="hero">
    <svg ref={planCanvasRef} className="plan-canvas" id="planCanvas" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true">
      <defs>
        <pattern id="dotgrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="rgba(35,56,79,.16)" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1440" height="900" fill="url(#dotgrid)" />
      <g ref={linesGroupRef} id="linesGroup" className="plan-group" />
    </svg>
    <div className="hero-scrim"></div>
    <div className="north"><svg viewBox="0 0 24 24">
        <path d="M12 2 L16 12 L12 9.5 L8 12 Z" fill="currentColor" />
        <line x1="12" y1="9.5" x2="12" y2="20" stroke="currentColor" strokeWidth="1" />
      </svg>N</div>
    <div className="frame-note tl">LEVEL 01 · G+1</div>
    <div className="frame-note bl">A—01 <span className="dim">/ SCALE 1:100</span></div>
    <div className="frame-note br">FROM DRAWING → SPACE</div>
    <div className="hero-content">
      <div className="eyebrow">AI FOR CONSTRUCTION</div>
      <h1>The smarter way<br />to build your bari.</h1>
      <div className="subtext">
        <p>Know what you're building.</p>
        <p>Know what it will cost.</p>
        <p>Know what it will look like.</p>
        <p>Before the first tile is laid.</p>
      </div>
      <p className="lede">Ostaad brings design, costing, procurement and execution together — so your construction doesn't
        have to depend on guesswork, scattered vendors and endless follow-ups.</p>
      <div className="cta-row"><a href="#cta" className="btn btn-primary beam">Experience Ostaad <span
            className="arrow">→</span></a><a href="#way" className="btn btn-secondary">See How It Works</a></div>
      <div className="trust-row"><span>UNIFORM COSTING</span><span>VERIFIED MATERIALS</span><span>FEWER SURPRISES</span>
      </div>
    </div>
  </section>

  {/*  ============================================================
     PROBLEM
     ============================================================  */}
  <section className="section" id="problem">
    <div className="container">
      <div className="section-head reveal" style={{"margin":"0 auto","textAlign":"center","maxWidth":"680px"}}>
        <div className="eyebrow" style={{"justifyContent":"center"}}>THE PROBLEM</div>
        <h2>Your blueprint should come with a number you can trust.</h2>
        <p style={{"marginLeft":"auto","marginRight":"auto"}}>A drawing tells you what you're building. It doesn't tell you how
          much material you'll need, what it should cost, or whether one vendor's quote is actually comparable to
          another.</p>
      </div>
      <div className="bento reveal-stagger" style={{"gridTemplateColumns":"repeat(4,1fr)","marginTop":"48px"}}>
        <div className="card card-pad">
          <div className="card-label">01</div>
          <div className="blueprint-card-graphic blueprint-card-graphic--material"><i></i><i></i><i></i></div>
          <div className="small-label" style={{"marginTop":"10px"}}>How much material you'll actually need.</div>
        </div>
        <div className="card card-pad">
          <div className="card-label">02</div>
          <div className="blueprint-card-graphic blueprint-card-graphic--cost"><b>₹</b><i></i></div>
          <div className="small-label" style={{"marginTop":"10px"}}>What each material should reasonably cost.</div>
        </div>
        <div className="card card-pad">
          <div className="card-label">03</div>
          <div className="blueprint-card-graphic blueprint-card-graphic--quantity"><i></i><i></i><i></i></div>
          <div className="small-label" style={{"marginTop":"10px"}}>What your total material requirement looks like.</div>
        </div>
        <div className="card card-pad">
          <div className="card-label">04</div>
          <div className="blueprint-card-graphic blueprint-card-graphic--compare"><i></i><i></i><i></i></div>
          <div className="small-label" style={{"marginTop":"10px"}}>Whether one vendor's quote is comparable to another.</div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     KNOW — Slate
     ============================================================  */}
  <section className="section" id="know">
    <div className="container">
      <div className="section-head reveal">
        <h2>From drawing to cost.</h2>
        <p>Upload your existing architectural or construction drawings. Ostaad helps translate them into a structured,
          transparent cost estimate. Blueprint in. Clear estimate out.</p>
      </div>

      <div className="bento dtc-grid reveal-stagger">
        <div className="card card-pad dtc-card">
          <div>
            <svg className="dtc-icon" viewBox="0 0 24 24">
              <path d="M4 4h16v16H4z" />
              <path d="M4 9h16M9 9v11" />
            </svg>
          </div>
          <div>
            <div className="card-label">MATERIALS</div>
            <div className="small-label" style={{"marginTop":"6px"}}>What needs to be purchased.</div>
          </div>
        </div>
        <div className="card card-pad dtc-card">
          <div><svg className="dtc-icon" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h12" />
            </svg></div>
          <div>
            <div className="card-label">QUANTITIES</div>
            <div className="small-label" style={{"marginTop":"6px"}}>How much is required.</div>
          </div>
        </div>
        <div className="card card-pad dtc-card">
          <div><svg className="dtc-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg></div>
          <div>
            <div className="card-label">SPECIFICATIONS</div>
            <div className="small-label" style={{"marginTop":"6px"}}>What grade, size or type is required.</div>
          </div>
        </div>
        <div className="card card-pad dtc-card">
          <div><svg className="dtc-icon" viewBox="0 0 24 24">
              <path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5" />
            </svg></div>
          <div>
            <div className="card-label">COST</div>
            <div className="small-label" style={{"marginTop":"6px"}}>What materials should reasonably cost.</div>
          </div>
        </div>
        <div className="card card--slate card-pad dtc-card spotlight">
          <div><svg className="dtc-icon" viewBox="0 0 24 24" style={{"stroke":"#fff"}}>
              <path d="M4 20h16M4 20V10l4-3 4 3 4-3 4 3v10" />
            </svg></div>
          <div>
            <div className="card-label">TOTAL</div>
            <div className="small-label" style={{"marginTop":"6px"}}>A clearer picture of your material budget.</div>
          </div>
        </div>
      </div>

      <div className="orb-section card-stack reveal-stagger" style={{"marginTop":"64px"}}>
        <div className="cost-transition-note">
          <span className="card-label">A CLEARER DECISION</span>
          <p>Age thekei cost-ta clear thakle, decision neowa onek easier.</p>
        </div>
        <div className="card orb-card beam" id="orbCard">
          <div className="card-label" style={{"textAlign":"left"}}>ESTIMATED PROJECT COST</div>
          <div className="orb-wrap">
            <svg viewBox="0 0 200 200">
              <circle className="orb-track" cx="100" cy="100" r="90" />
              <circle ref={orbFillRef} className="orb-fill" id="orbFill" cx="100" cy="100" r="90" />
            </svg>
            <div className="orb-center">
              <div className="orb-cost mono" data-ticker data-target="38.4" data-prefix="₹" data-suffix="L"
                data-decimals="1">₹0.0L</div>
              <div className="orb-range">± ₹1.8L</div>
              <div className="orb-conf"><span data-ticker data-target="92" data-suffix="%" data-decimals="0">0%</span>
                confidence</div>
            </div>
          </div>
          <div className="orb-breakdown">
            <div><span className="dot" style={{"background":"var(--slate)"}}></span><span className="lbl">Structure</span><span
                className="val">₹14.2L</span></div>
            <div><span className="dot" style={{"background":"var(--sage)"}}></span><span className="lbl">Finishes</span><span
                className="val">₹11.6L</span></div>
            <div><span className="dot" style={{"background":"var(--terracotta)"}}></span><span className="lbl">Services</span><span
                className="val">₹6.8L</span></div>
            <div><span className="dot" style={{"background":"var(--taupe)"}}></span><span className="lbl">Interiors</span><span
                className="val">₹5.8L</span></div>
          </div>
        </div>

        <div className="card doc-preview spotlight">
          <svg className="doc-blueprint" viewBox="0 0 200 200">
            <path d="M14 40 V14 H40" fill="none" strokeWidth="1.5" />
            <path d="M160 14 H186 V40" fill="none" strokeWidth="1.5" />
            <path d="M186 160 V186 H160" fill="none" strokeWidth="1.5" />
            <path d="M40 186 H14 V160" fill="none" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="46" fill="none" strokeWidth="1.2" />
          </svg>
          <div className="doc-status">APPROVED</div>
          <div className="doc-title">Cost Plan · V03</div>
          <div className="doc-meta">
            <div>
              <div className="k mono">DATE</div>
              <div className="v mono">13 SEP 2026</div>
            </div>
            <div>
              <div className="k mono">AREA</div>
              <div className="v mono">1,782 SQ FT</div>
            </div>
            <div>
              <div className="k mono">TOTAL</div>
              <div className="v mono">₹38.42L</div>
            </div>
          </div>
          <div style={{"marginTop":"28px","position":"relative","zIndex":"1"}}>
            <div className="k mono" style={{"fontSize":"11px","color":"var(--taupe)"}}>SOURCE</div>
            <div style={{"fontSize":"13.5px","color":"var(--text)","marginTop":"4px"}}>12 supplier quotes · updated 13 Sep</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     ONE STANDARD strip
     ============================================================  */}
  <section className="section standard-strip" style={{"padding":"48px 0"}}>
    <div className="container">
      <div className="card card-pad-lg reveal"
        style={{"display":"flex","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap","gap":"20px"}}>
        <div style={{"maxWidth":"520px"}}>
          <div className="eyebrow">ONE BLUEPRINT. ONE STANDARD.</div>
          <p style={{"fontSize":"15.5px","color":"var(--slate)"}}>Different quantities. Different specifications. Different
            assumptions. Different prices. Ostaad creates a standardised costing structure — so you're comparing like
            with like.</p>
        </div>
        <div className="standard-graphic" aria-hidden="true"><span></span><i></i><b></b><em></em></div>
        <div className="pill">Same requirement · Same specification · Clear comparison</div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     SEE — Sage
     ============================================================  */}
  <section className="section band-sage-tint" id="see">
    <div className="container">
      <div className="section-head reveal">
        <h2>Walk through the finished space.</h2>
        <p>See your room before it's built, then watch it become cost-computable — every finish, tagged and priced.</p>
      </div>

      <div className="card space-card reveal" id="spaceCard">
        <div className="space-visual" id="spaceVisual">
          <div className="space-tag mono">LIVING ROOM</div>
          <div className="space-version mono">DESIGN V04</div>
          <svg className="living-engineering" width="100%" height="100%" viewBox="0 0 1200 500"
            preserveAspectRatio="xMidYMid slice" aria-label="Pastel living room engineering drawing">
            <rect width="1200" height="500" fill="#f4f1e9" />
            <rect x="18" y="18" width="1164" height="464" fill="#fbf8f2" stroke="#d8d2c2" />
            <text x="42" y="48" className="draw-title">LIVING ROOM / ENGINEERING DRAWING</text><text x="1080" y="48"
              className="draw-meta">A-04 · V04</text>
            <line x1="600" y1="28" x2="600" y2="472" className="draw-divider" />
            <text x="50" y="82" className="draw-label">FLOOR PLAN · TOP VIEW</text>
            <rect x="66" y="112" width="420" height="300" className="draw-wall" />
            <rect x="80" y="126" width="392" height="272" className="draw-floor" />
            <line x1="80" y1="268" x2="472" y2="268" className="draw-line" />
            <line x1="318" y1="126" x2="318" y2="398" className="draw-line" />
            <rect x="96" y="146" width="150" height="58" rx="12" className="draw-sofa" />
            <rect x="96" y="214" width="58" height="120" rx="12" className="draw-sofa" />
            <rect x="180" y="196" width="180" height="140" rx="20" className="draw-rug" />
            <circle cx="270" cy="266" r="45" className="draw-table" />
            <rect x="414" y="146" width="36" height="230" rx="5" className="draw-wood" />
            <rect x="422" y="168" width="20" height="90" className="draw-screen" />
            <path d="M66 380 A55 55 0 0 1 121 435" className="draw-dash" /><text x="77" y="451"
              className="draw-small">D1</text><text x="235" y="286" className="draw-small">COFFEE TABLE</text>
            <line x1="80" y1="103" x2="472" y2="103" className="draw-dim" /><text x="255" y="96" className="draw-small">12' —
              0"</text>
            <line x1="52" y1="126" x2="52" y2="398" className="draw-dim" /><text x="44" y="276" className="draw-small"
              transform="rotate(-90 44 276)">14' — 0"</text>
            <text x="628" y="82" className="draw-label">FRONT ELEVATION · TV WALL</text>
            <rect x="632" y="104" width="250" height="146" className="draw-elev" />
            <rect x="696" y="130" width="126" height="88" className="draw-wood" />
            <rect x="726" y="146" width="66" height="40" className="draw-screen" />
            <line x1="692" y1="226" x2="826" y2="226" className="draw-line" /><text x="662" y="270" className="draw-small">WOOD
              PANEL · TV UNIT · STORAGE</text>
            <text x="908" y="82" className="draw-label">SIDE ELEVATION · SOFA WALL</text>
            <rect x="912" y="104" width="226" height="146" className="draw-elev" />
            <rect x="946" y="186" width="158" height="38" rx="9" className="draw-sofa" />
            <rect x="946" y="172" width="158" height="22" rx="8" className="draw-sofa" />
            <rect x="988" y="128" width="66" height="32" className="draw-art" /><text x="926" y="270"
              className="draw-small">SOFA · ART · AMBIENT LIGHT</text>
            <line x1="628" y1="306" x2="1138" y2="306" className="draw-divider" /><text x="628" y="334"
              className="draw-label">MATERIAL NOTES</text>
            <circle cx="640" cy="360" r="6" className="draw-dot sage-dot" /><text x="654" y="364" className="draw-small">URBAN
              STONE · FLOORING · ₹148 / SQ FT</text>
            <circle cx="640" cy="388" r="6" className="draw-dot wood-dot" /><text x="654" y="392" className="draw-small">TEAK
              VENEER · WOODWORK · ₹1,240 / SQ FT</text>
            <circle cx="640" cy="416" r="6" className="draw-dot terracotta-dot" /><text x="654" y="420"
              className="draw-small">WARM 3000K · LIGHTING · ₹62K</text>
          </svg>
          <div className={`annot-pt ${annotsOn ? "on" : ""}`} id="an1" style={{"top":"64%","left":"14%"}}>FLOORING · ₹1.83L</div>
          <div className={`annot-pt ${annotsOn ? "on" : ""}`} id="an2" style={{"top":"30%","left":"40%"}}>LIGHTING · ₹62K</div>
          <div className={`annot-pt ${annotsOn ? "on" : ""}`} id="an3" style={{"top":"24%","right":"10%"}}>WOODWORK · ₹2.1L</div>
          <div className={`annot-pt ${annotsOn ? "on" : ""}`} id="an4" style={{"top":"56%","right":"14%"}}>SANITARY · ₹84K</div>
        </div>
        <div className="space-panel">
          <div className="space-specs">
            <div>
              <div className="k mono">FLOORING</div>
              <div className="v">Urban Stone · ₹148/sqft</div>
            </div>
            <div>
              <div className="k mono">LIGHTING</div>
              <div className="v">Warm 3000K</div>
            </div>
            <div>
              <div className="k mono">WALLS</div>
              <div className="v">Ivory</div>
            </div>
          </div>
          <div style={{"display":"flex","gap":"10px"}}>
            <button type="button" className="space-toggle mono" id="annotToggle" onClick={() => setAnnotsOn(!annotsOn)}>{annotsOn ? "Hide cost breakdown" : "Show cost breakdown"}</button>
            <a href="#cta" className="btn btn-sage btn-sm">Approve Design <span className="arrow">→</span></a>
          </div>
        </div>
      </div>

      <div className="buying-card card reveal">
        <div className="eyebrow">KNOW WHAT YOU'RE BUYING</div>
        <p>A ₹10 lakh quote doesn't mean much if you don't know what's inside it. Not just a number — the numbers behind
          the number.</p>
      </div>
      <div className="velocity-container reveal" aria-label="Construction materials moving by scroll velocity">
        <div className="velocity-fade velocity-fade-left"></div>
        <div className="velocity-fade velocity-fade-right"></div>
        <div ref={velocityRowARef} className="velocity-row" id="velocityRowA" data-direction="1" />
        <div ref={velocityRowBRef} className="velocity-row" id="velocityRowB" data-direction="-1" />
      </div>
    </div>
  </section>

  {/*  ============================================================
     BUILD — Terracotta
     ============================================================  */}
  <section className="section band-terracotta-tint build-section-card section-stack-transition" id="build">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">03 / BUILD</div>
        <h2>Your contractor's quote. Now with context.</h2>
        <p>Your contractor still builds. Your architect still designs. Ostaad gives you a common costing reference that
          sits between them.</p>
      </div>

      <div className="bento mat-grid reveal-stagger">
        <div className="card mat-card spotlight">
          <div className="mat-swatch"
            style={{"background":"repeating-linear-gradient(45deg,#C9BFAE,#C9BFAE 8px,#BDB09A 8px,#BDB09A 16px)"}}></div>
          <div className="mat-body">
            <div className="card-label">FLOORING</div>
            <div className="mat-name">Urban Stone</div>
            <div className="mat-meta">600 × 1200 MM</div>
            <div className="mat-price">₹148 / SQ FT</div>
            <div className="mat-ready">Procurement ready</div>
          </div>
        </div>
        <div className="card mat-card spotlight">
          <div className="mat-swatch"
            style={{"background":"repeating-linear-gradient(90deg,#8A5A34,#8A5A34 6px,#7A4D2B 6px,#7A4D2B 12px)"}}></div>
          <div className="mat-body">
            <div className="card-label">WOODWORK</div>
            <div className="mat-name">Teak Veneer</div>
            <div className="mat-meta">SHUTTER GRADE A</div>
            <div className="mat-price">₹1,240 / SQ FT</div>
            <div className="mat-ready">Procurement ready</div>
          </div>
        </div>
        <div className="card mat-card spotlight">
          <div className="mat-swatch" style={{"background":"linear-gradient(135deg,#DCD3C2,#EFE9DE)"}}></div>
          <div className="mat-body">
            <div className="card-label">PAINT</div>
            <div className="mat-name">Warm Ivory</div>
            <div className="mat-meta">EMULSION · 2 COAT</div>
            <div className="mat-price">₹34 / SQ FT</div>
            <div className="mat-ready">Procurement ready</div>
          </div>
        </div>
        <div className="card mat-card spotlight">
          <div className="mat-swatch" style={{"background":"linear-gradient(135deg,#9AA184,#7C8764)"}}></div>
          <div className="mat-body">
            <div className="card-label">SANITARYWARE</div>
            <div className="mat-name">Matte Ceramic</div>
            <div className="mat-meta">STANDARD SET</div>
            <div className="mat-price">₹18,400 / SET</div>
            <div className="mat-ready">Procurement ready</div>
          </div>
        </div>
      </div>

      
      <div className="card flow-wrap reveal procurement-feature" style={{ marginTop: "56px" }}>
        <div className="card-label">PROCUREMENT FLOW</div>
        <div className="flow-track" id="flowTrack">
          <div className="flow-line">
            <div className="flow-line-fill" id="flowLineFill" style={{ width: (flowStep / 4) * 100 + "%" }} />
          </div>
          <div className="flow-arrow-cues" aria-hidden="true">
            <span className={flowStep === 0 ? "on" : ""}>→</span>
            <span className={flowStep === 1 ? "on" : ""}>→</span>
            <span className={flowStep === 2 ? "on" : ""}>→</span>
            <span className={flowStep === 3 ? "on" : ""}>→</span>
          </div>
          {[
            { label: "MATERIAL", icon: <rect x="4" y="4" width="16" height="16" rx="2" /> },
            { label: "SUPPLIER", icon: <path d="M4 20V10l8-6 8 6v10" /> },
            { label: "ORDER", icon: <><path d="M6 6h13l-1 9H7z" /><circle cx="9" cy="19" r="1.4" /><circle cx="16" cy="19" r="1.4" /></> },
            { label: "TRUCK", icon: <><path d="M3 16V8h11v8M14 11h4l3 3v2h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></> },
            { label: "SITE", icon: <><path d="M4 20h16M6 20V9l6-5 6 5v11" /></> },
          ].map((step, idx) => (
            <button
              key={step.label}
              type="button"
              className={`flow-step ${flowStep === idx ? "active" : ""} ${idx < flowStep ? "done" : ""} ${idx === flowStep + 1 ? "next-target" : ""}`}
              onClick={() => setFlowStep(idx)}
              aria-label={`View ${step.label} stage`}
            >
              <div className="flow-dot">
                <svg viewBox="0 0 24 24">{step.icon}</svg>
              </div>
              <div className="flow-label">{step.label}</div>
            </button>
          ))}
        </div>
        <div className="flow-detail magic-detail" id="flowDetail">
          <span className="num mono">{String(flowStep + 1).padStart(2, "0")}</span>
          <p>{FLOW_DETAILS[flowStep]}</p>
        </div>
        <div className="status-track" id="statusTrack">
          {["ORDERED", "DISPATCHED", "ARRIVING", "ON SITE", "INSTALLED"].map((pill, idx) => (
            <div key={pill} className={`status-pill ${idx <= flowStep ? "on" : ""}`}>
              {pill}
            </div>
          ))}
        </div>
      </div>

    </div>
  </section>

  {/*  ============================================================
     THE OSTAAD WAY
     ============================================================  */}
  <section className="section" id="way">
    <div className="container">
      <div className="section-head reveal" style={{"margin":"0 auto","textAlign":"center","maxWidth":"600px"}}>
        <div className="eyebrow" style={{"justifyContent":"center"}}>THE OSTAAD WAY</div>
        <h2>Dekhe nin. Bujhe nin. Tarpor decision nin.</h2>
      </div>
      <div className="bento way-grid reveal-stagger">
        <div className="card card-pad way-card">
          <div className="way-num mono">01</div>
          <div className="way-title">Upload</div>
          <div className="way-desc">Share your existing blueprint. Your drawing. Your project.</div>
        </div>
        <div className="card card-pad way-card">
          <div className="way-num mono">02</div>
          <div className="way-title">Structure</div>
          <div className="way-desc">Ostaad converts project information into material requirements.</div>
        </div>
        <div className="card card-pad way-card">
          <div className="way-num mono">03</div>
          <div className="way-title">Estimate</div>
          <div className="way-desc">Get a structured estimate based on your project's requirements.</div>
        </div>
        <div className="card card-pad way-card">
          <div className="way-num mono">04</div>
          <div className="way-title">Compare</div>
          <div className="way-desc">Evaluate material costs using a consistent framework.</div>
        </div>
        <div className="card card--terracotta card-pad way-card spotlight">
          <div className="way-num mono" style={{"color":"rgba(255,255,255,.7)"}}>05</div>
          <div className="way-title" style={{"color":"#fff"}}>Decide</div>
          <div className="way-desc" style={{"color":"rgba(255,255,255,.85)"}}>Know what you're likely to spend before you start
            buying.</div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     THE ENGINE — AI FIELD
     ============================================================  */}
  <section className="section band-slate ai-section" id="engine">
    <div className="dot-field" style={{"opacity":".1"}}></div>
    <div className="container">
      <div className="text-center reveal">
        <div className="eyebrow on-dark" style={{"justifyContent":"center"}}>OSTAAD IS POWERED BY AI</div>
        <h2 className="ai-headline"
          style={{"color":"#fff","fontSize":"clamp(28px,4vw,42px)","fontWeight":"450","maxWidth":"640px","margin":"0 auto"}}><span>You
            don't need prompts.</span><span>You don't need spreadsheets.</span><span>The complexity stays behind the
            scenes.</span></h2>
      </div>

      <div className="card ai-card reveal"
        style={{"marginTop":"48px","background":"rgba(253,251,249,.1)","borderColor":"rgba(255,255,255,.14)","backdropFilter":"blur(20px)"}}>
        <svg className="ai-node-svg" viewBox="0 0 64 64">
          <g stroke="rgba(255,255,255,.8)" strokeWidth="1.3" fill="none">
            <circle cx="32" cy="14" r="4" />
            <circle cx="14" cy="44" r="4" />
            <circle cx="50" cy="44" r="4" />
            <circle cx="32" cy="32" r="3" />
            <line x1="32" y1="18" x2="32" y2="29" />
            <line x1="18" y1="41" x2="30" y2="34" />
            <line x1="46" y1="41" x2="34" y2="34" />
          </g>
        </svg>
        <div className="ai-status mono" style={{"color":"rgba(255,255,255,.6)"}}>CIVIX AI — WORKING IN THE BACKGROUND</div>
        <div className="ai-updates" id="aiUpdates">
          <div className="ai-update" style={{"color":"rgba(255,255,255,.8)"}}><span className="n mono" style={{"color":"#fff"}}>43</span>
            materials identified</div>
          <div className="ai-update" style={{"color":"rgba(255,255,255,.8)"}}><span className="n mono" style={{"color":"#fff"}}>12</span>
            suppliers compared</div>
          <div className="ai-update" style={{"color":"rgba(255,255,255,.8)"}}><span className="n mono" style={{"color":"#fff"}}>3</span>
            price changes flagged</div>
          <div className="ai-update" style={{"color":"rgba(255,255,255,.8)"}}><span className="n mono" style={{"color":"#fff"}}>2</span>
            decisions waiting</div>
        </div>
      </div>

      <div className="bento decision-grid reveal-stagger">
        <div className="card decision-card spotlight">
          <div className="decision-title mono">NEEDS YOUR DECISION</div>
          <div className="decision-name">Kitchen countertop</div>
          <div className="opt-row">
            <button type="button" className={`opt ${decisionOpt === "current" ? "selected" : ""}`} onClick={() => setDecisionOpt("current")}>
              <div className="opt-lbl">CURRENT</div>
              <div className="opt-val">₹84,000</div>
            </button>
            <button type="button" className={`opt rec ${decisionOpt === "alt" ? "selected" : ""}`} onClick={() => setDecisionOpt("alt")}>
              <div className="opt-lbl">RECOMMENDED · OPTION B</div>
              <div className="opt-val">₹71,000</div>
            </button>
          </div>
          <ul className="decision-why" id="decisionWhy">
            <li>Good specification match</li>
            <li>Available locally</li>
            <li>4 days faster</li>
          </ul>
          <a href="#cta" className="btn btn-sm btn-secondary" style={{"marginTop":"16px"}}>Review options <span
              className="arrow">→</span></a>
        </div>

        <div className="card card--sage decision-card spotlight">
          <div className="decision-title mono" style={{"color":"rgba(255,255,255,.7)"}}>OSTAAD RECOMMENDS</div>
          <div className="decision-name" style={{"color":"#fff"}}>Option B</div>
          <ul className="decision-why" style={{"color":"rgba(255,255,255,.85)"}}>
            <li style={{"color":"rgba(255,255,255,.85)"}}>₹13,400 lower</li>
            <li style={{"color":"rgba(255,255,255,.85)"}}>Equivalent specification</li>
            <li style={{"color":"rgba(255,255,255,.85)"}}>4 days faster</li>
          </ul>
          <a href="#cta" className="btn btn-sm btn-ghost-dark" style={{"marginTop":"16px"}}>Use Option B <span
              className="arrow">→</span></a>
        </div>
      </div>

      {/*  ============================================================
         PROJECT BENTO — part of the Civix AI section
         ============================================================  */}
      <div className="project-bento-block" id="project">
        <div className="section-head reveal">
          <div className="eyebrow">PROJECT BENTO</div>
          <h2>One project. Everything connected.</h2>
          <p>Your blueprint, material requirements and costing stay connected — a living project board, not fifteen
            disconnected screens.</p>
        </div>

        <div className="project-bento-grid reveal-stagger">
          <div className="project-magic-card project-plan-card">
            <div className="proj-visual-top">
              <svg className="project-engineering" width="100%" height="100%" viewBox="0 0 760 360"
                preserveAspectRatio="xMidYMid slice" aria-label="Project engineering drawing">
                <rect width="760" height="360" fill="#f4f1e9" />
                <rect x="18" y="18" width="724" height="324" fill="#fbf8f2" stroke="#d8d2c2" />
                <path d="M48 66h300v230H48zM348 66h182v104H348zM348 170h182v126H348z" className="project-wall" />
                <path d="M64 82h268v198H64zM364 82h150v72H364zM364 186h150v94H364z" className="project-floor" />
                <path d="M64 182h268M232 82v198M364 154h150" className="project-line" />
                <rect x="78" y="98" width="102" height="36" rx="7" className="project-sofa" />
                <rect x="78" y="140" width="36" height="96" rx="7" className="project-sofa" />
                <rect x="142" y="132" width="138" height="112" rx="14" className="project-rug" />
                <circle cx="211" cy="188" r="31" className="project-table" />
                <rect x="296" y="94" width="26" height="164" className="project-wood" />
                <text x="76" y="74" className="project-label">LIVING · 14' × 18'</text><text x="362" y="74"
                  className="project-label">KITCHEN</text><text x="362" y="178" className="project-label">BATH</text><text
                  x="546" y="82" className="project-label">N ↑</text>
                <line x1="64" y1="48" x2="332" y2="48" className="project-dim" /><text x="184" y="42"
                  className="project-small">12' — 0"</text>
                <line x1="42" y1="82" x2="42" y2="280" className="project-dim" /><text x="32" y="190" className="project-small"
                  transform="rotate(-90 32 190)">14' — 0"</text>
                <g className="project-callout">
                  <circle cx="585" cy="130" r="28" /><text x="576" y="134">W03</text>
                  <line x1="558" y1="130" x2="520" y2="130" />
                </g><text x="555" y="190" className="project-small">LEVEL 01</text><text x="555" y="212"
                  className="project-small">SCALE 1:100</text><text x="555" y="260" className="project-small">PLAN A-04 /
                  V03</text>
              </svg>
            </div>
            <div className="proj-visual-bottom">
              <div className="card-label">YOUR HOME</div>
              <div style={{"display":"flex","gap":"20px","marginTop":"8px","flexWrap":"wrap"}}>
                <div className="mono" style={{"fontSize":"14px","color":"var(--slate)"}}>G+1</div>
                <div className="mono" style={{"fontSize":"14px","color":"var(--slate)"}}>1,782 SQ FT</div>
                <div className="mono" style={{"fontSize":"14px","color":"var(--sage)"}}>68% READY</div>
              </div>
            </div>
          </div>

          <div className="project-magic-card project-materials-card">
            <div>
              <div className="project-card-kicker">MATERIALS · LIVE BOARD</div>
              <h3>Everything your project needs.</h3>
              <p className="project-card-copy">43 materials identified and kept connected to the plan, quantity and cost.
              </p>
            </div>
            <div className="project-materials-marquee" aria-label="Project materials">
              <div className="project-material-chip">FLOORING<strong>Urban Stone</strong><span>₹148 / SQ FT</span></div>
              <div className="project-material-chip">WOODWORK<strong>Teak Veneer</strong><span>₹1,240 / SQ FT</span></div>
              <div className="project-material-chip">PAINT<strong>Warm Ivory</strong><span>₹34 / SQ FT</span></div>
              <div className="project-material-chip">SANITARY<strong>Matte Ceramic</strong><span>₹18,400 / SET</span></div>
              <div className="project-material-chip">LIGHTING<strong>Linear LED</strong><span>₹2,850 / UNIT</span></div>
              <div className="project-material-chip">FLOORING<strong>Urban Stone</strong><span>₹148 / SQ FT</span></div>
            </div>
          </div>

          <div className="project-magic-card project-activity-card">
            <div className="project-card-kicker">UPDATES · TODAY</div>
            <h3>One board, always current.</h3>
            <div className="project-activity-list">
              <div className="project-activity"><i></i><span>Bathroom Tile recommendation ready</span></div>
              <div className="project-activity"><i></i><span>12 supplier quotes compared</span></div>
              <div className="project-activity"><i></i><span>Cost plan updated to ₹38.4L</span></div>
            </div>
          </div>

          <div className="project-magic-card project-flow-card">
            <div className="project-card-kicker">CONNECTED FLOW</div>
            <h3>From drawing to delivery.</h3>
            <p className="project-card-copy">Plan, material, cost and site status move together.</p>
            <div className="project-flow-map" aria-label="Connected project flow">
              <span className="project-flow-node on">PLAN</span><span className="project-flow-node">QTY</span><span
                className="project-flow-node">₹</span><span className="project-flow-node">SITE</span>
            </div>
          </div>

          <div className="project-magic-card project-calendar-card">
            <div>
              <div className="project-card-kicker">DELIVERY PLAN</div>
              <h3>Know what happens next.</h3>
              <p className="project-card-copy">Materials arrive when the site is ready for them.</p>
            </div>
            <div className="project-calendar" aria-label="September delivery calendar">
              <div className="project-calendar-head"><strong>SEPTEMBER 2026</strong><span>→</span></div>
              <div className="project-calendar-grid">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                <b></b><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b><b>6</b>
                <b>7</b><b>8</b><b>9</b><b>10</b><b>11</b><b>12</b><b>13</b>
                <b>14</b><b>15</b><b className="active">16</b><b>17</b><b>18</b><b>19</b><b>20</b>
              </div>
            </div>
          </div>

          <div className="project-magic-card project-date-card">
            <div>
              <div className="project-card-kicker">MATERIALS · SCHEDULING</div>
              <h3>Fix date for new materials.</h3>
              <p className="project-card-copy">Choose when the next order should arrive on site.</p>
            </div>
            <div className="project-date-mark" aria-label="Next material date"><strong>24</strong><span>SEP 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     AUDIENCE — Homeowners / Contractors / Enterprise
     ============================================================  */}
  <section className="section" id="audience">
    <div className="container">
      <div className="section-head reveal" style={{"margin":"0 auto","textAlign":"center","maxWidth":"560px"}}>
        <div className="eyebrow" style={{"justifyContent":"center"}}>BUILT FOR EVERYONE ON THE PROJECT</div>
        <h2>You focus on building. Ostaad helps with the numbers.</h2>
      </div>

      <div className="bento aud-grid reveal-stagger" id="contractors">
        <div className="card aud-card">
          <svg className="aud-icon" viewBox="0 0 24 24">
            <path d="M4 20V10l8-6 8 6v10" />
            <path d="M9 20v-6h6v6" />
          </svg>
          <div className="aud-title">Build your bari.<br />Don't become a material expert.</div>
          <div className="aud-desc">Whether you're building a new home or renovating, Ostaad helps you understand the
            material side of your project.</div>
          <div className="aud-stats">
            <div>
              <div className="v mono">43</div>
              <div className="k">MATERIALS TRACKED</div>
            </div>
            <div>
              <div className="v mono">92%</div>
              <div className="k">CONFIDENCE</div>
            </div>
          </div>
        </div>
        <div className="card aud-card">
          <svg className="aud-icon" viewBox="0 0 24 24">
            <path d="M3 21l6-6M21 3l-6 6M9 15l6-6M4 13l7 7 9-9-7-7z" />
          </svg>
          <div className="aud-title">Estimate faster.<br />Quote with more confidence.</div>
          <div className="aud-desc">Turn project drawings into structured material requirements and costing. Less manual
            calculation, more consistent estimates.</div>
          <div className="aud-stats">
            <div>
              <div className="v mono">4d</div>
              <div className="k">FASTER QUOTES</div>
            </div>
            <div>
              <div className="v mono">184</div>
              <div className="k">MATERIALS/PROJECT</div>
            </div>
          </div>
          <a href="#cta" className="btn btn-sm btn-secondary" style={{"marginTop":"16px"}}>Talk to Ostaad <span
              className="arrow">→</span></a>
        </div>
        <div className="card aud-card" id="enterprise">
          <svg className="aud-icon" viewBox="0 0 24 24">
            <rect x="3" y="10" width="6" height="11" />
            <rect x="9" y="3" width="6" height="18" />
            <rect x="15" y="7" width="6" height="14" />
          </svg>
          <div className="aud-title">One standard.<br />Many projects.</div>
          <div className="aud-desc">For developers and larger construction teams — standardise material requirements,
            compare costs and build a reliable project cost database.</div>
          <div className="aud-stats">
            <div>
              <div className="v mono" data-ticker data-target="24" data-decimals="0">0</div>
              <div className="k">PROJECTS</div>
            </div>
            <div>
              <div className="v mono" data-ticker data-target="18.4" data-prefix="₹" data-suffix="L" data-decimals="1">₹0.0L
              </div>
              <div className="k">PROCUREMENT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     PROOF / EXAMPLE PROJECT
     ============================================================  */}
  <section className="section" id="proof" style={{"paddingTop":"0"}}>
    <div className="container">
      <div className="card proof-card reveal">
        <div>
          <div className="proof-quote">"Sir, eta ₹8 lakh porbe" became a bill of 43 materials, 12 supplier quotes, and one
            number both sides agreed on.</div>
        </div>
        <div className="proof-stats">
          <div>
            <div className="v mono">₹38.4L</div>
            <div className="k">final estimate</div>
          </div>
          <div>
            <div className="v mono">12</div>
            <div className="k">supplier quotes compared</div>
          </div>
          <div>
            <div className="v mono">18%</div>
            <div className="k">variance found vs. verbal quote</div>
          </div>
          <div>
            <div className="v mono">6 days</div>
            <div className="k">blueprint to structured estimate</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  ============================================================
     FAQ
     ============================================================  */}
  <section className="section" id="faq">
    <div className="container">
      <div className="section-head reveal" style={{"margin":"0 auto","textAlign":"center","maxWidth":"500px"}}>
        <div className="eyebrow" style={{"justifyContent":"center"}}>FAQ</div>
        <h2>Trust, answered plainly.</h2>
      </div>
      
      <div className="faq-list reveal" id="faqList">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={item.q} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <span>{item.q}</span>
                <span className="plus mono">{isOpen ? "−" : "+"}</span>
              </button>
              <div
                className="faq-a"
                style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}
              >
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  </section>

  {/*  ============================================================
     FINAL CTA
     ============================================================  */}
  <section className="final-cta" id="cta">
    <div className="final-glow"></div>
    <div className="container" style={{"position":"relative"}}>
      <h2>Your bari is complicated.<br />Building it shouldn't be.</h2>
      <div className="banglish">Dekhe nin. Jene nin. Tarpor build korun.</div>
      <div>
        <a href="/contact" className="btn btn-primary beam">Start Your Project <span className="arrow">→</span></a>
      </div>
    </div>
  </section>

    </main>
  );
}
