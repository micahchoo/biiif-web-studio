# Atomic System Architecture: Design Systems, Not Pages


**Core Philosophy:** *"We do not design pages, we design component systems"*. The interface is a hierarchical composition of design tokens, atoms, molecules, organisms, templates, and pages—each layer strictly composing from the layers below.

---

## 1. The Atomic Hierarchy: Five Levels of Composition

```text
PAGES (Routes)
└── TEMPLATES (Layout Context Providers)
    └── ORGANISMS (Feature-Domain Components)
        └── MOLECULES (Composable UI Units)
            └── ATOMS (Primitives)
                └── DESIGN TOKENS (Contextual Values)
```

### 1.1 Layer Definitions & Code Locations

| Level | Responsibility | Code Location | Current State |
|-------|---------------|---------------|---------------|
| **Design Tokens** | Semantic values (colors, spacing, terminology) | `designSystem.ts`, `i18n/locales/` | ✅ **Live** — CONTEXTUAL_TOKENS |
| **Atoms** | Indivisible UI primitives | `ui/primitives/` (Button, Input, Icon) | ✅ **Live** — Zero business logic |
| **Molecules** | Composed atoms with local state | `ui/molecules/` (SearchField, FilterPill) | ❌ **Missing** — Causing prop-drilling |
| **Organisms** | Complex domain-specific sections | `features/*/ui/` (ArchiveGrid, BoardCanvas) | ⚠️ **Mixed** — Currently in `views/` |
| **Templates** | Layout + Context provision | `templates/` (FieldModeTemplate) | ⚠️ **Implicit** — Currently in Provider order |
| **Pages** | Route-specific instantiation | `pages/` or `ViewRouter` | ✅ **Live** — View components |

### 1.2 Key Principle: Hierarchical Composition

**"Nest components in other components"*. Each layer consumes only from its own layer or below:

- **Atoms** use Design Tokens (values only)
- **Molecules** compose Atoms + local UI state
- **Organisms** compose Molecules + domain hooks
- **Templates** compose Organisms + Context providers
- **Pages** compose Templates + data fetching

**Anti-pattern:** Atoms accessing `useAppSettings()` directly; Organisms receiving primitive props instead of composed Molecules.

---
To note the script in scripts/audit-props.ts may be useful but likely not
## 2. Infrastructure Mapping to Atomic Levels

### 2.1 Design Tokens: The Sub-Atomic Layer

Your existing `CONTEXTUAL_TOKENS` and `useContextualStyles` form the **Design Token** layer—variables that define visual properties independent of components.

```typescript
// DESIGN TOKEN (not a component)
const contextualTokens = {
  surface: {
    fieldMode: 'bg-slate-900 border-slate-800',
    standard: 'bg-white border-slate-200'
  },
  terminology: {
    simple: { Collection: 'Album', Manifest: 'Item Group' },
    advanced: { Collection: 'Collection', Manifest: 'Manifest' }
  }
}
```

**Rule:** Tokens are values, not components. They feed into Atoms via Theme Providers.

### 2.2 Atoms: `ui/primitives/`

**Current Implementation:** ✅ **Aligned**
- Zero business logic
- Props-driven (no hooks)
- Variants via props, not context

```typescript
// ATOM: Pure, token-driven styling
const Button = ({ variant, size, children }) => {
  // Uses static tokens, not useContextualStyles
  const className = tokenToClassName(variant); 
  return <button className={className}>{children}</button>;
};
```

### 2.3 Molecules: The Missing Layer (Critical Gap)

**Problem:** Your architecture jumps from Atoms directly to Organisms (Views), causing the **13.8% prop-drilling reduction** failure[^TaskTracker^].

**Solution:** Introduce `ui/molecules/` for composite units:

```typescript
// MOLECULE: Composes atoms + local UI state
const SearchField = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebouncedValue(value); // Hook extraction pattern
  
  return (
    <div className="flex gap-2">
      <Icon name="search" className={cx.label} /> {/* Atom */}
      <Input 
        value={value} 
        onChange={setValue} 
        placeholder={placeholder} 
      /> {/* Atom */}
    </div>
  );
};
```

**Impact:** Eliminates `fieldMode` prop-drilling by composing context-aware molecules rather than passing props through organism hierarchies.

### 2.4 Organisms: Feature-Domain Components

**Current State:** Views (ArchiveView, BoardView) mix organism and page responsibilities.

**Refactored Structure:**
```
features/archive/
├── ui/
│   ├── organisms/
│   │   ├── ArchiveGrid.tsx      // Data grid (complex, no page logic)
│   │   ├── ArchiveHeader.tsx    // Toolbar + search (composes molecules)
│   │   └── ArchiveEmptyState.tsx
│   └── molecules/               // Feature-specific molecules
├── model/                       // Business logic (current Service layer)
└── index.ts                     // Public API
```

**Rule:** Organisms use domain hooks (`useMetadataEditor`) but **never** route-level context (`useAppSettings` should be consumed at Template level).

### 2.5 Templates: Context Boundaries

**Current Issue:** Split-context providers (`UserIntentProvider`, `ResourceContextProvider`) are mounted globally, causing over-engineering[^Critique^].

**Atomic Design Solution:** Templates are **layout-specific context providers**:

```typescript
// TEMPLATE: Provides context to child organisms
const FieldModeTemplate = ({ children, mode, abstractionLevel }) => {
  const cx = useContextualStyles(mode);
  const { t, isAdvanced } = useTerminology({ level: abstractionLevel });
  
  return (
    <UIStateProvider mode={mode} terminology={t}>
      <div className={cx.surface}>
        {children({ cx, t, isAdvanced })} // Render prop pattern
      </div>
    </UIStateProvider>
  );
};
```

