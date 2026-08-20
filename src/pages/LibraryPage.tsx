import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { YoutubeEmbed } from "../components/YoutubeEmbed";
import { Disclosure, EmptyState, Input, SelectField } from "../components/ui";
import { BODY_PARTS, CARDIO_TYPES, EXERCISE_CATALOG, labelBodyPart, labelCardio } from "../lib/exercises";
import type { BodyPart, CardioType, WorkoutKind } from "../lib/types";

const KINDS: { id: WorkoutKind | "all"; label: string }[] = [
  { id: "all", label: "All exercises" },
  { id: "weights", label: "Weights" },
  { id: "cardio", label: "Cardio" },
];

export function LibraryPage() {
  const [kind, setKind] = useState<WorkoutKind | "all">("all");
  const [bodyPart, setBodyPart] = useState<BodyPart | "all">("all");
  const [cardioType, setCardioType] = useState<CardioType | "all">("all");
  const [query, setQuery] = useState("");

  const exercises = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISE_CATALOG.filter((ex) => {
      if (kind !== "all" && ex.kind !== kind) return false;
      if (kind === "weights" && bodyPart !== "all" && ex.bodyPart !== bodyPart) return false;
      if (kind === "cardio" && cardioType !== "all" && ex.cardioType !== cardioType) return false;
      if (q && !`${ex.name} ${ex.cue}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kind, bodyPart, cardioType, query]);

  return (
    <div className="grid gap-5">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cta">Form</p>
        <h1 className="mt-1 text-3xl">Exercise library</h1>
      </header>

      <div className="grid gap-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            aria-label="Search exercises"
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="Type" value={kind} onChange={setKind} options={KINDS} />
          {kind === "weights" && (
            <SelectField
              label="Body part"
              value={bodyPart}
              onChange={setBodyPart}
              options={[{ id: "all" as const, label: "All body parts" }, ...BODY_PARTS]}
            />
          )}
          {kind === "cardio" && (
            <SelectField
              label="Discipline"
              value={cardioType}
              onChange={setCardioType}
              options={[{ id: "all" as const, label: "All disciplines" }, ...CARDIO_TYPES]}
            />
          )}
        </div>
      </div>

      <p className="text-xs text-mist" aria-live="polite">
        {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
      </p>

      {exercises.length === 0 ? (
        <EmptyState title="Nothing matches" body="Try a different search or widen the filters." />
      ) : (
        <ul className="grid gap-2">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="min-w-0">
              <Disclosure
                summary={exercise.name}
                meta={`${
                  exercise.bodyPart ? labelBodyPart(exercise.bodyPart) : labelCardio(exercise.cardioType)
                } · ${exercise.cue}`}
              >
                <YoutubeEmbed
                  youtubeId={exercise.youtubeId}
                  searchQuery={exercise.searchQuery}
                  title={exercise.name}
                />
              </Disclosure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
