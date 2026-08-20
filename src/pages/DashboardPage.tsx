import { Link } from "react-router-dom";
import { Button, Card, EmptyState, ErrorBanner } from "../components/ui";
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cta">Today</p>
          <h1 className="text-4xl">{user?.displayName}, train.</h1>
        </div>
        <Link to="/app/log">
          <Button>Log a workout</Button>
        </Link>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Stat label="Sessions this week" value={String(weekWorkouts.length)} />
            <Stat label="Active goals" value={String(activeGoals.length)} />
            <Stat
              label="Habits on target"
              value={`${habits.filter((h) => completedThisPeriod(habitLogs, h, today) >= h.targetPerPeriod).length}/${habits.length || 0}`}
            />
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Recent sessions</h2>
                <Link to="/app/history" className="text-sm text-accent">
                  History
                </Link>
              </div>
              {workouts.length === 0 ? (
                <EmptyState title="No sessions yet" body="Log weights or cardio to see them here." />
              ) : (
                <ul className="grid gap-3">
                  {workouts.slice(0, 5).map((workout) => (
                    <li key={workout.id} className="rounded-xl border border-line px-3 py-3">
                      <p className="font-semibold">{workout.title}</p>
                      <p className="text-xs text-mist">
                        {formatPrettyDate(workout.performedOn)} · {workout.kind === "weights" ? "Weights" : "Cardio"}
                        {workout.items[0]?.bodyPart ? ` · ${labelBodyPart(workout.items[0].bodyPart)}` : ""}
                        {workout.items[0]?.cardioType ? ` · ${labelCardio(workout.items[0].cardioType)}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl">Habits</h2>
                <Link to="/app/habits" className="text-sm text-accent">
                  Track
                </Link>
              </div>
              {habits.length === 0 ? (
                <EmptyState title="No habits" body="Add a daily stretch, steps, or protein check-in." />
              ) : (
                <ul className="grid gap-3">
                  {habits.map((habit) => (
                    <li key={habit.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-3">
                      <div>
                        <p className="font-semibold">{habit.name}</p>
                        <p className="text-xs text-mist">
                          {completedThisPeriod(habitLogs, habit, today)}/{habit.targetPerPeriod} ·{" "}
                          {currentStreak(habitLogs, habit)} {habit.cadence === "weekly" ? "week" : "day"} streak
                        </p>
                      </div>
                      <span className={completedThisPeriod(habitLogs, habit, today) >= habit.targetPerPeriod ? "text-success" : "text-mist"}>
                        {completedThisPeriod(habitLogs, habit, today) >= habit.targetPerPeriod ? "Done" : "Open"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">Goals</h2>
              <Link to="/app/goals" className="text-sm text-accent">
                Manage
              </Link>
            </div>
            {activeGoals.length === 0 ? (
              <EmptyState title="No active goals" body="Set a lift, a distance, or a weekly frequency target." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {activeGoals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentValue / Math.max(goal.targetValue, 1)) * 100));
                  return (
                    <div key={goal.id} className="rounded-xl border border-line p-3">
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-xs text-mist">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  // Not a Card: the three stats sit side by side on a phone, so they need tighter padding.
  return (
    <div className="rounded-2xl border border-line bg-panel/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-5">
      <p className="text-[10px] uppercase leading-tight tracking-wider text-mist sm:text-xs sm:tracking-widest">
        {label}
      </p>
      <p className="mt-1 display text-2xl text-accent sm:mt-2 sm:text-4xl">{value}</p>
    </div>
  );
}
