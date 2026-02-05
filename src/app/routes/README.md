# App Routes (`src/app/routes/`)

Route dispatcher that maps app modes to feature views. Routes are wrapped with templates and context providers.

## Files

| File | Purpose |
|------|---------|
| `ViewRouter.tsx` | Main view dispatcher - maps modes to feature views |
| `index.ts` | Barrel export for ViewRouter and types |

## ViewRouter

**Responsibility:** Route requests to appropriate feature based on app mode

Maps `currentMode` (archive, boards, metadata, etc.) to the correct view component.

```typescript
import { ViewRouter } from '@/src/app/routes';

export const App = () => {
  const [mode, setMode] = useState('archive');
  const [selectedId, setSelectedId] = useState(null);

  return (
    <ViewRouter
      currentMode={mode}
      selectedId={selectedId}
      root={root}
      showSidebar={showSidebar}
      onModeChange={setMode}
      onSelect={setSelectedId}
      onSidebarToggle={toggleSidebar}
      sidebarContent={<Sidebar />}
      headerContent={<Header />}
    />
  );
};
```

## Supported Modes

Routes dispatch to different views based on `currentMode`:

| Mode | Feature | Status |
|------|---------|--------|
| `archive` | Browse/organize collections | ✅ Implemented |
| `boards` | Board layout design | ✅ Implemented |
| `metadata` | Edit metadata | ✅ Implemented |
| `staging` | Two-pane import workbench | ✅ Implemented |
| `search` | Full-text search | ✅ Implemented |
| `viewer` | IIIF viewer | ✅ Implemented |
| `timeline` | Temporal timeline | ✅ Implemented |
| `collections` | Structure/hierarchy | Future |
| `trash` | Deleted items | Future |

## Implementation Pattern

Each route wraps the feature view with templates:

```typescript
export const ViewRouter: React.FC<ViewRouterProps> = ({
  currentMode,
  root,
  // ... other props
}) => {
  return (
    <BaseTemplate showSidebar={showSidebar} onSidebarToggle={onSidebarToggle}>
      <FieldModeTemplate>
        {({ cx, fieldMode, t, isAdvanced }) => {
          switch (currentMode) {
            case 'archive':
              return (
                <ArchiveView
                  root={root}
                  cx={cx}
                  fieldMode={fieldMode}
                  t={t}
                  isAdvanced={isAdvanced}
                />
              );
            case 'boards':
              return (
                <BoardView
                  root={root}
                  cx={cx}
                  fieldMode={fieldMode}
                  t={t}
                  isAdvanced={isAdvanced}
                />
              );
            // ... other cases
          }
        }}
      </FieldModeTemplate>
    </BaseTemplate>
  );
};
```

## Props Interface

```typescript
interface ViewRouterProps {
  /** Current app mode */
  currentMode: AppMode;
  /** Currently selected entity ID */
  selectedId: string | null;
  /** IIIF tree root */
  root: IIIFItem | null;
  /** Show/hide sidebar */
  showSidebar: boolean;
  /** Callback when mode changes */
  onModeChange: (mode: AppMode) => void;
  /** Callback when selection changes */
  onSelect: (id: string | null) => void;
  /** Callback when sidebar toggle is clicked */
  onSidebarToggle: () => void;
  /** Optional sidebar content */
  sidebarContent?: React.ReactNode;
  /** Optional header content */
  headerContent?: React.ReactNode;
}
```

## Key Design Decisions

1. **Router knows about templates** — Each route is wrapped with `BaseTemplate` and `FieldModeTemplate`
2. **Context via render props** — Template context is passed to features via render props, not hooks
3. **Features are mode-agnostic** — Features don't know about routing, they just receive props
4. **Incremental adoption** — New features can be added without changing existing ones

## Adding a New Route

To add a new route:

1. Create the feature in `src/features/<name>/`
2. Export the main view component from `src/features/<name>/index.ts`
3. Add a case in `ViewRouter.tsx` switch statement
4. Update the `AppMode` type if needed
