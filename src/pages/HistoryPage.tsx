import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { YoutubeEmbed } from "../components/YoutubeEmbed";
import { Button, Card, EmptyState, ErrorBanner, SelectField } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import { api } from "../lib/api";
import { formatPrettyDate } from "../lib/dates";
import { findExercise, labelBodyPart, labelCardio } from "../lib/exercises";
import { exportToExcel } from "../lib/export";
import type { WorkoutKind } from "../lib/types";

export function HistoryPage() {
  const { user } = useAuth();
  const { workouts, goals, habits, habitLogs, loading, error, reload } = useAppData();
  const [kind, setKind] = useState<WorkoutKind | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const hasData =
    workouts.length > 0 || goals.length > 0 || habits.length > 0 || habitLogs.length > 0;

  async function onExport() {
    if (!user) return;
    setExportError(null);
    setExporting(true);
    try {
      await exportToExcel({
        displayName: user.displayName,
        email: user.email,
        workouts,
        goals,
        habits,
        habitLogs,
      });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Could not build the spreadsheet.");
    } finally {
      setExporting(false);
    }
  }

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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cta">Archive</p>
          <h1 className="mt-1 text-3xl">Workout history</h1>
        </div>
        <Button variant="ghost" onClick={onExport} disabled={exporting || loading || !hasData}>
          <Download size={16} />
          {exporting ? "Building…" : "Export to Excel"}
        </Button>
      </header>
      <p className="-mt-3 text-xs text-mist">
        The export covers everything — sessions, exercises, goals, habits, and check-ins — as a
        formatted .xlsx workbook.
      </p>
      <ErrorBanner message={exportError} />
      <SelectField
        label="Show"
        value={kind}
        onChange={setKind}
        options={[
          { id: "all" as const, label: "All sessions" },
          { id: "weights" as const, label: "Weights only" },
          { id: "cardio" as const, label: "Cardio only" },
        ]}
        className="sm:max-w-xs"
      />
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
