# AGENTS.md

## Purpose

This repository is an autonomous coding benchmark executed through OpenCode.

The product requirements are defined in:

`./SPECS.md`

This file defines **how the agent must operate while implementing those requirements**.

The objective is not merely to generate code. The objective is to leave behind a reproducible, tested, documented, resumable software project whose actual state can be objectively evaluated.

The agent is expected to work autonomously from planning through implementation, debugging, verification, and final reporting.

---

# 1. Mandatory First Action: Read SPECS.md

**CRITICAL: Before planning, editing application code, installing dependencies, or making architectural decisions, use the Read tool to read `./SPECS.md` in full.**

Do not rely on:

- A previous conversation summary.
- Prior knowledge of this benchmark.
- The filename alone.
- A partial excerpt.
- A previous OpenCode session.
- An assumption about what a "Puyo Puyo Tetris-like" game should contain.

`SPECS.md` is the authoritative product specification.

At the beginning of **every new or resumed session**, read `SPECS.md` again before continuing meaningful implementation work.

If `SPECS.md` changes, the newest contents take precedence over earlier assumptions.

---

# 2. Instruction Precedence

Use the following responsibility split:

1. `SPECS.md` defines **what must be built and verified**.
2. `AGENTS.md` defines **how the work must be managed and executed**.
3. `PLAN.md` records the chosen implementation approach.
4. `PROGRESS.md` records the actual current implementation state.
5. Existing source code and Git history show what has actually been implemented.

If `PLAN.md` conflicts with `SPECS.md`, update the plan.

If `PROGRESS.md` says something is complete but the code or verification commands disagree, trust the code and command results.

Never change `SPECS.md` merely to make the implementation easier or to make failing work appear compliant.

---

# 3. Benchmark Isolation

This benchmark is intended to measure the abilities of the currently selected coding model.

Do not contaminate the benchmark by delegating the implementation to another model.

Unless explicitly instructed otherwise:

- Do not call another coding model to implement features.
- Do not delegate code review to a stronger external model.
- Do not use external AI services to solve the task.
- Do not import an existing implementation of this benchmark.
- Do not download an existing Tetris, Puyo Puyo, or hybrid game and modify it.
- Do not copy substantial source code from tutorials or public repositories.

OpenCode tools may be used normally for:

- Reading files.
- Searching the repository.
- Editing files.
- Running shell commands.
- Running Git.
- Installing project dependencies.
- Running tests.
- Running the browser application.
- Inspecting errors.
- Inspecting official documentation when genuinely blocked.

Internet research should not substitute for reasoning about the implementation.

If external technical documentation becomes necessary, prefer official documentation and record any significant dependency or externally-derived architectural decision in `docs/DECISIONS.md`.

---

# 4. Autonomous Execution

Proceed autonomously.

Do not ask the user to approve:

- File structure.
- Renderer choice.
- Function names.
- Internal TypeScript types.
- Testing approach.
- Minor UI choices.
- Reasonable dependency choices.
- Ordinary implementation trade-offs.

When a requirement is underspecified:

1. Choose a sensible default.
2. Record significant assumptions.
3. Continue.

Only ask the user for input when completion would otherwise be genuinely impossible.

Do not stop after planning if editing and shell tools are available.

Do not stop merely because one test, command, or implementation attempt fails.

Investigate, repair, and continue.

---

# 5. Session Startup and Resume Protocol

At the start of work, determine the repository's actual state before changing anything.

Use Git and filesystem inspection rather than relying on memory.

At minimum inspect:

```bash
pwd
git status --short
git branch --show-current
git log --oneline --decorate -10
```

If the directory is not yet a Git repository, follow the initialization procedure later in this file.

Then read, when present:

```text
SPECS.md
PLAN.md
PROGRESS.md
package.json
README.md
BENCHMARK_RESULT.md
```

Also inspect any existing uncommitted changes:

```bash
git diff
git diff --cached
```

If implementation already exists, inspect the relevant project structure before making assumptions.

Useful operations include:

```bash
find
glob
grep
git diff
git show
```

Do not blindly regenerate an existing project.

---

# 6. Resuming Interrupted Work

The repository must be recoverable after an OpenCode session ends unexpectedly.

When resuming:

