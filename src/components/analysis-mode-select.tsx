"use client";

import type { AnalysisMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnalysisModeSelectProps {
  value: AnalysisMode;
  onChange: (value: AnalysisMode) => void;
  disabled?: boolean;
}

export function AnalysisModeSelect({
  value,
  onChange,
  disabled = false,
}: AnalysisModeSelectProps) {
  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Analysis mode
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AnalysisMode)}
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        <option value="result">Result dashboard</option>
        <option value="institution">Institution compare</option>
      </select>
      {disabled && (
        <p className="text-xs text-slate-500">
          Institution compare is only available for Class 10th.
        </p>
      )}
    </div>
  );
}
