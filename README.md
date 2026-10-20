# coderepair-api

TypeScript REST service: a seeded **code-repair task bank** with deterministic grading, attempt tracking, and a leaderboard. Zero runtime dependencies (Node 18+ standard library only).

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | liveness probe |
| GET | `/tasks` | list public tasks (golden solutions never leave the server) |
| GET | `/tasks/:id` | one task: prompt + buggy starter |
| GET | `/tasks/:id/attempts` | attempts for a task |
| POST | `/attempts` `{taskId, author, code}` | grade a submission, store the attempt |
| GET | `/leaderboard` | ranked by solved tasks, then average score |

## Quick start

```bash
npm install
npm run test:src   # build + run node:test suites
npm start          # serves on PORT (default 3000)
```

```bash
curl localhost:3000/tasks
curl -X POST localhost:3000/attempts \
  -H 'content-type: application/json' \
  -d '{"taskId":"uniq","author":"nawaz","code":"export default function uniq(i){ return [...new Set(i)]; }"}'
curl localhost:3000/leaderboard
```

## How grading works

Tasks encode assertions as `input => expected` JSON pairs (`src/tasks.ts`).
`gradeTask()` compiles the candidate's `export default function`, runs every
assertion, deep-compares results, and returns `{passed, score, failures}`.
Golden solutions score 1.0; starters score < 1.0 — verified by
`grader.test.ts` on every build.

## Docker

```bash
docker build -t coderepair-api .
docker run --rm -p 3000:3000 coderepair-api
```

## Layout

```
src/
  types.ts    # shared domain types
  tasks.ts    # seeded bugfix/feature/refactor tasks
  grader.ts   # deterministic grader (no network, no randomness)
  store.ts    # in-memory attempt store + leaderboard
  server.ts   # zero-dependency HTTP router
  index.ts    # entrypoint (PORT env)
```

## License

MIT — see `LICENSE`.
