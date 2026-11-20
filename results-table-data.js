/*
 * 04 Results table: median S, B and W per agent, latency and communication mode, pooled over the tasks in `tasks`.
 * Generated from the COOK-E H-R results page (API rerun on the fixed code, and the VLA pilot runs) on 2026-11-20.
 * `pending` tasks have no rerun results yet; rows with `pending: true` are still running. Regenerate, do not edit.
 */
window.RESULTS_TABLE = {
 "tasks": [
  "sandwich",
  "canape",
  "fruit-skewer",
  "smores"
 ],
 "pending": [
  "Cleanup"
 ],
 "groups": [
  {
   "id": "agents",
   "name": "Generalist agents · API rerun, fixed code",
   "rows": [
    {
     "id": "astra",
     "name": "GPT-6 Astra",
     "pending": false,
     "cells": {
      "free-off": [
       -0.89,
       1.28,
       0.65,
       20
      ],
      "free-on": [
       -0.95,
       1.06,
       0.34,
       20
      ],
      "aware-off": [
       -1.32,
       1.12,
       0.36,
       20
      ],
      "aware-on": [
       -1.57,
       1.16,
       0.49,
       20
      ]
     }
    },
    {
     "id": "argon",
     "name": "Gemini 4 Argon",
     "pending": false,
     "cells": {
      "free-off": [
       -1.73,
       1.19,
       0.5,
       20
      ],
      "free-on": [
       -1.0,
       1.16,
       0.4,
       20
      ],
      "aware-off": [
       -0.48,
       1.07,
       0.01,
       20
      ],
      "aware-on": [
       -0.36,
       1.07,
       0.08,
       20
      ]
     }
    },
    {
     "id": "opus-5.5",
     "name": "Claude Opus 5.5",
     "pending": false,
     "cells": {
      "free-off": [
       -1.24,
       1.17,
       0.57,
       20
      ],
      "free-on": [
       -0.87,
       1.15,
       0.3,
       20
      ],
      "aware-off": [
       -0.96,
       1.14,
       0.52,
       20
      ],
      "aware-on": [
       -0.95,
       1.12,
       0.24,
       20
      ]
     }
    },
    {
     "id": "fable-5.2",
     "name": "Claude Fable 5.2",
     "pending": false,
     "cells": {
      "free-off": [
       -2.2,
       1.26,
       0.75,
       20
      ],
      "free-on": [
       -1.29,
       1.07,
       0.51,
       20
      ],
      "aware-off": [
       -0.31,
       1.06,
       0.01,
       20
      ],
      "aware-on": [
       -0.71,
       1.05,
       0.24,
       20
      ]
     }
    }
   ]
  },
  {
   "id": "vla",
   "name": "VLA policies",
   "rows": [
    {
     "id": "molmoact2",
     "name": "MolmoAct 2",
     "pending": false,
     "cells": {
      "free-off": [
       -1.31,
       1.2,
       0.35,
       12
      ],
      "free-on": null,
      "aware-off": [
       -2.18,
       1.17,
       0.63,
       12
      ],
      "aware-on": null
     }
    },
    {
     "id": "molmoact2+astra",
     "name": "MolmoAct 2 + GPT-6 Astra",
     "pending": false,
     "cells": {
      "free-off": [
       -0.34,
       1.04,
       0.02,
       12
      ],
      "free-on": [
       -0.83,
       1.05,
       0.01,
       12
      ],
      "aware-off": [
       -0.34,
       1.03,
       0.01,
       12
      ],
      "aware-on": [
       -0.42,
       1.06,
       0.03,
       12
      ]
     }
    },
    {
     "id": "molmoact2+argon",
     "name": "MolmoAct 2 + Gemini 4 Argon",
     "pending": false,
     "cells": {
      "free-off": [
       -0.67,
       1.06,
       0.14,
       12
      ],
      "free-on": [
       -0.63,
       1.08,
       0.06,
       12
      ],
      "aware-off": [
       -0.18,
       1.02,
       0.0,
       12
      ],
      "aware-on": [
       -0.41,
       1.08,
       0.0,
       12
      ]
     }
    },
    {
     "id": "molmoact2+se",
     "name": "MolmoAct 2 + state engine (oracle plan)",
     "pending": false,
     "cells": {
      "free-off": [
       -2.07,
       1.13,
       0.73,
       12
      ],
      "free-on": null,
      "aware-off": [
       -4.39,
       1.16,
       1.15,
       12
      ],
      "aware-on": null
     }
    },
    {
     "id": "molmoact2+seq",
     "name": "MolmoAct 2 + state engine + Qwen",
     "pending": true,
     "cells": {
      "free-off": null,
      "free-on": null,
      "aware-off": null,
      "aware-on": null
     }
    },
    {
     "id": "pi05",
     "name": "π0.5",
     "pending": false,
     "cells": {
      "free-off": [
       -0.1,
       1.0,
       0.0,
       12
      ],
      "free-on": null,
      "aware-off": [
       -0.12,
       1.02,
       0.0,
       12
      ],
      "aware-on": null
     }
    },
    {
     "id": "pi05+astra",
     "name": "π0.5 + GPT-6 Astra",
     "pending": false,
     "cells": {
      "free-off": [
       -0.16,
       1.03,
       0.0,
       12
      ],
      "free-on": [
       -0.25,
       1.04,
       0.0,
       12
      ],
      "aware-off": [
       -0.12,
       1.02,
       0.0,
       12
      ],
      "aware-on": [
       -0.41,
       1.02,
       0.0,
       12
      ]
     }
    },
    {
     "id": "pi05+argon",
     "name": "π0.5 + Gemini 4 Argon",
     "pending": false,
     "cells": {
      "free-off": [
       -0.17,
       1.01,
       0.0,
       11
      ],
      "free-on": [
       -0.19,
       1.03,
       0.0,
       11
      ],
      "aware-off": [
       -0.15,
       1.02,
       0.0,
       12
      ],
      "aware-on": [
       -0.28,
       1.04,
       0.0,
       12
      ]
     }
    }
   ]
  }
 ],
 "hhB": 0.46,
 "source": {
  "rerun": "11/20 01:34 · 29f873466",
  "vla": "MolmoAct 2 11/19 02:15 / π0.5 11/20 01:38 / MolmoAct 2 + SE + Qwen 11/20 01:34"
 }
};