1. Read `SPECS.md`.
2. Read `PLAN.md`.
3. Read `PROGRESS.md`.
4. Inspect Git status.
5. Inspect recent commits.
6. Inspect uncommitted changes.
7. Determine which phase is actually incomplete.
8. Run an appropriate quick sanity check.
9. Continue from the smallest incomplete unit of work.

Do not discard a dirty working tree simply because its origin is unclear.

Determine what the changes do first.

Never assume uncommitted changes are disposable.

---

# 7. Git Is Mandatory

Git must be used throughout the benchmark.

If this is a fresh directory and no repository exists:

```bash
git init
```

Create a suitable `.gitignore` early.

At minimum it should normally exclude:

```text
node_modules/
dist/
coverage/
playwright-report/
test-results/
*.log
.DS_Store
```

Add additional generated files when appropriate.

Do not ignore source code, lockfiles, plans, documentation, or benchmark reports.

---

# 8. Git Identity

Use the user's existing Git identity if one is already configured.

Check it rather than unnecessarily replacing it.

If commits fail only because this isolated benchmark repository has no Git identity, configure a **repository-local** benchmark identity.

For example:

```bash
git config user.name "OpenCode Benchmark"
git config user.email "opencode-benchmark@local"
```

Never change the user's global Git identity.

---

# 9. Preserve Existing Git History

Never use destructive Git operations simply to make the repository look clean.

Unless the user explicitly requests them, do not use:

```bash
git reset --hard
git clean -fd
git checkout -- .
git restore .
git push --force
git rebase
```

Do not amend or rewrite existing user commits.

Do not silently throw away work.

If reverting something is necessary, make a normal explicit change and preserve the history.

---

# 10. Initial Repository Checkpoint

For a completely new benchmark repository, establish an initial baseline before implementation.

If appropriate, commit:

- `AGENTS.md`
- `SPECS.md`
- `.gitignore`

Example:

```bash
git add AGENTS.md SPECS.md .gitignore
git commit -m "chore: initialize benchmark repository"
```

If the repository already contains history, do not manufacture a new baseline or rewrite existing history.

---

# 11. PLAN.md Is a Hard Gate

The specification requires planning before implementation.

On a fresh project:

**Do not write substantial application code before `PLAN.md` exists.**

`PLAN.md` must be derived from the actual contents of `SPECS.md`.

It should include the sections required by `SPECS.md` and should also include a requirement traceability checklist.

A useful format is:

```text
| Requirement area | Planned module | Planned verification |
|------------------|----------------|----------------------|
| Board            | src/...        | tests/...            |
| RNG              | src/...        | tests/...            |
| Blob clearing    | src/...        | tests/...            |
```

The exact format may differ.

The purpose is to ensure requirements are not silently forgotten.

---

# 12. Commit the Plan Before Implementation

On a fresh repository, make the planning order visible in Git history.

After creating and reviewing `PLAN.md`:

```bash
git add PLAN.md
git commit -m "docs: add implementation plan"
```

Substantial application implementation should come after this checkpoint.

If resuming an already partially implemented repository, do not rewrite history merely to manufacture this ordering.

Record what actually happened instead.

---

# 13. Maintain PROGRESS.md

Create:

`PROGRESS.md`

This is a resumability journal, not marketing documentation.

Keep it concise and factual.

It should contain at least:

```text
# Current Phase

...

# Completed

- ...

# In Progress

- ...

# Next Actions

1. ...
2. ...

# Last Verification

- typecheck: PASS/FAIL/NOT RUN
- unit tests: PASS/FAIL/NOT RUN
- coverage: PASS/FAIL/NOT RUN
- build: PASS/FAIL/NOT RUN
- e2e: PASS/FAIL/NOT RUN

# Known Problems

- ...

# Current Git Checkpoint

<commit hash or description>
```

Update `PROGRESS.md` after meaningful milestones and whenever the project state changes substantially.

It must help another fresh agent session answer:

> What was being worked on, what is known to work, and what should happen next?

Do not falsely mark a phase complete.

---

# 14. Truth Comes From Commands

Never claim that:

- Tests pass.
- Type checking passes.
- Build succeeds.
- Coverage meets the requirement.
- E2E tests pass.
- The application runs.

