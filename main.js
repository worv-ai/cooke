/* Renders the page from content.js, then wires up motion. Copy changes belong in content.js. */
(() => {
  const C = window.CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const minus = (n, d = 2) => n.toFixed(d).replace("-", "−");

  /* ---------- Shared markup ---------- */

  const face = (antenna) => `<span class="wm-o" aria-hidden="true"><svg viewBox="0 0 74 90">
    ${antenna ? '<path d="M37 12V-2" stroke="currentColor" stroke-width="5"/><circle cx="37" cy="-3" r="6" fill="currentColor"/>' : ""}
    <rect x="1" y="12" width="72" height="78" rx="23" fill="currentColor"/>
    <g class="wm-eye" fill="var(--bg)"><circle cx="24" cy="44" r="6"/><circle cx="50" cy="44" r="6"/></g>
    <path d="M26 62c6 6 16 6 22 0" fill="none" stroke="var(--bg)" stroke-width="5" stroke-linecap="round"/>
  </svg></span>`;

  const wordmark = () => `<span class="wm" role="img" aria-label="BistROBO"><span class="wm-b">Bist</span><span class="wm-r">R</span>${face(false)}<span class="wm-r">B</span>${face(true)}</span>`;

  const awning = () => `<div class="awning" aria-hidden="true">${"<i></i>".repeat(20)}</div>`;

  const media = (m) => {
    if (m.src) {
      const isVideo = /\.(mp4|webm|mov)$/i.test(m.src);
      const el = isVideo
        ? `<video src="${m.src}" ${m.poster ? `poster="${m.poster}"` : ""} muted loop playsinline preload="metadata" aria-label="${m.label}"></video>`
        : `<img src="${m.src}" alt="${m.label}" loading="lazy">`;
      const style = m.ratio ? ` style="aspect-ratio:${m.ratio}"` : "";
      return `<div class="media${m.plate ? " is-plate" : ""}"${style}>${el}</div>`;
    }
    return `<div class="media"><div class="ph${m.poster ? " has-poster" : ""}"${m.poster ? ` style="--poster:url('${m.poster}')"` : ""}>
      ${m.timecode ? '<span class="ph-tc" aria-hidden="true">00:00.0</span>' : ""}
      <span class="ph-tag">Video placeholder</span>
      <span class="ph-title">${m.label}</span>
      ${m.spec ? `<span class="ph-spec">${m.spec}</span>` : ""}
    </div></div>`;
  };

  // Section opening: a plain, numbered title, then the section's claim and text.
  const head = ({ n, title, claim, body, badge }) => `<header class="sec-head">
    <h2>${n ? `<span class="sec-no">${pad(n)}</span>` : ""}${title}</h2>
    ${badge ? `<span class="badge">${badge}</span>` : ""}
    ${claim ? `<p class="claim">${claim}</p>` : ""}
    ${body ? `<p class="lede">${body}</p>` : ""}
  </header>`;

  const schematic = (html) => `<figure class="fig sch-fig" data-r>${html}</figure>`;

  const glyph = (k) => `<svg class="g g-${k}" viewBox="0 0 16 16" aria-label="${C.gap.table.legend[k]}" role="img">${
    k === "y" ? '<path d="M2.5 8.5 6.5 12.5 13.5 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
    : k === "h" ? '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 2a6 6 0 0 0 0 12z" fill="currentColor"/>'
    : '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
  }</svg>`;

  const button = (l, pending) => l.href
    ? `<a class="btn" href="${l.href}">${l.label}</a>`
    : `<span class="btn is-off" aria-disabled="true">${l.label}<small>${pending}</small></span>`;

  const playIcons = `<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>`;
  const track = (id, label) => `<div class="ro-track"${id ? ` id="${id}"` : ""} role="slider" tabindex="0" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i><b></b></div>`;

  // A small switch: an optional label, then one button per option.
  const seg = (cls, label, options) => `<div class="seg is-sm ${cls}" role="group" aria-label="${label}">${label ? `<span class="seg-label" aria-hidden="true">${label}</span>` : ""}${options.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>`;

  // One task player: the video with its controls and a line on the task, beside it the dialogue and
  // a small timeline. The task players below fill in the video, the speeds, and the dialogue.
  const player = (t) => {
    const sw = C.tasks.switches;
    return `<div class="tp">
      <div class="tp-main">
        <div class="tp-media"></div>
        <div class="ro-bar">
          <button class="ro-play is-playing" type="button" aria-label="Pause">${playIcons}</button>
          ${track("", "Playback position")}
        </div>
        <div class="tp-ctl">
          ${seg("tp-lat", sw.lat.label, sw.lat.options)}
          <div class="seg is-sm tp-speed" role="group" aria-label="Playback speed"></div>
        </div>
        <p class="tp-line"><b>${t.behavior}</b>${t.line}</p>
        <p class="tp-meta"></p>
      </div>
      <div class="tp-side"><div class="tp-side-in">
        <div class="ro-chat">
          <p class="ro-chat-head"><b>${C.tasks.chat.title}</b><span class="ro-count"></span></p>
          <ol class="ro-log" aria-live="polite"></ol>
        </div>
        <div class="tl">
          <p class="tl-head"><span>${C.tasks.timeline.title}</span><b class="tl-mode"></b></p>
          <canvas class="tl-canvas" role="img" aria-label="Schematic timeline of human and robot activity in the selected latency mode"></canvas>
          <p class="tl-read"></p>
        </div>
      </div></div>
    </div>`;
  };

  /* ---------- Sections ---------- */

  /* [label, id, section number, also shown in the short top bar] */
  const navItems = [
    ["Abstract", "abstract", 0, true], ["Overview", "overview", 0, true], ["Motivation", "gap", 1, true],
    ["Tasks", "tasks", 2, true], ["Metrics", "metrics", 3, true], ["Resources", "resources", 0, true],
  ];

  const matrix = (() => {
    const t = C.gap.table;
    const grouped = t.columns.reduce((acc, c) => {
      const last = acc[acc.length - 1];
      if (last && last.name === c.group) last.span += 1;
      else acc.push({ name: c.group, span: 1 });
      return acc;
    }, []);
    const cells = (s) => [...s].map((k) => `<td>${glyph(k)}</td>`).join("");
    const body = t.groups.map((g) => `
      <tr class="m-sec"><td colspan="8">${g.name}</td></tr>
      ${g.rows.map(([n, s]) => `<tr><td>${n}</td>${cells(s)}</tr>`).join("")}
    `).join("");
    return `<div class="matrix">
      <p class="matrix-cap"><b>Table 1.</b> ${t.caption}</p>
      <div class="matrix-scroll"><table>
        <thead>
          <tr class="m-grp"><th></th>${grouped.map((g) => `<th colspan="${g.span}">${g.name}</th>`).join("")}</tr>
          <tr><th>Benchmark</th>${t.columns.map((c) => `<th>${c.name}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${body}
          <tr class="m-gap"><td colspan="8"></td></tr>
          <tr class="m-ours"><td>${t.ours[0]}</td>${cells(t.ours[1])}</tr>
        </tbody>
      </table></div>
      <div class="matrix-legend">${["y", "h", "n"].map((k) => `<span>${glyph(k)}${t.legend[k]}</span>`).join("")}</div>
    </div>`;
  })();

  const hero = `<section class="hero" id="top">
    <div class="hero-media">${media(C.hero.media)}<div class="hero-shade"></div></div>
    ${awning()}
    <div class="hero-body wrap">
      <h1>${wordmark()}</h1>
      <p class="hero-title">${C.hero.title}</p>
      <p class="hero-authors">${C.hero.authors}</p>
      <div class="btns">${C.hero.links.map((l) => button(l, C.hero.pending)).join("")}</div>
    </div>
    <a class="hero-cue" href="#abstract">Scroll to explore</a>
  </section>`;

  const abstract = `<section class="pad" id="abstract"><div class="wrap">
    ${head({ title: C.abstract.kicker, claim: C.abstract.lead })}
    <p class="abs-body">${C.abstract.body}</p>
  </div></section>`;

  const overview = `<section class="pad" id="overview"><div class="wrap">
    ${head({ title: C.overview.kicker, body: C.overview.body })}
    ${schematic(FIG.overview.html(C.overview, C.tasks.items), C.overview.caption)}
  </div></section>`;

  const B = C.benchmark;
  const gap = `<section class="pad" id="gap"><div class="wrap">
    ${head({ n: 1, title: C.gap.kicker, claim: C.gap.heading })}
    <ol class="gap-list">${C.gap.items.map((it, i) => `<li><div class="gap-t"><span>${pad(i + 1)}</span><h3>${it.title}</h3></div><p>${it.body}</p></li>`).join("")}</ol>
    ${matrix}
    <div class="bm" id="benchmark">
      <h3 class="bm-claim">${B.heading}</h3>
      <p class="lede">${B.body}</p>
      <div class="principles">${B.principles.map((p) => `<article class="principle"><span>${p.role}</span><h3>${p.name}</h3><p>${p.body}</p></article>`).join("")}</div>
      ${schematic(FIG.decision.html(B.decision))}
      <dl class="setup" aria-label="${B.setup.title}">${B.setup.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="hsim" id="human-sim">
        <div>
          <h3>${B.human.title}</h3>
          <ol class="hsim-flow">${B.human.flow.map(([step, tone]) => `<li class="t-${tone}">${step}</li>`).join("")}</ol>
        </div>
        <p>${B.human.body}</p>
      </div>
    </div>
  </div></section>`;

  const P = C.tasks.prompts;
  const tasks = `<section class="pad" id="tasks"><div class="wrap">
    ${head({ n: 2, title: C.tasks.kicker, claim: C.tasks.heading, body: C.tasks.body })}
    <details class="ev-more">
      <summary>${P.title}</summary>
      <div class="ev-grid">
        <blockquote class="ev-quote">
          ${P.robot.map((l) => `<p>${l}</p>`).join("")}
          <p class="ev-switch"><b>+ Comm. on</b>${P.on}</p>
          <p class="ev-switch"><b>+ Comm. off</b>${P.off}</p>
        </blockquote>
        <dl class="ev-settings">${P.settings.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      </div>
    </details>
    <div class="panel tasks-panel" data-r>
      <div class="tabs" id="task-tabs" role="group" aria-label="Task">
        ${C.tasks.items.map((t, i) => `<button type="button" data-v="${i}" aria-pressed="${i === 0}"><b>${pad(i + 1)}</b>${t.name}</button>`).join("")}
      </div>
      ${C.tasks.items.map((t, i) => `<article class="task"${i ? " hidden" : ""}>${player(t)}${FIG.task(t)}</article>`).join("")}
    </div>
  </div></section>`;

  const tex = (list) => list.map((src) => `<div class="tex" data-tex="${src}">${src}</div>`).join("");
  const metricCard = (m) => `<article class="mt-card">
    <h3>${m.name}</h3>
    <p class="mt-short">${m.short}</p>
    ${tex(m.tex)}
    <p class="mt-where">${m.where}</p>
    <ul class="stops">${m.stops.map(([k, v, tone]) => `<li class="t-${tone}"><b>${k}</b><span>${v}</span></li>`).join("")}</ul>
  </article>`;
  const SC = C.metrics.scatter;
  const metrics = `<section class="pad" id="metrics"><div class="wrap">
    ${head({ n: 3, title: C.metrics.kicker, claim: C.metrics.heading, body: C.metrics.body })}
    <div class="sc" data-r>
      <div class="sc-top">
        <h3>${SC.title}<span class="badge">${C.metrics.badge}</span></h3>
        <div class="axis-ctl">
          <div class="seg is-sm" id="sc-mode" role="group" aria-label="Evaluation mode">
            ${Object.entries(SC.modes).map(([k, label], i) => `<button type="button" data-v="${k}" aria-pressed="${i === 0}">${label}</button>`).join("")}
          </div>
          <div class="seg is-sm" id="sc-comm" role="group" aria-label="Communication">
            ${Object.entries(SC.comms).map(([k, label], i) => `<button type="button" data-v="${k}" aria-pressed="${i === 0}">${label}</button>`).join("")}
          </div>
        </div>
      </div>
      <p class="sc-corner">${SC.corner}</p>
      <svg class="sc-plot" id="sc-plot" viewBox="0 0 760 420" role="img" aria-label="Collaboration score against human burden for each run"></svg>
      <ul class="sc-legend" id="sc-legend">
        ${[...new Map(SC.tasks.flatMap((t) => t.series || []).map((s) => [s.name, s])).values()].map((s) => `<li class="t-${s.tone}"><i class="is-sq"></i>${s.name}</li>`).join("")}
        <li class="t-robot"><i class="is-dm"></i>Two humans</li>
        <li class="t-mute"><i class="is-dm"></i>Human alone</li>
        <li class="sc-note" id="sc-empty" hidden></li>
      </ul>
      <div class="sc-tasks" id="sc-tasks" role="group" aria-label="Task">
        ${SC.tasks.map((t, i) => t.series
          ? `<button type="button" class="sc-task" data-v="${i}" aria-pressed="${i === 0}">${t.name}<small>${t.series.reduce((n, s) => n + Object.values(s.runs).reduce((a, r) => a + r.length, 0), 0)} runs</small></button>`
          : `<span class="sc-task is-off">${t.name}<small>${SC.soon}</small></span>`).join("")}
      </div>
      <p class="sc-find">${C.metrics.findings}</p>
    </div>
    <div class="mt-grid">${metricCard(C.metrics.score)}${metricCard(C.metrics.burden)}</div>
    <div class="rw-block" data-r>
      <div class="rw-head"><h3>${C.real.kicker}</h3><span class="badge">${C.real.badge}</span></div>
      <p class="lede">${C.real.body}</p>
      <div class="rw-slider">
        <div class="rw-stage">
          ${C.real.items.map((v, i) => `<figure class="rw-slide"${i ? " hidden" : ""}>
            <video src="${v.src}" poster="${v.poster}" muted playsinline preload="metadata" aria-label="${v.name}, real-world run, robot head camera"></video>
            <figcaption><b>${v.name}</b><span>${v.robot} · ${C.real.speed}</span></figcaption>
          </figure>`).join("")}
          <button class="rw-nav is-prev" type="button" aria-label="Previous video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="rw-nav is-next" type="button" aria-label="Next video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
        <div class="rw-dots" role="group" aria-label="Real-world video">${C.real.items.map((v, i) => `<button type="button" data-v="${i}" aria-pressed="${i === 0}">${v.name}</button>`).join("")}</div>
      </div>
    </div>
  </div></section>`;

  const resources = `<section class="pad" id="resources"><div class="wrap">
    ${head({ title: C.resources.kicker, claim: C.resources.heading })}
    <div class="rs-links">${C.resources.links.map((l) => l.href
      ? `<a class="rs-link" href="${l.href}"><b>${l.label}</b><span>Open</span></a>`
      : `<div class="rs-link"><b>${l.label}</b><span>${C.resources.pending}</span></div>`).join("")}</div>
    <p class="citation">${C.resources.citation}</p>
  </div>
  <footer class="foot"><div class="wrap foot-in">${wordmark()}<p>${C.resources.footer}</p></div></footer>
  </section>`;

  $("#app").innerHTML = `
    <nav class="nav" aria-label="Sections"><div class="wrap nav-in">
      <a class="nav-wm" href="#top" aria-label="Back to top">${wordmark()}</a>
      <ul>${navItems.map(([l, id, n, top]) => `<li${top ? "" : ' class="is-minor"'}><a href="#${id}">${n ? `<b>${pad(n)}</b>` : ""}<span>${l}</span></a></li>`).join("")}</ul>
      <button class="mode" id="mode" type="button" role="switch" aria-label="Night mode" aria-checked="true"><span class="mode-label">Night mode</span><i aria-hidden="true"></i><b id="mode-state">On</b></button>
    </div></nav>
    <main>${hero}${abstract}${overview}${gap}${tasks}${metrics}${resources}</main>`;

  /* ---------- Equations ---------- */

  // Typeset with KaTeX when it has loaded; otherwise the LaTeX source stays as plain text.
  $$(".tex").forEach((el) => {
    if (window.katex) katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false });
  });

  /* ---------- Figures ---------- */

  FIG.overview.init($("#ov"), C.overview);
  FIG.decision.init($("#dl"));

  // Canvas and SVG drawings are in px, so they read the root size that scales the CSS.
  const rootScale = () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;

  /* ---------- Night mode ---------- */

  const NIGHT_KEY = "bistrobo-night";
  let night = true;
  try { night = localStorage.getItem(NIGHT_KEY) !== "off"; } catch { /* storage blocked: stay on the default */ }

  const applyTheme = () => {
    document.body.dataset.theme = night ? "ink" : "cream";
    $("#mode").setAttribute("aria-checked", night);
    $("#mode-state").textContent = night ? "On" : "Off";
    $('meta[name="theme-color"]').content = night ? "#141210" : "#f4ecdf";
    document.dispatchEvent(new Event("themechange"));
  };
  $("#mode").addEventListener("click", () => {
    night = !night;
    try { localStorage.setItem(NIGHT_KEY, night ? "on" : "off"); } catch { /* not remembered */ }
    applyTheme();
  });
  applyTheme();

  /* ---------- In-page links ---------- */

  // Smooth scrolling is set per click: as a page-wide CSS rule, it breaks ScrollTrigger's measuring.
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    $(link.getAttribute("href")).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    history.pushState(null, "", link.getAttribute("href"));
  });

  /* ---------- Toggles ---------- */

  const segment = (el, onChange) => {
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", el).forEach((x) => x.setAttribute("aria-pressed", x === b));
      onChange(b.dataset.v);
    });
  };

  const scrubber = (el, seek) => {
    let dragging = false;
    const at = (e) => {
      const r = el.getBoundingClientRect();
      return clamp((e.clientX - r.left) / r.width, 0, 1);
    };
    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-drag");
      seek(at(e));
    });
    el.addEventListener("pointermove", (e) => { if (dragging) seek(at(e)); });
    const end = () => { dragging = false; el.classList.remove("is-drag"); };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 0.05, ArrowLeft: -0.05 }[e.key];
      if (step == null) return;
      e.preventDefault();
      seek(clamp(Number(el.style.getPropertyValue("--p") || 0) + step, 0, 1));
    });
  };
  const showPosition = (el, f) => {
    el.style.setProperty("--p", f);
    el.setAttribute("aria-valuenow", Math.round(f * 100));
  };

  const taskPanels = $$(".task");
  let restartTask = () => {};
  segment($("#task-tabs"), (v) => {
    taskPanels.forEach((el, i) => { el.hidden = i !== Number(v); });
    restartTask(Number(v));
    ScrollTrigger.refresh();
  });

  /* ---------- Video playback only while visible ---------- */

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) e.target.pause();
      else if (!e.target.dataset.held) e.target.play().catch(() => {});
    });
  }, { threshold: 0.25 });

  /* ---------- Task players ---------- */

  // Each task has one player: the rollout of the selected mode, its dialogue, a schematic timeline
  // of the latency mode, and the task drawing, all following the video. A mode with no rollout
  // shows the task's poster and runs the drawing on a timer.
  (function taskPlayers() {
    const T = C.tasks;
    const TL = T.timeline;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INTRO = 2;   // seconds before the first step, for tasks with no `sync.intro`
    const STEP = 1.6;  // seconds per step while a mode has no video
    const HOLD = 3;    // seconds the finished drawing stays before a video-less mode starts over
    const clockText = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

    /* Timeline. The x axis is simulated time; the playhead is the video's position mapped to wall
     * clock. Latency on: the world never stops, a new request goes out when the last answer returns,
     * and the arm keeps moving meanwhile. Latency off: the world stops for each answer, then runs
     * `every` s until the next request. */
    const humanBlocks = [];
    for (let t = 0; t < TL.span;) for (const d of TL.human) { humanBlocks.push([t, t + d]); t += d + TL.pause; }
    const period = Math.max(TL.every, TL.latency);
    const wallSpan = (lat) => (lat === "aware" ? TL.span : (TL.span / TL.every) * (TL.latency + TL.every));
    const position = (lat, wall) => {
      if (lat === "aware") {
        const into = (wall - TL.latency) % period;
        return { sim: wall, thinking: true, moving: wall >= TL.latency && into < Math.min(TL.motion, period) };
      }
      const cycle = TL.latency + TL.every;
      const n = Math.floor(wall / cycle);
      const into = wall - n * cycle;
      return { sim: Math.min(TL.span, n * TL.every + clamp(into - TL.latency, 0, TL.every)), thinking: into < TL.latency, moving: into >= TL.latency };
    };
    let colors = null;
    const color = (name) => {
      if (!colors) colors = {};
      if (!(name in colors)) colors[name] = getComputedStyle(document.body).getPropertyValue(name);
      return colors[name];
    };
    document.addEventListener("themechange", () => { colors = null; });

    const drawTimeline = (k, frac) => {
      const cv = k.canvas;
      const { width: W, height: H } = cv.getBoundingClientRect();
      if (!W) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = rootScale();
      const wall = clamp(frac, 0, 1) * wallSpan(k.lat);
      const { sim, thinking, moving } = position(k.lat, wall);
      const left = 46 * s;
      const laneH = 14 * s;
      const hy = 2 * s;
      const ry = hy + laneH + 8 * s;
      const X = (t) => left + (t / TL.span) * (W - left - 2);
      const bar = (x, y, w, h) => {
        const width = Math.max(w, 0.5);
        ctx.beginPath();
        ctx.roundRect(x, y, width, h, Math.min(2, width / 2));
        ctx.fill();
      };

      ctx.clearRect(0, 0, W, H);
      ctx.font = `500 ${10 * s}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "middle";
      for (let t = 0; t <= TL.span; t += 10) {
        ctx.fillStyle = color("--line");
        ctx.fillRect(X(t), hy, 1, ry + laneH - hy);
        ctx.fillStyle = color("--muted");
        ctx.textAlign = t === 0 ? "left" : t + 10 > TL.span ? "right" : "center";
        ctx.fillText(`${t}s`, X(t), ry + laneH + 10 * s);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = color("--human");
      ctx.fillText(TL.lanes.human, 0, hy + laneH / 2);
      ctx.fillStyle = color("--robot");
      ctx.fillText(TL.lanes.robot, 0, ry + laneH / 2);

      // Human: work still ahead is faint, work done is solid.
      ctx.fillStyle = color("--human");
      for (const [a, b] of humanBlocks) {
        const e = Math.min(b, TL.span);
        ctx.globalAlpha = 0.18;
        bar(X(a), hy, X(e) - X(a), laneH);
        ctx.globalAlpha = 1;
        if (Math.min(sim, e) > a) bar(X(a), hy, X(Math.min(sim, e)) - X(a), laneH);
      }
      // Robot: latency on stacks inference (upper strip) over motion (lower strip); latency off
      // marks each pause for an answer with a red tick.
      if (k.lat === "aware") {
        for (let t = 0; t < sim; t += period) {
          ctx.fillStyle = color("--muted");
          ctx.globalAlpha = 0.5;
          bar(X(t) + 1, ry, X(Math.min(t + TL.latency, sim)) - X(t) - 2, laneH * 0.42);
          ctx.globalAlpha = 1;
          if (sim > t + TL.latency) {
            ctx.fillStyle = color("--robot");
            bar(X(t + TL.latency), ry + laneH * 0.5, X(Math.min(t + TL.latency + Math.min(TL.motion, period), sim)) - X(t + TL.latency), laneH * 0.5);
          }
        }
      } else {
        ctx.fillStyle = color("--robot");
        bar(X(0), ry, X(sim) - X(0), laneH);
        ctx.fillStyle = color("--tomato");
        for (let t = 0; t <= sim; t += TL.every) ctx.fillRect(X(t) - 0.75, ry - 2, 1.5, laneH + 4);
      }
      const frozen = k.lat === "free" && thinking;
      ctx.strokeStyle = frozen ? color("--tomato") : color("--fg");
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(sim), hy - 2);
      ctx.lineTo(X(sim), ry + laneH + 2);
      ctx.stroke();

      const st = TL.states;
      const text = `${TL.read.sim} ${clockText(sim)} · ${TL.read.wall} ${clockText(wall)} · ${k.lat === "aware" ? (moving ? st.thinkMove : st.think) : frozen ? st.paused : st.running}`;
      if (text !== k.readText) {
        k.readText = text;
        k.read.textContent = text;
        k.read.classList.toggle("is-paused", frozen);
      }
    };

    /* Player state */
    const tasks = T.items.map((t, i) => {
      const el = taskPanels[i];
      const steps = t.flow.steps.length * (t.sync?.rounds ?? 1);
      const intro = t.sync?.intro ?? INTRO;
      return {
        t, el, steps, intro,
        tf: $(".tf", el), slot: $(".tp-media", el), log: $(".ro-log", el), count: $(".ro-count", el),
        canvas: $(".tl-canvas", el), read: $(".tl-read", el), modeTag: $(".tl-mode", el), meta: $(".tp-meta", el),
        play: $(".ro-play", el), track: $(".ro-track", el), speed: $(".tp-speed", el),
        lat: T.switches.lat.options[0][0],
        clip: null, video: null, length: intro + (steps + 1) * STEP + HOLD,
        clock: 0, held: reduced, rate: 1, phase: null, shown: 0, said: 0, readText: "",
      };
    });

    // -1 is the layout before anyone acts, steps is the finished task.
    const phaseAt = (k, time, d) => {
      if (k.video && k.clip?.at) return Math.min(k.steps, k.clip.at.filter((a) => time >= a).length - 1);
      if (time < k.intro) return -1;
      const per = k.video ? (d - k.intro) / (k.steps + 1) : STEP; // a video's last slot shows the finished task
      return Math.min(k.steps, Math.floor((time - k.intro) / per));
    };
    const duration = (k) => {
      if (!k.video) return k.length;
      return k.video.readyState > 0 && Number.isFinite(k.video.duration) ? k.video.duration : null;
    };

    const follow = (k) => k.log.scrollTo({ top: k.log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    const syncChat = (k, time) => {
      const lines = k.clip?.dialogue;
      if (!lines) return;
      const due = lines.filter(([a]) => a <= time + 0.05).length;
      if (due < k.shown) { k.log.innerHTML = ""; k.shown = 0; } // the clip looped or was dragged back
      for (; k.shown < due; k.shown += 1) {
        const [, who, sim, text] = lines[k.shown];
        const li = document.createElement("li");
        li.className = `ro-msg is-${who}`;
        li.innerHTML = `<p class="ro-meta"><b>${k.clip.who[who]}</b><span>${clockText(sim)}</span></p><p>${text}</p>`;
        k.log.append(li);
      }
      k.count.textContent = `${k.shown} / ${lines.length}`;
      if (k.shown !== k.said) { k.said = k.shown; follow(k); }
    };

    const show = (k) => {
      const d = duration(k);
      if (d == null) return;
      const time = k.video ? k.video.currentTime : k.clock;
      const phase = phaseAt(k, time, d);
      if (phase !== k.phase) {
        k.phase = phase;
        FIG.taskPhase(k.tf, k.t, phase);
      }
      showPosition(k.track, time / d);
      syncChat(k, time);
      drawTimeline(k, time / d);
    };

    const state = (k) => {
      const paused = k.video ? k.video.paused : k.held;
      k.play.classList.toggle("is-playing", !paused);
      k.play.setAttribute("aria-label", paused ? "Play" : "Pause");
    };

    // Loads the rollout of the selected mode, or the placeholder when there is none.
    const open = (k) => {
      const names = T.modeNames;
      // Every rollout shown runs with communication on; `clips` is keyed by the latency mode.
      const id = k.t.clips?.[k.lat];
      k.clip = id ? C.rollouts[id] : null;
      if (k.video) { videoObserver.unobserve(k.video); k.video.pause(); }
      k.slot.innerHTML = k.clip
        ? `${media({ src: k.clip.src, poster: k.clip.poster, label: k.clip.label })}<span class="ro-tag">${k.clip.view}</span><span class="ro-tag ro-model">${T.models[k.clip.robot] || k.clip.robot}</span>`
        : media({ src: "", poster: k.t.poster, label: `${k.t.name}: ${names[k.lat]}`, spec: T.pending });
      k.video = $("video", k.slot);
      k.meta.textContent = k.clip?.meta || "";
      k.meta.hidden = !k.clip;
      k.modeTag.textContent = names[k.lat];
      k.rate = 1;
      k.speed.innerHTML = (k.clip?.speeds || T.speeds).map(([rate, label]) => `<button type="button" data-v="${rate}" aria-pressed="${rate === 1}">${label}</button>`).join("");
      k.shown = 0;
      k.said = 0;
      k.phase = null;
      k.readText = "";
      k.log.innerHTML = k.clip?.dialogue ? "" : `<li class="ro-empty">${T.chat.none}</li>`;
      k.count.textContent = "";
      k.clock = reduced ? k.intro + k.steps * STEP : 0;
      if (k.video) {
        const v = k.video;
        if (k.held) v.dataset.held = "1";
        v.addEventListener("play", () => state(k));
        v.addEventListener("pause", () => state(k));
        v.addEventListener("loadedmetadata", () => show(k));
        videoObserver.observe(v);
      }
      state(k);
      show(k);
    };

    tasks.forEach((k) => {
      k.play.addEventListener("click", () => {
        k.held = !(k.video ? k.video.paused : k.held);
        if (k.video) {
          if (k.held) { k.video.dataset.held = "1"; k.video.pause(); }
          else { delete k.video.dataset.held; k.video.play().catch(() => {}); }
        }
        state(k);
      });
      segment($(".tp-lat", k.el), (v) => { k.lat = v; open(k); });
      segment(k.speed, (v) => {
        k.rate = Number(v);
        if (k.video) k.video.playbackRate = k.rate;
      });
      scrubber(k.track, (f) => {
        const d = duration(k);
        if (d == null) return;
        if (k.video) k.video.currentTime = f * d;
        else k.clock = f * d;
        show(k);
      });
      open(k);
    });

    restartTask = (i) => {
      tasks.forEach((k, j) => { if (j !== i && k.video) k.video.pause(); });
      const k = tasks[i];
      if (!reduced) k.clock = 0;
      k.phase = null;
      if (k.video) {
        k.video.currentTime = 0;
        if (!k.held) k.video.play().catch(() => {});
      }
      show(k);
    };

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }).observe($(".tasks-panel"));

    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const k = tasks.find((x) => !x.el.hidden);
      if (k && visible) {
        if (!k.video && !k.held) k.clock = (k.clock + dt * k.rate) % k.length;
        show(k);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  })();

  /* ---------- Metrics: collaboration against burden ---------- */

  // Points start on "Human alone" and move out the first time the plot comes into view. The mode
  // switches move them; the task chips change the task. The axes fit the points shown.
  (function scatter() {
    const sc = C.metrics.scatter;
    const svg = $("#sc-plot");
    const NS = "http://www.w3.org/2000/svg";
    const P = { l: 64, r: 24, t: 24, b: 62, w: 760, h: 420 };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mode = Object.keys(sc.modes)[0];
    let comm = Object.keys(sc.comms)[0];
    let task = sc.tasks[0];
    let started = reduced;
    let solo;
    let pair;
    let series;

    const axes = document.createElementNS(NS, "g");
    const layer = document.createElementNS(NS, "g");
    svg.append(axes, layer);

    // One element per point; the same element moves when the mode changes.
    const make = (cls, tone, shape, text) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", `sc-pt ${cls} t-${tone}`);
      g.innerHTML = (shape === "dm" ? '<path d="M0 -9L9 0L0 9L-9 0Z"/>' : '<rect x="-7.5" y="-7.5" width="15" height="15" rx="2"/>')
        + `<text x="13" y="4">${text}</text>`;
      layer.append(g);
      return g;
    };
    const build = () => {
      layer.innerHTML = "";
      solo = make("is-ref", "mute", "dm", "Human alone");
      pair = task.pair.map((p, j) => make("is-ref", "robot", "dm", j ? "" : "Two humans"));
      series = task.series.map((s) => Array.from({ length: 3 }, () => make("is-run", s.tone, "sq", "")));
    };

    const niceStep = (span) => (span > 5 ? 1 : span > 2 ? 0.5 : 0.25);
    const draw = () => {
      const key = `${mode}-${comm}`;
      const runs = task.series.map((s) => s.runs[key] || []);
      const all = runs.flat();
      const sMin = Math.min(-1, ...all.map(([s]) => s));
      const bMax = Math.max(1.25, ...all.map(([, b]) => b));
      const y0 = Math.floor(sMin * 2) / 2 - 0.25;
      const y1 = 1.25;
      const x0 = 0.4;
      const x1 = Math.ceil(bMax * 4) / 4 + 0.1;
      const X = (b) => P.l + ((b - x0) / (x1 - x0)) * (P.w - P.l - P.r);
      const Y = (s) => P.t + ((y1 - s) / (y1 - y0)) * (P.h - P.t - P.b);
      const ys = [];
      for (let v = 1; v >= y0; v -= niceStep(y1 - y0)) ys.push(+v.toFixed(2));
      const xs = [];
      for (let v = 0.5; v <= x1; v += 0.25) xs.push(+v.toFixed(2));
      axes.innerHTML = `
        ${ys.map((v) => `<path class="sc-grid${v === 0 ? " is-zero" : ""}" d="M${P.l} ${Y(v)}H${P.w - P.r}"/><text class="sc-tick" x="${P.l - 10}" y="${Y(v) + 4}" text-anchor="end">${minus(v, Number.isInteger(v) ? 0 : 2)}</text>`).join("")}
        ${xs.map((v) => `<path class="sc-grid${v === 1 ? " is-zero" : ""}" d="M${X(v)} ${P.t}V${P.h - P.b}"/><text class="sc-tick" x="${X(v)}" y="${P.h - P.b + 20}" text-anchor="middle">${v.toFixed(2)}</text>`).join("")}
        <text class="sc-axis" x="${P.l}" y="${P.t - 8}">${sc.y} ↑</text>
        <text class="sc-axis" x="${(P.l + P.w - P.r) / 2}" y="${P.h - 14}" text-anchor="middle">${sc.x}</text>`;
      const at = (el, b, s, show, delay) => {
        el.style.transitionDelay = delay;
        el.style.transform = started ? `translate(${X(b)}px, ${Y(s)}px)` : `translate(${X(1)}px, ${Y(0)}px)`;
        el.style.opacity = show && started ? 1 : 0;
      };
      at(solo, task.solo[1], task.solo[0], true, "0ms");
      solo.style.opacity = 1;
      pair.forEach((el, j) => at(el, task.pair[j][1], task.pair[j][0], true, "0ms"));
      const notes = task.note ? [task.note] : [];
      series.forEach((els, i) => {
        const list = runs[i];
        if (!list.length) notes.push(`${task.series[i].name}: ${sc.empty}`);
        els.forEach((el, j) => {
          const run = list[j];
          el.querySelector("text").textContent = run ? `s${run[2]}` : "";
          el.querySelector("title")?.remove();
          if (run) {
            const t = document.createElementNS(NS, "title");
            t.textContent = `${task.name}, ${task.series[i].name}, ${sc.modes[mode].toLowerCase()}, ${sc.comms[comm].toLowerCase()}, seed ${run[2]}: S = ${minus(run[0])}, B = ${run[1].toFixed(2)}`;
            el.append(t);
          }
          at(el, run ? run[1] : 1, run ? run[0] : 0, Boolean(run), `${(i * 3 + j) * 90}ms`);
        });
      });
      const note = $("#sc-empty");
      note.hidden = !notes.length;
      note.textContent = notes.join(" · ");
    };
    segment($("#sc-mode"), (v) => { mode = v; draw(); });
    segment($("#sc-comm"), (v) => { comm = v; draw(); });
    segment($("#sc-tasks"), (v) => { task = sc.tasks[Number(v)]; build(); draw(); });
    build();
    draw();
    if (!started) {
      new IntersectionObserver(([e], obs) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        started = true;
        draw();
      }, { threshold: 0.35 }).observe(svg);
    }
  })();

  /* ---------- Real-world slider ---------- */

  // One clip at a time; each plays to its end and hands over to the next.
  (function realSlider() {
    const slides = $$(".rw-slide");
    const dots = $(".rw-dots");
    let at = 0;
    const go = (i) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((el, j) => {
        el.hidden = j !== at;
        if (j !== at) $("video", el).pause();
      });
      $$("button", dots).forEach((b, j) => b.setAttribute("aria-pressed", j === at));
      const v = $("video", slides[at]);
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    slides.forEach((el) => {
      const v = $("video", el);
      videoObserver.observe(v);
      v.addEventListener("ended", () => go(at + 1));
    });
    $(".rw-nav.is-prev").addEventListener("click", () => go(at - 1));
    $(".rw-nav.is-next").addEventListener("click", () => go(at + 1));
    segment(dots, (v) => go(Number(v)));
  })();

  /* ---------- Scroll motion ---------- */

  gsap.registerPlugin(ScrollTrigger);

  const nav = $(".nav");
  ScrollTrigger.create({
    trigger: ".hero", start: "bottom 10%",
    onEnter: () => nav.classList.add("is-on"),
    onLeaveBack: () => nav.classList.remove("is-on"),
  });
  // The side rail steps aside for the closing block.
  ScrollTrigger.create({
    trigger: "#resources", start: "top 55%",
    onToggle: (self) => nav.classList.toggle("is-end", self.isActive),
  });

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Opening: the awning drops, then the title block fades in.
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".hero .awning i", { scaleY: 0, duration: 0.6, stagger: { each: 0.015, from: "center" } })
      .from(".hero-body > *, .hero-cue", { autoAlpha: 0, duration: 0.6 }, "-=.3");

    // Large figures fade in once.
    gsap.set("[data-r]", { autoAlpha: 0 });
    ScrollTrigger.batch("[data-r]", {
      start: "top 92%", once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, duration: 0.5, ease: "power2.out", overwrite: true }),
    });
  });

  // Nav highlights the current section.
  navItems.forEach(([, id]) => {
    const link = $(`.nav a[href="#${id}"]`);
    ScrollTrigger.create({
      trigger: `#${id}`, start: "top 50%", end: "bottom 50%",
      onToggle: (self) => link.classList.toggle("is-active", self.isActive),
    });
  });

  $(".ev-more").addEventListener("toggle", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  $$("img").forEach((img) => img.addEventListener("load", () => ScrollTrigger.refresh()));
  $$("video").forEach((v) => v.addEventListener("loadedmetadata", () => ScrollTrigger.refresh()));
})();
