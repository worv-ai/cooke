/* Door intro for the COOK·E page. A closed shopfront is drawn over the page: the sign on the door flips from
 * CLOSED to OPEN, the lights come on, the door swings in and the view walks through the doorway into the page.
 * The doorway is a real hole in the wall (see intro.css), so the page itself shows through the glass and the open door.
 * The shopfront carries no name and no awning of its own. While the intro runs, the page's awning is lifted above
 * the shopfront (html.intro-running, intro.css), so it drops in front of the wall as the visitor walks in and is
 * already in place when the shopfront fades. The logo and title come in once the visitor is inside.
 *
 * It plays on every load. A click, tap, key or scroll plays the rest at 4× speed, and so does "Skip intro".
 * It does not run with prefers-reduced-motion or without GSAP.
 * Hand-off to main.js: window.COOKE_INTRO.entering resolves as the walk through the doorway starts (the awning drops),
 * and .entered when it ends (logo, title and video come in). Copy on the menu board comes from content.js. */
(() => {
  const root = document.documentElement;
  const unpend = () => root.classList.remove("intro-pending");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap) { unpend(); return; }

  const C = window.CONTENT || {};
  const tasks = C.benchmark?.tasks || [];
  const agents = C.results?.agents?.length || 0;
  const M = C.benchmark?.modes;
  const modes = M ? M.rows.length * M.cols.length : 0;

  let entering;
  let entered;
  window.COOKE_INTRO = {
    entering: new Promise((resolve) => { entering = resolve; }),
    entered: new Promise((resolve) => { entered = resolve; }),
  };

  /* ---------- Markup ---------- */

  const lamp = (side) => `<div class="intro-lamp is-${side}"><i class="intro-halo"></i><svg viewBox="0 0 40 64">
    <rect x="15" y="0" width="10" height="16" rx="2" fill="#5b4031"/>
    <path d="M20 16v6" stroke="#a07022" stroke-width="3"/>
    <path d="M7 22h26l-5 7H12z" fill="#a07022"/>
    <rect class="lamp-glass" x="12" y="29" width="16" height="22" rx="2"/>
    <path d="M12 40h16M20 29v22" stroke="#a07022" stroke-width="1.2" opacity=".6"/>
    <path d="M10 51h20l-3 5H13z" fill="#a07022"/>
  </svg></div>`;

  // The dishes go on the menu. Cleanup is the house's own chore, so it sits under a rule as a to-do.
  const CHORES = new Set(["cleanup"]);
  const dishes = tasks.filter((t) => !CHORES.has(t.id));
  const chores = tasks.filter((t) => CHORES.has(t.id));
  const list = (ts) => `<ul>${ts.map((t) => `<li>${t.name}</li>`).join("")}</ul>`;
  const menu = tasks.length ? `<div class="intro-menu">
    <div class="intro-board"><b>Today's menu</b>${list(dishes)}
      ${chores.length ? `<hr><b>To do</b>${list(chores)}` : ""}
      ${agents && modes ? `<small>${agents} agents · ${modes} modes</small>` : ""}</div>
    <div class="intro-legs"><i></i><i></i></div>
  </div>` : "";

  const el = document.createElement("div");
  el.className = "intro";
  el.innerHTML = `
    <div class="intro-scene" aria-hidden="true">
      <div class="intro-way">
        <div class="intro-dim"></div>
        <div class="intro-glow"></div>
        <div class="intro-door">
          <div class="intro-glass">
            <div class="intro-hang">
              <i class="intro-hook"></i>
              <svg class="intro-cord" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M7 20L50 1L93 20"/></svg>
              <div class="intro-card">
                <div class="intro-face is-closed"><small>Sorry, we're</small><b>CLOSED</b></div>
                <div class="intro-face is-open"><small>Come in, we're</small><b>OPEN</b></div>
              </div>
            </div>
          </div>
          <i class="intro-panel"></i>
          <div class="intro-handle"><i class="intro-lever"></i></div>
          <i class="intro-kick"></i>
          <i class="intro-shade"></i>
        </div>
        <svg class="intro-bell" viewBox="0 0 40 56">
          <path d="M20 0v9" stroke="#a07022" stroke-width="3"/>
          <path d="M20 8c-7.5 0-11.5 6.5-11.5 15v10L4 40h32l-4.5-7V23c0-8.5-4-15-11.5-15z" fill="#d9a441"/>
          <path d="M13.5 24c0-5 1.8-8.2 4.8-9.4" fill="none" stroke="#f4d58e" stroke-width="2" stroke-linecap="round"/>
          <circle cx="20" cy="45" r="4.2" fill="#a07022"/>
        </svg>
      </div>
      <div class="intro-floor"></div>
      <div class="intro-spill"></div>
      <div class="intro-step"></div>
      ${lamp("l")}${lamp("r")}
      <div class="intro-plant"><i class="leaf is-a"></i><i class="leaf is-b"></i><i class="leaf is-c"></i><i class="pot"></i><i class="rim"></i></div>
      ${menu}
    </div>
    <button class="intro-skip" type="button">Skip intro</button>`;
  document.body.append(el);
  root.classList.add("intro-running");
  unpend();

  const $ = (s) => el.querySelector(s);
  const $$ = (s) => [...el.querySelectorAll(s)];
  const scene = $(".intro-scene");
  const way = $(".intro-way");
  const door = $(".intro-door");
  const hang = $(".intro-hang");
  const lever = $(".intro-lever");

  // The browser bar takes the wall colour while the intro runs.
  const meta = document.querySelector('meta[name="theme-color"]');
  const themeColor = meta?.content;
  if (meta) meta.content = "#2b231f";

  /* ---------- Ending and skipping ---------- */

  let started = false;
  let fast = false;
  let finished = false;
  let safety = 0;
  const KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
  const onKey = (e) => { if (KEYS.has(e.key)) e.preventDefault(); hurry(); };
  const onScroll = (e) => { e.preventDefault(); hurry(); };

  const finish = () => {
    if (finished) return;
    finished = true;
    entering();
    entered();
    root.classList.remove("intro-running");
    clearTimeout(safety);
    removeEventListener("keydown", onKey, true);
    removeEventListener("wheel", onScroll);
    removeEventListener("touchmove", onScroll);
    tl.kill();
    el.remove();
    if (meta && themeColor) meta.content = themeColor;
  };

  /* ---------- Timeline ---------- */

  gsap.set(door, { transformOrigin: "0% 50%" });
  gsap.set(hang, { transformOrigin: "50% 0%" });

  // Walking in: zoom about the open part of the doorway (the door keeps about 18% on the hinge side) until it fills the screen.
  const walk = { x: 0, y: 0, s: 1 };
  const measure = () => {
    const r = way.getBoundingClientRect();
    const kept = 0.18;
    const cx = r.left + r.width * (kept + (1 - kept) / 2);
    const cy = r.top + r.height / 2;
    walk.s = Math.max(innerWidth / (r.width * (1 - kept)), innerHeight / r.height) * 1.12;
    walk.x = innerWidth / 2 - cx;
    walk.y = innerHeight / 2 - cy;
    gsap.set(scene, { transformOrigin: `${cx}px ${cy}px` });
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" }, onComplete: finish });
  // 1. The sign: a nudge, the flip from CLOSED to OPEN, then it swings to rest on its cord.
  tl.to(hang, { rotation: -8, duration: 0.2, ease: "sine.out" }, 0.4)
    .to($(".intro-card"), { rotationY: 180, duration: 0.6, ease: "back.out(1.7)" }, 0.53)
    .to(hang, { rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.3)" }, 0.6)
    // The lights come on inside and beside the door.
    .to($(".intro-dim"), { autoAlpha: 0, duration: 0.45 }, 0.8)
    .to($(".intro-glow"), { autoAlpha: 1, duration: 0.45 }, 0.8)
    .to($$(".lamp-glass"), { opacity: 1, duration: 0.25, stagger: 0.08 }, 0.8)
    .to($$(".intro-halo"), { opacity: 1, duration: 0.35, stagger: 0.08 }, 0.8)
    // 2. The door: the lever goes down, the door swings in and rings the bell.
    .to(lever, { rotation: -30, duration: 0.16, ease: "power2.in" }, 1.4)
    .addLabel("open", 1.57)
    .to(door, { rotationY: 82, duration: 0.95, ease: "power2.inOut" }, "open")
    .to($(".intro-shade"), { opacity: 0.6, duration: 0.95, ease: "power2.inOut" }, "open")
    .to(lever, { rotation: 0, duration: 0.3 }, "open+=0.3")
    .to($(".intro-spill"), { opacity: 1, duration: 0.6 }, "open+=0.15")
    .to($(".intro-bell"), {
      transformOrigin: "50% 0%",
      keyframes: [{ rotation: 18, duration: 0.12 }, { rotation: -13, duration: 0.16 }, { rotation: 8, duration: 0.16 }, { rotation: -4, duration: 0.16 }, { rotation: 0, duration: 0.2 }],
    }, "open+=0.08")
    // 3. Walk in through the doorway while the page's awning drops in front of the wall, then let go of the overlay.
    .call(() => entering(), null, "open+=0.6")
    .call(measure, null, "open+=0.6")
    .to(scene, { x: () => walk.x, y: () => walk.y, scale: () => walk.s, duration: 1, ease: "power3.in" }, "open+=0.6")
    .to($(".intro-glow"), { autoAlpha: 0, duration: 0.5 }, "open+=1.05")
    .to(el, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, "open+=1.3");

  const start = () => { if (!started) { started = true; tl.play(); } };
  function hurry() {
    if (!fast) { fast = true; tl.timeScale(4); }
    start();
  }

  addEventListener("keydown", onKey, true);
  addEventListener("wheel", onScroll, { passive: false });
  addEventListener("touchmove", onScroll, { passive: false });
  el.addEventListener("pointerdown", hurry);
  $(".intro-skip").addEventListener("click", hurry);
  safety = setTimeout(finish, 12000);

  // Start once the sign's font is in, or after 0.8 s, whichever comes first.
  let fonts = Promise.resolve();
  try { fonts = Promise.all([document.fonts.load('800 1em "Inter"'), document.fonts.load('500 1em "Inter"')]); } catch { /* no font loading API */ }
  Promise.race([fonts.catch(() => {}), new Promise((r) => setTimeout(r, 800))]).then(() => setTimeout(start, 150));
})();