unless the corresponding command was actually executed successfully in the current repository state or an unchanged relevant checkpoint.

After modifying code that could invalidate an earlier result, the earlier result must not automatically be considered current.

Verification results must correspond to the code being reported.

---

# 15. Implementation Strategy

Work incrementally.

Prefer vertical slices and testable milestones rather than generating the entire application before executing anything.

A recommended sequence is:

1. Repository/bootstrap.
2. `PLAN.md`.
3. TypeScript/Vite/test tooling.
4. Core types and board.
5. Deterministic RNG and piece queue.
6. Tetromino logic.
7. Blob pair logic.
8. Collision and locking.
9. Row clearing.
10. Blob group detection.
11. Gravity.
12. Chain resolution.
13. Scoring and progression.
14. Game state transitions.
15. Unit/integration tests.
16. Browser rendering.
17. Input and timing.
18. E2E tests.
19. Responsive/accessibility sanity.
20. Full verification.
21. Documentation.
22. `BENCHMARK_RESULT.md`.

Adapt this sequence if a better dependency order becomes apparent.

Do not add optional features until mandatory requirements are working.

---

# 16. Keep the Core Engine Browser-Independent

This architectural rule from the specification is especially important.

Core gameplay logic should be executable in tests without:

- DOM APIs.
- Canvas APIs.
- Browser events.
- Browser timers.

Prefer plain TypeScript state and pure or controlled state-transition functions.

Browser-specific concerns belong outside the core engine.

When uncertain whether logic belongs in the renderer or engine, ask:

> Could an AI player or a different renderer invoke this same game rule without a browser?

If yes, it probably belongs in the engine.

---

# 17. Determinism Is a First-Class Requirement

Do not introduce nondeterministic core behavior accidentally.

Avoid direct `Math.random()` calls throughout game logic.

All gameplay randomness should flow through the seeded randomization abstraction required by `SPECS.md`.

Tests involving randomness must use explicit seeds.

A reproducibility failure is a correctness bug.

---

# 18. Dependency Management

Use project-local dependencies.

Do not install required application tooling globally.

For a new project, use the package manager selected by the project.

Unless the repository already establishes a different package manager, use `npm`, because the benchmark specification defines npm scripts.

Commit the lockfile.

When `package-lock.json` already exists and dependencies need to be restored, prefer:

```bash
npm ci
```

When dependencies are intentionally changed, use the appropriate `npm install` command and commit the resulting `package.json` and `package-lock.json` changes together.

Avoid unnecessary dependencies.

---

# 19. Do Not Hide Defects With Tests

Tests exist to verify the implementation, not to make the dashboard green.

Do not:

- Delete a valid failing test because implementation is difficult.
- Change an expected value solely to match incorrect behavior.
- Reduce the coverage threshold to pass.
- Skip important tests without a documented environmental reason.
- Mock away the behavior the test is supposed to verify.
- replace meaningful assertions with existence checks.
- Disable TypeScript strictness to suppress errors.

When a test exposes a real bug, fix the implementation.

If the specification itself causes an unusual behavior, implement the specification as written and document the decision.

---

# 20. Testing During Development

Do not wait until the end to run all tests for the first time.

After a focused change, run the smallest relevant verification first.

Examples:

```bash
npm run test -- board
npm run test -- scoring
```

or whatever focused Vitest syntax the project establishes.

After a coherent subsystem is complete, run the broader unit suite.

Before milestone commits, run appropriate sanity checks.

This shortens debugging loops and makes failures easier to attribute.

---

# 21. Type Checking

TypeScript strictness is mandatory.

Run type checking repeatedly during development.

The final project must expose:

```bash
npm run typecheck
```

Avoid:

```typescript
any
// @ts-ignore
```

unless there is a genuinely necessary and documented reason.

Do not solve typing problems by weakening compiler configuration.

---

# 22. Linting

If linting is configured, keep it passing.

Do not spend disproportionate time building an elaborate lint configuration.

Linting exists to catch useful problems, not to become the project.

The required application, tests, and correctness remain higher priority.

---

# 23. Browser and E2E Verification

Playwright tests must exercise the actual browser application.

Prefer deterministic observable state over arbitrary delays.

Avoid E2E tests based on:

