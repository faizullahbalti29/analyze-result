"use client";

import { cn } from "@/lib/utils";
import type { ClassLevel } from "@/lib/types";

interface ClassTabsProps {
  selected: ClassLevel;
  onChange: (value: ClassLevel) => void;
}

const TABS: { value: ClassLevel; label: string; subtitle: string }[] = [
  { value: "9th", label: "Class 9th", subtitle: "SSC Part I" },
  { value: "10th", label: "Class 10th", subtitle: "SSC Part II" },
  { value: "11th", label: "Class 11th", subtitle: "HSSC Part I" },
  { value: "12th", label: "Class 12th", subtitle: "HSSC Part II" },
];

export function ClassTabs({ selected, onChange }: ClassTabsProps) {
  return (
    <div className="w-full">
      <div className="flex w-full flex-nowrap items-stretch gap-1.5 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/80 sm:w-auto sm:overflow-visible">
        {TABS.map((tab) => {
          const isActive = selected === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "shrink-0 rounded-xl px-2 py-2.5 text-center transition-all duration-200 sm:min-w-[136px] sm:px-3.5 sm:text-left",
                isActive
                  ? "bg-white text-teal-900 shadow-md shadow-teal-900/10 ring-1 ring-teal-100"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
              )}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px]",
                  isActive ? "text-teal-600" : "text-slate-400",
                )}
              >
                {tab.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
