/**
 * Classification Wizard — Alpine.js application state and flow control.
 *
 * Screen flow:
 *   intro -> override -> [results, terminal via named override]
 *                      -> question (x23, grouped by domain) -> results
 *
 * 'methodology' is a standalone informational screen reachable from the
 * sidebar at any point (not part of the linear wizard sequence). Entering
 * it snapshots the screen the user came from in `preMethodologyScreen` so
 * the back control returns them to exactly where they were.
 *
 * All scoring math lives in scoring.js; this file only orchestrates the
 * wizard flow and reads/writes Alpine state.
 */

function wizardApp() {
  return {
    // ---------- theme ----------
    theme: 'light',

    // ---------- navigation ----------
    screen: 'intro', // intro | override | question | results | methodology
    // Screen to return to when leaving 'methodology' via its back control.
    // Set on entry to 'methodology', read/cleared on exit. Defaults to
    // 'intro' as a safe fallback (e.g. deep entry with no prior screen).
    preMethodologyScreen: 'intro',
    // Methodology content is fetched from docs/methodology.md at runtime
    // and rendered with marked, rather than baked into the HTML — so the
    // page always reflects the current .md file with no rebuild step.
    // 'idle' | 'loading' | 'ready' | 'error'
    methodologyStatus: 'idle',
    methodologyHtml: '',
    methodologyError: '',
    questionCursor: 0,
    // Furthest point the user has reached in the linear flow. Used so that
    // jumping back via the sidebar to review/change an earlier answer never
    // loses the user's place — they can always return to exactly where they were.
    furthestCursor: 0,
    resultsReached: false,
    resultsUpdatedNotice: false,
    _lastResultsSnapshot: null,
    sidebarOpen: false,
    // Letter of the option whose hover-tooltip detail bubble is showing/
    // pinned on the current question, or null if none. Set on hover/focus,
    // toggled on click (for touch devices with no hover state). Reset
    // whenever the question changes (see questionNext/questionBack/
    // jumpToQuestion/resetWizard).
    expandedDetail: null,
    // 'next' or 'back' — which way the last navigation moved, so the
    // question/override screens know whether to slide the incoming
    // question up (forward) or down (backward). See qwiz-anim-next/back
    // in style.css and the keyed x-for wrapper in index.html.
    navDirection: 'next',
    // Increments on every navigation. The keyed x-for in index.html keys
    // on this (not on navDirection alone), so the wrapper node is always
    // destroyed/recreated — and the entrance animation always replays —
    // even when two consecutive moves happen to share the same direction.
    navTick: 0,
    setNavDirection(dir) {
      this.navDirection = dir;
      this.navTick += 1;
    },
    // Explicit user expand/collapse choices per domain, keyed by domain id.
    // A domain not present here falls back to "expanded if it's the current
    // domain" — see isDomainExpanded().
    expandedDomains: {},
    _advanceTimer: null,

    // ---------- data captured ----------
    context: { roleTitle: '', date: todayISO() },
    overrideKey: null, // null until chosen; 'none' or a HARD_OVERRIDES key
    answers: {}, // { qid: letter }

    // ---------- misc UI state ----------
    copyConfirmed: false,
    introTouched: false,

    // ---------- static references ----------
    domainOrder: DOMAIN_ORDER,
    domainMeta: DOMAIN_META,
    overrideQuestion: KSE4_OVERRIDE_QUESTION,
    flatQuestions: buildFlatQuestions(),

    // ================= lifecycle =================
    init() {
      const saved = localStorage.getItem('cw-theme');
      this.theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', this.theme);
      window.addEventListener('keydown', (e) => this.handleKeydown(e));
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('cw-theme', this.theme);
    },

    // ================= derived / computed =================
    get currentQuestion() {
      return this.flatQuestions[this.questionCursor];
    },
    get currentDomainId() {
      return this.currentQuestion ? this.currentQuestion.domain : null;
    },
    get currentDomainIndex() {
      return this.currentDomainId ? this.domainOrder.indexOf(this.currentDomainId) : -1;
    },
    get totalQuestions() {
      return this.flatQuestions.length;
    },
    get answeredCount() {
      return Object.keys(this.answers).length;
    },
    get allQuestionsAnswered() {
      return this.answeredCount >= this.totalQuestions;
    },
    get overrideResult() {
      return this.overrideKey ? Scoring.checkNamedOverride(this.overrideKey) : null;
    },
    /** Live-recalculated on every access — cheap at this scale (23 questions). */
    get scoredResults() {
      if (!this.allQuestionsAnswered) return null;
      return Scoring.runFullScoring(this.answers, QUESTIONS);
    },
    /** Unified result the results screen renders, whichever path produced it. */
    get finalResult() {
      if (this.overrideResult) {
        return { type: 'override', ...this.overrideResult };
      }
      if (this.scoredResults) {
        return { type: 'scored', ...this.scoredResults };
      }
      return null;
    },

    // ================= sidebar step status =================
    stepStatus(stepId) {
      const order = ['intro', 'override', ...this.domainOrder, 'results'];
      const phaseOf = (s) => {
        if (s === 'intro') return 0;
        if (s === 'override') return 1;
        if (this.domainOrder.includes(s)) return 2 + this.domainOrder.indexOf(s);
        if (s === 'results') return 8;
        return -1;
      };
      let currentPhase;
      if (this.screen === 'intro') currentPhase = 0;
      else if (this.screen === 'override') currentPhase = 1;
      else if (this.screen === 'question') currentPhase = 2 + this.currentDomainIndex;
      else if (this.screen === 'results') currentPhase = 8;
      else currentPhase = 0;

      const target = phaseOf(stepId);
      if (target === currentPhase) return 'current';

      // "Done" tracks the furthest point ever reached, independent of where the
      // user is currently looking — so a step doesn't drop back to "upcoming"
      // just because they used the sidebar to review an earlier question.
      let reachedPhase;
      if (this.resultsReached) {
        reachedPhase = 8;
      } else if (this.overrideKey === 'none') {
        const furthestQ = this.flatQuestions[this.furthestCursor];
        reachedPhase = furthestQ ? 2 + this.domainOrder.indexOf(furthestQ.domain) : 2;
      } else if (this.screen !== 'intro') {
        reachedPhase = 1;
      } else {
        reachedPhase = 0;
      }

      return target <= reachedPhase ? 'done' : 'upcoming';
    },
    domainAnsweredCount(domainId) {
      return QUESTIONS[domainId].filter((q) => this.answers[q.qid]).length;
    },
    domainQuestions(domainId) {
      return this.flatQuestions.filter((q) => q.domain === domainId);
    },
    // A domain is expanded if the user has explicitly toggled it, or — by
    // default, with no explicit choice yet — if it's the domain currently
    // being answered. This keeps the sidebar tidy on load while still
    // surfacing exactly where the user is.
    isDomainExpanded(domainId) {
      if (Object.prototype.hasOwnProperty.call(this.expandedDomains, domainId)) {
        return this.expandedDomains[domainId];
      }
      return domainId === this.currentDomainId;
    },
    toggleDomainExpand(domainId) {
      this.expandedDomains[domainId] = !this.isDomainExpanded(domainId);
    },
    // A specific question is reachable once the user's furthest progress has
    // passed it — same rule the domain-level jump already relies on — so
    // this never opens up questions the user hasn't gotten to yet.
    canJumpToQuestion(qid) {
      if (this.overrideKey !== 'none') return false;
      const idx = this.flatQuestions.findIndex((q) => q.qid === qid);
      if (idx < 0) return false;
      return idx <= this.furthestCursor;
    },
    substepStatus(q) {
      if (this.screen === 'question' && this.currentQuestion && this.currentQuestion.qid === q.qid) return 'current';
      if (this.answers[q.qid]) return 'done';
      return 'upcoming';
    },
    jumpToQuestion(qid) {
      if (!this.canJumpToQuestion(qid)) return;
      const idx = this.flatQuestions.findIndex((q) => q.qid === qid);
      if (idx < 0) return;
      this.clearAutoAdvance();
      this.sidebarOpen = false;
      this.expandedDetail = null;
      this.setNavDirection(idx >= this.questionCursor ? 'next' : 'back');
      this.questionCursor = idx;
      this.screen = 'question';
    },
    canJumpTo(stepId) {
      // 'methodology' is a standalone reference screen, not a wizard step —
      // always reachable regardless of progress.
      if (stepId === 'methodology') return true;
      if (this.overrideResult) return stepId === 'intro' || stepId === 'override' || stepId === 'results';
      const status = this.stepStatus(stepId);
      return status === 'done' || status === 'current';
    },
    jumpTo(stepId) {
      if (!this.canJumpTo(stepId)) return;
      this.clearAutoAdvance();
      this.sidebarOpen = false;
      if (stepId === 'methodology') {
        // Don't overwrite the return point if already on methodology (e.g.
        // sidebar clicked twice) or coming from methodology itself.
        if (this.screen !== 'methodology') this.preMethodologyScreen = this.screen;
        this.screen = 'methodology';
        this.loadMethodology();
        return;
      }
      if (stepId === 'intro') { this.screen = 'intro'; return; }
      if (stepId === 'override') { this.screen = 'override'; return; }
      if (stepId === 'results') { if (this.finalResult) this.enterResults(); return; }
      if (this.domainOrder.includes(stepId)) {
        const idx = this.flatQuestions.findIndex((q) => q.domain === stepId);
        // Jumping via the sidebar only changes *where you're looking* — it never
        // resets furthestCursor, so "Continue where you left off" always works.
        if (idx >= 0) {
          this.setNavDirection(idx >= this.questionCursor ? 'next' : 'back');
          this.questionCursor = idx;
          this.screen = 'question';
        }
      }
    },

    // ================= methodology (standalone reference screen) =================
    // Fetches docs/methodology.md relative to index.html and renders it with
    // marked. Cached after first successful load (force=true bypasses the
    // cache, used by the "Try again" button after a failed fetch).
    async loadMethodology(force = false) {
      if (this.methodologyStatus === 'ready' && !force) return;
      if (this.methodologyStatus === 'loading') return;
      this.methodologyStatus = 'loading';
      this.methodologyError = '';
      try {
        const res = await fetch('docs/methodology.md', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        let md = await res.text();
        // The .md file starts with a top-level "# Methodology" heading so it
        // reads correctly as a standalone document (e.g. viewed on GitHub).
        // The wizard page already renders its own <h1>, so strip that first
        // heading line here to avoid a duplicate title in-app.
        md = md.replace(/^#\s+.+\n+/, '');
        if (typeof marked === 'undefined') throw new Error('Markdown renderer failed to load.');
        this.methodologyHtml = marked.parse(md);
        this.methodologyStatus = 'ready';
      } catch (err) {
        this.methodologyError = err && err.message ? err.message : 'Unknown error.';
        this.methodologyStatus = 'error';
      }
    },
    closeMethodology() {
      this.screen = this.preMethodologyScreen || 'intro';
    },

    // ================= review mode (sidebar back-navigation) =================
    get inReviewMode() {
      return this.screen === 'question' && this.questionCursor < this.furthestCursor;
    },
    resumeProgress() {
      this.clearAutoAdvance();
      if (this.resultsReached) {
        this.enterResults();
      } else {
        this.questionCursor = Math.min(this.furthestCursor, this.totalQuestions - 1);
        this.screen = 'question';
      }
    },

    // ================= results transition =================
    // Single entry point for moving to the results screen. Snapshots the
    // current answers/override so that if the user edits an earlier answer
    // (via sidebar review) and comes back, they're told the recommendation
    // has been recalculated rather than silently changing underneath them.
    _snapshotAnswers() {
      return JSON.stringify({ a: this.answers, o: this.overrideKey });
    },
    enterResults() {
      const snap = this._snapshotAnswers();
      this.resultsUpdatedNotice = this.resultsReached && this._lastResultsSnapshot !== null && this._lastResultsSnapshot !== snap;
      this._lastResultsSnapshot = snap;
      this.resultsReached = true;
      this.screen = 'results';
    },

    // ================= intro =================
    submitIntro() {
      this.introTouched = true;
      if (!this.context.roleTitle.trim()) return;
      this.screen = 'override';
    },

    // ================= typeform-style auto-advance =================
    // Selecting an option auto-advances after a brief pause so the user sees
    // their choice register (Typeform pattern). Manual Next/Back remain fully
    // functional for keyboard users or anyone who wants to double-check first.
    clearAutoAdvance() {
      if (this._advanceTimer) {
        clearTimeout(this._advanceTimer);
        this._advanceTimer = null;
      }
    },
    scheduleAutoAdvance(fn) {
      this.clearAutoAdvance();
      this._advanceTimer = setTimeout(() => {
        this._advanceTimer = null;
        fn();
      }, 380);
    },

    // ================= named override =================
    selectOverride(key) {
      this.overrideKey = key;
      this.scheduleAutoAdvance(() => this.overrideNext());
    },
    overrideNext() {
      this.clearAutoAdvance();
      if (!this.overrideKey) return;
      if (this.overrideKey === 'none') {
        this.setNavDirection('next');
        this.questionCursor = 0;
        this.furthestCursor = 0;
        this.screen = 'question';
      } else {
        this.enterResults();
      }
    },
    overrideBack() {
      this.clearAutoAdvance();
      this.screen = 'intro';
    },

    // ================= domain questions =================
    // Hover-tooltip detail bubble for a single option. Only KSE1, PSJ1,
    // OIS1, OIS4 options carry an `opt.detail` string; the icon itself is
    // hidden via x-show="opt.detail" for every other question.
    // Mouse hover and keyboard focus both open it; blur/mouseleave close
    // it. No click handler — a tap focuses the button first, so a
    // click-toggle would immediately re-close what focus just opened.
    openDetail(letter) {
      this.expandedDetail = letter;
    },
    closeDetail(letter) {
      if (this.expandedDetail === letter) this.expandedDetail = null;
    },
    selectAnswer(letter) {
      this.answers[this.currentQuestion.qid] = letter;
      this.scheduleAutoAdvance(() => this.questionNext());
    },
    questionNext() {
      this.clearAutoAdvance();
      if (!this.answers[this.currentQuestion.qid]) return;
      this.expandedDetail = null;
      this.setNavDirection('next');
      if (this.questionCursor < this.totalQuestions - 1) {
        this.questionCursor += 1;
        if (this.questionCursor > this.furthestCursor) this.furthestCursor = this.questionCursor;
      } else {
        this.furthestCursor = this.totalQuestions - 1;
        this.enterResults();
      }
    },
    questionBack() {
      this.clearAutoAdvance();
      this.expandedDetail = null;
      this.setNavDirection('back');
      if (this.questionCursor > 0) {
        this.questionCursor -= 1;
      } else {
        this.screen = 'override';
      }
    },

    // ================= grade range gauge =================
    // Segments for the 0-100 horizontal gauge, one per GRADE_LOOKUP row, each
    // sized as a percentage width of the full 0-100 range for use in inline
    // style="width: X%" (visual only — the accessible text lives in
    // gradeGaugeText() and the data table fallback, never in colour/position alone).
    gradeRangeSegments() {
      return Scoring.GRADE_LOOKUP.map((g) => ({
        grade: g.grade,
        shortLabel: g.grade.replace('Grade ', ''),
        min: g.min,
        max: g.max,
        widthPct: round2((g.max - g.min + 0.01) / 100 * 100),
        leftPct: round2((g.min / 100) * 100),
        isCurrent: this.finalResult && this.finalResult.type === 'scored' && this.finalResult.grade === g.grade,
      }));
    },
    currentGradeRange() {
      if (!this.finalResult || this.finalResult.type !== 'scored') return null;
      return Scoring.GRADE_LOOKUP.find((g) => g.grade === this.finalResult.grade) || null;
    },
    nextGradeRange() {
      const current = this.currentGradeRange();
      if (!current) return null;
      const idx = Scoring.GRADE_LOOKUP.findIndex((g) => g.grade === current.grade);
      if (idx < 0 || idx >= Scoring.GRADE_LOOKUP.length - 1) return null; // Grade 11 — no next grade
      return Scoring.GRADE_LOOKUP[idx + 1];
    },
    // Inline style for the score marker position only — kept minimal and
    // computed, per the instruction to reserve CSS for all other styling.
    scoreMarkerStyle() {
      if (!this.finalResult || this.finalResult.type !== 'scored') return '';
      const clamped = Math.min(100, Math.max(0, this.finalResult.weightedTotal));
      return `left: ${clamped}%;`;
    },
    // Plain-language text equivalent for the gauge, per the example format.
    // This is the primary accessible description — the marker/graphic is
    // supplementary, not the sole means of conveying the score.
    gradeGaugeText() {
      const r = this.finalResult;
      if (!r || r.type !== 'scored') return '';
      const current = this.currentGradeRange();
      if (!current) return '';
      const score = r.weightedTotal.toFixed(2);
      const min = current.min.toFixed(2);
      const max = current.max.toFixed(2);
      const base = `${score} sits within the ${current.grade} range: ${min}–${max}.`;
      if (current.grade === 'Grade 11') {
        return `${base} This score sits within the highest grade range.`;
      }
      const next = this.nextGradeRange();
      if (!next) return base;
      return `${base} ${next.grade} begins at ${next.min.toFixed(2)}.`;
    },

    // ================= weighted contribution breakdown =================
    // "What drove the score" — per-domain contribution to the weighted total.
    // contribution = domainScore * weight / 100; width is contribution as a
    // percentage of the largest contribution, for relative bar sizing.
    weightedContributions() {
      const r = this.finalResult;
      if (!r || r.type !== 'scored') return [];
      const weights = r.band.weights;
      const rows = this.domainOrder.map((d) => {
        const score = r.domainScores[d];
        const weight = weights[d];
        const contribution = round2((score * weight) / 100);
        return {
          id: d,
          name: this.domainMeta[d].name,
          code: this.domainMeta[d].code,
          score,
          weight,
          contribution,
        };
      });
      const maxContribution = Math.max(...rows.map((row) => row.contribution), 0.01);
      return rows.map((row) => ({ ...row, width: round2((row.contribution / maxContribution) * 100) }));
    },

    // ================= results output =================
    /**
     * Single source of truth for the summary content. Both the on-screen HTML
     * version and the clipboard plain-text version are built from this, so they
     * can never drift out of sync with each other.
     */
    get summaryData() {
      const r = this.finalResult;
      if (!r) return null;
      return {
        roleTitle: this.context.roleTitle || '—',
        date: this.context.date,
        grade: r.grade,
        type: r.type,
        clause: r.type === 'override' ? r.clause : null,
        label: r.type === 'override' ? r.label : null,
        weightedTotal: r.type === 'scored' ? r.weightedTotal : null,
        bandLabel: r.type === 'scored' ? r.band.label : null,
        domainScores: r.type === 'scored'
          ? this.domainOrder.map((d) => ({ name: this.domainMeta[d].name, score: r.domainScores[d] }))
          : null,
        hrReviewRequired: r.type === 'scored' ? r.hrReviewRequired : false,
        boundaryFlag: r.type === 'scored' ? r.boundaryFlag : false,
        adjacentGrade: r.type === 'scored' ? r.adjacentGrade : null,
        mismatchFlags: r.type === 'scored' ? r.mismatchFlags : [],
      };
    },
    /**
     * Rich-text (safe HTML) version for on-screen display: same structure/content
     * as summaryPlainText (role, grade, basis, domain scores, review flags) but
     * with headings and bold for key facts, plus a hyperlink on the tool's name.
     * All dynamic values are escaped before insertion since this is rendered via x-html.
     */
    get summaryProseHtml() {
      const d = this.summaryData;
      if (!d) return '';
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const wizardLink = '<a href="https://dreadnaughtasaurous.github.io/classification-wizard/" target="_blank" rel="noopener">Classification Wizard</a>';
      const parts = [];
      parts.push(`<strong>${wizardLink} — recommendation summary</strong>`);
      parts.push('<span class="summary-agreement">Health and Allied Services, Managers and Administrative Workers (Victorian Public Sector) Enterprise Agreement 2025-2027, Schedule 3D Part 1</span>');
      parts.push(`Role title: <strong>${esc(d.roleTitle)}</strong> &middot; Date: ${esc(d.date)}`);
      parts.push(`Recommended grade: <strong>${esc(d.grade)}</strong>`);
      if (d.type === 'override') {
        parts.push(`Basis: <strong>mandatory named-position override</strong>, clause ${esc(d.clause)} (${esc(d.label)}).`);
      } else {
        parts.push(`Basis: weighted assessment score <strong>${esc(d.weightedTotal)}/100</strong> (${esc(d.bandLabel)} weighting band).`);
        const scoreItems = d.domainScores.map((s) => `<li>${esc(s.name)}: ${esc(s.score)}</li>`).join('');
        parts.push(`Domain scores (0&ndash;100):<ul class="summary-domain-list">${scoreItems}</ul>`);
        if (d.hrReviewRequired) {
          const reasons = [];
          if (d.boundaryFlag) reasons.push(`score is close to a grade boundary; possible alternative grade: ${esc(d.adjacentGrade)}`);
          d.mismatchFlags.forEach((f) => reasons.push(esc(f.message.replace(/\.$/, ''))));
          parts.push(`<strong>HR review recommended</strong> &mdash; ${reasons.join('; ')}.`);
        } else {
          parts.push('No boundary or mismatch flags were raised.');
        }
      }
      parts.push('This is a classification recommendation, not a final determination — <strong>HR must confirm the final classification</strong>.');
      return parts.join('<br><br>');
    },
    get summaryPlainText() {
      const d = this.summaryData;
      if (!d) return '';
      const lines = [];
      lines.push('CLASSIFICATION WIZARD — RECOMMENDATION SUMMARY');
      lines.push('Health and Allied Services, Managers and Administrative Workers (Victorian Public Sector) Enterprise Agreement 2025-2027, Schedule 3D Part 1');
      lines.push('');
      lines.push(`Role title: ${d.roleTitle}`);
      lines.push(`Date: ${d.date}`);
      lines.push('');
      lines.push(`RECOMMENDED GRADE: ${d.grade}`);
      lines.push('');
      if (d.type === 'override') {
        lines.push(`Basis: mandatory named-position override, clause ${d.clause} (${d.label}).`);
      } else {
        lines.push(`Basis: weighted assessment score ${d.weightedTotal}/100 (${d.bandLabel} weighting band).`);
        lines.push('');
        lines.push('Domain scores (0-100):');
        d.domainScores.forEach((s) => {
          lines.push(`  - ${s.name}: ${s.score}`);
        });
        lines.push('');
        if (d.hrReviewRequired) {
          lines.push('HR REVIEW RECOMMENDED:');
          if (d.boundaryFlag) lines.push(`  - Score is close to a grade boundary; possible alternative grade: ${d.adjacentGrade}.`);
          d.mismatchFlags.forEach((f) => lines.push(`  - ${f.message}`));
        } else {
          lines.push('No boundary or mismatch flags were raised.');
        }
      }
      lines.push('');
      lines.push('This is a classification recommendation, not a final determination.');
      lines.push('HR must confirm final classification.');
      return lines.join('\n');
    },
    async copySummary() {
      try {
        await navigator.clipboard.writeText(this.summaryPlainText);
        this.copyConfirmed = true;
        setTimeout(() => { this.copyConfirmed = false; }, 2000);
      } catch (e) {
        // Clipboard API can fail without HTTPS/permission — fail silently, button stays usable.
      }
    },
    printResults() {
      window.print();
    },

    // ================= reset =================
    resetWizard() {
      this.clearAutoAdvance();
      this.screen = 'intro';
      this.questionCursor = 0;
      this.furthestCursor = 0;
      this.resultsReached = false;
      this.resultsUpdatedNotice = false;
      this._lastResultsSnapshot = null;
      this.expandedDetail = null;
      this.navDirection = 'next';
      this.context = { roleTitle: '', date: todayISO() };
      this.overrideKey = null;
      this.answers = {};
      this.introTouched = false;
      ChartHelper.destroy();
    },

    // ================= keyboard navigation =================
    handleKeydown(e) {
      if (this.screen === 'intro' || this.screen === 'results') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (this.screen === 'methodology') {
        if (e.key === 'Escape' || e.key === 'Backspace') this.closeMethodology();
        return;
      }
      if (this.screen === 'override') {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= this.overrideQuestion.options.length) {
          this.selectOverride(this.overrideQuestion.options[idx - 1].key);
        } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
          this.overrideNext();
        } else if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          this.overrideBack();
        }
        return;
      }
      if (this.screen === 'question') {
        const idx = parseInt(e.key, 10);
        const opts = this.currentQuestion.options;
        if (idx >= 1 && idx <= opts.length) {
          this.selectAnswer(opts[idx - 1].letter);
        } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
          this.questionNext();
        } else if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          this.questionBack();
        }
      }
    },
  };
}

function buildFlatQuestions() {
  const flat = [];
  DOMAIN_ORDER.forEach((domainId) => {
    QUESTIONS[domainId].forEach((q, i) => {
      flat.push({ ...q, domain: domainId, indexInDomain: i, domainTotal: QUESTIONS[domainId].length });
    });
  });
  return flat;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

document.addEventListener('alpine:init', () => {
  Alpine.data('wizardApp', wizardApp);
});