**Usage:**
```typescript
// PAGE: Composes template with organisms
<Page>
  <FieldModeTemplate mode="field" abstractionLevel="simple">
    {({ cx, t }) => (
      <ArchiveGrid 
        terminology={t} 
        styles={cx} 
        organisms={ArchiveOrganisms}
      />
    )}
  </FieldModeTemplate>
</Page>
```

**Benefit:** Consolidates the "Context Layer" into explicit Template components, achieving the **90% prop-drilling reduction** target by injecting context at the layout level.

### 2.6 Pages: Route Instances

**Responsibility:** Data fetching, route parameters, analytics.

**No Logic Rule:** Pages contain zero business logic—only composition of Templates with data.

---

## 3. Integration with Feature-Sliced Design (FSD)

Modern atomic implementations combine Atomic Design (UI hierarchy) with Feature-Sliced Design (domain boundaries) to address the "Frontend is not just design" critique.

### 3.1 Cross-Cutting Architecture

```
src/
├── shared/
│   ├── ui/                      // Atoms & Molecules (global)
│   ├── lib/                     // Hooks (useDebouncedValue, etc)
│   └── config/                  // Design tokens
├── entities/                    // Domain models (IIIF resources)
│   ├── canvas/
│   ├── manifest/
│   └── collection/
├── features/                    // User scenarios
│   ├── archive-view/
│   ├── board-design/
│   └── metadata-edit/
├── widgets/                     // Organisms composed for specific slots
└── app/                         // Templates, providers, routing
```

**Dependency Rule:** 
- Atoms/Molecules (shared) ← Organisms (features/entities) ← Templates (app) ← Pages (app)
- **No upward dependencies**

### 3.2 The Context-Service Boundary

Your existing **Service Layer** (Vault, Actions) maps to FSD's **Entities/Features** layers:

| Current Layer | FSD Layer | Atomic Level |
|---------------|-----------|--------------|
| `services/vault.ts` | `entities/*/model/` | Data layer |
| `services/actions.ts` | `features/*/model/` | Business logic |
| `hooks/useUserIntent.tsx` | `app/providers/` | Template context |
| `components/ArchiveView.tsx` | `features/archive/ui/organisms/` | Organism |

---

## 4. Migration Path: From Current State to Atomic System

### 4.1 Phase 1: Establish Molecules (Weeks 1-2)

**Goal:** Address the 50 remaining `fieldMode` prop usages.

**Actions:**
1. Create `ui/molecules/` directory
2. Extract repeated Atom compositions:
   - `SearchField` (Icon + Input + useDebouncedValue)
   - `ResourceTypeBadge` (Icon + Label + useTerminology)
   - `FieldModeToggle` (Button group + useAppSettings)
3. Replace prop-drilled instances with Molecules

**Success Metric:** Prop-drilling reduction from 13.8% to ≥70%.

### 4.2 Phase 2: Template Extraction (Weeks 3-4)

**Goal:** Consolidate split-context providers into explicit Templates.

**Actions:**
1. Create `templates/FieldModeTemplate.tsx`
2. Migrate `UserIntentProvider` + `ResourceContextProvider` logic into Template render props
3. Refactor Views to receive `cx` and `t` via props from Template, not hooks

**Success Metric:** Zero hook calls in Atom/Organism layers; context isolated to Templates.

### 4.3 Phase 3: Feature Isolation (Weeks 5-6)

**Goal:** Achieve 100% terminology coverage and 95% consistency.

**Actions:**
1. Move View components to `features/*/ui/organisms/`
2. Remove IIIF term strings from all levels below Pages—pass via `t()` from Template
3. Implement Progressive Disclosure gates (`isAdvanced`) at Template level, not scattered in organisms

**Success Metric:** 100% IIIF terms via `t()`; 0 hardcoded strings in organisms.

### 4.4 Phase 4: Performance Validation

**Goal:** Validate <50ms paint time after context changes.

**Actions:**
1. Templates memoize `cx` and `t` objects
2. Organisms use `React.memo` comparing only data props (not context)
3. Run `performance-analyzer.sh` to verify no inline arrow functions in molecules

---

## 5. Quality Gates (Atomic Constraints)

| Level | Constraint | Enforcement |
|-------|-----------|-------------|
| **Atoms** | No hook calls; only props + tokens | ESLint rule: `no-restricted-imports` for React hooks |
| **Molecules** | Local state only (useState, useDebouncedValue); no domain logic | Code review checklist |
| **Organisms** | Domain hooks allowed; no routing context | TypeScript: Cannot import from `app/` layer |
| **Templates** | Context providers only; no data fetching | File location: `app/templates/` only |
| **Pages** | Composition only; max 50 lines | Lint rule: `max-lines` |

---

## 6. Conclusion

The existing architecture provides the **infrastructure** (hooks, tokens, contexts) but lacks the **composition hierarchy** to achieve the simplification goals. By introducing the **Molecule** layer and elevating **Templates** to explicit context boundaries, the system achieves:

1. **True Atomic hierarchy** — No layer skipping (Atoms → Molecules → Organisms → Templates → Pages)
2. **Elimination of prop-drilling** — Context injected at Template level, consumed via composition
3. **Feature scalability** — Domain boundaries prevent "flat folder" chaos
4. **The 95% consistency target** — Standardized molecules ensure uniform UX without configuration hell

**The guiding principle:** *Build systems, not pages.* Each component exists as part of a composable hierarchy where complexity increases with elevation, but reusability decreases—intentionally.

---
*Document Version: 5.0 (Atomic Consolidation)*  
