# Flow experiments

One row per experiment receipt. Counts only: no input value, no draft, no prompt. The numbers come from result files
in the private demo repo at the sha given in each file, where `node experiments/check.js` re-derives them.

| date | question | number | file |
|---|---|---|---|
| 2026-11-08 | 00-real-drafts: sentences that pass the checks when a real model writes the one model step (template baseline; the model runs are pending) | template 147/155 sentences pass; 27.1 handoffs per 100 rows; predicted: local gemma4-e2b-ctx16k 77/155, hosted Haiku 5.5 124/155 | [00-real-drafts-2026-11-08.json](00-real-drafts-2026-11-08.json) |
| 2026-11-08 | 01-planted-faults: of faults planted into sentences that pass the checks (8 types, 147 sentences, 9 flows), which share do the seven checks catch? | 571/905 caught (63.1 %); figure-changed 93 %, figure-invented 95.9 %, actor-swapped 100 % (10 cases), language-switched 100 %, judgement-added 55.1 %, reason-invented 44.9 %, date-shifted 5.3 %, item-dropped 0 %; predicted overall ≈ 60 %, item-dropped least | [planted-faults-2026-11-08.json](planted-faults-2026-11-08.json) |
| 2026-11-09 | Do Haiku 5.5's sentences pass the nine demo flows' checks (hosted, 3 passes)? | 82, 86, 80 of 155 (template 147; predicted 124, refuted) | [hosted-haiku-5-5-2026-11-09.json](hosted-haiku-5-5-2026-11-09.json) |
