"use client";

import { Building2, ChevronDown, Loader2, Search, X } from "lucide-react";
// import Fuse from "fuse.js"; // removed local fuzzy search
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Institution } from "@/lib/types";

interface InstitutionSelectProps {
  institutions: Institution[];
  loading?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
}

export function InstitutionSelect({
  institutions,
  loading = false,
  value,
  onChange,
  onSearch,
}: InstitutionSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedLabel =
    institutions.find((institution) => institution.name === value)?.name ??
    "Select an institution";

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleSelect = (institutionName: string) => {
    onChange(institutionName);
    setOpen(false);
    setQuery("");
    onSearch?.("");
  };

  const handleClose = () => {
    setOpen(false);
    if (query) {
      setQuery("");
      onSearch?.("");
    }
  };

  return (
    <div className="relative w-full">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Building2 className="h-4 w-4 text-teal-600" />
        Institution
      </label>

      <button
        type="button"
        onClick={() => !loading && setOpen(true)}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition-all",
          open
            ? "border-teal-300 ring-2 ring-teal-100"
            : "border-slate-200 active:border-teal-200",
          loading && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "line-clamp-2 text-sm leading-snug",
            value ? "font-medium text-slate-900" : "text-slate-400",
          )}
        >
          {loading
            ? "Loading institutions…"
            : value
              ? selectedLabel
              : "Choose an institution to view results"}
        </span>
        {loading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-teal-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] sm:bg-slate-900/20"
            onClick={handleClose}
            aria-hidden
          />

          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-auto sm:mt-2 sm:max-h-80 sm:w-full sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:hidden">
              <p className="text-sm font-semibold text-slate-900">
                Select Institution
              </p>
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
                  placeholder="Search — typos OK…"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-teal-500" />
                )}
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto overscroll-contain py-1">
              {institutions.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-slate-500">
                  No match for{" "}
                  <span className="font-medium text-slate-700">
                    &ldquo;{query}&rdquo;
                  </span>
                </li>
              ) : (
                institutions.map((institution) => (
                  <li key={institution._id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(institution.name)}
                      className={cn(
                        "w-full px-4 py-3.5 text-left text-sm leading-snug transition-colors active:bg-teal-50 sm:py-3 sm:hover:bg-teal-50",
                        value === institution.name &&
                          "bg-teal-50 font-medium text-teal-900",
                      )}
                    >
                      {institution.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
