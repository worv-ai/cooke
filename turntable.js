/*
 * COOK·E project page: the 360° scene viewer behind the "Explore the scene" button in Rollouts.
 *
 * Each task has a turntable render from Isaac Sim: `count` frames around the table, evenly spaced, the first one
 * from the robot's side, turning the same way for every task. Frames live at
 *   media/turntable/<dir>/<index>.jpg   (index zero-padded to three digits: 000.jpg, 001.jpg, ...)
 * with <dir> and `count` from CONTENT.tasks.turntable (content.js). Until a task's frame 000 loads, the viewer
 * draws a labelled schematic in its place so the controls can be tried.
 *
 * Drag (or swipe) to turn, arrow keys step, Escape closes. It turns slowly on its own until the reader takes over.
 */
window.TURNTABLE = (() => {
  const C = window.CONTENT.tasks;
  const TT = C.turntable;
  const pad3 = (n) => String(n).padStart(3, "0");
  const frameSrc = (dir, i) => TT.path.replace("{dir}", dir).replace("{i}", pad3(i));

  let dlg, canvas, ctx, chips, note, task = 0, angle = 0, spin = true, raf = 0;
  const sets = []; // per task: { ok: null | true | false, imgs: [] }

  /* ---------- Frames ---------- */

  const load = (k) => {
    if (sets[k]) return sets[k];
    const set = (sets[k] = { ok: null, imgs: [] });
    const dir = TT.dirs[k];
    const first = new Image();
    first.onload = () => {
      set.ok = true;
      set.imgs[0] = first;
      for (let i = 1; i < TT.count; i++) { const im = new Image(); im.src = frameSrc(dir, i); set.imgs[i] = im; }
      if (k === task) showNote();
    };
    first.onerror = () => { set.ok = false; if (k === task) showNote(); };
    first.src = frameSrc(dir, 0);
    return set;
  };

  /* ---------- Drawing ---------- */

  const css = (name) => getComputedStyle(dlg).getPropertyValue(name).trim();

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return { w, h };
  };

  // A real frame: the one nearest the current angle that has loaded, drawn to cover the stage.
  const drawFrame = (set, w, h) => {
    const n = TT.count;
    const at = ((Math.round((angle / (2 * Math.PI)) * n) % n) + n) % n;
    let im = null;
    for (let d = 0; d < n && !im; d++) {
      for (const j of [at - d, at + d]) {
        const c = set.imgs[((j % n) + n) % n];
        if (c && c.complete && c.naturalWidth) { im = c; break; }
      }
    }
    if (!im) return;
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const iw = im.naturalWidth * s, ih = im.naturalHeight * s;
    ctx.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
  };

  // Stand-in until the render is in: the table, a few items, the robot on one side and the human on the other,
  // turned with the same angle as the frames would be.
  // A standing figure beside the table: a column from the floor up to height h, with a head for the human.
  // Its label sits above the top; p (the top) carries the depth used to sort it against the table items.
  const figure = (P, x, z, hgt, color, label, head) => {
    const p = P(x, z, hgt);
    return {
      p, label, color,
      draw: () => {
        const base = P(x, z, 0), r = Math.abs(base.y - p.y) * 0.13;
        ctx.fillStyle = color;
        ctx.fillRect(p.x - r * 0.9, p.y + (head ? r * 1.2 : 0), r * 1.8, base.y - p.y - (head ? r * 1.2 : 0));
        if (head) { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); }
      },
    };
  };
  const ITEMS = [[-0.5, -0.15], [-0.15, 0.2], [0.2, -0.2], [0.5, 0.15], [0, -0.05], [-0.35, 0.3], [0.35, -0.32]];
  const drawSchematic = (w, h) => {
    const S = Math.min(w / 2.6, h / 1.9), cx = w / 2, cy = h * 0.58, el = 0.8; // elevation, radians
    const sin = Math.sin(angle), cos = Math.cos(angle);
    const P = (x, z, y = 0) => {
      const xr = x * cos - z * sin, zr = x * sin + z * cos;
      return { x: cx + xr * S, y: cy + zr * S * Math.sin(el) - y * S * Math.cos(el), z: zr };
    };
    const fg = css("--fg"), muted = css("--muted"), line = css("--line"), tomato = css("--tomato"), surface = css("--surface-2");
    // table
    const top = [[-0.8, -0.45], [0.8, -0.45], [0.8, 0.45], [-0.8, 0.45]].map(([x, z]) => P(x, z));
    ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
    ctx.fillStyle = surface; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = line; ctx.stroke();
    // everything on or around the table, far to near
    const things = [
      ...ITEMS.map(([x, z], i) => ({ p: P(x, z, 0.04), draw: (p) => { ctx.beginPath(); ctx.ellipse(p.x, p.y, S * 0.07, S * 0.07 * Math.sin(el), 0, 0, 7); ctx.fillStyle = i % 2 ? muted : fg; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1; } })),
      figure(P, 0, -0.7, 0.55, tomato, TT.labels.robot, false),
      figure(P, 0, 0.75, 0.6, css("--human") || fg, TT.labels.human, true),
    ].sort((a, b) => a.p.z - b.p.z);
    things.forEach((t) => {
      t.draw(t.p);
      if (t.label) {
        ctx.font = `500 ${Math.round(S * 0.075)}px ${css("--mono") || "monospace"}`;
        ctx.textAlign = "center"; ctx.fillStyle = t.color;
        ctx.fillText(t.label.toUpperCase(), t.p.x, t.p.y - S * 0.14);
      }
    });
  };

  const draw = () => {
    const { w, h } = size();
    ctx.clearRect(0, 0, w, h);
    const set = load(task);
    if (set.ok) drawFrame(set, w, h); else drawSchematic(w, h);
  };

  const loop = () => {
    if (spin) angle += 0.004;
    draw();
    raf = requestAnimationFrame(loop);
  };

  /* ---------- Dialog ---------- */

  const showNote = () => {
    const set = sets[task];
    note.hidden = !set || set.ok !== false;
    chips.forEach((b, i) => b.setAttribute("aria-pressed", i === task));
    canvas.setAttribute("aria-label", `${C.items[task].name}: ${set && set.ok ? TT.alt : TT.pending}`);
  };

  const pick = (k) => { task = k; load(k); showNote(); };

  const build = () => {
    dlg = document.createElement("dialog");
    dlg.className = "tt";
    dlg.setAttribute("aria-label", TT.title);
    dlg.innerHTML = `
      <div class="tt-head">
        <h3>${TT.title}</h3>
        <div class="seg is-sm tt-tasks" role="group" aria-label="Task">${C.items.map((t, i) => `<button type="button" data-v="${i}">${t.name}</button>`).join("")}</div>
        <button type="button" class="tt-close" aria-label="Close">×</button>
      </div>
      <div class="tt-stage"><canvas role="img" tabindex="0"></canvas><p class="tt-note" hidden>${TT.pending}</p></div>
      <p class="tt-hint">${TT.hint}</p>`;
    document.body.appendChild(dlg);
    canvas = dlg.querySelector("canvas");
    ctx = canvas.getContext("2d");
    note = dlg.querySelector(".tt-note");
    chips = [...dlg.querySelectorAll(".tt-tasks button")];

    dlg.querySelector(".tt-tasks").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pick(Number(b.dataset.v)); });
    dlg.querySelector(".tt-close").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // click outside the panel
    dlg.addEventListener("close", () => { cancelAnimationFrame(raf); document.documentElement.classList.remove("tt-open"); });

    // drag or swipe to turn
    let x0 = null;
    canvas.addEventListener("pointerdown", (e) => { x0 = e.clientX; spin = false; canvas.setPointerCapture(e.pointerId); canvas.classList.add("is-drag"); });
    canvas.addEventListener("pointermove", (e) => { if (x0 == null) return; angle -= (e.clientX - x0) * 0.012; x0 = e.clientX; });
    const up = () => { x0 = null; canvas.classList.remove("is-drag"); };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("keydown", (e) => {
      const step = (2 * Math.PI) / TT.count;
      if (e.key === "ArrowLeft") { spin = false; angle -= step; e.preventDefault(); }
      if (e.key === "ArrowRight") { spin = false; angle += step; e.preventDefault(); }
    });
  };

  const open = (k = 0) => {
    if (!dlg) build();
    spin = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    angle = 0;
    pick(k);
    dlg.showModal();
    document.documentElement.classList.add("tt-open");
    canvas.focus();
    cancelAnimationFrame(raf);
    loop();
  };

  // Calls `ready` once the first task's frame 000 loads, i.e. once the renders are in. Until then the page keeps the
  // "Explore the scene" button hidden, so the schematic stand-in is never shown to readers.
  const whenRendered = (ready) => {
    const im = new Image();
    im.onload = ready;
    im.src = frameSrc(TT.dirs[0], 0);
  };

  return { open, whenRendered };
})();
