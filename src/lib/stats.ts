import { addDays, startOfWeek, todayISODate } from "./dates";
import type { Workout, WorkoutItem } from "./types";

/**
 * Epley estimate of a one-rep max: weight x (1 + reps / 30).
 *
 * The formula degrades badly past about 12 reps, so high-rep sets are not
 * treated as max attempts at all — counting a set of 30 as a max would hand
 * someone a personal record they cannot actually lift.
 */
export const MAX_REPS_FOR_1RM = 12;

export function estimatedOneRepMax(weightKg: number | null, reps: number | null): number | null {
  if (weightKg == null || reps == null) return null;
  if (weightKg <= 0 || reps <= 0 || reps > MAX_REPS_FOR_1RM) return null;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** Tonnage for one logged exercise: sets x reps x load. */
export function itemVolumeKg(item: Pick<WorkoutItem, "sets" | "reps" | "weightKg">): number {
  const { sets, reps, weightKg } = item;
  if (sets == null || reps == null || weightKg == null) return 0;
  const v = sets * reps * weightKg;
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function workoutVolumeKg(workout: Pick<Workout, "items">): number {
  return workout.items.reduce((total, item) => total + itemVolumeKg(item), 0);
}

export type PersonalRecord = {
  exerciseName: string;
  /** Heaviest load moved for at least one rep. */
  heaviestKg: number;
  repsAtHeaviest: number;
  /** Best estimated 1RM, which can come from a different set than the heaviest. */
  estimatedMaxKg: number | null;
  performedOn: string;
};

/**
 * Best set per exercise, ranked by estimated 1RM so a heavy triple outranks a
 * lighter single. Only weighted work qualifies; cardio has no load to rank.
 */
export function personalRecords(workouts: Workout[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();

  for (const workout of workouts) {
    for (const item of workout.items) {
      if (item.weightKg == null || item.weightKg <= 0 || item.reps == null || item.reps <= 0) continue;

      const candidate: PersonalRecord = {
        exerciseName: item.exerciseName,
        heaviestKg: item.weightKg,
        repsAtHeaviest: item.reps,
        estimatedMaxKg: estimatedOneRepMax(item.weightKg, item.reps),
        performedOn: workout.performedOn,
      };

      const current = best.get(item.exerciseName);
      if (!current) {
        best.set(item.exerciseName, candidate);
        continue;
      }
      // Rank on estimated max, falling back to raw load when a set was too
      // high-rep to estimate from.
      const score = (r: PersonalRecord) => r.estimatedMaxKg ?? r.heaviestKg;
      if (score(candidate) > score(current)) best.set(item.exerciseName, candidate);
    }
  }

  return [...best.values()].sort((a, b) => (b.estimatedMaxKg ?? b.heaviestKg) - (a.estimatedMaxKg ?? a.heaviestKg));
}

export type WeekVolume = { weekStart: string; volumeKg: number; sessions: number };

/** Volume per week, oldest first, including weeks with nothing logged. */
export function weeklyVolume(workouts: Workout[], weeks = 8, today = todayISODate()): WeekVolume[] {
  const [y, m, d] = today.split("-").map(Number);
  const thisWeek = startOfWeek(new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1));

  const buckets: WeekVolume[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    buckets.push({ weekStart: todayISODate(addDays(thisWeek, -7 * i)), volumeKg: 0, sessions: 0 });
  }

  for (const workout of workouts) {
    for (let i = buckets.length - 1; i >= 0; i -= 1) {
      const bucket = buckets[i]!;
      if (workout.performedOn >= bucket.weekStart) {
        const next = buckets[i + 1];
        if (!next || workout.performedOn < next.weekStart) {
          bucket.volumeKg += workoutVolumeKg(workout);
          bucket.sessions += 1;
        }
        break;
      }
    }
  }

  return buckets;
}

/**
 * Percentage change in this week's volume against last week's.
 * Returns null when there is nothing to compare against, rather than a
 * meaningless +100% off a zero baseline.
 */
export function volumeTrend(workouts: Workout[], today = todayISODate()): {
  thisWeekKg: number;
  lastWeekKg: number;
  changePct: number | null;
} {
  const [last, current] = weeklyVolume(workouts, 2, today);
  const thisWeekKg = current?.volumeKg ?? 0;
  const lastWeekKg = last?.volumeKg ?? 0;
  return {
    thisWeekKg,
    lastWeekKg,
    changePct: lastWeekKg > 0 ? Math.round(((thisWeekKg - lastWeekKg) / lastWeekKg) * 100) : null,
  };
}
