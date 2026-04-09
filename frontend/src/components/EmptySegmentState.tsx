"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EmptySegmentState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="panel rounded-[1.75rem] p-8 text-center">
      <p className="section-title">No Meeting Loaded</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 ink-muted">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to overview
      </Link>
    </div>
  );
}
