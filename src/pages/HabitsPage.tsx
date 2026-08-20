import { FormEvent, useState } from "react";
import { Button, Card, EmptyState, ErrorBanner, Field, Input, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import { api } from "../lib/api";
import { formatPrettyDate, todayISODate } from "../lib/dates";
import { completedThisPeriod, currentStreak, isLoggedOn, lastNDays } from "../lib/habits";
import type { HabitCadence } from "../lib/types";

export function HabitsPage() {
  const { user } = useAuth();
  const { habits, habitLogs, loading, error, reload } = useAppData();
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<HabitCadence>("daily");
  const [target, setTarget] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);
  const days = lastNDays(14);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setFormError(null);
    try {
      await api.createHabit({
        userId: user.id,
        name,
        cadence,
        targetPerPeriod: Number(target),
      });
      setName("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save habit.");
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cta">Consistency</p>
        <h1 className="text-4xl">Habit tracking</h1>
      </div>
      <Card>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={onSubmit}>
          <div className="md:col-span-2">
            <Field label="Habit">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Train, stretch, sleep 7h" required />
            </Field>
          </div>
          <Field label="Cadence">
            <Select value={cadence} onChange={(e) => setCadence(e.target.value as HabitCadence)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </Field>
          <Field label="Target / period">
            <Input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <div className="md:col-span-4">
            <ErrorBanner message={formError} />
            <Button type="submit" className="mt-2">
              Add habit
            </Button>
          </div>
        </form>
      </Card>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : habits.length === 0 ? (
        <EmptyState title="No habits yet" body="Track the small things that make the heavy things possible." />
      ) : (
        <ul className="grid gap-4">
          {habits.map((habit) => (
            <li key={habit.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="display text-2xl">{habit.name}</p>
                    <p className="text-sm text-mist">
                      {habit.cadence} · {completedThisPeriod(habitLogs, habit)}/{habit.targetPerPeriod} this period ·{" "}
                      {currentStreak(habitLogs, habit)} streak
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      onClick={async () => {
                        if (!user) return;
                        await api.toggleHabitLog(user.id, habit.id, todayISODate());
                        await reload();
                      }}
                    >
                      {isLoggedOn(habitLogs, habit.id, todayISODate()) ? "Undo today" : "Check in today"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        await api.archiveHabit(habit.id);
                        await reload();
                      }}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {days.map((day) => {
                    const on = isLoggedOn(habitLogs, habit.id, day);
                    return (
                      <button
                        type="button"
                        key={day}
                        title={day}
                        aria-pressed={on}
                        aria-label={`${habit.name} on ${formatPrettyDate(day)}: ${on ? "checked in" : "not checked in"}`}
                        className={`h-8 w-8 rounded-md text-[10px] ${on ? "bg-accent text-ink" : "bg-ink text-mist"}`}
                        onClick={async () => {
                          if (!user) return;
                          await api.toggleHabitLog(user.id, habit.id, day);
                          await reload();
                        }}
                      >
                        {day.slice(-2)}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
