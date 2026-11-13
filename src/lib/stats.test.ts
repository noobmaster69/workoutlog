import { describe, expect, it } from "vitest";
import { estimatedOneRepMax, personalRecords, volumeTrend, weeklyVolume, workoutVolumeKg } from "./stats";
import type { Workout, WorkoutItem } from "./types";

function item(name: string, o: Partial<WorkoutItem> = {}): WorkoutItem {
  return {
    id: name, workoutId: "w", exerciseName: name, bodyPart: "legs", cardioType: null,
    youtubeUrl: "", sets: null, reps: null, weightKg: null, distanceKm: null,
    durationMinutes: null, calories: null, intensity: null, sortOrder: 0, ...o,
  };
}
function workout(date: string, items: WorkoutItem[]): Workout {
  return { id: date, userId: "u1", kind: "weights", title: "Session", performedOn: date,
           durationMinutes: 60, notes: "", createdAt: `${date}T10:00:00.000Z`, items };
}

describe("one-rep max", () => {
  it("uses Epley", () => {
    expect(estimatedOneRepMax(100, 5)).toBe(116.7);
    expect(estimatedOneRepMax(100, 1)).toBe(103.3);
  });

  it("refuses rep ranges the formula cannot model", () => {
    // A set of 30 is endurance work, not a max attempt.
    expect(estimatedOneRepMax(60, 30)).toBeNull();
    expect(estimatedOneRepMax(0, 5)).toBeNull();
    expect(estimatedOneRepMax(null, 5)).toBeNull();
  });
});

describe("volume", () => {
  it("multiplies sets x reps x load", () => {
    expect(workoutVolumeKg(workout("2026-11-10", [item("Squat", { sets: 5, reps: 5, weightKg: 100 })]))).toBe(2500);
  });

  it("ignores bodyweight and cardio entries rather than counting them as zero-weight lifts", () => {
    expect(workoutVolumeKg(workout("2026-11-10", [item("Plank", { sets: 3, reps: 1 })]))).toBe(0);
  });
});

describe("personal records", () => {
  it("ranks a heavy triple above a lighter single", () => {
    const w = [
      workout("2026-11-02", [item("Squat", { sets: 1, reps: 1, weightKg: 120 })]),   // est 124
      workout("2026-11-09", [item("Squat", { sets: 1, reps: 3, weightKg: 120 })]),   // est 132
    ];
    const [pr] = personalRecords(w);
    expect(pr!.estimatedMaxKg).toBe(132);
    expect(pr!.performedOn).toBe("2026-11-09");
  });

  it("skips exercises with no load", () => {
    expect(personalRecords([workout("2026-11-09", [item("Run", { durationMinutes: 30 })])])).toHaveLength(0);
  });
});

describe("weekly volume", () => {
  it("buckets by week and reports the trend", () => {
    const w = [
      workout("2026-11-03", [item("Squat", { sets: 5, reps: 5, weightKg: 100 })]), // prev week: 2500
      workout("2026-11-10", [item("Squat", { sets: 5, reps: 5, weightKg: 120 })]), // this week: 3000
    ];
    const weeks = weeklyVolume(w, 2, "2026-11-13");
    expect(weeks.map((x) => x.volumeKg)).toEqual([2500, 3000]);

    const trend = volumeTrend(w, "2026-11-13");
    expect(trend.thisWeekKg).toBe(3000);
    expect(trend.changePct).toBe(20);
  });

  it("reports no trend instead of +100% off a zero baseline", () => {
    const w = [workout("2026-11-10", [item("Squat", { sets: 5, reps: 5, weightKg: 100 })])];
    expect(volumeTrend(w, "2026-11-13").changePct).toBeNull();
  });
});
