# ESLint Enhancements for Atomic Design + FSD Architecture

## Overview

This document describes the comprehensive ESLint enhancements implemented to enforce strict adherence to Atomic Design + Feature-Sliced Design (FSD) architecture.

## Implementation Summary

### Phase 1: P0 Priority Rules (Critical)

All P0 priority rules have been implemented and are active.

#### 1. Enhanced Atom Hook Blocking
**Location:** `eslint.config.js` - Atom Layer Constraints section

**Rules:**
- Blocks ALL React hooks in atoms (not just useState, useEffect)
- Complete list: `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, `useRef`, `useLayoutEffect`, `useImperativeHandle`, `useDebugValue`, `useDeferredValue`, `useTransition`, `useId`, `useSyncExternalStore`, `useInsertionEffect`
- Blocks namespace imports like `React.useState` via `no-restricted-syntax`
- Blocks all custom hooks via pattern matching (`**/use*`)

**Error Messages:**
- `[ARCHITECTURE-VIOLATION] Atoms must be pure functions with zero hooks. Move stateful logic to a Molecule.`

#### 2. Page Max-Lines Rule (50 Lines)
**Location:** `eslint.config.js` - Page Layer Constraints section

**Rules:**
- Applies to files in: `src/pages/`, `src/app/pages/`, `src/app/routes/`, `**/Page.tsx`
- Maximum 50 lines (skipping blank lines and comments)
- Also blocks hooks in pages (composition only)

**Error Messages:**
- `[ARCHITECTURE-VIOLATION] Pages must be composition-only (<50 lines, zero hooks). State/effects belong in Templates or Organisms.`

#### 3. Domain Import Blocking in Atoms
**Location:** `eslint.config.js` - Atom Layer Constraints section

**Rules:**
- Prevents atoms from importing from:
  - `@/services/*`, `@/services/**`
  - `@/features/*`, `@/features/**`
  - `@/entities/*`, `@/entities/**`
  - `@/widgets/*`, `@/widgets/**`
  - `@/app/*`, `@/app/**`

**Error Messages:**
- `[FSD-VIOLATION] Atoms cannot import domain logic (services/features/entities). They are UI primitives only — use props and design tokens.`

#### 4. Molecule-to-Molecule Import Blocking
**Location:** `eslint.config.js` - Molecule Layer Constraints section

**Rules:**
- Prevents molecules from importing other molecules
- Molecules should only compose atoms
- Parent organisms should compose multiple molecules
- Blocks: `@/src/shared/ui/molecules/**`, `**/molecules/*`, `../molecules/**`

**Error Messages:**
- `[ARCHITECTURE-VIOLATION] Molecules cannot import other molecules. Import from @/src/shared/ui/atoms/ or compose at organism level.`

### Phase 2: P1 Priority Rules

All P1 priority rules have been implemented.

#### 1. Hardcoded Color Detection
**Location:** `eslint.config.js` - Design Token Enforcement section

**Rules:**
- Warns about Tailwind color classes: `bg-slate-*`, `text-blue-*`, etc.
- Warns about hardcoded hex colors: `#fff`, `#000000`
- Warns about hardcoded RGB colors: `rgb(255, 0, 0)`
- Warns about hardcoded pixel values: `16px`
- Warns about hardcoded timing values: `300ms`

**Error Messages:**
- `[DESIGN-TOKEN] Use design tokens (cx.*) from ContextualClassNames or COLORS from designSystem.ts instead of hardcoded Tailwind colors.`

#### 2. Enhanced FSD Dependency Rules
**Location:** `eslint.config.js` - Multiple layer sections

**Rules:**
- Better error messages with layer violation indicators
- Block relative imports that escape layer boundaries
- Prevent cross-feature imports with improved messaging
- All violations now include `[FSD-VIOLATION]` prefix for easy identification

**Affected Layers:**
- Shared layer: Cannot import from features, app, widgets, entities
- Features layer: Cannot import from other features, app
- Entities layer: Cannot import from features, app, widgets
- Widgets layer: Cannot import from app

### Phase 3: P2/P3 Custom Rules

Custom ESLint plugin created at `eslint-rules/`.

#### Plugin Structure
```
eslint-rules/
├── package.json              # Plugin metadata
├── index.js                  # Plugin entry point with configs
└── rules/
    ├── molecule-props-validation.js    # P2: Enforce cx? and fieldMode? props
    ├── useeffect-restrictions.js       # P3: Detect useEffect calling external services
    └── template-constraints.js         # P2: Enforce templates are context providers only
```

#### 1. Molecule Props Validation (P2)
**Rule:** `@field-studio/molecule-props-validation`

**Purpose:** Ensures molecules accept optional `cx` and `fieldMode` props for contextual styling.

**Checks:**
- Analyzes Props interfaces in molecule files
- Warns if `cx?: ContextualClassNames` is missing
- Warns if `fieldMode?: boolean` is missing
- Configurable exceptions list (e.g., `index.ts`)

**Error Messages:**
- `[ARCHITECTURE] Molecule {name} should accept optional cx prop for contextual styling.`
- `[ARCHITECTURE] Molecule {name} should accept optional fieldMode prop for high-contrast support.`

#### 2. useEffect Restrictions (P3)
**Rule:** `@field-studio/useeffect-restrictions`

**Purpose:** Detects useEffect in molecules that calls external services.

**Checks:**
- Flags useEffect calling fetch, load, get, save, update, delete, create, api, request
- Flags async useEffect functions
- Flags calls to service-like objects (ending in Service, Api, Client, Store)

**Error Messages:**
- `[ARCHITECTURE] useEffect in molecules should not call external services ({callee}). Move to organism or use props callback.`

#### 3. Template Constraints (P2)
**Rule:** `@field-studio/template-constraints`

**Purpose:** Enforces templates are context providers only.

**Checks:**
- Blocks data fetching in useEffect
- Blocks service imports
- Blocks data-related hooks (containing Data, Fetch, Load, Query, Mutation)

**Error Messages:**
- `[ARCHITECTURE] Templates should not fetch data. Data fetching belongs in Organisms. Move {name} call to an organism.`

## Configuration

### Activating Custom Rules

The custom rules are automatically configured in `eslint.config.js`:

```javascript
// Molecules use P2/P3 rules
{
  files: ['src/shared/ui/molecules/**/*.{ts,tsx}', 'src/features/*/ui/molecules/**/*.{ts,tsx}'],
  plugins: {
    '@field-studio': fieldStudioPlugin,
  },
  rules: {
    '@field-studio/molecule-props-validation': 'warn',
    '@field-studio/useeffect-restrictions': 'error',
  },
},

