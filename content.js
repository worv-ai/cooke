/*
 * COOK·E project page (arXiv release preview): every word, number and media path lives here.
 * main.js renders it, figures.js draws the small diagrams, styles.css / styles-paper.css style it.
 *
 * Sources (the submitted paper, overleaf/paper_cook-e):
 *  - Copy follows sec/0_abstract.tex, sec/3_bench.tex, sec/4_exp.tex and supple/*.tex.
 *  - Headline numbers: step0/paper/supp/facts.json (cells_S_neg 74, mean_S_talk, la_cells_below_idle 40).
 *  - S-B plots: step0/paper/final/real_manifest.json (medians over three rollouts, Fig. 4 and its Average column).
 *  - W bars: step0/analysis/waiting/breakdown.json with the part formula of waiting_common_v15.parts (Fig. 5).
 *  - Gallery: per-episode S and B from step0/results/final/{ead852d6a,36581f1c9}/runs.tsv, W from breakdown.json.
 *  Blocks between @DATA and @END are written by projectpage/build/make_data.py. Do not edit them by hand.
 *
 * Media: the hero clip and the metrics video are cut from the supplementary videos
 * (step0/paper/supp/package/videos). Episode clips are the robot head camera at 4x of the paper's runs
 * (runs/videos-board-skinned*, rendered at the run's own commit). The real-world clips media/real-*.mp4 are
 * PLACEHOLDERS from an earlier trial and are labelled as such on the page.
 *
 * A link with `href: null` renders as disabled and shows `pending`.
 * Copy rules: latency-free / latency-aware, communication on / off, S task efficiency, B human burden,
 * W human delayed time. Agents are never ranked and always appear in the order of `agents`.
 */
