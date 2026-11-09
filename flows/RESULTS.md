# Flow experiments

One row per experiment receipt. Counts only: no input value, no draft, no prompt. The numbers come from result files
in the private demo repo at the sha given in each file, where `node experiments/check.js` re-derives them.

| date | question | number | file |
|---|---|---|---|
| 2026-11-08 | 00-real-drafts: sentences that pass the checks when a real model writes the one model step (template baseline; the model runs are pending) | template 147/155 sentences pass; 27.1 handoffs per 100 rows; predicted: local gemma4-e2b-ctx16k 77/155, hosted Haiku 5.5 124/155 | [00-real-drafts-2026-11-08.json](00-real-drafts-2026-11-08.json) |
