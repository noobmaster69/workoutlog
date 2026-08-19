import { createId, todayISODate } from "./dates";
import { findExercise, videoUrlForExercise } from "./exercises";
import {
  getLocalSession,
  hashPassword,
  listLocalUsers,
  newLocalUser,
  readLocalData,
  saveLocalUsers,
  setLocalSession,
  writeLocalData,
  type LocalData,
} from "./localStore";
import { isSupabaseConfigured, supabase } from "./supabase";
import type {
  AuthUser,
  Goal,
  GoalCategory,
  Habit,
  HabitCadence,
  HabitLog,
  Workout,
  WorkoutDraftItem,
  WorkoutItem,
  WorkoutKind,
} from "./types";

function fail(error: { message?: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

type WorkoutRow = {
  id: string;
  user_id: string;
  kind: WorkoutKind;
  title: string;
  performed_on: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  workout_items?: WorkoutItemRow[] | null;
};

type WorkoutItemRow = {
  id: string;
  workout_id: string;
  exercise_name: string;
  body_part: WorkoutItem["bodyPart"];
  cardio_type: WorkoutItem["cardioType"];
  youtube_url: string | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  calories: number | null;
  intensity: string | null;
  sort_order: number;
};

type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  category: Goal["category"];
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  status: Goal["status"];
  created_at: string;
};

type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  cadence: Habit["cadence"];
  target_per_period: number;
  archived: boolean;
  created_at: string;
};

type HabitLogRow = {
  id: string;
  habit_id: string;
  user_id: string;
  logged_on: string;
};

function mapItem(row: WorkoutItemRow): WorkoutItem {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseName: row.exercise_name,
    bodyPart: row.body_part,
    cardioType: row.cardio_type,
    youtubeUrl: row.youtube_url ?? "",
    sets: num(row.sets),
    reps: num(row.reps),
    weightKg: num(row.weight_kg),
    distanceKm: num(row.distance_km),
    durationMinutes: num(row.duration_minutes),
    calories: num(row.calories),
    intensity: row.intensity,
    sortOrder: row.sort_order,
  };
}

function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    performedOn: row.performed_on,
    durationMinutes: num(row.duration_minutes),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    items: (row.workout_items ?? []).map(mapItem).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    targetValue: Number(row.target_value),
    currentValue: Number(row.current_value),
    unit: row.unit,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    cadence: row.cadence,
    targetPerPeriod: row.target_per_period,
    archived: row.archived,
    createdAt: row.created_at,
  };
}

function mapHabitLog(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    loggedOn: row.logged_on,
  };
}

function asWorkouts(data: LocalData): Workout[] {
  return (data.workouts as Workout[]) ?? [];
}
function asGoals(data: LocalData): Goal[] {
  return (data.goals as Goal[]) ?? [];
}
function asHabits(data: LocalData): Habit[] {
  return (data.habits as Habit[]) ?? [];
}
function asLogs(data: LocalData): HabitLog[] {
  return (data.habitLogs as HabitLog[]) ?? [];
}

export function defaultYoutubeUrl(exerciseName: string): string {
  const found = findExercise(exerciseName);
  if (found) return videoUrlForExercise(found);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} proper form`)}`;
}

