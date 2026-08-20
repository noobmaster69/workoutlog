import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, ErrorBanner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import { formatPrettyDate, startOfWeek, todayISODate } from "../lib/dates";
import { completedThisPeriod, currentStreak } from "../lib/habits";
import { labelBodyPart, labelCardio } from "../lib/exercises";

export function DashboardPage() {
  const { user } = useAuth();
  const { workouts, goals, habits, habitLogs, loading, error } = useAppData();
  const today = todayISODate();
  const weekStart = todayISODate(startOfWeek());
  const weekWorkouts = workouts.filter((w) => w.performedOn >= weekStart);
  const activeGoals = goals.filter((g) => g.status === "active");
  const habitsOnTarget = habits.filter(
    (h) => completedThisPeriod(habitLogs, h, today) >= h.targetPerPeriod,
  ).length;

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cta">Today</p>
          <h1 className="mt-1 text-3xl">{user?.displayName}, train.</h1>
        </div>
        <Link to="/app/log">
          <Button>Log a workout</Button>
        </Link>
      </header>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Stat label="Sessions this week" value={String(weekWorkouts.length)} />
            <Stat label="Active goals" value={String(activeGoals.length)} />
            <Stat label="Habits on target" value={`${habitsOnTarget}/${habits.length || 0}`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Recent sessions" to="/app/history" action="History">
              {workouts.length === 0 ? (
                <Quiet>Log weights or cardio to see them here.</Quiet>
              ) : (
                <Rows>
                  {workouts.slice(0, 5).map((workout) => (
                    <li key={workout.id} className="py-3">
                      <p className="text-sm font-semibold">{workout.title}</p>
                      <p className="mt-0.5 text-xs text-mist">
                        {formatPrettyDate(workout.performedOn)} ·{" "}
                        {workout.kind === "weights" ? "Weights" : "Cardio"}
                        {workout.items[0]?.bodyPart ? ` · ${labelBodyPart(workout.items[0].bodyPart)}` : ""}
                        {workout.items[0]?.cardioType ? ` · ${labelCardio(workout.items[0].cardioType)}` : ""}
                      </p>
                    </li>
                  ))}
                </Rows>
              )}
            </Section>

            <Section title="Habits" to="/app/habits" action="Track">
              {habits.length === 0 ? (
                <Quiet>Add a daily stretch, steps, or protein check-in.</Quiet>
              ) : (
                <Rows>
                  {habits.map((habit) => {
                    const done = completedThisPeriod(habitLogs, habit, today) >= habit.targetPerPeriod;
                    return (
                      <li key={habit.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{habit.name}</p>
                          <p className="mt-0.5 text-xs text-mist">
                            {completedThisPeriod(habitLogs, habit, today)}/{habit.targetPerPeriod} ·{" "}
                            {currentStreak(habitLogs, habit)}{" "}
                            {habit.cadence === "weekly" ? "week" : "day"} streak
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            done
                              ? "bg-success/12 text-success"
                              : "bg-ink-2 text-mist"
                          }`}
                        >
                          {done ? "Done" : "Open"}
                        </span>
                      </li>
                    );
                  })}
                </Rows>
              )}
            </Section>
          </div>

          <Section title="Goals" to="/app/goals" action="Manage">
            {activeGoals.length === 0 ? (
              <Quiet>Set a lift, a distance, or a weekly frequency target.</Quiet>
            ) : (
              <Rows>
                {activeGoals.map((goal) => {
                  const pct = Math.min(
                    100,
                    Math.round((goal.currentValue / Math.max(goal.targetValue, 1)) * 100),
                  );
                  return (
                    <li key={goal.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold">{goal.title}</p>
                        <p className="shrink-0 text-xs text-mist tabular-nums">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </Rows>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

/**
 * A section is a label and a rule, not another box. The dashboard previously
 * nested bordered rows inside bordered cards inside a bordered empty state,
 * which is what made it read as cluttered.
 */
function Section({
  title,
  to,
  action,
  children,
}: {
  title: string;
  to: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-1">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist">{title}</h2>
        <Link to={to} className="text-xs font-semibold text-accent hover:text-accent-2">
          {action}
        </Link>
      </div>
      {children}
    </section>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-line">{children}</ul>;
}

function Quiet({ children }: { children: ReactNode }) {
  return <p className="py-4 text-sm text-mist">{children}</p>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/70 p-3 sm:p-4">
      <p className="text-[10px] uppercase leading-tight tracking-wider text-mist">{label}</p>
      <p className="mt-1 display text-2xl text-accent tabular-nums sm:text-3xl">{value}</p>
    </div>
  );
}
