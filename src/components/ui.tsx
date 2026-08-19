import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-panel/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "gold";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-ember text-white hover:bg-[#c24622]",
    gold: "bg-gold text-ink hover:bg-gold-2",
    ghost: "bg-transparent border border-line text-foam hover:border-gold/50",
    danger: "bg-transparent border border-ember/40 text-ember hover:bg-ember/10",
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
  "w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-foam outline-none focus:border-gold";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={control} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={control} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${control} min-h-24 resize-y`} {...props} />;
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember" role="alert">
      {message}
    </p>
  );
}

export function NoticeBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm">
      <p className="font-semibold text-gold">{title}</p>
      <div className="mt-1 text-mist">{children}</div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <p className="display text-xl text-gold">{title}</p>
      <p className="mt-2 text-sm text-mist">{body}</p>
    </div>
  );
}
