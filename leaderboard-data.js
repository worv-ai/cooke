/*
 * Leaderboard data (leaderboard.html, leaderboard.js). Copied unchanged from content.js on cjh/updates
 * (leaderboard, results.agents, results.sb, results.hhB, results.sbNote, benchmark.tasks, gallery.modeNames), where
 * the numbers are checked against the paper's facts.json. sb[task][mode][agent] is [S, B], the median over three
 * rollouts; sb.average is the five-task mean. Update both files together if the numbers change. The per-rollout
 * values (paper set, API) are in leaderboard-rollouts.js; the medians and the copy were checked against them on 2026-11-20.
 */
window.LEADERBOARD = {
  "copy": {
    "title": "COOK·E Leaderboard",
    "kicker": "Leaderboard",
    "claim": "Every agent on every task, in each of the four modes. <em>On the five-task mean, no agent beats a human working alone yet.</em>",
    "lede": "S is task efficiency on a scale where the human alone scores 0 and two humans score 1. B is the human's burden, where the human alone scores 1. Each value is the median over three rollouts, with the lowest and highest rollout below it; the mean columns average the five tasks.",
    "rolloutsTitle": "Each rollout",
    "oneRollout": "one rollout",
    "modeLabel": "Mode",
    "metricLabel": "Task columns",
    "metrics": [
      [
        "S",
        "Task efficiency S"
      ],
      [
        "B",
        "Human burden B"
      ]
    ],
    "defaultMode": "aware-on",
    "cols": {
      "agent": "Agent",
      "s": "S, mean",
      "b": "B, mean"
    },
    "sortHint": "Sort by this column",
    "refs": {
      "title": "References",
      "hh": "Two humans (H-H)",
      "h": "Human alone (H)"
    },
    "order": "Rows follow the paper's agent order until you sort a column. The gap between agents matches the spread of one agent over its own rollouts, so no order here is a ranking.",
    "refNote": "The references set the scale: two humans score S = 1 and the human alone S = 0 and B = 1.",
    "submit": {
      "title": "Submit an agent",
      "body": "How to evaluate a new agent with the simulated human and submit its results will be posted here with the code release."
    }
  },
  "pending": "At release",
  "agents": [
    {
      "id": "astra",
      "name": "GPT-6 Astra",
      "short": "Astra",
      "color": "#3F6B7A",
      "shape": "circle"
    },
    {
      "id": "argon",
      "name": "Gemini 4 Argon",
      "short": "Argon",
      "color": "#788B69",
      "shape": "triangle"
    },
    {
      "id": "opus",
      "name": "Claude Opus 5.5",
      "short": "Opus",
      "color": "#B85C45",
      "shape": "square"
    },
    {
      "id": "fable",
      "name": "Claude Fable 5.2",
      "short": "Fable",
      "color": "#80647A",
      "shape": "triangle-down"
    }
  ],
  "tasks": [
    {
      "id": "sandwich",
      "name": "Sandwich"
    },
    {
      "id": "canape",
      "name": "Canapé"
    },
    {
      "id": "fruit",
      "name": "Fruit Skewer"
    },
    {
      "id": "smores",
      "name": "S'mores"
    },
    {
      "id": "cleanup",
      "name": "Cleanup"
    }
  ],
  "modeNames": {
    "free-on": "Latency-free · comm. on",
    "free-off": "Latency-free · comm. off",
    "aware-on": "Latency-aware · comm. on",
    "aware-off": "Latency-aware · comm. off"
  },
  "sb": {
    "sandwich": {
      "free-on": [
        [
          -2.75,
          1.62
        ],
        [
          -2.5,
          1.16
        ],
        [
          -1.09,
          1.07
        ],
        [
          -3.18,
          1.02
        ]
      ],
      "free-off": [
        [
          -2.4,
          0.92
        ],
        [
          -2.8,
          1.22
        ],
        [
          -3.87,
          1.77
        ],
        [
          -2.66,
          1.34
        ]
      ],
      "aware-on": [
        [
          -5.56,
          1.58
        ],
        [
          -3.4,
          1.14
        ],
        [
          -3.14,
          1.14
        ],
        [
          -6.24,
          1.53
        ]
      ],
      "aware-off": [
        [
          -4.37,
          1.25
        ],
        [
          -2.71,
          1.15
        ],
        [
          -1.43,
          1.13
        ],
        [
          -4.83,
          1.5
        ]
      ]
    },
    "canape": {
      "free-on": [
        [
          0.08,
          0.96
        ],
        [
          -0.22,
          1.04
        ],
        [
          -0.13,
          0.99
        ],
        [
          -0.94,
          1.27
        ]
      ],
      "free-off": [
        [
          0.28,
          0.96
        ],
        [
          -0.8,
          1.3
        ],
        [
          -0.25,
          1.1
        ],
        [
          -0.39,
          1.18
        ]
      ],
      "aware-on": [
        [
          -1.2,
          1.21
        ],
        [
          -0.49,
          1.06
        ],
        [
          -0.55,
          1.11
        ],
        [
          -0.38,
          1.04
        ]
      ],
      "aware-off": [
        [
          -0.38,
          1.13
        ],
        [
          -0.16,
          1.06
        ],
        [
          -0.92,
          1.19
        ],
        [
          -0.66,
          1.25
        ]
      ]
    },
    "fruit": {
      "free-on": [
        [
          -0.37,
          1.09
        ],
        [
          -0.35,
          1.04
        ],
        [
          -1.06,
          1.05
        ],
        [
          -0.6,
          1.04
        ]
      ],
      "free-off": [
        [
          -2.02,
          1.44
        ],
        [
          -0.74,
          1.06
        ],
        [
          -1.32,
          1.03
        ],
        [
          -1.67,
          1.05
        ]
      ],
      "aware-on": [
        [
          -1.25,
          1.07
        ],
        [
          -2.38,
          1.07
        ],
        [
          -1.64,
          1.03
        ],
        [
          -2.73,
          1.07
        ]
      ],
      "aware-off": [
        [
          -3.58,
          1.06
        ],
        [
          -1.53,
          1.03
        ],
        [
          -5.88,
          1.2
        ],
        [
          -3.83,
          1.09
        ]
      ]
    },
    "smores": {
      "free-on": [
        [
          -0.82,
          1.1
        ],
        [
          -2.15,
          1.67
        ],
        [
          -1.68,
          1.39
        ],
        [
          -1.61,
          2.1
        ]
      ],
      "free-off": [
        [
          -2.26,
          1.32
        ],
        [
          -1.52,
          1.54
        ],
        [
          -3.31,
          1.08
        ],
        [
          -5.47,
          1.7
        ]
      ],
      "aware-on": [
        [
          -1.36,
          1.23
        ],
        [
          -0.36,
          1.02
        ],
        [
          -0.81,
          1.18
        ],
        [
          -0.32,
          0.97
        ]
      ],
      "aware-off": [
        [
          -0.95,
          1.22
        ],
        [
          -0.41,
          1.05
        ],
        [
          -0.77,
          1.04
        ],
        [
          -0.2,
          0.98
        ]
      ]
    },
    "cleanup": {
      "free-on": [
        [
          0.27,
          0.92
        ],
        [
          0.58,
          0.81
        ],
        [
          0.03,
          0.94
        ],
        [
          0.45,
          0.77
        ]
      ],
      "free-off": [
        [
          -0.11,
          1
        ],
        [
          -0.2,
          1.15
        ],
        [
          -1.19,
          1.49
        ],
        [
          -1.12,
          1.08
        ]
      ],
      "aware-on": [
        [
          -0.59,
          1.58
        ],
        [
          -1.71,
          1.83
        ],
        [
          -0.9,
          1.55
        ],
        [
          -1.52,
          2.1
        ]
      ],
      "aware-off": [
        [
          -2.94,
          2.16
        ],
        [
          -2.98,
          2.48
        ],
        [
          -1.61,
          1.99
        ],
        [
          -1.65,
          1.87
        ]
      ]
    },
    "average": {
      "free-on": [
        [
          -0.72,
          1.14
        ],
        [
          -0.93,
          1.14
        ],
        [
          -0.79,
          1.09
        ],
        [
          -1.18,
          1.24
        ]
      ],
      "free-off": [
        [
          -1.3,
          1.13
        ],
        [
          -1.21,
          1.25
        ],
        [
          -1.99,
          1.29
        ],
        [
          -2.26,
          1.27
        ]
      ],
      "aware-on": [
        [
          -1.99,
          1.33
        ],
        [
          -1.67,
          1.22
        ],
        [
          -1.41,
          1.2
        ],
        [
          -2.24,
          1.34
        ]
      ],
      "aware-off": [
        [
          -2.45,
          1.36
        ],
        [
          -1.56,
          1.35
        ],
        [
          -2.12,
          1.31
        ],
        [
          -2.23,
          1.34
        ]
      ]
    }
  },
  "hhB": {
    "sandwich": 0.475,
    "canape": 0.538,
    "fruit": 0.454,
    "smores": 0.452,
    "cleanup": 0.578
  },
  "sbNote": "Fewer than three rollouts in 11 of the 80 combinations, where an episode stopped early."
};
