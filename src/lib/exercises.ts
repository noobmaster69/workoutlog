import type { BodyPart, CardioType, CatalogExercise } from "./types";
import { youtubeSearchUrl } from "./youtube";

export const BODY_PARTS: { id: BodyPart; label: string; blurb: string }[] = [
  { id: "legs", label: "Legs", blurb: "Squats, hinges, lunges, and calves." },
  { id: "upper_body", label: "Upper body", blurb: "Presses, pulls, arms, and shoulders." },
  { id: "core", label: "Core", blurb: "Bracing, flexion, rotation, and carries." },
];

export const CARDIO_TYPES: { id: CardioType; label: string; blurb: string }[] = [
  { id: "running", label: "Running", blurb: "Outdoor or treadmill." },
  { id: "cycling", label: "Cycling", blurb: "Road, indoor, or spin." },
  { id: "swimming", label: "Swimming", blurb: "Laps or open water." },
  { id: "rowing", label: "Rowing", blurb: "Erg or on the water." },
  { id: "walking", label: "Walking", blurb: "Zone 2 and recovery." },
  { id: "hiit", label: "HIIT", blurb: "Intervals and circuits." },
  { id: "jump_rope", label: "Jump rope", blurb: "Skill and conditioning." },
  { id: "stair_climber", label: "Stair climber", blurb: "Stepmill and stairs." },
  { id: "elliptical", label: "Elliptical", blurb: "Low-impact machine work." },
  { id: "boxing", label: "Boxing", blurb: "Bag work and shadow boxing." },
  { id: "other", label: "Other", blurb: "Anything that gets you moving." },
];

