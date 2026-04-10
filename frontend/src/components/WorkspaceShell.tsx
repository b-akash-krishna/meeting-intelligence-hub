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
  children: React.ReactNode;
}

export default function WorkspaceShell({ eyebrow, title, children }: WorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ color: "var(--foreground)" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          background: "rgba(245, 233, 216, 0.9)",
          borderBottom: "1px solid var(--line)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: "2.2rem",
                height: "2.2rem",
                borderRadius: "0.6rem",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px var(--accent-glow)",
              }}
            >
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--foreground)",
                letterSpacing: "-0.01em",
              }}
            >
              Meeting Hub
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${active ? "nav-active" : ""}`}
                  style={
                    active
                      ? {}
                      : {
                          color: "var(--muted)",
                          border: "1px solid transparent",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(62,44,35,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Page ── */}
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-6 lg:px-8">
        {/* Compact Hero */}
        <div className="mb-6">
          <p className="section-title mb-1.5">{eyebrow}</p>
          <h1
            style={{
              fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <div className="accent-rule mt-3 w-20" />
        </div>

        {children}
      </main>
    </div>
  );
}
