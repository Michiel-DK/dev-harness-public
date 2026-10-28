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
console.log('');
console.log('TOTALS');
console.log(`  merges ${sum(H.weeks, 'merges')} · credited ${sum(H.weeks, 'credited')} · unclassified (no path data) ${sum(H.weeks, 'other')} · priced ${usd(sum(H.weeks, 'cost_usd'))} · tokens ${sum(H.weeks, 'tokens')}`);
const tw = complete.filter(w => w.token_sessions > 0).slice(-12);
console.log(`  cost table (${tw.length} complete weeks with token rows): ${usd(sum(tw, 'cost_usd'))} over ${sum(tw, 'credited')} credited = ${usd(sum(tw, 'credited') ? sum(tw, 'cost_usd') / sum(tw, 'credited') : 0)} each`);
console.log('');
console.log('SCORE POINTS (total recomputed from the active dimensions)');
for (const s of H.scores) {
  let w = 0, t = 0;
  for (const d of Object.values(s.dims || {})) { if (!d.active || d.score === null) continue; w += d.weight; t += d.weight * d.score; }
  const re = w ? Math.round(t / w) : null;
  const verdict = re === null ? 'no dimensions stored' : re === s.score ? 'OK' : 'MISMATCH';
  console.log(`  ${s.date}  stored ${s.score} ${s.grade}  recomputed ${re ?? '—'}  ${verdict}${s.reconstructed ? '  (reconstructed)' : ''}`);
}
if (H.predictions) {
  const p = H.predictions;
  console.log('');
  console.log(`PREDICTIONS  ${p.graded} grades (${p.pass} pass · ${p.partial} partial · ${p.fail} fail · ${p.ungradeable} ungradeable) over ${p.graded_stubs ?? '?'} stubs; ${p.open_dated} open with a date; ${p.event_gated} event-gated; ${p.stubs} stubs in all. Categories overlap: a graded stub can be re-armed with a new date.`);
}
