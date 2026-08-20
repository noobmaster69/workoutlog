import { Link } from "react-router-dom";
import { Dumbbell, Flame, HeartPulse, Target, Video } from "lucide-react";
import { Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Dumbbell,
    title: "Weights by body part",
    body: "Log legs, upper body, and core with sets, reps, and load.",
  },
  {
    icon: HeartPulse,
    title: "Cardio, typed",
    body: "Running, cycling, rowing, HIIT, and more — with distance and time.",
  },
  {
    icon: Video,
    title: "A video for every lift",
    body: "Each exercise ships with a YouTube form video, or paste your own link.",
  },
  {
    icon: Target,
    title: "Goals that move",
    body: "Set a squat target, a 5K time, or a weekly session count and track it.",
  },
  {
    icon: Flame,
    title: "Habit streaks",
    body: "Daily and weekly habits with check-ins so training sticks.",
  },
];

export function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="grid-noise min-h-dvh">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <span className="display text-xl text-gold sm:text-2xl">IronLog</span>
        <div className="flex gap-3">
          {user ? (
            <Link to="/app">
              <Button variant="gold">Open log</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/login?mode=signup">
                <Button variant="gold">Create account</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10">
        <p className="text-sm uppercase tracking-[0.25em] text-ember">Train. Track. Repeat.</p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-none text-foam sm:text-5xl md:text-7xl">
          Two kinds of work.
          <span className="block text-gold">One honest log.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-mist sm:mt-6 sm:text-lg">
          IronLog splits training into weights and cardio, files every lift by body part,
          attaches a YouTube video, and keeps your goals and habits in the same place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={user ? "/app/log" : "/login?mode=signup"}>
            <Button variant="primary" className="px-6 py-3">
              Start logging
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="px-6 py-3">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:px-6 sm:pb-24 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-line bg-panel/70 p-5">
            <feature.icon className="text-gold" />
            <h2 className="mt-4 text-2xl text-foam">{feature.title}</h2>
            <p className="mt-2 text-sm text-mist">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
