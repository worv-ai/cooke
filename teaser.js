/*
 * Interactive Figure 1 (the paper's teaser), built from content.js instead of the flat image. Same six panels:
 *   (a) tasks: pick a task for its facts; the real-world tile switches every table to its real copy.
 *   (b) subtask allocation: step through the Sandwich dialogue and watch who takes each item.
 *   (c) human partner: the state tracking → decision → execution loop, one stage at a time.
 *   (d) evaluation settings: pick a mode and its timeline plays.
 *   (e) main results: S against B for the five-task mean, latency-aware or latency-free.
 *   (f) sim-to-real failures: pick a failure and its simulation clip plays above the real photo.
 * (b), (c), (d) and (f) advance on their own while on screen. "Pause motion" stops them, as does
 * prefers-reduced-motion, and a click inside a panel takes it over from auto-play.
 * The "Paper figure" view shows media/fig-teaser.webp as published.
 * main.js calls TEASER.markup() while rendering the Overview and TEASER.wire() once the page is in the DOM.
 */
window.TEASER = (() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  // Small line icons (24px grid), stroked in the panel colour by teaser.css.
  const icon = {
    robot: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="5.5" width="11" height="8.5" rx="2"/><path d="M8 5.5V2.8" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="2.4" r="1.3"/><circle cx="5.8" cy="9.6" r="1.1" fill="#fff"/><circle cx="10.2" cy="9.6" r="1.1" fill="#fff"/></svg>',
    human: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="4.8" r="3"/><path d="M2.4 15a5.6 5.6 0 0 1 11.2 0z"/></svg>',
    free: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/></svg>',
    aware: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    manip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5h8M8 20.5v-4.5l6-6.5 3.5 2.5M14 9.5l1.5-4.5 3 .5M17.5 12l2.5-1.5"/></svg>',
    plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6l1.6 1.6L8 4.8M3.5 12l1.6 1.6L8 10.8M3.5 18l1.6 1.6L8 16.8M11 6.4h9.5M11 12.4h9.5M11 18.4h9.5"/></svg>',
    talk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-8l-4.5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/></svg>',
  };
  icon.clock = icon.aware;

  /* ---------- Markup ---------- */

  const markup = (C, h) => {
    const F = C.overview.figure1;
    const O = C.overview;
    const BM = C.benchmark;
    const R = C.results;
    const FL = C.failures;
    const panel = (k, title, body) => `<section class="f1-p is-${k}" aria-labelledby="f1-${k}-t">
      <h3 class="f1-h" id="f1-${k}-t"><span>(${k})</span> ${title}</h3><div class="f1-body">${body}</div></section>`;

    const pa = `<div class="f1-tiles" role="group" aria-label="${F.a.label}">
        ${BM.tasks.map((t, i) => `<button type="button" class="f1-tile" data-i="${i}" aria-pressed="${i === 0}">
          <span class="f1-img"><img class="is-sim" src="${t.sim}" alt="" loading="lazy" decoding="async"><img class="is-real" src="${t.real}" alt="" loading="lazy" decoding="async"></span>
          <span class="f1-tl"><b>${t.name}</b><small>${t.tag.toLowerCase()}</small></span></button>`).join("")}
        <button type="button" class="f1-tile is-realtile" data-real aria-pressed="false">
          <span class="f1-img"><img src="${F.a.real.src}" alt="" loading="lazy" decoding="async"><i class="f1-badge">${F.a.real.badge}</i></span>
          <span class="f1-tl"><b>${F.a.real.name}</b><small>${F.a.real.tag}</small></span></button>
      </div>
      <div class="f1-note" aria-live="polite"></div>`;

    const pb = `<ol class="f1-film">${F.b.steps.map((s, i) => `<li><button type="button" class="f1-frame" data-i="${i}" aria-pressed="${i === 0}" aria-label="${s.name}, ${s.t}">
          <img src="${s.src}" alt="" loading="lazy" decoding="async"><span class="f1-time">${icon[s.who]}${s.t}</span></button></li>`).join("")}</ol>
      <div class="f1-say" aria-live="polite"></div>
      <div class="f1-alloc"><p class="f1-k">${F.b.allocTitle}</p>
        <ul>${F.b.items.map((it) => `<li><span>${it.name}</span><i class="f1-own"></i></li>`).join("")}</ul></div>`;

    const pc = `<div class="f1-loop" data-step="0">
        <img class="f1-human" src="${F.c.src}" alt="${F.c.alt}" loading="lazy" decoding="async">
        <div class="f1-arrs" aria-hidden="true"><span class="is-in">→</span><span class="is-out">←</span></div>
        <ol class="f1-steps">${BM.human.steps.map((s, i) => `<li><button type="button" class="f1-step${s.who === "VLM" ? " is-vlm" : ""}" data-i="${i}" aria-pressed="${i === 0}">
          <span class="f1-n">${s.n}</span><b>${F.c.names[i] || s.name}</b><small>${s.who}</small>
          <span class="f1-s">${F.c.short[i]}</span>
          <span class="f1-ex">${i === 2 ? F.c.chain.map((c) => `<i>${c}</i>`).join(" → ") : F.c.examples[i]}</span></button></li>`).join("")}</ol>
      </div>
      <div class="f1-note" aria-live="polite"></div>`;

    const M = BM.modes;
    const pd = `<div class="f1-modes">
        <span></span>${M.cols.map((c) => `<b class="f1-col">${icon[c.id]}${c.name}</b>`).join("")}
        ${M.rows.map((r) => `<b class="f1-row"><span>${F.d.rows[r.id]}</span></b>${M.cols.map((c) => `<button type="button" class="f1-cell" data-lat="${c.id}" data-comm="${r.id}" aria-pressed="false" aria-label="${c.name}, ${r.name.toLowerCase()}">${FIG.cell(c.id, r.id)}</button>`).join("")}`).join("")}
      </div>
      <ul class="f1-legend"><li><i class="md-key is-act"></i>${M.legend.act}</li><li><i class="md-key is-think"></i>${M.legend.think}</li><li><i class="md-key is-pause"></i>${M.legend.paused}</li><li><i class="md-key is-msg"></i>${M.legend.msg}</li></ul>
      <div class="f1-note" aria-live="polite"></div>`;

    const lats = [...R.latency].reverse(); // latency-aware first, as in the figure
    const pe = `<div><p class="f1-claim" aria-live="polite"></p><p class="f1-sub"></p></div>
      <div class="f1-plot"><svg class="f1-sb" viewBox="0 0 300 190" role="img"></svg><div class="f1-tip" hidden></div></div>
      <div class="f1-ctl">
        <div class="seg f1-lat" role="group" aria-label="Latency mode">${lats.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
        <ul class="f1-keys">${R.agents.map((a) => `<li><button type="button" data-agent="${a.id}" aria-pressed="false">${h.marker(a, true, 12)}${a.short}</button></li>`).join("")}
          <li class="f1-cm">${h.marker({ color: "#6a5a4e", shape: "circle" }, false, 11)}${R.labels.off}</li><li class="f1-cm">${h.marker({ color: "#6a5a4e", shape: "circle" }, true, 11)}${R.labels.on}</li></ul>
      </div>`;

    const pf = `<div class="f1-fails">
        <span></span>${FL.items.map((f, i) => `<button type="button" class="f1-chip" data-i="${i}" aria-pressed="${i === 0}">${f.name}</button>`).join("")}
        <b class="f1-row"><span>${F.f.sim}</span></b>${FL.items.map((f, i) => `<div class="f1-ft is-sim" data-i="${i}"><video muted loop playsinline preload="none" poster="${f.sim.poster}" src="${f.sim.src}" aria-label="${f.sim.label}"></video></div>`).join("")}
        <b class="f1-row"><span>${F.f.real}</span></b>${FL.items.map((f, i) => `<div class="f1-ft" data-i="${i}"><img src="${f.real.src}" alt="${f.real.alt}" loading="lazy" decoding="async"></div>`).join("")}
        <span></span>${F.f.marks.map((m, i) => `<span class="f1-x" data-i="${i}"><i aria-hidden="true">✕</i> ${m}</span>`).join("")}
      </div>
      <div class="f1-note" aria-live="polite"></div>`;

    const skill = ([name, what], k) => `<li><span class="f1-ico">${icon[k]}</span><b>${name}</b><i aria-hidden="true"></i><span class="f1-what">${what}</span></li>`;
    const band = `<div class="f1-band">
        <ul class="f1-skills">${skill(F.skills[0], "manip")}${skill(F.skills[1], "plan")}</ul>
        <div class="f1-brand"><div class="f1-awn" aria-hidden="true">${"<i></i>".repeat(14)}</div>${h.wordmark()}</div>
        <ul class="f1-skills">${skill(F.skills[2], "talk")}${skill(F.skills[3], "clock")}</ul>
      </div>`;

    return `<figure class="f1" id="fig1">
      <div class="f1-bar">
        <div class="seg is-chips f1-view" role="group" aria-label="${F.label}">${F.views.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
        <button type="button" class="f1-pp">${F.pause}</button>
      </div>
      <div class="f1-grid">
        ${panel("a", F.a.title, pa)}${panel("b", F.b.title, pb)}${panel("c", F.c.title, pc)}
        ${band}
        ${panel("d", F.d.title, pd)}${panel("e", F.e.title, pe)}${panel("f", F.f.title, pf)}
      </div>
      <img class="f1-paper" src="${O.teaser.src}" alt="${O.teaser.alt}" loading="lazy" decoding="async" hidden>
      <figcaption>${O.teaser.caption}</figcaption>
    </figure>`;
  };

  /* ---------- Behaviour ---------- */

  const wire = (root, C, h) => {
    if (!root) return;
    const F = C.overview.figure1;
    const BM = C.benchmark;
    const R = C.results;
    const FL = C.failures;
    const $ = (s, r = root) => r.querySelector(s);
    const $$ = (s, r = root) => [...r.querySelectorAll(s)];
    const press = (btns, on) => btns.forEach((b) => b.setAttribute("aria-pressed", b === on));
    const state = { playing: !reduced.matches };
    const syncs = [];
    const unpins = [];
    const resync = () => syncs.forEach((s) => s());

    // Calls `step` every `ms` while the panel is on screen and motion is on, until someone clicks in the panel.
    const auto = (panel, ms, step) => {
      let seen = false;
      let pinned = false;
      let t = 0;
      const sync = () => {
        clearInterval(t);
        t = 0;
        if (seen && !pinned && state.playing && !document.hidden) t = setInterval(step, ms);
      };
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.4 }).observe(panel);
      syncs.push(sync);
      unpins.push(() => { pinned = false; });
      return () => { pinned = true; sync(); };
    };
    document.addEventListener("visibilitychange", resync);

    /* (a) Tasks */
    (() => {
      const P = $(".f1-p.is-a");
      const tiles = $$(".f1-tile[data-i]", P);
      const realBtn = $(".f1-tile[data-real]", P);
      const grid = $(".f1-tiles", P);
      const note = $(".f1-note", P);
      let i = 0;
      let real = false;
      const show = () => {
        const t = BM.tasks[i];
        press(tiles, tiles[i]);
        realBtn.setAttribute("aria-pressed", real);
        grid.classList.toggle("is-real", real);
        note.innerHTML = `<p><b>${t.name}</b> · ${t.challenge}</p>
          <p class="f1-meta">${t.subtasks} subtasks · ${F.a.solo} ${t.solo}${real ? ` · ${F.a.realNote}` : ""}</p><p>${t.line}</p>`;
      };
      tiles.forEach((b, k) => b.addEventListener("click", () => { i = k; show(); }));
      realBtn.addEventListener("click", () => { real = !real; show(); });
      show();
    })();

    /* (b) Subtask allocation */
    (() => {
      const P = $(".f1-p.is-b");
      const B = F.b;
      const frames = $$(".f1-frame", P);
      const say = $(".f1-say", P);
      const owners = $$(".f1-own", P);
      let i = 0;
      const show = () => {
        const s = B.steps[i];
        press(frames, frames[i]);
        say.className = `f1-say is-${s.who}`;
        say.style.setProperty("--tail", `${((i + 0.5) / B.steps.length) * 100}%`);
        say.innerHTML = `<p class="f1-who">${icon[s.who]}<b>${s.name}</b><time>${s.t}</time></p><q>${s.quote}</q>`;
        owners.forEach((o, j) => {
          const k = B.items[j].owners[i];
          o.className = `f1-own is-${k}`;
          o.textContent = B.owners[k];
        });
      };
      const pin = auto(P, 3200, () => { i = (i + 1) % B.steps.length; show(); });
      frames.forEach((f, k) => f.addEventListener("click", () => { pin(); i = k; show(); }));
      show();
    })();

    /* (c) Human partner loop */
    (() => {
      const P = $(".f1-p.is-c");
      const steps = $$(".f1-step", P);
      const loop = $(".f1-loop", P);
      const note = $(".f1-note", P);
      let i = 0;
      const show = () => {
        const s = BM.human.steps[i];
        press(steps, steps[i]);
        loop.dataset.step = i;
        note.innerHTML = `<b>${s.name}.</b> ${s.body}`;
      };
      const pin = auto(P, 3000, () => { i = (i + 1) % steps.length; show(); });
      steps.forEach((b, k) => b.addEventListener("click", () => { pin(); i = k; show(); }));
      show();
    })();

    /* (d) Evaluation settings */
    (() => {
      const P = $(".f1-p.is-d");
      const M = BM.modes;
      const cells = $$(".f1-cell", P);
      const note = $(".f1-note", P);
      let k = 0;
      const show = () => {
        const b = cells[k];
        const c = M.cols.find((x) => x.id === b.dataset.lat);
        const r = M.rows.find((x) => x.id === b.dataset.comm);
        press(cells, b);
        note.innerHTML = `<b>${c.name} · ${r.name.toLowerCase()}.</b> ${c.body} ${r.body}`;
      };
      // One playhead sweep (6 s, styles.css) per mode.
      const pin = auto(P, 6000, () => { k = (k + 1) % cells.length; show(); });
      cells.forEach((b, j) => b.addEventListener("click", () => { pin(); k = j; show(); }));
      show();
    })();

    /* (e) Main results: S against B, mean over the five tasks */
    (() => {
      const P = $(".f1-p.is-e");
      const E = F.e;
      const svg = $(".f1-sb", P);
      const tip = $(".f1-tip", P);
      const claim = $(".f1-claim", P);
      const sub = $(".f1-sub", P);
      const AG = R.agents;
      const D = R.sb.average;
      const W = 300;
      const H = 190;
      const pad = { l: 36, r: 10, t: 8, b: 34 };
      // One frame for both modes, so switching moves the points and not the axes.
      const bx = [0.95, 1.45];
      const sy = [-2.75, 0.3];
      const X = (b) => pad.l + ((b - bx[0]) / (bx[1] - bx[0])) * (W - pad.l - pad.r);
      const Y = (s) => pad.t + ((sy[1] - s) / (sy[1] - sy[0])) * (H - pad.t - pad.b);
      let s = `<rect class="f1-help" x="${X(bx[0])}" y="${Y(sy[1])}" width="${X(1) - X(bx[0])}" height="${Y(0) - Y(sy[1])}"/>`;
      [0, -1, -2].forEach((v) => { s += `<path class="f1-gl" d="M${pad.l} ${Y(v)}H${W - pad.r}"/><text class="f1-tick" x="${pad.l - 6}" y="${Y(v) + 3.5}" text-anchor="end">${v ? `−${-v}` : 0}</text>`; });
      [1, 1.2, 1.4].forEach((v) => { s += `<path class="f1-gl" d="M${X(v)} ${pad.t}V${H - pad.b}"/><text class="f1-tick" x="${X(v)}" y="${H - pad.b + 13}" text-anchor="middle">${v}</text>`; });
      s += `<path class="f1-ref" d="M${pad.l} ${Y(0)}H${W - pad.r}M${X(1)} ${pad.t}V${H - pad.b}"/>`;
      s += `<text class="f1-axis" x="${(pad.l + W - pad.r) / 2}" y="${H - 5}" text-anchor="middle">${R.axes.x}</text>`;
      s += `<text class="f1-axis" text-anchor="middle" transform="translate(11 ${(pad.t + H - pad.b) / 2}) rotate(-90)">${R.axes.y}</text>`;
      s += `<text class="f1-hlbl" x="${X(1) + 6}" y="${Y(0) - 5}">${E.alone}</text>`;
      s += `<g class="f1-hd" data-tip="${R.labels.h}: S = 0, B = 1" tabindex="0" role="img" aria-label="${R.labels.h}: S = 0, B = 1" transform="translate(${X(1)} ${Y(0)})"><g fill="#fff" stroke="#2b231f" stroke-width="1.5">${h.shape("diamond", 0, 0, 6)}</g></g>`;
      s += AG.map((a) => `<g class="f1-ag" data-agent="${a.id}"><line class="f1-link" stroke="${a.color}"/>
        ${["off", "on"].map((c) => `<g class="f1-pt" data-c="${c}" tabindex="0" role="img"><circle class="f1-hit" r="11"/><g fill="${c === "on" ? a.color : "#fff"}" stroke="${c === "on" ? "#fff" : a.color}" stroke-width="${c === "on" ? 1.2 : 1.7}">${h.shape(a.shape, 0, 0, 6)}</g></g>`).join("")}</g>`).join("");
      svg.innerHTML = s;

      const groups = $$(".f1-ag", svg);
      let lat = "aware";
      const place = (animate) => {
        const latName = R.latency.find(([k]) => k === lat)[1];
        const go = animate && window.gsap && !reduced.matches;
        AG.forEach((a, i) => {
          const g = groups[i];
          const pts = { off: D[`${lat}-off`][i], on: D[`${lat}-on`][i] };
          const line = $(".f1-link", g);
          const ends = { x1: X(pts.off[1]), y1: Y(pts.off[0]), x2: X(pts.on[1]), y2: Y(pts.on[0]) };
          if (go) gsap.to(line, { attr: ends, duration: 0.6, ease: "power2.inOut" });
          else Object.entries(ends).forEach(([k, v]) => line.setAttribute(k, v));
          ["off", "on"].forEach((c) => {
            const el = $(`[data-c="${c}"]`, g);
            const [S, B] = pts[c];
            const label = `${a.name} · ${latName} · ${R.labels[c]}: S = ${h.num(S)}, B = ${h.num(B)}`;
            el.setAttribute("aria-label", label);
            el.dataset.tip = label;
            if (go) gsap.to(el, { x: X(B), y: Y(S), duration: 0.6, ease: "power2.inOut" });
            else if (window.gsap) gsap.set(el, { x: X(B), y: Y(S) });
            else el.setAttribute("transform", `translate(${X(B)} ${Y(S)})`);
          });
        });
        claim.innerHTML = E.claim[lat];
        sub.textContent = `${E.sub} · ${latName.toLowerCase()}`;
        svg.setAttribute("aria-label", `${E.title}: task efficiency S against human burden B per agent, ${E.sub}, ${latName.toLowerCase()}.`);
      };

      const latBtns = $$(".f1-lat button", P);
      latBtns.forEach((b) => b.addEventListener("click", () => { press(latBtns, b); lat = b.dataset.v; place(true); }));

      // Tooltip on hover and keyboard focus.
      const wrap = svg.parentElement;
      const showTip = (el) => {
        const box = wrap.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        tip.textContent = el.dataset.tip;
        tip.hidden = false;
        tip.style.left = `${Math.min(Math.max(r.left + r.width / 2 - box.left, 80), box.width - 80)}px`;
        tip.style.top = `${r.top - box.top - 6}px`;
      };
      const hideTip = () => { tip.hidden = true; };
      svg.addEventListener("pointerover", (e) => { const el = e.target.closest("[data-tip]"); if (el) showTip(el); });
      svg.addEventListener("pointerout", (e) => { if (!e.relatedTarget || !svg.contains(e.relatedTarget)) hideTip(); });
      svg.addEventListener("focusin", (e) => { const el = e.target.closest("[data-tip]"); if (el) showTip(el); });
      svg.addEventListener("focusout", hideTip);

      // Agent keys: highlight one agent; press again to show all.
      const keys = $$(".f1-keys button", P);
      keys.forEach((b) => b.addEventListener("click", () => {
        const on = b.getAttribute("aria-pressed") !== "true";
        keys.forEach((k) => k.setAttribute("aria-pressed", on && k === b));
        svg.classList.toggle("is-focus", on);
        groups.forEach((g) => g.classList.toggle("is-on", on && g.dataset.agent === b.dataset.agent));
      }));
      place(false);
    })();

    /* (f) Sim-to-real failures */
    (() => {
      const P = $(".f1-p.is-f");
      const grid = $(".f1-fails", P);
      const chips = $$(".f1-chip", P);
      const vids = $$(".f1-ft video", P);
      const note = $(".f1-note", P);
      let i = 0;
      let seen = false;
      const play = () => vids.forEach((v, k) => {
        if (k === i && seen && state.playing && !document.hidden) v.play().catch(() => {});
        else v.pause();
      });
      const show = () => {
        press(chips, chips[i]);
        $$("[data-i]", grid).forEach((el) => el.classList.toggle("is-on", +el.dataset.i === i));
        note.innerHTML = `<b>${FL.items[i].name}.</b> ${FL.items[i].body}`;
        play();
      };
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; play(); }, { threshold: 0.4 }).observe(P);
      syncs.push(play);
      const pin = auto(P, 8000, () => { i = (i + 1) % chips.length; show(); });
      chips.forEach((c, k) => c.addEventListener("click", () => { pin(); i = k; show(); }));
      $$(".f1-ft", P).forEach((t) => t.addEventListener("click", () => { pin(); i = +t.dataset.i; show(); }));
      show();
    })();

    /* Views and motion */
    const grid = $(".f1-grid");
    const paper = $(".f1-paper");
    const views = $$(".f1-view button");
    views.forEach((b) => b.addEventListener("click", () => {
      press(views, b);
      const live = b.dataset.v === "live";
      grid.hidden = !live;
      paper.hidden = live;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
    const pp = $(".f1-pp");
    const setPlaying = (on) => {
      state.playing = on;
      root.classList.toggle("is-moving", on);
      pp.textContent = on ? F.pause : F.play;
      if (on) unpins.forEach((u) => u());
      resync();
    };
    pp.addEventListener("click", () => setPlaying(!state.playing));
    reduced.addEventListener("change", () => setPlaying(!reduced.matches));
    setPlaying(state.playing);
  };

  return { markup, wire };
})();
