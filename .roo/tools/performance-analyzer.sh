#!/bin/bash
# Performance Analyzer Script
# Quickly finds performance issues in the codebase

echo "=== IIIF Field Archive Studio - Performance Analysis ==="
echo ""

# Count inline arrow functions in JSX
echo "📊 INLINE ARROW FUNCTIONS (creates new references each render):"
echo "   Components with most inline handlers:"
grep -r "onClick={.*=>" components/ --include="*.tsx" | wc -l | xargs echo "   Total onClick inline:"
grep -r "onChange={.*=>" components/ --include="*.tsx" | wc -l | xargs echo "   Total onChange inline:"
grep -r "onSelect={.*=>" components/ --include="*.tsx" | wc -l | xargs echo "   Total onSelect inline:"
echo ""

# Find missing useMemo on expensive operations
echo "📊 EXPENSIVE OPERATIONS (may need useMemo):"
grep -rn "\.filter(.*=>.*)\.map(" components/ --include="*.tsx" | head -5
grep -rn "\.sort(.*=>.*)" components/ --include="*.tsx" | head -5
grep -rn "reduce(" components/ --include="*.tsx" | head -5
echo ""

# Find components that could use React.memo
echo "📊 SIMPLE COMPONENTS (React.memo candidates):"
grep -rl "export const.*=>" components/ --include="*.tsx" | head -10
echo ""

# Find Context providers that might need memoization
echo "📊 CONTEXT PROVIDERS (check for memoization):"
grep -rn "\.Provider value={" components/ --include="*.tsx" | head -5
echo ""

# Images without lazy loading
echo "📊 IMAGES (check for lazy loading):"
grep -rn "<img" components/ --include="*.tsx" | grep -v "loading=" | wc -l | xargs echo "   Images without loading attribute:"
echo ""

# Large components that might benefit from code splitting
echo "📊 LARGE COMPONENTS (code splitting candidates):"
find components/ -name "*.tsx" -exec wc -l {} \; | sort -rn | head -10
echo ""

echo "=== Analysis Complete ==="
