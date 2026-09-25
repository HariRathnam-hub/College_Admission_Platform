import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  GraduationCap,
  Bell,
  Users,
  ClipboardCheck,
  Megaphone,
  BarChart3,
  UserCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/features/auth/auth.types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Programs", to: "/dashboard/programs", icon: GraduationCap },
    { label: "Applications", to: "/dashboard/applications", icon: FileText },
    { label: "Documents", to: "/dashboard/applications", icon: FileCheck },
    { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
    { label: "Profile", to: "/dashboard/profile", icon: UserCircle },
  ],
  FACULTY: [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Assigned Reviews", to: "/dashboard/review", icon: ClipboardCheck },
    { label: "Documents", to: "/dashboard/faculty/documents", icon: FileCheck },
    { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
    { label: "Profile", to: "/dashboard/faculty/profile", icon: UserCircle },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Programs", to: "/dashboard/admin/programs", icon: GraduationCap },
    { label: "Users", to: "/dashboard/users", icon: Users },
    { label: "Faculty", to: "/dashboard/admin/faculty", icon: Users },
    { label: "Applications", to: "/dashboard/admin/applications", icon: ClipboardCheck },
    { label: "Documents", to: "/dashboard/admin/documents", icon: FileCheck },
    { label: "Notifications", to: "/dashboard/admin/notifications", icon: Megaphone },
    { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", to: "/dashboard/admin/settings", icon: Settings },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const items = user ? NAV_BY_ROLE[user.role] : [];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span>Admission Platform</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

/** Horizontal nav for small screens, where the sidebar is hidden. */
export function MobileNav() {
  const { user } = useAuth();
  const items = user ? NAV_BY_ROLE[user.role] : [];
  return (
    <nav aria-label="Primary" className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === "/dashboard"}
          className={({ isActive }) =>
            cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground")
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
