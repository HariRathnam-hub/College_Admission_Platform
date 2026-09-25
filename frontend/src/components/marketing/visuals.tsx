import type { PointerEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 17) % 100}%`,
  size: 2 + (i % 3),
  delay: `${-(i * 1.7)}s`,
}));

/** Shared navy backdrop: mesh gradient, grid, glowing orbs, CSS-only particles. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden bg-[#0a1024]">
      <div className="mesh absolute inset-0" />
      <div className="grid-pattern absolute inset-0" />
      <div className="orb -left-24 top-10 h-96 w-96 bg-indigo-500/25" />
      <div className="orb right-0 top-1/3 h-80 w-80 bg-cyan-400/10" style={{ animationDelay: "-6s" }} />
      {PARTICLES.map((p, i) => (
        <span key={i} className="particle" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

export interface SceneCard {
  icon: LucideIcon;
  title: string;
  note: string;
}

const SLOTS = ["-left-2 top-4", "-right-4 top-1/3", "left-10 -bottom-3"];

/** Layered campus illustration with floating cards and mouse parallax. */
export function Scene({ cards, className = "" }: { cards: SceneCard[]; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotateX = useTransform(sy, [-1, 1], [5, -5]);
  const fx = useTransform(sx, [-1, 1], [-14, 14]);
  const fy = useTransform(sy, [-1, 1], [-10, 10]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      className={`relative mx-auto aspect-[4/3] w-full max-w-md [perspective:1000px] ${className}`}
    >
      <motion.div style={{ rotateX, rotateY }} className="glass absolute inset-6 rounded-3xl p-6">
        <svg viewBox="0 0 240 150" className="h-full w-full" role="img" aria-label="University campus illustration">
          <path d="M20 58 120 14l100 44z" fill="rgba(129,140,248,.35)" stroke="rgba(199,210,254,.6)" />
          {[40, 80, 120, 160, 200].map((x) => (
            <rect key={x} x={x - 8} y="66" width="16" height="52" rx="3" fill="rgba(165,180,252,.25)" stroke="rgba(199,210,254,.35)" />
          ))}
          <rect x="24" y="122" width="192" height="8" rx="3" fill="rgba(165,180,252,.3)" />
          <rect x="12" y="132" width="216" height="8" rx="3" fill="rgba(165,180,252,.2)" />
          <circle cx="120" cy="40" r="6" fill="rgba(103,232,249,.55)" />
        </svg>
      </motion.div>
      <motion.div style={{ x: fx, y: fy }} className="absolute inset-0">
        {cards.map((c, i) => (
          <div key={c.title} className={`float glass absolute ${SLOTS[i]} flex items-center gap-3 rounded-2xl px-4 py-3`} style={{ animationDelay: `${-i * 2}s` }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-200">
              <c.icon className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-medium text-white">{c.title}</span>
              <span className="block text-xs text-slate-300">{c.note}</span>
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
