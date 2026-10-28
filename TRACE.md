# One change, traced end to end

The scoreboard counts changes. This page follows one of them from the moment it was noticed to
the moment it will be graded, so the counts have a face. The change is to the harness itself,
which keeps every file involved public-safe. Consumer repos are called A to G.

**The change:** the harness score had been giving itself full marks on a check that measured
nothing, for nine weeks. Stub S-166.

## 1. Noticed — 2026-10-27

The weekly digest had printed `scorecard 94/100 A` for two Mondays. Running the scorecard by hand
with its consumer repos passed in printed something else:

| Run | Drift dimension | Total |
|---|---|---|
| as the digest ran it, no consumers passed | `100 — 0 consumer(s) checked — SELF-CHECK ONLY` | 95 A |
| with the seven real consumers | `0 — 7 drifting of 7 consumer(s) checked` | 71 B |

All seven were behind the pin: A by 2 commits, B by 5, C by 17, E, F and G by 36 each, and D had
the harness as a plain gitignored folder, invisible to the check altogether.

The instrument had printed its own caveat, `SELF-CHECK ONLY`, on every run since 2026-08-24.
Three careful passes over the score had read the number and not the sentence under it.

## 2. Stub and prediction — 2026-10-27

The stub recorded the observation, the cause and the build in one block, then a prediction
with a date, before any code was written:

> **Prediction:** the first digest after merge prints a score in the low 70s with `⚠ scorecard −2x`
> (an instrument correction, not decay); the roster check and this build agree on the same seven
> consumers. review-by: on-ship +14d.

The contradiction it named: the scorecard's header said "every branch defaults down". That was
true for crashes and parse errors, which score 0, and false for the no-input path, which scored
100. A fallback kinder than the real check is a vacuous pass with a timer on it.

## 3. Build — 2026-10-27 to 28, PR #85

Six parts, all in the harness repo:

- drift scores the fraction of consumers in sync, not a penalty per drift line (seven consumers at
  −30 each would pin the dimension at 0 forever and say nothing);
- zero consumers scores `null`, weight renormalised, detail `NOT MEASURED`, the same way an
  unbuilt dimension already did;
- the scorecard discovers consumers itself as `<code-root>/*/harness`, so the digest cannot
  forget to pass them;
- the digest line gains `⚠ drift unmeasured` whenever the dimension comes back inactive;
- a table test walks every weighted dimension and requires a declared empty-input case scoring
  zero or null, so a future dimension without one fails the suite;
- one line in the conventions: an instrument's degraded or input-less mode scores down or n/a,
  never full marks.

**Red before green.** The new table case was run against the old code first and failed on
`scoreReposInSync(0, 0) === 100`. Then two named injections, each reverting one part of the fix,
were run against the finished suite: restoring the old −30 rule fails 3 of 18 cases; dropping the
digest marker fails the digest fixture. The suite had been shown to fail for the right reasons
before it was trusted green. Only after that did it pass, 18 of 18.

## 4. Review and verify

This change was built in the harness repo, which runs no build lane on itself. So the review and
verify stages the flowchart shows were, here, the author's own red-first tests and the operator's
merge. For a change that went through the lane's reviewers and refuter, see the first example in
[FAILURES.md](FAILURES.md).

## 5. Merge — 2026-10-28

Squash-merged as #85 by the operator. The router suite ran 225 of 225 and all fourteen tracked
test scripts passed on master afterwards.

## 6. Effect, measured the same day

Scorecard on master, live: `reposInSync 0 — exit 1, 7 drifting of 7 consumer(s) checked`,
total **71 B**. That is the 2026-10-28 point on the score chart, with instrument marker 3 beside it.

The same afternoon the operator bumped all seven consumers to the current pin, and committed D's
folder as a real submodule. Scorecard again: `100 — 0 drifting of 7`, total **95 A**. The
honest A this time: the previous 94 was 93 real points plus a dimension measuring nothing.

## 7. Grade — due 2026-11-11

The prediction said the *digest* would print the low-70s line. It will not: the consumers were
bumped before the first Monday run, so the digest prints about 95 against 94 with no flag. In
the form it was written, the prediction is therefore **ungradeable**: the event it predicted was
made impossible by the author's own action. What can be graded is narrower: the mechanism was
demonstrated live (95 → 71 → 95) and the second clause, that the roster check and the build name
the same seven consumers, held. That note was written into the stub on 2026-10-28, before the
grade, so the grader on 11-11 sees the reframing dated before the date rather than after it.
A reader is entitled to call that convenient; the tally on the main page counts ungradeable
grades separately for exactly this reason.

That grade, pass, partial or fail, will land in the prediction tally on the main page.
