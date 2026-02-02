#!/usr/bin/env bash
#
# check-user-centric.sh
# Scan a test file for IDEAL OUTCOME / FAILURE PREVENTED patterns.
#
# Usage:
#   ./check-user-centric.sh <test-file>
#
# Outputs:
#   - Lists each test block that contains (or lacks) the patterns.
#   - Returns exit code 0 if all test blocks have both patterns,
#     1 otherwise.

set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Error: test file path required."
    echo "Usage: $0 <test-file>"
    exit 2
fi

TEST_FILE="$1"

if [[ ! -f "$TEST_FILE" ]]; then
    echo "Error: file '$TEST_FILE' not found."
    exit 2
fi

# Extract test blocks (describe/it) and check for keywords.
# We'll use a simple state machine to track inside a test block.
# This script assumes the test file follows the pattern:
#   describe('...', () => {
#     it('IDEAL OUTCOME: ...', () => { ... });
#     it('FAILURE PREVENTED: ...', () => { ... });
#   });

echo "Checking $TEST_FILE for user‑centric patterns..."
echo "=================================================="

ALL_GOOD=true
CURRENT_DESCRIBE=""
INSIDE_DESCRIBE=false
TEST_COUNT=0
HAS_IDEAL=false
HAS_FAILURE=false

while IFS= read -r line; do
    # Detect describe block start
    if [[ "$line" =~ ^[[:space:]]*describe\( ]]; then
        CURRENT_DESCRIBE="$line"
        INSIDE_DESCRIBE=true
        HAS_IDEAL=false
        HAS_FAILURE=false
        TEST_COUNT=0
    fi
    # Detect describe block end (closing brace)
    if [[ "$INSIDE_DESCRIBE" == true && "$line" =~ ^[[:space:]]*}\)\;? ]]; then
        if [[ "$TEST_COUNT" -gt 0 ]]; then
            if [[ "$HAS_IDEAL" == false || "$HAS_FAILURE" == false ]]; then
                echo "❌ $CURRENT_DESCRIBE"
                echo "   Missing:"
                [[ "$HAS_IDEAL" == false ]] && echo "    - IDEAL OUTCOME"
                [[ "$HAS_FAILURE" == false ]] && echo "    - FAILURE of Action"
                ALL_GOOD=false
            else
                echo "✅ $CURRENT_DESCRIBE"
                echo "   Contains both IDEAL OUTCOME and FAILURE of Action."
            fi
        fi
        INSIDE_DESCRIBE=false
        CURRENT_DESCRIBE=""
    fi
    # Inside describe, look for it() blocks
    if [[ "$INSIDE_DESCRIBE" == true && "$line" =~ ^[[:space:]]*it\( ]]; then
        ((TEST_COUNT++))
        if [[ "$line" =~ \"IDEAL\ OUTCOME: ]]; then
            HAS_IDEAL=true
        fi
        if [[ "$line" =~ \"FAILURE\ PREVENTED: ]]; then
            HAS_FAILURE=true
        fi
    fi
done < "$TEST_FILE"

echo "=================================================="
if [[ "$ALL_GOOD" == true ]]; then
    echo "✅ All test blocks contain IDEAL OUTCOME and FAILURE PREVENTED."
    exit 0
else
    echo "❌ Some test blocks are missing user‑centric patterns."
    echo "   Refer to the test suite README for the expected structure."
    exit 1
fi