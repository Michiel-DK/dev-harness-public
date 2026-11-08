# Flow replays

Receipts from replaying the demo business flows (built on invented inputs, no client's) offline from their saved inputs.
One file per replay day, written by `scripts/fetch-demos-data.mjs` in the site repo from the private demo repo at the
`source.sha` inside. Counts only: per flow the spec name, access class (A the tool has the node or does it natively,
B a known API, C scoped until the API is seen), check cases, the replay's `PASS n/m` line (n sentences that pass all seven
checks out of m drafted or due; a row whose source returned nothing is counted as not drafted and goes out as plain
figures with n/a), and the day. `totals` sums them. A flow whose replay fails is not written: the file carries only runs
that completed. A fixed template stands in for the model call in these replays, so the checks have not yet had to catch a
real model draft.
