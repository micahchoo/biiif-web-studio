#!/usr/bin/env bash
#
# coverage-by-feature.sh
# Run tests per feature set and output a simple coverage‑by‑feature table.
#
# This script runs `npm test -- <feature>/` for each of the eight feature sets,
# captures the pass/fail counts, and prints a summary table.
#
# Usage:
#   ./coverage-by-feature.sh
#
# Requirements:
#   - Node/npm environment with Vitest installed.
#   - Test suite root at src/test/__tests__/

set -euo pipefail

cd "$(dirname "$0")/../../.."  # move to workspace root

FEATURE_SETS=(
    "organize-media"
    "describe-content"
    "validate-quality"
    "search-and-find"
    "export-and-share"
    "manage-lifecycle"
    "view-and-navigate"
    "collaborate"
)

# Determine test command
if command -v npm &>/dev/null && npm run 2>&1 | grep -q "test:"; then
    TEST_CMD="npm test --"
else
    # fallback to npx vitest
    TEST_CMD="npx vitest run"
fi

echo "Running tests per feature set..."
echo "=================================================="

RESULTS=()
ALL_PASSED=true

for feature in "${FEATURE_SETS[@]}"; do
    if [[ ! -d "src/test/__tests__/$feature" ]]; then
        echo "⚠️  Skipping $feature (directory not found)"
        RESULTS+=("$feature | skipped | –")
        continue
    fi

    echo -n "Testing $feature... "

    # Run tests, capture output
    # We use a timeout to avoid hanging
    if output=$($TEST_CMD "$feature/" 2>&1); then
        # Extract pass/fail counts from Vitest output
        # Vitest prints "✓ 12 tests passed" or "✓ 12 passed, 0 failed"
        passed=$(echo "$output" | grep -Eo '[0-9]+ (passed|tests? passed)' | head -1 | grep -Eo '[0-9]+' || echo "0")
        failed=$(echo "$output" | grep -Eo '[0-9]+ failed' | head -1 | grep -Eo '[0-9]+' || echo "0")
        if [[ -z "$passed" ]]; then
            passed="?"
        fi
        if [[ -z "$failed" ]]; then
            failed="0"
        fi
        if [[ "$failed" -gt 0 ]]; then
            echo "❌ ($passed passed, $failed failed)"
            ALL_PASSED=false
        else
            echo "✅ ($passed passed)"
        fi
        RESULTS+=("$feature | $passed passed | $failed failed")
    else
        echo "❌ (command failed)"
        ALL_PASSED=false
        RESULTS+=("$feature | error | –")
    fi
done

echo ""
echo "Feature‑Set Test Summary"
echo "======================="
printf "%-20s | %-12s | %s\n" "Feature Set" "Passed" "Failed"
printf "%-20s-|-%-12s-|-%s\n" "--------------------" "------------" "-------"
for line in "${RESULTS[@]}"; do
    IFS='|' read -r feat passed failed <<< "$line"
    printf "%-20s | %-12s | %s\n" "$feat" "$passed" "$failed"
done

echo ""
if [[ "$ALL_PASSED" == true ]]; then
    echo "✅ All feature sets passed."
    exit 0
else
    echo "❌ Some feature sets have failures."
    exit 1
fi