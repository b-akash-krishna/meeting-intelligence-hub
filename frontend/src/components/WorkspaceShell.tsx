"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CheckSquare, Compass, Download, Target, TrendingUp } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: Compass },
  { href: "/actions", label: "Actions", icon: CheckSquare },
  { href: "/decisions", label: "Decisions", icon: Target },
  { href: "/sentiment", label: "Sentiment", icon: TrendingUp },
  { href: "/exports", label: "Exports", icon: Download },
];

interface WorkspaceShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function WorkspaceShell({
  eyebrow,
  title,
  description,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-slate-900">
      <nav className="border-b border-[color:var(--line)] bg-[color:var(--surface)]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] shadow-sm">
              <Activity className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <div>
              <p className="section-title">Meeting Intelligence Hub</p>
              <p className="text-xl font-semibold tracking-[0.02em] text-slate-900">Executive Review Suite</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-lg shadow-[color:var(--shadow-accent)]"
                      : "border-[color:var(--line)] bg-[color:var(--surface-strong)] text-slate-700 hover:border-[color:var(--accent-soft-line)] hover:text-[color:var(--accent)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <section className="hero-panel overflow-hidden rounded-[2rem] px-7 py-8 sm:px-9 lg:px-12">
          <div className="max-w-3xl">
            <p className="section-title">{eyebrow}</p>
            <h1 className="mt-4 text-4xl leading-tight font-semibold text-slate-950 sm:text-5xl">{title}</h1>
            <div className="accent-rule mt-6 w-28" />
            <p className="mt-6 max-w-2xl text-base leading-7 ink-muted">{description}</p>
          </div>
        </section>

        <section className="mt-8">{children}</section>
      </main>
    </div>
  );
}
