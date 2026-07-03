/**
 * Classification Wizard — question bank (SIMPLIFIED LABELS PASS)
 * Source: wizard-question-design.md (Phase 3), scoring unchanged.
 *
 * Change log (this pass):
 * - `label` text rewritten in plain language across all 24 questions.
 * - Role-level anchors (e.g. "a Senior Manager or Department Head role")
 *   are INTENTIONALLY LIMITED to the `detail` field of the four densest
 *   questions only: KSE1, PSJ1, OIS1, OIS4. Every other question's
 *   `label` carries no role anchor at all.
 *   Reasoning: anchoring nearly every option to a role level let users
 *   pattern-match to "my job title" and pick the same letter on every
 *   question regardless of domain, defeating the point of a per-domain
 *   assessment. Anchors now only surface where a user has explicitly
 *   asked for more context ("Tell me more"), not in the default view.
 * - Where anchors do appear (KSE1, PSJ1, OIS1, OIS4 `detail` only), they
 *   are derived from the EBA's OWN grade-band language in Schedule 3D
 *   Part 1, not from Delegations of Authority Policy titles:
 *     0   pts -> Grade 1A (no distinct title in the EBA)
 *     25  pts -> Grade 1-2: Administrative Officer / small-team Coordinator
 *     50  pts -> Grade 3-4: Team Leader / Manager
 *     75  pts -> Grade 5-7: Senior Manager / Department Head
 *     100 pts -> Grade 8-11: Director / Executive
 * - `points`, `letter`, `clause` are UNCHANGED on every option. Scoring,
 *   grade lookup, and legal traceability are unaffected by this file.
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
      subtitle: "Think mainly about hands-on administrative, technical or health-service management experience. At some grades the Agreement treats an equivalent qualification as meeting the same threshold — noted where it applies. Standalone or additional qualification requirements are covered separately in question 3.",
      options: [
        { letter: 'A', points: 0,   label: 'New to admin work, or very little needed.', detail: 'Limited administrative experience — e.g. an entry-level Officer role.', clause: '2.1' },
        { letter: 'B', points: 25,  label: "At least a year doing this or similar clerical/admin work.", detail: "More than 12 months' role or like-role clerical experience.", clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: "Several years' experience, or a Cert/Diploma.", detail: "Several years' experience, or Certificate/Diploma-level equivalent (treated as interchangeable at this grade) — e.g. a Manager-level role.", clause: '4.2(a)' },
        { letter: 'D', points: 75,  label: 'Deep experience plus relevant qualifications.', detail: 'Extensive experience with appropriate qualifications, or specialised health-service management experience — e.g. a Senior Manager or Department Head role.', clause: '7.2(a), 8.2(a)' },
        { letter: 'E', points: 100, label: 'Executive-level expertise across the whole health system.', detail: 'Thorough, full health-system management expertise at senior executive level — e.g. a Director or Executive role.', clause: '11.2(a), 12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'KSE2',
      text: 'What level of technical knowledge does the role use day to day?',
      subtitle: 'Consider the depth and breadth of specialist or professional knowledge applied in everyday work, not qualifications held.',
      options: [
        { letter: 'A', points: 0,   label: 'Basic hospital systems and routine tasks.', clause: '2.2(c), 2.2(e)' },
        { letter: 'B', points: 25,  label: 'Standard clerical routines and methods.', clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: 'Solid working knowledge of admin/technical processes.', clause: '5.2(a), 6.2(a)' },
        { letter: 'D', points: 75,  label: 'Expert across several disciplines, or one full specialist function.', clause: '8.2(a), 8.2(c)' },
        { letter: 'E', points: 100, label: 'Knowledge spanning all of health care, clinical support, funding and long-term planning.', clause: '12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'KSE3',
      text: 'Does the role require formal qualifications or accreditation?',
      subtitle: 'Include certificates, diplomas, degrees or professional accreditation the role formally requires — not qualifications the current person happens to hold.',
      options: [
        { letter: 'A', points: 0,   label: 'No formal qualification needed — some experience is enough.', clause: '2.1' },
        { letter: 'B', points: 25,  label: 'Technical training, or over a year of relevant experience.', clause: '3.2(a)(i)' },
        { letter: 'C', points: 50,  label: 'Certificate or Diploma level, or equivalent.', clause: '4.2(a)' },
        { letter: 'D', points: 75,  label: 'A relevant university degree is typically required.', clause: '5.2(a), 8.2(a), 9.2(a)' },
        { letter: 'E', points: 100, label: 'Senior executive-level expertise, not tied to one specific qualification.', clause: '12.2(a), 13.2(a)' },
      ],
    },
  ],
  PSJ: [
    {
      qid: 'PSJ1',
      text: 'How predictable are the problems this role deals with?',
      subtitle: 'Routine, rule-based problems score lower. Complex, one-off issues needing judgement score higher.',
      options: [
        { letter: 'A', points: 0,   label: 'Routine and predictable.', detail: 'Standard, factual and predictable transactions — e.g. an Officer processing routine requests.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Mostly routine, following set rules.', detail: 'Established procedures with limited choices guided by precedent or rule.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Varied problems, solved using guidelines or past examples.', detail: 'Varied techniques or methods, selected using guides, precedent or management direction — e.g. a Manager or Supervisor.', clause: '4.2(b)' },
        { letter: 'D', points: 75,  label: 'Complex, needing detailed analysis of options and impacts.', detail: 'Detailed analysis of alternatives, cost impacts and implementation implications — e.g. a Senior Manager or Department Head role.', clause: '7.2(b)' },
        { letter: 'E', points: 100, label: 'Strategic problems with no set answer.', detail: 'Complex strategic issues requiring synthesis of opinions, options and achievable plans — e.g. a Director or Executive role.', clause: '11.2(b)' },
      ],
    },
    {
      qid: 'PSJ2',
      text: 'How much freedom does the role have in choosing how to do the work?',
      subtitle: "This is about freedom to choose the method or approach — not just the outcome expected of the role.",
      options: [
        { letter: 'A', points: 0,   label: 'Must follow set procedures.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Picks the best option from a short list.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Uses judgement within known limits.', clause: '6.2(b)' },
        { letter: 'D', points: 75,  label: 'Sets the methods or systems for a service or function.', clause: '8.2(b), 9.2(b)' },
        { letter: 'E', points: 100, label: 'Creates new services or strategic direction.', clause: '10.2(b), 13.2(b)' },
      ],
    },
    {
      qid: 'PSJ3',
      text: 'What kind of analysis does the role perform?',
      subtitle: 'From basic fact-checking through to strategic analysis of trends and future plans.',
      options: [
        { letter: 'A', points: 0,   label: 'Basic checking of information.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Reviews information and suggests actions to a supervisor.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Gives sound technical or specialist advice.', clause: '5.2(c), 6.2(c)' },
        { letter: 'D', points: 75,  label: 'In-depth analysis of service needs and what is achievable.', clause: '8.2(b)' },
        { letter: 'E', points: 100, label: 'Strategic analysis of future trends and service direction.', clause: '11.2(b), 13.2(b)' },
      ],
    },
    {
      qid: 'PSJ4',
      text: 'Does the role change existing methods or systems?',
      subtitle: 'Consider whether the role just follows procedures, or actively redesigns how things are done.',
      options: [
        { letter: 'A', points: 0,   label: 'No — follows standard procedures.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Chooses between accepted methods.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Selects from established systems or techniques.', clause: '5.2(b)' },
        { letter: 'D', points: 75,  label: 'Recommends changes that affect other teams.', clause: '7.2(b)' },
        { letter: 'E', points: 100, label: 'Sets new standards or redesigns how services are delivered.', clause: '10.2(b)' },
      ],
    },
  ],
  AA: [
    {
      qid: 'AA1',
      text: "How closely is the role's work monitored?",
      subtitle: 'Closely monitored roles have frequent check-ins or reporting. Highly autonomous roles operate under broad policy only.',
      options: [
        { letter: 'A', points: 0,   label: 'A supervisor checks the results.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Closely supervised, with regular check-ins.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Supervised, but some freedom in how you get there.', clause: '4.2(c)' },
        { letter: 'D', points: 75,  label: 'Judged mainly on results and budget, reviewed by senior leadership.', clause: '9.2(c)' },
        { letter: 'E', points: 100, label: 'Works independently under broad Board policy.', clause: '13.2(c)–(d)' },
      ],
    },
    {
      qid: 'AA2',
      text: 'What decisions can the role make on its own?',
      subtitle: 'Think about independent decision-making authority — not who ultimately signs off or is accountable.',
      options: [
        { letter: 'A', points: 0,   label: 'Works within set procedures.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Picks from a short list of approved options.', clause: '3.2(b)' },
        { letter: 'C', points: 50,  label: 'Organises day-to-day team work and recommends actions.', clause: '5.2(c)' },
        { letter: 'D', points: 75,  label: 'Designs work programs and controls a budget.', clause: '7.2(c)' },
        { letter: 'E', points: 100, label: 'Decides strategy and major projects under Board delegation.', clause: '13.2(d)' },
      ],
    },
    {
      qid: 'AA3',
      text: 'What is the role held accountable for?',
      subtitle: 'Consider what the role would be answerable for if something went wrong.',
      options: [
        { letter: 'A', points: 0,   label: 'Getting routine tasks right.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Meeting set standards, targets or a small budget.', clause: '3.2(c)' },
        { letter: 'C', points: 50,  label: 'Major work programs or expert advice.', clause: '6.2(c)' },
        { letter: 'D', points: 75,  label: 'The quality of a whole service or major project.', clause: '8.2(c)' },
        { letter: 'E', points: 100, label: 'Overall care standards and outcomes for the health service.', clause: '12.2(c), 13.2(c)' },
      ],
    },
    {
      qid: 'AA4',
      text: 'Can the role commit resources or spend money?',
      subtitle: 'Include authority to approve budgets, allocate resources, or commit the organisation to expenditure.',
      options: [
        { letter: 'A', points: 0,   label: 'No spending authority.', clause: null },
        { letter: 'B', points: 25,  label: 'Processes invoices or orders, but doesn\u2019t control the budget.', clause: '3.3(e)' },
        { letter: 'C', points: 50,  label: 'Allocates and controls resources for the team.', clause: '5.3(f)' },
        { letter: 'D', points: 75,  label: 'Controls the budget for a significant project or function.', clause: '7.2(c)' },
        { letter: 'E', points: 100, label: 'Can commit major spending within Board-approved policy.', clause: '11.2(c), 12.2(c)' },
      ],
    },
  ],
  LTM: [
    {
      qid: 'LTM1',
      text: 'Does the role supervise or manage other staff?',
      subtitle: 'Include team size and level, from no supervision through to directing subordinate managers.',
      options: [
        { letter: 'A', points: 0,   label: 'No supervision; may work in a team.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'Trains new starters in basic tasks.', clause: '3.3(d)' },
        { letter: 'C', points: 50,  label: 'Supervises a small team.', clause: '4.1(a), 5.1(a)' },
        { letter: 'D', points: 75,  label: 'Manages a mid-size or large team.', clause: '6.1(a), 7.1(a), 8.1(a)' },
        { letter: 'E', points: 100, label: 'Leads other managers, or runs full executive functions.', clause: '10.3(b), 11.3(b)–(c)' },
      ],
    },
    {
      qid: 'LTM2',
      text: 'What people-management tasks does the role do?',
      subtitle: 'Think rostering, training, recruitment, performance management and workforce planning.',
      options: [
        { letter: 'A', points: 0,   label: 'None beyond working cooperatively with others.', clause: null },
        { letter: 'B', points: 25,  label: 'Basic induction or training for new staff.', clause: '2.2(d), 3.3(d)' },
        { letter: 'C', points: 50,  label: 'Day-to-day people tasks: rostering, training, guiding staff.', clause: '5.3(a), 5.4(c)' },
        { letter: 'D', points: 75,  label: 'Designs how the team works: staffing, training programs, staff consultation.', clause: '4.3(c), 6.3(e)–(f), 7.3(f)' },
        { letter: 'E', points: 100, label: 'Owns major HR decisions: hiring, termination, workforce planning.', clause: '11.3(b)' },
      ],
    },
    {
      qid: 'LTM3',
      text: 'How large or complex is the team being led?',
      subtitle: 'Consider team size and complexity relative to the size of the health service, not just headcount.',
      options: [
        { letter: 'A', points: 0,   label: 'No team leadership.', clause: null },
        { letter: 'B', points: 25,  label: 'A small work group.', clause: '4.1(a)' },
        { letter: 'C', points: 50,  label: 'A small-to-medium team.', clause: '5.1(a), 6.1(a)' },
        { letter: 'D', points: 75,  label: 'A large team or division with varied functions.', clause: '7.1(a), 8.1(a), 8.1(d)' },
        { letter: 'E', points: 100, label: 'Other managers, or the entire organisation.', clause: '10.2(a), 11.1(a), 13.2(c)' },
      ],
    },
    {
      qid: 'LTM4',
      text: 'Is the leadership mainly technical, operational or executive?',
      subtitle: 'Technical leadership guides a specific activity. Executive leadership spans whole health-service operations.',
      options: [
        { letter: 'A', points: 0,   label: 'No leadership responsibility.', clause: null },
        { letter: 'B', points: 25,  label: 'Technical or admin lead for one or two activities.', clause: '4.2(a)' },
        { letter: 'C', points: 50,  label: 'Supervisory or technical lead for one activity.', clause: '5.2(a)' },
        { letter: 'D', points: 75,  label: 'Coordinates several disciplines or support areas.', clause: '8.2(a), 9.2(a)' },
        { letter: 'E', points: 100, label: 'Executive leadership across large or whole-of-service operations.', clause: '10.2(a), 13.2(c)' },
      ],
    },
  ],
  CII: [
    {
      qid: 'CII1',
      text: 'Who does the role regularly talk to?',
      subtitle: 'Think about the most senior or complex audience the role deals with regularly, not just day-to-day contacts.',
      options: [
        { letter: 'A', points: 0,   label: 'The public and the immediate team, on routine matters.', clause: '2.2(e)' },
        { letter: 'B', points: 25,  label: 'External organisations, on routine accounts or claims.', clause: '3.3(h)' },
        { letter: 'C', points: 50,  label: 'Middle managers, external agencies, patients/clients and suppliers.', clause: '4.3(b), 4.3(f)–(h)' },
        { letter: 'D', points: 75,  label: 'Senior managers, medical staff, unions or Department contacts.', clause: '6.3(g), 7.3(g)' },
        { letter: 'E', points: 100, label: 'The Board, government, or funding bodies.', clause: '12.2(a), 13.2(a), 13.3(e)' },
      ],
    },
    {
      qid: 'CII2',
      text: 'How much persuasion or negotiation is needed?',
      subtitle: 'From simply passing on information, through to negotiating with Boards or government.',
      options: [
        { letter: 'A', points: 0,   label: 'Passes on information clearly and accurately.', clause: '2.2(b)' },
        { letter: 'B', points: 25,  label: 'Gets others to follow routine procedures.', clause: '3.2(a)(iii)' },
        { letter: 'C', points: 50,  label: 'Persuades others to support a plan or change.', clause: '4.2(a), 6.2(a)' },
        { letter: 'D', points: 75,  label: 'Negotiates with peers or teams with competing priorities.', clause: '7.2(a), 8.2(a)' },
        { letter: 'E', points: 100, label: 'Negotiates sensitive issues with the Board, government or community.', clause: '10.2(a), 12.2(a), 13.2(a)' },
      ],
    },
    {
      qid: 'CII3',
      text: 'Does the role represent the health service externally?',
      subtitle: 'Include speaking on behalf of the organisation to outside bodies, the media, or the public.',
      options: [
        { letter: 'A', points: 0,   label: 'No external representation.', clause: null },
        { letter: 'B', points: 25,  label: 'Routine contact with outside organisations.', clause: '3.3(h)' },
        { letter: 'C', points: 50,  label: 'Regular liaison with external agencies or suppliers.', clause: '4.3(f), 4.3(h)' },
        { letter: 'D', points: 75,  label: 'Represents Austin Health at tribunals or in negotiations.', clause: '7.3(g)' },
        { letter: 'E', points: 100, label: 'Represents Austin Health to Government or as a public spokesperson.', clause: '10.3(c), 11.2(c)' },
      ],
    },
    {
      qid: 'CII4',
      text: 'How sensitive are the matters this role communicates?',
      subtitle: 'Consider the stakes if these conversations go wrong — routine information versus high-stakes negotiations.',
      options: [
        { letter: 'A', points: 0,   label: 'Standard factual information.', clause: null },
        { letter: 'B', points: 25,  label: 'Routine technical or admin information.', clause: null },
        { letter: 'C', points: 50,  label: 'Staff issues, safe work practices, routine patient/client matters.', clause: '5.3(g)–(h)' },
        { letter: 'D', points: 75,  label: 'Industrial relations, discipline, budget overruns.', clause: '7.3(f)–(g), 8.3(f)' },
        { letter: 'E', points: 100, label: 'Major funding, government or Board-level matters.', clause: '11.2(a), 13.3(e)' },
      ],
    },
  ],
  OIS: [
    {
      qid: 'OIS1',
      text: 'What part of the organisation does the role affect?',
      subtitle: 'From a single task through to the whole health service.',
      options: [
        { letter: 'A', points: 0,   label: 'Individual tasks or one work area.', detail: 'Individual tasks or work-area outcomes.', clause: '2.2(c)' },
        { letter: 'B', points: 25,  label: 'One defined activity or function.', detail: 'A defined activity or specified function.', clause: '3.1, 4.3(a)' },
        { letter: 'C', points: 50,  label: 'An activity recognised across the health service.', detail: 'A specified activity recognised across the health service, or a managed function — e.g. a Team Leader or Manager role.', clause: '5.1(c), 6.1(b)' },
        { letter: 'D', points: 75,  label: 'A significant operational area or large division.', detail: 'A significant operational area, large division, varied functions or agency-wide function — e.g. a Senior Manager or Department Head role.', clause: '7.1(a), 8.1(a)–(d)' },
        { letter: 'E', points: 100, label: 'The whole health service.', detail: 'The whole health service, a major multi-campus institution, or the full range of operations — e.g. a Director or Executive role.', clause: '11.1(a), 12.2(c), 13.2(c)' },
      ],
    },
    {
      qid: 'OIS2',
      text: 'Does the role affect budgets or resources?',
      subtitle: 'Include monitoring, controlling, or negotiating budgets, funding or resource allocation.',
      options: [
        { letter: 'A', points: 0,   label: 'No budget or resource responsibility.', clause: null },
        { letter: 'B', points: 25,  label: 'Monitors invoices, orders or accounts.', clause: '3.3(b), 3.3(e)' },
        { letter: 'C', points: 50,  label: 'Manages controls and allocates team resources.', clause: '5.3(c), 5.3(f)' },
        { letter: 'D', points: 75,  label: 'Plans operating budgets or financial controls.', clause: '7.3(a), 8.3(b)' },
        { letter: 'E', points: 100, label: 'Negotiates budgets or funding agreements service-wide.', clause: '12.3(a), 13.3(a), 13.3(e)' },
      ],
    },
    {
      qid: 'OIS3',
      text: 'How far ahead does the role plan?',
      subtitle: 'From day-to-day tasks through to long-term strategic and capital planning.',
      options: [
        { letter: 'A', points: 0,   label: 'Daily tasks.', clause: null },
        { letter: 'B', points: 25,  label: 'Routine reports or coordinating meetings.', clause: '3.3(a), 3.3(i)' },
        { letter: 'C', points: 50,  label: 'Work programs, rosters or projects.', clause: '6.2(c), 6.3(c)–(d), 6.3(f)' },
        { letter: 'D', points: 75,  label: 'Business plans and short/medium/long-term goals.', clause: '8.2(c), 8.3(a), 9.3(e)' },
        { letter: 'E', points: 100, label: 'Strategic and capital plans for the whole health service.', clause: '12.2(b), 13.3(d)' },
      ],
    },
    {
      qid: 'OIS4',
      text: 'How broad is the service or function being managed?',
      subtitle: 'From a single task, through to the full range of services across a large health service.',
      options: [
        { letter: 'A', points: 0,   label: 'A single task.', detail: 'A single task or transaction stream.', clause: null },
        { letter: 'B', points: 25,  label: 'One defined admin activity.', detail: 'One defined administrative activity.', clause: null },
        { letter: 'C', points: 50,  label: 'One function, coordinated with others.', detail: 'One function, or a distinct activity coordinated with others — e.g. a Team Leader or Manager role.', clause: '5.2(a), 6.1(b)' },
        { letter: 'D', points: 75,  label: 'A range of services in a small-to-medium health service.', detail: 'A range of services across a small health service, or a significant service function in a medium-to-large service — e.g. a Senior Manager or Department Head role.', clause: '7.3(e), 8.3(d)' },
        { letter: 'E', points: 100, label: 'The full range of services across a large health service.', detail: 'The full range of services and functions, all aspects of health care, or large regional health service operations — e.g. a Director or Executive role.', clause: '10.3(e), 12.2(a), 13.2(a)–(c)' },
      ],
    },
  ],
};

/**
 * KSE4 — named-position override question (unchanged from prior pass;
 * already plain-language, no generic role anchors needed since these
 * ARE the specific named positions the Agreement locks to a grade).
 */
