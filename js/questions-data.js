/**
 * Classification Wizard — question bank
 * Source: wizard-question-design.md (Phase 3)
 *
 * QUESTIONS holds the 23 scored domain questions used in the main
 * question loop (KSE1–3, PSJ1–4, AA1–4, LTM1–4, CII1–4, OIS1–4).
 *
 * KSE4 (the named-position override question) is intentionally kept
 * OUT of QUESTIONS.KSE and lives in KSE4_OVERRIDE_QUESTION instead —
 * this is a structural decision, not a convention. It guarantees KSE4
 * can never accidentally enter the KSE domain average, matching the
 * conflation-risk note in wizard-question-design.md and the confirmed
 * scoring decision that KSE domain score = average(KSE1, KSE2, KSE3).
 *
 * `text` is a short, plain-language question stem. `subtitle` gives the
 * manager extra context to help them pick an answer. Neither field
 * affects scoring — only `options[].points` does. Full clause-anchored
 * wording lives in wizard-question-design.md as the source of truth;
 * `text`/`subtitle` here are a deliberately simplified paraphrase of it.
 */

const DOMAIN_META = {
  KSE: { name: 'Knowledge, Skills & Experience', code: 'KSE' },
  PSJ: { name: 'Problem-Solving & Judgement', code: 'PSJ' },
  AA:  { name: 'Accountability & Autonomy', code: 'AA' },
  LTM: { name: 'Leadership & Team Management', code: 'LTM' },
  CII: { name: 'Communication & Interpersonal Influence', code: 'CII' },
  OIS: { name: 'Organisational Impact & Scope', code: 'OIS' },
};

const DOMAIN_ORDER = ['KSE', 'PSJ', 'AA', 'LTM', 'CII', 'OIS'];

