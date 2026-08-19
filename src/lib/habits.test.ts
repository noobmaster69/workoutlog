import { describe, expect, it } from "vitest";
import { completedThisPeriod, currentStreak } from "./habits";
import type { Habit, HabitLog } from "./types";

const weekly: Habit = {
  id: "h2",
  userId: "u1",
  name: "Lift 3x a week",
  cadence: "weekly",
  targetPerPeriod: 3,
  archived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

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

function weeklyLog(date: string): HabitLog {
  return { id: date, habitId: "h2", userId: "u1", loggedOn: date };
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

  it("counts consecutive weeks that met the weekly target", () => {
    const logs = [
      weeklyLog("2026-08-03"), weeklyLog("2026-08-05"), weeklyLog("2026-08-07"),
      weeklyLog("2026-08-10"), weeklyLog("2026-08-12"), weeklyLog("2026-08-14"),
      weeklyLog("2026-08-17"), weeklyLog("2026-08-18"), weeklyLog("2026-08-19"),
    ];
    expect(currentStreak(logs, weekly, "2026-08-19")).toBe(3);
  });

  it("keeps the weekly streak while the current week is still in progress", () => {
    const logs = [
      weeklyLog("2026-08-03"), weeklyLog("2026-08-05"), weeklyLog("2026-08-07"),
      weeklyLog("2026-08-10"), weeklyLog("2026-08-12"), weeklyLog("2026-08-14"),
      weeklyLog("2026-08-17"),
    ];
    expect(currentStreak(logs, weekly, "2026-08-19")).toBe(2);
  });

  it("drops the weekly streak once a full week misses the target", () => {
    const logs = [
      weeklyLog("2026-08-03"), weeklyLog("2026-08-05"), weeklyLog("2026-08-07"),
      weeklyLog("2026-08-10"),
    ];
    expect(currentStreak(logs, weekly, "2026-08-19")).toBe(0);
  });

  it("counts weekly completion within the current week only", () => {
    const logs = [weeklyLog("2026-08-16"), weeklyLog("2026-08-17"), weeklyLog("2026-08-19")];
    expect(completedThisPeriod(logs, weekly, "2026-08-19")).toBe(2);
  });
});
