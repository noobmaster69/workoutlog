import { describe, expect, it } from "vitest";
import { completedThisPeriod, currentStreak } from "./habits";
import type { Habit, HabitLog } from "./types";

const habit: Habit = {
  id: "h1",
  userId: "u1",
  name: "Train",
  cadence: "daily",
  targetPerPeriod: 1,
  archived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function log(date: string): HabitLog {
  return { id: date, habitId: "h1", userId: "u1", loggedOn: date };
}

describe("habit tracking", () => {
  it("counts a consecutive daily streak including today", () => {
    const logs = [log("2026-08-17"), log("2026-08-18"), log("2026-08-19")];
    expect(currentStreak(logs, habit, "2026-08-19")).toBe(3);
  });

  it("keeps yesterday's streak if today is not checked yet", () => {
    const logs = [log("2026-08-17"), log("2026-08-18")];
    expect(currentStreak(logs, habit, "2026-08-19")).toBe(2);
  });

  it("reports daily completion for today only", () => {
    expect(completedThisPeriod([log("2026-08-19")], habit, "2026-08-19")).toBe(1);
    expect(completedThisPeriod([log("2026-08-18")], habit, "2026-08-19")).toBe(0);
  });
});
