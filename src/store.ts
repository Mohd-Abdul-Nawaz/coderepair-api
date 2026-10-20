import { randomUUID } from "node:crypto";
import { gradeTask } from "./grader.js";
import { TASKS } from "./tasks.js";
import { Attempt, LeaderboardEntry, PublicTask, TaskKind } from "./types.js";

function toPublic(
  id: string,
  title: string,
  kind: TaskKind,
  language: string,
  prompt: string,
  starter: string
): PublicTask {
  return { id, title, kind, language, prompt, starter };
}

export function listPublicTasks(): PublicTask[] {
  return TASKS.map((t) => toPublic(t.id, t.title, t.kind, t.language, t.prompt, t.starter));
}

export function getPublicTask(id: string): PublicTask | undefined {
  const task = TASKS.find((t) => t.id === id);
  return task ? toPublic(task.id, task.title, task.kind, task.language, task.prompt, task.starter) : undefined;
}

export class AttemptStore {
  private attempts: Attempt[] = [];

  submit(taskId: string, author: string, code: string): Attempt | { error: string } {
    const task = TASKS.find((t) => t.id === taskId);
    if (!task) return { error: `unknown task ${taskId}` };
    if (!author.trim()) return { error: "author is required" };
    if (!code.trim()) return { error: "code is required" };
    const grade = gradeTask(task, code);
    const attempt: Attempt = {
      id: randomUUID(),
      taskId,
      author: author.trim(),
      code,
      passed: grade.passed,
      score: grade.score,
      failures: grade.failures,
      createdAt: new Date().toISOString(),
    };
    this.attempts.push(attempt);
    return attempt;
  }

  forTask(taskId: string): Attempt[] {
    return this.attempts.filter((a) => a.taskId === taskId);
  }

  leaderboard(): LeaderboardEntry[] {
    const byAuthor = new Map<string, Attempt[]>();
    for (const attempt of this.attempts) {
      const list = byAuthor.get(attempt.author) ?? [];
      list.push(attempt);
      byAuthor.set(attempt.author, list);
    }
    return [...byAuthor.entries()]
      .map(([author, list]) => ({
        author,
        attempts: list.length,
        solved: new Set(list.filter((a) => a.passed).map((a) => a.taskId)).size,
        avgScore: list.reduce((n, a) => n + a.score, 0) / list.length,
      }))
      .sort((a, b) => b.solved - a.solved || b.avgScore - a.avgScore);
  }
}
