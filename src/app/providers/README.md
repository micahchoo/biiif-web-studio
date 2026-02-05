# App Providers (`src/app/providers/`)

Consolidates all context providers into a single entry point.

## Overview

The `AppProviders` component wraps the entire app with required context providers in the correct nesting order.

```typescript
import { AppProviders } from '@/src/app/providers';

export default function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
```

## Files

| File | Purpose |
|------|---------|
| `index.tsx` | `AppProviders` component - consolidates all providers |
| `useAppSettings.ts` | Hook for accessing app settings (template-level only) |
| `useTerminology.ts` | Hook for IIIF terminology based on abstraction level |

## Provider Hierarchy

Providers are nested in order of dependency. Inner providers can use outer providers; the reverse is not possible.

```
AppProviders (consolidation)
├── VaultProvider (state: IIIF entities)
│   └── ToastProvider (notifications)
│       └── ErrorBoundary (error handling)
│           └── UserIntentProvider (user intent: editing, viewing, etc.)
│               └── ResourceContextProvider (current resource state)
│                   └── Children (MainApp)
```

## Individual Providers

### VaultProvider

**Location:** `hooks/useIIIFEntity.tsx`

Manages normalized IIIF state. All IIIF data mutations go through the action system.

```typescript
const { state, dispatch, loadRoot, exportRoot } = useVault();
dispatch(action);
```

### ToastProvider

**Location:** `components/Toast.tsx`

Toast notification system.

```typescript
const { showToast } = useToast();
showToast('Success!', 'success');
```

### ErrorBoundary

**Location:** `components/ErrorBoundary.tsx`

Catches React errors and displays fallback UI.

### UserIntentProvider

**Location:** `hooks/useUserIntent.tsx`

Tracks user's current intent (editing, viewing, exporting, etc.) to enable context-aware UI.

```typescript
const { intent, setIntent, clearIntent } = useUserIntent();
setIntent('editing', { resourceId: 'manifest-1' });
```

**Intent types:**
- `viewing` — Passive consumption
- `editing` — Active editing
- `selecting` — Multi-selection
- `dragging` — Drag-and-drop
- `exporting` — Export flow
- `importing` — Import flow
- `validating` — QC checks
- `searching` — Search active
- `navigating` — Browsing
- `annotating` — Adding annotations
- `designing` — Board design
- `fieldMode` — High-contrast field mode
- `idle` — No specific intent

### ResourceContextProvider

**Location:** `hooks/useResourceContext.tsx`

Tracks current resource state (type, validation, edit history, collaboration).

```typescript
const { resourceType, isValid, validationErrors, editHistory } = useResourceContext();
```

## Template-Level Hooks

### useAppSettings

**ONLY use in templates, not in organisms.**

Returns app settings including fieldMode and abstractionLevel.

```typescript
import { useAppSettings } from '@/src/app/providers';

// Use in templates only
const { settings } = useAppSettings();
const { fieldMode, abstractionLevel } = settings;
```

### useTerminology

**ONLY use in templates, not in organisms.**

Returns terminology function based on abstraction level.

```typescript
import { useTerminology } from '@/src/app/providers';

// Use in templates only
const { t, isAdvanced } = useTerminology({ level: 'advanced' });
const label = t('manifest'); // Returns "Collection" or "Manifest" based on level
```

## Important: Hook Usage Restrictions

**Template hooks should ONLY be used by:**
- Templates (`FieldModeTemplate`, `BaseTemplate`)
- Pages/App root

**Organisms should NOT import these directly.** Instead, receive context via props from templates using the render props pattern.

```typescript
// ❌ WRONG: Organism importing hook
import { useAppSettings } from '@/src/app/providers';
const ArchiveView = () => {
  const { settings } = useAppSettings(); // ❌ Don't do this
  return <div>...</div>;
};

// ✅ CORRECT: Receive via props
interface ArchiveViewProps {
  cx: ContextualClassNames;
  fieldMode: boolean;
  t: (key: string) => string;
  isAdvanced: boolean;
}
const ArchiveView = ({ cx, fieldMode, t, isAdvanced }: ArchiveViewProps) => {
  return <div className={cx.surface}>...</div>;
};
```
