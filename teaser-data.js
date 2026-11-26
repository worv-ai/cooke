/*
 * Copy and media for the interactive Figure 1 (teaser.js), the band between the hero and the demo video.
 * Copied from content.js on cjh/updates (overview.teaser, overview.figure1, benchmark.tasks/human/modes,
 * results.latency/axes/labels, failures.items); media in media/figure1/ come from the same branch.
 * The agents and the S/B numbers in panel (e) are not repeated here: teaser.js reads them from leaderboard-data.js.
 */
window.TEASER_DATA = {
  "teaser": {
    "src": "media/figure1/fig-teaser.webp",
    "alt": "Paper Figure 1. (a) Five collaborative tasks: Sandwich, Canapé, Fruit Skewer, S'mores and Cleanup, plus a real-world photo. (b) Dynamic subtask allocation in a Sandwich episode. (c) The adaptive human partner: state tracking, decision making, validation and execution. (d) The four evaluation settings, latency-free or latency-aware with communication on or off. (e) Main result: with latency, no agent beats a human working alone. (f) The same failures in simulation and the real world: misplaced items, retries without asking and a robot that blocks the human.",
    "caption": "<b>Figure 1.</b> COOK·E comprises five long-horizon collaborative kitchen tasks (a), in which robots allocate subtasks at run time (b) with an adaptive human partner (c). Four evaluation modes vary inference latency and communication (d). Frontier embodied agents do not yet outperform a human working alone on average (e), with the same failures in simulation and the real world (f)."
  },
  "figure1": {
    "label": "Figure 1 view",
    "views": [
      [
        "live",
        "Interactive"
      ],
      [
        "paper",
        "Paper figure"
      ]
    ],
    "realToggle": "Real world",
    "pause": "Pause motion",
    "play": "Play motion",
    "a": {
      "title": "Five Collaborative Tasks",
      "label": "Tasks",
      "solo": "human alone",
      "realNote": "real table shown",
      "real": {
        "name": "Real world",
        "tag": "real robot",
        "badge": "REAL",
        "src": "media/figure1/task-canape-real.webp"
      }
    },
    "b": {
      "title": "Dynamic Subtask Allocation",
      "allocTitle": "Who takes it",
      "owners": {
        "robot": "Robot",
        "ask": "Robot asks the human",
        "human": "Human"
      },
      "steps": [
        {
          "who": "robot",
          "name": "Robot",
          "t": "0:00",
          "quote": "… I will get the two pickles and the sliced tomato ready.",
          "src": "media/figure1/fig1-alloc-1.webp",
          "real": "media/figure1/fig1-alloc-1-real.webp"
        },
        {
          "who": "robot",
          "name": "Robot",
          "t": "0:23",
          "quote": "… could you grab a tomato slice … since it is too wide for my gripper?",
          "src": "media/figure1/fig1-alloc-2.webp",
          "real": "media/figure1/fig1-alloc-2-real.webp"
        },
        {
          "who": "human",
          "name": "Human",
          "t": "0:26",
          "quote": "Okay, I'll get the tomato slice now.",
          "src": "media/figure1/fig1-alloc-3.webp",
          "real": "media/figure1/fig1-alloc-3-real.webp"
        }
      ],
      "items": [
        {
          "name": "Two pickles",
          "owners": [
            "robot",
            "robot",
            "robot"
          ]
        },
        {
          "name": "Tomato slice",
          "owners": [
            "robot",
            "ask",
            "human"
          ]
        }
      ]
    },
    "c": {
      "title": "Adaptive Human Partner",
      "src": "media/figure1/fig1-human.webp",
      "alt": "The simulated human at the Fruit Skewer table, threading fruit onto a skewer beside the robot arm.",
      "names": [
        "State Tracking",
        "Decision Making",
        "Validation & Execution"
      ],
      "short": [
        "task state, executable subtasks",
        "selects the next subtask",
        "checks, runs skills, recovers"
      ],
      "examples": [
        "skewer 2: strawberry on → kiwi next",
        "→ thread kiwi onto skewer 2"
      ],
      "chain": [
        "pick",
        "carry",
        "thread",
        "release"
      ]
    },
    "d": {
      "title": "Evaluation Settings",
      "rows": {
        "on": "Comm. on",
        "off": "Comm. off"
      }
    },
    "e": {
      "title": "Main Results",
      "claim": {
        "aware": "<em>With latency,</em> no agent beats a human working alone",
        "free": "<em>Even without latency,</em> no agent beats a human working alone"
      },
      "sub": "mean over the five tasks",
      "alone": "human-alone"
    },
    "f": {
      "title": "Sim-to-Real Failure Consistency",
      "sim": "Sim",
      "real": "Real",
      "marks": [
        "misplaced items",
        "retries blindly",
        "blocks the human"
      ]
    },
    "skills": [
      [
        "Manipulation",
        "Shared workspace"
      ],
      [
        "Planning",
        "Subtask allocation"
      ],
      [
        "Communication",
        "Action coordination"
      ],
      [
        "Latency",
        "Real-time response"
      ]
    ]
  },
  "benchmark": {
    "tasks": [
      {
        "name": "Sandwich",
        "tag": "Sequential",
        "sim": "media/figure1/task-sandwich-sim.webp",
        "real": "media/figure1/task-sandwich-real.webp",
        "challenge": "Sequential collaboration",
        "subtasks": 7,
        "solo": "79.6 s",
        "line": "Make one sandwich on toasted brown bread in a fixed layer order. Each layer can only go on the one below."
      },
      {
        "name": "Canapé",
        "tag": "Parallel",
        "sim": "media/figure1/task-canape-sim.webp",
        "real": "media/figure1/task-canape-real.webp",
        "challenge": "Parallel collaboration",
        "subtasks": 18,
        "solo": "106.3 s",
        "line": "Make six canapés of three kinds on three shared plates. Each partner builds from its own station, in any order."
      },
      {
        "name": "Fruit Skewer",
        "tag": "Precision",
        "sim": "media/figure1/task-fruit-sim.webp",
        "real": "media/figure1/task-fruit-real.webp",
        "challenge": "Fine-grained manipulation",
        "subtasks": 20,
        "solo": "214.3 s",
        "line": "Make four fruit skewers of two kinds and serve them. Threading a small piece onto a thin stick needs precise control."
      },
      {
        "name": "S'mores",
        "tag": "Timing",
        "sim": "media/figure1/task-smores-sim.webp",
        "real": "media/figure1/task-smores-real.webp",
        "challenge": "Time-dependent constraint",
        "subtasks": 18,
        "solo": "111.1 s",
        "line": "Make three s'mores. Marshmallows toast in a shared heater and must come off after 40 s and before 70 s, when they fall."
      },
      {
        "name": "Cleanup",
        "tag": "Sharing",
        "sim": "media/figure1/task-cleanup-sim.webp",
        "real": "media/figure1/task-cleanup-real.webp",
        "challenge": "Shared-resource constraint",
        "subtasks": 22,
        "solo": "251.1 s",
        "line": "Clear the table after a meal by house rules. One towel and one bin are shared, and the robot reaches only its side."
      }
    ],
    "human": {
      "steps": [
        {
          "n": "1",
          "name": "State tracking",
          "who": "State engine",
          "body": "Tracks the task state and lists the subtasks the human can start now, with what still blocks the others. Faults such as a fallen piece become repair subtasks."
        },
        {
          "n": "2",
          "name": "Decision making",
          "who": "VLM",
          "body": "Reads the camera views, the recipe, the state summary and the dialogue. It starts a subtask, keeps going or waits, and can send the robot a message."
        },
        {
          "n": "3",
          "name": "Validation & execution",
          "who": "State engine",
          "body": "Checks the decision against the scene and runs it as a whole-body skill with automatic retries. A rejected command goes back to the VLM with the reason."
        }
      ]
    },
    "modes": {
      "title": "Four evaluation modes",
      "lede": "Each task runs in all four modes. The goal and the recipe don't change between them.",
      "rows": [
        {
          "id": "on",
          "name": "Communication on",
          "body": "The robot and the human can send each other text messages."
        },
        {
          "id": "off",
          "name": "Communication off",
          "body": "No messages. The robot has to work out what the human is doing by watching."
        }
      ],
      "cols": [
        {
          "id": "free",
          "name": "Latency-free",
          "body": "The simulation stops while the robot's model is thinking, so a slow model isn't penalized."
        },
        {
          "id": "aware",
          "name": "Latency-aware",
          "body": "The human keeps working while the robot's model is thinking, as in a real kitchen."
        }
      ],
      "legend": {
        "act": "acting",
        "think": "thinking",
        "paused": "world paused",
        "msg": "message"
      }
    }
  },
  "results": {
    "latency": [
      [
        "free",
        "Latency-free"
      ],
      [
        "aware",
        "Latency-aware"
      ]
    ],
    "axes": {
      "y": "Task efficiency S ↑",
      "x": "Human burden B ↓"
    },
    "labels": {
      "h": "H (human alone)",
      "help": "robot helps",
      "off": "comm. off",
      "on": "comm. on"
    }
  },
  "failures": {
    "items": [
      {
        "id": "manipulation",
        "name": "Imprecise manipulation",
        "body": "Agents rarely do the fine work themselves. In Fruit Skewer no agent threads a single piece in 47 episodes. They fetch fruit for the human instead and leave the precise steps to the human.",
        "sim": {
          "src": "media/figure1/fail-manipulation-sim.mp4",
          "poster": "media/figure1/fail-manipulation-sim.jpg",
          "caption": "Canapé, GPT-6 Astra, latency-free, comm. on. Thin ham slips from the gripper (50 s), and a cracker lands on its edge (74 s). The robot asks the human to take over both.",
          "label": "Robot head camera, Canapé: thin ham slips from the robot's gripper and a cracker lands on its edge. 4× speed."
        },
        "real": {
          "src": "media/figure1/fail-manipulation-real.webp",
          "caption": "Real world: misplaced items.",
          "alt": "Real-world Canapé trial: both robot arms reach over the plates while the participant adds salmon. Some items lie off the plates."
        }
      },
      {
        "id": "planning",
        "name": "Insufficient planning",
        "body": "Agents rarely take work off the human (B < 1 in 36 of 226 episodes). They claim subtasks they finish late, promise work they are too slow to deliver and leave the arm where the human must reach next.",
        "sim": {
          "src": "media/figure1/fail-planning-sim.mp4",
          "poster": "media/figure1/fail-planning-sim.jpg",
          "caption": "Sandwich, Claude Opus 5.5, latency-free, comm. on. The robot takes the ketchup but cannot tip the bottle. The human waits for it.",
          "label": "Robot head camera, Sandwich: the robot holds the ketchup bottle while the human builds the layers. 4× speed."
        },
        "real": {
          "src": "media/figure1/fail-planning-real.webp",
          "caption": "Real world: the robot retries blindly instead of asking.",
          "alt": "Real-world Canapé trial: the robot's open gripper hovers over the table while the participant places food."
        }
      },
      {
        "id": "latency",
        "name": "High inference latency",
        "body": "The human keeps working while the robot thinks, so the robot acts on an outdated scene. An arm that blocks the human stays put until the next decision.",
        "sim": {
          "src": "media/figure1/fail-latency-sim.mp4",
          "poster": "media/figure1/fail-latency-sim.jpg",
          "caption": "Canapé, Gemini 4 Argon, latency-aware, comm. on. The human asks the robot to move at 27 s and again at 37 s. The robot answers at 40 s.",
          "label": "Robot head camera, Canapé with latency: the robot's arms stay over the plates while the human asks it to move. 4× speed."
        },
        "real": {
          "src": "media/figure1/fail-latency-real.webp",
          "caption": "Real world: the robot blocks the human.",
          "alt": "Real-world Canapé trial: the robot's arm reaches across the plates in front of the participant."
        }
      }
    ]
  }
};
