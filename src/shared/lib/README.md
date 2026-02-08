# Shared Library (`src/shared/lib/`)

The **shared library** exports generic hooks and utilities that have zero domain knowledge. These hooks can be used by any feature, organism, or molecule in the application.

## Philosophy

**"Generic, reusable, domain-agnostic."**

Hooks in this directory:
- Are UI-focused or utility-focused
- Have no knowledge of IIIF, manifests, canvases, or archives
- Work in any React context
- Can be composed into molecules or used directly in organisms

## What Belongs Here

### ✅ CORRECT: Add to shared/lib

| Hook | Purpose | Example Use |
|------|---------|-------------|
| `useContextualStyles` | Get fieldMode-aware CSS classes | **Templates/Organisms only** (pass `cx` to molecules via props) |
| `useAppSettings` | Access user preferences (fieldMode, abstractionLevel) | **Templates only** (pass `fieldMode` to organisms via props) |
| `useTerminology` | Get localized IIIF term labels | **Templates only** (pass `t()` to organisms via props) |
| `useDebouncedValue` | Debounce a value over time | Search inputs |
| `useDebouncedCallback` | Debounce a function call | Expensive operations |
| `useDialogState` | Manage dialog open/close state | Modals, popovers |
| `useFocusTrap` | Trap focus within a container | Accessible dialogs |
| `useReducedMotion` | Respect user's motion preferences | Animations |
| `useResizablePanel` | Handle panel resize interactions | Split panes |
| `useResponsive` | Respond to viewport changes | Responsive layouts |
| `useURLState` | Sync state with URL params | Shareable views |
| `usePersistedTab` | Remember last active tab | Multi-tab interfaces |

### ❌ WRONG: Do NOT add to shared/lib

| Hook | Why Not | Where It Belongs |
|------|---------|------------------|
| `useManifestData` | Knows about manifests | `features/archive/hooks/` |
| `useCanvasAnnotations` | Knows about canvases + annotations | `features/viewer/hooks/` |
| `useArchiveFilter` | Archive-specific filtering | `features/archive/model/` |
| `useBoardLayout` | Board design domain | `features/board-design/model/` |
| `useVaultSelectors` | Direct vault access | Import from `services/vault` |

## Usage Patterns

### In Molecules (atoms composition)
```typescript
// ❌ WRONG: Molecules should NOT call context hooks
// export const SearchField = () => {
//   const cx = useContextualStyles(useAppSettings().fieldMode);  // WRONG!
// };

// ✅ CORRECT: Molecules receive cx via props from organism
import { useDebouncedValue } from '@/src/shared/lib';

export const SearchField = ({ cx, fieldMode }: SearchFieldProps) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebouncedValue(value, 300);
  return <div className={cx?.surface}>{/* ... */}</div>;
};

interface SearchFieldProps {
  cx?: ContextualClassNames;  // Optional — passed from organism
  fieldMode?: boolean;        // Optional — passed from organism
}
```

### In Templates (context providers)
```typescript
// Templates call context hooks and pass values to organisms
import { useContextualStyles, useAppSettings, useTerminology } from '@/src/shared/lib';

export const FieldModeTemplate = ({ children }) => {
  const { settings } = useAppSettings();
  const cx = useContextualStyles(settings.fieldMode);
  const t = useTerminology();

  return children({ cx, fieldMode: settings.fieldMode, t });
};
```

### In Organisms (feature components)
```typescript
// Organisms receive cx from template, pass to molecules
import { useDialogState, useResponsive } from '@/src/shared/lib';

export const ArchiveHeader = ({ cx, fieldMode }: ArchiveHeaderProps) => {
  const dialog = useDialogState();
  const { isMobile } = useResponsive();

  return (
    <header className={cx.surface}>
      <SearchField cx={cx} fieldMode={fieldMode} />  {/* Pass to molecule */}
    </header>
  );
};
```

## Dependency Rules

```
shared/lib/
  ↓ imports from
hooks/
  ↓ imports from
services/
  ↓ imports from
vault (state)
```

**Key Rule:** `shared/lib` can import from `hooks/` but NOT from `features/` or `services/` that have domain knowledge.

## Adding New Hooks

1. Create the hook in `hooks/` directory (original location)
2. Re-export from `src/shared/lib/index.ts`
3. Verify it has no domain imports
4. Document in this README

## Testing

Hooks in shared/lib should be tested with:
- Real React rendering (not just unit tests)
- Mock contexts where needed
- Edge cases (cleanup, unmounting)

```typescript
// Example test pattern
it('cleans up on unmount', () => {
  const { unmount } = renderHook(() => useDebouncedValue('test', 300));
  unmount();
  // No memory leaks, timers cleaned up
});
```

---

See `index.ts` for the complete list of exported hooks.
