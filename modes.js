/*
 * The four evaluation modes as one animated panel (Benchmark section, "Four evaluation modes" row).
 *
 * After the "With latency, the arm waits" scene of the demo video (1:23): the same 60 s of world time drawn twice,
 * latency off above and latency on below, and a playhead that fills both at once. Each strip has a thin robot lane
 * (a tick per decision, or thinking then a short move) and a human lane, where the red "blocked" span is the point
 * of the picture. With communication on, a dot marks the human's request and a second dot the robot's answer, with
 * the wait between them; under the strips, the share of requests the robot ignores. All timings are an illustration
 * built from the paper's numbers (a decision every 2 s; 15.0 s median thinking time); the data is `anim` on the
 * modes row in content.js.
 *
 *   MODES.markup(A)  -> HTML for the panel        MODES.wire(el, A) -> starts the animation and the switch
 */
window.MODES = (() => {
  const pc = (s, span) => `${(100 * s) / span}%`;
  const seg = (cls, a, b, span, label = "", comm = "") =>
    `<i class="md-seg is-${cls}"${comm ? ` data-comm="${comm}"` : ""} style="left:${pc(a, span)};width:${pc(b - a, span)}">${label ? `<span>${label}</span>` : ""}</i>`;

  // Latency off: a tick per decision, every `every` s (the world waits while the robot thinks, so no gaps).
  // Latency on: `think` s of thinking with the arm still, then `act` s of motion.
  const robotLane = (S, span, L) => {
    if (S.robot.every) {
      const n = Math.round(span / S.robot.every);
      return Array.from({ length: n }, (_, k) => `<i class="md-tick" style="left:${pc(k * S.robot.every + S.robot.every / 2, span)}"></i>`).join("");
    }
    const { think, act } = S.robot;
    let out = "", t = 0, first = true;
    while (t < span) {
      out += seg("think", t, Math.min(t + think, span), span, first ? L.thinking : "");
      first = false;
      t += think;
      if (t < span) out += seg("act", t, Math.min(t + act, span), span);
      t += act;
    }
    return out;
  };

  const humanLane = (S, span, L) => ["on", "off"].map((c) =>
    S.human[c].map(([k, a, b]) => seg(k, a, b, span, k === "blocked" && b - a >= 5 ? L.blocked : "", c)).join("")).join("");

  // With communication on: the request, the answer and the wait between them, just above the human lane.
  const asks = (S, span, L) => S.ask.map(([a, b]) => `
    <i class="md-ask" data-t="${a}" style="left:${pc(a, span)}" title="${L.ask}"></i>
    <i class="md-wait" data-t="${b}" style="left:${pc(a, span)};width:${pc(b - a, span)}"><span>${L.wait.replace("{s}", b - a)}</span></i>
    <i class="md-ans" data-t="${b}" style="left:${pc(b, span)}" title="${L.answer}"></i>`).join("");

  const note = (S, span) => ["on", "off"].map((c) => S.notes[c]
    ? `<p class="md-note" data-comm="${c}" data-t="${S.notes[c][0]}" style="--x:${pc(S.notes[c][0], span)}">${S.notes[c][1]}</p>` : "").join("");

  const strip = (S, A) => `<section class="md-strip is-${S.id}" aria-label="${S.name}">
      <header class="md-head"><b>${S.name}</b><span>${S.note}</span><em>${S.rate}</em></header>
      <div class="md-lanes">
        <div class="md-lane is-robot"><span class="md-lab">${A.lanes.robot}</span><div class="md-track"><div class="md-fill">${robotLane(S, A.span, A.labels)}</div></div></div>
        <div class="md-lane is-human"><span class="md-lab">${A.lanes.human}</span><div class="md-track">
          <div class="md-asks" data-comm="on">${asks(S, A.span, A.labels)}</div>
          <div class="md-fill">${humanLane(S, A.span, A.labels)}</div>
        </div></div>
        <div class="md-head-line" aria-hidden="true"></div>
      </div>
      <div class="md-notes">${note(S, A.span)}</div>
    </section>`;

  const markup = (A) => `<div class="md" data-comm="on" style="--p:100%;--f:1">
    <div class="md-top">
      <p class="md-clock">${A.clock} <b>1:00</b><span>/ 1:00 · ${A.illustration}</span></p>
      <div class="seg is-sm md-comm" role="group" aria-label="${A.comm.label}"><span class="seg-label" aria-hidden="true">${A.comm.label}</span>${A.comm.options.map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
    </div>
    ${A.strips.map((S) => strip(S, A)).join("")}
    <div class="md-out">
      <div class="md-ign" data-comm="on">
        <p>${A.ignored.title}</p>
        ${A.ignored.rows.map(([name, text], i) => `${i ? '<span class="md-arrow" aria-hidden="true">→</span>' : ""}<div class="md-num${i ? " is-hi" : ""}"><b>${text}</b><span>${name}</span></div>`).join("")}
      </div>
      <p class="md-silent" data-comm="off">${A.silent}</p>
    </div>
  </div>`;

  // One sweep of the playhead over the world time, a short hold on the full picture, then again. It runs only while
  // the panel is on screen; with reduced motion the full picture stays.
  const wire = (root, A) => {
    const SWEEP = 9000, HOLD = 3500;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = root.querySelector(".md-clock b");
    const timed = [...root.querySelectorAll("[data-t]")];
    let start = 0, raf = 0, seen = false;
    const set = (t) => {
      root.style.setProperty("--p", `${(100 * t) / A.span}%`);
      root.style.setProperty("--f", t / A.span);
      clock.textContent = t >= A.span ? "1:00" : `0:${String(Math.floor(t)).padStart(2, "0")}`;
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