// Templates use P2 rules
{
  files: ['src/app/templates/**/*.{ts,tsx}'],
  plugins: {
    '@field-studio': fieldStudioPlugin,
  },
  rules: {
    '@field-studio/template-constraints': 'error',
  },
}
```

### Running the Linter

```bash
# Run all rules
npm run lint

# Run with custom rules only (for testing)
npx eslint src/shared/ui/molecules --rulesdir eslint-rules/rules
```

## Validation Results

### Current Status
- **Total Issues:** 2226 (653 errors, 1573 warnings)
- **Architectural Violations:** 0 new violations introduced
- **Custom Rules:** Active and functioning

### Architectural Compliance
The codebase is compliant with all new P0 rules:
- ✅ No hooks in atoms
- ✅ No molecule-to-molecule imports detected
- ✅ No domain imports in atoms
- ✅ No page-level architectural violations

### Legacy Issues
Existing warnings/errors are primarily:
- TypeScript `any` types (not architectural)
- Unused variables (not architectural)
- Event handler naming conventions (style preference)

## Rule Priority Summary

| Priority | Rule | Status | Location |
|----------|------|--------|----------|
| P0 | Enhanced Atom Hook Blocking | ✅ Implemented | `eslint.config.js` |
| P0 | Page Max-Lines (50) | ✅ Implemented | `eslint.config.js` |
| P0 | Domain Import Blocking in Atoms | ✅ Implemented | `eslint.config.js` |
| P0 | Molecule-to-Molecule Import Blocking | ✅ Implemented | `eslint.config.js` |
| P1 | Hardcoded Color Detection | ✅ Implemented | `eslint.config.js` |
| P1 | Enhanced FSD Dependency Messages | ✅ Implemented | `eslint.config.js` |
| P2 | Molecule Prop Validation | ✅ Implemented | `eslint-rules/` |
| P2 | Template Constraints | ✅ Implemented | `eslint-rules/` |
| P3 | useEffect Restrictions | ✅ Implemented | `eslint-rules/` |

## Maintenance

### Adding New Hooks to Block

To add a new hook to the atom blocking list:

1. Add to `REACT_HOOKS` constant in `eslint.config.js`
2. The import restriction and id-denylist will automatically update

### Customizing Rule Severity

Edit `eslint.config.js` to change rule severity:

```javascript
// Change from 'error' to 'warn'
'@field-studio/molecule-props-validation': 'warn',

// Disable a rule
'@field-studio/useeffect-restrictions': 'off',
```

## Future Enhancements

Potential future additions:
1. **Design Token Plugin (P3):** Custom rule to enforce specific design token usage patterns
2. **Widget Composition Validation:** Ensure widgets only compose organisms
3. **Feature Isolation Enforcement:** Automated cross-feature import detection
4. **Test Architecture Rules:** Enforce test file location and structure

## References

- [Atomic Design Documentation](./Atomic%20System%20Architecture.md)
- [FSD Documentation](https://feature-sliced.design/)
- [ESLint Custom Rules Guide](https://eslint.org/docs/latest/extend/custom-rules)
