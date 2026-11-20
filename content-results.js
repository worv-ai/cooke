/*
 * COOK·E project page: copy for the sections that report the paper's results (Key results, 04 Results,
 * 05 Why robots fail, 06 Real world) and the temporary demo-candidates section. Loaded after content.js and
 * merged into window.CONTENT. Numbers follow the submitted paper (Secs. 4.2–4.6, Figs. 4–6); the per-agent medians
 * behind the Results chart are in leaderboard-data.js (copied from cjh/updates, checked there against facts.json).
 */
Object.assign(window.CONTENT, {
  /* The demo video under the hero (demo candidate B, "Thesis first"). Stand-in footage, no sound. */
  demo: {
    kicker: "Demo",
    src: "media/demo_video.mp4?v=3",
    poster: "media/demo_video.jpg?v=3",
    label: "COOK·E demo video: who finishes first, the benchmark, the three failure modes, the numbers and the real world",
    /* For the team while the page is shared internally. Remove before release. */
    note: "(임시 데모비디오 입니다)",
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
    body: "Median task efficiency S (higher is better), human burden B and human delayed time W (lower is better) for each agent at both latencies, with communication off and on. Medians pool every run on Sandwich, Canapé, Fruit Skewer and S'mores. A shaded cell would mean the robot helped (S > 0 and B < 1), as in the paper's Fig. 4.",
    latLabel: "Latency",
    lat: [["free", "Latency-free"], ["aware", "Latency-aware"]],
    labels: { h: "Human-alone (H)", hh: "Two humans (H-H)", off: "Comm. off", on: "Comm. on" },
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
      "Every median S is below zero: no team finishes sooner than the human alone.",
      "B is 1.00 or higher in every cell: the human never does less work than alone.",
      "π0.5 rows sit closest to the human-alone reference, with S near 0, B near 1 and no delay.",
    ],
  },

  failures: {
    kicker: "Why robots fail",
    claim: "No single missing skill: <em>small failures add up in the shared workspace.</em>",
    body: "Imprecise manipulation, thin planning and slow decisions compound where both partners work, and every one of them costs the human time.",
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
      { name: "Imprecise manipulation", stat: "0 / 47", statLabel: "Fruit Skewer episodes in which the robot threads a piece", body: "Agents rarely do the fine work themselves. Of 227 fruit pieces they pick up, they place 115 on the human's side and 90 on their own board, and leave the threading to the human." },
      { name: "Insufficient planning", stat: "36 / 226", statLabel: "episodes in which the robot takes work off the human (B < 1)", body: "Agents claim subtasks they finish late, promise work they are too slow to deliver, and leave the arm where the human must reach next, although they can move it away at any time." },
      {
        name: "High inference latency", stat: "15.0 s", statLabel: "median time per decision, about 4 decisions a minute",
        body: "The human keeps working while the robot thinks, so the robot acts on a scene that has already changed, and an arm that blocks the human stays put until the next decision.",
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
      "<b>The same failures.</b> Slow decisions leave the arm in the participant's reach, imprecise manipulation misplaces items that the participant corrects, and agents retry failed actions instead of asking for help. These failures arise from the agents themselves rather than from artifacts of the simulated partner.",
      "<b>Consistent with simulation.</b> Across all 40 combinations, real and simulated scores are strongly correlated, largely reflecting the shared task difficulty; the order of agents within a task agrees less consistently.",
      "<b>Two differences.</b> GPT-6 Astra reduces the participant's burden in Canapé but not that of the simulated human, suggesting that the simulated human reacts more strongly to obstruction. The real robot holds its pose while the model computes.",
    ],
    note: "Given the small number of participants and trials, the paper regards this evaluation as preliminary.",
  },
});
