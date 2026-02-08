# Shared Library Hooks

Generic, reusable, domain-agnostic hooks that can be used by any feature, organism, or molecule in the application.

## Migration Status

### ✅ Migrated to FSD (7 hooks)

These hooks have been migrated from `hooks/` to `src/shared/lib/hooks/`:

| Hook | Purpose | Dependencies |
|------|---------|--------------|
| `useDebouncedValue` | Debounce a value over time | None |
| `useDebouncedCallback` | Debounce a function call | None |
| `useResponsive` | Respond to viewport changes | None |
| `useDialogState` | Manage dialog open/close state | None |
| `usePersistedTab` | Remember last active tab | localStorage |
| `useFocusTrap` | Trap focus within a container | None |
| `useReducedMotion` | Respect user's motion preferences | None |
| `useMotionDuration` | Get animation duration respecting motion | useReducedMotion |
| `useMotionTransitions` | Get CSS transition classes | useReducedMotion |

### 🏠 Domain-Specific Hooks (Stay in Root `hooks/`)

These hooks have domain knowledge and stay in the root `hooks/` directory:

| Hook | Domain | Belongs In |
|------|--------|------------|
| `useIIIFEntity` | Vault/IIIF | `entities/canvas/`, `entities/manifest/` |
| `useVaultSelectors` | Vault state | `entities/*/model/` |
| `useAppSettings` | App state | `app/providers/` |
| `useUserIntent` | User context | `app/providers/` |
| `useResourceContext` | Resource context | `app/providers/` |
| `useTerminology` | IIIF terms | `app/providers/` |
| `useContextualStyles` | Field mode styling | `app/providers/` |
| `useIIIFTraversal` | IIIF tree | `features/*/model/` |
| `useVirtualization` | List virtualization | `features/*/model/` |
| `useTreeVirtualization` | Tree virtualization | `features/*/model/` |
| `useImageSource` | Image loading | `features/viewer/model/` |
| `useIngestProgress` | Ingest workflow | `features/ingest/model/` |
| `useInspectorTabs` | Inspector UI | `features/metadata-edit/model/` |
| `useMetadataEditor` | Metadata editing | `features/metadata-edit/model/` |
| `useLayerHistory` | Canvas layers | `features/viewer/model/` |
| `useNavigationGuard` | Navigation | `app/providers/` |
| `useSharedSelection` | Selection state | `features/*/model/` |
| `useURLState` | URL sync | `app/providers/` |
| `useViewport` | OSD viewport | `features/viewer/model/` |
| `useViewportKeyboard` | Viewport keyboard | `features/viewer/model/` |
| `usePanZoomGestures` | OSD gestures | `features/viewer/model/` |
| `useResizablePanel` | Panel resize | Could migrate to shared |
| `useStructureKeyboard` | Structure nav | `features/*/model/` |
| `useCommandHistory` | Command palette | `features/*/model/` |
| `useBreadcrumbPath` | Breadcrumbs | `features/*/model/` |

## Usage Guidelines

### In Shared Library (src/shared/lib/)
- ✅ Generic React patterns
- ✅ No IIIF knowledge
- ✅ No business logic
- ✅ Works in any React app

### In Features (src/features/*/)
- ✅ Domain-specific logic
- ✅ Can use shared hooks
- ✅ Can use entities
- ✅ Business logic OK

### Import Pattern

```typescript
// From shared library
import { useDebouncedValue, useResponsive } from '@/src/shared/lib/hooks';

// From domain hooks (still in root)
import { useIIIFEntity } from '@/src/shared/lib/hooks/useIIIFEntity';
```

## Future Migrations

Hooks that could be migrated to `shared/lib` with refactoring:
- `useResizablePanel` - Generic enough, needs constants inlined
- `useURLState` - Generic enough, no domain deps

## ESLint Verification

All migrated hooks pass ESLint checks:

```bash
npx eslint src/shared/lib/hooks/*.ts --ext .ts
```
