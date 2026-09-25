import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileCheck2, GraduationCap, ShieldCheck } from "lucide-react";
import { Backdrop, Scene } from "@/components/marketing/visuals";

const SCENE_CARDS = [
  { icon: BookOpen, title: "Program shortlisted", note: "Robotics and Automation" },
  { icon: FileCheck2, title: "Documents verified", note: "All 4 files approved" },
  { icon: GraduationCap, title: "Admission confirmed", note: "Welcome aboard" },
];

/** Shared shell for every auth page. `.auth-scope` (index.css) re-themes the existing form components. */
export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="auth-scope relative min-h-screen overflow-hidden text-foreground">
      <Backdrop />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <aside className="hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <GraduationCap className="h-6 w-6 text-indigo-300" /> Admission Platform
          </Link>
          <Scene cards={SCENE_CARDS} />
          <p className="flex max-w-sm items-start gap-2 text-sm text-slate-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            Apply, upload documents and follow every decision in one secure place.
          </p>
        </aside>

        <main className="flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full max-w-md">
            <div className="mb-6">
              <Link to="/" className="mb-6 flex items-center gap-2 font-semibold text-white lg:hidden">
                <GraduationCap className="h-6 w-6 text-indigo-300" /> Admission Platform
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
