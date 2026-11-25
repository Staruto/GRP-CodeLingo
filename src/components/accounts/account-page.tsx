import type { ComponentPropsWithoutRef, ReactNode } from "react";

type AccountPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AccountPage({ title, description, children }: AccountPageProps) {
  return (
    <section className="max-w-md space-y-6" aria-labelledby="account-heading">
      <div>
        <h1 id="account-heading" className="page-heading">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

type AccountFieldProps = ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
  hint?: string;
};

export function AccountField({ id, label, hint, ...input }: AccountFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <input
        {...input}
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 block min-h-11 w-full rounded-md border border-slate-500 bg-surface px-3 py-2 disabled:bg-background"
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