const KSE4_OVERRIDE_QUESTION = {
  qid: 'KSE4',
  text: 'Does this role match any of the positions below?',
  subtitle: "These are the only roles the Agreement locks to a fixed grade regardless of duties. If none apply, select \"No\" and continue to the assessment questions.",
  options: [
    { letter: 'A', key: 'none', label: 'No — none of these match this role.', grade: null, clause: null },
    { letter: 'B', key: 'interpreter_unqualified', label: 'Interpreter, unqualified.', grade: 'Grade 1', clause: '3.4(a)' },
    { letter: 'C', key: 'naati_one_language', label: 'NAATI-accredited interpreter/translator, capable of interpreting into one other language.', grade: 'Grade 2', clause: '4.4(a)' },
    { letter: 'D', key: 'workplace_trainer_careers_advisor', label: 'Workplace Trainer / Careers Advisor.', grade: 'Grade 3', clause: '5.4(a)' },
    { letter: 'E', key: 'naati_two_or_more_languages', label: 'NAATI-accredited interpreter/translator, capable of interpreting/translating into two or more languages.', grade: 'Grade 3', clause: '5.4(b)' },
    { letter: 'F', key: 'dental_maintenance_technician_manager', label: 'Manager of Dental Maintenance Technicians (work allocation, training, rostering, guidance, possible recruitment assistance).', grade: 'Grade 3', clause: '5.4(c)' },
  ],
};

// Dual export for browser (global) + Node (module.exports), used by scoring.test.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, KSE4_OVERRIDE_QUESTION, DOMAIN_META, DOMAIN_ORDER };
}