import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-panel/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "accent";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-cta text-ink hover:bg-cta-2",
    accent: "bg-accent text-ink hover:bg-accent-2",
    ghost: "bg-transparent border border-line text-foam hover:border-accent/50",
    danger: "bg-transparent border border-danger/40 text-danger hover:bg-danger/10",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-mist">{label}</span>
      {children}
    </label>
  );
}

const control =
  // text-base (16px) is deliberate: iOS Safari auto-zooms any focused control under 16px.
  "w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-base text-foam outline-none focus:border-accent";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${control} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${control} min-h-24 resize-y ${className}`} {...props} />;
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export function NoticeBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2.5 text-sm">
      <p className="font-semibold text-accent">{title}</p>
      <div className="mt-1 text-mist">{children}</div>
    </div>
  );
}

/**
 * A compact labelled <select>. Used wherever a wall of option buttons used to be:
 * one line of chrome instead of a grid that pushed the real content off-screen.
 */
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`grid gap-1 ${className}`}>
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-xl border border-line bg-ink-2 bg-[length:10px] px-3 py-2.5 text-base text-foam outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Collapsed by default. The library and the log form previously rendered a
 * YouTube iframe for every single row at once; behind a disclosure the same
 * content costs one line until it is asked for.
 */
export function Disclosure({
  summary,
  meta,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left min-h-11 hover:bg-ink-2/60"
      >
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block truncate text-sm font-semibold text-foam">{summary}</span>
          {meta && <span className="mt-0.5 block truncate text-xs text-mist">{meta}</span>}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-mist transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-line px-4 py-4">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <p className="display text-xl text-accent">{title}</p>
      <p className="mt-2 text-sm text-mist">{body}</p>
    </div>
  );
}
