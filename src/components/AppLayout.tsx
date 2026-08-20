import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Plus,
  Target,
  Video,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/log", label: "Log", icon: Plus, end: false },
  { to: "/app/history", label: "History", icon: Dumbbell, end: false },
  { to: "/app/library", label: "Library", icon: Video, end: false },
  { to: "/app/goals", label: "Goals", icon: Target, end: false },
  { to: "/app/habits", label: "Habits", icon: Flame, end: false },
];

export function AppLayout() {
  const { user, signOut, mode } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-ink-2/80 p-5 lg:flex lg:flex-col">
        <NavLink to="/app" className="display text-2xl text-accent">
          IronLog
        </NavLink>
        <p className="mt-1 text-xs text-mist">
          {user?.displayName} · {mode === "supabase" ? "Supabase" : "Local demo"}
        </p>
        <nav className="mt-8 grid gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  isActive ? "bg-panel text-accent" : "text-mist hover:text-foam"
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <HeartPulse className="shrink-0 text-cta" size={18} />
            <span className="display text-xl text-accent">IronLog</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-xs text-mist">{user?.displayName}</span>
            <button
              type="button"
              aria-label="Sign out"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-mist"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-line bg-ink-2/95 px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[11px] ${
                isActive ? "text-accent" : "text-mist"
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
