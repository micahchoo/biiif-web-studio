#!/usr/bin/env bash
#
# generate-test-docs.sh
# Generate a markdown summary of the test suite philosophy and organization.
#
# This script reads the main README and feature‑set READMEs to produce
# a consolidated documentation file suitable for sharing or auditing.
#
# Usage:
#   ./generate-test-docs.sh [output-path]
#
# Default output: /tmp/test-suite-summary-$(date +%Y%m%d).md
# You can specify a custom output path.

set -euo pipefail

cd "$(dirname "$0")/../../.."  # workspace root

OUTPUT="${1:-/tmp/test-suite-summary-$(date +%Y%m%d).md}"

SUITE_ROOT="src/test/__tests__"
MAIN_README="$SUITE_ROOT/README.md"
REORG_FILE="$SUITE_ROOT/TEST_SUITE_REORGANIZATION.md"

if [[ ! -d "$SUITE_ROOT" ]]; then
    echo "Error: test suite root $SUITE_ROOT not found." >&2
    exit 1
fi

echo "Generating test suite documentation to $OUTPUT ..."

{
    echo "# IIIF Field Archive Studio – Test Suite Documentation"
    echo ""
    echo "Generated on $(date -u +'%Y‑%m‑d %H:%M UTC')"
    echo ""
    echo "## Overview"
    echo ""
    echo "The test suite is organized by **user goals (feature sets)** rather than technical implementation."
    echo "Each directory represents a capability that field researchers need, and each test simulates actual"
    echo "app actions, interactions, and reactions using real data from \`.Images iiif test/\`."
    echo ""
    echo "## Philosophy"
    echo ""
    echo "Tests define **IDEAL OUTCOME** (what success looks like for the app's aspirations) and"
    echo "**FAILURE PREVENTED** (what the app is trying to avoid/prevent)."
    echo ""
    echo "## Feature Sets"
    echo ""
    # Extract feature set table from main README (lines 13‑173)
    if [[ -f "$MAIN_README" ]]; then
        echo "The eight feature sets are:"
        echo ""
        # We'll just list them; a more advanced script could parse the README sections.
        cat << 'EOF'
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
EOF
    else
        echo "(Main README not found)"
    fi
    echo ""
    echo "## Test Structure"
    echo ""
    echo "Each test file follows this pattern:"
    echo '```typescript'
    echo "describe('User Goal: What users achieve', () => {"
    echo "  describe('User Interaction: How users trigger', () => {"
    echo "    it('IDEAL OUTCOME: Success looks like...', () => {"
    echo "      // Test with real data"
    echo "    });"
    echo ""
    echo "    it('FAILURE PREVENTED: App prevents...', () => {"
    echo "      // Test error handling"
    echo "    });"
    echo "  });"
    echo "});"
    echo '```'
    echo ""
    echo "## Coverage by Feature Set"
    echo ""
    # Count test files per feature set
    echo "| Feature Set | Test Files | Example Tests |"
    echo "|-------------|------------|---------------|"
    for dir in "$SUITE_ROOT"/*/; do
        if [[ -d "$dir" ]]; then
            feat=$(basename "$dir")
            count=$(find "$dir" -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
            examples=$(find "$dir" -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | head -2 | xargs basename -a 2>/dev/null | tr '\n' ',' | sed 's/,$//; s/,/, /g')
            if [[ -z "$examples" ]]; then
                examples="–"
            fi
            echo "| $feat | $count | $examples |"
        fi
    done
    # Root‑level test files
    root_count=$(find "$SUITE_ROOT" -maxdepth 1 -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
    if [[ "$root_count" -gt 0 ]]; then
        root_examples=$(find "$SUITE_ROOT" -maxdepth 1 -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | head -2 | xargs basename -a 2>/dev/null | tr '\n' ',' | sed 's/,$//; s/,/, /g')
        echo "| (root) | $root_count | $root_examples |"
    fi
    echo ""
    echo "## Running Tests"
    echo ""
    echo "Tests can be run per feature set:"
    echo '```bash'
    echo "npm test -- organize-media/"
    echo "npm test -- describe-content/"
    echo "# ... etc."
    echo '```'
    echo ""
    echo "## Recent Reorganization"
    echo ""
    if [[ -f "$REORG_FILE" ]]; then
        # Extract the first 20 lines of the reorganization file for summary
        echo "The test suite was reorganized from technical‑focused to user‑goal‑focused on 2026‑01‑31."
        echo "For details, see [$REORG_FILE]($REORG_FILE)."
    else
        echo "(Reorganization document not found)"
    fi
    echo ""
    echo "## Key Principles"
    echo ""
    echo "1. **User‑centric** – Tests answer “What does the user achieve?”"
    echo "2. **Real data** – Tests use real images from \`.Images iiif test/\`."
    echo "3. **IDEAL OUTCOME / FAILURE PREVENTED** – Every test defines success and prevention."
    echo "4. **Self‑documenting** – Directory names and READMEs explain user value."
    echo "5. **Feature‑complete** – All related user goals grouped together."
    echo ""
    echo "## Next Steps for Maintenance"
    echo ""
    echo "- Ensure each feature set README is complete and up‑to‑date."
    echo "- Add tests for any missing user achievements (see user‑goal matrix)."
    echo "- Verify that all tests include IDEAL OUTCOME and FAILURE PREVENTED blocks."
    echo "- Keep coverage above 80% per feature set."
    echo ""
    echo "---"
    echo ""
    echo "*This document was generated by the \`generate-test-docs.sh\` script from the test‑suite‑management skill.*"
} > "$OUTPUT"

echo "✅ Documentation written to $OUTPUT"
echo ""
echo "To view:"
echo "  cat $OUTPUT | less"
echo ""
echo "To copy into the project docs:"
echo "  cp $OUTPUT docs/test-suite-summary.md"