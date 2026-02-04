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

```typescript
// Automatically catches errors from children
// No hook needed - just renders error UI
```

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
const { resource, type, editHistory, recordEdit } = useResourceContext();
recordEdit();
```

## Rules

✅ **AppProviders CAN:**
- Consolidate multiple providers
- Control provider nesting order
- Re-export for app-wide access

❌ **AppProviders CANNOT:**
- Contain business logic
- Access feature-specific state
- Perform UI operations
- Know about routes or features

## Adding New Providers

To add a new global context provider:

1. Create/import the provider component
2. Add it to `AppProviders` in the correct nesting order
3. Document its purpose and usage in this README
4. Update the "Provider Hierarchy" diagram

**Nesting order considerations:**
- Providers that others depend on go first (outermost)
- Independent providers can go anywhere
- Providers that many components use should be early (to minimize re-renders lower in tree)

## See Also

- `../templates/` — Layouts that receive app context
- `../routes/` — Route dispatcher
- `../README.md` — App layer overview
