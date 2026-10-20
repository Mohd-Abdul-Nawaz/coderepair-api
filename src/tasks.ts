import { RepairTask } from "./types.js";

/**
 * Seeded task bank. Each task ships a buggy `starter`, a hidden `golden`
 * reference, and `tests` expressed as `input => expected` assertions over the
 * candidate's default-exported function.
 */
export const TASKS: RepairTask[] = [
  {
    id: "median",
    title: "Fix the median helper",
    kind: "bugfix",
    language: "typescript",
    prompt: "Fix `median(nums)` so it returns the statistical median.",
    starter: "export default function median(nums: number[]): number {\n  const s = [...nums].sort();\n  return s[Math.floor(s.length / 2)];\n}",
    golden:
      "export default function median(nums: number[]): number {\n  const s = [...nums].sort((a, b) => a - b);\n  const m = Math.floor(s.length / 2);\n  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;\n}",
    tests: ["[[3,1,2]] => 2", "[[1,2,3,4]] => 2.5", "[[5]] => 5"],
  },
  {
    id: "uniq",
    title: "Implement stable dedupe",
    kind: "feature",
    language: "typescript",
    prompt: "Implement `uniq(items)` preserving first-seen order.",
    starter: "export default function uniq(items: number[]): number[] {\n  return [];\n}",
    golden:
      "export default function uniq(items: number[]): number[] {\n  return [...new Set(items)];\n}",
    tests: ["[[1,2,2,3,1]] => [1,2,3]", "[[]] => []", "[[3,3,3]] => [3]"],
  },
  {
    id: "clamp",
    title: "Refactor clamp without branches",
    kind: "refactor",
    language: "typescript",
    prompt: "Refactor `clamp(v, lo, hi)` to a branchless form.",
    starter:
      "export default function clamp(v: number, lo: number, hi: number): number {\n  if (v < lo) return lo;\n  if (v > hi) return hi;\n  return v;\n}",
    golden:
      "export default function clamp(v: number, lo: number, hi: number): number {\n  return Math.min(hi, Math.max(lo, v));\n}",
    tests: ["[5, 0, 10] => 5", "[-3, 0, 10] => 0", "[99, 0, 10] => 10"],
  },
];
