/*
 * Leaderboard page (leaderboard.html). For the chosen mode: each agent's five-task mean S and B, then one task per
 * column (S or B). Values come from content.js (results.sb, results.hhB); copy from content.js (leaderboard).
 * Rows keep the paper's agent order until the reader sorts a column. A first click puts the better values first
 * (high S, low B), a second click reverses, a third returns to the paper's order. The two references stay at the bottom.
 */
(() => {
  const C = window.CONTENT;
  const L = C.leaderboard;
  const R = C.results;
  const T = C.benchmark.tasks;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const num = (v, d = 2) => v.toFixed(d).replace("-", "−");
  const modes = Object.entries(C.gallery.modeNames);
  const seg = (id, label, options, on) => `<div class="seg is-chips" id="${id}" role="group" aria-label="${label}">${options.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === on}">${l}</button>`).join("")}</div>`;
  const hhB = T.map((t) => R.hhB[t.id]);
  const hhMean = hhB.reduce((a, b) => a + b, 0) / hhB.length;

  $("#app").innerHTML = `
    <a class="skip" href="#leaderboard">Skip to the leaderboard</a>
    ${NAV.markup(C, "leaderboard")}
    <main>
      <section class="pad lb" id="leaderboard" aria-labelledby="lb-title"><div class="wrap">
        <header class="sec-head">
          <h2 id="lb-title"><span class="sec-name">${L.kicker}</span></h2>
          <p class="claim">${L.claim}</p>
          <p class="lede">${L.lede}</p>
        </header>
        <div class="lb-ctl">
          <div class="g-row"><span class="g-lbl">${L.modeLabel}</span>${seg("lb-mode", L.modeLabel, modes, L.defaultMode)}</div>
          <div class="g-row"><span class="g-lbl">${L.metricLabel}</span>${seg("lb-metric", L.metricLabel, L.metrics, "S")}</div>
        </div>
        <div class="lb-card">
          <div class="tbl-scroll"><table class="lb-table" id="lb-table"></table></div>
          <p class="lb-note">${L.order}</p>
          <p class="lb-note">${L.refNote} ${R.sbNote}</p>
        </div>
        <div class="pending lb-submit" role="note"><span class="tag is-warn">${C.meta.pending}</span><h3>${L.submit.title}</h3><p>${L.submit.body}</p></div>
      </div></section>
    </main>
    <footer class="foot"><div class="wrap foot-in">${NAV.wordmark()}<p>${C.resources.footer}</p></div></footer>`;
  NAV.wire();

  /* ---------- Table ---------- */

  const table = $("#lb-table");
  let mode = L.defaultMode;
  let metric = "S";
  let sort = null; // { key, dir }

  // Diverging bar for the mean S: one fixed scale for every mode, from below the lowest mean to two humans (1).
  const allMeans = Object.values(R.sb.average).flat().map((p) => p[0]);
  const lo = Math.floor(Math.min(...allMeans, -1)) - 0.5;
  const pos = (v) => ((v - lo) / (1 - lo)) * 100;
  const bar = (v) => {
    const z = pos(0);
    const p = pos(v);
    return `<span class="lb-bar" aria-hidden="true"><i class="${v < 0 ? "is-neg" : "is-pos"}" style="left:${Math.min(z, p).toFixed(1)}%;width:${Math.abs(p - z).toFixed(1)}%"></i><b style="left:${z.toFixed(1)}%"></b></span>`;
  };
  // Cell tint by distance from the human alone: worse in terracotta, better in green.
  const tint = (v, kind) => {
    const d = kind === "S" ? v : 1 - v; // > 0 is better than the human alone
    const a = kind === "S" ? Math.min(Math.abs(d) / 3, 1) * 0.32 : Math.min(Math.abs(d) / 1.2, 1) * 0.32;
    if (Math.abs(d) < 0.005) return "";
    return ` style="background:${d < 0 ? `rgba(184, 67, 44, ${a.toFixed(3)})` : `rgba(47, 107, 71, ${(a + 0.06).toFixed(3)})`}"`;
  };

  const rows = () => R.agents.map((a, i) => ({
    a,
    mean: R.sb.average[mode][i],
    task: Object.fromEntries(T.map((t) => [t.id, R.sb[t.id][mode][i]])),
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
    const modeName = C.gallery.modeNames[mode];
    const filled = mode.endsWith("on");
    table.innerHTML = `<caption>${modeName}. Task columns show ${metric === "S" ? "task efficiency S" : "human burden B"}.</caption>
      <thead><tr><th scope="col">${L.cols.agent}</th>${head("S", L.cols.s)}${head("B", L.cols.b)}${T.map((t) => head(t.id, t.name)).join("")}</tr></thead>
      <tbody>${rs.map((r) => `<tr>
        <th scope="row">${FIG.marker(r.a, filled)}${r.a.name}</th>
        <td class="lb-s"${tint(r.mean[0], "S")}>${bar(r.mean[0])}<span>${num(r.mean[0])}</span></td>
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
