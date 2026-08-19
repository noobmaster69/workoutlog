import { useMemo, useState } from "react";
import { YoutubeEmbed } from "../components/YoutubeEmbed";
import { Button, Card, EmptyState, ErrorBanner } from "../components/ui";
import { useAppData } from "../hooks/useAppData";
import { api } from "../lib/api";
import { formatPrettyDate } from "../lib/dates";
import { findExercise, labelBodyPart, labelCardio } from "../lib/exercises";
import type { WorkoutKind } from "../lib/types";

export function HistoryPage() {
  const { workouts, loading, error, reload } = useAppData();
  const [kind, setKind] = useState<WorkoutKind | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => workouts.filter((w) => (kind === "all" ? true : w.kind === kind)),
    [workouts, kind],
  );

  async function remove(id: string) {
    await api.deleteWorkout(id);
    await reload();
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-ember">Archive</p>
        <h1 className="text-4xl">Workout history</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "weights", "cardio"] as const).map((value) => (
          <Button key={value} variant={kind === value ? "gold" : "ghost"} onClick={() => setKind(value)}>
            {value === "all" ? "All" : value === "weights" ? "Weights" : "Cardio"}
          </Button>
        ))}
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-mist">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing logged yet" body="Your sessions will land here, grouped by type." />
      ) : (
        <ul className="grid gap-4">
          {filtered.map((workout) => {
            const open = openId === workout.id;
            return (
              <li key={workout.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button type="button" className="text-left" onClick={() => setOpenId(open ? null : workout.id)}>
                      <p className="display text-2xl">{workout.title}</p>
                      <p className="text-sm text-mist">
                        {formatPrettyDate(workout.performedOn)} · {workout.kind === "weights" ? "Weights" : "Cardio"}
                        {workout.durationMinutes ? ` · ${workout.durationMinutes} min` : ""}
                      </p>
                    </button>
                    <Button variant="danger" onClick={() => void remove(workout.id)}>
                      Delete
                    </Button>
                  </div>
                  {open && (
                    <div className="mt-4 grid gap-4">
                      {workout.notes && <p className="text-sm text-mist">{workout.notes}</p>}
                      {workout.items.map((item) => {
                        const found = findExercise(item.exerciseName);
                        return (
                          <div key={item.id} className="grid gap-3 rounded-xl border border-line p-3 md:grid-cols-[1fr_280px]">
                            <div>
                              <p className="font-semibold">{item.exerciseName}</p>
                              <p className="text-xs text-mist">
                                {item.bodyPart ? labelBodyPart(item.bodyPart) : labelCardio(item.cardioType)}
                                {item.sets != null ? ` · ${item.sets}×${item.reps} @ ${item.weightKg ?? 0} kg` : ""}
                                {item.distanceKm != null ? ` · ${item.distanceKm} km` : ""}
                                {item.durationMinutes != null && workout.kind === "cardio" ? ` · ${item.durationMinutes} min` : ""}
                              </p>
                            </div>
                            <YoutubeEmbed
                              youtubeUrl={item.youtubeUrl}
                              youtubeId={found?.youtubeId}
                              searchQuery={found?.searchQuery ?? item.exerciseName}
                              title={item.exerciseName}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
