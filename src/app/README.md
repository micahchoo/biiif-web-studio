# App Layer (`src/app/`)

The **app layer** is the root of the application. It handles:
- **Context providers** (fieldMode, settings, intent tracking)
- **Templates** (layout wrappers that provide context to views)
- **Routing** (view dispatcher)
- **Global state** (nothing else should reach here)

## Philosophy

**"Features are context-agnostic. App provides context."**

- Features don't know about `fieldMode`, `settings`, `auth` — these are context
- Features don't know about routing — app dispatches to them
- Features don't know about global state — they use entity layer
- Organisms receive context via props from templates, not via hooks

## Structure

```
src/app/
├── templates/
│   ├── FieldModeTemplate.tsx   ← Provides cx, fieldMode, t, isAdvanced via render props
│   ├── BaseTemplate.tsx        ← Base layout (header, sidebar, main)
│   ├── index.ts                ← Barrel export
│   └── README.md
├── providers/
│   ├── index.tsx               ← AppProviders component with all contexts
│   ├── useAppSettings.ts       ← Settings hook (template-level only)
│   ├── useTerminology.ts       ← Terminology hook (template-level only)
│   └── README.md
├── routes/
│   ├── ViewRouter.tsx          ← Main view dispatcher
│   ├── index.ts                ← Barrel export
│   └── README.md
└── README.md                   (this file)
```

## Templates

### FieldModeTemplate
Injects fieldMode context and design tokens into child organisms via render props pattern:

```typescript
import { FieldModeTemplate } from '@/src/app/templates';

<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <ArchiveView
      root={root}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
      isAdvanced={isAdvanced}
    />
  )}
</FieldModeTemplate>
```

**Provides:**
- `cx: ContextualClassNames` — CSS class names for current theme
- `fieldMode: boolean` — Is high-contrast field mode active?
- `t: (key: string) => string` — Terminology function
- `isAdvanced: boolean` — Progressive disclosure gate

### BaseTemplate
Provides global layout (sidebar, header, main area):

```typescript
import { BaseTemplate } from '@/src/app/templates';

<BaseTemplate
  showSidebar={showSidebar}
  onSidebarToggle={toggleSidebar}
  headerContent={<Header />}
  sidebarContent={<Sidebar />}
>
  <FieldModeTemplate>
    {({ cx, fieldMode, t, isAdvanced }) => (
      <FeatureView cx={cx} fieldMode={fieldMode} t={t} isAdvanced={isAdvanced} />
    )}
  </FieldModeTemplate>
</BaseTemplate>
```

## Providers

Consolidate all context providers in one place:

```typescript
import { AppProviders } from '@/src/app/providers';

<AppProviders>
  <MainApp />
</AppProviders>
```

**Provider hierarchy:**
1. `VaultProvider` — IIIF state management
2. `ToastProvider` — Notifications
3. `ErrorBoundary` — Error handling
4. `UserIntentProvider` — User intent tracking
5. `ResourceContextProvider` — Current resource state

## Routes

The `ViewRouter` maps app modes to feature views:

```typescript
import { ViewRouter } from '@/src/app/routes';

<ViewRouter
  currentMode="archive"
  selectedId={selectedId}
  root={root}
  showSidebar={showSidebar}
  onModeChange={setMode}
  onSelect={setSelectedId}
  onSidebarToggle={toggleSidebar}
/>
```

**Supported modes:** `archive`, `boards`, `metadata`, `staging`, `search`, `viewer`, `collections`, `trash`

## Dependency Rules

```
app/* ← features/*     (app composes features)
app/* ← entities/*     (app can use entities directly)
app/* ← shared/*       (app uses shared UI)
features/* ← NOT app   (features don't import app)
```

## Key Principle

**Only templates call context hooks.** Features receive context via props.

```typescript
// ❌ WRONG: Feature calling hook directly
const ArchiveView = () => {
  const { settings } = useAppSettings(); // Don't do this
  return <div className={settings.fieldMode ? 'dark' : 'light'}>...</div>;
};

// ✅ CORRECT: Receive via props from template
interface ArchiveViewProps {
  cx: ContextualClassNames;
  fieldMode: boolean;
}
const ArchiveView = ({ cx, fieldMode }: ArchiveViewProps) => {
  return <div className={cx.surface}>...</div>;
};
```