window.CONTENT = {
  meta: {
    title: "COOK·E",
    pending: "At release",
  },

  /* The awning nav (nav.js), on every page. `links` are the sections of index.html, in page order. */
  nav: {
    label: "Sections",
    top: "Back to top",
    home: "COOK·E project page",
    links: [["Main result", "headline"], ["Benchmark", "benchmark"], ["Results", "results"], ["Failures", "failures"], ["Real world", "real"], ["Episodes", "gallery"], ["Resources", "resources"]],
    leaderboard: "Leaderboard",
  },

  /*
   * Leaderboard page (leaderboard.html, leaderboard.js). Numbers come from results.sb (medians over three rollouts) and
   * results.hhB. Rows keep the order of results.agents until the reader sorts a column: the page itself ranks no one.
   */
  leaderboard: {
    title: "COOK·E Leaderboard",
    kicker: "Leaderboard",
    claim: "Every agent on every task, in each of the four modes. <em>On the five-task mean, no agent beats a human working alone yet.</em>",
    lede: "S is task efficiency on a scale where the human alone scores 0 and two humans score 1. B is the human's burden, where the human alone scores 1. Each value is the median over three rollouts, and the mean columns average the five tasks.",
    modeLabel: "Mode",
    metricLabel: "Task columns",
    metrics: [["S", "Task efficiency S"], ["B", "Human burden B"]],
    defaultMode: "aware-on",
    cols: { agent: "Agent", s: "S, mean", b: "B, mean" },
    sortHint: "Sort by this column",
    refs: { title: "References", hh: "Two humans (H-H)", h: "Human alone (H)" },
    order: "Rows follow the paper's agent order until you sort a column. The gap between agents matches the spread of one agent over its own rollouts, so no order here is a ranking.",
    refNote: "The references set the scale: two humans score S = 1 and the human alone S = 0 and B = 1.",
    submit: {
      title: "Submit an agent",
      body: "How to evaluate a new agent with the simulated human and submit its results will be posted here with the code release.",
    },
  },

  hero: {
    title: "Beyond Solo Tasks, Towards Human-Robot Collaboration in Long-Horizon Kitchen Tasks",
    expansion: "<b>CO</b>llaborative <b>O</b>pen <b>K</b>itchen-<b>E</b>valuation",
    authors: "Authors withheld until release",
    links: [
      { label: "Paper", href: null },
      { label: "arXiv", href: null },
      { label: "Code", href: null },
      { label: "Video", href: null },
      { label: "Data", href: null },
      { label: "BibTeX", href: null },
    ],
    clip: {
      src: "media/hero-four-modes.mp4",
      poster: "media/hero-four-modes.jpg",
      label: "Four evaluation modes side by side on one clock: GPT-6 Astra and the simulated human make canapés. Rows are latency-free and latency-aware, columns are communication off and on. Robot head camera at 4x speed.",
      caption: "The same task in all four evaluation modes, on one clock. GPT-6 Astra in Canapé, robot head camera, 4× speed.",
    },
  },

  /* Sec. 4.2 of the paper. Each number is checked against step0/paper/supp/facts.json. */
  headline: {
    kicker: "Main result",
    claim: "Current robot agents do not yet help. On average, a human working with a robot <em>falls behind the same human working alone.</em>",
    stats: [
      { value: "74 / 80", label: "agent, task and mode combinations with S < 0, so the team trails the human alone" },
      { value: "−0.90 → −1.83", label: "mean S with communication on, from latency-free to latency-aware" },
      { value: "40 / 40", label: "latency-aware combinations that score below a robot that does not act at all" },
    ],
    note: "Medians over three rollouts per combination. Four agents, five tasks and four modes make 80 combinations.",
  },

  overview: {
    kicker: "Overview",
    video: { label: "Overview video", spec: "Coming with the release" },
    abstractTitle: "Abstract",
    /* Verbatim from sec/0_abstract.tex of the submitted paper. */
    abstract: [
      "Are current embodied policies ready to collaborate with real humans? While reliable human–robot collaboration (HRC) requires the joint evaluation of robot manipulation, planning, communication, and latency, existing benchmarks typically evaluate these capabilities in human-free environments, with scripted partners, or in simplified setups, and they neglect inference latency. Consequently, the ability of current embodied policies to collaborate with humans in practice remains unclear.",
      "We introduce <b>COOK·E</b> (<b>CO</b>llaborative <b>O</b>pen <b>K</b>itchen-<b>E</b>valuation), a benchmark comprising five long-horizon kitchen tasks spanning sequential and parallel collaboration, fine-grained manipulation, time-dependent constraints, and shared-resource constraints. Evaluations of frontier generalist embodied policies, including GPT-6 Astra, Gemini 4 Argon, Claude Opus 5.5, and Claude Fable 5.2, show that human–robot teams underperform a human working alone on average, in both simulation and the real world.",
      "Collaborative failures arise not from a single capability bottleneck but from the compounding effects of imprecise manipulation, insufficient planning, and high latency, which collectively obstruct shared workspaces and cause errors that require human recovery. Our metrics capture task efficiency (completion time and task progress) and human burden (time spent on subtasks), providing a comprehensive assessment of task performance and the impact of robot assistance on human workload. We will publicly release COOK·E.",
    ],
    teaser: {
      src: "media/fig-teaser.webp",
      alt: "Paper Figure 1. (a) Five collaborative tasks: Sandwich, Canapé, Fruit Skewer, S'mores and Cleanup, plus a real-world photo. (b) Dynamic subtask allocation in a Sandwich episode. (c) The adaptive human partner: state tracking, decision making, validation and execution. (d) The four evaluation settings, latency-free or latency-aware with communication on or off. (e) Main result: with latency, no agent beats a human working alone. (f) The same failures in simulation and the real world: misplaced items, retries without asking and a robot that blocks the human.",
      caption: "<b>Figure 1.</b> COOK·E comprises five long-horizon collaborative kitchen tasks (a), in which robots allocate subtasks at run time (b) with an adaptive human partner (c). Four evaluation modes vary inference latency and communication (d). Frontier embodied agents do not yet outperform a human working alone on average (e), with the same failures in simulation and the real world (f).",
    },

    /*
     * Interactive copy of Figure 1 (teaser.js), in its own band right under the hero, above the main result.
     * The image above stays one click away ("Paper figure").
     * Panel copy follows the figure. Tasks, human steps, modes, results and failures come from their own sections
     * below. The frames in (b) and the image in (c) are cut from media/fig-teaser.webp (media/fig1-*.webp).
     */
    figure1: {
      label: "Figure 1 view",
      views: [["live", "Interactive"], ["paper", "Paper figure"]],
      pause: "Pause motion",
      play: "Play motion",
      a: {
        title: "Five Collaborative Tasks",
        label: "Tasks",
        solo: "human alone",
        realNote: "real table shown",
        real: { name: "Real world", tag: "real robot", badge: "REAL", src: "media/task-canape-real.webp" },
      },
      b: {
        title: "Dynamic Subtask Allocation",
        allocTitle: "Who takes it",
        owners: { robot: "Robot", ask: "Robot asks the human", human: "Human" },
        steps: [
          { who: "robot", name: "Robot", t: "0:00", quote: "… I will get the two pickles and the sliced tomato ready.", src: "media/fig1-alloc-1.webp" },
          { who: "robot", name: "Robot", t: "0:23", quote: "… could you grab a tomato slice … since it is too wide for my gripper?", src: "media/fig1-alloc-2.webp" },
          { who: "human", name: "Human", t: "0:26", quote: "Okay, I'll get the tomato slice now.", src: "media/fig1-alloc-3.webp" },
        ],
        items: [
          { name: "Two pickles", owners: ["robot", "robot", "robot"] },
          { name: "Tomato slice", owners: ["robot", "ask", "human"] },
        ],
      },
      c: {
        title: "Adaptive Human Partner",
        src: "media/fig1-human.webp",
        alt: "The simulated human at the Fruit Skewer table, threading fruit onto a skewer beside the robot arm.",
        names: ["State Tracking", "Decision Making", "Validation & Execution"],
        short: ["task state, executable subtasks", "selects the next subtask", "checks, runs skills, recovers"],
        examples: ["skewer 2: strawberry on → kiwi next", "→ thread kiwi onto skewer 2"],
        chain: ["pick", "carry", "thread", "release"],
      },
      d: { title: "Evaluation Settings", rows: { on: "Comm. on", off: "Comm. off" } },
      e: {
        title: "Main Results",
        claim: {
          aware: "<em>With latency,</em> no agent beats a human working alone",
          free: "<em>Even without latency,</em> no agent beats a human working alone",
        },
        sub: "mean over the five tasks",
        alone: "human-alone",
      },
      f: { title: "Sim-to-Real Failure Consistency", sim: "Sim", real: "Real", marks: ["misplaced items", "retries blindly", "blocks the human"] },
      skills: [["Manipulation", "Shared workspace"], ["Planning", "Subtask allocation"], ["Communication", "Action coordination"], ["Latency", "Real-time response"]],
    },
  },

  benchmark: {
    kicker: "Benchmark",
    claim: "Five kitchen tasks, one adaptive human partner and <em>four ways to run each episode.</em>",
    lede: "A human and a robot share a kitchen table and work toward one goal from a public recipe. Both partners read the same recipe. The work is divided at run time, not in advance.",
    tasksTitle: "Five collaborative tasks",
    tasksNote: "Top: simulation. Bottom: the real-world copy with the same objects and a similar layout. H: time one simulated human needs alone (median over five seeds).",
    tasks: [
      {
        id: "sandwich", name: "Sandwich", tag: "Sequential", challenge: "Sequential collaboration",
        subtasks: 7, solo: "79.6 s",
        line: "Make one sandwich on toasted brown bread in a fixed layer order. Each layer can only go on the one below.",
        sim: "media/task-sandwich-sim.webp", real: "media/task-sandwich-real.webp",
        simAlt: "Simulated Sandwich table: toaster, bread rack, sauce bottles, ingredient tray and two cutting boards, with the simulated human across the table.",
        realAlt: "Real Sandwich table with the same ingredients and two robot arms in front.",
      },
      {
        id: "canape", name: "Canapé", tag: "Parallel", challenge: "Parallel collaboration",
        subtasks: 18, solo: "106.3 s",
        line: "Make six canapés of three kinds on three shared plates. Each partner builds from its own station, in any order.",
        sim: "media/task-canape-sim.webp", real: "media/task-canape-real.webp",
        simAlt: "Simulated Canapé table: three serving plates on a central board with bases and toppings on both sides.",
        realAlt: "Real Canapé table with three plates and ingredient trays on both sides.",
      },
      {
        id: "fruit", name: "Fruit Skewer", tag: "Precision", challenge: "Fine-grained manipulation",
        subtasks: 20, solo: "214.3 s",
        line: "Make four fruit skewers of two kinds and serve them. Threading a small piece onto a thin stick needs precise control.",
        sim: "media/task-fruit-sim.webp", real: "media/task-fruit-real.webp",
        simAlt: "Simulated Fruit Skewer table: fruit bowls, a skewer holder, a serving plate and two boards.",
        realAlt: "Real Fruit Skewer table with fruit bowls, skewers in a cup and a serving plate.",
      },
      {
        id: "smores", name: "S'mores", tag: "Timing", challenge: "Time-dependent constraint",
        subtasks: 18, solo: "111.1 s",
        line: "Make three s'mores. Marshmallows toast in a shared heater and must come off after 40 s and before 70 s, when they fall.",
        sim: "media/task-smores-sim.webp", real: "media/task-smores-real.webp",
        simAlt: "Simulated S'mores table: a four-slot heater, marshmallow skewers, crackers and chocolate on a central board.",
        realAlt: "Real S'mores table with a heater, skewers, crackers and chocolate.",
      },
      {
        id: "cleanup", name: "Cleanup", tag: "Sharing", challenge: "Shared-resource constraint",
        subtasks: 22, solo: "251.1 s",
        line: "Clear the table after a meal by house rules. One towel and one bin are shared, and the robot reaches only its side.",
        sim: "media/task-cleanup-sim.webp", real: "media/task-cleanup-real.webp",
        simAlt: "Simulated Cleanup table: plates, cups, sauce bottles, a bin, a dish tray, a towel and coffee spills.",
        realAlt: "Real Cleanup table with a bin, plates, cups, a towel and a cutting board.",
      },
    ],

    human: {
      title: "Adaptive human simulator",
      lede: "The robot's partner is a full-body human avatar. A vision-language model (Qwen3.5-27B) decides what to do next. A rule-based state engine grounds each decision in the simulation. Because the avatar shares the table, the robot's arm can physically block it.",
      steps: [
        { n: "1", name: "State tracking", who: "State engine", body: "Tracks the task state and lists the subtasks the human can start now, with what still blocks the others. Faults such as a fallen piece become repair subtasks." },
        { n: "2", name: "Decision making", who: "VLM", body: "Reads the camera views, the recipe, the state summary and the dialogue. It starts a subtask, keeps going or waits, and can send the robot a message." },
        { n: "3", name: "Validation & execution", who: "State engine", body: "Checks the decision against the scene and runs it as a whole-body skill with automatic retries. A rejected command goes back to the VLM with the reason." },
      ],
      blocked: "When the robot's arm is in the way, the human pauses, asks the robot to move when communication is on, and gives up the subtask if the arm stays.",
      figure: {
        src: "media/fig-human-sim.webp",
        alt: "Paper Figure 3. One logged Canapé decision of the simulated human. The state engine lists executable and blocked subtasks, the VLM picks the next action from camera views, recipe, state summary and dialogue, and the engine validates and executes it as a whole-body skill.",
        caption: "<b>Figure 3.</b> The adaptive human simulator, shown with one logged Canapé decision.",
      },
    },

    modes: {
      title: "Four evaluation modes",
      lede: "Every agent runs every task in four modes along two axes. The robot's goal and the recipe are the same in all four.",
      rows: [
        { id: "on", name: "Communication on", body: "The partners exchange messages to share plans, make requests and announce subtasks." },
        { id: "off", name: "Communication off", body: "The message channel is closed. The robot must read the human's intent from what it sees." },
      ],
      cols: [
        { id: "free", name: "Latency-free", body: "The simulation pauses while the robot thinks. This isolates decision quality." },
        { id: "aware", name: "Latency-aware", body: "The human keeps working in wall-clock time while the robot thinks, as in the real world." },
      ],
      legend: { act: "acting", think: "thinking", paused: "world paused", msg: "message" },
    },

    metrics: {
      title: "Metrics",
      lede: "Every human–robot team (H-R) is compared with two references run on the same seed: the human alone (H) and two humans (H-H).",
      items: [
        {
          sym: "S", name: "Task efficiency", dir: "higher is better",
          body: "V(s) is the time H would still need from state s, so progress p(t) = 1 − V(s<sub>t</sub>)/V(s<sub>0</sub>) runs from 0 to 1 and drops when work is undone. A team that progresses sooner covers more area under this curve. The horizon T is twice H's completion time.",
          tex: [
            String.raw`S = \frac{\mathrm{AUC} - \mathrm{AUC}_{\text{H}}}{\mathrm{AUC}_{\text{H-H}} - \mathrm{AUC}_{\text{H}}}`,
            String.raw`\mathrm{AUC} = \frac{1}{T}\int_0^{T} p(t)\,dt`,
          ],
          stops: [["S = 1", "as good as two humans", "good"], ["S = 0", "same as the human alone", "mute"], ["S < 0", "less progress than the human alone", "bad"]],
        },
        {
          sym: "B", name: "Human burden", dir: "lower is better",
          body: "The human's active time A plus any unfinished work, divided by the active time of H on the same seed.",
          tex: [String.raw`B = \frac{A + V(s_{\text{end}})}{A_{\text{H}}}`],
          stops: [["B ≈ 0.5", "as with a second human", "good"], ["B < 1", "the robot took work off the human", "good"], ["B = 1", "same work as alone", "mute"], ["B > 1", "the robot added work", "bad"]],
        },
        {
          sym: "W", name: "Human delayed time", dir: "lower is better",
          body: "Time the human loses because of the robot, as a share of H's completion time. Counting stops at the robot's last action.",
          tex: [String.raw`W = W_{\text{blocked}} + W_{\text{waiting}} + W_{\text{fixing}}`],
          parts: [
            ["Blocked", "the robot's arm or a held item is in the human's way"],
            ["Waiting", "the human's next step needs an item the robot holds"],
            ["Fixing", "the human redoes or sets aside the robot's work"],
          ],
        },
      ],
      video: {
        src: "media/metrics-explainer.mp4",
        poster: "media/metrics-explainer.jpg",
        label: "Supplementary video: how progress, task efficiency S, human burden B and human delayed time W are computed for one example episode.",
        caption: "How S, B and W are computed for one episode (supplementary video).",
      },
    },
  },

  results: {
    kicker: "Results",
    claim: "No team beats the human alone on average, and <em>latency widens the gap.</em>",
    lede: "Each point is one agent in one mode, the median over three rollouts. Hollow markers have communication off, filled markers have it on, and a line joins the two. The diamond is the human alone. Two humans score S = 1 and B ≈ 0.5, above the plotted range.",
    agents: [
      { id: "astra", name: "GPT-6 Astra", short: "Astra", color: "#3F6B7A", shape: "circle" },
      { id: "argon", name: "Gemini 4 Argon", short: "Argon", color: "#788B69", shape: "triangle" },
      { id: "opus", name: "Claude Opus 5.5", short: "Opus", color: "#B85C45", shape: "square" },
      { id: "fable", name: "Claude Fable 5.2", short: "Fable", color: "#80647A", shape: "triangle-down" },
    ],
    hhColor: "#3778A0",
    helpShade: "#EEE2E1",
    tabs: [
      ["sandwich", "Sandwich"], ["canape", "Canapé"], ["fruit", "Fruit Skewer"], ["smores", "S'mores"], ["cleanup", "Cleanup"], ["average", "Average"],
    ],
    latency: [["free", "Latency-free"], ["aware", "Latency-aware"]],
    axes: { y: "Task efficiency S ↑", x: "Human burden B ↓" },
    labels: { h: "H (human alone)", help: "robot helps", off: "comm. off", on: "comm. on" },
    tableTitle: "Show the numbers",
    /* [S, B] per task and mode, agents in the order above (median over rollouts; Average = mean over the five tasks). */
    sb: /*@DATA:sb*/{"sandwich":{"free-on":[[-2.75,1.62],[-2.5,1.16],[-1.09,1.07],[-3.18,1.02]],"free-off":[[-2.4,0.92],[-2.8,1.22],[-3.87,1.77],[-2.66,1.34]],"aware-on":[[-5.56,1.58],[-3.4,1.14],[-3.14,1.14],[-6.24,1.53]],"aware-off":[[-4.37,1.25],[-2.71,1.15],[-1.43,1.13],[-4.83,1.5]]},"canape":{"free-on":[[0.08,0.96],[-0.22,1.04],[-0.13,0.99],[-0.94,1.27]],"free-off":[[0.28,0.96],[-0.8,1.3],[-0.25,1.1],[-0.39,1.18]],"aware-on":[[-1.2,1.21],[-0.49,1.06],[-0.55,1.11],[-0.38,1.04]],"aware-off":[[-0.38,1.13],[-0.16,1.06],[-0.92,1.19],[-0.66,1.25]]},"fruit":{"free-on":[[-0.37,1.09],[-0.35,1.04],[-1.06,1.05],[-0.6,1.04]],"free-off":[[-2.02,1.44],[-0.74,1.06],[-1.32,1.03],[-1.67,1.05]],"aware-on":[[-1.25,1.07],[-2.38,1.07],[-1.64,1.03],[-2.73,1.07]],"aware-off":[[-3.58,1.06],[-1.53,1.03],[-5.88,1.2],[-3.83,1.09]]},"smores":{"free-on":[[-0.82,1.1],[-2.15,1.67],[-1.68,1.39],[-1.61,2.1]],"free-off":[[-2.26,1.32],[-1.52,1.54],[-3.31,1.08],[-5.47,1.7]],"aware-on":[[-1.36,1.23],[-0.36,1.02],[-0.81,1.18],[-0.32,0.97]],"aware-off":[[-0.95,1.22],[-0.41,1.05],[-0.77,1.04],[-0.2,0.98]]},"cleanup":{"free-on":[[0.27,0.92],[0.58,0.81],[0.03,0.94],[0.45,0.77]],"free-off":[[-0.11,1.0],[-0.2,1.15],[-1.19,1.49],[-1.12,1.08]],"aware-on":[[-0.59,1.58],[-1.71,1.83],[-0.9,1.55],[-1.52,2.1]],"aware-off":[[-2.94,2.16],[-2.98,2.48],[-1.61,1.99],[-1.65,1.87]]},"average":{"free-on":[[-0.72,1.14],[-0.93,1.14],[-0.79,1.09],[-1.18,1.24]],"free-off":[[-1.3,1.13],[-1.21,1.25],[-1.99,1.29],[-2.26,1.27]],"aware-on":[[-1.99,1.33],[-1.67,1.22],[-1.41,1.2],[-2.24,1.34]],"aware-off":[[-2.45,1.36],[-1.56,1.35],[-2.12,1.31],[-2.23,1.34]]}}/*@END*/,
    /* B of two humans (H-H) per task, for the note under the plot. */
    hhB: /*@DATA:hhb*/{"sandwich": 0.475, "canape": 0.538, "fruit": 0.454, "smores": 0.452, "cleanup": 0.578}/*@END*/,
    sbNote: "Fewer than three rollouts in 11 of the 80 combinations, where an episode stopped early.",

    w: {
      title: "Where the human loses time",
      lede: "Human delayed time W per mode, averaged over agents and tasks, as a share of H's completion time.",
      /* [blocked, waiting, fixing] in % per mode (main-paper Fig. 5). */
      parts: /*@DATA:w*/{"free-on": [15.2, 8.6, 7.8], "free-off": [35.5, 14.5, 7.3], "aware-on": [28.0, 8.8, 1.4], "aware-off": [48.3, 6.9, 2.4]}/*@END*/,
      names: ["Blocked", "Waiting", "Fixing"],
      colors: ["#B8432C", "#E9A23B", "#5B4031"],
      groups: [["Latency-free", [["free-off", "comm. off"], ["free-on", "comm. on"]]], ["Latency-aware", [["aware-off", "comm. off"], ["aware-on", "comm. on"]]]],
      note: "Being blocked by the robot is the largest part in every mode (12–56% of H's time across agents and modes), ahead of waiting (0–21%) and fixing (1–12%).",
    },

    findings: [
      {
        title: "Latency",
        body: "With communication on, latency lowers S for every agent. Across all 40 task combinations it lowers S in 29. At a median of 15.0 s per call, agents decide 2.6–6.1 times per minute instead of about 30. An arm in the human's way stays there until the next decision, so blocked time in Fruit Skewer rises from 39 s to 170 s. Latency-free evaluation therefore overestimates how well a robot collaborates.",
      },
      {
        title: "Communication",
        body: "Without latency, communication raises each agent's five-task mean S and roughly halves the blocked time. The robot almost always moves when asked. With latency, a request waits for the robot's next decision. The robot then ignores 36–63% of move requests, against 0–8% without latency.",
      },
      {
        title: "Tasks, not agents",
        body: "Canapé, where the partners work in parallel, does best (median S = −0.42). Sandwich, with its strict layer order, does worst (S = −3.43). The agents are not reliably distinguishable: the gap between them matches one agent's spread over its own rollouts, so we do not rank them.",
      },
      {
        title: "Where S > 0",
        body: "All six positive combinations are latency-free: Cleanup with communication on for all four agents (S = 0.03 to 0.58, B < 1) and GPT-6 Astra in Canapé (S = 0.08 and 0.28).",
      },
    ],
  },

  failures: {
    kicker: "Failure modes",
    claim: "Failures do not come from one missing skill. <em>They add up in the shared workspace.</em>",
    lede: "Each failure costs the human time. The same three patterns appear in simulation and in the real world.",
    items: [
      {
        id: "manipulation", name: "Imprecise manipulation",
        body: "Agents rarely do the fine work themselves. In Fruit Skewer no agent threads a single piece in 47 episodes. They fetch fruit for the human instead and leave the precise steps to the human.",
        sim: { src: "media/fail-manipulation-sim.mp4", poster: "media/fail-manipulation-sim.jpg", caption: "Canapé, GPT-6 Astra, latency-free, comm. on. Thin ham slips from the gripper (50 s), and a cracker lands on its edge (74 s). The robot asks the human to take over both.", label: "Robot head camera, Canapé: thin ham slips from the robot's gripper and a cracker lands on its edge. 4× speed." },
        real: { src: "media/fail-manipulation-real.webp", caption: "Real world: misplaced items.", alt: "Real-world Canapé trial: both robot arms reach over the plates while the participant adds salmon. Some items lie off the plates." },
      },
      {
        id: "planning", name: "Insufficient planning",
        body: "Agents rarely take work off the human (B < 1 in 36 of 226 episodes). They claim subtasks they finish late, promise work they are too slow to deliver and leave the arm where the human must reach next.",
        sim: { src: "media/fail-planning-sim.mp4", poster: "media/fail-planning-sim.jpg", caption: "Sandwich, Claude Opus 5.5, latency-free, comm. on. The robot takes the ketchup but cannot tip the bottle. The human waits for it.", label: "Robot head camera, Sandwich: the robot holds the ketchup bottle while the human builds the layers. 4× speed." },
        real: { src: "media/fail-planning-real.webp", caption: "Real world: the robot retries blindly instead of asking.", alt: "Real-world Canapé trial: the robot's open gripper hovers over the table while the participant places food." },
      },
      {
        id: "latency", name: "High inference latency",
        body: "The human keeps working while the robot thinks, so the robot acts on an outdated scene. An arm that blocks the human stays put until the next decision.",
        sim: { src: "media/fail-latency-sim.mp4", poster: "media/fail-latency-sim.jpg", caption: "Canapé, Gemini 4 Argon, latency-aware, comm. on. The human asks the robot to move at 27 s and again at 37 s. The robot answers at 40 s.", label: "Robot head camera, Canapé with latency: the robot's arms stay over the plates while the human asks it to move. 4× speed." },
        real: { src: "media/fail-latency-real.webp", caption: "Real world: the robot blocks the human.", alt: "Real-world Canapé trial: the robot's arm reaches across the plates in front of the participant." },
      },
    ],
    clipNote: "Simulation clips: robot head camera at 4× speed, cut from the paper's episodes. The banner shows the simulated time.",
  },

  real: {
    kicker: "Real world",
    claim: "The same robot, interface, prompt and metrics, <em>with a real participant.</em>",
    lede: "We replace the simulated human with a real participant and keep everything else identical. Trials run in the latency-aware mode, as pausing a real person during robot inference is impractical. For safety, participants keep a distance from the robot.",
    setup: {
      src: "media/fig-real-setup.webp",
      alt: "Real-world setup for the S'mores task: a bimanual YAM robot with a head camera and two wrist cameras, a shared workspace with crackers, chocolate, marshmallow skewers and a heater, and the human partner beside the table.",
      caption: "Real-world setup for the S'mores task.",
    },
    pending: {
      tag: "Being updated",
      title: "Real-world results are being updated",
      body: "We are redoing the real-world trials. Their results will appear here with the release.",
    },
    tasksTitle: "Five tasks in the real world",
    tasksNote: "Each real table copies the simulated one with the same objects and a similar layout.",
    clipsTitle: "Earlier real-world footage",
    clipsNote: "Placeholder clips from an earlier trial, shown from the robot's head camera at 32× speed. They will be replaced.",
    clips: [
      { name: "Sandwich", src: "media/real-sandwich.mp4", poster: "media/real-sandwich.jpg" },
      { name: "Canapé", src: "media/real-canape.mp4", poster: "media/real-canape.jpg" },
      { name: "Fruit Skewer", src: "media/real-fruit.mp4", poster: "media/real-fruit.jpg" },
      { name: "Cleanup", src: "media/real-cleanup.mp4", poster: "media/real-cleanup.jpg" },
    ],
  },

  /*
   * Episode gallery. Each card is ONE rollout (not a median). Values: `eps` below, generated from the run tables.
   * Text: from that run's own logs (messages, human skills, blocked time, ignored requests, Fruit audit).
   */
  gallery: {
    kicker: "Episodes",
    claim: "Seventeen episodes across <em>all tasks, agents and modes.</em>",
    lede: "Each card is one rollout from the paper's evaluation, seen through the robot's head camera at 4× speed. S, B and W are that rollout's own values.",
    filters: { all: "All", positive: "S > 0", task: "Task", mode: "Mode" },
    modeNames: { "free-on": "Latency-free · comm. on", "free-off": "Latency-free · comm. off", "aware-on": "Latency-aware · comm. on", "aware-off": "Latency-aware · comm. off" },
    done: "finished", notDone: "time ran out",
    items: [
      { id: "ep-cleanup-free-on-argon-r1", task: "cleanup", agent: "argon", mode: "free-on", text: "The robot takes the near side of the table and moves its arm both times the human asks. The team beats the human alone." },
      { id: "ep-cleanup-free-on-astra-r2", task: "cleanup", agent: "astra", mode: "free-on", text: "The partners agree on a split at the start. The human asks the robot to move four times, and it never ignores a request." },
      { id: "ep-cleanup-free-on-fable-r2", task: "cleanup", agent: "fable", mode: "free-on", text: "The robot asks for help with a plate too wide for its gripper and promises the shared towel after its own spills." },
      { id: "ep-cleanup-free-on-opus-r3", task: "cleanup", agent: "opus", mode: "free-on", text: "A paper cup tips over on the tray and the robot asks the human to bin it. The team ends just above the human alone." },
      { id: "ep-canape-free-on-astra-r2", task: "canape", agent: "astra", mode: "free-on", text: "The robot takes the shrimp and ham-and-cheese canapés. Pieces slip, and the human fixes them." },
      { id: "ep-canape-free-off-astra-r3", task: "canape", agent: "astra", mode: "free-off", text: "Without messages, both partners build at their own stations. S is above zero, yet the human still spends time fixing the robot's layers." },
      { id: "ep-fruit-free-on-astra-r1", task: "fruit", agent: "astra", mode: "free-on", text: "The robot offers to fetch fruit while the human threads. It brings pieces to the human's board but threads none." },
      { id: "ep-fruit-aware-on-argon-r1", task: "fruit", agent: "argon", mode: "aware-on", text: "Each decision takes 51 s on average. The human asks again and again for room, and the arm blocks the human for 198 s." },
      { id: "ep-fruit-aware-off-opus-r1", task: "fruit", agent: "opus", mode: "aware-off", text: "Without messages, the arm blocks the human for 294 s. Only one skewer is served before time runs out." },
      { id: "ep-sandwich-aware-on-fable-r3", task: "sandwich", agent: "fable", mode: "aware-on", text: "The robot's first message comes at 43 s. It claims the fillings, then hands them back, and the sandwich is not finished." },
      { id: "ep-sandwich-free-off-astra-r1", task: "sandwich", agent: "astra", mode: "free-off", text: "The arm blocks the human for 51 s. The human gives up two subtasks and the sandwich is not finished." },
      { id: "ep-sandwich-free-on-opus-r3", task: "sandwich", agent: "opus", mode: "free-on", text: "The robot takes the ketchup but cannot squeeze it. The human waits for the bottle and builds every layer." },
      { id: "ep-smores-aware-off-fable-r2", task: "smores", agent: "fable", mode: "aware-off", text: "The slow robot barely acts. The human completes all 18 subtasks alone." },
      { id: "ep-smores-free-off-fable-r2", task: "smores", agent: "fable", mode: "free-off", text: "The robot holds items the human needs next. The human waits, and the s'mores are not done in time." },
      { id: "ep-smores-free-on-astra-r1", task: "smores", agent: "astra", mode: "free-on", text: "One of the few single episodes above zero. The robot takes enough work to bring B down to 0.68. The median of this combination stays below zero." },
      { id: "ep-canape-aware-on-opus-r2", task: "canape", agent: "opus", mode: "aware-on", text: "The robot drops a herb cheese and keeps its arm over the plates. Two of four move requests go unanswered and time runs out." },
      { id: "ep-cleanup-aware-off-argon-r3", task: "cleanup", agent: "argon", mode: "aware-off", text: "With latency and no messages, the arm blocks the human for 358 s. The table is not clean when time runs out." },
    ],
    /* Per-episode S, B, W (% of H's time), finished flag and simulated seconds. */
    eps: /*@DATA:eps*/{
 "ep-cleanup-free-on-argon-r1": {
  "run": "final-cleanup-latency-free-talk-argon-r1-367480",
  "S": 0.58,
  "B": 0.81,
  "W": 13,
  "done": true,
  "sim": 216
 },
 "ep-cleanup-free-on-astra-r2": {
  "run": "final-cleanup-latency-free-talk-astra-r2-362921",
  "S": 0.27,
  "B": 0.92,
  "W": 14,
  "done": true,
  "sim": 232
 },
 "ep-cleanup-free-on-fable-r2": {
  "run": "final-cleanup-latency-free-talk-fable-5.2-r2-368100",
  "S": 0.45,
  "B": 0.77,
  "W": 11,
  "done": true,
  "sim": 195
 },
 "ep-cleanup-free-on-opus-r3": {
  "run": "final-cleanup-latency-free-talk-opus-5.5-r3-367503",
  "S": 0.03,
  "B": 0.93,
  "W": 11,
  "done": true,
  "sim": 252
 },
 "ep-canape-free-on-astra-r2": {
  "run": "final-canape-latency-free-talk-astra-r2-362942",
  "S": 0.08,
  "B": 0.96,
  "W": 27,
  "done": true,
  "sim": 111
 },
 "ep-canape-free-off-astra-r3": {
  "run": "final-canape-latency-free-silent-astra-r3-367550",
  "S": 0.28,
  "B": 1.03,
  "W": 29,
  "done": true,
  "sim": 109
 },
 "ep-fruit-free-on-astra-r1": {
  "run": "final-fruit-skewer-latency-free-talk-astra-r1-362931",
  "S": -0.37,
  "B": 1.09,
  "W": 11,
  "done": true,
  "sim": 249
 },
 "ep-fruit-aware-on-argon-r1": {
  "run": "final-fruit-skewer-latency-aware-talk-argon-r1-363038",
  "S": -3.02,
  "B": 1.03,
  "W": 98,
  "done": true,
  "sim": 423
 },
 "ep-fruit-aware-off-opus-r1": {
  "run": "final-fruit-skewer-latency-aware-silent-opus-5.5-r1-363016",
  "S": -6.65,
  "B": 1.2,
  "W": 161,
  "done": false,
  "sim": 430
 },
 "ep-sandwich-aware-on-fable-r3": {
  "run": "final-sandwich-latency-aware-talk-fable-5.2-r3-368054",
  "S": -6.7,
  "B": 1.53,
  "W": 18,
  "done": false,
  "sim": 159
 },
 "ep-sandwich-free-off-astra-r1": {
  "run": "final-sandwich-latency-free-silent-astra-r1-363068",
  "S": -9.14,
  "B": 1.49,
  "W": 66,
  "done": false,
  "sim": 159
 },
 "ep-sandwich-free-on-opus-r3": {
  "run": "final-sandwich-latency-free-talk-opus-5.5-r3-367516",
  "S": -0.95,
  "B": 1.04,
  "W": 15,
  "done": true,
  "sim": 91
 },
 "ep-smores-aware-off-fable-r2": {
  "run": "final-smores-latency-aware-silent-fable-5.2-r2-368041",
  "S": -0.12,
  "B": 0.91,
  "W": 0,
  "done": true,
  "sim": 131
 },
 "ep-smores-free-off-fable-r2": {
  "run": "final-smores-latency-free-silent-fable-5.2-r2-368032",
  "S": -5.47,
  "B": 1.7,
  "W": 142,
  "done": false,
  "sim": 222
 },
 "ep-smores-free-on-astra-r1": {
  "run": "final-smores-latency-free-talk-astra-r1-362933",
  "S": 0.03,
  "B": 0.68,
  "W": 16,
  "done": true,
  "sim": 134
 },
 "ep-canape-aware-on-opus-r2": {
  "run": "final-canape-latency-aware-talk-opus-5.5-r2-362995",
  "S": -1.21,
  "B": 1.09,
  "W": 103,
  "done": false,
  "sim": 213
 },
 "ep-cleanup-aware-off-argon-r3": {
  "run": "final-cleanup-latency-aware-silent-argon-r3-367525",
  "S": -4.44,
  "B": 2.77,
  "W": 72,
  "done": false,
  "sim": 502
 }
}/*@END*/,
  },

  resources: {
    kicker: "Resources",
    claim: "Paper, code, simulation environments and evaluation protocols <em>will be released.</em>",
    links: [
      { label: "Paper", note: "PDF", href: null },
      { label: "arXiv", note: "Preprint", href: null },
      { label: "Code", note: "Benchmark and agents", href: null },
      { label: "Data", note: "Episodes and logs", href: null },
      { label: "Video", note: "Overview", href: null },
      { label: "Supplementary", note: "Videos and details", href: null },
    ],
    bibtitle: "BibTeX",
    bibtex: "BibTeX will be available with the arXiv release.",
    footer: "COOK·E · COllaborative Open Kitchen-Evaluation. Authors withheld until release.",
  },
};