```text
sleep 5000
hope something happened
```

Prefer:

- Stable selectors.
- Exposed game status.
- Deterministic seeds.
- Observable state transitions.
- Playwright assertions with built-in waiting.

If possible, configure Playwright's `webServer` so E2E execution starts and tears down the application reliably.

Avoid leaving orphan development servers running after testing.

---

# 24. Generated State for Testing

Testability hooks are acceptable when they improve deterministic verification, provided they do not bypass normal production rules.

Good examples:

- `?seed=12345`
- Stable `data-testid` attributes.
- Read-only debug state in development/test mode.
- Explicit engine constructors taking seeded configuration.

Bad examples:

- A production-only "win test" button.
- Tests directly modifying hidden internals instead of exercising behavior when an integration path should be tested.
- Hard-coded game sequences that only exist to satisfy tests.

---

# 25. Performance Sanity

The game is small, so optimize sensibly rather than prematurely.

However, explicitly verify that the implementation does not create obvious runtime problems.

Check for:

- Duplicate keyboard listeners after restart.
- Multiple active animation loops.
- Multiple gravity timers.
- Increasing speed after repeated restarts.
- Expensive group detection every animation frame.
- Per-frame console logging.
- Unbounded queues or history arrays.
- Unnecessary DOM reconstruction.

Treat leaked timers/listeners as correctness bugs.

---

# 26. Failure Recovery Protocol

Failures are expected during implementation.

When a command fails:

1. Read the actual error.
2. Identify the smallest plausible cause.
3. Inspect relevant code/configuration.
4. Make a focused correction.
5. Re-run the narrow failing check.
6. Run broader verification after it passes.

Do not repeatedly run the exact same failing command without changing anything.

After two identical failures, stop blind retrying and reassess the cause.

Do not respond to a test failure by making unrelated broad changes.

---

# 27. Environment Failures

Some failures may genuinely be caused by the execution environment.

Examples:

- Browser binaries unavailable.
- Network unavailable for package installation.
- OS package missing.
- Permission restrictions.
- Sandbox restrictions.

Before classifying a failure as environmental:

1. Investigate it.
2. Attempt reasonable non-destructive fixes.
3. Confirm that application code is not the likely cause.

If it cannot be resolved, record:

- Exact command.
- Relevant error.
- Attempts made.
- Why it appears environmental.
- What would be required to complete verification.

Record this in both `PROGRESS.md` and eventually `BENCHMARK_RESULT.md`.

Never report an environmentally blocked test as PASS.

---

# 28. Sanity Check Before Every Commit

Before creating a milestone commit:

1. Inspect:

```bash
git status --short
git diff --check
```

2. Review the actual diff.

3. Run the fastest meaningful checks for the changed area.

4. Ensure generated junk is not being committed.

5. Ensure no credentials, tokens, `.env` secrets, or unrelated machine files are included.

Then commit the coherent milestone.

---

# 29. Commit Frequently Enough to Resume

Use logical checkpoint commits.

Good commit scopes include:

```text
docs: add implementation plan
chore: initialize vite and test tooling
feat: implement deterministic piece generation
feat: implement board movement and collision
feat: implement board resolution and chains
test: cover core game engine
feat: add browser renderer and controls
test: add browser gameplay tests
docs: document architecture and verification
```

These are examples, not a required exact history.

A good checkpoint should leave the project easier to understand and resume.

Avoid one enormous final commit containing the entire project.

Also avoid committing every trivial line change.

---

# 30. Never Commit Known Broken State as a Normal Milestone

Normal milestone commits should preferably pass the checks relevant to that milestone.

If work must stop unexpectedly while incomplete and preserving the state in Git materially improves resumability, a clearly marked checkpoint is acceptable:

```text
checkpoint: preserve incomplete blob gravity work
```

Do not disguise a broken checkpoint as completed functionality.

Describe its state in `PROGRESS.md`.

---

# 31. Before Risky Refactoring

Before a significant refactor:

1. Get the existing relevant tests passing.
2. Create a clean checkpoint commit.
3. Perform the refactor.
4. Run the same tests again.

This makes regressions easier to identify and recovery much safer.

Do not use `git stash` as the primary long-term checkpoint mechanism because hidden stashes are easy for later sessions to miss.

