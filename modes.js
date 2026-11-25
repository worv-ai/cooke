/*
 * The four evaluation modes as one animated panel (Benchmark section, "Four evaluation modes" row).
 *
 * After the "With latency, the arm waits" scene of the demo video (1:23): the same 60 s of world time drawn twice,
 * latency off above and latency on below, with a robot and a human lane each and a playhead that fills both at once.
 * A switch turns communication on or off: with it on, a chat lane shows when a request is asked and answered, and
 * the bars under the strips give the share of requests the robot ignores. All timings are an illustration built from
 * the paper's numbers (a decision every 2 s; 15.0 s median thinking time); the data is `anim` on the modes row in
 * content.js.
 *
 *   MODES.markup(A)  -> HTML for the panel        MODES.wire(el) -> starts the animation and the switch
 */
window.MODES = (() => {
  const pc = (s, span) => `${(100 * s) / span}%`;
  const seg = (cls, a, b, span, label = "", comm = "") =>
    `<i class="md-seg is-${cls}"${comm ? ` data-comm="${comm}"` : ""} style="left:${pc(a, span)};width:${pc(b - a, span)}">${label ? `<span>${label}</span>` : ""}</i>`;

  // The robot lane: latency off acts every `every` s with a short pause mark between actions (the world waits);
  // latency on alternates `think` s of thinking, arm still, with `act` s of motion.
  const robotLane = (S, span, L) => {
    if (S.robot.every) {
      const n = Math.round(span / S.robot.every);
      return Array.from({ length: n }, (_, k) => seg("act", k * S.robot.every + 0.18, (k + 1) * S.robot.every - 0.18, span)).join("");
    }
    const { think, act } = S.robot;
    let out = "", t = 0;
    while (t < span) {
      out += seg("think", t, Math.min(t + think, span), span, think <= span - t ? L.thinking : "");
      t += think;
      if (t < span) out += seg("act", t, Math.min(t + act, span), span);
      t += act;
    }
    return out;
  };

  const humanLane = (S, span, L) => ["on", "off"].map((c) =>
    S.human[c].map(([k, a, b]) => seg(k, a, b, span, k === "blocked" && b - a >= 5 ? L.blocked : "", c)).join("")).join(""); // a label only where it fits

  const chatLane = (S, span) => S.chat.map(([t, who, text]) =>
    `<b class="md-msg is-${who}" data-t="${t}" style="left:${pc(t, span)}"><span>${text}</span></b>`).join("");

  // Callouts under a strip, one line each, revealed when the playhead reaches them.
  const notes = (S, span) => ["on", "off"].map((c) => (S.notes[c] || []).map(([t, text], i) =>
    `<p class="md-note" data-comm="${c}" data-t="${t}" style="--x:${pc(t, span)};--row:${i}">${text}</p>`).join("")).join("");

  const strip = (S, A) => {
    const span = A.span, L = A.labels;
    const rows = Math.max(...["on", "off"].map((c) => (S.notes[c] || []).length));
    return `<section class="md-strip is-${S.id}" aria-label="${S.name}">
      <header class="md-head"><b>${S.name}</b><span>${S.note}</span><em>${S.rate}</em></header>
      <div class="md-lanes">
        <div class="md-lane"><span class="md-lab">${A.lanes.robot}</span><div class="md-track"><div class="md-fill">${robotLane(S, span, L)}</div></div></div>
        <div class="md-lane"><span class="md-lab">${A.lanes.human}</span><div class="md-track"><div class="md-fill">${humanLane(S, span, L)}</div></div></div>
        <div class="md-lane is-chat" data-comm="on"><span class="md-lab">${A.lanes.chat}</span><div class="md-track">${chatLane(S, span)}</div></div>
        <div class="md-head-line" aria-hidden="true"></div>
      </div>
      <div class="md-notes" style="--rows:${rows}">${notes(S, span)}</div>
      <p class="md-foot">${S.foot}</p>
    </section>`;
  };

  const markup = (A) => `<div class="md" data-comm="on" style="--p:100%;--f:1">
    <div class="md-top">
      <p class="md-clock">${A.clock} <b>1:00</b><span> / 1:00 · ${A.illustration}</span></p>
      <div class="seg is-sm md-comm" role="group" aria-label="${A.comm.label}"><span class="seg-label" aria-hidden="true">${A.comm.label}</span>${A.comm.options.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
    </div>
    ${A.strips.map((S) => strip(S, A)).join("")}
    <div class="md-ign" data-comm="on">
      <p class="md-ign-title">${A.ignored.title}</p>
      ${A.ignored.rows.map(([name, text, lo, hi]) => `<div class="md-ign-row"><span>${name}</span><div class="md-ign-bar"><i style="left:${lo}%;width:${Math.max(hi - lo, 1.5)}%"></i></div><b>${text}</b></div>`).join("")}
      <p class="md-ign-note">${A.ignored.note}</p>
    </div>
    <p class="md-silent" data-comm="off">${A.silent}</p>
    <ul class="md-legend">${Object.entries(A.legend).map(([k, v]) => `<li><i class="md-key is-${k}"></i>${v}</li>`).join("")}</ul>
  </div>`;

  // One sweep of the playhead over the world time, a short hold on the full picture, then again. It runs only while
  // the panel is on screen; with reduced motion the full picture stays.
  const wire = (root, A) => {
    const SWEEP = 10000, HOLD = 3500;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = root.querySelector(".md-clock b");
    const timed = [...root.querySelectorAll("[data-t]")];
    let start = 0, raf = 0, seen = false;
    const set = (t) => {
      root.style.setProperty("--p", `${(100 * t) / A.span}%`);
      root.style.setProperty("--f", t / A.span);
      clock.textContent = `0:${String(Math.floor(t)).padStart(2, "0")}`.replace("0:60", "1:00");
      timed.forEach((el) => el.classList.toggle("is-on", t >= Number(el.dataset.t)));
    };
    const frame = (now) => {
      if (!start) start = now;
      const e = (now - start) % (SWEEP + HOLD);
      set(Math.min(e / SWEEP, 1) * A.span);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (seen && !still && !document.hidden) { start = 0; raf = requestAnimationFrame(frame); }
    };
    set(A.span);
    if (!still) new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(root);
    document.addEventListener("visibilitychange", sync);
    const buttons = [...root.querySelectorAll(".md-comm button")];
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      root.dataset.comm = b.dataset.v;
      sync(); // start the sweep over, so the new mode plays from 0
    }));
  };

  return { markup, wire };
})();
