import { RepairTask } from "./types.js";

export interface GradeResult {
  passed: boolean;
  score: number;
  failures: string[];
}

/** Parse the right-hand side of `input => expected` using JSON. */
function parseExpected(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    if (trimmed === "undefined") return undefined;
    throw new Error(`expected value is not JSON: ${text}`);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    return ka.length === kb.length && ka.every((k) => deepEqual((a as any)[k], (b as any)[k]));
  }
  return false;
}

/** Strip the narrow set of TypeScript annotations used by our task bank. */
function stripTypes(code: string): string {
  return code
    .replace(/export\s+default\s+function/, "function")
    .replace(/:\s*number\[\]/g, "")
    .replace(/:\s*string\[\]/g, "")
    .replace(/:\s*number/g, "")
    .replace(/:\s*string/g, "");
}

/** Compile `export default function <name>(...)` source into a callable. */
function loadFunction(code: string): (...args: unknown[]) => unknown {
  const normalized = stripTypes(code);
  const match = normalized.match(/function\s+([A-Za-z_$][\w$]*)/);
  if (!match) throw new Error("no exported function found");
  const name = match[1];
  const factory = new Function(`${normalized}\n; if (typeof ${name} !== "function") throw new Error("no exported function found");\n; return ${name};`);
  const fn = factory() as unknown;
  if (typeof fn !== "function") throw new Error("submission must export a function");
  return fn as (...args: unknown[]) => unknown;
}

/** Deterministically grade `code` against the task's assertions. */
export function gradeTask(task: RepairTask, code: string): GradeResult {
  const failures: string[] = [];
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = loadFunction(code);
  } catch (e) {
    return { passed: false, score: 0, failures: [`compile: ${(e as Error).message}`] };
  }
  for (const assertion of task.tests) {
    const arrow = assertion.indexOf("=>");
    if (arrow === -1) {
      failures.push(`bad test: ${assertion}`);
      continue;
    }
    const inputText = assertion.slice(0, arrow).trim();
    const expectedText = assertion.slice(arrow + 2).trim();
    try {
      const args = JSON.parse(inputText) as unknown[];
      const expected = parseExpected(expectedText);
      const actual = fn(...args);
      if (!deepEqual(actual, expected)) {
        failures.push(`${inputText} => got ${JSON.stringify(actual)}, want ${expectedText}`);
      }
    } catch (e) {
      failures.push(`${inputText}: ${(e as Error).message}`);
    }
  }
  const passed = failures.length === 0;
  const score = task.tests.length === 0 ? 1 : (task.tests.length - failures.length) / task.tests.length;
  return { passed, score, failures };
}
