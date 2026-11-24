#!/usr/bin/env node
// verify.js — re-derive every headline number on the README from history.json and print them.
// Run it in this folder:  node verify.js
// If a number here differs from the README, the README is wrong, not this script: the README
// is rendered from the same file by the same rules written out below.
'use strict';
const fs = require('fs');
const path = require('path');
const H = JSON.parse(fs.readFileSync(path.join(__dirname, 'history.json'), 'utf8'));

const weekOf = d => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10); };
const sum = (ws, k) => ws.reduce((n, w) => n + (w[k] || 0), 0);
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
const usd = n => '$' + Math.round(n).toLocaleString('en-US');

const complete = H.weeks.filter(w => w.week < weekOf(H.generated));   // the current week is partial and excluded
const last4 = complete.slice(-4), prev4 = complete.slice(-8, -4);
console.log(`history.json generated ${H.generated}; ${H.weeks.length} weeks, ${complete.length} complete`);
console.log(`last 4 complete weeks: ${last4.map(w => w.week).join(' ')}`);
console.log('');
console.log('OUTCOMES (last 4 vs prior 4)');
console.log(`  credited merges        ${sum(last4, 'credited')} of ${sum(last4, 'merges')}   |  ${sum(prev4, 'credited')} of ${sum(prev4, 'merges')}`);
console.log(`  CI green at merge      ${pct(sum(last4, 'green'), sum(last4, 'merges'))}         |  ${pct(sum(prev4, 'green'), sum(prev4, 'merges'))}`);
console.log(`  merged on red CI       ${sum(last4, 'merged_on_red')}           |  ${sum(prev4, 'merged_on_red')}`);
console.log(`  rejected / superseded  ${sum(last4, 'rejected')} / ${sum(last4, 'superseded')}        |  ${sum(prev4, 'rejected')} / ${sum(prev4, 'superseded')}`);
console.log(`  sessions abandoned     ${pct(sum(last4, 'abandoned'), sum(last4, 'sessions'))} of ${sum(last4, 'sessions')}  |  ${pct(sum(prev4, 'abandoned'), sum(prev4, 'sessions'))} of ${sum(prev4, 'sessions')}`);
console.log(`  refuter kill rate      ${pct(sum(last4, 'refuted'), sum(last4, 'verdicts'))} of ${sum(last4, 'verdicts')} |  ${pct(sum(prev4, 'refuted'), sum(prev4, 'verdicts'))} of ${sum(prev4, 'verdicts')}`);
console.log(`  reverted (credited)    ${sum(last4, 'reverted')} (${sum(last4, 'reverted_credited')})       |  ${sum(prev4, 'reverted')} (${sum(prev4, 'reverted_credited')})`);
console.log(`  fix-forward candidates ${sum(last4, 'fix_forward')}           |  ${sum(prev4, 'fix_forward')}`);
console.log('');
console.log('TOTALS');
console.log(`  merges ${sum(H.weeks, 'merges')} · credited ${sum(H.weeks, 'credited')} · unclassified (no path data) ${sum(H.weeks, 'other')} · priced ${usd(sum(H.weeks, 'cost_usd'))} · tokens ${sum(H.weeks, 'tokens')}`);
const tw = complete.filter(w => w.token_sessions > 0).slice(-12);
console.log(`  cost table (${tw.length} complete weeks with token rows): ${usd(sum(tw, 'cost_usd'))} over ${sum(tw, 'credited')} credited = ${usd(sum(tw, 'credited') ? sum(tw, 'cost_usd') / sum(tw, 'credited') : 0)} each`);
const qweeks = complete.filter(w => w.queues && w.token_sessions - (w.queues.not_looked || {}).sessions > 0).slice(-8);
if (qweeks.length) {
  console.log(`  cost per queue (${qweeks.length} complete weeks the join looked at):`);
  for (const k of Object.keys(qweeks[0].queues)) {
    const n = qweeks.reduce((s, w) => s + w.queues[k].sessions, 0), c = qweeks.reduce((s, w) => s + w.queues[k].cost_usd, 0);
    if (n) console.log(`    ${k.padEnd(13)} ${usd(c)} over ${n} sessions`);
  }
}
console.log('');
console.log('SCORE POINTS (total recomputed from the active dimensions)');
for (const s of H.scores) {
  let w = 0, t = 0;
  for (const d of Object.values(s.dims || {})) { if (!d.active || d.score === null) continue; w += d.weight; t += d.weight * d.score; }
  const re = w ? Math.round(t / w) : null;
  const verdict = re === null ? 'no dimensions stored' : re === s.score ? 'OK' : 'MISMATCH';
  console.log(`  ${s.date}  stored ${s.score} ${s.grade}  recomputed ${re ?? '—'}  ${verdict}${s.reconstructed ? '  (reconstructed)' : ''}`);
}
if (H.replay && H.replay.cells && H.replay.cells.length) {
  const r = H.replay, nv = v => (v === null || v === undefined ? 'n/a' : v);
  console.log('');
  console.log(`BUILT TWICE (${nv(r.tasks)} tasks, ${nv(r.cases_per_task)} hidden cases each${r.as_of ? ', builds finished ' + r.as_of : ''})`);
  for (const c of r.cells) {
    const claims = c.claims_checkable ? `${nv(c.claims_mismatch)} of ${c.claims_checkable}` : 'n/a (0 checkable)';
    console.log(`  ${c.builder.padEnd(6)} ${c.arm.padEnd(5)}  produced ${nv(c.produced)} of ${nv(c.builds)} · cases ${nv(c.cases_passed)} of ${nv(c.cases_total)} · claims ${claims} · median $${nv(c.median_cost_usd)} · ${nv(c.median_wall_min)} min`);
  }
  for (const b of [...new Set(r.cells.map(c => c.builder))]) {
    const pl = r.cells.find(c => c.builder === b && c.arm === 'plain'), g = r.cells.find(c => c.builder === b && c.arm === 'gated');
    const ratio = pl && g && pl.median_cost_usd && g.median_cost_usd !== null ? (g.median_cost_usd / pl.median_cost_usd).toFixed(1) + '×' : 'n/a';
    console.log(`  cost ratio ${b.padEnd(6)} ${ratio}`);
  }
  const pr = r.pairs || {}, st = r.stopped || {};
  console.log(`  pairs ${nv(pr.total)}: gated higher ${nv(pr.gated_higher)} · lower ${nv(pr.gated_lower)} · same ${nv(pr.tie)}; builds passing every case ${nv(r.builds_all_cases)} of ${nv(r.builds_total)}`);
  console.log(`  gated: criterion halts ${nv(st.criterion_halt)} · other no-project ${nv(st.other_no_project)} · skipped the gate ${nv(st.skipped_gate)} · findings left open ${nv(st.open_findings)}`);
}
if (H.claims && ((H.claims.weekly || []).length || H.claims.audit)) {
  const arm = (label, a) => (!a || !a.prs ? `${label} n/a (0 PRs)` : `${label} ${a.mismatches} of ${a.claims} in ${a.prs} PRs`);
  console.log('');
  console.log('CLAIMS RE-MEASURED (wrong of claims, per arm)');
  for (const w of (H.claims.weekly || [])) console.log(`  ${w.week}  ${arm('gated', w.arms.gated)}  |  ${arm('plain', w.arms.plain)}`);
  if (!(H.claims.weekly || []).length) console.log('  weekly re-run: n/a (not run yet)');
  if (H.claims.audit) console.log(`  one-off audit ${H.claims.audit.date} (${H.claims.audit.arm}): ${H.claims.audit.mismatches} of ${H.claims.audit.claims}`);
}
if (H.predictions) {
  const p = H.predictions;
  console.log('');
  console.log(`PREDICTIONS  ${p.graded} grades (${p.pass} pass · ${p.partial} partial · ${p.fail} fail · ${p.ungradeable} ungradeable) over ${p.graded_stubs ?? '?'} stubs; ${p.open_dated} open with a date; ${p.event_gated} event-gated; ${p.stubs} stubs in all. Categories overlap: a graded stub can be re-armed with a new date.`);
}
