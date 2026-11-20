/*
 * Leaderboard page (leaderboard.html). Layout after the RoboCasa and RoboMME leaderboards: a header with the counts,
 * track tabs, a mode switch, one table (pooled S, B and W, then one task metric per column), the two human references,
 * notes, and the benchmark, evaluation and submission sections. Numbers: leaderboard-board.js; copy:
 * leaderboard-copy.js; task names and lines: content.js. Rows are sorted by S (the paper does not rank the agents);
 * any column head re-sorts. Always the light theme.
 */
(() => {
  const C = window.CONTENT;
  const D = window.BOARD;
  const L = window.BOARD_COPY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const num = (v, d = 2) => (v == null ? "–" : v.toFixed(d).replace("-", "−"));
  const pct = (v) => (v == null ? "–" : `${Math.round(v * 100)}%`);
  const fmt = (k, v) => (k === "W" ? pct(v) : num(v));
  const IDX = { S: 0, B: 1, W: 2 };
  document.body.dataset.theme = "cream";

  const wordmark = () => `<span class="wm" role="img" aria-label="COOK·E"><svg viewBox="0 0 1400 248" aria-hidden="true">
    <image class="wm-day" href="media/hero_logo.png" width="1400" height="248"/>
    <g class="wm-eye" fill="#fefdfd"><ellipse cx="560.84" cy="97.38" rx="10.82" ry="18.03"/><ellipse cx="635.68" cy="97.38" rx="10.52" ry="18.03"/></g>
  </svg></span>`;
  const seg = (id, label, options, on) => `<div class="seg is-sm" id="${id}" role="group" aria-label="${label}">${options.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === on}">${l}</button>`).join("")}</div>`;
  const typeClass = (t) => ({ "Agent": "is-agent", "VLA": "is-vla", "VLA + planner": "is-plan", "VLA + oracle plan": "is-oracle" }[t] || "");

  const ready = D.models.filter((m) => !m.pending);
  const counts = { all: D.models.length, agents: D.models.filter((m) => m.track === "agents").length, vla: D.models.filter((m) => m.track === "vla").length };

  $("#app").innerHTML = `
    <a class="skip" href="#board">Skip to the leaderboard</a>
    <header class="lb-top"><div class="lb-wrap lb-top-in">
      <a class="lb-home" href="index.html" aria-label="COOK·E project page">${wordmark()}</a>
      <a class="lb-back" href="index.html">← Project page</a>
    </div></header>
    <main>
      <section class="lb-hero"><div class="lb-wrap">
        <p class="lb-kicker">COOK·E</p>
        <h1>Leaderboard</h1>
        <p class="lb-sub">${L.sub}</p>
        <dl class="lb-stats">
          <div><dt>${L.stats.tasks}</dt><dd>${D.tasks.length}</dd></div>
          <div><dt>${L.stats.models}</dt><dd>${ready.length}</dd></div>
          <div><dt>${L.stats.modes}</dt><dd>${D.modes.length}</dd></div>
          <div><dt>${L.stats.runs}</dt><dd>${D.runs}</dd></div>
        </dl>
        <div class="lb-actions">${L.buttons.map((b) => `<a class="lb-btn${b.primary ? " is-primary" : ""}" href="${b.href}">${b.label}</a>`).join("")}<span class="lb-updated">${L.updated} ${D.updated}</span></div>
      </div></section>

      <section class="lb-board" id="board"><div class="lb-wrap">
        <div class="lb-bar">
          <div class="lb-tabs" role="tablist">${L.tracks.map(([k, l], i) => `<button type="button" role="tab" data-v="${k}" aria-selected="${i === 0}">${l}<span>${counts[k]}</span></button>`).join("")}</div>
          <div class="lb-ctl">
            <label><span>${L.modeLabel}</span>${seg("lb-mode", L.modeLabel, Object.entries(L.modeNames), L.defaultMode)}</label>
            <label><span>${L.taskLabel}</span>${seg("lb-metric", L.taskLabel, L.metrics, "S")}</label>
          </div>
        </div>
        <div class="lb-card"><div class="lb-scroll"><table class="lb-table" id="lb-table"></table></div></div>
        <ul class="lb-notes">${L.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
      </div></section>

      <section class="lb-about"><div class="lb-wrap lb-about-grid">
        ${L.sections.map((s, i) => `<article class="lb-sec" id="${s.id}">
          <p class="lb-no">${String(i + 1).padStart(2, "0")}</p>
          <h2>${s.title}${s.tag ? ` <span class="lb-tag">${s.tag}</span>` : ""}</h2>
          ${s.body ? `<p>${s.body}</p>` : ""}
          ${s.tasks ? `<ul class="lb-taskchips">${C.tasks.items.map((t) => `<li><b>${t.name}</b><span>${t.behavior}</span></li>`).join("")}</ul>` : ""}
          ${s.items ? `<dl class="lb-defs">${s.items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>` : ""}
        </article>`).join("")}
      </div></section>
    </main>
    <footer class="lb-foot"><div class="lb-wrap">${wordmark()}<p>${C.resources.footer}</p></div></footer>`;

  /* ---------- Table ---------- */
  const table = $("#lb-table");
  let track = "all";
  let mode = L.defaultMode;
  let metric = "S";
  let sort = { key: "S", dir: "desc" };

  // A small diverging bar for S, on one scale for the whole table: 0 is the human alone, 1 two humans.
  const lo = -4.5;
  const at = (v) => ((Math.max(lo, Math.min(1, v)) - lo) / (1 - lo)) * 100;
  const sbar = (v) => v == null ? "" : `<span class="lb-sbar" aria-hidden="true"><i class="${v < 0 ? "is-neg" : "is-pos"}" style="left:${Math.min(at(0), at(v)).toFixed(1)}%;width:${Math.abs(at(v) - at(0)).toFixed(1)}%"></i><b style="left:${at(0).toFixed(1)}%"></b></span>`;
  const helps = (c) => c && c[0] > 0 && c[1] < 1;

  const valueOf = (m, key) => {
    const c = m.modes[mode];
    if (!c) return null;
    if (key in IDX) return c.all ? c.all[IDX[key]] : null;
    const t = c.tasks[key];
    return t ? t[IDX[metric]] : null;
  };
  const better = (key) => ((key in IDX ? key : metric) === "S" ? "desc" : "asc");

  const head = (key, label, extra = "") => {
    const on = sort.key === key;
    const arrow = on ? (sort.dir === "asc" ? "↑" : "↓") : "";
    return `<th scope="col" class="lb-num${extra}" aria-sort="${on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}"><button type="button" data-key="${key}" title="${L.sortHint}">${label}<i aria-hidden="true">${arrow}</i></button></th>`;
  };

  const draw = () => {
    const rows = D.models.filter((m) => track === "all" || m.track === track);
    const has = rows.filter((m) => !m.pending && m.modes[mode]);
    const rest = rows.filter((m) => !has.includes(m));
    has.sort((x, y) => {
      const a = valueOf(x, sort.key), b = valueOf(y, sort.key);
      if (a == null) return 1;
      if (b == null) return -1;
      return (sort.dir === "asc" ? 1 : -1) * (a - b);
    });
    const H = L.heads;
    const tcount = D.tasks.length;
    const model = (m, i) => `<td class="lb-rank">${i == null ? "" : i < 3 ? `<span class="lb-medal">${i + 1}</span>` : i + 1}</td>
      <th scope="row" class="lb-model"><b>${m.name}</b><span>${m.org}${m.open ? ` <em class="lb-open">${L.cols.open}</em>` : ""}</span></th>
      <td class="lb-type"><span class="lb-badge ${typeClass(m.type)}">${m.type}</span></td>`;
    const body = has.map((m, i) => {
      const c = m.modes[mode];
      const all = c.all;
      return `<tr${i < 3 ? ` class="is-top is-top${i + 1}"` : ""}>${model(m, i)}
        <td class="lb-num lb-s${helps(all) ? " is-help" : ""}">${sbar(all && all[0])}<span>${num(all && all[0])}</span></td>
        <td class="lb-num${helps(all) ? " is-help" : ""}">${num(all && all[1])}</td>
        <td class="lb-num lb-gap${helps(all) ? " is-help" : ""}">${pct(all && all[2])}</td>
        ${D.tasks.map((t) => { const v = c.tasks[t.id]; return v ? `<td class="lb-num lb-t${helps(v) ? " is-help" : ""}" title="${v[3]} runs">${fmt(metric, v[IDX[metric]])}</td>` : `<td class="lb-num lb-t lb-na">${L.pendingTask}</td>`; }).join("")}
      </tr>`;
    }).join("");
    const muted = rest.map((m) => `<tr class="lb-off">${model(m, null)}<td colspan="${3 + tcount}" class="lb-offnote">${m.pending ? L.pending : L.notRun}</td></tr>`).join("");
    const hhB = D.refs.hhB;
    const ref = (name, S, B, W, per) => `<tr class="lb-ref"><td class="lb-rank"></td><th scope="row" class="lb-model"><b>${name}</b></th><td class="lb-type"></td>
      <td class="lb-num lb-s">${sbar(S)}<span>${num(S)}</span></td><td class="lb-num">${num(B)}</td><td class="lb-num lb-gap">${W}</td>
      ${D.tasks.map((t) => `<td class="lb-num lb-t">${per(t.id)}</td>`).join("")}</tr>`;
    // Fixed column widths (leaderboard.css): the model column takes what is left, so the table never outgrows its card.
    const cols = `<colgroup><col class="c-rank"><col class="c-model"><col class="c-type"><col class="c-s"><col class="c-b"><col class="c-w">${D.tasks.map(() => '<col class="c-t">').join("")}</colgroup>`;
    table.innerHTML = `<caption>${L.modeNames[mode]}</caption>${cols}
      <thead>
        <tr class="lb-groups"><th colspan="3"></th><th colspan="3" scope="colgroup">${L.cols.pooled}</th><th colspan="${tcount}" scope="colgroup" class="lb-gap-l lb-t">${L.cols.tasks} · ${H[metric][2]} ${metric} ${H[metric][1]}</th></tr>
        <tr>
          <th scope="col" class="lb-rank">${L.cols.n}</th><th scope="col" class="lb-model">${L.cols.model}</th><th scope="col" class="lb-type">${L.cols.type}</th>
          ${["S", "B", "W"].map((k, j) => head(k, `${H[k][0]} <small>${H[k][1]}</small>`, j === 2 ? " lb-gap" : "")).join("")}
          ${D.tasks.map((t, j) => head(t.id, t.name, j === 0 ? " lb-gap-l lb-t" : " lb-t")).join("")}
        </tr>
      </thead>
      <tbody>${body}${muted}</tbody>
      <tbody class="lb-refs">
        <tr class="lb-refhead"><th colspan="${6 + tcount}" scope="rowgroup">${L.refs.title}</th></tr>
        ${ref(L.refs.hh, 1, hhB.all, "–", (k) => (metric === "S" ? num(1) : metric === "B" ? num(hhB[k]) : "–"))}
        ${ref(L.refs.h, 0, 1, "0%", () => (metric === "S" ? num(0) : metric === "B" ? num(1) : "0%"))}
      </tbody>`;
  };

  table.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-key]");
    if (!b) return;
    const key = b.dataset.key;
    sort = sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: better(key) };
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
  segment($("#lb-metric"), (v) => { metric = v; if (!(sort.key in IDX)) sort = { key: "S", dir: "desc" }; draw(); });
  $(".lb-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$(".lb-tabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
    track = b.dataset.v;
    draw();
  });
  draw();
})();
