/*
 * COOK·E project page: copy for the sections that report the paper's results (Key results, 04 Results,
 * 05 Why robots fail, 06 Real world) and the temporary demo-candidates section. Loaded after content.js and
 * merged into window.CONTENT. Numbers follow the submitted paper (Secs. 4.2–4.6, Figs. 4–6); the per-agent medians
 * behind the Results chart are in leaderboard-data.js (copied from cjh/updates, checked there against facts.json).
 */
Object.assign(window.CONTENT, {
  /* The demo video under the hero: the 4-minute walkthrough with sound (benchmark, metrics, findings, real world). */
  demo: {
    kicker: "Demo",
    play: "Watch the 4-minute video",
    src: "media/v11240300-d.mp4",
    poster: "media/v11240300-d-poster.jpg", // frame at 3 s: the opening line in full
    label: "COOK·E demo video: the five kitchen tasks, the simulated human partner, the six metrics, the main findings and the real-world failures",
  },

  /* Key results: a race. Four teams make the same dish; each line fills at the team's average pace and the finishing
   * order is the result. Lengths come from leaderboard-data.js (communication on, five tasks, four agents). */
  keyResults: {
    kicker: "Key results",
    claim: "A robot partner makes the person <em>slower, not faster,</em> and counting its thinking time makes it slower still.",
    lanes: ["Two people", "One person", "Person + robot", "Person + robot, thinking in real time"],
    ranks: ["1st", "2nd", "3rd", "4th"],
    replay: "Replay",
    note: "Average time to finish over five tasks and four agents, communication on.",
    /* Completion time in seconds of one person alone (H) and two people (HH), per task: the reference runs. */
    ref: { sandwich: [79.6, 56.82], canape: [106.34, 58.5], fruit: [214.3, 132.5], smores: [111.13, 88.12], cleanup: [251.05, 155.16] },
  },

  /* 04 Results: the table of medians in results-table-data.js (API rerun on the fixed code, and the VLA pilot runs). */
  results: {
    kicker: "Results",
    claim: "No agent or policy <em>beats the human working alone.</em>",
    body: "Medians over every run on Sandwich, Canapé, Fruit Skewer and S'mores. A shaded cell would mean the robot helped (S > 0 and B < 1).",
    /* One line per metric above the table (the full definitions are in the paper and in metrics, content.js). */
    keys: [
      ["S", "↑", "task efficiency: 0\u00a0=\u00a0one person alone, 1\u00a0=\u00a0two\u00a0people"],
      ["B", "↓", "human burden: 1\u00a0=\u00a0the human does as much as alone"],
      ["W", "↓", "time the human loses to the robot"],
    ],
    latLabel: "Latency",
    lat: [["free", "Latency-free"], ["aware", "Latency-aware"]],
    labels: { h: "Human-alone (H)", hh: "Two humans (H-H)", off: "Comm. off", on: "Comm. on" },
    /* Legend above the table: click an option to show or hide it. */
    filter: { group: "Agents", groups: { agents: "Generalist agents", vla: "VLA policies" }, lat: "Latency", comm: "Communication", hint: "Click to show or hide",
      /* Options that start switched off, as "group:id", "lat:free|aware" or "comm:off|on". */
      off: ["group:vla"] },
    table: {
      agent: "Agent",
      cols: [["S", "↑"], ["B", "↓"], ["W", "↓"]],
      ref: "Reference",
      na: "–",
      running: "Rollouts still running",
      note: "Agents: five rollouts per task, 20 runs per cell. VLA policies: three per task, 12 runs per cell. W is a share of the human-alone completion time. –: not evaluated (a VLA policy alone has no message channel).",
      pending: "rerun results pending.",
    },
    takeaways: [
      "Every median S is below zero, so no team finishes sooner than the human would alone.",
      "Every B is 1.00 or higher, so the human never does less work than alone.",
    ],
  },

  failures: {
    kicker: "Why robots fail",
    claim: "No single missing skill. <em>Small failures pile up.</em>",
    body: "Each failure on its own is minor, but when both partners work in the same space, every one of them costs the human time.",
    /* One line on the real world under the cards (from realWorld: points and stats). */
    real: { badge: "Real world", text: "The same failures show up with a real participant, and real and simulated scores correlate strongly across the 40 combinations. This is preliminary: we ran only a small number of trials." },
    w: {
      title: "Where the human loses time",
      body: "Human delayed time W, averaged over agents and tasks, as a share of the human-alone completion time.",
      names: ["Blocked by the arm", "Waiting for the robot", "Fixing the robot's errors"],
      tones: ["tomato", "human", "robot"],
      rows: [
        ["Latency-free", "comm. off", [35.5, 14.5, 7.3]],
        ["Latency-free", "comm. on", [15.2, 8.6, 7.8]],
        ["Latency-aware", "comm. off", [48.3, 6.9, 2.4]],
        ["Latency-aware", "comm. on", [28.0, 8.8, 1.4]],
      ],
      note: "Being blocked is the largest part in every mode (12–56% across agents and modes), ahead of waiting (0–21%) and fixing (1–12%). Within every task, episodes where the human loses more time score lower S.",
    },
    items: [
      { name: "Imprecise manipulation", stat: "0 / 47", statLabel: "Fruit Skewer episodes in which the robot threads a piece", body: "Agents rarely do the fine work themselves. Of the 227 fruit pieces they pick up, 115 go on the human's side and 90 on their own board. The threading is left to the human." },
      { name: "Insufficient planning", stat: "36 / 226", statLabel: "episodes in which the robot takes work off the human (B < 1)", body: "Agents claim subtasks and finish them late, promise work they're too slow to deliver, and park the arm where the human needs to reach next, even though they could move it at any time." },
      {
        name: "High inference latency", stat: "15.0 s", statLabel: "median time per decision, about 4 decisions a minute",
        body: "The human keeps working while the robot thinks, so by the time the robot acts, the scene has changed. If its arm is in the human's way, it stays there until the next decision.",
      },
    ],
  },

  /* 06 Real world, after the paper's Sec. 4.6, Fig. 6 and Fig. 7. */
  realWorld: {
    kicker: "Real world",
    claim: "Do the findings persist <em>with a real participant?</em>",
    body: "We replace the simulated human with a real participant while keeping the robot, interface, prompt and metrics identical. Trials run in the latency-aware mode, as pausing a real participant during robot inference is impractical.",
    badge: "Preliminary",
    stats: [
      { value: "40 / 40", label: "trials with negative S: no agent outperforms the participant alone" },
      { value: "35 / 40", label: "trials in which the participant's burden exceeds the solo level (B > 1)" },
    ],
    /* Fig. 7: the S'mores setup, drawn from above. */
    setup: {
      title: "Setup",
      caption: "Real-world setup, after the paper's Fig. 7 (S'mores). Schematic.",
      labels: { robot: "Bimanual YAM robot", human: "Participant", space: "Shared workspace", head: "Head camera", wrist: "Wrist cameras" },
    },
    compare: {
      same: ["Same", ["Robot and interface", "Prompt", "Metrics S, B and W", "Five tasks"]],
      diff: ["Different", ["A real participant instead of the simulated human", "Latency-aware mode only", "The robot holds its pose while the model computes; in simulation it completes its current motion", "Participants are instructed not to approach the robot too closely"]],
    },
    /* Relative task difficulty (Sec. 4.6): least affected first. Simulation: median S per task (Sec. 4.2). */
    order: {
      title: "Task difficulty, simulation and real world",
      cols: ["Simulation", "Real world"],
      sim: ["Canapé", "S'mores", "Cleanup", "Fruit Skewer", "Sandwich"],
      real: ["Canapé", "S'mores", "Cleanup", "Sandwich", "Fruit Skewer"],
      top: "least affected",
      bottom: "hardest",
      note: "The order is largely preserved. Only the two hardest tasks swap: Fruit Skewer, which demands the most precise manipulation, becomes the hardest in the real world.",
    },
    points: [
      "<b>Same failures.</b> Slow decisions leave the arm in reach, misplaced items need correcting, and agents retry instead of asking for help.",
      "<b>Consistent with simulation.</b> Real and simulated scores correlate strongly across the 40 combinations, mostly through task difficulty.",
      "<b>Two differences.</b> GPT-6 Astra lowers the participant's burden in Canapé but not the simulated human's, and the real robot holds its pose while the model computes.",
    ],
    note: "Given the small number of participants and trials, the paper regards this evaluation as preliminary.",
  },
});
