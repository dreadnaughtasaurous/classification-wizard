/**
 * Plain-JS assertion tests for scoring.js — zero dependencies.
 * Run with: node js/scoring.test.js
 *
 * Covers the validation checklist in output-package.md, plus direct
 * mechanical checks against the pseudocode/JSON schema in
 * scoring-and-recommendation-logic.md.
 */

const Scoring = require('./scoring.js');
const { QUESTIONS } = require('./questions-data.js');

let pass = 0;
let fail = 0;

function assertEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass += 1;
    console.log(`  ok — ${label}`);
  } else {
    fail += 1;
    console.error(`  FAIL — ${label}`);
    console.error(`    expected: ${JSON.stringify(expected)}`);
    console.error(`    actual:   ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition, label) {
  assertEqual(!!condition, true, label);
}

function answerAllDomains(letter) {
  const answers = {};
  Object.keys(QUESTIONS).forEach((domain) => {
    QUESTIONS[domain].forEach((q) => {
      answers[q.qid] = letter;
    });
  });
  return answers;
}


console.log('\n--- Named position overrides (clauses 3.4(a), 4.4(a), 5.4(a)-(c)) ---');
assertEqual(Scoring.checkNamedOverride('interpreter_unqualified'), { grade: 'Grade 1', clause: '3.4(a)', label: 'Interpreter, unqualified' }, 'Unqualified interpreter → Grade 1');
assertEqual(Scoring.checkNamedOverride('naati_one_language').grade, 'Grade 2', 'NAATI one-language interpreter → Grade 2');
assertEqual(Scoring.checkNamedOverride('workplace_trainer_careers_advisor').grade, 'Grade 3', 'Workplace Trainer/Careers Advisor → Grade 3');
assertEqual(Scoring.checkNamedOverride('naati_two_or_more_languages').grade, 'Grade 3', 'NAATI two-or-more-language interpreter → Grade 3');
assertEqual(Scoring.checkNamedOverride('dental_maintenance_technician_manager').grade, 'Grade 3', 'Dental Maintenance Technician manager → Grade 3');
assertEqual(Scoring.checkNamedOverride('none'), null, '"No override" returns null');
assertEqual(Scoring.checkNamedOverride(undefined), null, 'Undefined selection returns null');

console.log('\n--- Grade lookup table (inclusive bounds) ---');
assertEqual(Scoring.lookupGrade(0), 'Grade 1A', '0.00 → Grade 1A');
assertEqual(Scoring.lookupGrade(7.49), 'Grade 1A', '7.49 → Grade 1A (upper inclusive)');
assertEqual(Scoring.lookupGrade(7.5), 'Grade 1', '7.50 → Grade 1 (lower inclusive)');
assertEqual(Scoring.lookupGrade(94.49), 'Grade 10', '94.49 → Grade 10');
assertEqual(Scoring.lookupGrade(94.5), 'Grade 11', '94.50 → Grade 11');
assertEqual(Scoring.lookupGrade(100), 'Grade 11', '100.00 → Grade 11');

console.log('\n--- Weighting band selection ---');
assertEqual(Scoring.selectWeightBand(33.99).id, 'band_1A_3', '33.99 → band_1A_3');
assertEqual(Scoring.selectWeightBand(34).id, 'band_4_7', '34.00 → band_4_7');
assertEqual(Scoring.selectWeightBand(69.99).id, 'band_4_7', '69.99 → band_4_7');
assertEqual(Scoring.selectWeightBand(70).id, 'band_8_11', '70.00 → band_8_11');

console.log('\n--- Boundary signals (band-relative advisory + nested review tolerance) ---');
// Boundary at 25 (Grade2/Grade3): band widths 8.99/8.99 → advisory tolerance 1.62, review tolerance = min(1.5, 1.62) = 1.5
assertEqual(Scoring.checkBoundarySignals(23.4), { boundaryNote: true, reviewRequired: false, adjacentGrade: 'Grade 3', boundary: 25 }, '23.4 (1.6 from 25) is inside advisory (1.62) but outside review (1.5) → note only, no HR review');
assertEqual(Scoring.checkBoundarySignals(23.5), { boundaryNote: true, reviewRequired: true, adjacentGrade: 'Grade 3', boundary: 25 }, '23.5 (1.5 from 25) is inside review tolerance → note + review required');
assertEqual(Scoring.checkBoundarySignals(29).boundaryNote, false, '29 (4 pts from 25) is well outside the new ~1.6pt tolerance → no note (old ±5 logic incorrectly flagged this)');
assertEqual(Scoring.checkBoundarySignals(50).boundaryNote, false, '50 (2 pts from 52) is outside the new ~1.6pt tolerance → no note (old ±5 logic incorrectly flagged this)');
assertEqual(Scoring.checkBoundarySignals(51).reviewRequired, true, '51 (1 pt from 52) is inside review tolerance → review required');
assertEqual(Scoring.checkBoundarySignals(1).boundaryNote, false, '1 is far from the nearest boundary (7.5) → no note');
assertEqual(Scoring.checkBoundarySignals(100).boundaryNote, false, '100 is 5.5 from the 94.5 boundary → no note');
// Grade 10/11 boundary (94.5): narrowest bands (7.49/5.51) → advisory tolerance ≈0.99, review tolerance capped at 0.99 (not 1.5)
assertEqual(Scoring.checkBoundarySignals(93.4).boundaryNote, false, '93.4 (1.1 from 94.5) is outside the narrow ~0.99pt tolerance at this boundary → no note');
assertEqual(Scoring.checkBoundarySignals(93.51), { boundaryNote: true, reviewRequired: true, adjacentGrade: 'Grade 11', boundary: 94.5 }, '93.51 (0.99 from 94.5) is inside the narrow tolerance → note + review required (nested, since review = advisory here)');

console.log('\n--- Mismatch flags ---');
assertTrue(Scoring.checkMismatchFlags({ LTM: 75, AA: 25, KSE: 0, OIS: 0, CII: 0 }).some((f) => f.id === 'leadership_without_autonomy'), 'LTM≥50 & AA<50 → leadership_without_autonomy');
assertTrue(Scoring.checkMismatchFlags({ KSE: 100, OIS: 25, LTM: 0, AA: 0, CII: 0 }).some((f) => f.id === 'high_expertise_low_scope'), 'KSE≥75 & OIS<50 → high_expertise_low_scope');
assertTrue(Scoring.checkMismatchFlags({ CII: 100, AA: 0, KSE: 0, LTM: 0, OIS: 0 }).some((f) => f.id === 'high_influence_low_accountability'), 'CII≥75 & AA<50 → high_influence_low_accountability');
assertEqual(Scoring.checkMismatchFlags({ KSE: 50, PSJ: 50, AA: 50, LTM: 50, CII: 50, OIS: 50 }).length, 0, 'Balanced mid-range domains trigger no mismatch flags');

console.log('\n--- Domain averaging (KSE = KSE1–3 only, structural check) ---');
{
  const answers = { KSE1: 'E', KSE2: 'E', KSE3: 'E', KSE4: 'B', PSJ1: 'A' };
  const { domainScores } = Scoring.computeDomainScores(answers, QUESTIONS);
  assertEqual(domainScores.KSE, 100, 'KSE domain average ignores a stray KSE4 answer and uses only KSE1–3');
}

console.log('\n--- Edge case: entry-level clerical employee (all "A" answers) ---');
{
  const results = Scoring.runFullScoring(answerAllDomains('A'), QUESTIONS);
  assertEqual(results.grade, 'Grade 1A', 'All-A answers → Grade 1A');
  assertEqual(results.hrReviewRequired, false, 'All-A answers → no HR review flags');
}

console.log('\n--- Edge case: CEO / senior executive with Board delegations (all "E" answers) ---');
{
  const results = Scoring.runFullScoring(answerAllDomains('E'), QUESTIONS);
  assertEqual(results.grade, 'Grade 11', 'All-E answers → Grade 11');
  assertEqual(results.band.id, 'band_8_11', 'All-E answers select the Grades 8–11 weighting band');
}

console.log('\n--- Edge case: specialist — high KSE, low OIS (triggers HR review, does not force a management grade) ---');
{
  const answers = answerAllDomains('A');
  QUESTIONS.KSE.forEach((q) => { answers[q.qid] = 'E'; }); // KSE = 100
  const results = Scoring.runFullScoring(answers, QUESTIONS);
  assertTrue(results.mismatchFlags.some((f) => f.id === 'high_expertise_low_scope'), 'High KSE + low OIS flags high_expertise_low_scope');
  assertEqual(results.hrReviewRequired, true, 'Specialist mismatch sets hrReviewRequired = true');
}

console.log('\n--- Full pipeline smoke test (mixed mid-range answers) ---');
{
  const answers = answerAllDomains('C');
  const results = Scoring.runFullScoring(answers, QUESTIONS);
  assertEqual(results.initialAverage, 50, 'All-C answers → initial average of 50');
  assertEqual(results.band.id, 'band_4_7', 'Initial average of 50 selects band_4_7');
  assertEqual(results.weightedTotal, 50, 'Uniform 50s across all domains → weighted total of 50 regardless of weights');
  assertEqual(results.grade, 'Grade 5', 'Weighted total of 50 → Grade 5');
}

console.log(`\n${pass} passed, ${fail} failed.\n`);
if (fail > 0) process.exit(1);