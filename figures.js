/*
 * Schematic figures. Long copy comes from content.js; short diagram labels live in the
 * drawings below.
 *
 * Only the decision loop moves on its own, with dots along its lines. The overview follows
 * the scroll position, and the task drawings follow their task's video.
 * Motion runs only while a figure is on screen, and prefers-reduced-motion leaves each
 * figure as a complete still image.
 *
 * To add a moving dot to a line, give the <path> a data-flow attribute. A t-* class on the
 * path or on one of its parents sets its color: t-tomato, t-human, t-robot, t-cool, t-mute.
 */
window.FIG = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const TONES = ["tomato", "human", "robot", "cool", "mute"];
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- Motion helpers ---------- */

  // Runs frame(dt) while el is visible. .is-live lets CSS animations follow the same rule.
  const whileVisible = (el, frame, threshold = 0.12) => {
    let visible = false;
    let raf = 0;
    let prev = 0;
    const live = () => visible && !document.hidden && !motion.matches;
    const tick = (now) => {
      raf = 0;
      if (!live()) { prev = 0; return; }
      if (prev) frame(Math.min(now - prev, 100));
      prev = now;
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      el.classList.toggle("is-live", live());
      if (live() && !raf) { prev = 0; raf = requestAnimationFrame(tick); }
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold }).observe(el);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
  };

  // Moves dots along every [data-flow] path inside root. Call refresh() after redrawing.
  const flows = (root, { gap = 150, speed = 0.05, r = 2.75 } = {}) => {
    let tracks = [];
    let clock = 0;
    const place = () => tracks.forEach((track, n) => track.dots.forEach((dot, i) => {
      const p = (clock * track.speed / track.length + i / track.dots.length + n * 0.17) % 1;
      const at = track.path.getPointAtLength(p * track.length);
      dot.setAttribute("cx", at.x);
      dot.setAttribute("cy", at.y);
      dot.style.opacity = Math.min(1, p * 8, (1 - p) * 8);
    }));
    const refresh = () => {
      root.querySelectorAll(".fl-dots").forEach((g) => g.remove());
      tracks = [...root.querySelectorAll("[data-flow]")].flatMap((path) => {
        const length = path.getTotalLength();
        if (!length) return [];
        const group = document.createElementNS(NS, "g");
        const tone = [...path.classList].filter((c) => c.startsWith("t-")).join(" ");
        group.setAttribute("class", `fl-dots ${tone}`);
        const dots = Array.from({ length: Math.max(1, Math.ceil(length / gap)) }, () => {
          const dot = document.createElementNS(NS, "circle");
          dot.setAttribute("r", path.dataset.r || r);
          group.append(dot);
          return dot;
        });
        path.after(group);
        return [{ path, length, dots, speed: speed * Number(path.dataset.flow || 1) }];
      });
      place();
    };
    refresh();
    whileVisible(root, (dt) => { clock += dt; place(); });
    return { refresh };
  };

  // Arrowheads live in one hidden sheet so that every drawing can share them.
  const markers = () => {
    if (document.getElementById("fig-markers")) return;
    const sheet = document.createElementNS(NS, "svg");
    sheet.id = "fig-markers";
    sheet.setAttribute("aria-hidden", "true");
    sheet.setAttribute("width", 0);
    sheet.setAttribute("height", 0);
    sheet.style.position = "absolute";
    sheet.innerHTML = `<defs>${TONES.map((t) => `<marker id="arrow-${t}" class="t-${t}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="var(--tone)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>`).join("")}</defs>`;
    document.body.append(sheet);
  };

  const edge = (d, tone, { dashed, flow = true, id, arrow = true } = {}) => `<path class="d-edge t-${tone}${dashed ? " is-dashed" : ""}" d="${d}"${flow ? ' data-flow' : ""}${id != null ? ` data-edge="${id}"` : ""}${arrow ? ` marker-end="url(#arrow-${tone})"` : ""}/>`;

  // A ghost path carries dots without drawing a second line.
  const ghost = (d, tone) => `<path class="d-ghost t-${tone}" d="${d}" data-flow/>`;

  const label = (x, y, text, anchor = "middle", extra = "") => `<text class="d-label" x="${x}" y="${y}" text-anchor="${anchor}"${extra}>${text}</text>`;

  /* ---------- Figure 1: overview, stepped by the scroll position ---------- */

  // Each stage pairs a short text with a larger drawing. Pinned, the text runs down the left and
  // the active stage's drawing fills the right; stacked, each drawing follows its text.

  const ovTasks = (tasks) => `<div class="ovv-tasks">${tasks.map((t, k) => `<div class="ovv-task" style="--k:${k}">
      <img src="${t.poster}" alt="" loading="lazy">
      <span class="ovv-cap"><b>${t.name}</b><span>${t.behavior}</span></span>
    </div>`).join("")}</div>`;

  const ovBox = (x, title, tone) => `<g class="ovv-node t-${tone}">
      <rect x="${x}" y="110" width="100" height="56" rx="10"/>
      <text class="ovv-title" x="${x + 50}" y="144" text-anchor="middle">${title}</text>
    </g>`;

  // The adaptive human as one straight loop: four steps left to right, two right-angled returns.
  const ovPartner = () => {
    const still = (d, tone, dashed) => edge(d, tone, { flow: false, dashed });
    return `<svg class="ovv-svg ovv-partner" viewBox="0 0 480 300">
      <text class="ovv-group-label t-human" x="16" y="70">VISION-LANGUAGE MODEL</text>
      <path class="ovv-bracket t-human" d="M16 84H232"/>
      <text class="ovv-group-label t-cool" x="248" y="70">STATE ENGINE</text>
      <path class="ovv-bracket t-cool" d="M248 84H464"/>
      ${ovBox(16, "Observe", "human")}${ovBox(132, "Propose", "human")}${ovBox(248, "Validate", "cool")}${ovBox(364, "Execute", "cool")}
      ${still("M118 138H128", "human")}${still("M234 138H244", "mute")}${still("M350 138H360", "cool")}
      ${still("M298 168V190H182V172", "tomato", true)}
      <text class="ovv-note" x="240" y="208" text-anchor="middle">Rejected: propose again</text>
      ${still("M414 168V240H66V172", "mute")}
      <text class="ovv-note" x="240" y="258" text-anchor="middle">Outcome: observe again</text>
    </svg>`;
  };

  // The same wall-clock span in both modes. Latency-free stops the world while the robot thinks;
  // latency-aware keeps the human working, and the robot keeps moving during the next inference.
  const ovModes = () => {
    const X = (t) => 96 + t * 7.4;
    const L = 8;     // seconds per answer (illustrative)
    const RUN = 2;   // latency-free: the world runs 2 s between answers
    const M = 6;     // latency-aware: one motion's length (illustrative)
    const END = 48;
    const bar = (cls, y, h, from, to) => to <= from ? "" : `<rect class="${cls}" x="${X(from)}" y="${y}" width="${Math.max(X(to) - X(from) - 1.5, 1)}" height="${h}" rx="3"/>`;
    let free = "";
    for (let t = 0; t < END; t += L + RUN) {
      free += bar("ovv-pause", 50, 18, t, Math.min(t + L, END)) + bar("ovv-think", 74, 18, t, Math.min(t + L, END));
      free += bar("ovv-human", 50, 18, t + L, Math.min(t + L + RUN, END)) + bar("ovv-robot", 74, 18, t + L, Math.min(t + L + RUN, END));
    }
    let aware = bar("ovv-human", 196, 18, 0, END);
    for (let t = 0; t < END; t += L) {
      aware += bar("ovv-think", 220, 8, t, Math.min(t + L, END)) + bar("ovv-robot", 230, 8, t + L, Math.min(t + L + M, END));
    }
    return `<svg class="ovv-svg ovv-modes" viewBox="0 0 480 300">
      <defs><pattern id="ovv-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="ovv-hatch-ink" width="2.5" height="6"/></pattern></defs>
      <text class="ovv-group-label t-tomato" x="20" y="34">LATENCY-FREE</text>
      <text class="ovv-lane" x="20" y="63">Human</text><text class="ovv-lane" x="20" y="87">Robot</text>
      ${free}
      <text class="ovv-note" x="96" y="116">The world pauses for each answer, then runs 2 s</text>
      <text class="ovv-group-label t-robot" x="20" y="176">LATENCY-AWARE</text>
      <text class="ovv-lane" x="20" y="209">Human</text><text class="ovv-lane" x="20" y="233">Robot</text>
      ${aware}
      <text class="ovv-note" x="96" y="262">The human keeps working; motion overlaps inference</text>
      <path class="ovv-axis" d="M96 280H452"/><text class="ovv-sub" x="452" y="294" text-anchor="end">wall clock →</text>
      <g class="ovv-legend" transform="translate(300 8)">
        <rect class="ovv-think" x="0" y="20" width="12" height="8" rx="2"/><text class="ovv-sub" x="16" y="27">think</text>
        <rect class="ovv-robot" x="56" y="20" width="12" height="8" rx="2"/><text class="ovv-sub" x="72" y="27">move</text>
        <rect class="ovv-pause" x="106" y="20" width="12" height="8" rx="2"/><text class="ovv-sub" x="122" y="27">paused</text>
      </g>
      <path class="ovv-head" d="M96 42V98M96 188V244"/>
    </svg>`;
  };

  // Two scales that read the same way: further right is better for the human. The marker is a measured
  // team (Fruit Skewer v5c, Gemini 4 Argon, latency-free, comm on, mean of 3 seeds: S = -0.30, B = 0.96);
  // it slides in from "human alone".
  const ovMetrics = () => {
    const X = (f) => 40 + f * 400;
    const scale = ({ y, title, ticks, zones, at, from }) => `<text class="ovv-h" x="40" y="${y - 52}">${title}</text>
        <text class="ovv-better" x="440" y="${y - 52}" text-anchor="end">better →</text>
        ${zones.map(([a, b, cls, text]) => `<rect class="${cls}" x="${X(a)}" y="${y - 8}" width="${X(b) - X(a)}" height="16" rx="3"/>
          <text class="ovv-zone-label ${cls}-text" x="${(X(a) + X(b)) / 2}" y="${y - 16}" text-anchor="middle">${text}</text>`).join("")}
        ${ticks.map(([f, value, name]) => `<path class="ovv-tick" d="M${X(f)} ${y - 12}V${y + 12}"/>
          <text class="ovv-tick-label" x="${X(f)}" y="${y + 28}" text-anchor="middle">${value}</text>
          <text class="ovv-sub" x="${X(f)}" y="${y + 42}" text-anchor="middle">${name}</text>`).join("")}
        <g class="ovv-mark" style="--from:${(from - at) * 400}px"><circle cx="${X(at)}" cy="${y}" r="9"/></g>`;
    // S: 0 at .25, 1 at .8. B: 1 at .25, 0.5 at .75.
    const fS = (v) => 0.25 + v * 0.55;
    const fB = (v) => 0.25 + (1 - v);
    return `<svg class="ovv-svg ovv-metrics" viewBox="0 0 480 300">
      ${scale({
        y: 90, title: "Collaboration score S", at: fS(-0.30), from: fS(0),
        zones: [[0, 0.25, "ovv-zone-neg", "slower"], [0.25, 0.8, "ovv-zone-pos", "helping"]],
        ticks: [[0.25, "0", "human alone"], [0.8, "1", "two humans"]],
      })}
      ${scale({
        y: 216, title: "Human burden B", at: fB(0.96), from: fB(1),
        zones: [[0, 0.25, "ovv-zone-neg", "more work"], [0.25, 0.75, "ovv-zone-pos", "less work"]],
        ticks: [[0.25, "1", "human alone"], [0.75, "0.5", "two humans"]],
      })}
      <g class="ovv-mark"><circle cx="46" cy="286" r="6"/></g>
      <text class="ovv-key" x="58" y="290">Gemini 4 Argon, Fruit Skewer, latency-free (mean of 3 seeds)</text>
    </svg>`;
  };

  // Keep in step with the matching media query in styles.css.
  const PINNED = "(min-width: 1001px) and (min-height: 650px)";

  const overview = {
    html: (c, tasks) => {
      const visual = { tasks: () => ovTasks(tasks), partner: ovPartner, modes: ovModes, metrics: ovMetrics };
      return `<div class="ov-steps" id="ov"><div class="panel ov">
        ${c.stages.map((s, i) => `<div class="ov-step t-${s.tone}" style="--r:${i + 1}">
            <p class="ov-top"><span>${s.role}</span><span>${s.sec}</span></p>
            <h3><button class="ov-hit" type="button" data-i="${i}">${s.title}</button></h3>
            <p class="ov-copy">${s.copy}</p>
          </div>
          <div class="ov-detail t-${s.tone}"><p>${s.detail}</p><a href="${s.href}">${s.link} ↗</a></div>
          <div class="ov-vis t-${s.tone}" aria-hidden="true">${visual[s.visual]()}<p class="ov-foot">${s.foot}</p></div>`).join("")}
        <div class="ov-bar" aria-hidden="true"><i></i></div>
      </div></div>`;
    },
    init: (host, c) => {
      markers();
      const panel = host.firstElementChild;
      const parts = [".ov-step", ".ov-detail", ".ov-vis"].map((s) => [...host.querySelectorAll(s)]);
      const count = parts[0].length;
      const progress = host.querySelector(".ov-bar i");
      const pinned = matchMedia(PINNED);
      let stick = 0;
      let run = 1;
      let current = -1;

      const show = (n) => {
        if (n === current) return;
        current = n;
        parts.forEach((list) => list.forEach((el, i) => el.classList.toggle("is-on", n === "all" || i === n)));
      };

      const update = () => {
        if (!pinned.matches) return;
        const p = Math.min(1, Math.max(0, (stick - host.getBoundingClientRect().top) / run));
        progress.style.transform = `scaleX(${p})`;
        show(Math.min(count - 1, Math.floor(p * count)));
      };

      const layout = () => {
        if (!pinned.matches) { panel.style.top = ""; show("all"); return; }
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const bar = innerWidth < 1280 ? 4.5 * rem : rem; // the top bar, or the side rail's margin
        stick = Math.max(bar, (innerHeight - panel.offsetHeight) / 2);
        panel.style.top = `${stick}px`;
        run = host.offsetHeight - panel.offsetHeight;
        current = -1;
        update();
      };

      // A title jumps to its stage while pinned. Stacked, it opens its section.
      host.querySelectorAll(".ov-hit").forEach((b) => b.addEventListener("click", () => {
        const i = Number(b.dataset.i);
        if (!pinned.matches) { location.hash = c.stages[i].href; return; }
        const start = host.getBoundingClientRect().top + scrollY - stick;
        scrollTo({ top: start + (run * (i + 0.5)) / count, behavior: motion.matches ? "auto" : "smooth" });
      }));

      addEventListener("scroll", update, { passive: true });
      addEventListener("resize", layout);
      new ResizeObserver(layout).observe(panel);
      layout();
    },
  };

  /* ---------- Decision loop, after the paper's simulation pipeline ---------- */

  const NODES = {
    robot: ["Embodied agent", "One decision every 2 s"],
    planner: ["Collision-checked IK", "Fixed safe speed"],
    vlm: ["Vision-language model", "Reads the shared recipe"],
    engine: ["State engine", "Runs verified skills"],
  };

  const node = (key, x, y, w, h, tone) => {
    const [title, sub] = NODES[key];
    return `<g class="d-node t-${tone}${key === "robot" ? " is-tick" : ""}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
      <text class="d-title" x="${x + w / 2}" y="${y + h / 2 - 4}">${title}</text>
      <text class="d-sub" x="${x + w / 2}" y="${y + h / 2 + 15}">${sub}</text>
    </g>`;
  };

  // The shared kitchen from above. Drawn at 256 × 220 and placed by the layouts below.
  const kitchen = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect class="k-room" width="256" height="220" rx="14"/>
    <text class="d-title" x="128" y="28">Shared kitchen</text>
    <text class="d-sub" x="128" y="46">MuJoCo, full contact physics</text>
    <rect class="k-table" x="36" y="62" width="184" height="136" rx="10"/>
    <circle class="k-bowl" cx="76" cy="92" r="15"/><circle class="k-fruit f-kiwi" cx="76" cy="92" r="6"/>
    <circle class="k-bowl" cx="128" cy="92" r="15"/><circle class="k-fruit f-orange" cx="128" cy="92" r="6"/>
    <circle class="k-bowl" cx="180" cy="92" r="15"/><circle class="k-fruit f-straw" cx="180" cy="92" r="6"/>
    <circle class="k-bowl" cx="128" cy="158" r="24"/><circle class="k-bowl" cx="128" cy="158" r="14"/>
    <g class="k-arm t-robot"><path d="M0 134H52L94 150"/><circle cx="94" cy="150" r="5"/></g>
    <g class="k-arm is-human t-human"><path d="M256 134H204L162 150"/><circle cx="162" cy="150" r="5"/></g>
  </g>`;

  const LOOP = {
    wide: {
      box: "0 0 960 332",
      draw: () => `
        <path class="d-edge t-mute is-dashed" d="M136 76V34Q136 24 146 24H814Q824 24 824 34V76"/>
        ${ghost("M136 76V34Q136 24 146 24H814Q824 24 824 34V76", "robot")}
        ${ghost("M824 76V34Q824 24 814 24H146Q136 24 136 34V76", "human")}
        <rect class="d-pill" x="376" y="11" width="208" height="26" rx="13"/>
        ${label(480, 28, "Text messages, both ways")}
        ${node("robot", 16, 76, 240, 84, "robot")}
        ${node("planner", 16, 252, 240, 84, "robot")}
        ${node("vlm", 704, 76, 240, 84, "human")}
        ${node("engine", 704, 252, 240, 84, "human")}
        ${kitchen(352, 100, 1)}
        ${edge("M76 160V250", "robot")}${label(84, 208, "Pose targets", "start")}
        ${edge("M196 250V162", "robot", { dashed: true })}${label(204, 208, "Failures", "start")}
        ${edge("M256 294H350", "robot")}${label(304, 284, "Motion")}
        ${edge("M352 118H258", "robot")}${label(304, 108, "RGB, poses")}
        ${edge("M884 160V250", "human")}${label(876, 208, "Subtask", "end")}
        ${edge("M764 250V162", "human", { dashed: true })}${label(756, 208, "Outcome", "end")}
        ${edge("M704 294H610", "human")}${label(656, 284, "Skill")}
        ${edge("M608 118H702", "human")}${label(656, 108, "Own view")}`,
    },
    tall: {
      box: "0 0 360 720",
      draw: () => `
        <path class="d-edge t-mute is-dashed" d="M300 44H334Q344 44 344 54V650Q344 660 334 660H300"/>
        ${ghost("M300 44H334Q344 44 344 54V650Q344 660 334 660H300", "robot")}
        ${ghost("M300 660H334Q344 660 344 650V54Q344 44 334 44H300", "human")}
        ${label(354, 352, "Text messages", "middle", ' transform="rotate(90 354 352)"')}
        ${node("robot", 50, 8, 250, 72, "robot")}
        ${node("planner", 50, 124, 250, 72, "robot")}
        ${node("engine", 50, 508, 250, 72, "human")}
        ${node("vlm", 50, 624, 250, 72, "human")}
        ${kitchen(50, 244, 250 / 256)}
        ${edge("M120 82V122", "robot")}${label(112, 106, "Targets", "end")}
        ${edge("M230 122V82", "robot", { dashed: true })}${label(238, 106, "Failures", "start")}
        ${edge("M175 196V242", "robot")}${label(183, 224, "Motion", "start")}
        ${edge("M50 300H28Q18 300 18 290V54Q18 44 28 44H48", "robot")}${label(10, 172, "RGB, poses", "middle", ' transform="rotate(-90 10 172)"')}
        ${edge("M120 622V582", "human")}${label(112, 606, "Subtask", "end")}
        ${edge("M230 582V622", "human", { dashed: true })}${label(238, 606, "Outcome", "start")}
        ${edge("M175 508V462", "human")}${label(183, 488, "Skill", "start")}
        ${edge("M50 410H28Q18 410 18 420V650Q18 660 28 660H48", "human")}${label(10, 534, "Own view", "middle", ' transform="rotate(-90 10 534)"')}`,
    },
  };

  const decision = {
    html: (c) => `<div class="panel dl" id="dl">
      <div class="panel-head"><div><p class="eyebrow">${c.eyebrow}</p><h3>${c.title}</h3></div></div>
      <div class="dl-stage" role="img" aria-label="${c.alt}"></div>
    </div>`,
    init: (host) => {
      markers();
      const stage = host.querySelector(".dl-stage");
      let shape = "";
      let flow;
      const render = () => {
        const next = stage.clientWidth < 620 ? "tall" : "wide";
        if (next === shape) return;
        shape = next;
        const { box, draw } = LOOP[shape];
        stage.innerHTML = `<svg viewBox="${box}">${draw()}</svg>`;
        if (flow) flow.refresh(); else flow = flows(host, { gap: 170, speed: 0.055 });
      };
      new ResizeObserver(render).observe(stage);
      render();
    },
  };

  /* ---------- Task figures: the finished state and the steps ---------- */

  const FOOD = {
    pineapple: "#e9c84a", orange: "#ee9a3a", strawberry: "#d9534a", kiwi: "#9cc35a",
    bread: "#b9814a", tomato: "#d9534a", turkey: "#d8a07c", pickle: "#9cc35a", ketchup: "#a92a1e", swiss: "#eccb52",
    cracker: "#d9b36c", herb: "#f1ead0", salmon: "#f08a64", cucumber: "#8fc46b", feta: "#f6f1e6", shrimp: "#f2a07c", cheese: "#eccb52", ham: "#e7a0a0",
  };

  const art = (body) => `<svg class="tf-svg" viewBox="0 0 360 200" aria-hidden="true">${body}</svg>`;

  /*
   * The drawings follow the task's progress (see taskPhase below). A phase is one flow step of one
   * round, counted from 0: round r, step k is phase r * steps + k.
   *   data-ph="n"    appears at phase n
   *   data-done="n"  counts as finished from phase n (a skewer served, a slice toasted)
   *   data-off="n"   is cleared at phase n and gone after it
   * Parts without these stay on screen. With reduced motion, every drawing shows its end state.
   */
  const ART = {
    // An example order: the house pattern, with Dad's last fruit changed. One round per skewer.
    skewer: () => {
      const family = [["Mia", "strawberry"], ["Leo", "strawberry"], ["Mum", "strawberry"], ["Dad", "kiwi"]];
      return art(`<ellipse class="tv-plate" cx="206" cy="86" rx="150" ry="84"/>
        ${family.map(([who, last], r) => {
          const y = 28 + r * 39;
          const base = r * 5;
          const pieces = ["pineapple", "orange", last].map((f, i) => `<circle class="tv-food" data-ph="${base + 1 + i}" cx="${150 + i * 50}" cy="${y}" r="14" fill="${FOOD[f]}"/>`).join("");
          return `<g class="tv-row" data-ph="${base}" data-done="${base + 4}">${label(4, y + 4, who, "start")}<path class="tv-stick" d="M44 ${y}H330"/></g>${pieces}`;
        }).join("")}
        <circle class="tv-mark" data-ph="18" cx="250" cy="145" r="18"/>
        ${label(44, 192, "Handle", "start")}${label(330, 192, "Tip", "end")}`);
    },
    // The order in the recorded rollout, top layer first: [label, food, height, appears at, toasted at].
    sandwich: () => {
      const layers = [["Toast, top", "bread", 22, 6, 6], ["Turkey slice", "turkey", 11, 5], ["Ketchup", "ketchup", 6, 4], ["Two pickles", "pickle", 11, 3], ["Swiss cheese", "swiss", 11, 2], ["Toast, bottom", "bread", 22, 0, 1]];
      let y = 26;
      const drawn = layers.map(([name, food, h, ph, done]) => {
        const at = y;
        y += h + 6;
        const toast = done != null ? ` data-done="${done}"` : "";
        return `<g data-ph="${ph}"${toast} class="${food === "bread" ? "tv-bread" : ""}"><rect x="24" y="${at}" width="176" height="${h}" rx="${h > 15 ? 8 : 4}" fill="${FOOD[food]}"/>
          <path class="tv-lead" d="M204 ${at + h / 2}H226"/>${label(232, at + h / 2 + 4, name, "start")}</g>`;
      }).join("");
      return art(`${drawn}<ellipse class="tv-plate" cx="112" cy="${y + 8}" rx="108" ry="9"/>`);
    },
    // One round per canapé, plate by plate: base, middle, topping.
    canape: () => {
      const plates = [
        ["Salmon", ["cracker", "herb", "salmon"]],
        ["Shrimp", ["cucumber", "feta", "shrimp"]],
        ["Ham and cheese", ["cracker", "cheese", "ham"]],
      ];
      const stack = (x, foods, c) => foods.map((f, i) => `<rect data-ph="${c * 3 + i}" x="${x - 19}" y="${122 - i * 14}" width="38" height="12" rx="4" fill="${FOOD[f]}"/>`).join("");
      return art(plates.map(([name, foods], i) => {
        const cx = 62 + i * 118;
        return `${label(cx, 58, name)}${stack(cx - 24, foods, i * 2)}${stack(cx + 24, foods, i * 2 + 1)}
          <ellipse class="tv-plate" cx="${cx}" cy="142" rx="54" ry="8"/>${label(cx, 172, `Plate ${i + 1}`)}`;
      }).join(""));
    },
    // One marshmallow through its window: threaded raw, browning on the rack, off while golden.
    marshmallow: () => {
      const stages = [["Raw", "#f6efe3", 1], ["Browning", "#ecd3a0", 3], ["Golden", "#d9a24a", 4], ["Burnt", "#4c3527", null]];
      return art(`<path class="tv-stick" d="M26 56H334"/>
        ${stages.map(([name, fill, ph], i) => {
          const x = 66 + i * 76;
          return `<g${ph == null ? ' class="tv-warn"' : ` data-ph="${ph}"`}><path class="tv-stick" d="M${x} 20V50"/><rect class="tv-food" x="${x - 20}" y="34" width="40" height="44" rx="12" fill="${fill}"/>${label(x, 16, name)}</g>`;
        }).join("")}
        <rect class="tv-heat" data-done="2" x="26" y="88" width="308" height="10" rx="5"/>
        ${label(180, 116, "One heater, always on")}
        ${stages.map(([, fill], i) => `<rect x="${26 + i * 77}" y="160" width="75" height="12" rx="3" fill="${fill}"/>`).join("")}
        <g data-ph="4"><path class="tv-window" d="M180 154V148H255V154"/>${label(217, 141, "Take it off here")}</g>
        ${label(26, 192, "Time on the rack", "start")}`);
    },
    // The table at the start. Each group of items is cleared at its step.
    cleanup: () => {
      const crumbs = [[64, 62], [78, 74], [120, 124], [136, 112], [182, 58], [210, 132], [226, 120], [262, 70], [292, 128], [304, 116]];
      return art(`<rect class="tv-table" x="20" y="20" width="320" height="160" rx="10"/>
        ${[100, 180, 260].map((x) => `<path class="tv-zone" d="M${x} 28V172"/>`).join("")}
        <g data-off="3">${crumbs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${FOOD.bread}"/>`).join("")}</g>
        <g data-off="4"><ellipse class="tv-spill" cx="144" cy="66" rx="17" ry="9"/><ellipse class="tv-spill" cx="238" cy="100" rx="13" ry="8"/><ellipse class="tv-spill" cx="66" cy="140" rx="15" ry="8"/></g>
        <g data-off="2"><circle class="tv-dish" cx="120" cy="150" r="16"/><circle class="tv-dish" cx="214" cy="56" r="16"/></g>
        <g data-off="1"><circle cx="118" cy="148" r="4" fill="${FOOD.tomato}"/><circle cx="216" cy="58" r="4" fill="${FOOD.pickle}"/></g>
        <g data-off="0"><rect x="280" y="146" width="30" height="9" rx="4" transform="rotate(-24 295 150)" fill="${FOOD.ketchup}"/>
        <rect x="30" y="94" width="30" height="9" rx="4" transform="rotate(18 45 98)" fill="${FOOD.swiss}"/></g>
        <rect class="tv-shared" x="158" y="84" width="46" height="30" rx="5"/>${label(181, 103, "Tray")}
        <circle class="tv-shared" cx="314" cy="42" r="11"/>${label(314, 67, "Cup")}
        <rect class="tv-shared" x="28" y="30" width="28" height="24" rx="4"/>${label(42, 69, "Bin")}
        <g class="t-robot">${label(180, 14, "Robot")}</g><g class="t-human">${label(180, 194, "Human")}</g>`);
    },
  };

  const rounds = (t) => t.sync?.rounds ?? 1;

  const task = (t) => `<figure class="fig tf-fig">
    <div class="tf" data-total="${t.flow.steps.length * rounds(t)}">
      <div class="tf-art"><p class="eyebrow">${t.art.title}</p>${ART[t.art.kind]()}<div class="tf-prog" aria-hidden="true"><i></i></div></div>
      <div class="tf-flow">
        <p class="eyebrow">${t.flow.title}</p>
        <ol class="tf-steps">${t.flow.steps.map(([name, note], i) => `<li><b>${i + 1}</b><span>${name}</span><small>${note}</small></li>`).join("")}</ol>
        <p class="tf-repeat">${t.flow.repeat}<span class="tf-round"></span></p>
      </div>
    </div>
  </figure>`;

  // Shows a task figure at one phase: -1 is the layout before anyone acts, total is the finished task.
  const taskPhase = (tf, t, phase) => {
    const n = t.flow.steps.length;
    const total = n * rounds(t);
    tf.classList.add("is-sync");
    tf.querySelectorAll("[data-ph]").forEach((el) => {
      const k = Number(el.dataset.ph);
      el.classList.toggle("is-hidden", phase < k);
      el.classList.toggle("is-now", phase === k);
    });
    tf.querySelectorAll("[data-off]").forEach((el) => {
      const k = Number(el.dataset.off);
      el.classList.toggle("is-gone", phase > k);
      el.classList.toggle("is-now", phase === k);
    });
    tf.querySelectorAll("[data-done]").forEach((el) => el.classList.toggle("is-done", phase >= Number(el.dataset.done)));
    const step = phase >= 0 && phase < total ? phase % n : -1;
    const round = Math.min(rounds(t), Math.floor(Math.max(phase, 0) / n) + 1);
    tf.querySelectorAll(".tf-steps li").forEach((li, i) => {
      li.classList.toggle("is-now", i === step);
      li.classList.toggle("is-done", phase >= total || (step >= 0 && i < step));
    });
    tf.querySelector(".tf-round").textContent = rounds(t) > 1 && phase >= 0 ? ` · ${phase >= total ? rounds(t) : round} / ${rounds(t)}` : "";
    tf.querySelector(".tf-prog i").style.transform = `scaleX(${Math.max(0, Math.min(1, (phase + 1) / (total + 1)))})`;
  };

  return { overview, decision, task, taskPhase };
})();
