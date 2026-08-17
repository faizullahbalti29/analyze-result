"use client";

import { useState, useCallback, useId } from "react";
import {
  Award,
  Trophy,
  Equal,
  ArrowDown,
  ArrowUp,
  Search,
  Sparkles,
  School,
  Globe,
  Mountain,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import type { ClassLevel, Institution, PositionResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PositionFinderProps {
  selectedClass: ClassLevel;
  onClassChange?: (classLevel: ClassLevel) => void;
  institutions: Institution[];
  institutionsLoading?: boolean;
}

type ScopeType = "board" | "gb" | "institution";

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function PositionFinder({
  selectedClass,
  institutions,
}: PositionFinderProps) {
  const [marksInput, setMarksInput] = useState<string>("");
  const [scope, setScope] = useState<ScopeType>("board");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [instSearchQuery, setInstSearchQuery] = useState<string>("");
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PositionResult | null>(null);
  const [searchedParams, setSearchedParams] = useState<{
    marks: number;
    classLevel: ClassLevel;
    scope: ScopeType;
    institution?: string;
  } | null>(null);

  const formId = useId();

  const filteredInstitutions = institutions
    .filter((inst) =>
      inst.name.toLowerCase().includes(instSearchQuery.toLowerCase()),
    )
    .slice(0, 40);

  const handleCalculate = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const numMarks = Number(marksInput.trim());
      if (marksInput.trim() === "" || isNaN(numMarks) || numMarks < 0) {
        setError("Please enter a valid positive number for marks.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = new URL("/api/students/position", window.location.origin);
        url.searchParams.append("class", selectedClass);
        url.searchParams.append("marks", numMarks.toString());
        
        if (scope === "gb") {
          url.searchParams.append("region", "gb");
        } else if (scope === "institution" && selectedInstitution) {
          url.searchParams.append("institution", selectedInstitution);
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as PositionResult;
        setResult(data);
        setSearchedParams({
          marks: numMarks,
          classLevel: selectedClass,
          scope,
          institution:
            scope === "institution" && selectedInstitution
              ? selectedInstitution
              : undefined,
        });
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Failed to calculate position";
        setError(msg);
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [marksInput, selectedClass, scope, selectedInstitution],
  );

  const quickPresets =
    selectedClass === "9th" || selectedClass === "11th"
      ? [450, 480, 500, 515, 530, 540]
      : [850, 950, 1000, 1030, 1060, 1080];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Banner Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 p-6 text-white shadow-xl shadow-teal-950/10 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-white/20 backdrop-blur-sm sm:text-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-300 sm:h-4 sm:w-4" />
            Position &amp; Rank Calculator
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-3xl">
            Find Your Class {selectedClass} Merit Position
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-teal-100/80 sm:text-sm">
            Enter any score to discover exact merit ranking, number of students
            with higher or equal marks, percentile, and compare across the entire
            board, Gilgit-Baltistan region, or your specific school.
          </p>
        </div>
      </div>

      {/* ── Input & Controls Card ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <form onSubmit={handleCalculate} className="space-y-5" id={formId}>
          {/* Scope selection */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
              1. Calculation Scope
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {/* Option 1: Entire Board */}
              <button
                type="button"
                onClick={() => {
                  setScope("board");
                  setSelectedInstitution("");
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                  scope === "board"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-200 text-teal-950 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    scope === "board"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Entire Board</div>
                  <div className="text-xs text-slate-500">
                    All FBISE institutions
                  </div>
                </div>
              </button>

              {/* Option 2: Gilgit-Baltistan */}
              <button
                type="button"
                onClick={() => {
                  setScope("gb");
                  setSelectedInstitution("");
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                  scope === "gb"
                    ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-200 text-emerald-950 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    scope === "gb"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  <Mountain className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">Gilgit-Baltistan</span>
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-300/60">
                      GB
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    All GB schools &amp; districts
                  </div>
                </div>
              </button>

              {/* Option 3: Specific School */}
              <button
                type="button"
                onClick={() => setScope("institution")}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                  scope === "institution"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-200 text-teal-950 font-medium"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    scope === "institution"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Specific School</div>
                  <div className="text-xs text-slate-500">
                    Rank in selected institution
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Institution Search (when scope === institution) */}
          {scope === "institution" && (
            <div className="relative animate-fade-in space-y-2 rounded-xl border border-teal-100 bg-teal-50/40 p-3.5 sm:p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900">
                Select Institution
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsInstDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                >
                  <span
                    className={cn(
                      "truncate",
                      selectedInstitution
                        ? "font-medium text-slate-900"
                        : "text-slate-400",
                    )}
                  >
                    {selectedInstitution || "Search and select institution..."}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                {isInstDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsInstDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <div className="sticky top-0 z-10 mb-2 bg-white px-1">
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                          <Search className="h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Type to filter institutions..."
                            value={instSearchQuery}
                            onChange={(e) => setInstSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        {filteredInstitutions.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">
                            No institutions match your search.
                          </div>
                        ) : (
                          filteredInstitutions.map((inst) => (
                            <button
                              key={inst._id}
                              type="button"
                              onClick={() => {
                                setSelectedInstitution(inst.name);
                                setIsInstDropdownOpen(false);
                                setInstSearchQuery("");
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-teal-50",
                                selectedInstitution === inst.name
                                  ? "bg-teal-50 font-medium text-teal-900"
                                  : "text-slate-700",
                              )}
                            >
                              <span className="truncate">{inst.name}</span>
                              {selectedInstitution === inst.name && (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Marks Input */}
          <div>
            <label
              htmlFor="marks-input-field"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm"
            >
              2. Enter Obtained Marks
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  id="marks-input-field"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 800"
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 sm:text-lg"
                />
                {marksInput && (
                  <button
                    type="button"
                    onClick={() => setMarksInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !marksInput.trim()}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base",
                )}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Calculating…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Find Position</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Quick test:</span>
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMarksInput(preset.toString())}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800 sm:text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>

      {/* ── Position Calculation Results ── */}
      {result && searchedParams && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Position Card */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-b from-white via-teal-50/40 to-emerald-50/30 p-6 shadow-lg shadow-teal-900/5 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-300/60">
                <Award className="h-4 w-4 text-teal-600" />
                Class {searchedParams.classLevel} ·{" "}
                {searchedParams.scope === "gb"
                  ? "Gilgit-Baltistan Region (GB)"
                  : searchedParams.institution
                  ? `Institution: ${searchedParams.institution}`
                  : "All FBISE Board"}
              </div>

              {/* Main Rank Display */}
              <div className="mt-5 flex flex-col items-center">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 sm:text-sm">
                  Calculated Merit Ranking for {result.marks} Marks
                  {searchedParams.scope === "gb" && " in Gilgit-Baltistan"}
                </div>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black tracking-tight text-teal-950 sm:text-7xl">
                    {getOrdinal(result.position)}
                  </span>
                  <span className="text-2xl font-bold text-teal-700 sm:text-3xl">
                    Position
                  </span>
                </div>
              </div>

              {/* Clear Explanation */}
              <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
                {result.higherCount === 0 ? (
                  <span className="font-semibold text-emerald-700">
                    🎉 Outstanding! No student{" "}
                    {searchedParams.scope === "gb"
                      ? "in Gilgit-Baltistan"
                      : "in this cohort"}{" "}
                    scored higher than {result.marks} marks. You hold the 1st
                    Position
                    {searchedParams.scope === "gb" ? " in Gilgit-Baltistan" : ""}!
                  </span>
                ) : (
                  <>
                    There {result.higherCount === 1 ? "is" : "are"}{" "}
                    <span className="font-bold text-teal-900">
                      {result.higherCount.toLocaleString()}{" "}
                      {result.higherCount === 1 ? "student" : "students"}
                    </span>{" "}
                    {searchedParams.scope === "gb" && (
                      <span className="font-medium text-emerald-800">
                        in Gilgit-Baltistan{" "}
                      </span>
                    )}
                    with higher marks than{" "}
                    <span className="font-bold text-teal-900">
                      {result.marks}
                    </span>
                    , placing this score at the{" "}
                    <span className="font-bold text-teal-900">
                      {getOrdinal(result.position)}
                    </span>{" "}
                    position
                    {searchedParams.scope === "gb"
                      ? " in Gilgit-Baltistan"
                      : ""}
                    .
                  </>
                )}
              </p>

              {/* Percentile Strip */}
              <div className="mt-6 w-full max-w-md rounded-2xl border border-teal-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 sm:text-sm">
                  <span>Percentile Rank</span>
                  <span className="text-teal-700 font-bold">
                    Top {result.topPercentage}%
                    {searchedParams.scope === "gb" ? " in GB" : ""}
                  </span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(2, result.percentile))}%`,
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                  <span>Bottom 0%</span>
                  <span>
                    Scored better than {result.percentile}% of candidates
                  </span>
                  <span>Top 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {/* Higher */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
                  <ArrowUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Scored Higher
                  </div>
                  <div className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {result.higherCount.toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Students with &gt; {result.marks} marks
                {searchedParams.scope === "gb" ? " in GB" : ""}
              </p>
            </div>

            {/* Same */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60">
                  <Equal className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Same Marks
                  </div>
                  <div className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {result.equalCount.toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Students tied with exactly {result.marks}
              </p>
            </div>

            {/* Lower */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
                  <ArrowDown className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Scored Lower
                  </div>
                  <div className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {result.lowerCount.toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Students with &lt; {result.marks} marks
                {searchedParams.scope === "gb" ? " in GB" : ""}
              </p>
            </div>

            {/* Highest Score */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-200/60">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Top Score
                  </div>
                  <div className="text-xl font-bold text-purple-950 sm:text-2xl">
                    {result.topScore !== null ? result.topScore : "N/A"}
                  </div>
                </div>
              </div>
              <p
                className="mt-2 truncate text-[11px] text-slate-400"
                title={result.topStudent?.name || ""}
              >
                {result.topStudent
                  ? `1st: ${result.topStudent.name}`
                  : `Highest in ${searchedParams.scope === "gb" ? "GB" : "cohort"}`}
              </p>
            </div>
          </div>

          {/* Higher Scorers Leaderboard Preview */}
          {result.higherStudents.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    {searchedParams.scope === "gb" ? "Gilgit-Baltistan " : ""}
                    Students Scoring Higher than {result.marks} Marks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing top {result.higherStudents.length} candidates who
                    ranked ahead
                  </p>
                </div>
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  {result.higherCount} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-200/80 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center w-14">#</th>
                      <th className="px-4 py-3 font-semibold">Roll No</th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold text-right">Marks</th>
                      <th className="px-4 py-3 font-semibold">Institution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.higherStudents.map((student, idx) => (
                      <tr
                        key={student._id}
                        className="hover:bg-teal-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-700">
                          {student.roll_no}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 ring-1 ring-emerald-200">
                            {student.marks}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-slate-600 truncate max-w-xs"
                          title={student.institution}
                        >
                          {student.institution}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