Prefer visible commits plus `PROGRESS.md`.

---

# 32. Requirement Traceability

As implementation progresses, keep track of which specification requirements are covered.

This may live in `PLAN.md`, `PROGRESS.md`, or both.

Before completion, explicitly check `SPECS.md` from top to bottom.

Do not assume that passing tests proves every requested feature exists.

For each major requirement determine whether it is:

```text
IMPLEMENTED
VERIFIED
BLOCKED
MISSING
```

Anything `BLOCKED` or `MISSING` must appear accurately in `BENCHMARK_RESULT.md`.

---

# 33. Full Verification Gate

Before declaring the project complete, actually attempt every mandatory verification command from `SPECS.md`.

At minimum:

```bash
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
```

If linting exists:

```bash
npm run lint
```

If a combined check script exists:

```bash
npm run check
```

Do not substitute `npm run check` for individually collecting required benchmark results when the report needs separate outcomes.

---

# 34. Verification After Final Code Changes

The final verification must occur **after** the final meaningful code changes.

If documentation alone changes afterward, rerunning the entire game suite is usually unnecessary.

If application code, test code, build configuration, dependencies, or TypeScript configuration changes after a successful verification, rerun the affected checks.

Do not report stale results.

---

# 35. Manual Runtime Sanity

Automated tests are necessary but not sufficient.

Before completion, run or inspect the browser application sufficiently to verify the major visible behaviors required by `SPECS.md`.

Where tooling permits, verify the application in an actual browser.

Check for:

- Visible board.
- Visible active pieces.
- Falling behavior.
- Keyboard controls.
- Locking.
- Clearing.
- Score updates.
- Pause.
- Restart.
- Game over.
- Browser console errors.

If a behavior is difficult to reproduce manually, deterministic test/debug configuration may be used.

---

# 36. BENCHMARK_RESULT.md Must Be Factual

Create/update `BENCHMARK_RESULT.md` only using actual observed results.

Never infer:

```text
PASS
```

because code "looks correct."

Record exact counts and coverage produced by tools.

If a number cannot be measured, say so.

Do not fabricate:

- Coverage percentages.
- Test counts.
- Bundle size.
- Performance measurements.
- Build success.
- E2E success.

Accuracy of the benchmark report is itself part of the benchmark.

---

# 37. Documentation Must Match the Final Code

Before completion, ensure:

```text
README.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
PLAN.md
PROGRESS.md
BENCHMARK_RESULT.md
```

reflect the implementation that actually exists.

Do not leave documentation describing an abandoned architecture.

If the architecture changed materially during implementation, update the documentation rather than rewriting history.

`PLAN.md` may preserve original planning decisions, but note meaningful deviations when useful.

---

# 38. Keep Scope Under Control

Mandatory requirements have priority over enhancements.

Do not implement optional features while mandatory items are failing.

Use this order when deciding what to work on:

1. Broken required mechanics.
2. Missing required mechanics.
3. Required tests.
4. Build/type failures.
5. Required browser behavior.
6. Required documentation.
7. Performance/accessibility sanity.
8. Optional enhancements.

A polished optional animation is never more important than a missing chain-reaction test.

---

# 39. Code Readability

Write code for a human developer who will inspect this benchmark afterward.

Prefer:

- Focused modules.
- Explicit types.
- Clear names.
- Small functions.
- Clear state transitions.
- Straightforward algorithms.
- Comments for non-obvious reasons.
- Configuration in predictable locations.

Avoid:

- Giant files.
- Giant classes.
- Excessive inheritance.
- Premature generic frameworks.
- Clever one-liners that obscure rules.
- Deeply nested callbacks.
- Repeated constants.
- Rule logic duplicated between UI and tests.
- Test-only production hacks.

---

# 40. No Unrelated Cleanup

Do not use the benchmark as an excuse to modify unrelated files.

If the repository already contains user changes outside the benchmark implementation:

- Preserve them.
- Avoid formatting them.
- Avoid moving them.
- Avoid committing them with benchmark work unless they are genuinely required.

Keep commits focused.

---

# 41. Security and Repository Hygiene

Do not commit:

