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
    <div className="min-h-screen" style={{ color: "var(--foreground)" }}>
      {/* ── Top Nav ── */}
      <nav
        style={{
          background: "rgba(7, 7, 16, 0.8)",
          borderBottom: "1px solid var(--line)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "0.875rem",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 20px rgba(99,102,241,0.45), 0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: "2px" }}>Meeting Intelligence Hub</p>
              <p
                style={{
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--foreground)",
                  letterSpacing: "-0.01em",
                }}
              >
                Executive Review Suite
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active ? "nav-active" : ""
                  }`}
                  style={
                    active
                      ? {}
                      : {
                          background: "var(--surface-strong)",
                          border: "1px solid var(--line)",
                          color: "var(--muted)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-soft-line)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-strong)";
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="hero-panel overflow-hidden rounded-[2rem] px-7 py-10 sm:px-10 lg:px-14">
          <div className="relative z-10 max-w-3xl">
            <p className="section-title">{eyebrow}</p>
            <h1
              className="mt-4 text-4xl leading-tight sm:text-5xl"
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 800,
                color: "var(--foreground)",
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h1>
            <div className="accent-rule mt-6 w-32" />
            <p className="mt-5 max-w-2xl text-base leading-7 ink-muted">{description}</p>
          </div>
        </section>

        {/* Page Content */}
        <section className="mt-8">{children}</section>
      </main>
    </div>
  );
}
