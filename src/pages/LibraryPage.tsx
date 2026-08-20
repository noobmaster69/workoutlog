import { useMemo, useState } from "react";
import { YoutubeEmbed } from "../components/YoutubeEmbed";
import { Button, Card } from "../components/ui";
import { BODY_PARTS, CARDIO_TYPES, EXERCISE_CATALOG } from "../lib/exercises";
import type { BodyPart, CardioType, WorkoutKind } from "../lib/types";

export function LibraryPage() {
  const [kind, setKind] = useState<WorkoutKind | "all">("all");
  const [bodyPart, setBodyPart] = useState<BodyPart | "all">("all");
  const [cardioType, setCardioType] = useState<CardioType | "all">("all");

  const exercises = useMemo(
    () =>
      EXERCISE_CATALOG.filter((ex) => {
        if (kind !== "all" && ex.kind !== kind) return false;
        if (kind === "weights" && bodyPart !== "all" && ex.bodyPart !== bodyPart) return false;
        if (kind === "cardio" && cardioType !== "all" && ex.cardioType !== cardioType) return false;
        return true;
      }),
    [kind, bodyPart, cardioType],
  );

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cta">Form</p>
        <h1 className="text-4xl">Exercise library</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          Every catalog movement has a YouTube form video. Logging a workout pulls the matching clip
          automatically — you can still paste a different link.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "weights", "cardio"] as const).map((value) => (
          <Button key={value} variant={kind === value ? "accent" : "ghost"} onClick={() => setKind(value)}>
            {value === "all" ? "All" : value === "weights" ? "Weights" : "Cardio"}
          </Button>
        ))}
      </div>
      {kind === "weights" && (
        <div className="flex flex-wrap gap-2">
          <Button variant={bodyPart === "all" ? "primary" : "ghost"} onClick={() => setBodyPart("all")}>
            All parts
          </Button>
          {BODY_PARTS.map((part) => (
            <Button key={part.id} variant={bodyPart === part.id ? "primary" : "ghost"} onClick={() => setBodyPart(part.id)}>
              {part.label}
            </Button>
          ))}
        </div>
      )}
      {kind === "cardio" && (
        <div className="flex flex-wrap gap-2">
          <Button variant={cardioType === "all" ? "primary" : "ghost"} onClick={() => setCardioType("all")}>
            All cardio
          </Button>
          {CARDIO_TYPES.map((type) => (
            <Button key={type.id} variant={cardioType === type.id ? "primary" : "ghost"} onClick={() => setCardioType(type.id)}>
              {type.label}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="grid gap-3">
            <div>
              <p className="display text-2xl">{exercise.name}</p>
              <p className="text-sm text-mist">{exercise.cue}</p>
            </div>
            <YoutubeEmbed
              youtubeId={exercise.youtubeId}
              searchQuery={exercise.searchQuery}
              title={exercise.name}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
