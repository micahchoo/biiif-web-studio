---
name: test-suite-management
description: Manage, evaluate, and enhance the IIIF Field Archive Studio test suite using user-centric testing principles. This skill provides tools for running tests by feature set, evaluating adherence to IDEAL OUTCOME/FAILURE PREVENTED structure, measuring coverage across user goals, optimizing alignment with user goals, and generating documentation about test philosophy and organization. Use when working with the project's test suite, especially after recent reorganization by user goals (feature sets) rather than technical implementation.
---

# Test Suite Management – User‑Centric Testing

When you need to execute, evaluate, or improve the IIIF Field Archive Studio test suite, this skill guides you through user‑centric testing workflows.

## When to use this skill

- You need to run the test suite organized by **feature sets** (e.g., `organize-media/`, `describe-content/`).
- You want to evaluate whether tests follow the **user‑centric principles** (IDEAL OUTCOME / FAILURE PREVENTED).
- You need to measure **test coverage across user goals**.
- You want to **optimize tests** to better align with user goals.
- You are generating **documentation** about test philosophy and organization.
- You are maintaining the test suite after its recent transformation to a user‑goal‑based structure.

## When NOT to use this skill

- For general JavaScript/TypeScript unit testing in other projects (use generic testing skills).
- For writing new tests from scratch without considering the existing user‑centric structure (first read the references).
- For configuring CI/CD pipelines (use DevOps skills).

## Inputs required from the user

- Path to the test suite root (`src/test/__tests__/`).
- Optional: specific feature set you want to focus on.
- Optional: whether you want to run, evaluate, measure, optimize, or document.

## Workflow

1. **Locate the test suite** – Navigate to `src/test/__tests__/` and read the main README ([src/test/__tests__/README.md](src/test/__tests__/README.md)) to understand the eight feature sets and the user‑centric philosophy.

2. **Choose your primary action** – Decide which of the five core tools you need:

   - **Run tests by feature set** – Use the pre‑defined npm scripts or create custom runs with `npm test -- <feature‑set>/`. See [references/running-tests.md](references/running-tests.md) for details.
   - **Evaluate test adherence** – Check if a test file contains IDEAL OUTCOME and FAILURE PREVENTED structures. Use [scripts/check-user-centric.sh](scripts/check-user-centric.sh) to scan test files.
   - **Measure coverage across user goals** – Generate a coverage report by feature set with [scripts/coverage-by-feature.sh](scripts/coverage-by-feature.sh).
   - **Optimize tests for user goals** – Review test files against the user‑goal mapping in [references/user-goal-matrix.md](references/user-goal-matrix.md) and apply improvements.
   - **Generate documentation** – Produce a summary of test philosophy and organization using [scripts/generate-test-docs.sh](scripts/generate-test-docs.sh).

3. **Execute the chosen tool** – Follow the detailed instructions in the linked reference or script. Each tool produces verifiable output (e.g., test results, coverage percentages, adherence reports).

4. **Interpret results and iterate** – Use the output to decide next steps:
   - If tests fail, fix the underlying code or test logic.
   - If coverage gaps exist, add missing tests for uncovered user goals.
   - If adherence is low, refactor tests to include IDEAL OUTCOME / FAILURE PREVENTED blocks.
   - If documentation is outdated, regenerate and commit.

5. **Update the suite** – After changes, re‑run the relevant checks to ensure the suite remains aligned with user‑centric principles.

## Examples

### Example 1: Running tests for the “organize‑media” feature set

```bash
cd /media/2TA/DevStuff/BIIIF/field-studio
npm test -- organize-media/
```

### Example 2: Checking adherence of a specific test file

```bash
./.roo/skills/test-suite-management/scripts/check-user-centric.sh src/test/__tests__/describe-content/labels-and-metadata.test.ts
```

### Example 3: Generating coverage by feature set

```bash
./.roo/skills/test-suite-management/scripts/coverage-by-feature.sh
```

## Troubleshooting / edge cases

- **Test failures due to missing fixtures** – Ensure the `.Images iiif test/` directory exists and contains the expected real‑world data.
- **IDEAL OUTCOME / FAILURE PREVENTED pattern mismatch** – The pattern is defined in [src/test/__tests__/README.md](src/test/__tests__/README.md) lines 190‑206. Use the exact wording “IDEAL OUTCOME:” and “FAILURE PREVENTED:” in test descriptions.
- **Coverage reporting zero for a feature set** – Verify that the feature set directory contains `.test.ts` files and that Vitest’s `include` pattern matches them.
- **Script permissions** – If scripts are not executable, run `chmod +x .roo/skills/test-suite-management/scripts/*.sh`.

## Files in this skill

- **SKILL.md** – This entrypoint.
- **[references/running-tests.md](references/running-tests.md)** – Detailed instructions for running tests by feature set, with npm command examples.
- **[references/user-goal-matrix.md](references/user-goal-matrix.md)** – Mapping of each feature set to its user goals, achievements, and example test files.
- **[scripts/check-user-centric.sh](scripts/check-user-centric.sh)** – Shell script that scans a test file for IDEAL OUTCOME / FAILURE PREVENTED patterns.
- **[scripts/coverage-by-feature.sh](scripts/coverage-by-feature.sh)** – Generates a coverage report grouped by the eight feature sets.
- **[scripts/generate-test-docs.sh](scripts/generate-test-docs.sh)** – Creates a markdown summary of test philosophy and organization.

## Success criteria

The test suite is well‑managed when:

- All tests pass for each feature set.
- Every test file includes at least one IDEAL OUTCOME and one FAILURE PREVENTED scenario.
- Coverage reports show >80% line coverage for each user‑goal category.
- The test documentation (READMEs) accurately reflects the current structure and philosophy.
- New developers can answer “What does the user achieve?” by looking at the test directory structure.

---

*Skill last updated: 2026‑02‑01*  
*Based on test suite reorganization completed 2026‑01‑31*