"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EmptySegmentState({ title, description }: { title: string; description: string }) {
  return (
    <div className="panel rounded-2xl p-10 text-center flex flex-col items-center">
      <p className="section-title mb-2">No Data</p>
      <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>{title}</h2>
      <p className="text-sm ink-muted mb-5 max-w-sm">{description}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ background: "var(--accent)", boxShadow: "0 2px 8px var(--accent-glow)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to overview
      </Link>
    </div>
  );
}
