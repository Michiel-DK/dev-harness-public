# Three things that went wrong

The main page counts refuter verdicts, failed predictions and instrument changes. These are
one of each, with the real text, so the counts have faces. Sources are the harness's own rows
and public repositories; nothing here was written after the fact.

## 1. The refuter killed a change that would have deleted the data

**Where:** [warehouse-rl](https://github.com/Michiel-DK/warehouse-rl), PR #45, 2026-10-19.
A new per-cell change detector, `fleet/fastmap.py`, plus ten tests. The lane built it, the
reviewers passed it, CI was green: 985 tests in one suite, 976 in the other.

**The verdict, correctness lens, confidence high, 18:09 UTC**, quoted from the ledger row:

> `fleet/fastmap.py main()` refuses `--store` only when it equals `<glob dir>/store` or its
> basename is "store". `run_fastmap` then does `shutil.rmtree(copy)` at line ~137 if the copy
> exists. I ran it on a throwaway temp dir laid out like a data dir … It deleted the whole run
> dir, including the original store and the stream files. It then crashed with
> `FileNotFoundError` from `copytree`, and `ls -R $T` printed nothing. The same happens for
> `--store jsonl:<fleet/data>` or any ancestor of the original store. Passing the run directory
> by mistake would therefore destroy the … data, which the brief says is never written. The
> hash-before/after guard cannot catch this: the rmtree runs after hashing and before any
> check. The test file has no case for an ancestor path.

The refuter did not argue from the diff. It built a directory shaped like the real data, ran
the command with a plausible wrong argument, and watched it empty the directory. The PR's own
safety guard, a hash of the store before and after, could not see it because the deletion
happened between the hash and the check.

**What happened next**, from the PR's commit list:

| Time (UTC) | Event |
|---|---|
| 17:37 | build commit |
| 17:51 | PR opened |
| 18:09 | verdict: refuted, high confidence |
| 18:11 | fix commit: "store-path guard compares subtrees" |
| 18:13 | two more commits for the lower-confidence findings: an honest no-flags identity test, zero-row handling |
| 19:40 | merged, CI green |

A second verdict on the same change, test-honesty lens, was also "refuted" but at low
confidence: it had read the diff without running anything and said so. Both verdicts count in
the kill rate on the main page. Only the first would have mattered in production.

## 2. A prediction that failed, and fired its own kill clause

**Where:** the harness itself, stub S-110, shipped 2026-08-05.

**The problem:** the build lane has a gate that halts a change after three failed attempts.
In the field, one card had reached attempt seven, because the gate could be waved through with
a boolean. S-110 made the wave-through cost a named red test instead of `true`.

**The prediction, written before shipping:** over the next three field days, no card exceeds
attempt four. **The kill clause, also written before shipping:** if cards still reach attempt
five with a named red row each time, the gate is not what constrains them, and this gets
reverted rather than tightened.

**First grade, 2026-08-18:** one card reached attempt five. The prediction was missed, by one.
The grader read each hit of the readout command rather than counting them: one genuine
violation, two that were a different gate, one that predated the fix. The old failure mode,
waving through with a boolean, had vanished entirely: zero such invocations after the ship date.
The grade recorded "narrowly missed, mechanism working, kill clause deliberately not fired on
n=1", and re-armed the date.

**Second grade, 2026-09-10:** two more cards reached attempt five or six, each with named red
rows, each verified in the commit bodies as genuine build attempts. The kill clause's condition
was met. Per the pre-commitment the recommendation was revert, not tighten, and the revert was
scoped as its own red-first build, S-151, so that the removal gets graded rather than assumed
safe.

**The instrument note on that grade:** the stub's own readout command was a case-sensitive
search for "pass 5" to "pass 9". One of the two new hits was written "PASS-6". A false "gate
holds" grade was one regular expression away.

This failure is the 6 in "6 fail" on the main page, and the kill clause is the reason the
harness lets a stub fail rather than argue.

## 3. The score gave itself full marks on nothing for nine weeks

**Where:** the harness scorecard, 2026-08-24 to 2026-10-28. Stub S-166.

One of the score's four dimensions checks whether the consumer repos are at the current harness
version. Run without consumer paths, it checked nothing and scored 100. The weekly digest ran it
without consumer paths. For nine weeks the score carried twenty points for a check that had
not looked.

The instrument said so, in its own output, on every run: `0 consumer(s) checked — SELF-CHECK
ONLY`. Three careful passes over the score re-derived the formula by hand and wired it into the
digest. Nobody read the sentence under the number.

**What changed:** zero inputs now scores "not measured" with the weight renormalised, the
digest line flags it, every dimension must declare an empty-input test case or the suite fails,
and one line went into the conventions: *an instrument's degraded or input-less mode scores down
or n/a, never full marks.* The full trace of that change is in [TRACE.md](TRACE.md).

**What it cost:** two Mondays of a wrong number, and the lesson that the harness tests its
instruments on their logic and not on their input. That lesson is why the post-merge tracker
added the same day starts its series with an explicit "nothing looked before this date".
