"use client";

import { Building2, Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Institution } from "@/lib/types";

interface MultiInstitutionSelectProps {
  institutions: Institution[];
  loading?: boolean;
  selected: string[];
  onChange: (selected: string[]) => void;
  onSearch?: (query: string) => void;
}

export function MultiInstitutionSelect({
  institutions,
  loading = false,
  selected,
  onChange,
  onSearch,
}: MultiInstitutionSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedSet = new Set(selected);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleSelection = (institutionName: string) => {
    const nextSelected = new Set(selected);
    if (nextSelected.has(institutionName)) {
      nextSelected.delete(institutionName);
    } else if (selected.length < 5) {
      nextSelected.add(institutionName);
    }
    onChange([...nextSelected]);
  };

  const removeSelection = (institutionName: string) => {
    onChange(selected.filter((name) => name !== institutionName));
  };

  const handleClose = () => {
    setOpen(false);
    if (query) {
      setQuery("");
      onSearch?.("");
    }
  };

  const renderLabel = () => {
    if (selected.length === 0) {
      return "Choose up to 5 institutions to compare";
    }
    if (selected.length === 1) {
      return selected[0];
    }
    return `${selected.length} institutions selected`;
  };

  return (
    <div className="relative w-full">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Building2 className="h-4 w-4 text-teal-600" />
        Institutions
      </label>

      <button
        type="button"
        onClick={() => !loading && setOpen(true)}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-all",
          open
            ? "border-teal-300 ring-2 ring-teal-100"
            : "border-slate-200 active:border-teal-200",
          loading && "cursor-not-allowed opacity-60",
        )}
      >
        <span className={cn("line-clamp-2 text-sm leading-snug", selected.length ? "font-medium text-slate-900" : "text-slate-400")}> 
          {loading ? "Loading institutions…" : renderLabel()}
        </span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
              {selected.length}/5
            </span>
          )}
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((institutionName) => (
            <span
              key={institutionName}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
            >
              <span className="max-w-[220px] truncate">{institutionName}</span>
              <button
                type="button"
                onClick={() => removeSelection(institutionName)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label={`Remove ${institutionName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] sm:bg-slate-900/20"
            onClick={handleClose}
            aria-hidden
          />

          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-auto sm:mt-2 sm:max-h-96 sm:w-full sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:hidden">
              <p className="text-sm font-semibold text-slate-900">Compare Institutions</p>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-500 active:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 p-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => {
                    const nextVal = event.target.value;
                    setQuery(nextVal);
                    onSearch?.(nextVal);
                  }}
                  placeholder="Search institutions…"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                  autoFocus
                />
                {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-teal-500" />}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Select up to 5 class 10th institutions to compare their totals and top students.
              </p>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto py-1">
              {institutions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No institution matches "{query}".
                </div>
              ) : (
                <ul className="space-y-1 px-3 pb-4">
                  {institutions.map((institution) => {
                    const isSelected = selectedSet.has(institution.name);
                    return (
                      <li key={institution._id}>
                        <button
                          type="button"
                          onClick={() => toggleSelection(institution.name)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition-all",
                            isSelected
                              ? "border-teal-300 bg-teal-50 text-teal-900"
                              : "border-slate-200 bg-white text-slate-900 hover:border-teal-200 hover:bg-teal-50/50",
                          )}
                        >
                          <span className="min-w-0 truncate">{institution.name}</span>
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                            {isSelected ? <Check className="h-4 w-4" /> : selected.length >= 5 ? "-" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
