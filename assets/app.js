/* /assets/app.js
   Experience Points — Global JS
   - Mobile nav toggle (accessible)
   - Active nav highlighting via <html data-page="...">
   - Smooth anchor scrolling
   - Starfield background (expects: <canvas class="stars"></canvas>)
   - Tiny helpers for forms (optional)
*/

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Year in footer ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Active nav ----------
  // Your pages use: <html lang="en" data-page="practice">
  const page = document.documentElement.getAttribute("data-page");
  if (page) {
    // Desktop nav: <a ... data-nav="practice">
    $$("[data-nav]").forEach((a) => {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });

    // Mobile nav (if any): match href endings or add data-nav too if you want
    // If your mobile links also have data-nav, they’ll be handled above.
  }

  // ---------- Mobile menu toggle ----------
  // Your Practice page currently uses:
  // button.menu-btn + div#mobileNav.mobile-nav[hidden]
  //
  // This supports BOTH patterns:
  // 1) .menu-btn controls #mobileNav
  // 2) .nav-toggle controls .mobile-menu
  //
  function setupMobileMenu() {
    // Pattern A: menu-btn + #mobileNav
    const btnA = $(".menu-btn");
    const panelA = $("#mobileNav");

    if (btnA && panelA) {
      const links = $$("a", panelA);

      const setOpen = (open) => {
        btnA.setAttribute("aria-expanded", open ? "true" : "false");
        panelA.hidden = !open;
      };

      // initialize
      setOpen(false);

      btnA.addEventListener("click", () => {
        const open = btnA.getAttribute("aria-expanded") === "true";
        setOpen(!open);
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
      });

      links.forEach((a) => a.addEventListener("click", () => setOpen(false)));
      return; // don’t double-bind if this pattern exists
    }

    // Pattern B: nav-toggle + .mobile-menu
    const btnB = $(".nav-toggle");
    const panelB = $(".mobile-menu");
    if (btnB && panelB) {
      const links = $$("a", panelB);

      const setOpen = (open) => {
        btnB.setAttribute("aria-expanded", open ? "true" : "false");
        // Prefer hidden attribute for CSS friendliness
        panelB.hidden = !open;
        // Optional class hook
        panelB.classList.toggle("is-open", open);
      };

      setOpen(false);

      btnB.addEventListener("click", () => {
        const open = btnB.getAttribute("aria-expanded") === "true";
        setOpen(!open);
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
      });

      links.forEach((a) => a.addEventListener("click", () => setOpen(false)));
    }
  }
  setupMobileMenu();

  // ---------- Smooth anchor scrolling ----------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- Starfield ----------
  // Your pages currently use: <canvas class="stars"></canvas>
  // This code will also accept: <canvas id="stars"></canvas>
  function initStarfield() {
    const canvas = document.querySelector("canvas.stars") || document.querySelector("canvas#stars");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 0,
      H = 0;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const prefersReduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const STAR_COUNT = 160;
    const stars = [];

    const rand = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function makeStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(0.6, 1.9),
          a: rand(0.10, 0.75),
          vx: rand(-0.08, 0.08),
          vy: rand(0.02, 0.14),
          tw: rand(0.002, 0.010),
          ph: rand(0, Math.PI * 2),
        });
      }
    }

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.4;

    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      { passive: true }
    );

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // subtle vignette
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.65);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // parallax from pointer
      const px = (mouseX / Math.max(1, W) - 0.5) * 10;
      const py = (mouseY / Math.max(1, H) - 0.5) * 10;

      for (const s of stars) {
        s.ph += s.tw;
        const twinkle = Math.sin(s.ph) * 0.08 + 0.92;

        const x = s.x + px * (s.r * 0.35);
        const y = s.y + py * (s.r * 0.35);

        // glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5.2);
        g.addColorStop(0, `rgba(234,247,240,${Math.min(0.10, s.a * 0.25)})`);
        g.addColorStop(1, "rgba(234,247,240,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 5.2, 0, Math.PI * 2);
        ctx.fill();

        // core star
        ctx.fillStyle = `rgba(234,247,240,${(s.a * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReduce) {
          s.x += s.vx;
          s.y += s.vy;
        }

        // wrap
        if (s.y > H + 10) {
          s.y = -10;
          s.x = rand(0, W);
        }
        if (s.x > W + 10) s.x = -10;
        if (s.x < -10) s.x = W + 10;
      }

      if (!prefersReduce) requestAnimationFrame(draw);
    }

    resize();
    makeStars();
    requestAnimationFrame(draw);

    let rT = null;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(rT);
        rT = setTimeout(() => {
          resize();
          makeStars();
        }, 180);
      },
      { passive: true }
    );
  }

  initStarfield();
})();
