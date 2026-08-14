/**
 * Milestone progress logger for Oman Excel pack generators (5% … 100%).
 */
import fs from "fs";

export function createPackProgressReporter(
  totalCases: number,
  label: string,
  milestones: number[] = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
): {
  tick: (count?: number) => void;
  forceComplete: () => void;
} {
  let nextIdx = 0;
  let done = 0;
  const total = Math.max(totalCases, 1);

  const emit = (pct: number) => {
    console.log(
      `[${label}] ${pct}% completed (${Math.min(done, totalCases)}/${totalCases} cases)`
    );
  };

  return {
    tick(count = 1) {
      done += count;
      while (nextIdx < milestones.length) {
        const pct = milestones[nextIdx];
        const threshold = Math.ceil((pct / 100) * total);
        if (done < threshold && pct < 100) break;
        if (pct === 100 && done < total) break;
        emit(pct);
        nextIdx += 1;
      }
    },
    forceComplete() {
      while (nextIdx < milestones.length) {
        emit(milestones[nextIdx]);
        nextIdx += 1;
      }
    },
  };
}

/** True when a prior pack run already wrote a non-empty workbook at destPath. */
export function packOutputAlreadyExists(destPath: string): boolean {
  try {
    return fs.existsSync(destPath) && fs.statSync(destPath).size > 0;
  } catch {
    return false;
  }
}
