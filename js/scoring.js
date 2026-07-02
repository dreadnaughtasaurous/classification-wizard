/**
 * Classification Wizard — scoring engine
 * Source: scoring-and-recommendation-logic.md (Phase 4), weighting-model.md (Phase 2)
 *
 * Pure functions only — no DOM access — so this file can be required
 * directly by scoring.test.js via Node, and by app.js in the browser.
 */

(function (root) {
  const GRADE_LOOKUP = [
    { grade: 'Grade 1A', min: 0.00, max: 7.49 },
    { grade: 'Grade 1',  min: 7.50, max: 15.99 },
    { grade: 'Grade 2',  min: 16.00, max: 24.99 },
    { grade: 'Grade 3',  min: 25.00, max: 33.99 },
    { grade: 'Grade 4',  min: 34.00, max: 42.99 },
    { grade: 'Grade 5',  min: 43.00, max: 51.99 },
    { grade: 'Grade 6',  min: 52.00, max: 60.99 },
    { grade: 'Grade 7',  min: 61.00, max: 69.99 },
    { grade: 'Grade 8',  min: 70.00, max: 78.99 },
    { grade: 'Grade 9',  min: 79.00, max: 86.99 },
    { grade: 'Grade 10', min: 87.00, max: 94.49 },
    { grade: 'Grade 11', min: 94.50, max: 100.00 },
  ];

  // Transition points between adjacent grades. BOUNDARIES[i] == GRADE_LOOKUP[i+1].min
  const BOUNDARIES = [7.5, 16, 25, 34, 43, 52, 61, 70, 79, 87, 94.5];

  // Band-relative advisory tolerance: a boundary "note" (non-blocking) fires within
  // 18% of the narrower of the two grade bands either side of that boundary. This
  // replaces a flat point value because bands range from 5.51 points wide (Grade 11)
  // to 8.99 points wide (most mid grades) — a flat tolerance sized for one width is
  // wrong for the others. See scoring-and-recommendation-logic.md "Boundary and
  // tie-break logic" for the full rationale.
  const ADVISORY_TOLERANCE_RATIO = 0.18;

  // HR-review proximity tolerance: a flat point value, but capped at the advisory
  // tolerance for that boundary so the "review required" zone is always nested
  // inside the "note" zone (never wider than it).
  const REVIEW_TOLERANCE_POINTS = 1.5;

  function bandWidth(gradeIndex) {
    const g = GRADE_LOOKUP[gradeIndex];
    return round2(g.max - g.min + 0.01); // restores true width across the 0.01 gap used for inclusive/exclusive display bounds
  }

  /** Returns { advisoryTolerance, reviewTolerance } for the boundary at BOUNDARIES[i]. */
  function toleranceForBoundary(i) {
    const widthBelow = bandWidth(i);
    const widthAbove = bandWidth(i + 1);
    const advisoryTolerance = round2(Math.min(widthBelow, widthAbove) * ADVISORY_TOLERANCE_RATIO);
    const reviewTolerance = round2(Math.min(REVIEW_TOLERANCE_POINTS, advisoryTolerance));
    return { advisoryTolerance, reviewTolerance };
  }

  const WEIGHT_BANDS = {
    band_1A_3: { id: 'band_1A_3', label: 'Grades 1A–3', min: 0, max: 33.99, weights: { KSE: 25, PSJ: 25, AA: 20, LTM: 10, CII: 10, OIS: 10 } },
    band_4_7:  { id: 'band_4_7',  label: 'Grades 4–7',  min: 34, max: 69.99, weights: { KSE: 18, PSJ: 18, AA: 22, LTM: 22, CII: 10, OIS: 10 } },
    band_8_11: { id: 'band_8_11', label: 'Grades 8–11', min: 70, max: 100,   weights: { KSE: 12, PSJ: 16, AA: 18, LTM: 16, CII: 18, OIS: 20 } },
  };

  const HARD_OVERRIDES = {
    interpreter_unqualified: { grade: 'Grade 1', clause: '3.4(a)', label: 'Interpreter, unqualified' },
    naati_one_language: { grade: 'Grade 2', clause: '4.4(a)', label: 'NAATI-accredited interpreter/translator — one other language' },
    workplace_trainer_careers_advisor: { grade: 'Grade 3', clause: '5.4(a)', label: 'Workplace Trainer / Careers Advisor' },
    naati_two_or_more_languages: { grade: 'Grade 3', clause: '5.4(b)', label: 'NAATI-accredited interpreter/translator — two or more languages' },
    dental_maintenance_technician_manager: { grade: 'Grade 3', clause: '5.4(c)', label: 'Manager of Dental Maintenance Technicians' },
  };

  const MISMATCH_RULES = [
    {
      id: 'leadership_without_autonomy',
      test: (d) => d.LTM >= 50 && d.AA < 50,
      message: 'Leadership score exceeds accountability/autonomy evidence. Check whether supervision is formal and delegated.',
    },
    {
      id: 'high_expertise_low_scope',
      test: (d) => d.KSE >= 75 && d.OIS < 50,
      message: 'High expertise but limited organisational scope. Check whether this is a specialist role rather than a higher management role.',
    },
    {
      id: 'high_influence_low_accountability',
      test: (d) => d.CII >= 75 && d.AA < 50,
      message: 'High stakeholder influence but limited delegated accountability. Check whether the influence is advisory rather than decision-making.',
    },
  ];

  function average(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /** clauses 3.4(a), 4.4(a), 5.4(a)-(c) — mandatory grade, bypasses all scoring. */
  function checkNamedOverride(key) {
    if (!key || key === 'none') return null;
    const o = HARD_OVERRIDES[key];
    if (!o) return null;
    return { grade: o.grade, clause: o.clause, label: o.label };
  }

  /**
   * Averages answered questions within each domain.
   * questions: the QUESTIONS object (KSE array must be KSE1-3 only — see questions-data.js header).
   * answers: { qid: letter }
   * Returns { domainScores: {KSE,PSJ,AA,LTM,CII,OIS}, domainDetails: {domain: [{qid,text,letter,label,clause,points}]} }
   */
  function computeDomainScores(answers, questions) {
    const domainScores = {};
    const domainDetails = {};
    Object.keys(questions).forEach((domainId) => {
      const qs = questions[domainId];
      const points = [];
      const details = [];
      qs.forEach((q) => {
        const letter = answers[q.qid];
        if (!letter) return;
        const opt = q.options.find((o) => o.letter === letter);
        if (!opt) return;
        points.push(opt.points);
        details.push({ qid: q.qid, text: q.text, letter, label: opt.label, clause: opt.clause, points: opt.points });
      });
      domainScores[domainId] = round2(average(points));
      domainDetails[domainId] = details;
    });
    return { domainScores, domainDetails };
  }

  /** weighting-model.md band selection, keyed off the unweighted initial average. */
  function selectWeightBand(initialAverage) {
    if (initialAverage < 34) return WEIGHT_BANDS.band_1A_3;
    if (initialAverage < 70) return WEIGHT_BANDS.band_4_7;
    return WEIGHT_BANDS.band_8_11;
  }

  function calculateWeightedTotal(domainScores, band) {
    const w = band.weights;
    const total =
      (domainScores.KSE * w.KSE) / 100 +
      (domainScores.PSJ * w.PSJ) / 100 +
      (domainScores.AA * w.AA) / 100 +
      (domainScores.LTM * w.LTM) / 100 +
      (domainScores.CII * w.CII) / 100 +
      (domainScores.OIS * w.OIS) / 100;
    return round2(total);
  }

  function lookupGrade(weightedTotal) {
    const clamped = Math.min(100, Math.max(0, weightedTotal));
    const found = GRADE_LOOKUP.find((g) => clamped >= g.min && clamped <= g.max);
    return found ? found.grade : GRADE_LOOKUP[GRADE_LOOKUP.length - 1].grade;
  }

  /**
   * Two-tier, band-relative boundary check.
   *  - boundaryNote: non-blocking. The score is close enough to a boundary to be
   *    worth showing the adjacent grade for reference, but is not by itself a
   *    reason to demand HR sign-off — see ADVISORY_TOLERANCE_RATIO above.
   *  - reviewRequired: blocking. The score is close enough that it is a genuine
   *    toss-up between two grades — see REVIEW_TOLERANCE_POINTS above.
   * Reports the nearest qualifying boundary and the grade on its other side.
   */
  function checkBoundarySignals(weightedTotal) {
    let noteFlagged = false;
    let reviewFlagged = false;
    let nearestDist = Infinity;
    let nearestIdx = -1;
    BOUNDARIES.forEach((b, i) => {
      const d = Math.abs(weightedTotal - b);
      const { advisoryTolerance, reviewTolerance } = toleranceForBoundary(i);
      if (d <= advisoryTolerance) {
        noteFlagged = true;
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }
      if (d <= reviewTolerance) reviewFlagged = true;
    });
    if (!noteFlagged) return { boundaryNote: false, reviewRequired: false, adjacentGrade: null, boundary: null };
    const boundary = BOUNDARIES[nearestIdx];
    const lowerGrade = GRADE_LOOKUP[nearestIdx].grade;
    const upperGrade = GRADE_LOOKUP[nearestIdx + 1].grade;
    const adjacentGrade = weightedTotal < boundary ? upperGrade : lowerGrade;
    return { boundaryNote: true, reviewRequired: reviewFlagged, adjacentGrade, boundary };
  }

  function checkMismatchFlags(domainScores) {
    return MISMATCH_RULES.filter((r) => r.test(domainScores)).map((r) => ({ id: r.id, message: r.message }));
  }

  /**
   * Full orchestration per the pseudocode in scoring-and-recommendation-logic.md.
   * Assumes scope exclusion and named override have already been checked and did not apply.
   */
  function runFullScoring(answers, questions) {
    const { domainScores, domainDetails } = computeDomainScores(answers, questions);
    const initialAverage = round2(average(Object.values(domainScores)));
    const band = selectWeightBand(initialAverage);
    const weightedTotal = calculateWeightedTotal(domainScores, band);
    const grade = lookupGrade(weightedTotal);
    const boundary = checkBoundarySignals(weightedTotal);
    const mismatchFlags = checkMismatchFlags(domainScores);
    return {
      domainScores,
      domainDetails,
      initialAverage,
      band,
      weightedTotal,
      grade,
      boundaryFlag: boundary.boundaryNote,
      adjacentGrade: boundary.adjacentGrade,
      mismatchFlags,
      hrReviewRequired: boundary.reviewRequired || mismatchFlags.length > 0,
    };
  }

  const Scoring = {
    GRADE_LOOKUP,
    BOUNDARIES,
    WEIGHT_BANDS,
    HARD_OVERRIDES,
    MISMATCH_RULES,
    checkNamedOverride,
    computeDomainScores,
    selectWeightBand,
    calculateWeightedTotal,
    lookupGrade,
    checkBoundarySignals,
    checkMismatchFlags,
    runFullScoring,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scoring;
  } else {
    root.Scoring = Scoring;
  }
})(typeof window !== 'undefined' ? window : globalThis);