export const api = {
  async currentLocalUser(): Promise<AuthUser | null> {
    const id = getLocalSession();
    if (!id) return null;
    const user = listLocalUsers().find((u) => u.id === id);
    return user ? { id: user.id, email: user.email, displayName: user.displayName } : null;
  },

  async signUpLocal(email: string, password: string, displayName: string): Promise<AuthUser> {
    const users = listLocalUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      throw new Error("An account with that email already exists.");
    }
    const user = newLocalUser(normalized, displayName, await hashPassword(password));
    saveLocalUsers([...users, user]);
    setLocalSession(user.id);
    return { id: user.id, email: user.email, displayName: user.displayName };
  },

  async signInLocal(email: string, password: string): Promise<AuthUser> {
    const users = listLocalUsers();
    const user = users.find((u) => u.email === email.trim().toLowerCase());
    // Demo accounts live in this browser's storage, so "not found" nearly always
    // means the account was created somewhere else rather than mistyped.
    if (!user) {
      throw new Error(
        users.length === 0
          ? "No account exists in this browser yet. Demo mode keeps accounts on the device that created them, so an account made elsewhere will not work here. Create one below."
          : "No account with that email in this browser. Demo mode keeps accounts on the device that created them.",
      );
    }
    if (user.passwordHash !== (await hashPassword(password))) {
      throw new Error("Invalid email or password.");
    }
    setLocalSession(user.id);
    return { id: user.id, email: user.email, displayName: user.displayName };
  },

  signOutLocal() {
    setLocalSession(null);
  },

  async listWorkouts(userId: string): Promise<Workout[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("workouts")
        .select("*, workout_items(*)")
        .eq("user_id", userId)
        .order("performed_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) fail(error, "Could not load workouts.");
      return ((data ?? []) as WorkoutRow[]).map(mapWorkout);
    }
    return asWorkouts(readLocalData())
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.performedOn.localeCompare(a.performedOn) || b.createdAt.localeCompare(a.createdAt));
  },

  async createWorkout(input: {
    userId: string;
    kind: WorkoutKind;
    title: string;
    performedOn: string;
    durationMinutes: number | null;
    notes: string;
    items: WorkoutDraftItem[];
  }): Promise<Workout> {
    const items = input.items.map((item, index) => ({
      ...item,
      youtubeUrl: item.youtubeUrl.trim() || defaultYoutubeUrl(item.exerciseName),
      sortOrder: index,
    }));

    if (supabase) {
      const { data: workout, error } = await supabase
        .from("workouts")
        .insert({
          user_id: input.userId,
          kind: input.kind,
          title: input.title,
          performed_on: input.performedOn,
          duration_minutes: input.durationMinutes,
          notes: input.notes,
        })
        .select()
        .single();
      if (error || !workout) fail(error, "Could not save workout.");
      const payload = items.map((item) => ({
        workout_id: workout.id,
        exercise_name: item.exerciseName,
        body_part: item.bodyPart,
        cardio_type: item.cardioType,
        youtube_url: item.youtubeUrl,
        sets: item.sets,
        reps: item.reps,
        weight_kg: item.weightKg,
        distance_km: item.distanceKm,
        duration_minutes: item.durationMinutes,
        calories: item.calories,
        intensity: item.intensity,
        sort_order: item.sortOrder,
      }));
      const { data: rows, error: itemError } = await supabase.from("workout_items").insert(payload).select();
      if (itemError) fail(itemError, "Workout saved, but exercises failed to save.");
      return mapWorkout({ ...(workout as WorkoutRow), workout_items: (rows ?? []) as WorkoutItemRow[] });
    }

    const workout: Workout = {
      id: createId(),
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      performedOn: input.performedOn,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        ...item,
        id: createId(),
        workoutId: "pending",
      })),
    };
    workout.items = workout.items.map((item) => ({ ...item, workoutId: workout.id }));
    const data = readLocalData();
    data.workouts = [workout, ...asWorkouts(data)];
    writeLocalData(data);
    return workout;
  },

  async deleteWorkout(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) fail(error, "Could not delete workout.");
      return;
    }
    const data = readLocalData();
    data.workouts = asWorkouts(data).filter((w) => w.id !== id);
    writeLocalData(data);
  },

  async listGoals(userId: string): Promise<Goal[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) fail(error, "Could not load goals.");
      return ((data ?? []) as GoalRow[]).map(mapGoal);
    }
    return asGoals(readLocalData()).filter((g) => g.userId === userId);
  },

  async createGoal(input: {
    userId: string;
    title: string;
    category: GoalCategory;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline: string | null;
  }): Promise<Goal> {
    if (supabase) {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: input.userId,
          title: input.title,
          category: input.category,
          target_value: input.targetValue,
          current_value: input.currentValue,
          unit: input.unit,
          deadline: input.deadline,
        })
        .select()
        .single();
      if (error || !data) fail(error, "Could not create goal.");
      return mapGoal(data as GoalRow);
    }
    const goal: Goal = {
      id: createId(),
      userId: input.userId,
      title: input.title,
      category: input.category,
      targetValue: input.targetValue,
      currentValue: input.currentValue,
      unit: input.unit,
      deadline: input.deadline,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const data = readLocalData();
    data.goals = [goal, ...asGoals(data)];
    writeLocalData(data);
    return goal;
  },

  async updateGoal(id: string, patch: Partial<Pick<Goal, "currentValue" | "status" | "title">>): Promise<Goal> {
    if (supabase) {
      const payload: Record<string, unknown> = {};
      if (patch.currentValue !== undefined) payload.current_value = patch.currentValue;
      if (patch.status !== undefined) payload.status = patch.status;
      if (patch.title !== undefined) payload.title = patch.title;
      const { data, error } = await supabase.from("goals").update(payload).eq("id", id).select().single();
      if (error || !data) fail(error, "Could not update goal.");
      return mapGoal(data as GoalRow);
    }
    const data = readLocalData();
    const goals = asGoals(data);
    const next = goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
    data.goals = next;
    writeLocalData(data);
    const found = next.find((g) => g.id === id);
    if (!found) throw new Error("Goal not found.");
    return found;
  },

  async deleteGoal(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) fail(error, "Could not delete goal.");
      return;
    }
    const data = readLocalData();
    data.goals = asGoals(data).filter((g) => g.id !== id);
    writeLocalData(data);
  },

  async listHabits(userId: string): Promise<Habit[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", false)
        .order("created_at", { ascending: true });
      if (error) fail(error, "Could not load habits.");
      return ((data ?? []) as HabitRow[]).map(mapHabit);
    }
    return asHabits(readLocalData()).filter((h) => h.userId === userId && !h.archived);
  },

  async listHabitLogs(userId: string): Promise<HabitLog[]> {
    if (supabase) {
      const { data, error } = await supabase.from("habit_logs").select("*").eq("user_id", userId);
      if (error) fail(error, "Could not load habit logs.");
      return ((data ?? []) as HabitLogRow[]).map(mapHabitLog);
    }
    return asLogs(readLocalData()).filter((l) => l.userId === userId);
  },

  async createHabit(input: {
    userId: string;
    name: string;
    cadence: HabitCadence;
    targetPerPeriod: number;
  }): Promise<Habit> {
    if (supabase) {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: input.userId,
          name: input.name,
          cadence: input.cadence,
          target_per_period: input.targetPerPeriod,
        })
        .select()
        .single();
      if (error || !data) fail(error, "Could not create habit.");
      return mapHabit(data as HabitRow);
    }
    const habit: Habit = {
      id: createId(),
      userId: input.userId,
      name: input.name,
      cadence: input.cadence,
      targetPerPeriod: input.targetPerPeriod,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    const data = readLocalData();
    data.habits = [...asHabits(data), habit];
    writeLocalData(data);
    return habit;
  },

  async toggleHabitLog(userId: string, habitId: string, date = todayISODate()): Promise<boolean> {
    if (supabase) {
      const { data: existing, error: readError } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("habit_id", habitId)
        .eq("logged_on", date)
        .maybeSingle();
      if (readError) fail(readError, "Could not update habit.");
      if (existing) {
        const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
        if (error) fail(error, "Could not undo habit.");
        return false;
      }
      const { error } = await supabase.from("habit_logs").insert({
        habit_id: habitId,
        user_id: userId,
        logged_on: date,
      });
      if (error) fail(error, "Could not check in habit.");
      return true;
    }

    const data = readLocalData();
    const logs = asLogs(data);
    const found = logs.find((l) => l.habitId === habitId && l.loggedOn === date);
    if (found) {
      data.habitLogs = logs.filter((l) => l.id !== found.id);
      writeLocalData(data);
      return false;
    }
    data.habitLogs = [
      ...logs,
      { id: createId(), habitId, userId, loggedOn: date },
    ];
    writeLocalData(data);
    return true;
  },

  async archiveHabit(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("habits").update({ archived: true }).eq("id", id);
      if (error) fail(error, "Could not archive habit.");
      return;
    }
    const data = readLocalData();
    data.habits = asHabits(data).map((h) => (h.id === id ? { ...h, archived: true } : h));
    writeLocalData(data);
  },
};

export { isSupabaseConfigured };
