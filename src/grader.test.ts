import assert from "node:assert/strict";
import test from "node:test";
import { gradeTask } from "./grader.js";
import { TASKS } from "./tasks.js";

test("golden solutions pass every assertion", () => {
  for (const task of TASKS) {
    const grade = gradeTask(task, task.golden);
    assert.equal(grade.passed, true, `${task.id}: ${grade.failures.join("; ")}`);
    assert.equal(grade.score, 1);
  }
});

test("starter solutions fail", () => {
  for (const task of TASKS) {
    const grade = gradeTask(task, task.starter);
    assert.equal(grade.passed, false, `${task.id} starter should not pass`);
  }
});

test("median starter fails the even-length case", () => {
  const task = TASKS.find((t) => t.id === "median")!;
  const grade = gradeTask(task, task.starter);
  assert.ok(grade.failures.some((f) => f.includes("2.5")));
});

test("broken code returns a compile failure, not a crash", () => {
  const grade = gradeTask(TASKS[0], "this is not valid js ((");
  assert.equal(grade.passed, false);
  assert.equal(grade.score, 0);
  assert.ok(grade.failures[0].startsWith("compile:"));
});
