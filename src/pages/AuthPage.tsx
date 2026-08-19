import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button, Card, ErrorBanner, Field, Input, NoticeBanner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { user, loading, signIn, signUp, mode } = useAuth();
  const [params] = useSearchParams();
  const [isSignup, setIsSignup] = useState(params.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const subtitle = useMemo(
    () =>
      mode === "supabase"
        ? "Accounts are stored in your Supabase project."
        : "Running without a database.",
    [mode],
  );

  if (!loading && user) return <Navigate to="/app" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (isSignup) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const result = await signUp(email, password, displayName);
        if (result.needsEmailConfirm) {
          setNotice("Check your email to confirm the account, then sign in.");
          setIsSignup(false);
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not authenticate.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <Link to="/" className="display text-2xl text-gold">
          IronLog
        </Link>
        <h1 className="mt-4 text-3xl">{isSignup ? "Create account" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-mist">{subtitle}</p>
        {mode === "local" && (
          <div className="mt-4">
            <NoticeBanner title="Demo mode — this browser only">
              Supabase is not configured, so accounts are saved in this browser's storage.
              An account created here will not exist on another device, browser, or private
              window, and clearing site data deletes it.
            </NoticeBanner>
          </div>
        )}
        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          {isSignup && (
            <Field label="Display name">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </Field>
          )}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Field>
          <ErrorBanner message={error} />
          {notice && <p className="rounded-xl border border-moss/40 bg-moss/10 px-3 py-2 text-sm text-moss">{notice}</p>}
          <Button type="submit" disabled={busy}>
            {busy ? "Working…" : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-gold"
          onClick={() => {
            setIsSignup((v) => !v);
            setError(null);
            setNotice(null);
          }}
        >
          {isSignup ? "Already training here? Sign in" : "New here? Create an account"}
        </button>
      </Card>
    </div>
  );
}
