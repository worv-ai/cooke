/*
 * Small schematic drawings. Long copy comes from content.js, short labels live here.
 * Motion runs only while a drawing is on screen, and prefers-reduced-motion leaves it still.
 */
window.FIG = (() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");

  // Adds .is-live while the element is visible (and motion is allowed). CSS animations key off it.
  const live = (el, threshold = 0.2) => {
    let visible = false;
    const sync = () => el.classList.toggle("is-live", visible && !document.hidden && !motion.matches);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold }).observe(el);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
  };

  /* ---------- Four evaluation modes: one small timeline per mode ---------- */

  // Same wall-clock span in every cell. Three lanes: human, messages, robot.
  // Latency-free: the world pauses (shaded) while the robot thinks, so the human bar breaks.
  // Latency-aware: the human never stops, and the robot acts on what it saw when it started thinking.
  const W = 300, H = 104, X0 = 40, X1 = 292;
  const X = (t) => X0 + (X1 - X0) * t;
  const icon = {
    human: '<circle cx="0" cy="-4" r="3.2"/><path d="M-5.5 5.5a5.5 5.5 0 0 1 11 0z"/>',
    msg: '<path d="M-6 -5h12a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H-1l-3.5 3v-3H-6a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1-6-5z"/>',
    mute: '<path d="M-6 -5h12a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H-1l-3.5 3v-3H-6a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1-6-5z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M-8 7L8 -7" stroke="currentColor" stroke-width="1.6"/>',
    robot: '<rect x="-5.5" y="-3.5" width="11" height="9" rx="2"/><path d="M0 -3.5v-3" stroke="currentColor" stroke-width="1.6"/><circle cx="0" cy="-7" r="1.4"/>',
  };
  const lane = (y, kind) => `<g class="md-ico" transform="translate(16 ${y})">${icon[kind]}</g>`;
  const rect = (cls, x0, x1, y, h) => `<rect class="${cls}" x="${X(x0).toFixed(1)}" y="${y}" width="${Math.max(0, X(x1) - X(x0) - 2).toFixed(1)}" height="${h}" rx="3"/>`;

  const cell = (lat, comm) => {
    const yH = 22, yM = 52, yR = 82;
    const think = [[0, 0.22], [0.5, 0.72]];   // two robot decisions in the span
    let s = "";
    if (lat === "free") {
      think.forEach(([a, b]) => { s += `<rect class="md-pause" x="${X(a)}" y="6" width="${X(b) - X(a) - 2}" height="${H - 12}" rx="4"/>`; });
      s += rect("md-act is-human", 0.22, 0.5, yH - 8, 16) + rect("md-act is-human", 0.72, 1.0, yH - 8, 16);
      think.forEach(([a, b]) => { s += `<text class="md-pz" x="${(X(a) + X(b)) / 2 - 1}" y="${yH + 4}" text-anchor="middle">❚❚</text>`; });
    } else {
      s += rect("md-act is-human", 0, 1.0, yH - 8, 16);
    }
    think.forEach(([a, b]) => { s += rect("md-think", a, b, yR - 8, 16) + `<text class="md-dots" x="${(X(a) + X(b)) / 2 - 1}" y="${yR + 4}" text-anchor="middle">···</text>`; });
    s += rect("md-act is-robot", 0.22, 0.5, yR - 8, 16) + rect("md-act is-robot", 0.72, 1.0, yR - 8, 16);
    if (comm === "on") {
      [[0.22, "r"], [0.32, "h"], [0.72, "r"], [0.82, "h"]].forEach(([t, who]) => {
        s += `<g class="md-msg is-${who}" transform="translate(${X(t) + 8} ${yM})">${icon.msg}</g>`;
      });
      s += `<path class="md-wire" d="M${X0} ${yM}H${X1}"/>`;
    } else {
      s += `<path class="md-wire is-off" d="M${X0} ${yM}H${X1}"/>`;
    }
    const lanes = lane(yH, "human") + lane(yM, comm === "on" ? "msg" : "mute") + lane(yR, "robot");
    return `<svg class="md-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${lat === "free" ? "Latency-free" : "Latency-aware"}, communication ${comm}: ${lat === "free" ? "the human's work pauses while the robot thinks" : "the human keeps working while the robot thinks"}${comm === "on" ? ", and the partners exchange messages" : ", and no messages are exchanged"}.">
      ${lanes}${s}<line class="md-head" x1="${X0}" x2="${X0}" y1="4" y2="${H - 4}"/></svg>`;
  };

  const modes = (M) => {
    const head = M.cols.map((c) => `<div class="md-col"><b>${c.name}</b><span>${c.body}</span></div>`).join("");
    const rows = M.rows.map((r) => `<div class="md-row"><b>${r.name}</b><span>${r.body}</span></div>
      ${M.cols.map((c) => `<div class="md-cell is-${c.id}-${r.id}"><span class="md-cap">${c.name} · ${r.name.toLowerCase()}</span>${cell(c.id, r.id)}</div>`).join("")}`).join("");
    const L = M.legend;
    return `<div class="md" id="md">
      <div class="md-corner" aria-hidden="true"></div>${head}${rows}
      <ul class="md-legend">
        <li><i class="md-key is-act"></i>${L.act}</li>
        <li><i class="md-key is-think"></i>${L.think}</li>
        <li><i class="md-key is-pause"></i>${L.paused}</li>
        <li><i class="md-key is-msg"></i>${L.msg}</li>
      </ul>
    </div>`;
  };

  return { live, modes };
})();
