export type WorkoutKind = "weights" | "cardio";
export type BodyPart = "legs" | "upper_body" | "core";
export type GoalCategory = "weights" | "cardio" | "habit" | "general";
export type GoalStatus = "active" | "completed" | "abandoned";
export type HabitCadence = "daily" | "weekly";

export type CardioType =
  | "running"
  | "cycling"
  | "swimming"
  | "rowing"
  | "walking"
  | "hiit"
  | "jump_rope"
  | "stair_climber"
  | "elliptical"
  | "boxing"
  | "other";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type WorkoutItem = {
  id: string;
  workoutId: string;
  exerciseName: string;
  bodyPart: BodyPart | null;
  cardioType: CardioType | null;
  youtubeUrl: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  calories: number | null;
  intensity: string | null;
  sortOrder: number;
};

export type Workout = {
  id: string;
  userId: string;
  kind: WorkoutKind;
  title: string;
  performedOn: string;
  durationMinutes: number | null;
  notes: string;
  createdAt: string;
  items: WorkoutItem[];
};

export type WorkoutDraftItem = Omit<WorkoutItem, "id" | "workoutId">;

export type Goal = {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  status: GoalStatus;
  createdAt: string;
};

export type Habit = {
  id: string;
  userId: string;
  name: string;
  cadence: HabitCadence;
  targetPerPeriod: number;
  archived: boolean;
  createdAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  userId: string;
  loggedOn: string;
};

export type CatalogExercise = {
  id: string;
  name: string;
  kind: WorkoutKind;
  bodyPart?: BodyPart;
  cardioType?: CardioType;
  youtubeId?: string;
  searchQuery: string;
  cue: string;
};
