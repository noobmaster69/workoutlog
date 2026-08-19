import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { workouts, goals, habits, habitLogs, loading, error, reload };
}
