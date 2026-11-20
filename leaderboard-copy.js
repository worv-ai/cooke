/*
 * Copy for the leaderboard page (leaderboard.html, leaderboard.js). Numbers come from leaderboard-board.js; task
 * names and one-line descriptions from content.js. Metric wording follows the paper (Sec. 3.4).
 */
window.BOARD_COPY = {
  title: "COOK·E Leaderboard",
  sub: "Generalist embodied policies as partners of a simulated human, on five long-horizon kitchen tasks.",
  stats: { tasks: "Tasks", models: "Models evaluated", modes: "Evaluation modes", runs: "Scored runs" },
  updated: "Updated",
  buttons: [
    { label: "Submit your model", href: "#submit", primary: true },
    { label: "Project page", href: "index.html" },
  ],

  tracks: [["all", "All"], ["agents", "Generalist agents"], ["vla", "VLA policies"]],
  modeLabel: "Mode",
  modeNames: {
    "free-off": "Latency-free · comm. off",
    "free-on": "Latency-free · comm. on",
    "aware-off": "Latency-aware · comm. off",
    "aware-on": "Latency-aware · comm. on",
  },
  defaultMode: "aware-off",
  taskLabel: "Task columns",
  metrics: [["S", "S"], ["B", "B"], ["W", "W"]],
  cols: { n: "#", model: "Model", type: "Type", org: "Organization", open: "Open", pooled: "Four tasks", tasks: "Per task" },
  heads: { S: ["S", "↑", "Task efficiency"], B: ["B", "↓", "Human burden"], W: ["W", "↓", "Human delayed time"] },
  sortHint: "Sort by this column",
  refs: { title: "References", h: "Human-alone (H)", hh: "Two humans (H-H)" },
  pending: "Rollouts still running",
  notRun: "Not evaluated in this mode",
  pendingTask: "pending",
  notes: [
    "Medians over every scored run. “Four tasks” pools Sandwich, Canapé, Fruit Skewer and S'mores; Cleanup joins once the agents' rerun is in. A shaded cell means the robot helped (S > 0 and B < 1), as in the paper's Fig. 4.",
    "Rows are sorted by S. The gap between agents is about the size of one agent's spread over its own rollouts, so the order is not a ranking.",
    "A VLA policy alone has no message channel, so it runs with communication off only. “Open”: the policy's weights are public. On a narrow screen the per-task columns are hidden.",
  ],

  sections: [
    {
      id: "scope", title: "Benchmark scope",
      body: "Each episode puts one robot and one simulated human in a shared kitchen with a common goal. Five long-horizon tasks span sequential and parallel collaboration, fine-grained manipulation, time-dependent constraints and shared-resource constraints.",
      tasks: true,
    },
    {
      id: "modes", title: "Four evaluation modes",
      items: [
        ["Latency-free", "The world pauses while the robot thinks, then runs for 2 s: a decision every 2 s."],
        ["Latency-aware", "The human keeps working while the robot thinks, as in real time."],
        ["Communication on", "The partners exchange text messages: intentions, requests and announced subtasks."],
        ["Communication off", "No message channel; the robot infers the human's intent from what it sees."],
      ],
    },
    {
      id: "metrics", title: "How we evaluate",
      items: [
        ["S · Task efficiency ↑", "The area under the task-progress curve, placed between the two references: S = 0 matches H, S = 1 matches H-H, and S < 0 indicates less progress over time than the human-alone baseline."],
        ["B · Human burden ↓", "The human's active time plus any unfinished work, divided by the active time of H: B = 1 for H, B < 1 when the robot takes work off the human, and B ≈ 0.5 for H-H."],
        ["W · Human delayed time ↓", "Time the human spends blocked by the robot's arm, waiting for an item only the robot can provide, and fixing the robot's errors, as a share of H's completion time."],
        ["Runs", "Agents: five rollouts per task and mode. VLA policies: three. A run ends at twice the human-alone time and keeps its partial progress."],
      ],
    },
    {
      id: "submit", title: "How to submit",
      body: "The simulator, the simulated human and the evaluation scripts will be released with the paper, together with the instructions to evaluate a new policy and add it here.",
      tag: "At release",
    },
  ],
};
