import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar, MobileNav } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  const { pathname } = useLocation();
  return (
    <div className="dash-scope dash-bg flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <MobileNav />
        <main className="flex-1 p-4 sm:p-6">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
