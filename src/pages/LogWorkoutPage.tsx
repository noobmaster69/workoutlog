import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { YoutubeEmbed } from "../components/YoutubeEmbed";
import { Button, Card, Disclosure, ErrorBanner, Field, Input, Select, SelectField, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { todayISODate } from "../lib/dates";
import {
  BODY_PARTS,
  CARDIO_TYPES,
  exercisesForBodyPart,
  exercisesForCardio,
  findExercise,
  videoUrlForExercise,
} from "../lib/exercises";
import type { BodyPart, CardioType, WorkoutDraftItem, WorkoutKind } from "../lib/types";

function emptyWeightItem(bodyPart: BodyPart): WorkoutDraftItem {
  const first = exercisesForBodyPart(bodyPart)[0];
  return {
    exerciseName: first?.name ?? "Custom lift",
    bodyPart,
    cardioType: null,
    youtubeUrl: first ? videoUrlForExercise(first) : "",
    sets: 3,
    reps: 8,
    weightKg: 0,
    distanceKm: null,
    durationMinutes: null,
    calories: null,
    intensity: null,
    sortOrder: 0,
  };
}

function emptyCardioItem(cardioType: CardioType): WorkoutDraftItem {
  const first = exercisesForCardio(cardioType)[0];
  return {
    exerciseName: first?.name ?? CARDIO_TYPES.find((c) => c.id === cardioType)?.label ?? "Cardio",
    bodyPart: null,
    cardioType,
    youtubeUrl: first ? videoUrlForExercise(first) : "",
    sets: null,
    reps: null,
    weightKg: null,
    distanceKm: 0,
    durationMinutes: 30,
    calories: null,
    intensity: "moderate",
    sortOrder: 0,
  };
}

export function LogWorkoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<WorkoutKind>("weights");
  const [bodyPart, setBodyPart] = useState<BodyPart>("legs");
  const [cardioType, setCardioType] = useState<CardioType>("running");
  const [title, setTitle] = useState("Leg day");
  const [performedOn, setPerformedOn] = useState(todayISODate());
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<WorkoutDraftItem[]>([emptyWeightItem("legs")]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const catalog = useMemo(
    () => (kind === "weights" ? exercisesForBodyPart(bodyPart) : exercisesForCardio(cardioType)),
    [kind, bodyPart, cardioType],
  );

  function applyKind(next: WorkoutKind) {
    setKind(next);
    if (next === "weights") {
      setTitle(`${BODY_PARTS.find((p) => p.id === bodyPart)?.label ?? "Weights"} session`);
      setItems([emptyWeightItem(bodyPart)]);
    } else {
      setTitle(`${CARDIO_TYPES.find((p) => p.id === cardioType)?.label ?? "Cardio"} session`);
      setItems([emptyCardioItem(cardioType)]);
    }
  }

  function applyBodyPart(next: BodyPart) {
    setBodyPart(next);
    setTitle(`${BODY_PARTS.find((p) => p.id === next)?.label} session`);
    setItems([emptyWeightItem(next)]);
  }

  function applyCardioType(next: CardioType) {
    setCardioType(next);
    setTitle(`${CARDIO_TYPES.find((p) => p.id === next)?.label} session`);
    setItems([emptyCardioItem(next)]);
  }

  function updateItem(index: number, patch: Partial<WorkoutDraftItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function pickCatalogExercise(index: number, name: string) {
    const found = findExercise(name) ?? catalog.find((ex) => ex.name === name);
    updateItem(index, {
      exerciseName: name,
      youtubeUrl: found ? videoUrlForExercise(found) : "",
      bodyPart: kind === "weights" ? bodyPart : null,
      cardioType: kind === "cardio" ? cardioType : null,
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    if (items.length === 0) {
      setError("Add at least one exercise.");
      return;
    }
    setBusy(true);
    try {
      await api.createWorkout({
        userId: user.id,
        kind,
        title: title.trim() || (kind === "weights" ? "Weights" : "Cardio"),
        performedOn,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        notes,
        items: items.map((item, index) => ({
          ...item,
          bodyPart: kind === "weights" ? bodyPart : null,
          cardioType: kind === "cardio" ? cardioType : null,
          youtubeUrl: item.youtubeUrl.trim(),
          sortOrder: index,
        })),
      });
      navigate("/app/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save workout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cta">New session</p>
        <h1 className="mt-1 text-3xl">Log a workout</h1>
      </div>

      <Card className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Session type"
          value={kind}
          onChange={applyKind}
          options={[
            { id: "weights" as const, label: "Weights" },
            { id: "cardio" as const, label: "Cardio" },
          ]}
        />
        {kind === "weights" ? (
          <SelectField label="Body part" value={bodyPart} onChange={applyBodyPart} options={BODY_PARTS} />
        ) : (
          <SelectField label="Discipline" value={cardioType} onChange={applyCardioType} options={CARDIO_TYPES} />
        )}
      </Card>

      <Card className="grid gap-4 md:grid-cols-3">
        <Field label="Session name">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Date">
          <Input type="date" value={performedOn} onChange={(e) => setPerformedOn(e.target.value)} required />
        </Field>
        <Field label="Duration (min)">
          <Input type="number" min={0} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
        </Field>
        <div className="md:col-span-3">
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
          </Field>
        </div>
      </Card>

      <div className="grid gap-4">
        {items.map((item, index) => {
          const found = findExercise(item.exerciseName);
          return (
            <Card key={`${item.exerciseName}-${index}`} className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl">
                  {kind === "weights" ? "Lift" : "Cardio"} {index + 1}
                </h2>
                {items.length > 1 && (
                  <Button type="button" variant="danger" onClick={() => setItems((c) => c.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Exercise">
                  <Input
                    list={`catalog-${index}`}
                    value={item.exerciseName}
                    onChange={(e) => pickCatalogExercise(index, e.target.value)}
                    required
                  />
                  <datalist id={`catalog-${index}`}>
                    {catalog.map((ex) => (
                      <option key={ex.id} value={ex.name} />
                    ))}
                  </datalist>
                </Field>
                <Field label="YouTube link (auto-filled, editable)">
                  <Input
                    value={item.youtubeUrl}
                    onChange={(e) => updateItem(index, { youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=…"
                  />
                </Field>
              </div>
              {kind === "weights" ? (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Sets">
                    <Input
                      type="number"
                      min={0}
                      value={item.sets ?? 0}
                      onChange={(e) => updateItem(index, { sets: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Reps">
                    <Input
                      type="number"
                      min={0}
                      value={item.reps ?? 0}
                      onChange={(e) => updateItem(index, { reps: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      value={item.weightKg ?? 0}
                      onChange={(e) => updateItem(index, { weightKg: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field label="Distance (km)">
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={item.distanceKm ?? 0}
                      onChange={(e) => updateItem(index, { distanceKm: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Minutes">
                    <Input
                      type="number"
                      min={0}
                      value={item.durationMinutes ?? 0}
                      onChange={(e) => updateItem(index, { durationMinutes: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Calories">
                    <Input
                      type="number"
                      min={0}
                      value={item.calories ?? 0}
                      onChange={(e) => updateItem(index, { calories: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Intensity">
                    <Select
                      value={item.intensity ?? "moderate"}
                      onChange={(e) => updateItem(index, { intensity: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </Select>
                  </Field>
                </div>
              )}
              <Disclosure summary="Form video" meta={item.exerciseName}>
                <YoutubeEmbed
                  youtubeUrl={item.youtubeUrl}
                  youtubeId={found?.youtubeId}
                  searchQuery={found?.searchQuery ?? item.exerciseName}
                  title={item.exerciseName}
                />
              </Disclosure>
            </Card>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setItems((current) => [
              ...current,
              kind === "weights" ? emptyWeightItem(bodyPart) : emptyCardioItem(cardioType),
            ])
          }
        >
          Add another {kind === "weights" ? "lift" : "cardio block"}
        </Button>
      </div>

      <ErrorBanner message={error} />
      <Button type="submit" disabled={busy} className="justify-self-start px-8">
        {busy ? "Saving…" : "Save workout"}
      </Button>
    </form>
  );
}