const QUESTIONS = {
  KSE: [
    {
      qid: 'KSE1',
      text: 'How much experience does this role need?',
      subtitle: "Think about administrative, technical or health-service management experience — not formal qualifications (that's the next question).",
      options: [
        { letter: 'A', points: 0,   label: 'Limited administrative experience.', clause: '2.1' },
        { letter: 'B', points: 25,  label: "More than 12 months' role or like-role clerical experience.", clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: "Several years' experience, or Certificate/Diploma-level equivalent.", clause: '4.2(a)' },
        { letter: 'D', points: 75,  label: 'Extensive experience with appropriate qualifications, or specialised health-service management experience.', clause: '7.2(a), 8.2(a)' },
        { letter: 'E', points: 100, label: 'Thorough, full health-system management expertise at senior executive level.', clause: '11.2(a), 12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'KSE2',
      text: 'What level of technical knowledge does the role use day to day?',
      subtitle: 'Consider the depth and breadth of specialist or professional knowledge applied in everyday work, not qualifications held.',
      options: [
        { letter: 'A', points: 0,   label: 'Basic hospital systems, procedures and factual transactions.', clause: '2.2(c), 2.2(e)' },
        { letter: 'B', points: 25,  label: 'Established clerical routines and methods.', clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: 'Established technical/admin processes, or broad technical/admin processes.', clause: '5.2(a), 6.2(a)' },
        { letter: 'D', points: 75,  label: 'Knowledge spanning several disciplines, or a complete expert function.', clause: '8.2(a), 8.2(c)' },
        { letter: 'E', points: 100, label: 'All aspects of health care, clinical support, funding and long-term service planning.', clause: '12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'KSE3',
      text: 'Does the role require formal qualifications or accreditation?',
      subtitle: 'Include certificates, diplomas, degrees or professional accreditation the role formally requires — not qualifications the current person happens to hold.',
      options: [
        { letter: 'A', points: 0,   label: 'No explicit qualification; limited experience is sufficient.', clause: '2.1' },
        { letter: 'B', points: 25,  label: 'Technical training or experience exceeding 12 months.', clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: 'Certificate/Diploma level or equivalent.', clause: '4.2(a)' },
        { letter: 'D', points: 75,  label: 'Tertiary graduate, or appropriate tertiary qualifications typically required.', clause: '5.2(a), 8.2(a), 9.2(a)' },
        { letter: 'E', points: 100, label: 'Senior executive health-system expertise rather than a single qualification threshold.', clause: '12.2(a), 13.2(a)' },
      ],
    },
  ],
  PSJ: [
    {
      qid: 'PSJ1',
      text: 'How predictable are the problems this role deals with?',
      subtitle: 'Routine, rule-based problems score lower. Complex, one-off issues needing judgement score higher.',
      options: [
        { letter: 'A', points: 0,   label: 'Standard, factual and predictable transactions.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Established procedures with limited choices guided by precedent or rule.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Varied techniques or methods, selected using guides, precedent or management direction.', clause: '4.2(b)' },
        { letter: 'D', points: 75,  label: 'Detailed analysis of alternatives, cost impacts and implementation implications.', clause: '7.2(b)' },
        { letter: 'E', points: 100, label: 'Complex strategic issues requiring synthesis of opinions, options and achievable plans.', clause: '11.2(b)' },
      ],
    },
    {
      qid: 'PSJ2',
      text: 'How much freedom does the role have in choosing how to do the work?',
      subtitle: "This is about freedom to choose the method or approach — not just the outcome expected of the role.",
      options: [
        { letter: 'A', points: 0,   label: 'Discretion limited by existing procedures and protocols.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Most suitable action selected from a limited range.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Judgement required within broad but known parameters.', clause: '6.2(b)' },
        { letter: 'D', points: 75,  label: 'Determines systems, methods or procedures across a health service or function.', clause: '8.2(b), 9.2(b)' },
        { letter: 'E', points: 100, label: 'Creates new services, standards or strategic plans.', clause: '10.2(b), 13.2(b)' },
      ],
    },
    {
      qid: 'PSJ3',
      text: 'What kind of analysis does the role perform?',
      subtitle: 'From basic fact-checking through to strategic analysis of trends and future plans.',
      options: [
        { letter: 'A', points: 0,   label: 'Basic analysis of a situation or information.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Analyses information and makes recommendations to peers or supervisors.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Sound technical advice, or authoritative advice within a discipline.', clause: '5.2(c), 6.2(c)' },
        { letter: 'D', points: 75,  label: 'Extensive analytical interpretation of service needs, guidelines and achievability.', clause: '8.2(b)' },
        { letter: 'E', points: 100, label: 'Strategic analysis of future plans, trends, service standards and industry-applicable solutions.', clause: '11.2(b), 13.2(b)' },
      ],
    },
    {
      qid: 'PSJ4',
      text: 'Does the role change existing methods or systems?',
      subtitle: 'Consider whether the role just follows procedures, or actively redesigns how things are done.',
      options: [
        { letter: 'A', points: 0,   label: 'No — follows standard procedures.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Chooses between accepted methods.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Selects from standardised systems or techniques.', clause: '5.2(b)' },
        { letter: 'D', points: 75,  label: 'Recommends modification or adaptation impacting other areas.', clause: '7.2(b)' },
        { letter: 'E', points: 100, label: 'Establishes new standards or services, or redesigns service delivery.', clause: '10.2(b)' },
      ],
    },
  ],
  AA: [
    {
      qid: 'AA1',
      text: "How closely is the role's work monitored?",
      subtitle: 'Closely monitored roles have frequent check-ins or reporting. Highly autonomous roles operate under broad policy only.',
      options: [
        { letter: 'A', points: 0,   label: 'Outcomes monitored by a supervisor, or audited by a system.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Progress closely monitored with frequent reporting or instructions.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Closely monitored, but some flexibility in how targets are achieved.', clause: '4.2(c)' },
        { letter: 'D', points: 75,  label: 'Direction defined by results and budgets, with executive/Board/Department review.', clause: '9.2(c)' },
        { letter: 'E', points: 100, label: 'Broad policy only; considerable flexibility and autonomy under Board delegations.', clause: '13.2(c)–(d)' },
      ],
    },
    {
      qid: 'AA2',
      text: 'What decisions can the role make on its own?',
      subtitle: 'Think about independent decision-making authority — not who ultimately signs off or is accountable.',
      options: [
        { letter: 'A', points: 0,   label: 'Works within existing procedures and protocols.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Selects from a limited range of established options.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Organises day-to-day subordinate work and recommends or accepts actions.', clause: '5.2(c)' },
        { letter: 'D', points: 75,  label: 'Designs work programs, allocates resources and controls budgets.', clause: '7.2(c)' },
        { letter: 'E', points: 100, label: 'Determines strategies, budget allocation and major projects under delegation.', clause: '13.2(d)' },
      ],
    },
    {
      qid: 'AA3',
      text: 'What is the role held accountable for?',
      subtitle: 'Consider what the role would be answerable for if something went wrong.',
      options: [
        { letter: 'A', points: 0,   label: 'Accurate routine transactions.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Defined activity standards, targets or budgets.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Major work programs, or authoritative specialist advice.', clause: '6.2(c)' },
        { letter: 'D', points: 75,  label: 'Integrity of a service, project or advice, and significant performance standards across the agency.', clause: '8.2(c)' },
        { letter: 'E', points: 100, label: 'Total health care delivery and service standards, or the full range of operations.', clause: '12.2(c), 13.2(c)' },
      ],
    },
    {
      qid: 'AA4',
      text: 'Can the role commit resources or spend money?',
      subtitle: 'Include authority to approve budgets, allocate resources, or commit the organisation to expenditure.',
      options: [
        { letter: 'A', points: 0,   label: 'No explicit resource authority.', clause: null },
        { letter: 'B', points: 25,  label: 'May process invoices, orders or payments, but does not control resources.', clause: '3.3(e)' },
        { letter: 'C', points: 50,  label: 'Allocates and controls staff or resources within the work area.', clause: '5.3(f)' },
        { letter: 'D', points: 75,  label: 'Controls budgets or resources for significant projects or functions.', clause: '7.2(c)' },
        { letter: 'E', points: 100, label: 'Can commit the organisation to major expenditure within approved policy, or allocate all resources for principal functions.', clause: '11.2(c), 12.2(c)' },
      ],
    },
  ],
  LTM: [
    {
      qid: 'LTM1',
      text: 'Does the role supervise or manage other staff?',
      subtitle: 'Include team size and level, from no supervision through to directing subordinate managers.',
      options: [
        { letter: 'A', points: 0,   label: 'No supervision; may work cooperatively in mixed teams.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Trains new employees in basic functions.', clause: '3.3(d)' },
        { letter: 'C', points: 50,  label: 'Supervises a small group, or senior-supervises a small-to-medium group.', clause: '4.1(a), 5.1(a)' },
        { letter: 'D', points: 75,  label: 'Middle or senior manager of a medium workforce, significant operational area or large division.', clause: '6.1(a), 7.1(a), 8.1(a)' },
        { letter: 'E', points: 100, label: 'Directs subordinate managers, or full executive functions.', clause: '10.3(b), 11.3(b)–(c)' },
      ],
    },
    {
      qid: 'LTM2',
      text: 'What people-management tasks does the role do?',
      subtitle: 'Think rostering, training, recruitment, performance management and workforce planning.',
      options: [
        { letter: 'A', points: 0,   label: 'None beyond basic cooperation.', clause: null },
        { letter: 'B', points: 25,  label: 'Induction or basic training.', clause: '2.2(d), 3.3(d)' },
        { letter: 'C', points: 50,  label: 'Work allocation, training, rostering, guidance or recruitment support.', clause: '5.3(a), 5.4(c)' },
        { letter: 'D', points: 75,  label: 'Establishes work patterns, staff profiles, induction/training programs or consultative mechanisms.', clause: '4.3(c), 6.3(e)–(f), 7.3(f)' },
        { letter: 'E', points: 100, label: 'Directs workforce planning, recruitment, termination, staff development and major HR functions.', clause: '11.3(b)' },
      ],
    },
    {
      qid: 'LTM3',
      text: 'How large or complex is the team being led?',
      subtitle: 'Consider team size and complexity relative to the size of the health service, not just headcount.',
      options: [
        { letter: 'A', points: 0,   label: 'No team leadership.', clause: null },
        { letter: 'B', points: 25,  label: 'A small work group.', clause: '4.1(a)' },
        { letter: 'C', points: 50,  label: 'A small-to-medium work group, or a medium workforce.', clause: '5.1(a), 6.1(a)' },
        { letter: 'D', points: 75,  label: 'A significant operational area, department, large division or varied functions.', clause: '7.1(a), 8.1(a), 8.1(d)' },
        { letter: 'E', points: 100, label: 'Subordinate managers, principal functions, or the full range of operations.', clause: '10.2(a), 11.1(a), 13.2(c)' },
      ],
    },
    {
      qid: 'LTM4',
      text: 'Is the leadership mainly technical, operational or executive?',
      subtitle: 'Technical leadership guides a specific activity. Executive leadership spans whole health-service operations.',
      options: [
        { letter: 'A', points: 0,   label: 'No leadership responsibility.', clause: null },
        { letter: 'B', points: 25,  label: 'Technical or admin leadership within one or two activities.', clause: '4.2(a)' },
        { letter: 'C', points: 50,  label: 'Supervisory or technical leadership for a distinct activity.', clause: '5.2(a)' },
        { letter: 'D', points: 75,  label: 'Integration of several disciplines or a range of support activities.', clause: '8.2(a), 9.2(a)' },
        { letter: 'E', points: 100, label: 'Executive leadership of major or large activities, or full health-service operations.', clause: '10.2(a), 13.2(c)' },
      ],
    },
  ],
  CII: [
    {
      qid: 'CII1',
      text: 'Who does the role regularly talk to?',
      subtitle: 'Think about the most senior or complex audience the role deals with regularly, not just day-to-day contacts.',
      options: [
        { letter: 'A', points: 0,   label: 'Members of the public and the immediate team, on factual matters.', clause: '2.2(e)' },
        { letter: 'B', points: 25,  label: 'External organisations, on routine accounts or claims.', clause: '3.3(h)' },
        { letter: 'C', points: 50,  label: 'Middle management, external agencies, patients/clients and suppliers.', clause: '4.3(b), 4.3(f)–(h)' },
        { letter: 'D', points: 75,  label: 'Senior management, medical officers, unions, rehabilitation providers or Department contacts.', clause: '6.3(g), 7.3(g)' },
        { letter: 'E', points: 100, label: 'Boards, Department executives, government, community representatives and funding stakeholders.', clause: '12.2(a), 13.2(a), 13.3(e)' },
      ],
    },
    {
      qid: 'CII2',
      text: 'How much persuasion or negotiation is needed?',
      subtitle: 'From simply passing on information, through to negotiating with Boards or government.',
      options: [
        { letter: 'A', points: 0,   label: 'Clearly and accurately communicates information.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Obtains cooperation to comply with technical or admin arrangements.', clause: '3.2(a)(iii)' },
        { letter: 'C', points: 50,  label: 'Good or considerable persuasive skills to gain cooperation or workforce adoption.', clause: '4.2(a), 6.2(a)' },
        { letter: 'D', points: 75,  label: 'Persuades peers or subordinates where competing activities exist.', clause: '7.2(a), 8.2(a)' },
        { letter: 'E', points: 100, label: 'Negotiates difficult or sensitive issues, or persuades Boards, Department, government and community representatives.', clause: '10.2(a), 12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'CII3',
      text: 'Does the role represent the health service externally?',
      subtitle: 'Include speaking on behalf of the organisation to outside bodies, the media, or the public.',
      options: [
        { letter: 'A', points: 0,   label: 'No external representation.', clause: null },
        { letter: 'B', points: 25,  label: 'Routine contact with external organisations.', clause: '3.3(h)' },
        { letter: 'C', points: 50,  label: 'Routine liaison with external agencies or suppliers.', clause: '4.3(f), 4.3(h)' },
        { letter: 'D', points: 75,  label: 'Advocates at tribunals or in labour negotiations.', clause: '7.3(g)' },
        { letter: 'E', points: 100, label: 'Represents the health service to the Department or professional bodies, or acts as spokesperson in public forums.', clause: '10.3(c), 11.2(c)' },
      ],
    },
    {
      qid: 'CII4',
      text: 'How sensitive are the matters this role communicates?',
      subtitle: 'Consider the stakes if these conversations go wrong — routine information versus high-stakes negotiations.',
      options: [
        { letter: 'A', points: 0,   label: 'Standard factual information.', clause: null },
        { letter: 'B', points: 25,  label: 'Routine technical or admin information.', clause: null },
        { letter: 'C', points: 50,  label: 'Staff problems, safe work practices, routine patient or client issues.', clause: '5.3(g)–(h)' },
        { letter: 'D', points: 75,  label: 'Industrial relations, disciplinary matters, consultative strategies and budget overruns.', clause: '7.3(f)–(g), 8.3(f)' },
        { letter: 'E', points: 100, label: 'Major service delivery, facilities, resources, funding agreements or government/Board-level matters.', clause: '11.2(a), 13.3(e)' },
      ],
    },
  ],
  OIS: [
    {
      qid: 'OIS1',
      text: 'What part of the organisation does the role affect?',
      subtitle: 'From a single task through to the whole health service.',
      options: [
        { letter: 'A', points: 0,   label: 'Individual tasks or work-area outcomes.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'A defined activity or specified function.', clause: '3.1, 4.3(a)' },
        { letter: 'C', points: 50,  label: 'A specified activity recognised across the health service, or a managed function.', clause: '5.1(c), 6.1(b)' },
        { letter: 'D', points: 75,  label: 'A significant operational area, large division, varied functions or agency-wide function.', clause: '7.1(a), 8.1(a)–(d)' },
        { letter: 'E', points: 100, label: 'The whole health service, a major multi-campus institution, or the full range of operations.', clause: '11.1(a), 12.2(c), 13.2(c)' },
      ],
    },
    {
      qid: 'OIS2',
      text: 'Does the role affect budgets or resources?',
      subtitle: 'Include monitoring, controlling, or negotiating budgets, funding or resource allocation.',
      options: [
        { letter: 'A', points: 0,   label: 'No budget or resource responsibility.', clause: null },
        { letter: 'B', points: 25,  label: 'Monitors billings, invoices, orders or accounts.', clause: '3.3(b), 3.3(e)' },
        { letter: 'C', points: 50,  label: 'Implements controls/systems and allocates work-area resources.', clause: '5.3(c), 5.3(f)' },
        { letter: 'D', points: 75,  label: 'Plans operating budgets, resource requirements or financial controls.', clause: '7.3(a), 8.3(b)' },
        { letter: 'E', points: 100, label: 'Develops or negotiates budgets or funding agreements across all health-service activities.', clause: '12.3(a), 13.3(a), 13.3(e)' },
      ],
    },
    {
      qid: 'OIS3',
      text: 'How far ahead does the role plan?',
      subtitle: 'From day-to-day tasks through to long-term strategic and capital planning.',
      options: [
        { letter: 'A', points: 0,   label: 'Daily transactions and tasks.', clause: null },
        { letter: 'B', points: 25,  label: 'Work progress, routine reports or meeting coordination.', clause: '3.3(a), 3.3(i)' },
        { letter: 'C', points: 50,  label: 'Work programs, rosters, training programs or special projects.', clause: '6.2(c), 6.3(c)–(d), 6.3(f)' },
        { letter: 'D', points: 75,  label: 'Business plans, operating targets, future growth forecasts or short/medium/long-term goals.', clause: '8.2(c), 8.3(a), 9.3(e)' },
        { letter: 'E', points: 100, label: 'Strategic, capital, resource and service-delivery plans for major health services.', clause: '12.2(b), 13.3(d)' },
      ],
    },
    {
      qid: 'OIS4',
      text: 'How broad is the service or function being managed?',
      subtitle: 'From a single task, through to the full range of services across a large health service.',
      options: [
        { letter: 'A', points: 0,   label: 'A single task or transaction stream.', clause: null },
        { letter: 'B', points: 25,  label: 'One defined administrative activity.', clause: null },
        { letter: 'C', points: 50,  label: 'One function, or a distinct activity coordinated with others.', clause: '5.2(a), 6.1(b)' },
        { letter: 'D', points: 75,  label: 'A range of services across a small health service, or a significant service function in a medium-to-large service.', clause: '7.3(e), 8.3(d)' },
        { letter: 'E', points: 100, label: 'The full range of services and functions, all aspects of health care, or large regional health service operations.', clause: '10.3(e), 12.2(a), 13.2(a)–(c)' },
      ],
    },
  ],
};

/**
 * KSE4 — named-position override question.
 * Kept separate from QUESTIONS.KSE (see file header).
 *
 * Simplified per user request: this now just asks whether the role
 * matches any of the listed named positions, instead of asking the
 * manager to interpret "named position... assigns to a specific grade"
 * legal phrasing up front.
 *
 * Note: wizard-question-design.md compresses two distinct named
 * positions (NAATI two-or-more-language interpreter/translator, and
 * management of Dental Maintenance Technicians) into a single lettered
 * option "E". scoring-and-recommendation-logic.md's JSON schema and
 * output-package.md's validation checklist both treat these as five
 * distinct overrides. Five distinct selectable options are used here
 * so each named position keeps its own clause citation and is testable
 * as its own edge case, rather than conflating two clauses under one
 * answer.
 */
const KSE4_OVERRIDE_QUESTION = {
  qid: 'KSE4',
  text: 'Does this role match any of the positions below?',
  subtitle: "These are the only roles the Agreement locks to a fixed grade regardless of duties. If none apply, select \"No\" and continue to the assessment questions.",
  options: [
    { letter: 'A', key: 'none', label: 'No — none of these match this role.', grade: null, clause: null },
    { letter: 'B', key: 'interpreter_unqualified', label: 'Interpreter, unqualified', grade: 'Grade 1', clause: '3.4(a)' },
    { letter: 'C', key: 'naati_one_language', label: 'NAATI-accredited interpreter/translator, capable of interpreting into one other language', grade: 'Grade 2', clause: '4.4(a)' },
    { letter: 'D', key: 'workplace_trainer_careers_advisor', label: 'Workplace Trainer / Careers Advisor', grade: 'Grade 3', clause: '5.4(a)' },
    { letter: 'E', key: 'naati_two_or_more_languages', label: 'NAATI-accredited interpreter/translator, capable of interpreting/translating into two or more languages', grade: 'Grade 3', clause: '5.4(b)' },
    { letter: 'F', key: 'dental_maintenance_technician_manager', label: 'Manager of Dental Maintenance Technicians (work allocation, training, rostering, guidance, possible recruitment assistance)', grade: 'Grade 3', clause: '5.4(c)' },
  ],
};

// Dual export for browser (global) + Node (module.exports), used by scoring.test.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, KSE4_OVERRIDE_QUESTION, DOMAIN_META, DOMAIN_ORDER };
}