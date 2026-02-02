# Running Tests by Feature Set

This reference details how to execute the IIIF Field Archive Studio test suite using the user‑centric feature‑set organization.

## Quick Reference: Feature Set Directories

The test suite is organized into eight feature sets (user‑goal directories):

| Feature Set | Directory | User Goal |
|-------------|-----------|-----------|
| Organize Media | `organize-media/` | Import field research media and organize it into structured collections |
| Describe Content | `describe-content/` | Add context and metadata to make research discoverable and meaningful |
| Validate Quality | `validate-quality/` | Ensure IIIF compliance and catch errors before sharing |
| Search and Find | `search-and-find/` | Quickly find content across large archives without manual browsing |
| Export and Share | `export-and-share/` | Turn field research archives into shareable formats for collaboration, publication, and preservation |
| Manage Lifecycle | `manage-lifecycle/` | Control storage, deletion, and application settings to maintain archives over time |
| View and Navigate | `view-and-navigate/` | Browse, inspect, and interact with research archives in a responsive, accessible viewer |
| Collaborate | `collaborate/` | Work together with other researchers on the same archive without conflicts or data loss |

## Running All Tests

```bash
npm test
```

Runs every test file matching `**/*.test.{ts,tsx}` (Vitest default). Use this for a full regression check.

## Running a Single Feature Set

Use the `--` argument to pass a directory pattern to Vitest:

```bash
npm test -- organize-media/
npm test -- describe-content/
npm test -- validate-quality/
npm test -- search-and-find/
npm test -- export-and-share/
npm test -- manage-lifecycle/
npm test -- view-and-navigate/
npm test -- collaborate/
```

The trailing slash is optional but helps avoid matching unrelated files.

## Running a Specific Test File

You can target a single test file within a feature set:

```bash
npm test -- organize-media/import-and-structure.test.ts
npm test -- describe-content/labels-and-metadata.test.ts
npm test -- validate-quality/iiifValidation.test.ts
```

## Running Tests Matching a Name Pattern

Vitest supports filtering by test name (describe/it strings). Use `-t` or `--testNamePattern`:

```bash
npm test -- -t "IDEAL OUTCOME"
npm test -- --testNamePattern "FAILURE PREVENTED"
```

This runs only tests whose description includes those phrases.

## Watch Mode

To run tests in watch mode (re‑run on file changes) for a specific feature set:

```bash
npm run test:watch -- organize-media/
```

If no `test:watch` script exists, you can run `vitest --watch` directly:

```bash
npx vitest --watch organize-media/
```

## Coverage Reports

Generate a coverage report for the entire suite:

```bash
npm run test:coverage
```

If the project uses Vitest’s built‑in coverage, you may need to set `coverage.enabled` in `vitest.config.ts`. The default output is in `coverage/`.

## Using the `scripts/coverage-by-feature.sh` Script

For a feature‑set‑grouped coverage report, execute:

```bash
./.roo/skills/test-suite-management/scripts/coverage-by-feature.sh
```

This script runs each feature set separately and aggregates coverage percentages.

## Common Issues

### “No test files found” for a Feature Set

- Verify the directory contains `.test.ts` or `.test.tsx` files.
- Check that the directory name matches exactly (case‑sensitive).
- Ensure Vitest’s `include` pattern in `vitest.config.ts` includes the directory.

### Tests Fail Due to Missing Fixtures

The test suite relies on real data from `.Images iiif test/`. If that directory is missing or moved, tests may fail with “file not found” errors.

Solution: Ensure the `.Images iiif test/` directory exists at the workspace root and contains the expected images and manifests.

### IDEAL OUTCOME / FAILURE PREVENTED Pattern Not Recognized

The test runner does not enforce these patterns; they are only documentation conventions. If you want to verify that tests contain these phrases, use the `scripts/check-user-centric.sh` script.

### Slow Test Runs

Some tests load large fixtures (real 214 MB archive). This is intentional to test performance and real‑world scenarios. To skip heavy tests during development, you can tag them and filter them out, but the default suite includes them.

## Integration with CI/CD

In CI pipelines, you may want to run tests per feature set in parallel. Example GitHub Actions step:

```yaml
- name: Test organize‑media
  run: npm test -- organize-media/
- name: Test describe‑content
  run: npm test -- describe-content/
# … etc.
```

## Summary

- The test suite is organized by **user goals**, not technical implementation.
- Use `npm test -- <feature‑set>/` to run a specific user‑goal category.
- Watch mode and coverage are supported via standard Vitest commands.
- Always verify that the real‑world data directory (`.Images iiif test/`) is present.

Refer to the main test suite README ([src/test/__tests__/README.md](src/test/__tests__/README.md)) for the full philosophy and mapping of user achievements to test files.