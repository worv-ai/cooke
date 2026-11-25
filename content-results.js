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

  /* 04 Results: the paper's Table 8 (simulation results averaged over the four modes), copied as printed.
   * Values are strings so they keep the paper's decimals; null is "–". † marks runs without communication. */
  results: {
    kicker: "Results",
    claim: "No agent or policy <em>beats the human working alone.</em>",
    body: "Simulation results for every policy, averaged over the four modes. This is Table 8 of the paper; Table 7 has every mode.",
    /* One line per column, worded like the results hub (the full definitions are in the paper). */
    keys: [
      ["D", "↑", "runs that finish within the time limit (%)"],
      ["S", "↑", "task efficiency: 0 = one person alone, 1 = two people"],
      ["B", "↓", "human burden: 1 = the human does as much as alone"],
      ["W", "↓", "time the human loses to the robot (% of one person's time)"],
      ["C", "↑", "the robot's share of the finished subtasks (%)"],
      ["R", "↓", "the robot's thinking time per decision (s)"],
    ],
    table: {
      policy: "Policy",
      /* Column groups as in Table 8: [group, [[symbol, arrow], ...]]. */
      cols: [["Team", [["D", "↑"], ["S", "↑"]]], ["Human", [["B", "↓"], ["W", "↓"]]], ["Robot", [["C", "↑"], ["R", "↓"]]]],
      groups: [
        { name: "Reference", ref: true, rows: [
          ["H (human alone)", ["100", "0.00", "1.00", "0.0", null, null]],
          ["H-H (two humans)", ["100", "1.00", "0.47", "0.0", null, null]],
        ] },
        { name: "Frontier agents", rows: [
          ["GPT-6 Astra", ["65", "−0.96", "1.15", "44.9", "12.2", "10.2"]],
          ["Gemini 4 Argon", ["72", "−1.28", "1.12", "38.5", "7.8", "19.0"]],
          ["Claude Opus 5.5", ["64", "−1.14", "1.12", "43.3", "9.0", "9.2"]],
          ["Claude Fable 5.2", ["68", "−1.52", "1.11", "39.5", "11.0", "13.3"]],
        ] },
        { name: "VLA baselines", rows: [
          ["π<sub>0.5</sub>†", ["100", "−0.11", "1.01", "0.0", "0.0", "0.04"]],
          ["π<sub>0.5</sub> + Planner", ["100", "−0.16", "1.02", "0.0", "0.0", "59.6"]],
          ["π<sub>0.5</sub> + GPT-6 Astra", ["100", "−0.18", "1.02", "0.0", "0.0", "5.4"]],
          ["MolmoAct 2†", ["60", "−1.17", "1.32", "45.8", "0.0", "0.16"]],
          ["MolmoAct 2 + Planner", ["88", "−0.49", "1.09", "9.8", "0.0", "43.0"]],
          ["MolmoAct 2 + GPT-6 Astra", ["78", "−0.67", "1.07", "6.4", "0.0", "4.8"]],
        ] },
      ],
      na: "–",
      note: "† Runs without communication. A VLA policy runs alone or takes instructions from the simulated human's planner or from GPT-6 Astra; for an instructed VLA, R is the time of the instructing model.",
    },
    takeaways: [
      "Every S is below zero, so no team finishes sooner than one person alone.",
      "Every B is above 1.00, so no robot takes work off the human on average.",
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
