/* =========================================================
   EXPERIENCE POINTS — Global JS (Multi-page)
   - starfield background
   - smooth scroll (data-scroll)
   - toast
   - lightweight local analytics queue
   - waitlist + practice signup (client-side placeholder)
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Set year if present
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll
  $$("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scroll");
      const el = target ? document.querySelector(target) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Highlight active nav link (based on pathname)
  (function setActiveNav() {
    const path = (location.pathname || "").toLowerCase();
    const links = $$("nav.navlinks a");
    if (!links.length) return;

    let matchHref = null;

    // Normalize common cases
    if (path.endsWith("/") || path.endsWith("/index.html")) matchHref = "/index.html";
    else if (path.includes("/pages/")) matchHref = path.substring(path.lastIndexOf("/pages/"));

    // Apply aria-current
    links.forEach((a) => a.removeAttribute("aria-current"));

    links.forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();

      // Home can be "/" or "/index.html" or "../index.html"
      const isHome =
        (path.endsWith("/") || path.endsWith("/index.html")) &&
        (href === "/index.html" || href === "/" || href.endsWith("index.html"));

      const isMatch = matchHref && href.endsWith(matchHref);

      if (isHome || isMatch) a.setAttribute("aria-current", "page");
    });
  })();

  // Toast
  let toastEl = null;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.position = "fixed";
      toastEl.style.left = "50%";
      toastEl.style.bottom = "18px";
      toastEl.style.transform = "translateX(-50%)";
      toastEl.style.zIndex = "9999";
      toastEl.style.maxWidth = "min(740px, calc(100% - 24px))";
      toastEl.style.padding = "12px 14px";
      toastEl.style.borderRadius = "16px";
      toastEl.style.background = "rgba(10, 20, 17, 0.82)";
      toastEl.style.backdropFilter = "blur(12px)";
      toastEl.style.border = "1px solid rgba(255,255,255,0.14)";
      toastEl.style.boxShadow = "0 22px 55px rgba(0,0,0,0.55)";
      toastEl.style.color = "rgba(234,247,240,0.92)";
      toastEl.style.fontSize = "13px";
      toastEl.style.lineHeight = "1.45";
      toastEl.style.opacity = "0";
      toastEl.style.transition = "opacity 220ms ease, transform 220ms ease";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(6px)";
    }, 2800);
  }

  // Lightweight analytics placeholder
  function track(event, data) {
    try {
      const key = "xp_events";
      const q = JSON.parse(localStorage.getItem(key) || "[]");
      q.push({ event, data: data || {}, ts: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(q));
    } catch (err) {}
    // eslint-disable-next-line no-console
    console.log("[XP]", event, data || {});
  }

  // Generic signup handler (client-side placeholder)
  function attachSignup(formId, storageKey, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return;

    const msg = form.querySelector("[data-msg]");
    const nameEl = form.querySelector("input[name='name']");
    const emailEl = form.querySelector("input[name='email']");
    const noteEl = form.querySelector("input[name='note'], textarea[name='note']");

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameEl ? (nameEl.value || "").trim() : "";
      const email = emailEl ? (emailEl.value || "").trim() : "";
      const note = noteEl ? (noteEl.value || "").trim() : "";

      if (msg) {
        msg.textContent = "";
        msg.style.opacity = "1";
      }

      if (!email || !isValidEmail(email)) {
        if (msg) {
          msg.textContent = "Please enter a valid email.";
          msg.style.color = "rgba(255,211,106,0.95)";
        }
        if (emailEl) emailEl.focus();
        track("signup_invalid", { formId, reason: "email" });
        return;
      }

      const payload = {
        name: name || null,
        email,
        note: note || null,
        formId,
        ts: new Date().toISOString()
      };

      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        existing.push(payload);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch (err) {
        // even if storage fails, show success
      }

      if (msg) {
        msg.textContent = successMessage;
        msg.style.color = "rgba(106,247,197,0.95)";
      }

      track("signup_submit", payload);
      form.reset();
    });
  }

  // Attach signups if present
  attachSignup("waitlistForm", "xp_waitlist", "✅ You’re on the list. You’ll receive a quiet update when early access opens.");
  attachSignup("practiceNotifyForm", "xp_practice_notify", "✅ Noted. You’ll receive a quiet update when Practice opens.");

  // Checkout placeholders
  $$("[data-action='checkout']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tier = btn.getAttribute("data-tier") || "Plan";
      toast(`Checkout for "${tier}" isn’t connected yet — this is a launch-ready placeholder.`);
      track("checkout_click", { tier });
    });
  });

  // Starfield background (shared)
  (function starfield() {
    const canvas = document.getElementById("stars");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    let W = 0, H = 0;
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const stars = [];
    const STAR_COUNT = 160;

    const prefersReduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
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
          ph: rand(0, Math.PI * 2)
        });
      }
    }

    let mouseX = 0.5, mouseY = 0.4;

    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX / Math.max(1, W);
        mouseY = e.clientY / Math.max(1, H);
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      resize();
      clearTimeout(canvas._rt);
      canvas._rt = setTimeout(makeStars, 160);
    }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Subtle vignette
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.65);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // Parallax
      const px = (mouseX - 0.5) * 10;
      const py = (mouseY - 0.5) * 10;

      for (const s of stars) {
        s.ph += s.tw;
        const twinkle = (Math.sin(s.ph) * 0.08) + 0.92;

        const x = s.x + px * (s.r * 0.35);
        const y = s.y + py * (s.r * 0.35);

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5.2);
        g.addColorStop(0, `rgba(234,247,240,${Math.min(0.10, s.a * 0.25)})`);
        g.addColorStop(1, "rgba(234,247,240,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 5.2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(234,247,240,${(s.a * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReduce) {
          s.x += s.vx;
          s.y += s.vy;
        }

        // Wrap
        if (s.y > H + 10) { s.y = -10; s.x = rand(0, W); }
        if (s.x > W + 10) s.x = -10;
        if (s.x < -10) s.x = W + 10;
      }

      if (!prefersReduce) requestAnimationFrame(draw);
    }

    resize();
    makeStars();
    requestAnimationFrame(draw);
  })();

  // Initial page view
  track("page_view", { path: location.pathname });

})();
