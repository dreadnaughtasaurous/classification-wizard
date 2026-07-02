/**
 * Classification Wizard — Alpine.js application state and flow control.
 *
 * Screen flow:
 *   intro -> override -> [results, terminal via named override]
 *                      -> question (x23, grouped by domain) -> results
 *
 * All scoring math lives in scoring.js; this file only orchestrates the
 * wizard flow and reads/writes Alpine state.
 */

function wizardApp() {
  return {
    // ---------- theme ----------
    theme: 'light',

    // ---------- navigation ----------
    screen: 'intro', // intro | override | question | results
    questionCursor: 0,
    // Furthest point the user has reached in the linear flow. Used so that
    // jumping back via the sidebar to review/change an earlier answer never
    // loses the user's place — they can always return to exactly where they were.
    furthestCursor: 0,
    resultsReached: false,
    resultsUpdatedNotice: false,
    _lastResultsSnapshot: null,
    sidebarOpen: false,
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
    canJumpTo(stepId) {
      if (this.overrideResult) return stepId === 'intro' || stepId === 'override' || stepId === 'results';
      const status = this.stepStatus(stepId);
      return status === 'done' || status === 'current';
    },
    jumpTo(stepId) {
      if (!this.canJumpTo(stepId)) return;
      this.clearAutoAdvance();
      this.sidebarOpen = false;
      if (stepId === 'intro') { this.screen = 'intro'; return; }
      if (stepId === 'override') { this.screen = 'override'; return; }
      if (stepId === 'results') { if (this.finalResult) this.enterResults(); return; }
      if (this.domainOrder.includes(stepId)) {
        const idx = this.flatQuestions.findIndex((q) => q.domain === stepId);
        // Jumping via the sidebar only changes *where you're looking* — it never
        // resets furthestCursor, so "Continue where you left off" always works.
        if (idx >= 0) { this.questionCursor = idx; this.screen = 'question'; }
      }
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
    selectAnswer(letter) {
      this.answers[this.currentQuestion.qid] = letter;
      this.scheduleAutoAdvance(() => this.questionNext());
    },
    questionNext() {
      this.clearAutoAdvance();
      if (!this.answers[this.currentQuestion.qid]) return;
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
      if (this.questionCursor > 0) {
        this.questionCursor -= 1;
      } else {
        this.screen = 'override';
      }
    },

    // ================= results output =================
    get summaryProse() {
      const r = this.finalResult;
      if (!r) return '';
      const who = this.context.roleTitle || 'this role';
      const sentences = [];
      sentences.push(`This classification wizard recommends ${r.grade} for the ${who} role.`);
      if (r.type === 'override') {
        sentences.push(`This is a mandatory named-position classification under clause ${r.clause} (${r.label}), and does not rely on the scored assessment.`);
      } else {
        sentences.push(`This is based on a weighted assessment score of ${r.weightedTotal}/100, calculated within the ${r.band.label} weighting band.`);
        if (r.hrReviewRequired) {
          const reasons = [];
          if (r.boundaryFlag) reasons.push(`the score sits close to the ${r.adjacentGrade} boundary`);
          r.mismatchFlags.forEach((f) => reasons.push(f.message.replace(/\.$/, '').toLowerCase()));
          sentences.push(`HR review is recommended before finalising this classification, because ${reasons.join('; ')}.`);
        } else {
          sentences.push('No grade-boundary or domain-mismatch flags were raised during the assessment.');
        }
      }
      sentences.push(`Assessment recorded on ${this.context.date}.`);
      sentences.push('This is a classification recommendation, not a final determination — HR must confirm the final classification.');
      return sentences.join(' ');
    },
    get summaryPlainText() {
      const r = this.finalResult;
      if (!r) return '';
      const lines = [];
      lines.push('CLASSIFICATION WIZARD — RECOMMENDATION SUMMARY');
      lines.push('Health and Allied Services, Managers and Administrative Workers (Victorian Public Sector) Enterprise Agreement 2025-2027, Schedule 3D Part 1');
      lines.push('');
      lines.push(`Role title: ${this.context.roleTitle || '—'}`);
      lines.push(`Date: ${this.context.date}`);
      lines.push('');
      lines.push(`RECOMMENDED GRADE: ${r.grade}`);
      lines.push('');
      if (r.type === 'override') {
        lines.push(`Basis: mandatory named-position override, clause ${r.clause} (${r.label}).`);
      } else {
        lines.push(`Basis: weighted assessment score ${r.weightedTotal}/100 (${r.band.label} weighting band).`);
        lines.push('');
        lines.push('Domain scores (0-100):');
        this.domainOrder.forEach((d) => {
          lines.push(`  - ${this.domainMeta[d].name}: ${r.domainScores[d]}`);
        });
        lines.push('');
        if (r.hrReviewRequired) {
          lines.push('HR REVIEW RECOMMENDED:');
          if (r.boundaryFlag) lines.push(`  - Score is close to a grade boundary; possible alternative grade: ${r.adjacentGrade}.`);
          r.mismatchFlags.forEach((f) => lines.push(`  - ${f.message}`));
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
    downloadSummary() {
      const blob = new Blob([this.summaryPlainText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeRole = (this.context.roleTitle || 'role').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      a.href = url;
      a.download = `classification-summary-${safeRole || 'role'}-${this.context.date}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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

      if (this.screen === 'override') {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= this.overrideQuestion.options.length) {
          this.selectOverride(this.overrideQuestion.options[idx - 1].key);
        } else if (e.key === 'Enter') {
          this.overrideNext();
        } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
          this.overrideBack();
        }
        return;
      }
      if (this.screen === 'question') {
        const idx = parseInt(e.key, 10);
        const opts = this.currentQuestion.options;
        if (idx >= 1 && idx <= opts.length) {
          this.selectAnswer(opts[idx - 1].letter);
        } else if (e.key === 'Enter') {
          this.questionNext();
        } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
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

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

document.addEventListener('alpine:init', () => {
  Alpine.data('wizardApp', wizardApp);
});