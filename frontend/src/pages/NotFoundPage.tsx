import { Link } from "react-router-dom";
import { Backdrop } from "@/components/marketing/visuals";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Backdrop />
      <div className="glass relative z-10 rounded-3xl px-10 py-12">
        <h1 className="text-6xl font-semibold text-indigo-200">404</h1>
        <p className="mt-3 text-slate-300">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white hover:bg-indigo-400">Back to home</Link>
      </div>
    </div>
  );
}
