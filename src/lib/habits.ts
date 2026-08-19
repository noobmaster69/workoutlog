import type { Habit, HabitLog } from "./types";
import { addDays, startOfWeek, todayISODate } from "./dates";

export function logsForHabit(logs: HabitLog[], habitId: string): HabitLog[] {
  return logs.filter((log) => log.habitId === habitId);
}

export function isLoggedOn(logs: HabitLog[], habitId: string, date: string): boolean {
  return logs.some((log) => log.habitId === habitId && log.loggedOn === date);
}

export function currentStreak(logs: HabitLog[], habit: Habit, today = todayISODate()): number {
  const dates = new Set(logsForHabit(logs, habit.id).map((log) => log.loggedOn));
  if (habit.cadence === "weekly") {
    let streak = 0;
    let cursor = startOfWeek(parseISODate(today));
    while (countInWeek(dates, cursor) >= habit.targetPerPeriod) {
      streak += 1;
      cursor = addDays(cursor, -7);
    }
    return streak;
  }

  let streak = 0;
  let cursor = parseISODate(today);
  if (!dates.has(todayISODate(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (dates.has(todayISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function completedThisPeriod(logs: HabitLog[], habit: Habit, today = todayISODate()): number {
  const dates = logsForHabit(logs, habit.id).map((log) => log.loggedOn);
  if (habit.cadence === "weekly") {
    const weekStart = todayISODate(startOfWeek(parseISODate(today)));
    return dates.filter((d) => d >= weekStart && d <= today).length;
  }
  return dates.includes(today) ? 1 : 0;
}

export function lastNDays(n: number, today = todayISODate()): string[] {
  const end = parseISODate(today);
  return Array.from({ length: n }, (_, i) => todayISODate(addDays(end, i - (n - 1))));
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function countInWeek(dates: Set<string>, weekStart: Date): number {
  let count = 0;
  for (let i = 0; i < 7; i += 1) {
    if (dates.has(todayISODate(addDays(weekStart, i)))) count += 1;
  }
  return count;
}
