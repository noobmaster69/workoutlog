/** An error from the Data API, keeping PostgREST's code so callers can branch on it. */
export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/**
 * PGRST303 "JWT issued at future".
 *
 * Supabase signs the session token on its Auth node and validates it on its
 * PostgREST node. When those two clocks drift apart by a few seconds, PostgREST
 * sees an `iat` in its own future and rejects a token that is perfectly valid.
 * Both machines belong to Supabase — nothing the app or the device can do about
 * it — but it is transient, so it is worth retrying rather than surfacing.
 */
export function isClockSkewError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  const message = err instanceof Error ? err.message : String(err ?? "");
  return code === "PGRST303" || /jwt issued at future/i.test(message);
}

/** Turns an error into something worth showing a person. */
export function describeError(err: unknown): string {
  if (isClockSkewError(err)) {
    return "Supabase briefly rejected the session because its own auth and database clocks disagree. This clears by itself, usually within a minute — try again shortly. If it keeps happening, ask Supabase support to resync the project's clock.";
  }
  const message = err instanceof Error ? err.message : "";
  return message || "Something went wrong.";
}
