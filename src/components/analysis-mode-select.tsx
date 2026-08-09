"use client";

import type { AnalysisMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

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

  return (
    <div className="space-y-2">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        Analysis mode
      </label>

      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && handleOpen()}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition-all",
            open ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200 active:border-teal-200",
            disabled && "cursor-not-allowed opacity-70",
          )}
        >
          <span className={cn("line-clamp-2 text-sm leading-snug", value ? "font-medium text-slate-900" : "text-slate-400")}>
            {value === "result" ? "Result dashboard" : "Institution compare"}
          </span>
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </button>

        {open && anchorRect && createPortal(
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleClose} />
            <div
              style={{ left: anchorRect.left, top: anchorRect.bottom + 8, width: anchorRect.width, position: 'fixed', zIndex: 60 }}
              className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden divide-y divide-slate-100"
              role="menu"
            >
              <button
                type="button"
                onClick={() => { onChange('result'); handleClose(); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm",
                  value === 'result' ? 'bg-teal-50 font-medium text-teal-900' : 'text-slate-900 hover:bg-teal-50'
                )}
              >
                Result dashboard
              </button>
              <button
                type="button"
                onClick={() => { onChange('institution'); handleClose(); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm",
                  value === 'institution' ? 'bg-teal-50 font-medium text-teal-900' : 'text-slate-900 hover:bg-teal-50'
                )}
              >
                Institution compare
              </button>
            </div>
          </>,
          document.body,
        )}
      </div>

      {disabled && (
        <p className="text-xs text-slate-500">Institution compare is only available for Class 10th.</p>
      )}
    </div>
  );
}
