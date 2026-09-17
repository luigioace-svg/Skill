export type Difficulty = 'Foundation' | 'Beginner' | 'Intermediate' | 'Advanced';

export type Resource = {
  title: string;
  provider: string;
  type: 'Article' | 'Guide' | 'Course' | 'Documentation';
  minutes: number;
  url: string;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  resources: Resource[];
  practice: string;
};

export type Subject = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: Difficulty;
  hours: number;
  accent: string;
  softAccent: string;
  prerequisites: string[];
  targetJobs: string[];
  skills: string[];
  lessons: Lesson[];
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
};

const resource = (title: string, provider: string, type: Resource['type'], minutes: number, url: string): Resource => ({ title, provider, type, minutes, url });
const lesson = (id: string, title: string, summary: string, minutes: number, objectives: string[], resources: Resource[], practice: string): Lesson => ({ id, title, summary, minutes, objectives, resources, practice });

export const subjects: Subject[] = [
  {
    id: 'research-foundations', order: 1, title: 'Research & Data Foundations', shortTitle: 'Research',
    description: 'Build the search, evidence, spreadsheet and reporting habits shared by every target role.',
    difficulty: 'Foundation', hours: 8, accent: '#7d8560', softAccent: '#eef0e6', prerequisites: [],
    targetJobs: ['All eight target roles'],
    skills: ['Search planning', 'Source evaluation', 'Evidence logging', 'Spreadsheet structure', 'Written updates'],
    lessons: [
      lesson('rf-search', 'Turn a Task into a Search Plan', 'Translate instructions into entities, constraints and a repeatable query sequence.', 55,
        ['Identify the required output', 'Break a request into checkable claims', 'Use phrases, exclusions and domain filters'],
        [resource('Refine Google searches', 'Google Search Help', 'Guide', 20, 'https://support.google.com/websearch/answer/2466433?hl=en')],
        'Create a five-query search ladder for a company, a person and a local event.'),
      lesson('rf-sources', 'Authority, Freshness & Independence', 'Choose evidence based on proximity to the claim, recency and independence.', 70,
        ['Separate primary and secondary sources', 'Check publication and update dates', 'Detect circular reporting'],
        [resource('Civic Online Reasoning', 'Stanford Inquiry Group', 'Course', 45, 'https://cor.inquirygroup.org/')],
        'Rank six sources for one claim and defend your top three choices.'),
      lesson('rf-log', 'Evidence Logs & Quality Control', 'Record what was checked, what it proves and what remains uncertain.', 65,
        ['Write evidence notes', 'Use verified, contradicted and uncertain labels', 'Detect missing or duplicate data'],
        [resource('Google Sheets training', 'Google Workspace Learning Center', 'Course', 30, 'https://support.google.com/a/users/answer/9282959?hl=en')],
        'Build and audit a ten-row evidence log with dates, sources and confidence.'),
    ],
    flashcards: [
      { front: 'Primary source', back: 'Evidence created by the person, institution or system closest to the event or claim.' },
      { front: 'Lateral reading', back: 'Leaving a page to investigate who created it and what independent sources say.' },
      { front: 'Evidence log', back: 'A structured record of a claim, source, date checked, finding and confidence.' },
    ],
    quiz: [{ question: 'Two articles repeat a statistic but both cite one press release. How many independent evidence chains support it?', options: ['Two', 'Three', 'One', 'None'], answer: 2, explanation: 'Both articles depend on the same original source, so there is one evidence chain.' }],
  },
  {
    id: 'game-data', order: 2, title: 'Mobile Game Data Collection', shortTitle: 'Game Data',
    description: 'Learn disciplined gameplay observation, event tagging and progress reporting.',
    difficulty: 'Beginner', hours: 6, accent: '#b38a4a', softAccent: '#f5ecdc', prerequisites: ['research-foundations'],
    targetJobs: ['Mobile Game Data Collector'],
    skills: ['Game progression', 'Event taxonomy', 'Instruction compliance', 'Issue reporting', 'Sustained attention'],
    lessons: [
      lesson('gd-mechanics', 'Progression Systems & Game Economies', 'Recognize levels, missions, rewards, currencies and free-to-play loops.', 55,
        ['Map progression loops', 'Name reward types', 'Separate progress from session time'],
        [resource('Game design learning materials', 'Unity Learn', 'Course', 45, 'https://learn.unity.com/')],
        'Map the first 20 minutes of a mobile game into actions, rewards and blockers.'),
      lesson('gd-events', 'Event Tagging & Issue Reporting', 'Tag starts, wins, losses, popups and crashes consistently, then report defects clearly.', 70,
        ['Define observable events', 'Apply consistent labels', 'Capture reproduction steps'],
        [resource('Bug writing guidelines', 'Mozilla', 'Guide', 20, 'https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines')],
        'Annotate a five-minute gameplay clip and write two reproducible issue reports.'),
    ],
    flashcards: [{ front: 'Observable event', back: 'A visible state change that can be tagged without guessing intent.' }, { front: 'Reproduction steps', back: 'The exact sequence needed to make an issue happen again.' }],
    quiz: [{ question: 'Which is the strongest crash annotation?', options: ['The game broke', 'Crash after tapping Claim on Daily Reward at 03:14', 'Bad app', 'It stopped'], answer: 1, explanation: 'It records the action, interface location and timestamp.' }],
  },
  {
    id: 'link-research', order: 3, title: 'Deep-Link & Web Navigation Research', shortTitle: 'Link Research',
    description: 'Locate exact destination URLs and prevent incorrect or duplicate submissions.',
    difficulty: 'Beginner', hours: 5, accent: '#9c8f82', softAccent: '#f1ece8', prerequisites: ['research-foundations'],
    targetJobs: ['Sportsbook Link Researcher'],
    skills: ['Website navigation', 'Deep-link validation', 'URL inspection', 'Duplicate control', 'Bet vocabulary'],
    lessons: [
      lesson('lr-urls', 'URLs, Parameters & Deep Links', 'Understand domains, paths, query parameters, redirects and state-specific links.', 65,
        ['Read URL structure', 'Recognize session-bound links', 'Verify the final destination'],
        [resource('What is a URL?', 'MDN Web Docs', 'Guide', 20, 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL')],
        'Classify 15 URLs and identify which are stable deep links.'),
      lesson('lr-validation', 'Exact-Match Validation', 'Confirm that a link opens the required event and selection, not merely a nearby page.', 55,
        ['Build a validation checklist', 'Detect redirects', 'Record rejection reasons'],
        [resource('HTTP redirections', 'MDN Web Docs', 'Article', 20, 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections')],
        'Validate ten sample links against a destination specification.'),
    ],
    flashcards: [{ front: 'Deep link', back: 'A URL that opens a specific page, record or state rather than a homepage.' }, { front: 'Redirect', back: 'A response that sends a browser from one URL to another.' }],
    quiz: [{ question: 'A task requests one exact player prop. Which result is acceptable?', options: ['Homepage', 'Game page', 'Exact player-prop selection', 'League page'], answer: 2, explanation: 'The target is the exact selection, not a nearby page.' }],
  },
  {
    id: 'ai-research', order: 4, title: 'AI-Assisted App Research', shortTitle: 'AI Research',
    description: 'Use AI to accelerate research while preserving traceability and human verification.',
    difficulty: 'Beginner', hours: 8, accent: '#8f5e58', softAccent: '#f4e8e5', prerequisites: ['research-foundations'],
    targetJobs: ['AI App Research & Data Collection Assistant'],
    skills: ['Prompt design', 'Structured extraction', 'AI verification', 'Sheets/Excel', 'Verbal reporting'],
    lessons: [
      lesson('ar-delegate', 'Delegate Structured Research to AI', 'Define sources, fields, constraints and output format in a research prompt.', 65,
        ['Specify a schema', 'Require source URLs', 'Separate extraction from interpretation'],
        [resource('Prompt engineering', 'OpenAI', 'Guide', 30, 'https://platform.openai.com/docs/guides/prompt-engineering')],
        'Write a prompt that extracts ten app attributes into a fixed table.'),
      lesson('ar-verify', 'Verify AI-Suggested Findings', 'Treat model output as a lead until the underlying source is opened and checked.', 70,
        ['Trace claims to sources', 'Detect unsupported synthesis', 'Record confidence and missing data'],
        [resource('Responsible AI fundamentals', 'Microsoft Learn', 'Course', 35, 'https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/')],
        'Audit an AI-produced comparison and label supported, unsupported and outdated claims.'),
      lesson('ar-brief', 'Present Findings Clearly', 'Explain what you found, how you checked it and what remains uncertain.', 45,
        ['Give concise summaries', 'Ask clarifying questions', 'Respond to feedback'], [],
        'Record a two-minute evidence-first research briefing.'),
    ],
    flashcards: [{ front: 'AI-assisted research', back: 'Using a model to speed discovery or structuring while a human verifies evidence.' }, { front: 'Structured output', back: 'Output constrained to a defined set of fields and formats.' }],
    quiz: [{ question: 'Before checking its source, an AI-generated claim is best treated as:', options: ['Verified fact', 'Research lead', 'Primary evidence', 'Published conclusion'], answer: 1, explanation: 'Model output is a lead until its underlying evidence is checked.' }],
  },
  {
    id: 'video-annotation', order: 5, title: 'Video Action Annotation', shortTitle: 'Annotation',
    description: 'Convert continuous activity into precise action descriptions for training datasets.',
    difficulty: 'Intermediate', hours: 10, accent: '#b86f52', softAccent: '#f7e9e2', prerequisites: ['research-foundations', 'game-data'],
    targetJobs: ['Expert Video Annotator'],
    skills: ['Temporal segmentation', 'Atomic action writing', 'Object-state tracking', 'Consistency', 'Quality review'],
    lessons: [
      lesson('va-segment', 'Temporal Segmentation', 'Identify defensible start and end boundaries for observable actions.', 80,
        ['Recognize action boundaries', 'Split overlapping actions', 'Use timestamps consistently'],
        [resource('Track mode basics', 'CVAT', 'Documentation', 35, 'https://docs.cvat.ai/docs/manual/basics/track-mode-basics/')],
        'Segment a two-minute work video into atomic actions.'),
      lesson('va-language', 'Atomic, Observable Descriptions', 'Write concise subject-verb-object labels without inferring hidden intent.', 75,
        ['Use concrete verbs', 'Name visible objects', 'Avoid causal speculation'],
        [resource('Label Studio guide', 'Label Studio', 'Documentation', 25, 'https://labelstud.io/guide/')],
        'Rewrite 20 vague labels into observable action statements.'),
      lesson('va-consistency', 'Consistency & Edge Cases', 'Apply the same taxonomy across ambiguous, occluded and repeated actions.', 85,
        ['Use a decision log', 'Handle uncertainty consistently', 'Review label drift'], [],
        'Annotate the same clip twice and compare agreement between passes.'),
    ],
    flashcards: [{ front: 'Atomic action', back: 'One observable action expressed with a precise verb and object.' }, { front: 'Temporal boundary', back: 'The timestamp at which an action begins or ends.' }],
    quiz: [{ question: 'Which annotation avoids guessing intent?', options: ['Worker prepares to repair it', 'Worker wants the tool', 'Worker lifts the red tool from the bench', 'Worker realizes it is broken'], answer: 2, explanation: 'It describes only visible action, object and location.' }],
  },
  {
    id: 'recruitment', order: 6, title: 'Recruitment Sourcing', shortTitle: 'Recruitment',
    description: 'Translate job requirements into searches, shortlist candidates and maintain a pipeline.',
    difficulty: 'Intermediate', hours: 14, accent: '#8b6d4e', softAccent: '#f3eadf', prerequisites: ['research-foundations'],
    targetJobs: ['Recruitment Resourcer'],
    skills: ['Boolean search', 'Role calibration', 'CV screening', 'Candidate tracking', 'Outreach', 'ATS basics'],
    lessons: [
      lesson('rs-calibrate', 'Role Intake & Search Criteria', 'Separate must-haves, preferences, transferable skills and disqualifiers.', 75,
        ['Build a scorecard', 'Normalize job titles', 'Identify adjacent talent pools'],
        [resource('Structured hiring', 'Google re:Work', 'Guide', 30, 'https://rework.withgoogle.com/guides/hiring-use-structured-interviewing/steps/introduction/')],
        'Convert one job description into a ten-field sourcing brief.'),
      lesson('rs-boolean', 'Boolean & Platform Search', 'Combine titles, skills, locations and exclusions into efficient queries.', 90,
        ['Use AND, OR and NOT', 'Group title variants', 'Iterate from result quality'],
        [resource('Boolean search in Recruiter', 'LinkedIn Help', 'Guide', 25, 'https://www.linkedin.com/help/recruiter/answer/a413275')],
        'Create broad, balanced and narrow searches for the same vacancy.'),
      lesson('rs-screen', 'CV Screening & Pipeline Tracking', 'Evaluate evidence against a scorecard and record defensible decisions.', 85,
        ['Separate evidence from inference', 'Design candidate stages', 'Track next actions'],
        [resource('Selection methods', 'CIPD', 'Guide', 30, 'https://www.cipd.org/en/knowledge/factsheets/selection-factsheet/')],
        'Screen five profiles and build a 20-candidate tracker.'),
    ],
    flashcards: [{ front: 'Boolean search', back: 'A search combining terms with operators such as AND, OR and NOT.' }, { front: 'Longlist', back: 'A broad group of potentially relevant candidates before deep screening.' }, { front: 'Shortlist', back: 'Candidates who meet the evidence threshold for the next stage.' }],
    quiz: [{ question: 'Which query correctly groups alternative titles?', options: ['Recruiter OR Sourcer AND SaaS', '(Recruiter OR Sourcer) AND SaaS', 'Recruiter NOT Sourcer OR SaaS', 'Recruiter AND Sourcer AND SaaS'], answer: 1, explanation: 'Parentheses keep title alternatives together before requiring SaaS.' }],
  },
  {
    id: 'news-verification', order: 7, title: 'Local-News Verification', shortTitle: 'Verification',
    description: 'Verify names, dates, quotations and geographic relevance with authoritative evidence.',
    difficulty: 'Intermediate', hours: 16, accent: '#7b7655', softAccent: '#eff0e3', prerequisites: ['research-foundations', 'ai-research'],
    targetJobs: ['Local-News Verification Researcher'],
    skills: ['Claim decomposition', 'Primary sources', 'Geolocation', 'Conflict handling', 'Risk escalation'],
    lessons: [
      lesson('nv-claims', 'Decompose Stories into Claims', 'Break text into names, dates, numbers, quotations, locations and event status.', 80,
        ['Create atomic claims', 'Prioritize consequential facts', 'Match claims to evidence types'],
        [resource('Verification Handbook', 'European Journalism Centre', 'Guide', 45, 'https://verificationhandbook.com/')],
        'Turn one local-news story into a 20-row claim checklist.'),
      lesson('nv-authority', 'Local Sources & Geographic Fit', 'Prioritize local records and verify that agencies, venues and events belong to the claimed city.', 95,
        ['Locate authoritative sources', 'Check jurisdiction', 'Detect similarly named places'],
        [resource('Journalism training', 'Google News Initiative', 'Course', 45, 'https://newsinitiative.withgoogle.com/resources/trainings/'), resource('LearnOSM', 'OpenStreetMap', 'Guide', 25, 'https://learnosm.org/en/')],
        'Verify ten local entities and record boundary evidence.'),
      lesson('nv-conflict', 'Contradictions & Escalation', 'Represent disagreement honestly and escalate harmful claims instead of guessing.', 85,
        ['Compare source independence', 'Write unresolved findings', 'Escalate high-risk claims'],
        [resource('Journalism ethics code', 'SPJ', 'Guide', 25, 'https://www.spj.org/ethicscode.asp')],
        'Write a recommendation when two credible sources disagree.'),
    ],
    flashcards: [{ front: 'Atomic claim', back: 'One factual assertion that can be checked independently.' }, { front: 'Geographic mismatch', back: 'Evidence that a story or event does not belong to the claimed locality.' }, { front: 'Unresolved uncertainty', back: 'A material question that credible available evidence cannot settle.' }],
    quiz: [{ question: 'Two credible independent sources disagree on a date. What should you do?', options: ['Choose the newer page', 'Average the dates', 'Investigate provenance and document uncertainty if unresolved', 'Remove the date silently'], answer: 2, explanation: 'Conflicting evidence must be investigated and represented honestly.' }],
  },
  {
    id: 'documentary-research', order: 8, title: 'Documentary & YouTube Research', shortTitle: 'Documentary',
    description: 'Build sourced dossiers, chronologies, visual logs and coherent story structures.',
    difficulty: 'Advanced', hours: 24, accent: '#825b47', softAccent: '#f2e7df', prerequisites: ['research-foundations', 'news-verification'],
    targetJobs: ['Video Content Researcher for YouTube'],
    skills: ['OSINT', 'Research dossiers', 'Chronologies', 'Visual research', 'Story structure', 'Risk review'],
    lessons: [
      lesson('dr-osint', 'Open-Source Discovery & Provenance', 'Find hard-to-locate sources while preserving origin, context and access dates.', 105,
        ['Use advanced discovery methods', 'Archive source context', 'Separate leads from evidence'],
        [resource('Online Investigation Toolkit', 'Bellingcat', 'Guide', 45, 'https://bellingcat.gitbook.io/toolkit')],
        'Create a sourced discovery log for an internet-history topic.'),
      lesson('dr-dossier', 'Dossiers & Master Chronologies', 'Organize people, events, contradictions and unanswered questions.', 115,
        ['Build a master timeline', 'Create a cast list', 'Link material claims to evidence'],
        [resource('Story-Based Inquiry', 'UNESCO', 'Guide', 45, 'https://unesdoc.unesco.org/ark:/48223/pf0000193078')],
        'Produce a dossier outline with chronology, cast and evidence index.'),
      lesson('dr-visuals', 'Visual Assets, Timestamps & Rights', 'Log exact timestamps, context, ownership and platform risk.', 95,
        ['Create a visual-source log', 'Capture timestamps', 'Flag copyright and sensitive-content risks'],
        [resource('Fair Use Index', 'U.S. Copyright Office', 'Guide', 35, 'https://www.copyright.gov/fair-use/'), resource('Creator resources', 'YouTube', 'Course', 40, 'https://www.youtube.com/creators/')],
        'Create a visual log for one documentary chapter.'),
    ],
    flashcards: [{ front: 'Research dossier', back: 'A package containing chronology, people, claims, sources, visuals and uncertainties.' }, { front: 'Provenance', back: 'The origin and context of information or media.' }, { front: 'Story beat', back: 'A meaningful change or revelation that advances a narrative.' }],
    quiz: [{ question: 'What makes a chronology auditable?', options: ['Dramatic wording', 'Every material event links to dated evidence', 'Only one source per chapter', 'Removing contradictions'], answer: 1, explanation: 'Events must be traceable to dated supporting evidence.' }],
  },
  {
    id: 'gtm-automation', order: 9, title: 'AI GTM Automation Engineering', shortTitle: 'AI Automation',
    description: 'Build reusable lead intelligence with APIs, structured research, deterministic scoring and resumable processing.',
    difficulty: 'Advanced', hours: 90, accent: '#704c3f', softAccent: '#eee2dc', prerequisites: ['ai-research', 'recruitment', 'news-verification'],
    targetJobs: ['AI GTM Automation Engineer'],
    skills: ['TypeScript/Python', 'REST APIs', 'n8n', 'Apollo', 'Structured LLM output', 'PostgreSQL', 'Reliability'],
    lessons: [
      lesson('ga-api', 'APIs, JSON & Authentication', 'Make authenticated requests and handle pagination, validation and limits.', 180,
        ['Read REST documentation', 'Use API keys safely', 'Handle pagination and rate limits'],
        [resource('Using Fetch', 'MDN Web Docs', 'Documentation', 45, 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'), resource('JSON Schema tutorial', 'JSON Schema', 'Guide', 45, 'https://json-schema.org/learn/getting-started-step-by-step')],
        'Fetch a paginated public API and save validated normalized JSON.'),
      lesson('ga-workflows', 'n8n Workflow Architecture', 'Use workflows for orchestration while keeping deterministic logic testable.', 240,
        ['Build trigger-to-output workflows', 'Choose workflow versus code', 'Handle credentials and failures'],
        [resource('n8n learning path', 'n8n', 'Course', 120, 'https://docs.n8n.io/learning-path/')],
        'Build a resumable enrichment workflow with an error branch.'),
      lesson('ga-icp', 'ICP Compilation & Apollo Discovery', 'Convert arbitrary ICP text into validated filters and candidate searches.', 240,
        ['Model required and preferred criteria', 'Build Apollo filters', 'Deduplicate people and companies'],
        [resource('Apollo API documentation', 'Apollo', 'Documentation', 60, 'https://docs.apollo.io/')],
        'Convert three ICP documents into one versioned JSON schema.'),
      lesson('ga-research', 'Evidence-Grounded AI Research & Scoring', 'Separate facts from hypotheses and calculate configurable scores in code.', 240,
        ['Constrain model output', 'Apply hard disqualifiers', 'Track supporting evidence'],
        [resource('Claude documentation', 'Anthropic', 'Documentation', 60, 'https://docs.anthropic.com/en/docs/'), resource('PostgreSQL tutorial', 'PostgreSQL', 'Documentation', 60, 'https://www.postgresql.org/docs/current/tutorial.html')],
        'Generate an evidence object and score it with deterministic tests.'),
      lesson('ga-reliability', 'Retries, Checkpoints & Idempotency', 'Resume large jobs safely without duplicating work or restarting from zero.', 260,
        ['Persist processing state', 'Retry safe operations', 'Track failed records'],
        [resource('Retry pattern', 'Microsoft Architecture Center', 'Guide', 40, 'https://learn.microsoft.com/en-us/azure/architecture/patterns/retry')],
        'Force a failure at record 3,700 of 5,000 and resume correctly.'),
      lesson('ga-capstone', 'Capstone: Lead Intelligence Engine', 'Combine upload, discovery, research, scoring, enrichment and export.', 900,
        ['Deliver a self-service interface', 'Document recovery', 'Run a production-sized test'],
        [resource('Sheets API concepts', 'Google for Developers', 'Documentation', 45, 'https://developers.google.com/sheets/api/guides/concepts')],
        'Build the reusable campaign system described in the target role.'),
    ],
    flashcards: [{ front: 'Idempotency', back: 'Repeating an operation does not create an unintended extra effect.' }, { front: 'Checkpoint', back: 'Persisted progress that allows a failed process to resume.' }, { front: 'Deterministic scoring', back: 'A score calculated from explicit rules instead of unconstrained model judgment.' }, { front: 'Selective enrichment', back: 'Buying contact data only after a prospect qualifies.' }],
    quiz: [{ question: 'A 5,000-record campaign fails at 3,700. What prevents restarting from zero?', options: ['A longer prompt', 'Checkpointed state plus idempotent processing', 'One huge spreadsheet', 'Removing logs'], answer: 1, explanation: 'Persistent checkpoints and idempotent operations allow safe resumption.' }],
  },
];

export const subjectById = Object.fromEntries(subjects.map((subject) => [subject.id, subject])) as Record<string, Subject>;
export const totalLearningHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);