export const EXERCISE_CATALOG: CatalogExercise[] = [
  {
    id: "back-squat",
    name: "Barbell back squat",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "ultWZbUMPL8",
    searchQuery: "barbell back squat",
    cue: "Brace, sit between your hips, drive the floor away.",
  },
  {
    id: "front-squat",
    name: "Front squat",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "v-mQm_droHg",
    searchQuery: "barbell front squat",
    cue: "Elbows high, torso tall, knees track over toes.",
  },
  {
    id: "rdl",
    name: "Romanian deadlift",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "lKLYvNGz6mk",
    searchQuery: "romanian deadlift",
    cue: "Hips back, bar close, hamstrings loaded.",
  },
  {
    id: "deadlift",
    name: "Conventional deadlift",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "op9kVnSso6Q",
    searchQuery: "conventional deadlift",
    cue: "Wedge in, push the floor, lock the hips.",
  },
  {
    id: "leg-press",
    name: "Leg press",
    kind: "weights",
    bodyPart: "legs",
    searchQuery: "leg press machine form",
    cue: "Full range without rounding the low back.",
  },
  {
    id: "lunges",
    name: "Walking lunges",
    kind: "weights",
    bodyPart: "legs",
    searchQuery: "walking lunges proper form",
    cue: "Long stride, front knee stacked, back knee kisses the floor.",
  },
  {
    id: "bulgarian",
    name: "Bulgarian split squat",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "2C-uNgKwPLE",
    searchQuery: "bulgarian split squat",
    cue: "Most of the load on the front leg.",
  },
  {
    id: "hip-thrust",
    name: "Hip thrust",
    kind: "weights",
    bodyPart: "legs",
    youtubeId: "xDm2G3oAQyI",
    searchQuery: "barbell hip thrust",
    cue: "Ribs down, squeeze at the top, no hyperextension.",
  },
  {
    id: "leg-curl",
    name: "Lying leg curl",
    kind: "weights",
    bodyPart: "legs",
    searchQuery: "lying hamstring curl",
    cue: "Hips glued to the pad, control the eccentric.",
  },
  {
    id: "calf-raise",
    name: "Standing calf raise",
    kind: "weights",
    bodyPart: "legs",
    searchQuery: "standing calf raise form",
    cue: "Full stretch at the bottom, pause at the top.",
  },
  {
    id: "bench",
    name: "Barbell bench press",
    kind: "weights",
    bodyPart: "upper_body",
    youtubeId: "rT7DgCr-3pg",
    searchQuery: "barbell bench press",
    cue: "Planted feet, bar to mid-chest, elbows ~45°.",
  },
  {
    id: "incline-db",
    name: "Incline dumbbell press",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "incline dumbbell press",
    cue: "30–45° bench, dumbbells over the upper chest.",
  },
  {
    id: "ohp",
    name: "Overhead press",
    kind: "weights",
    bodyPart: "upper_body",
    youtubeId: "2yjwXTZQDDI",
    searchQuery: "standing overhead press",
    cue: "Glutes tight, bar travels in a straight line.",
  },
  {
    id: "pullup",
    name: "Pull-up",
    kind: "weights",
    bodyPart: "upper_body",
    youtubeId: "eGo4IYlbE5g",
    searchQuery: "pull up proper form",
    cue: "Chest to bar, full hang, no kipping unless programmed.",
  },
  {
    id: "barbell-row",
    name: "Barbell row",
    kind: "weights",
    bodyPart: "upper_body",
    youtubeId: "FWJR5Ve8bnQ",
    searchQuery: "barbell bent over row",
    cue: "Hinge, pull to the hip, no yanking.",
  },
  {
    id: "lat-pulldown",
    name: "Lat pulldown",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "lat pulldown form",
    cue: "Pull elbows to your pockets, slight lean.",
  },
  {
    id: "pushup",
    name: "Push-up",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "push up proper form",
    cue: "Body one line, chest to floor, lock out.",
  },
  {
    id: "face-pull",
    name: "Face pull",
    kind: "weights",
    bodyPart: "upper_body",
    youtubeId: "rep-xMFmfkU",
    searchQuery: "face pull exercise",
    cue: "Thumbs back, elbows high, rear delts do the work.",
  },
  {
    id: "curl",
    name: "Dumbbell biceps curl",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "dumbbell biceps curl form",
    cue: "Elbows pinned, no swinging.",
  },
  {
    id: "pushdown",
    name: "Triceps pushdown",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "triceps pushdown form",
    cue: "Elbows still, squeeze at lockout.",
  },
  {
    id: "lateral-raise",
    name: "Dumbbell lateral raise",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "dumbbell lateral raise",
    cue: "Lead with elbows, slight lean, no shrugging.",
  },
  {
    id: "dips",
    name: "Dips",
    kind: "weights",
    bodyPart: "upper_body",
    searchQuery: "chest dip proper form",
    cue: "Slight forward lean, shoulders down, full depth you can control.",
  },
  {
    id: "plank",
    name: "Plank",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "forearm plank form",
    cue: "Ribs down, glutes on, neck long.",
  },
  {
    id: "hanging-raise",
    name: "Hanging leg raise",
    kind: "weights",
    bodyPart: "core",
    youtubeId: "Pr1ieGZ5atk",
    searchQuery: "hanging leg raise",
    cue: "Posteriorly tilt the pelvis, don't swing.",
  },
  {
    id: "cable-crunch",
    name: "Cable crunch",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "cable crunch form",
    cue: "Flex the spine, don't pull with the arms.",
  },
  {
    id: "ab-wheel",
    name: "Ab wheel rollout",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "ab wheel rollout form",
    cue: "Hollow body, only go as far as you can brace.",
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "dead bug exercise form",
    cue: "Low back glued to the floor the whole time.",
  },
  {
    id: "pallof",
    name: "Pallof press",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "pallof press exercise",
    cue: "Resist rotation, exhale as you press out.",
  },
  {
    id: "side-plank",
    name: "Side plank",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "side plank form",
    cue: "Hips stacked and high, no sagging.",
  },
  {
    id: "farmers",
    name: "Farmer's carry",
    kind: "weights",
    bodyPart: "core",
    searchQuery: "farmers carry exercise",
    cue: "Tall walk, packed shoulders, even steps.",
  },
  {
    id: "run",
    name: "Easy run",
    kind: "cardio",
    cardioType: "running",
    youtubeId: "brFHyOtTwH4",
    searchQuery: "running form tips",
    cue: "Relaxed shoulders, quick cadence, land under you.",
  },
  {
    id: "intervals",
    name: "Run intervals",
    kind: "cardio",
    cardioType: "running",
    searchQuery: "running interval workout",
    cue: "Even splits, walk or jog the recoveries.",
  },
  {
    id: "cycle",
    name: "Steady cycling",
    kind: "cardio",
    cardioType: "cycling",
    searchQuery: "indoor cycling form",
    cue: "Smooth pedal stroke, quiet upper body.",
  },
  {
    id: "swim",
    name: "Swim laps",
    kind: "cardio",
    cardioType: "swimming",
    searchQuery: "freestyle swimming technique",
    cue: "Long body line, exhale in the water.",
  },
  {
    id: "row",
    name: "Rowing erg",
    kind: "cardio",
    cardioType: "rowing",
    youtubeId: "zQ82RYIFLN8",
    searchQuery: "rowing machine technique",
    cue: "Legs, then hips, then arms — reverse on the way in.",
  },
  {
    id: "walk",
    name: "Zone 2 walk",
    kind: "cardio",
    cardioType: "walking",
    searchQuery: "zone 2 walking workout",
    cue: "Nasal breathing, brisk but conversational.",
  },
  {
    id: "hiit",
    name: "Bodyweight HIIT",
    kind: "cardio",
    cardioType: "hiit",
    searchQuery: "20 minute hiit workout no equipment",
    cue: "Hard efforts, full recoveries, quality over chaos.",
  },
  {
    id: "jump-rope",
    name: "Jump rope",
    kind: "cardio",
    cardioType: "jump_rope",
    searchQuery: "jump rope beginner workout",
    cue: "Soft knees, wrists turn the rope, stay tall.",
  },
  {
    id: "stairs",
    name: "Stair climber",
    kind: "cardio",
    cardioType: "stair_climber",
    searchQuery: "stairmaster workout form",
    cue: "Light hands, full step, upright torso.",
  },
  {
    id: "elliptical",
    name: "Elliptical",
    kind: "cardio",
    cardioType: "elliptical",
    searchQuery: "elliptical machine workout",
    cue: "Push and pull the handles, heel stays down.",
  },
  {
    id: "boxing",
    name: "Heavy bag",
    kind: "cardio",
    cardioType: "boxing",
    searchQuery: "heavy bag boxing workout",
    cue: "Hands up, sit on the punches, move your feet.",
  },
];

export function exercisesForBodyPart(part: BodyPart): CatalogExercise[] {
  return EXERCISE_CATALOG.filter((ex) => ex.kind === "weights" && ex.bodyPart === part);
}

export function exercisesForCardio(type: CardioType): CatalogExercise[] {
  return EXERCISE_CATALOG.filter((ex) => ex.kind === "cardio" && ex.cardioType === type);
}

export function findExercise(name: string): CatalogExercise | undefined {
  const key = name.trim().toLowerCase();
  return EXERCISE_CATALOG.find((ex) => ex.name.toLowerCase() === key || ex.id === key);
}

export function videoUrlForExercise(exercise: Pick<CatalogExercise, "youtubeId" | "searchQuery" | "name">): string {
  if (exercise.youtubeId) return `https://www.youtube.com/watch?v=${exercise.youtubeId}`;
  return youtubeSearchUrl(exercise.searchQuery || exercise.name);
}

export function labelBodyPart(part: BodyPart | null | undefined): string {
  return BODY_PARTS.find((p) => p.id === part)?.label ?? "—";
}

export function labelCardio(type: CardioType | null | undefined): string {
  return CARDIO_TYPES.find((p) => p.id === type)?.label ?? "—";
}
