"use client";

import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function EmptySegmentState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[1.75rem] p-12 text-center flex flex-col items-center"
      style={{
        background: "var(--surface)",
        border: "1px dashed var(--line-strong)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl mb-5"
        style={{
          width: "4rem",
          height: "4rem",
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <Upload className="h-7 w-7" style={{ color: "var(--accent)" }} />
      </div>

      <p className="section-title mb-3">No Meeting Loaded</p>
      <h2
        className="text-2xl mb-3"
        style={{
          fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        {title}
      </h2>
      <p className="mx-auto max-w-xl text-sm leading-6 ink-muted mb-8">{description}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Return to overview
      </Link>
    </div>
  );
}
