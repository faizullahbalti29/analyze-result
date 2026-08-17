import { Suspense } from "react";
import { ResultAnalyzer } from "@/components/result-analyzer";

export default function Home() {
  return (
    <Suspense>
      <ResultAnalyzer />
    </Suspense>
  );
}
