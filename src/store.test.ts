import assert from "node:assert/strict";
import test from "node:test";
import { AttemptStore } from "./store.js";
import { TASKS } from "./tasks.js";

const golden = (id: string): string => TASKS.find((t) => t.id === id)!.golden;

test("submit grades and records passing attempts", () => {
  const store = new AttemptStore();
  const result = store.submit("uniq", "nawaz", golden("uniq"));
  assert.ok(!("error" in result));
  if ("error" in result) throw new Error("expected an attempt");
  assert.equal(result.passed, true);
  assert.equal(store.forTask("uniq").length, 1);
});

test("submit rejects unknown tasks and blank payloads", () => {
  const store = new AttemptStore();
  const unknown = store.submit("nope", "nawaz", "x");
  assert.deepStrictEqual(unknown, { error: "unknown task nope" });
  const blank = store.submit("uniq", "  ", golden("uniq"));
  assert.deepStrictEqual(blank, { error: "author is required" });
});

test("leaderboard ranks solved tasks first", () => {
  const store = new AttemptStore();
  store.submit("uniq", "alice", golden("uniq"));
  store.submit("median", "alice", golden("median"));
  store.submit("uniq", "bob", "export default function uniq(i) { return []; }");
  const board = store.leaderboard();
  assert.equal(board[0].author, "alice");
  assert.equal(board[0].solved, 2);
  assert.equal(board[1].author, "bob");
});
