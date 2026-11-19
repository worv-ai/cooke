/* Renders the page from content.js, then wires up plots, video and motion. Copy changes belong in content.js.
 * index.html uses the paper style (styles-paper.css, light only) and sets <body data-variant="paper">.
 * Without that attribute the page style (ink / cream themes with a night switch) applies.
 * intro.js runs first and plays the door intro; the hero entrance below waits for it. */
(() => {
  const C = window.CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const num = (v, d = 2) => v.toFixed(d).replace("-", "−");
  const PAPER = document.body.dataset.variant === "paper";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const R = C.results;
  const AG = R.agents;
  const agentById = Object.fromEntries(AG.map((a) => [a.id, a]));

  /* ---------- Shared markup ---------- */

  // COOK·E logo with blinking eyes, and the awning nav: both from nav.js, shared with leaderboard.html.
  const wordmark = NAV.wordmark;

  const video = (m, { auto = true, controls = false, cls = "" } = {}) => `<video class="${cls}" src="${m.src}" poster="${m.poster || ""}" muted loop playsinline preload="${auto ? "metadata" : "none"}"${controls ? " controls" : ""}${auto ? " data-auto" : ""} aria-label="${m.label}"></video>`;

  const placeholder = (label, spec) => `<div class="ph" role="img" aria-label="${label}: ${spec}">
    <span class="ph-tag">Video placeholder</span><span class="ph-title">${label}</span><span class="ph-spec">${spec}</span></div>`;

  const head = (id, n, kicker, claim, lede) => `<header class="sec-head">
    <h2 id="${id}-title">${n ? `<span class="sec-no">${pad(n)}</span>` : ""}<span class="sec-name">${kicker}</span></h2>
    ${claim ? `<p class="claim">${claim}</p>` : ""}
    ${lede ? `<p class="lede">${lede}</p>` : ""}
  </header>`;

  const button = (l) => l.href
    ? `<a class="btn" href="${l.href}">${l.label}</a>`
    : `<span class="btn is-off" aria-disabled="true">${l.label}<small>${C.meta.pending}</small></span>`;

  const tex = (list) => list.map((src) => `<div class="tex" data-tex="${src.replace(/"/g, "&quot;")}">${src}</div>`).join("");

  const fig = (f, cls = "") => `<figure class="fig ${cls}"><img src="${f.src}" alt="${f.alt}" loading="lazy" decoding="async"><figcaption>${f.caption}</figcaption></figure>`;

  /* Agent markers: one SVG shape per agent, hollow for communication off (figures.js). */
  const { shape, marker } = FIG;

  /* ---------- Sections ---------- */

  const nav = C.nav.links;

  // The hero has no awning of its own: the nav's valance hangs over it (nav.js).
  const H = C.hero;
  const hero = `<section class="hero" id="top" aria-labelledby="hero-title">
    <div class="wrap hero-in">
      <div class="hero-text">
        <h1 class="hero-wm">${wordmark()}</h1>
        <p class="hero-exp">${H.expansion}</p>
        <p class="hero-title" id="hero-title">${H.title}</p>
        <p class="hero-authors">${H.authors}</p>
        <div class="btns">${H.links.map(button).join("")}</div>
      </div>
      <figure class="hero-clip">
        <div class="frame">${video(H.clip, { cls: "hero-video" })}
          <button class="vbtn" type="button" aria-label="Pause the video"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg></button>
        </div>
        <figcaption>${H.clip.caption}</figcaption>
      </figure>
    </div>
  </section>`;

  const HL = C.headline;
  const headline = `<section class="pad sec-headline" id="headline" aria-labelledby="headline-title"><div class="wrap">
    ${head("headline", 0, HL.kicker, HL.claim)}
    <ul class="stats">${HL.stats.map((s) => `<li class="stat" data-r><b>${s.value}</b><span>${s.label}</span></li>`).join("")}</ul>
    <p class="note">${HL.note}</p>
  </div></section>`;

  const O = C.overview;
  const overview = `<section class="pad" id="overview" aria-labelledby="overview-title"><div class="wrap">
    ${head("overview", 0, O.kicker)}
    <div class="ov-grid">
      <div class="ov-video">${placeholder(O.video.label, O.video.spec)}</div>
      <div class="ov-abs"><h3>${O.abstractTitle}</h3>${O.abstract.map((p) => `<p>${p}</p>`).join("")}</div>
    </div>
    ${window.TEASER ? TEASER.markup(C, { wordmark, marker, shape }) : fig(O.teaser, "fig-teaser")}
  </div></section>`;

  const BM = C.benchmark;
  const taskCard = (t, i) => `<article class="task" data-r>
    <header class="task-head"><span class="task-no">${pad(i + 1)}</span><h4>${t.name}</h4><span class="chip">${t.tag}</span></header>
    <p class="task-ch">${t.challenge}</p>
    <div class="task-imgs">
      <img src="${t.sim}" alt="${t.simAlt}" loading="lazy" decoding="async" class="is-sim">
      <img src="${t.real}" alt="${t.realAlt}" loading="lazy" decoding="async" class="is-real">
    </div>
    <p class="task-line">${t.line}</p>
    <dl class="task-facts"><div><dt>Subtasks</dt><dd>${t.subtasks}</dd></div><div><dt>H</dt><dd>${t.solo}</dd></div></dl>
  </article>`;
  const HS = BM.human;
  const MT = BM.metrics;
  const metricCard = (m) => `<article class="mt-card" data-r>
    <h4><span class="mt-sym">${m.sym}</span>${m.name}<small>${m.dir}</small></h4>
    ${tex(m.tex)}
    <p class="mt-body">${m.body}</p>
    ${m.stops ? `<ul class="stops">${m.stops.map(([k, v, tone]) => `<li class="is-${tone}"><b>${k}</b><span>${v}</span></li>`).join("")}</ul>` : ""}
    ${m.parts ? `<ul class="wparts">${m.parts.map(([k, v], i) => `<li><i style="background:${R.w.colors[i]}"></i><b>${k}</b><span>${v}</span></li>`).join("")}</ul>` : ""}
  </article>`;
  const benchmark = `<section class="pad" id="benchmark" aria-labelledby="benchmark-title"><div class="wrap">
    ${head("benchmark", 1, BM.kicker, BM.claim, BM.lede)}
    <h3 class="sub">${BM.tasksTitle}</h3>
    <div class="tasks">${BM.tasks.map(taskCard).join("")}</div>
    <p class="note">${BM.tasksNote}</p>

    <h3 class="sub" id="human-sim">${HS.title}</h3>
    <div class="hs">
      <div class="hs-text">
        <p class="lede">${HS.lede}</p>
        <ol class="hs-steps">${HS.steps.map((s) => `<li><span class="hs-n">${s.n}</span><div><b>${s.name}</b><small>${s.who}</small><p>${s.body}</p></div></li>`).join("")}</ol>
        <p class="hs-blocked">${HS.blocked}</p>
      </div>
      ${fig(HS.figure, "fig-hs")}
    </div>

    <h3 class="sub" id="modes">${BM.modes.title}</h3>
    <p class="lede">${BM.modes.lede}</p>
    ${FIG.modes(BM.modes)}

    <h3 class="sub" id="metrics">${MT.title}</h3>
    <p class="lede">${MT.lede}</p>
    <div class="mt-grid">${MT.items.map(metricCard).join("")}</div>
    <figure class="mt-video">
      <div class="frame">${video(MT.video, { auto: false, controls: true })}</div>
      <figcaption>${MT.video.caption}</figcaption>
    </figure>
  </div></section>`;

  const seg = (id, label, options, cls = "") => `<div class="seg ${cls}" id="${id}" role="group" aria-label="${label}">${options.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>`;

  const results = `<section class="pad" id="results" aria-labelledby="results-title"><div class="wrap">
    ${head("results", 2, R.kicker, R.claim, R.lede)}
    <div class="plot-card" data-r>
      <div class="plot-ctl">
        ${seg("sb-task", "Task", R.tabs, "is-tabs")}
        ${seg("sb-lat", "Latency mode", R.latency)}
      </div>
      <div class="sb-wrap"><svg class="sb" id="sb" viewBox="0 0 640 420" role="img" aria-labelledby="sb-desc"><desc id="sb-desc">Task efficiency S against human burden B for each agent.</desc></svg><div class="tip" id="tip" role="status" hidden></div></div>
      <ul class="legend">
        ${AG.map((a) => `<li data-agent="${a.id}">${marker(a)}${a.name}</li>`).join("")}
        <li class="lg-sep">${marker({ color: "var(--plot-ink)", shape: "circle" }, false)}${R.labels.off}</li>
        <li>${marker({ color: "var(--plot-ink)", shape: "circle" }, true)}${R.labels.on}</li>
        <li>${marker({ color: "var(--plot-ink)", shape: "diamond" }, false)}${R.labels.h}</li>
        <li><i class="lg-shade"></i>${R.labels.help}</li>
      </ul>
      <p class="plot-note" id="sb-note"></p>
      <details class="numbers"><summary>${R.tableTitle}</summary><div class="tbl-scroll" id="sb-table"></div></details>
    </div>

    <div class="w-block" data-r>
      <h3 class="sub">${R.w.title}</h3>
      <p class="lede">${R.w.lede}</p>
      <div class="plot-card">
        <ul class="legend">${R.w.names.map((n, i) => `<li><i class="lg-sw" style="background:${R.w.colors[i]}"></i>${n}</li>`).join("")}</ul>
        <svg class="wbars" id="wbars" viewBox="0 0 640 250" role="img" aria-labelledby="w-desc"><desc id="w-desc"></desc></svg>
        <p class="plot-note">${R.w.note}</p>
      </div>
    </div>

    <div class="findings">${R.findings.map((f) => `<article class="finding" data-r><h4>${f.title}</h4><p>${f.body}</p></article>`).join("")}</div>
  </div></section>`;

  const F = C.failures;
  const failures = `<section class="pad" id="failures" aria-labelledby="failures-title"><div class="wrap">
    ${head("failures", 3, F.kicker, F.claim, F.lede)}
    <div class="fails">${F.items.map((f, i) => `<article class="fail" data-r>
      <div class="fail-text"><span class="fail-no">${pad(i + 1)}</span><h3>${f.name}</h3><p>${f.body}</p></div>
      <figure class="fail-sim"><span class="tag">Simulation</span><div class="frame">${video(f.sim)}</div><figcaption>${f.sim.caption}</figcaption></figure>
      <figure class="fail-real"><span class="tag">Real world</span><div class="frame"><img src="${f.real.src}" alt="${f.real.alt}" loading="lazy" decoding="async"></div><figcaption>${f.real.caption}</figcaption></figure>
    </article>`).join("")}</div>
    <p class="note">${F.clipNote}</p>
  </div></section>`;

  const RW = C.real;
  const real = `<section class="pad" id="real" aria-labelledby="real-title"><div class="wrap">
    ${head("real", 4, RW.kicker, RW.claim, RW.lede)}
    <div class="rw-grid">
      ${fig(RW.setup, "fig-real")}
      <div class="pending" role="note"><span class="tag is-warn">${RW.pending.tag}</span><h3>${RW.pending.title}</h3><p>${RW.pending.body}</p></div>
    </div>
    <h3 class="sub">${RW.tasksTitle}</h3>
    <p class="note">${RW.tasksNote}</p>
    <div class="rw-tasks">${BM.tasks.map((t) => `<figure><div class="frame"><img src="${t.real}" alt="${t.realAlt}" loading="lazy" decoding="async"></div><figcaption>${t.name}</figcaption></figure>`).join("")}</div>
    <h3 class="sub">${RW.clipsTitle}<span class="tag is-warn">Placeholder</span></h3>
    <p class="note">${RW.clipsNote}</p>
    <div class="rw-clips">${RW.clips.map((c) => `<figure class="rw-clip"><div class="frame">${video({ ...c, label: `${c.name}: placeholder clip from an earlier real-world trial, robot head camera at 32× speed` })}<span class="ph-badge">Placeholder</span></div><figcaption>${c.name}</figcaption></figure>`).join("")}</div>
  </div></section>`;

  const G = C.gallery;
  const taskName = Object.fromEntries(BM.tasks.map((t) => [t.id, t.name]));
  const card = (it) => {
    const e = G.eps[it.id];
    const a = agentById[it.agent];
    const pos = e.S > 0;
    return `<article class="ep" data-task="${it.task}" data-mode="${it.mode}" data-pos="${pos}">
      <div class="frame">${video({ src: `media/${it.id}.mp4`, poster: `media/${it.id}.jpg`, label: `${taskName[it.task]}, ${a.name}, ${G.modeNames[it.mode]}. Robot head camera at 4× speed.` }, { auto: false, controls: true })}</div>
      <div class="ep-body">
        <p class="ep-meta"><b>${taskName[it.task]}</b><span class="ep-agent">${marker(a, it.mode.endsWith("on"))}${a.name}</span></p>
        <p class="ep-mode">${G.modeNames[it.mode]}</p>
        <dl class="ep-nums">
          <div class="${pos ? "is-good" : "is-bad"}"><dt>S</dt><dd>${num(e.S)}</dd></div>
          <div><dt>B</dt><dd>${num(e.B)}</dd></div>
          <div><dt>W</dt><dd>${e.W}%</dd></div>
          <div><dt>Task</dt><dd>${e.done ? G.done : G.notDone}</dd></div>
        </dl>
        <p class="ep-text">${it.text}</p>
      </div>
    </article>`;
  };
  const modeOpts = [["all", G.filters.all], ...Object.entries(G.modeNames)];
  const taskOpts = [["all", G.filters.all], ...BM.tasks.map((t) => [t.id, t.name]), ["positive", G.filters.positive]];
  const gallery = `<section class="pad" id="gallery" aria-labelledby="gallery-title"><div class="wrap">
    ${head("gallery", 5, G.kicker, G.claim, G.lede)}
    <div class="g-ctl">
      <div class="g-row"><span class="g-lbl">${G.filters.task}</span>${seg("g-task", G.filters.task, taskOpts, "is-chips")}</div>
      <div class="g-row"><span class="g-lbl">${G.filters.mode}</span>${seg("g-mode", G.filters.mode, modeOpts, "is-chips")}</div>
    </div>
    <p class="g-count" id="g-count" aria-live="polite"></p>
    <div class="eps">${G.items.map(card).join("")}</div>
  </div></section>`;

  const RS = C.resources;
  const resources = `<section class="pad" id="resources" aria-labelledby="resources-title"><div class="wrap">
    ${head("resources", 0, RS.kicker, RS.claim)}
    <div class="rs-links">${RS.links.map((l) => l.href
      ? `<a class="rs-link" href="${l.href}"><b>${l.label}</b><span>${l.note}</span></a>`
      : `<div class="rs-link is-off" aria-disabled="true"><b>${l.label}</b><span>${l.note}</span><small>${C.meta.pending}</small></div>`).join("")}</div>
    <h3 class="sub" id="bibtex">${RS.bibtitle}</h3>
    <pre class="bib"><code>${RS.bibtex}</code></pre>
  </div>
  <footer class="foot"><div class="wrap foot-in">${wordmark()}<p>${RS.footer}</p></div></footer>
  </section>`;

  $("#app").innerHTML = `
    <a class="skip" href="#headline">Skip to content</a>
    ${NAV.markup(C, "home", PAPER ? "" : `<button class="mode" id="mode" type="button" role="switch" aria-label="Night mode" aria-checked="true"><span class="mode-label">Night</span><i aria-hidden="true"></i></button>`)}
    <main>${hero}${headline}${overview}${benchmark}${results}${failures}${real}${gallery}${resources}</main>`;

  /* ---------- Equations: KaTeX as MathML (no stylesheet needed) ---------- */

  $$(".tex").forEach((el) => {
    if (window.katex) katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false, output: "mathml" });
  });

  /* ---------- Theme (page style only) ---------- */

  if (!PAPER) {
    const KEY = "cooke-night";
    let night = true;
    try { night = localStorage.getItem(KEY) !== "off"; } catch { /* storage blocked: keep the default */ }
    const apply = () => {
      document.body.dataset.theme = night ? "ink" : "cream";
      $("#mode").setAttribute("aria-checked", night);
      $('meta[name="theme-color"]').content = night ? "#141210" : "#f4ecdf";
    };
    $("#mode").addEventListener("click", () => {
      night = !night;
      try { localStorage.setItem(KEY, night ? "on" : "off"); } catch { /* not remembered */ }
      apply();
    });
    apply();
  }

  /* ---------- In-page links ---------- */

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
    history.pushState(null, "", link.getAttribute("href"));
  });

  const segment = (el, onChange) => {
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", el).forEach((x) => x.setAttribute("aria-pressed", x === b));
      onChange(b.dataset.v);
    });
  };

  /* ---------- Video: autoplay only while visible, never with reduced motion ---------- */

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (!e.isIntersecting) { if (!v.paused) v.pause(); return; }
    if (!reduced.matches && !v.dataset.held) v.play().catch(() => {});
  }), { threshold: 0.35 });
  $$("video[data-auto]").forEach((v) => io.observe(v));
  // Videos with native controls play one at a time.
  $$("video[controls]").forEach((v) => v.addEventListener("play", () => $$("video[controls]").forEach((o) => { if (o !== v) o.pause(); })));

  (function heroButton() {
    const v = $(".hero-video");
    const b = $(".hero-clip .vbtn");
    const sync = () => {
      b.classList.toggle("is-playing", !v.paused);
      b.setAttribute("aria-label", v.paused ? "Play the video" : "Pause the video");
    };
    b.addEventListener("click", () => {
      if (v.paused) { delete v.dataset.held; v.play().catch(() => {}); } else { v.dataset.held = "1"; v.pause(); }
    });
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    sync();
  })();

  /* ---------- Results: S against B ---------- */

  (function sbPlot() {
    const svg = $("#sb");
    const tip = $("#tip");
    const P = { l: 58, r: 18, t: 18, b: 52, w: 640, h: 420 };
    // The drawing uses real pixels, so text stays readable at phone width.
    const fit = () => {
      const cw = svg.parentElement.clientWidth || 640;
      P.w = Math.round(Math.max(300, Math.min(640, cw)));
      P.h = P.w < 480 ? Math.round(P.w * 0.95) : 420;
      P.l = P.w < 480 ? 46 : 58;
      svg.setAttribute("viewBox", `0 0 ${P.w} ${P.h}`);
    };
    const comms = [["off", false], ["on", true]];
    let task = R.tabs[0][0];
    let lat = R.latency[0][0];

    const nice = (span) => [0.1, 0.2, 0.25, 0.5, 1, 2].find((s) => span / s <= 7) || 2;
    const ticks = (a, b, s) => { const out = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(2)); return out; };

    const draw = () => {
      fit();
      const D = R.sb[task];
      const all = Object.values(D).flat();
      const Ss = all.map((p) => p[0]).concat([0]);
      const Bs = all.map((p) => p[1]).concat([1]);
      const yspan = Math.max(...Ss) - Math.min(...Ss) || 1;
      const xspan = Math.max(...Bs) - Math.min(...Bs) || 0.2;
      const y0 = Math.min(...Ss) - yspan * 0.08, y1 = Math.max(Math.max(...Ss), 0) + yspan * 0.16;
      const x0 = Math.min(...Bs) - xspan * 0.1, x1 = Math.max(...Bs) + xspan * 0.1;
      const X = (b) => P.l + ((b - x0) / (x1 - x0)) * (P.w - P.l - P.r);
      const Y = (s) => P.t + ((y1 - s) / (y1 - y0)) * (P.h - P.t - P.b);
      const ys = ticks(y0, y1, nice(y1 - y0));
      const xs = ticks(x0, x1, nice(x1 - x0));
      const shadeX0 = X(x0), shadeX1 = X(Math.min(1, x1)), shadeY0 = Y(y1), shadeY1 = Y(0);
      let s = `<rect class="sb-help" x="${shadeX0}" y="${shadeY0}" width="${Math.max(0, shadeX1 - shadeX0)}" height="${Math.max(0, shadeY1 - shadeY0)}"/>
        <text class="sb-help-lbl" x="${shadeX0 + 6}" y="${shadeY0 + 14}">${R.labels.help}</text>`;
      const dec = (step) => (step >= 1 ? 0 : step === 0.25 ? 2 : 1);
      const ystep = nice(y1 - y0), xstep = nice(x1 - x0);
      s += ys.map((v) => `<path class="sb-grid" d="M${P.l} ${Y(v)}H${P.w - P.r}"/><text class="sb-tick" x="${P.l - 8}" y="${Y(v) + 4}" text-anchor="end">${num(v, dec(ystep))}</text>`).join("");
      s += xs.map((v) => `<path class="sb-grid" d="M${X(v)} ${P.t}V${P.h - P.b}"/><text class="sb-tick" x="${X(v)}" y="${P.h - P.b + 18}" text-anchor="middle">${num(v, Math.max(1, dec(xstep)))}</text>`).join("");
      s += `<path class="sb-ref" d="M${P.l} ${Y(0)}H${P.w - P.r}"/><path class="sb-ref" d="M${X(1)} ${P.t}V${P.h - P.b}"/>`;
      s += `<text class="sb-axis" x="${P.l}" y="${P.h - 10}">${R.axes.x}</text>`;
      s += `<text class="sb-axis" text-anchor="middle" transform="translate(16 ${(P.t + P.h - P.b) / 2}) rotate(-90)">${R.axes.y}</text>`;
      // H at (1, 0)
      s += `<g class="sb-h" tabindex="0" data-tip="${R.labels.h}: S = 0, B = 1"><g fill="var(--plot-bg)" stroke="var(--plot-ink)" stroke-width="1.8">${shape("diamond", X(1), Y(0), 8)}</g><text x="${X(1) + 10}" y="${Y(0) + 18}" class="sb-hl">H</text></g>`;
      AG.forEach((a, i) => {
        const off = D[`${lat}-off`][i];
        const on = D[`${lat}-on`][i];
        s += `<g class="sb-agent" data-agent="${a.id}">
          <path class="sb-link" d="M${X(off[1])} ${Y(off[0])}L${X(on[1])} ${Y(on[0])}" stroke="${a.color}"/>`;
        comms.forEach(([c, filled]) => {
          const p = c === "on" ? on : off;
          const label = `${a.name} · ${R.latency.find(([k]) => k === lat)[1]} · ${R.labels[c]}: S = ${num(p[0])}, B = ${num(p[1])}`;
          s += `<g class="sb-pt" tabindex="0" role="img" aria-label="${label}" data-tip="${label}">
            <circle class="sb-hit" cx="${X(p[1])}" cy="${Y(p[0])}" r="14"/>
            <g fill="${filled ? a.color : "var(--plot-bg)"}" stroke="${filled ? "var(--plot-bg)" : a.color}" stroke-width="${filled ? 1.6 : 2}">${shape(a.shape, X(p[1]), Y(p[0]), 7.5)}</g></g>`;
        });
        s += "</g>";
      });
      svg.innerHTML = `<desc id="sb-desc">Task efficiency S against human burden B, ${R.tabs.find(([k]) => k === task)[1]}, ${R.latency.find(([k]) => k === lat)[1]}.</desc>${s}`;
      const hh = task === "average" ? null : R.hhB[task];
      $("#sb-note").textContent = `${task === "average" ? "Average: mean over the five tasks." : `Two humans (H-H) in ${R.tabs.find(([k]) => k === task)[1]}: S = 1, B = ${hh.toFixed(2)}.`} ${R.sbNote}`;
      table();
    };

    const table = () => {
      const D = R.sb[task];
      const cols = [["free-off", "Latency-free, comm. off"], ["free-on", "Latency-free, comm. on"], ["aware-off", "Latency-aware, comm. off"], ["aware-on", "Latency-aware, comm. on"]];
      $("#sb-table").innerHTML = `<table><caption>${R.tabs.find(([k]) => k === task)[1]}: S and B per agent and mode</caption>
        <thead><tr><th scope="col">Agent</th>${cols.map(([, l]) => `<th scope="col">${l}</th>`).join("")}</tr></thead>
        <tbody>${AG.map((a, i) => `<tr><th scope="row">${marker(a)}${a.name}</th>${cols.map(([k]) => `<td><span class="${D[k][i][0] > 0 ? "is-good" : ""}">S ${num(D[k][i][0])}</span><span>B ${num(D[k][i][1])}</span></td>`).join("")}</tr>`).join("")}</tbody></table>`;
    };

    // Tooltip on hover and keyboard focus.
    const show = (el) => {
      const box = svg.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      tip.textContent = el.dataset.tip;
      tip.hidden = false;
      const x = r.left + r.width / 2 - box.left;
      tip.style.left = `${Math.min(Math.max(x, 90), box.width - 90)}px`;
      tip.style.top = `${r.top - box.top - 8}px`;
      const ag = el.closest(".sb-agent");
      svg.classList.toggle("is-focus", Boolean(ag));
      $$(".sb-agent", svg).forEach((g) => g.classList.toggle("is-on", g === ag));
    };
    const hide = () => { tip.hidden = true; svg.classList.remove("is-focus"); };
    svg.addEventListener("pointerover", (e) => { const el = e.target.closest("[data-tip]"); if (el) show(el); });
    svg.addEventListener("pointerout", (e) => { if (!e.relatedTarget || !svg.contains(e.relatedTarget)) hide(); });
    svg.addEventListener("focusin", (e) => { const el = e.target.closest("[data-tip]"); if (el) show(el); });
    svg.addEventListener("focusout", hide);
    // Legend hover highlights one agent.
    $$(".plot-card .legend li[data-agent]").forEach((li) => {
      const on = () => { svg.classList.add("is-focus"); $$(".sb-agent", svg).forEach((g) => g.classList.toggle("is-on", g.dataset.agent === li.dataset.agent)); };
      li.addEventListener("pointerenter", on);
      li.addEventListener("pointerleave", hide);
    });

    segment($("#sb-task"), (v) => { task = v; draw(); });
    segment($("#sb-lat"), (v) => { lat = v; draw(); });
    let last = 0;
    new ResizeObserver(() => { const w = svg.parentElement.clientWidth; if (Math.abs(w - last) > 8) { last = w; draw(); } }).observe(svg.parentElement);
    draw();
  })();

  /* ---------- Results: W per mode ---------- */

  (function wBars() {
    const svg = $("#wbars");
    const W = R.w;
    let last = 0;
    const draw = () => {
    const cw = svg.parentElement.clientWidth || 640;
    const P = { l: cw < 480 ? 92 : 168, r: 48, t: 10, w: Math.round(Math.max(300, Math.min(640, cw))) };
    const bh = 30, gap = 10, grp = 30;
    const max = 80;
    const X = (v) => P.l + (v / max) * (P.w - P.l - P.r);
    let y = P.t;
    let s = "";
    const desc = [];
    W.groups.forEach(([gname, rows]) => {
      s += `<text class="w-grp" x="0" y="${y + 14}">${gname}</text>`;
      y += 24;
      rows.forEach(([key, label]) => {
        const parts = W.parts[key];
        const total = parts.reduce((a, b) => a + b, 0);
        s += `<text class="w-row" x="${P.l - 10}" y="${y + bh / 2 + 5}" text-anchor="end">${label}</text>`;
        let x = X(0);
        parts.forEach((v, i) => {
          const w = X(v) - X(0);
          if (v > 0.05) s += `<rect class="w-seg" tabindex="0" x="${x}" y="${y}" width="${Math.max(0, w - 2)}" height="${bh}" rx="${i === parts.length - 1 || parts.slice(i + 1).every((q) => q <= 0.05) ? 4 : 0}" fill="${W.colors[i]}"><title>${gname}, ${label}: ${W.names[i]} ${v.toFixed(0)}%</title></rect>`;
          x += w;
        });
        s += `<text class="w-total" x="${x + 6}" y="${y + bh / 2 + 5}">${Math.round(total)}%</text>`;
        desc.push(`${gname}, ${label}: W ${Math.round(total)}% (blocked ${parts[0].toFixed(0)}%, waiting ${parts[1].toFixed(0)}%, fixing ${parts[2].toFixed(0)}%)`);
        y += bh + gap;
      });
      y += grp - gap;
    });
    const yb = y - grp + gap;
    let grid = "";
    for (let v = 0; v <= max; v += 20) grid += `<path class="${v ? "w-grid" : "w-zero"}" d="M${X(v)} ${P.t + 18}V${yb}"/><text class="sb-tick" x="${X(v)}" y="${yb + 18}" text-anchor="middle">${v}%</text>`;
    grid += `<text class="sb-axis" x="${(X(0) + X(max)) / 2}" y="${yb + 42}" text-anchor="middle">${P.w < 480 ? "W, % of H's time ↓" : "Human delayed time W, % of H's completion time ↓"}</text>`;
    svg.setAttribute("viewBox", `0 0 ${P.w} ${yb + 52}`);
    svg.innerHTML = `<desc id="w-desc">${desc.join(". ")}.</desc>${grid}${s}`;
    };
    new ResizeObserver(() => { const w = svg.parentElement.clientWidth; if (Math.abs(w - last) > 8) { last = w; draw(); } }).observe(svg.parentElement);
    draw();
  })();

  /* ---------- Gallery filters ---------- */

  (function galleryFilter() {
    let task = "all";
    let mode = "all";
    const cards = $$(".ep");
    const apply = () => {
      let n = 0;
      cards.forEach((c) => {
        const ok = (task === "all" || (task === "positive" ? c.dataset.pos === "true" : c.dataset.task === task)) && (mode === "all" || c.dataset.mode === mode);
        c.hidden = !ok;
        if (!ok) $("video", c).pause();
        n += ok;
      });
      $("#g-count").textContent = `${n} of ${cards.length} episodes`;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    segment($("#g-task"), (v) => { task = v; apply(); });
    segment($("#g-mode"), (v) => { mode = v; apply(); });
    apply();
  })();

  /* ---------- Drawings and motion ---------- */

  FIG.live($("#md"));
  if (window.TEASER) TEASER.wire($("#fig1"), C, { shape, num });

  NAV.wire();
  const links = Object.fromEntries(nav.map(([, id]) => [id, $(`.nav-links a[href="#${id}"]`)]));
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => links[e.target.id].classList.toggle("is-active", e.isIntersecting)), { rootMargin: "-45% 0px -50% 0px" });
  nav.forEach(([, id]) => spy.observe(document.getElementById(id)));

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      // The awning nav comes down (fascia, then the valance unfurls), then the name, links and hero come in.
      const awningIn = (vars) => gsap.timeline(vars)
        .from(".nav", { yPercent: -100, duration: 0.45, ease: "power3.out" })
        .from(".nav-awning i", { scaleY: 0, duration: 0.6, ease: "power3.out", stagger: { each: 0.012, from: "center" } }, "-=.2");
      const navText = (vars) => gsap.from(".nav-in > *", { autoAlpha: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, ...vars });
      const heroIn = (vars) => gsap.from(".hero-text > *, .hero-clip", { autoAlpha: 0, y: 12, duration: 0.6, ease: "power3.out", stagger: 0.05, ...vars });
      const intro = window.COOKE_INTRO;
      if (intro) {
        // With the door intro (intro.js): the awning nav drops in front of the shopfront as the visitor walks through
        // the doorway, and the logo, links, title and video come in once they are inside.
        const awning = awningIn({ paused: true });
        const text = navText({ paused: true });
        const rest = heroIn({ paused: true });
        intro.entering.then(() => awning.play());
        intro.entered.then(() => { text.play(); rest.play(); });
      } else {
        gsap.timeline().add(awningIn()).add(navText(), "-=.3").add(heroIn(), "<");
      }
      gsap.set("[data-r]", { autoAlpha: 0, y: 14 });
      ScrollTrigger.batch("[data-r]", {
        start: "top 94%", once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", overwrite: true }),
      });
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    $$("img").forEach((img) => img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true }));
    $$("details").forEach((d) => d.addEventListener("toggle", () => ScrollTrigger.refresh()));
  }
})();
