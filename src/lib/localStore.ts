import type { AuthUser } from "./types";
import { createId } from "./dates";

const USERS_KEY = "ironlog.users";
const SESSION_KEY = "ironlog.session";
const DATA_KEY = "ironlog.data";

export type LocalUser = AuthUser & { passwordHash: string };

export type LocalData = {
  workouts: unknown[];
  goals: unknown[];
  habits: unknown[];
  habitLogs: unknown[];
};

const emptyData = (): LocalData => ({
  workouts: [],
  goals: [],
  habits: [],
  habitLogs: [],
});

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function listLocalUsers(): LocalUser[] {
  return readJson<LocalUser[]>(USERS_KEY, []);
}

export function saveLocalUsers(users: LocalUser[]) {
  writeJson(USERS_KEY, users);
}

export function getLocalSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setLocalSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export function readLocalData(): LocalData {
  return { ...emptyData(), ...readJson<Partial<LocalData>>(DATA_KEY, {}) };
}

export function writeLocalData(data: LocalData) {
  writeJson(DATA_KEY, data);
}

export function newLocalUser(email: string, displayName: string, passwordHash: string): LocalUser {
  return {
    id: createId(),
    email: email.trim().toLowerCase(),
    displayName: displayName.trim() || email.split("@")[0] || "Athlete",
    passwordHash,
  };
}
