import { FormEvent, useState } from "react";
import { Button, Card, EmptyState, ErrorBanner, Field, Input, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import { api } from "../lib/api";
import type { GoalCategory } from "../lib/types";

export function GoalsPage() {
  const { user } = useAuth();
  const { goals, loading, error, reload } = useAppData();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("weights");
  const [targetValue, setTargetValue] = useState("100");
  const [currentValue, setCurrentValue] = useState("0");
  const [unit, setUnit] = useState("kg");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setFormError(null);
    try {
      await api.createGoal({
        userId: user.id,
        title,
        category,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        unit,
        deadline: deadline || null,
      });
      setTitle("");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save goal.");
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cta">Aim</p>
        <h1 className="text-4xl">Goals</h1>
      </div>
      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Field label="Goal">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Squat 140 kg" required />
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}>
              <option value="weights">Weights</option>
              <option value="cardio">Cardio</option>
              <option value="habit">Habit</option>
              <option value="general">General</option>
            </Select>
          </Field>
          <Field label="Current">
            <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required />
          </Field>
          <Field label="Target">
            <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required />
          </Field>
          <Field label="Unit">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, km, sessions" />
          </Field>
          <Field label="Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <ErrorBanner message={formError} />
            <Button type="submit" className="mt-2">
              Add goal
            </Button>
          </div>
        </form>
      </Card>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : goals.length === 0 ? (
        <EmptyState title="No goals yet" body="Pick a number that would make the next block of training matter." />
      ) : (
        <ul className="grid gap-3">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / Math.max(goal.targetValue, 1)) * 100));
            return (
              <li key={goal.id}>
                <Card className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="display text-2xl">{goal.title}</p>
                    <p className="text-sm text-mist">
                      {goal.category} · {goal.currentValue}/{goal.targetValue} {goal.unit}
                      {goal.deadline ? ` · due ${goal.deadline}` : ""}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          const next = goal.currentValue + 1;
                          await api.updateGoal(goal.id, {
                            currentValue: next,
                            status: next >= goal.targetValue ? "completed" : "active",
                          });
                          await reload();
                        }}
                      >
                        +1 progress
                      </Button>
                      {goal.status !== "completed" && (
                        <Button
                          variant="accent"
                          onClick={async () => {
                            await api.updateGoal(goal.id, { status: "completed", currentValue: goal.targetValue });
                            await reload();
                          }}
                        >
                          Mark done
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await api.deleteGoal(goal.id);
                      await reload();
                    }}
                  >
                    Delete
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
