import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { describeError, isClockSkewError } from "../lib/errors";
import type { Goal, Habit, HabitLog, Workout } from "../lib/types";
import { useAuth } from "../context/AuthContext";

export function useAppData() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setGoals([]);
      setHabits([]);
      setHabitLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // A clock-skew rejection is Supabase disagreeing with itself by a few
      // seconds, so a short wait usually resolves it. Nothing else is retried:
      // a real failure should surface immediately.
      const delays = [1200, 3500];
      for (let attempt = 0; ; attempt += 1) {
        try {
          const [nextWorkouts, nextGoals, nextHabits, nextLogs] = await Promise.all([
            api.listWorkouts(user.id),
            api.listGoals(user.id),
            api.listHabits(user.id),
            api.listHabitLogs(user.id),
          ]);
          setWorkouts(nextWorkouts);
          setGoals(nextGoals);
          setHabits(nextHabits);
          setHabitLogs(nextLogs);
          return;
        } catch (err) {
          const wait = delays[attempt];
          if (wait === undefined || !isClockSkewError(err)) throw err;
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { workouts, goals, habits, habitLogs, loading, error, reload };
}
