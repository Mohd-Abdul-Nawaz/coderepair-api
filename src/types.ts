/** Shared domain types for coderepair-api. */

export type TaskKind = "bugfix" | "feature" | "refactor" | "perf";

export interface RepairTask {
  id: string;
  title: string;
  kind: TaskKind;
  language: string;
  prompt: string;
  starter: string;
  /** Hidden reference solution — never sent to clients. */
  golden: string;
  tests: string[];
}

export interface PublicTask {
  id: string;
  title: string;
  kind: TaskKind;
  language: string;
  prompt: string;
  starter: string;
}

export interface Attempt {
  id: string;
  taskId: string;
  author: string;
  code: string;
  passed: boolean;
  score: number;
  failures: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  author: string;
  attempts: number;
  solved: number;
  avgScore: number;
}
