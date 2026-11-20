/* Renders the page from content.js, then wires up motion. Copy changes belong in content.js. */
(() => {
  const C = window.CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const minus = (n, d = 2) => n.toFixed(d).replace("-", "−");

  /* ---------- Shared markup ---------- */

  /* COOK·E logo (projectpage/cook-E.png, cut out by projectpage/make_cooke_logo.py): brown letters for the cream
   * theme, cream letters for night mode and the red footer. The face's eyes are erased from the PNGs and drawn here
   * so they can blink; their positions come from media/hero_logo-eyes.json. */
  const wordmark = () => `<span class="wm" role="img" aria-label="COOK·E"><svg viewBox="0 0 1400 248" aria-hidden="true">
    <image class="wm-day" href="media/hero_logo.png" width="1400" height="248"/>
    <image class="wm-night" href="media/hero_logo-night.png" width="1400" height="248"/>
    <g class="wm-eye" fill="#fefdfd"><ellipse cx="560.84" cy="97.38" rx="10.82" ry="18.03"/><ellipse cx="635.68" cy="97.38" rx="10.52" ry="18.03"/></g>
  </svg></span>`;

  const awning = () => `<div class="awning" aria-hidden="true">${"<i></i>".repeat(20)}</div>`;

  const media = (m) => {
    if (m.src) {
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(m.src);
      const el = isVideo
        ? `<video src="${m.src}" ${m.poster ? `poster="${m.poster}"` : ""} muted loop playsinline ${m.autoplay ? 'autoplay preload="auto"' : 'preload="metadata"'} aria-label="${m.label}"></video>`
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
    ["Demo", "demo", 0, false], ["Abstract", "abstract", 0, true], ["Overview", "overview", 0, false],
    ["Motivation", "gap", 1, false], ["Tasks", "tasks", 2, true], ["Metrics", "metrics", 3, false],
    ["Results", "results", 4, true], ["Why robots fail", "failures", 5, true], ["Real world", "real", 6, true],
    ["Resources", "resources", 0, false],
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
      <p class="matrix-cap"><b>Table 1.</b> ${t.caption}</p>
    </div>`;
  })();

  const hero = `<section class="hero" id="top">
    <div class="hero-media">${media(C.hero.media)}<div class="hero-shade"></div></div>
    ${awning()}
    <div class="hero-body wrap">
      <h1>${wordmark()}</h1>
      <p class="hero-exp">${C.hero.expansion || "<b>CO</b>llaborative <b>O</b>pen <b>K</b>itchen-<b>E</b>valuation"}</p>
      <p class="hero-title">${C.hero.title}</p>
      <p class="hero-authors">${C.hero.authors}</p>
      <div class="btns">${C.hero.links.map((l) => button(l, C.hero.pending)).join("")}</div>
      <a class="hero-lb" href="${C.hero.leaderboard.href}"><b>${C.hero.leaderboard.label}</b><span>${C.hero.leaderboard.note}</span><i aria-hidden="true">→</i></a>
    </div>
    <a class="hero-cue" href="#abstract">Scroll to explore</a>
  </section>`;

  const abstract = `<section class="pad" id="abstract"><div class="wrap">
    ${head({ title: C.abstract.kicker, claim: C.abstract.lead })}
    <p class="abs-body">${C.abstract.body}</p>
  </div></section>`;

  // The demo video, right under the hero (the Video button points here). It plays only when the reader starts it.
  const DM = C.demo;
  // Full width, edge to edge, with no heading: the body starts below it.
  const demos = `<section class="dm" id="demo" aria-label="${DM.kicker}">
    <video src="${DM.src}" poster="${DM.poster}" controls playsinline preload="metadata" aria-label="${DM.label}"></video>
    ${DM.note ? `<p class="dm-note" lang="ko">${DM.note}</p>` : ""}
  </section>`;

  const KR = C.keyResults;
  // Key results as a race: one line per team, filled at the team's average pace (raceLines() below).
  const keyResults = `<section class="pad kr" id="key-results"><div class="wrap">
    <h2 class="kr-title">${KR.kicker}</h2>
    <p class="kr-claim">${KR.claim}</p>
    <ol class="kr-race" id="kr-race">${KR.lanes.map((l, i) => `<li class="${i > 1 ? "is-robot" : ""}">
      <span class="kr-lbl">${l}</span>
      <span class="kr-track"><i></i></span>
      <b class="kr-rank"></b>
    </li>`).join("")}</ol>
    <p class="kr-note">${KR.note} <button type="button" class="kr-replay" id="kr-replay">↻ ${KR.replay}</button></p>
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
        <h3>${B.human.title}</h3>
        <p class="hsim-lead">${B.human.lead}</p>
        <ol class="hsim-steps">${B.human.steps.map(([name, tone, line], i) => `<li class="t-${tone}"><b><span>${pad(i + 1)}</span>${name}</b><p>${line}</p></li>`).join("")}</ol>
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
  // A card per metric: which direction is better, then the formula, then the values that match the two references
  // (human-alone H, two humans H-H), set apart from the rest.
  const metricCard = (m) => `<article class="mt-card">
    <h3>${m.name}</h3>
    ${m.better ? `<p class="mt-dir">${/Higher/.test(m.better) ? "↑" : "↓"} ${m.better}</p>` : ""}
    <p class="mt-short">${m.short}</p>
    ${tex(m.tex)}
    <p class="mt-where">${m.where}</p>
    <ul class="stops">${m.stops.map(([k, v, tone, ref]) => `<li class="t-${tone}${ref ? " is-ref" : ""}"><b>${k}</b><span>${ref ? `<em>${ref}</em>` : ""}${v}</span></li>`).join("")}</ul>
  </article>`;
  const metrics = `<section class="pad" id="metrics"><div class="wrap">
    ${head({ n: 3, title: C.metrics.kicker, claim: C.metrics.heading, body: C.metrics.body })}
    <div class="mt-grid is-3">${metricCard(C.metrics.score)}${metricCard(C.metrics.burden)}${metricCard(C.metrics.delay)}</div>
  </div></section>`;

  // 04 Results: one table of medians (results-table-data.js). Rows: each agent at both latencies; columns: S, B and W
  // with communication off, then on. Cells where the robot helps (S > 0 and B < 1) take the paper's shading.
  const RS2 = C.results;
  const RT = window.RESULTS_TABLE;
  const sgn = (v) => v.toFixed(2).replace("-", "−");
  const rtCell = (c) => {
    if (!c) return `<td class="rt-na" colspan="3">${RS2.table.na}</td>`;
    const [S, B, W, n] = c;
    const help = S > 0 && B < 1 ? " is-help" : "";
    return `<td class="rt-s${help}" title="${n} runs">${sgn(S)}</td><td class="${help.trim()}">${B.toFixed(2)}</td><td class="rt-w${help}">${W == null ? "–" : `${Math.round(W * 100)}%`}</td>`;
  };
  const rtRows = RT ? RT.groups.map((g) => `<tr class="rt-group"><th colspan="8" scope="rowgroup">${g.name}</th></tr>
    ${g.rows.map((r) => r.pending
      ? `<tr class="rt-pending"><th scope="row">${r.name}</th><td colspan="7">${RS2.table.running}</td></tr>`
      : RS2.lat.map(([k, label], i) => `<tr class="${i ? "rt-2nd" : ""}">${i ? "" : `<th scope="row" rowspan="2">${r.name}</th>`}<td class="rt-lat">${label}</td>${rtCell(r.cells[`${k}-off`])}${rtCell(r.cells[`${k}-on`])}</tr>`).join("")).join("")}`).join("") : "";
  const results = `<section class="pad" id="results"><div class="wrap">
    ${head({ n: 4, title: RS2.kicker, claim: RS2.claim, body: RS2.body })}
    <div class="rt" data-r>
      <div class="rt-scroll"><table class="rt-table">
        <thead>
          <tr><th rowspan="2" scope="col">${RS2.table.agent}</th><th rowspan="2" scope="col">${RS2.latLabel}</th><th colspan="3" scope="colgroup">${RS2.labels.off}</th><th colspan="3" scope="colgroup">${RS2.labels.on}</th></tr>
          <tr>${[0, 1].map(() => RS2.table.cols.map(([k, dir]) => `<th scope="col">${k} <i>${dir}</i></th>`).join("")).join("")}</tr>
        </thead>
        <tbody class="rt-ref">
          <tr><th scope="row">${RS2.labels.h}</th><td class="rt-lat">${RS2.table.ref}</td>${[0, 1].map(() => `<td>0.00</td><td>1.00</td><td>0%</td>`).join("")}</tr>
          <tr><th scope="row">${RS2.labels.hh}</th><td class="rt-lat">${RS2.table.ref}</td>${[0, 1].map(() => `<td>1.00</td><td>${RT ? RT.hhB.toFixed(2) : "–"}</td><td>–</td>`).join("")}</tr>
        </tbody>
        <tbody>${rtRows}</tbody>
      </table></div>
      <p class="rt-note">${RS2.table.note}${RT && RT.pending.length ? ` <b>${RT.pending.join(", ")}: ${RS2.table.pending}</b>` : ""}</p>
    </div>
    <ul class="rs-takeaways">${RS2.takeaways.map((t) => `<li>${t}</li>`).join("")}</ul>
  </div></section>`;

  const FL = C.failures;
  const W = FL.w;
  const failures = `<section class="pad" id="failures"><div class="wrap">
    ${head({ n: 5, title: FL.kicker, claim: FL.claim, body: FL.body })}
    <div class="panel wb" data-r>
      <div class="panel-head"><h3>${W.title}</h3></div>
      <p class="wb-lede">${W.body}</p>
      <ul class="wb-legend">${W.names.map((n, i) => `<li class="t-${W.tones[i]}"><i></i>${n}</li>`).join("")}</ul>
      <div class="wb-rows" id="wb-rows">
        ${W.rows.map(([lat, comm, parts]) => `<div class="wb-row">
          <span class="wb-lbl"><b>${lat}</b>${comm}</span>
          <div class="wb-track">${parts.map((v, i) => `<i class="t-${W.tones[i]}" data-w="${v}" title="${W.names[i]}: ${v}%">${v >= 6 ? `<span>${v.toFixed(0)}</span>` : ""}</i>`).join("")}</div>
          <span class="wb-sum">${parts.reduce((a, b) => a + b, 0).toFixed(0)}%</span>
        </div>`).join("")}
        <div class="wb-axis" aria-hidden="true"><span></span><div>${[0, 20, 40, 60].map((v) => `<b style="left:${(v / 60) * 100}%">${v}%</b>`).join("")}</div><span></span></div>
      </div>
      <p class="wb-note">${W.note}</p>
    </div>
    <div class="fl-grid">${FL.items.map((it) => `<article class="fl-card" data-r>
      <h3>${it.name}</h3>
      <p class="fl-stat"><b>${it.stat}</b><span>${it.statLabel}</span></p>
      <p class="fl-body">${it.body}</p>
    </article>`).join("")}</div>
  </div></section>`;

  // 06 Real world: the setup from above (after the paper's Fig. 7), in the same soft style as the decision-loop kitchen.
  const rwSetup = (L) => {
    const cap = (x1, y1, x2, y2) => `<path class="k-cap-o" d="M${x1} ${y1}L${x2} ${y2}"/><path class="k-cap-i" d="M${x1} ${y1}L${x2} ${y2}"/>`;
    return `<svg class="rws-svg" viewBox="0 0 400 250" role="img" aria-label="${L.robot} on the left and the ${L.human.toLowerCase()} on the right, both reaching into the ${L.space.toLowerCase()}; a ${L.head.toLowerCase()} above the robot and ${L.wrist.toLowerCase()} on its grippers.">
      <rect class="rws-table" x="100" y="46" width="200" height="164" rx="10"/>
      <text class="rws-in" x="200" y="203">${L.space}</text>
      <rect class="rws-item" x="176" y="100" width="48" height="26" rx="5"/><circle class="rws-item" cx="176" cy="160" r="9"/><circle class="rws-item" cx="224" cy="160" r="9"/>
      <g class="k-arm t-robot">${cap(62, 108, 138, 100)}<circle class="rws-cam" cx="142" cy="100" r="3.5"/></g>
      <g class="k-arm t-robot">${cap(62, 156, 146, 164)}<circle class="rws-cam" cx="150" cy="165" r="3.5"/></g>
      <rect class="k-body t-robot" x="40" y="86" width="24" height="92" rx="8"/>
      <rect class="rws-head" x="45" y="64" width="14" height="10" rx="2"/>
      <g class="k-arm is-human t-human">${cap(328, 112, 266, 104)}<circle class="k-hand" cx="264" cy="104" r="6"/></g>
      <g class="k-arm is-human t-human">${cap(328, 152, 258, 160)}<circle class="k-hand" cx="256" cy="160" r="6"/></g>
      <rect class="k-body t-human" x="324" y="98" width="22" height="66" rx="11"/>
      <circle class="k-head t-human" cx="335" cy="131" r="9"/>
      <text class="rws-lbl" x="52" y="198">${L.robot.replace(" robot", "")}</text><text class="rws-lbl rws-sub" x="52" y="212">robot</text>
      <text class="rws-lbl" x="335" y="198">${L.human}</text>
      <path class="rws-lead" d="M52 64V42"/><text class="rws-lbl rws-sub" x="52" y="36">${L.head}</text>
      <path class="rws-lead" d="M142 95V42"/><text class="rws-lbl rws-sub" x="142" y="36">${L.wrist}</text>
    </svg>`;
  };
  // 06 Real world: task difficulty in simulation and the real world, least affected on top; lines join each task.
  const rwOrder = (O) => {
    const y = (i) => 44 + i * 34;
    const L = 200, R = 330; // right edge of the simulation names, left edge of the real-world names
    const lines = O.sim.map((t, i) => { const j = O.real.indexOf(t); return `<path class="rwo-line${i !== j ? " is-swap" : ""}" d="M${L + 10} ${y(i) - 4}C${(L + R) / 2} ${y(i) - 4} ${(L + R) / 2} ${y(j) - 4} ${R - 10} ${y(j) - 4}"/>`; }).join("");
    return `<svg class="rwo-svg" viewBox="0 0 460 210" role="img" aria-label="${O.note}">
      <text class="rwo-h" x="${L}" y="16" text-anchor="end">${O.cols[0]}</text><text class="rwo-h" x="${R}" y="16">${O.cols[1]}</text>
      ${lines}
      ${O.sim.map((t, i) => `<text class="rwo-t${O.real.indexOf(t) !== i ? " is-swap" : ""}" x="${L}" y="${y(i)}" text-anchor="end">${t}</text>`).join("")}
      ${O.real.map((t, j) => `<text class="rwo-t${O.sim.indexOf(t) !== j ? " is-swap" : ""}" x="${R}" y="${y(j)}">${t}</text>`).join("")}
      <text class="rwo-k" x="0" y="${y(0)}">${O.top}</text><text class="rwo-k" x="0" y="${y(4)}">${O.bottom}</text>
      <path class="rwo-arrow" d="M8 ${y(0) + 10}V${y(4) - 16}"/><path class="rwo-arrow" d="M4 ${y(4) - 21}L8 ${y(4) - 15}L12 ${y(4) - 21}"/>
    </svg>`;
  };

  const RW = C.realWorld;
  const real = `<section class="pad" id="real"><div class="wrap">
    ${head({ n: 6, title: RW.kicker, claim: RW.claim, body: RW.body, badge: RW.badge })}
    <ul class="kr-stats is-2">${RW.stats.map((x) => `<li data-r><b>${x.value}</b><span>${x.label}</span></li>`).join("")}</ul>
    <div class="rwx" data-r>
      <figure class="rws">${rwSetup(RW.setup.labels)}<figcaption>${RW.setup.caption}</figcaption></figure>
      <div class="rwc">${[RW.compare.same, RW.compare.diff].map(([t, items], i) => `<div class="${i ? "is-diff" : ""}"><h3>${t}</h3><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
    </div>
    <div class="rwo-row" data-r>
      <figure class="rwo">
        <figcaption><b>${RW.order.title}</b></figcaption>
        ${rwOrder(RW.order)}
        <p>${RW.order.note}</p>
      </figure>
      <ul class="rwr-points">${RW.points.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>
    <p class="kr-note">${RW.note}</p>
    <div class="rw-block" data-r>
      <div class="rw-head"><h3>Real-world footage</h3><span class="badge">Stand-in clips</span></div>
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
    <main>${hero}${demos}${abstract}${keyResults}${overview}${gap}${tasks}${metrics}${results}${failures}${real}${resources}</main>`;

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

  // Night mode follows the system's light or dark setting, and keeps following it as it changes. Flipping the
  // switch remembers the choice; flipping it back to what the system says forgets it, so the page follows again.
  const NIGHT_KEY = "cooke-night";
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  let chosen = null;
  try { chosen = localStorage.getItem(NIGHT_KEY); } catch { /* storage blocked: follow the system */ }
  let night = chosen ? chosen === "on" : systemDark.matches;

  const applyTheme = () => {
    document.body.dataset.theme = night ? "ink" : "cream";
    $("#mode").setAttribute("aria-checked", night);
    $("#mode-state").textContent = night ? "On" : "Off";
    // While the door intro runs, the browser bar keeps the wall colour; intro.js applies data-page when it ends.
    const meta = $('meta[name="theme-color"]');
    meta.dataset.page = night ? "#141210" : "#f4f2f1";
    if (!document.documentElement.classList.contains("intro-running")) meta.content = meta.dataset.page;
    document.dispatchEvent(new Event("themechange"));
  };
  $("#mode").addEventListener("click", () => {
    night = !night;
    chosen = night === systemDark.matches ? null : night ? "on" : "off";
    try { if (chosen) localStorage.setItem(NIGHT_KEY, chosen); else localStorage.removeItem(NIGHT_KEY); } catch { /* not remembered */ }
    applyTheme();
  });
  systemDark.addEventListener("change", (e) => { if (!chosen) { night = e.matches; applyTheme(); } });
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

  // Safari only autoplays a video that is muted as a property, which markup set by innerHTML does not always give.
  const playMuted = (v) => { v.muted = true; return v.play().catch(() => {}); };
  // Videos start on their own as they scroll into view and pause when they leave; one the reader paused stays paused.
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) e.target.pause();
      else if (!e.target.dataset.held) playMuted(e.target);
    });
  }, { threshold: 0.35 });

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
      ctx.font = `500 ${10 * s}px "Geist Mono", monospace`;
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
      ctx.fillStyle = color("--f-human");
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
          ctx.fillStyle = color("--f-think");
          bar(X(t) + 1, ry, X(Math.min(t + TL.latency, sim)) - X(t) - 2, laneH * 0.42);
          if (sim > t + TL.latency) {
            ctx.fillStyle = color("--f-robot");
            bar(X(t + TL.latency), ry + laneH * 0.5, X(Math.min(t + TL.latency + Math.min(TL.motion, period), sim)) - X(t + TL.latency), laneH * 0.5);
          }
        }
      } else {
        ctx.fillStyle = color("--f-robot");
        bar(X(0), ry, X(sim) - X(0), laneH);
        ctx.fillStyle = color("--f-tomato");
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
        // Videos start on their own even with reduced motion (the reader can pause them); only the drawn clock stays still.
        clock: 0, held: false, rate: 1, phase: null, shown: 0, said: 0, readText: "",
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
          else { delete k.video.dataset.held; playMuted(k.video); }
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
        if (!k.held) playMuted(k.video);
      }
      show(k);
    };

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }).observe($(".tasks-panel"));
    // About a screen before the player arrives, buffer the shown task's video so it starts as soon as it is in view.
    let near = false;
    const buffer = () => {
      const k = tasks.find((x) => !x.el.hidden);
      if (!near || !k || !k.video || k.video.preload === "auto") return;
      k.video.preload = "auto";
      if (k.video.readyState === 0 && k.video.paused) k.video.load(); // load() restarts a video, so never on one that plays
    };
    new IntersectionObserver(([e]) => { near = e.isIntersecting; buffer(); }, { rootMargin: "100% 0px" }).observe($(".tasks-panel"));

    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const k = tasks.find((x) => !x.el.hidden);
      if (k && visible) {
        if (!k.video && !k.held && !reduced) k.clock = (k.clock + dt * k.rate) % k.length;
        buffer();
        show(k);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  })();

  /* ---------- Metrics: collaboration against burden ---------- */

  // Points start on "Human alone" and move out the first time the plot comes into view. The mode
  // switches move them; the task chips change the task. The axes fit the points shown.
  /* ---------- Key results: the race ----------
   * Time to finish relative to one person alone (1): two people take T_HH / T_H; a team with a robot takes
   * 1 − S · (1 − T_HH / T_H). Both are averaged over the five tasks and four agents with communication on, latency-free
   * and latency-aware. Every line fills at its own pace; the rank shows when it finishes. */
  (function raceLines() {
    const D = window.LEADERBOARD;
    const ol = $("#kr-race");
    const ids = D.tasks.map((t) => t.id);
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const ratio = (t) => KR.ref[t][1] / KR.ref[t][0];
    const team = (m) => mean(ids.flatMap((t) => D.sb[t][m].map(([S]) => 1 - S * (1 - ratio(t)))));
    const times = [mean(ids.map(ratio)), 1, team("free-on"), team("aware-on")];
    const order = times.map((_, i) => i).sort((a, b) => times[a] - times[b]);
    const lis = [...ol.children];
    lis.forEach((li, i) => {
      li.style.setProperty("--t", times[i].toFixed(3));
      li.querySelector(".kr-rank").textContent = KR.ranks[order.indexOf(i)];
    });
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SEC = 3; // seconds for one person alone
    let timers = [];
    const run = () => {
      timers.forEach(clearTimeout);
      ol.classList.remove("is-run");
      lis.forEach((li) => li.classList.remove("is-done"));
      void ol.offsetWidth; // restart the transitions
      ol.classList.add("is-run");
      timers = lis.map((li, i) => setTimeout(() => li.classList.add("is-done"), still ? 0 : times[i] * SEC * 1000));
    };
    ol.style.setProperty("--sec", `${SEC}s`);
    if (still) run();
    else new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { obs.disconnect(); run(); } }, { threshold: 0.6 }).observe(ol);
    $("#kr-replay").addEventListener("click", run);
  })();

  /* ---------- 05 Why robots fail: W bars grow on first view ---------- */
  (function wBars() {
    const segs = $$("#wb-rows .wb-track i");
    const MAX = 60;
    const grow = () => segs.forEach((el, i) => {
      el.style.transitionDelay = `${Math.floor(i / 3) * 120 + (i % 3) * 60}ms`;
      el.style.width = `${(Number(el.dataset.w) / MAX) * 100}%`;
    });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { grow(); return; }
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      grow();
    }, { threshold: 0.35 }).observe($("#wb-rows"));
  })();

  /* ---------- Demo candidates (temporary): every draft listed in media/demovideo/demos.json ---------- */
  // The hero loop starts at once, behind the intro door, and pauses only while the hero is scrolled away.
  const heroVideo = $(".hero-media video");
  if (heroVideo) {
    heroVideo.autoplay = true;
    heroVideo.preload = "auto";
    playMuted(heroVideo);
    heroVideo.addEventListener("canplay", () => { if (heroVideo.paused) playMuted(heroVideo); }, { once: true });
    videoObserver.observe(heroVideo);
  }

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
      playMuted(v);
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
  // The rail (and the narrow-screen bar) appears once the full-width demo video has passed, so it never covers it.
  ScrollTrigger.create({
    trigger: $("#demo") ? "#demo" : ".hero", start: "bottom 10%",
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
    const opening = gsap.timeline({ defaults: { ease: "power3.out" }, paused: !!window.COOKE_INTRO })
      .from(".hero .awning i", { scaleY: 0, duration: 0.6, stagger: { each: 0.015, from: "center" } })
      .from(".hero-body > *, .hero-cue", { autoAlpha: 0, duration: 0.6 }, "-=.3");
    // After the door intro (intro.js): the hero image waits slightly enlarged behind the door and settles as the
    // visitor walks through, so the walk carries on into the page; the opening plays once they are inside.
    const intro = window.COOKE_INTRO;
    if (intro) {
      const settle = gsap.fromTo(".hero-media", { scale: 1.12 }, { scale: 1, duration: 2, ease: "power2.out", paused: true });
      intro.entering.then(() => settle.play());
      intro.entered.then(() => opening.play());
    }

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