- API keys.
- Tokens.
- Passwords.
- Browser profiles.
- Local environment secrets.
- `node_modules`.
- Coverage output.
- Build output unless explicitly required.
- Temporary screenshots unless intentionally part of documentation.
- Large unrelated binaries.

Before finalizing, inspect the tracked files and Git status.

---

# 42. Final Git Sanity

Before the final report:

```bash
git status --short
git diff --check
git log --oneline --decorate -10
```

The preferred final state is a clean working tree.

If the working tree is not clean, determine why.

Do not silently finish with important uncommitted implementation changes.

Commit final coherent changes after verification/documentation when appropriate.

---

# 43. Recommended Final Commit

Once implementation, verification, and documentation are complete, make a final coherent checkpoint.

For example:

```text
docs: finalize benchmark results
```

Do not alter previously recorded test results merely to make them look better.

---

# 44. Completion Checklist

Before saying the benchmark is complete, verify all of the following:

```text
[ ] SPECS.md was read in full.
[ ] PLAN.md exists.
[ ] Planning occurred before substantial implementation on a fresh repo.
[ ] PROGRESS.md reflects the current state.
[ ] Git repository exists.
[ ] Logical Git checkpoints exist.
[ ] Core engine is independent from browser UI.
[ ] Deterministic RNG is implemented.
[ ] Required gameplay is implemented.
[ ] Required unit tests exist.
[ ] Required invariant tests exist.
[ ] Required E2E tests exist.
[ ] Type checking was executed.
[ ] Unit tests were executed.
[ ] Coverage was executed.
[ ] Production build was executed.
[ ] E2E tests were executed.
[ ] Lint was executed if configured.
[ ] Browser/runtime sanity was performed where possible.
[ ] README.md reflects reality.
[ ] docs/ARCHITECTURE.md reflects reality.
[ ] docs/DECISIONS.md reflects reality.
[ ] BENCHMARK_RESULT.md contains factual results.
[ ] Known failures are disclosed.
[ ] git diff --check passes.
[ ] Important implementation work is committed.
[ ] No secrets or generated junk are committed.
```

Anything unchecked must either be completed or clearly reported as incomplete.

---

# 45. Final Response

The final OpenCode response should be concise.

Report:

1. What was implemented.
2. Whether the game is playable.
3. Typecheck result.
4. Unit test result and count.
5. Coverage result.
6. Build result.
7. E2E result and count.
8. Major architecture decisions.
9. Known limitations or failures.
10. Exact command to start the game.
11. Location of `BENCHMARK_RESULT.md`.
12. Final Git commit hash if a final commit was created.

Do not paste enormous logs unless needed to explain a failure.

Do not claim perfection.

Report the actual repository state.

---

# 46. Operational Loop

Throughout the task, repeatedly follow this loop:

```text
READ REQUIREMENT
      ↓
INSPECT CURRENT STATE
      ↓
IMPLEMENT SMALLEST COHERENT CHANGE
      ↓
RUN FOCUSED VERIFICATION
      ↓
FIX FAILURES
      ↓
UPDATE PROGRESS
      ↓
CREATE GIT CHECKPOINT WHEN APPROPRIATE
      ↓
CONTINUE
```

Near completion:

```text
READ SPECS.md AGAIN
      ↓
CHECK EVERY REQUIREMENT
      ↓
RUN FULL VERIFICATION
      ↓
MANUAL/BROWSER SANITY
      ↓
UPDATE DOCUMENTATION
      ↓
CREATE BENCHMARK_RESULT.md
      ↓
FINAL GIT SANITY
      ↓
FINAL CHECKPOINT
      ↓
REPORT ACTUAL RESULTS
```

---

# 47. Most Important Rules

If context becomes constrained or other instructions are forgotten, preserve these:

1. **Read `SPECS.md` before doing the work.**
2. **Create `PLAN.md` before substantial implementation.**
3. **Use Git throughout the task.**
4. **Never destroy unexplained existing work.**
5. **Maintain `PROGRESS.md` so another session can resume safely.**
6. **Implement incrementally and test continuously.**
7. **Never weaken tests merely to get a pass.**
8. **Never claim a command passed unless it actually passed.**
9. **Re-read `SPECS.md` before final verification.**
10. **Leave the repository in a reproducible and resumable state.**