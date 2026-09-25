import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView } from "framer-motion";
import {
  Bell, BookOpen, CheckCircle2, ClipboardCheck, FileCheck2, FileText, GraduationCap, LineChart, Lock, UploadCloud, UserCircle2, UserPlus,
} from "lucide-react";
import { Backdrop, Scene } from "@/components/marketing/visuals";

const FEATURES = [
  { icon: FileText, title: "Online applications", text: "Apply to any program in one guided form and save your progress." },
  { icon: UploadCloud, title: "Document upload and verification", text: "Upload once and see each file approved or flagged." },
  { icon: ClipboardCheck, title: "Faculty review workflow", text: "Applications reach the right reviewer with notes and decisions." },
  { icon: LineChart, title: "Real-time status tracking", text: "Follow your application from submission to confirmation." },
  { icon: Bell, title: "Notifications", text: "Get an in-app and email update whenever your status changes." },
  { icon: Lock, title: "Secure authentication", text: "Role-based access keeps student records private." },
];

// Sample figures: replace with real numbers from your college.
const STATS = [
  { label: "Programs offered", to: 40, suffix: "+" },
  { label: "Students enrolled", to: 12000, suffix: "+" },
  { label: "Applications processed", to: 48000, suffix: "+" },
  { label: "Placement success", to: 94, suffix: "%" },
];

const STEPS = [
  { icon: UserPlus, label: "Register" },
  { icon: UserCircle2, label: "Complete profile" },
  { icon: UploadCloud, label: "Upload documents" },
  { icon: FileCheck2, label: "Submit application" },
  { icon: ClipboardCheck, label: "Faculty review" },
  { icon: GraduationCap, label: "Admission confirmation" },
];

// Sample testimonials: replace with real quotes before launch.
const STORIES = [
  { who: "Student", name: "Ananya R.", text: "I could see exactly which document was pending, so nothing stalled my application." },
  { who: "Parent", name: "Suresh K.", text: "Status emails meant we never had to call the office to ask where things stood." },
  { who: "Alumnus", name: "Meera T.", text: "The review was quick and clear. I knew my result the day the faculty decided." },
];

const HERO_CARDS = [
  { icon: BookOpen, title: "Robotics and Automation", note: "Application submitted" },
  { icon: FileCheck2, title: "Documents verified", note: "4 of 4 approved" },
  { icon: CheckCircle2, title: "Faculty approved", note: "Confirmation next" },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" as const } }),
};
const view = { once: true, margin: "-60px" };

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const btnPrimary = "inline-flex h-11 items-center justify-center rounded-lg bg-indigo-500 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300";
const btnGhost = "glass inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium text-slate-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-200">
      <div className="fixed inset-0"><Backdrop /></div>
      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <GraduationCap className="h-6 w-6 text-indigo-300" /> Admission Platform
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <a href="#features" className="hidden px-3 py-2 text-slate-300 hover:text-white sm:block">Features</a>
            <a href="#process" className="hidden px-3 py-2 text-slate-300 hover:text-white sm:block">Process</a>
            <Link to="/login" className="px-3 py-2 text-slate-200 hover:text-white">Sign in</Link>
            <Link to="/register" className={`${btnPrimary} !h-9 !px-4`}>Apply now</Link>
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2 lg:pt-20">
          <motion.div initial="hidden" animate="show" variants={reveal}>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Shape Your Future With Smarter Admissions
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-300">
              Apply, track, verify documents and manage admissions through one intelligent platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className={btnPrimary}>Apply Now</Link>
              <Link to="/dashboard/programs" className={btnGhost}>Explore Programs</Link>
            </div>
          </motion.div>
          <Scene cards={HERO_CARDS} />
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-white">Everything an application needs, in one place</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={reveal} initial="hidden" whileInView="show" viewport={view}
                whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="glass rounded-2xl p-6 shadow-2xl shadow-black/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-200 ring-1 ring-indigo-300/20">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-medium text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-300">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={reveal} initial="hidden" whileInView="show" viewport={view} className="glass rounded-2xl p-6">
                <div className="text-3xl font-semibold text-white sm:text-4xl"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="mt-1 text-sm text-slate-300">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="process" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Six steps from sign-up to confirmation</h2>
          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block" />
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={view} transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-indigo-400 to-cyan-300/70 lg:block" />
            <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
              {STEPS.map((s, i) => (
                <motion.li key={s.label} custom={i} variants={reveal} initial="hidden" whileInView="show" viewport={view} className="flex items-center gap-4 lg:flex-col lg:items-start">
                  <span className="glass relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-indigo-200">
                    <s.icon className="h-5 w-5" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-medium text-white">{i + 1}</span>
                  </span>
                  <span className="text-sm font-medium text-white">{s.label}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Heard from students, parents and alumni</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STORIES.map((t, i) => (
              <motion.figure key={t.name} custom={i} variants={reveal} initial="hidden" whileInView="show" viewport={view}
                className="glass float rounded-2xl p-6" style={{ animationDelay: `${-i * 2.3}s` }}>
                <blockquote className="text-slate-100">{t.text}</blockquote>
                <figcaption className="mt-4 text-sm text-slate-400">{t.name}, {t.who.toLowerCase()}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="glass grid items-center gap-8 rounded-3xl p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Start Your Admission Journey Today</h2>
              <p className="mt-3 max-w-md text-slate-300">Create your account, pick a program and submit in one sitting or over several days.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/register" className={btnPrimary}>Create your account</Link>
                <Link to="/login" className={btnGhost}>Sign in</Link>
              </div>
            </div>
            <Scene cards={HERO_CARDS.slice(0, 2)} />
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-slate-400">Admission Platform</footer>
      </div>
    </div>
  );
}
