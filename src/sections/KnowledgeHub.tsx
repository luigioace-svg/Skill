import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Clock3, ExternalLink, GraduationCap,
  LayoutDashboard, Library, Menu, Network, Search, Sparkles, Target, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillUniverse3D from '@/components/SkillUniverse3D';
import { subjects, subjectById, totalLearningHours, type Subject } from '@/data/knowledge';

type Screen = 'overview' | 'universe' | 'topics' | 'study' | 'review' | 'progress' | 'subject';
type RouteState = { screen: Screen; subjectId?: string };
const progressStorageKey = 'job-skills-learning-progress-v2';

const screenTitles: Record<Exclude<Screen, 'subject'>, string> = {
  overview: 'Overview', universe: 'Skill Universe', topics: 'Topics', study: 'Study Plan', review: 'Review Center', progress: 'Progress Analytics',
};

const readRoute = (): RouteState => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('topic/')) {
    const subjectId = hash.split('/')[1];
    if (subjectById[subjectId]) return { screen: 'subject', subjectId };
  }
  if (['overview', 'universe', 'topics', 'study', 'review', 'progress'].includes(hash)) return { screen: hash as Screen };
  return { screen: 'overview' };
};

export default function KnowledgeHub() {
  const [route, setRoute] = useState<RouteState>(() => readRoute());
  const [menuOpen, setMenuOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(progressStorageKey) ?? '[]');
      return new Set(Array.isArray(stored) && stored.length ? stored : ['rf-search']);
    } catch { return new Set(['rf-search']); }
  });

  useEffect(() => {
    const onHashChange = () => { setRoute(readRoute()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.history.replaceState(null, '', '#overview');
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => { localStorage.setItem(progressStorageKey, JSON.stringify([...completed])); }, [completed]);

  const totalLessons = subjects.reduce((sum, subject) => sum + subject.lessons.length, 0);
  const completedCount = [...completed].filter((id) => subjects.some((subject) => subject.lessons.some((lesson) => lesson.id === id))).length;
  const progress = Math.round((completedCount / totalLessons) * 100);
  const selectedSubject = route.subjectId ? subjectById[route.subjectId] : undefined;
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    return subjects.filter((subject) => `${subject.title} ${subject.skills.join(' ')} ${subject.targetJobs.join(' ')}`.toLowerCase().includes(term)).slice(0, 6);
  }, [query]);

  const navigate = (destination: string) => { window.location.hash = destination; setMenuOpen(false); setQuery(''); };
  const openSubject = (id: string) => navigate(`topic/${id}`);
  const toggleLesson = (id: string) => setCompleted((current) => {
    const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'universe', label: '3D Skill Universe', icon: Network },
    { id: 'topics', label: 'Topic Directory', icon: BookOpen },
    { id: 'study', label: 'Study Plan', icon: CalendarDays },
    { id: 'review', label: 'Review Center', icon: CircleHelp },
    { id: 'progress', label: 'Progress Analytics', icon: BarChart3 },
  ] as const;

  return <div className="app-shell">
    <aside className={`app-sidebar glass-dark ${menuOpen ? 'is-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><GraduationCap size={22} /></div><div><strong>Job Skills</strong><span>Learning Environment</span></div><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="main-nav" aria-label="Primary navigation">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={route.screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon size={18} /><span>{item.label}</span>{item.id === 'universe' && <em>3D</em>}</button>; })}</nav>
      <div className="sidebar-topic-group"><button className="topic-group-trigger" onClick={() => setTopicsOpen((value) => !value)} aria-expanded={topicsOpen}><span>Topic workspaces</span><ChevronDown size={16} className={topicsOpen ? 'rotated' : ''} /></button>{topicsOpen && <div className="sidebar-topics">{subjects.map((subject) => <button key={subject.id} className={route.subjectId === subject.id ? 'active' : ''} onClick={() => openSubject(subject.id)}><i style={{ background: subject.accent }} /><span>{subject.order.toString().padStart(2, '0')} · {subject.shortTitle}</span></button>)}</div>}</div>
      <div className="sidebar-progress glass-panel"><div><span>Learning progress</span><strong>{progress}%</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><small>{completedCount} of {totalLessons} lessons complete</small></div>
    </aside>
    {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
    <main className="app-main">
      <header className="app-topbar glass-light"><button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="topbar-route"><span>Learning environment</span><strong>{selectedSubject?.title ?? screenTitles[route.screen as Exclude<Screen, 'subject'>]}</strong></div><div className="global-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics and skills…" />{searchResults.length > 0 && <div className="search-results glass-light">{searchResults.map((subject) => <button key={subject.id} onClick={() => openSubject(subject.id)}><span style={{ background: subject.accent }}>{subject.order}</span><div><strong>{subject.title}</strong><small>{subject.skills.slice(0, 2).join(' · ')}</small></div></button>)}</div>}</div><button className="profile-orb" aria-label="Local profile">LA</button></header>
      <div className={`screen-host screen-${route.screen}`}>
        {route.screen === 'overview' && <Overview progress={progress} completed={completed} openSubject={openSubject} navigate={navigate} />}
        {route.screen === 'universe' && <UniverseScreen completed={completed} openSubject={openSubject} />}
        {route.screen === 'topics' && <TopicsDirectory completed={completed} openSubject={openSubject} />}
        {route.screen === 'study' && <StudyPlan completed={completed} openSubject={openSubject} />}
        {route.screen === 'review' && <ReviewCenter />}
        {route.screen === 'progress' && <ProgressAnalytics completed={completed} progress={progress} />}
        {route.screen === 'subject' && selectedSubject && <SubjectWorkspace key={selectedSubject.id} subject={selectedSubject} completed={completed} toggleLesson={toggleLesson} openSubject={openSubject} navigate={navigate} />}
      </div>
    </main>
  </div>;
}

function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: ReactNode }) {
  return <header className="page-intro"><div><span className="eyebrow"><Sparkles size={14} />{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

function Overview({ progress, completed, openSubject, navigate }: { progress: number; completed: Set<string>; openSubject: (id: string) => void; navigate: (path: string) => void }) {
  const nextLesson = subjects.flatMap((subject) => subject.lessons.map((lesson) => ({ subject, lesson }))).find(({ lesson }) => !completed.has(lesson.id));
  return <div className="page-wrap overview-page"><PageIntro eyebrow="Your private learning cockpit" title="Good to see you, Luigi." copy="Move between the universe, individual topic rooms and review tools without losing your place." /><section className="overview-grid"><article className="continue-card glass-card"><div className="continue-copy"><span>Continue learning</span><h2>{nextLesson?.lesson.title ?? 'Path complete'}</h2><p>{nextLesson?.subject.title}</p><button onClick={() => nextLesson && openSubject(nextLesson.subject.id)}>Open workspace <ArrowRight size={17} /></button></div><div className="hero-progress" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><div><strong>{progress}%</strong><span>complete</span></div></div></article><button className="universe-preview glass-card" onClick={() => navigate('universe')}><Network size={34} /><span>Explore</span><h2>3D Skill Universe</h2><p>Rotate the live prerequisite network.</p><ArrowRight size={20} /></button><article className="metric-stack glass-card"><div><strong>9</strong><span>Topic workspaces</span></div><div><strong>{totalLearningHours}h</strong><span>Complete path</span></div><div><strong>{subjects.reduce((sum, subject) => sum + subject.flashcards.length, 0)}</strong><span>Flashcards</span></div></article></section><section className="overview-section"><div className="section-heading"><div><span>Recommended route</span><h2>Your next three topics</h2></div><button onClick={() => navigate('topics')}>View directory <ChevronRight size={16} /></button></div><div className="topic-preview-row">{subjects.slice(0, 3).map((subject) => <TopicCard key={subject.id} subject={subject} completed={completed} onOpen={() => openSubject(subject.id)} />)}</div></section></div>;
}

function UniverseScreen({ completed, openSubject }: { completed: Set<string>; openSubject: (id: string) => void }) {
  return <div className="universe-page"><div className="universe-title"><span>Spatial prerequisite map</span><h1>3D Skill Universe</h1><p>Every sphere is a topic. Connections show which capabilities feed the next.</p></div><SkillUniverse3D completed={completed} onOpenSubject={openSubject} /></div>;
}

function TopicsDirectory({ completed, openSubject }: { completed: Set<string>; openSubject: (id: string) => void }) {
  const [difficulty, setDifficulty] = useState('All'); const visible = difficulty === 'All' ? subjects : subjects.filter((subject) => subject.difficulty === difficulty);
  return <div className="page-wrap"><PageIntro eyebrow="Independent topic rooms" title="Topic Directory" copy="Each subject opens as its own learning environment while sharing progress with the rest of your path." action={<div className="filter-pills">{['All', 'Foundation', 'Beginner', 'Intermediate', 'Advanced'].map((item) => <button key={item} className={difficulty === item ? 'active' : ''} onClick={() => setDifficulty(item)}>{item}</button>)}</div>} /><div className="topic-directory">{visible.map((subject) => <TopicCard key={subject.id} subject={subject} completed={completed} onOpen={() => openSubject(subject.id)} />)}</div></div>;
}

function TopicCard({ subject, completed, onOpen }: { subject: Subject; completed: Set<string>; onOpen: () => void }) {
  const complete = subject.lessons.filter((lesson) => completed.has(lesson.id)).length; const percent = Math.round(complete / subject.lessons.length * 100);
  return <button className="topic-card glass-card" onClick={onOpen} style={{ '--node': subject.accent, '--node-soft': subject.softAccent } as CSSProperties}><span className="topic-index">{subject.order.toString().padStart(2, '0')}</span><div className="topic-card-copy"><small>{subject.difficulty} · {subject.hours} hours</small><h2>{subject.title}</h2><p>{subject.description}</p><div className="skill-chips">{subject.skills.slice(0, 3).map((skill) => <i key={skill}>{skill}</i>)}</div></div><div className="topic-card-progress"><strong>{percent}%</strong><span>{complete}/{subject.lessons.length}</span><ChevronRight size={20} /></div></button>;
}

function SubjectWorkspace({ subject, completed, toggleLesson, openSubject, navigate }: { subject: Subject; completed: Set<string>; toggleLesson: (id: string) => void; openSubject: (id: string) => void; navigate: (path: string) => void }) {
  const [cardIndex, setCardIndex] = useState(0); const [flipped, setFlipped] = useState(false); const [quizChoice, setQuizChoice] = useState<number | null>(null); const [submitted, setSubmitted] = useState(false);
  const complete = subject.lessons.filter((lesson) => completed.has(lesson.id)).length; const percent = Math.round(complete / subject.lessons.length * 100); const next = subjects[subject.order];
  const changeCard = (direction: number) => { setFlipped(false); setCardIndex((current) => (current + direction + subject.flashcards.length) % subject.flashcards.length); };
  return <div className="subject-page" style={{ '--node': subject.accent, '--node-soft': subject.softAccent } as CSSProperties}><header className="subject-cover"><button className="back-link" onClick={() => navigate('topics')}><ArrowLeft size={16} />Topic directory</button><div className="subject-cover-grid"><div className="subject-emblem">{subject.order.toString().padStart(2, '0')}</div><div><span>{subject.difficulty} · {subject.hours} planned hours</span><h1>{subject.title}</h1><p>{subject.description}</p><div className="job-tags">{subject.targetJobs.map((job) => <i key={job}>{job}</i>)}</div></div><div className="subject-progress-ring" style={{ '--progress': `${percent * 3.6}deg` } as CSSProperties}><div><strong>{percent}%</strong><span>{complete}/{subject.lessons.length} lessons</span></div></div></div></header><div className="subject-body"><Tabs defaultValue="overview" className="workspace-tabs" onValueChange={() => { setSubmitted(false); setQuizChoice(null); }}><TabsList className="workspace-tab-list"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="lessons">Lessons</TabsTrigger><TabsTrigger value="resources">Resources</TabsTrigger><TabsTrigger value="practice">Practice</TabsTrigger><TabsTrigger value="flashcards">Flashcards</TabsTrigger><TabsTrigger value="quiz">Quiz</TabsTrigger></TabsList>
    <TabsContent value="overview" className="workspace-panel"><div className="overview-columns"><article className="glass-card"><span className="panel-label">Capabilities</span><h2>What you will master</h2><div className="capability-list">{subject.skills.map((skill, index) => <div key={skill}><span>{index + 1}</span><strong>{skill}</strong></div>)}</div></article><article className="glass-card"><span className="panel-label">Dependency map</span><h2>What this connects to</h2><div className="dependency-list">{subject.prerequisites.length ? subject.prerequisites.map((id) => <button key={id} onClick={() => openSubject(id)}>{subjectById[id].title}<ChevronRight size={16} /></button>) : <p>This is the foundation of the entire path.</p>}{next && <button onClick={() => openSubject(next.id)}>{next.title}<ChevronRight size={16} /></button>}</div></article></div></TabsContent>
    <TabsContent value="lessons" className="workspace-panel"><div className="lesson-grid">{subject.lessons.map((lesson, index) => <LessonCard key={lesson.id} lesson={lesson} index={index} done={completed.has(lesson.id)} toggle={() => toggleLesson(lesson.id)} />)}</div></TabsContent>
    <TabsContent value="resources" className="workspace-panel"><div className="resource-library">{subject.lessons.flatMap((lesson) => lesson.resources.map((resource) => <a key={`${lesson.id}-${resource.title}`} href={resource.url} target="_blank" rel="noreferrer" className="resource-card glass-card"><Library size={19} /><div><small>{resource.type} · {resource.minutes} min</small><strong>{resource.title}</strong><span>{resource.provider}</span></div><ExternalLink size={17} /></a>))}</div></TabsContent>
    <TabsContent value="practice" className="workspace-panel"><div className="practice-stack">{subject.lessons.map((lesson, index) => <article key={lesson.id} className="practice-card glass-card"><span>{index + 1}</span><div><small>{lesson.title}</small><h2>{lesson.practice}</h2><p>Complete the task and keep the output as portfolio evidence.</p></div><Target size={24} /></article>)}</div></TabsContent>
    <TabsContent value="flashcards" className="workspace-panel review-stage"><button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((value) => !value)}><span>{flipped ? 'Answer' : 'Concept'}</span><strong>{flipped ? subject.flashcards[cardIndex].back : subject.flashcards[cardIndex].front}</strong><small>Tap to flip</small></button><div className="review-controls"><button onClick={() => changeCard(-1)}><ArrowLeft size={17} />Previous</button><span>{cardIndex + 1} / {subject.flashcards.length}</span><button onClick={() => changeCard(1)}>Next<ArrowRight size={17} /></button></div></TabsContent>
    <TabsContent value="quiz" className="workspace-panel review-stage"><article className="quiz-card glass-card"><span className="panel-label">Knowledge check</span><h2>{subject.quiz[0].question}</h2><div className="quiz-options">{subject.quiz[0].options.map((option, index) => <button key={option} className={`${quizChoice === index ? 'selected' : ''} ${submitted && index === subject.quiz[0].answer ? 'correct' : ''}`} onClick={() => { setQuizChoice(index); setSubmitted(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><button className="primary-action" disabled={quizChoice === null} onClick={() => setSubmitted(true)}>Check answer</button>{submitted && <div className={`quiz-feedback ${quizChoice === subject.quiz[0].answer ? 'right' : 'wrong'}`}><strong>{quizChoice === subject.quiz[0].answer ? 'Correct.' : 'Review and try again.'}</strong><p>{subject.quiz[0].explanation}</p></div>}</article></TabsContent>
    </Tabs>{next && <button className="next-topic glass-card" onClick={() => openSubject(next.id)}><div><span>Next topic</span><strong>{next.title}</strong></div><ArrowRight size={24} /></button>}</div></div>;
}

function LessonCard({ lesson, index, done, toggle }: { lesson: Subject['lessons'][number]; index: number; done: boolean; toggle: () => void }) {
  return <article className={`lesson-card glass-card ${done ? 'done' : ''}`}><div className="lesson-number">{done ? <Check size={18} /> : index + 1}</div><div className="lesson-copy"><span>Lesson {index + 1}</span><h2>{lesson.title}</h2><p>{lesson.summary}</p><div className="lesson-time"><Clock3 size={16} />{lesson.minutes} min</div><ul>{lesson.objectives.map((objective) => <li key={objective}><CheckCircle2 size={16} />{objective}</li>)}</ul><button className="lesson-toggle" onClick={toggle}>{done ? 'Completed' : 'Mark complete'}</button></div></article>;
}

function StudyPlan({ completed, openSubject }: { completed: Set<string>; openSubject: (id: string) => void }) {
  return <div className="page-wrap"><PageIntro eyebrow="181-hour route" title="Study Plan" copy="A sequential roadmap that respects prerequisites and keeps advanced automation until the supporting research skills are ready." /><div className="study-timeline">{subjects.map((subject, index) => { const complete = subject.lessons.filter((lesson) => completed.has(lesson.id)).length; return <article key={subject.id} className="timeline-row glass-card"><div className="timeline-marker" style={{ background: subject.accent }}>{subject.order}</div><div><small>Stage {index + 1} · {subject.difficulty}</small><h2>{subject.title}</h2><p>{subject.hours} planned hours · {complete}/{subject.lessons.length} lessons complete</p></div><button onClick={() => openSubject(subject.id)}>Open <ChevronRight size={16} /></button></article>; })}</div></div>;
}

function ReviewCenter() {
  const [subjectId, setSubjectId] = useState(subjects[0].id); const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false); const subject = subjectById[subjectId]; const choose = (id: string) => { setSubjectId(id); setIndex(0); setFlipped(false); };
  return <div className="page-wrap"><PageIntro eyebrow="Memory and retrieval" title="Review Center" copy="Review every topic without returning to its lesson workspace." /><div className="review-layout"><aside className="review-subjects glass-card">{subjects.map((item) => <button key={item.id} className={subjectId === item.id ? 'active' : ''} onClick={() => choose(item.id)}><i style={{ background: item.accent }} />{item.shortTitle}<span>{item.flashcards.length}</span></button>)}</aside><section className="review-room glass-card"><span>{subject.title}</span><button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((value) => !value)}><small>{flipped ? 'Answer' : 'Concept'}</small><strong>{flipped ? subject.flashcards[index].back : subject.flashcards[index].front}</strong><em>Tap to flip</em></button><div className="review-controls"><button onClick={() => { setFlipped(false); setIndex((index - 1 + subject.flashcards.length) % subject.flashcards.length); }}><ArrowLeft size={17} />Previous</button><span>{index + 1}/{subject.flashcards.length}</span><button onClick={() => { setFlipped(false); setIndex((index + 1) % subject.flashcards.length); }}>Next<ArrowRight size={17} /></button></div></section></div></div>;
}

function ProgressAnalytics({ completed, progress }: { completed: Set<string>; progress: number }) {
  const totalLessons = subjects.reduce((sum, subject) => sum + subject.lessons.length, 0); const complete = Math.round(totalLessons * progress / 100);
  return <div className="page-wrap"><PageIntro eyebrow="Shared across every workspace" title="Progress Analytics" copy="Every completed lesson updates this screen, the dashboard, topic directory and 3D universe." /><section className="analytics-summary"><article className="analytics-ring glass-card"><div className="large-progress" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><div><strong>{progress}%</strong><span>mastery</span></div></div><div><h2>{complete} lessons complete</h2><p>{totalLessons - complete} lessons remain across the full path.</p></div></article><article className="analytics-metrics glass-card"><div><strong>{totalLearningHours}</strong><span>planned hours</span></div><div><strong>{subjects.filter((subject) => subject.lessons.every((lesson) => completed.has(lesson.id))).length}</strong><span>topics mastered</span></div><div><strong>{subjects.reduce((sum, subject) => sum + subject.quiz.length, 0)}</strong><span>knowledge checks</span></div></article></section><section className="subject-bars glass-card">{subjects.map((subject) => { const count = subject.lessons.filter((lesson) => completed.has(lesson.id)).length; const value = Math.round(count / subject.lessons.length * 100); return <div key={subject.id}><span>{subject.shortTitle}</span><div><i style={{ width: `${value}%`, background: subject.accent }} /></div><strong>{value}%</strong></div>; })}</section></div>;
}
