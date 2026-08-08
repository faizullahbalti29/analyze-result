"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, getPassRate } from "@/lib/utils";
import type { ResultStats } from "@/lib/types";

interface StatsCardsProps {
  stats: ResultStats;
  loading?: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  description: string;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const passRate = getPassRate(stats);

  const cards: StatCard[] = [
    {
      label: "Total Students",
      value: stats.total,
      icon: Users,
      accent: "text-teal-700",
      iconBg: "bg-teal-500/10 text-teal-600",
      description: "Enrolled in selected institution",
    },
    {
      label: "Passed",
      value: stats.pass,
      icon: CheckCircle2,
      accent: "text-emerald-700",
      iconBg: "bg-emerald-500/10 text-emerald-600",
      description: `${passRate}% pass rate`,
    },
    {
      label: "Compartment",
      value: stats.compartment,
      icon: AlertCircle,
      accent: "text-amber-700",
      iconBg: "bg-amber-500/10 text-amber-600",
      description: "Students with COMPT. status",
    },
    {
      label: "Absent",
      value: stats.absent,
      icon: XCircle,
      accent: "text-slate-700",
      iconBg: "bg-slate-500/10 text-slate-600",
      description: "Did not appear for exam",
    },
    {
      label: "Other Status",
      value: stats.other,
      icon: Clock,
      accent: "text-violet-700",
      iconBg: "bg-violet-500/10 text-violet-600",
      description: "RW, RL, UFM & others",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Result Overview
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Summary statistics for the selected institution
          </p>
        </div>
        {/* <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 sm:px-4 sm:py-2 sm:text-sm">
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {passRate}% Pass Rate
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {loading
          ? Array.from({ length: cards.length }, (_, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5"
              >
                <div className="relative">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl" />
                  <p className="text-xs font-medium sm:text-sm h-3.5 w-24 rounded-full bg-slate-200" />
                  <p className="mt-0.5 text-2xl font-bold tracking-tight sm:mt-1 sm:text-3xl bg-slate-200 text-transparent">000</p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block h-3.5 w-28 rounded-full bg-slate-200 text-transparent" />
                </div>
              </div>
            ))
          : cards.map((card) => (
              <div
                key={card.label}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5",
                  card.label === "Other Status" && "col-span-2 sm:col-span-1",
                )}
              >
                <div className="relative">
                  <div className={cn("mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl", card.iconBg)}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm">{card.label}</p>
                  <p className={cn("mt-0.5 text-2xl font-bold tracking-tight sm:mt-1 sm:text-3xl", card.accent)}>
                    {card.value}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">{card.description}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
