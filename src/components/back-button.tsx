"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900 sm:text-sm"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Result Analyzer
    </button>
  );
}
