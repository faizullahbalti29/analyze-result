"use client";

import { GraduationCap } from "lucide-react";

export function Header() {
  return (
    <header className="relative overflow-hidden border-b border-teal-900/10 bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_35%)]" />
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">
          <GraduationCap
            className="h-6 w-6 text-emerald-200 sm:h-7 sm:w-7"
            strokeWidth={1.75}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200/80 sm:text-xs sm:tracking-[0.2em]">
            Federal Board · Islamabad
          </p>
          <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            FBISE Result Analyzer
          </h1>
          <p className="mt-0.5 hidden text-sm text-teal-100/70 sm:mt-1 sm:block sm:max-w-2xl">
            Analyze matriculation results by class and institution — pass rates,
            status breakdown, and top performers at a glance.
          </p>
        </div>
      </div>
    </header>
  );
}
