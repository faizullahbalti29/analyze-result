"use client";

import type { AnalysisMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, BarChart3, Trophy, GitCompare } from "lucide-react";

interface AnalysisModeSelectProps {
  value: AnalysisMode;
  onChange: (value: AnalysisMode) => void;
  isCompareAvailable?: boolean;
}

const MODES = [
  {
    id: "result" as const,
    label: "Result dashboard",
    description: "Single institution results & statistics",
    icon: BarChart3,
  },
  {
    id: "position" as const,
    label: "Position finder",
    description: "Find board / school merit rank by marks",
    icon: Trophy,
  },
  {
    id: "institution" as const,
    label: "Institution compare",
    description: "Compare multiple institutions",
    icon: GitCompare,
  },
];

export function AnalysisModeSelect({
  value,
  onChange,
  isCompareAvailable = true,
}: AnalysisModeSelectProps) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = () => {
    const rect = buttonRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(rect);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorRect(null);
  };

  const currentMode = MODES.find((m) => m.id === value) || MODES[0];
  const CurrentIcon = currentMode.icon;

  return (
    <div className="space-y-2">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        Analysis mode
      </label>

      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition-all",
            open ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200 hover:border-slate-300 active:border-teal-200",
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <CurrentIcon className="h-4 w-4 shrink-0 text-teal-600" />
            <span className="truncate text-sm font-medium text-slate-900">
              {currentMode.label}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {open && anchorRect && createPortal(
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleClose} />
            <div
              style={{
                left: anchorRect.left,
                top: anchorRect.bottom + 8,
                width: Math.max(anchorRect.width, 280),
                position: "fixed",
                zIndex: 60,
              }}
              className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl overflow-hidden"
              role="menu"
            >
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = value === mode.id;
                const isModeDisabled = mode.id === "institution" && !isCompareAvailable;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    disabled={isModeDisabled}
                    onClick={() => {
                      if (!isModeDisabled) {
                        onChange(mode.id);
                        handleClose();
                      }
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-teal-50 text-teal-950 font-medium"
                        : isModeDisabled
                        ? "cursor-not-allowed opacity-40 text-slate-400"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        isSelected ? "text-teal-600" : "text-slate-400",
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold sm:text-sm">
                        {mode.label}
                        {isModeDisabled && " (10th & 12th only)"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {mode.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
      </div>
    </div>
  );
}
