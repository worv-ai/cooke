/*
 * Leaderboard page (leaderboard.html), in the project page's style. For the chosen mode: each agent's five-task mean
 * S and B, then one task per column (S or B). Numbers and copy come from leaderboard-data.js; the footer from
 * content.js. Rows keep the paper's agent order until the reader sorts a column. A first click puts the better
 * values first (high S, low B), a second click reverses, a third returns to the paper's order. The two references
 * stay at the bottom. Night mode follows the same rule and remembered choice as the project page.
 */
(() => {
  const C = window.CONTENT;
  const D = window.LEADERBOARD;
  const L = D.copy;
  const T = D.tasks;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const num = (v, d = 2) => v.toFixed(d).replace("-", "−");

  // The project page's logo (main.js), with blinking eyes.
  const wordmark = () => `<span class="wm" role="img" aria-label="COOK·E"><svg viewBox="0 0 1400 248" aria-hidden="true">
    <image class="wm-day" href="media/cooke-logo.png" width="1400" height="248"/>
    <image class="wm-night" href="media/cooke-logo-ink.png" width="1400" height="248"/>
    <g class="wm-eye" fill="#fefdfd"><ellipse cx="560.84" cy="97.38" rx="10.82" ry="18.03"/><ellipse cx="635.68" cy="97.38" rx="10.52" ry="18.03"/></g>
  </svg></span>`;

  // Agent markers: one shape per agent, hollow for communication off.
  const shape = (kind, x, y, r) => {
    if (kind === "circle") return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    if (kind === "square") return `<rect x="${x - r * 0.88}" y="${y - r * 0.88}" width="${r * 1.76}" height="${r * 1.76}"/>`;
    const k = kind === "triangle" ? 1 : -1;
    return `<path d="M${x} ${y - k * r * 1.1}L${x + r * 1.05} ${y + k * r * 0.75}L${x - r * 1.05} ${y + k * r * 0.75}Z"/>`;
  };
  const marker = (a, filled) => `<svg class="mk" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><g fill="${filled ? a.color : "none"}" stroke="${a.color}" stroke-width="1.6">${shape(a.shape, 7, 7, 5.4)}</g></svg>`;

  const seg = (id, label, options, on) => `<div class="seg is-sm" id="${id}" role="group" aria-label="${label}">${options.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === on}">${l}</button>`).join("")}</div>`;
  const hhB = T.map((t) => D.hhB[t.id]);
  const hhMean = hhB.reduce((a, b) => a + b, 0) / hhB.length;

  $("#app").innerHTML = `
    <a class="skip" href="#leaderboard">Skip to the leaderboard</a>
    <header class="lb-top"><div class="wrap lb-top-in">
      <a class="lb-home" href="index.html" aria-label="COOK·E project page">${wordmark()}</a>
      <a class="lb-back" href="index.html">← Project page</a>
      <button class="mode" id="mode" type="button" role="switch" aria-label="Night mode" aria-checked="true"><span class="mode-label">Night mode</span><i aria-hidden="true"></i><b id="mode-state">On</b></button>
    </div></header>
    <main>
      <section class="pad lb" id="leaderboard"><div class="wrap">
        <header class="sec-head">
          <h2>${L.kicker}</h2>
          <p class="claim">${L.claim}</p>
          <p class="lede">${L.lede}</p>
        </header>
        <div class="lb-ctl">
          <div class="lb-row"><span class="seg-label">${L.modeLabel}</span>${seg("lb-mode", L.modeLabel, Object.entries(D.modeNames), L.defaultMode)}</div>
          <div class="lb-row"><span class="seg-label">${L.metricLabel}</span>${seg("lb-metric", L.metricLabel, L.metrics, "S")}</div>
        </div>
        <div class="lb-card">
          <div class="lb-scroll"><table class="lb-table" id="lb-table"></table></div>
          <p class="lb-note">${L.order}</p>
          <p class="lb-note">${L.refNote} ${D.sbNote}</p>
        </div>
        <div class="lb-submit" role="note"><span class="lb-tag">${D.pending}</span><h3>${L.submit.title}</h3><p>${L.submit.body}</p></div>
      </div></section>
    </main>
    <footer class="foot"><div class="wrap foot-in">${wordmark()}<p>${C.resources.footer}</p></div></footer>`;

  /* ---------- Night mode (the same rule and stored choice as main.js) ---------- */

  const NIGHT_KEY = "cooke-night";
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  let chosen = null;
  try { chosen = localStorage.getItem(NIGHT_KEY); } catch { /* storage blocked: follow the system */ }
  let night = chosen ? chosen === "on" : systemDark.matches;
  const applyTheme = () => {
    document.body.dataset.theme = night ? "ink" : "cream";
    $("#mode").setAttribute("aria-checked", night);
    $("#mode-state").textContent = night ? "On" : "Off";
    $('meta[name="theme-color"]').content = night ? "#141210" : "#f4f2f1";
  };
  $("#mode").addEventListener("click", () => {
    night = !night;
    chosen = night === systemDark.matches ? null : night ? "on" : "off";
    try { if (chosen) localStorage.setItem(NIGHT_KEY, chosen); else localStorage.removeItem(NIGHT_KEY); } catch { /* not remembered */ }
    applyTheme();
  });
  systemDark.addEventListener("change", (e) => { if (!chosen) { night = e.matches; applyTheme(); } });
  applyTheme();

  /* ---------- Table ---------- */

  const table = $("#lb-table");
  let mode = L.defaultMode;
  let metric = "S";
  let sort = null; // { key, dir }

  // Diverging bar for the mean S: one fixed scale for every mode, from below the lowest mean to two humans (1).
  const allMeans = Object.values(D.sb.average).flat().map((p) => p[0]);
  const lo = Math.floor(Math.min(...allMeans, -1)) - 0.5;
  const pos = (v) => ((v - lo) / (1 - lo)) * 100;
  const bar = (v) => {
    const z = pos(0);
    const p = pos(v);
    return `<span class="lb-bar" aria-hidden="true"><i class="${v < 0 ? "is-neg" : "is-pos"}" style="left:${Math.min(z, p).toFixed(1)}%;width:${Math.abs(p - z).toFixed(1)}%"></i><b style="left:${z.toFixed(1)}%"></b></span>`;
  };
  // Cell tint by distance from the human alone: worse in red, better in green. The strength is set here and the
  // colour in leaderboard.css, so both themes can tint.
  const tint = (v, kind) => {
    const d = kind === "S" ? v : 1 - v; // > 0 is better than the human alone
    if (Math.abs(d) < 0.005) return "";
    const a = (kind === "S" ? Math.min(Math.abs(d) / 3, 1) : Math.min(Math.abs(d) / 1.2, 1)) * 32 + (d > 0 ? 6 : 0);
    return ` class="${d < 0 ? "is-worse" : "is-better"}" style="--a:${a.toFixed(1)}%"`;
  };

  const rows = () => D.agents.map((a, i) => ({
    a,
    mean: D.sb.average[mode][i],
    task: Object.fromEntries(T.map((t) => [t.id, D.sb[t.id][mode][i]])),
  }));
  const value = (r, key) => (key === "S" ? r.mean[0] : key === "B" ? r.mean[1] : r.task[key][metric === "S" ? 0 : 1]);
  const kindOf = (key) => (key === "S" || key === "B" ? key : metric);
  const best = (key) => (kindOf(key) === "S" ? "desc" : "asc");

  const draw = () => {
    const rs = rows();
    if (sort) rs.sort((x, y) => (value(x, sort.key) - value(y, sort.key)) * (sort.dir === "asc" ? 1 : -1));
    const m = metric === "S" ? 0 : 1;
    const head = (key, label) => {
      const on = sort && sort.key === key;
      const aria = on ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
      const arrow = on ? (sort.dir === "asc" ? "↑" : "↓") : "↕";
      return `<th scope="col" aria-sort="${aria}"><button type="button" data-key="${key}" title="${L.sortHint}">${label}<i aria-hidden="true">${arrow}</i></button></th>`;
    };
    const filled = mode.endsWith("on");
    const cls = (attr, extra) => attr.replace('class="', `class="${extra} `) || ` class="${extra}"`;
    table.innerHTML = `<caption>${D.modeNames[mode]}. Task columns show ${metric === "S" ? "task efficiency S" : "human burden B"}.</caption>
      <thead><tr><th scope="col">${L.cols.agent}</th>${head("S", L.cols.s)}${head("B", L.cols.b)}${T.map((t) => head(t.id, t.name)).join("")}</tr></thead>
      <tbody>${rs.map((r) => `<tr>
        <th scope="row">${marker(r.a, filled)}${r.a.name}</th>
        <td${cls(tint(r.mean[0], "S"), "lb-s")}>${bar(r.mean[0])}<span>${num(r.mean[0])}</span></td>
        <td${tint(r.mean[1], "B")}>${num(r.mean[1])}</td>
        ${T.map((t) => { const v = r.task[t.id][m]; return `<td${tint(v, metric)}>${num(v)}</td>`; }).join("")}
      </tr>`).join("")}</tbody>
      <tbody class="lb-ref">
        <tr><th scope="rowgroup" colspan="${3 + T.length}">${L.refs.title}</th></tr>
        <tr><th scope="row">${L.refs.hh}</th><td class="lb-s">${bar(1)}<span>${num(1)}</span></td><td>≈ ${num(hhMean)}</td>${T.map((t, i) => `<td>${metric === "S" ? num(1) : num(hhB[i])}</td>`).join("")}</tr>
        <tr><th scope="row">${L.refs.h}</th><td class="lb-s">${bar(0)}<span>${num(0)}</span></td><td>${num(1)}</td>${T.map(() => `<td>${metric === "S" ? num(0) : num(1)}</td>`).join("")}</tr>
      </tbody>`;
  };

  table.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-key]");
    if (!b) return;
    const key = b.dataset.key;
    const first = best(key);
    if (!sort || sort.key !== key) sort = { key, dir: first };
    else if (sort.dir === first) sort = { key, dir: first === "asc" ? "desc" : "asc" };
    else sort = null;
    draw();
    $(`button[data-key="${key}"]`, table).focus();
  });

  const segment = (el, onChange) => el.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", el).forEach((x) => x.setAttribute("aria-pressed", x === b));
    onChange(b.dataset.v);
  });
  segment($("#lb-mode"), (v) => { mode = v; draw(); });
  segment($("#lb-metric"), (v) => {
    metric = v;
    if (sort && sort.key !== "S" && sort.key !== "B") sort = null; // a task-column sort meant the other metric
    draw();
  });
  draw();
})();
