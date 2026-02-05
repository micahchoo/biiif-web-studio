# App Templates (`src/app/templates/`)

Layout wrappers that provide context to feature organisms. Templates are the bridge between the app layer and feature layer.

## Philosophy

**"Features are context-agnostic. Templates provide context."**

- Features don't import `useAppSettings` or `useContextualStyles`
- Features don't know about routing
- Templates inject `cx`, `fieldMode`, `t`, and `isAdvanced` via render props

## Files

| File | Purpose |
|------|---------|
| `FieldModeTemplate.tsx` | Injects fieldMode, cx, t, isAdvanced via render props |
| `BaseTemplate.tsx` | Provides sidebar, header, main layout structure |
| `index.ts` | Barrel export for all templates |

## Available Templates

### FieldModeTemplate

**Responsibility:** Inject fieldMode and design tokens (cx) context

Wraps organisms with app settings context. Organisms receive `cx`, `fieldMode`, `t`, and `isAdvanced` via render props.

```typescript
import { FieldModeTemplate } from '@/src/app/templates';

<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <ArchiveView
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
  - `cx.surface` — Background color (light/dark)
  - `cx.text` — Text color (light/dark)
  - `cx.border` — Border color
  - `cx.input` — Input field styles
  - `cx.button` — Button styles
  - Plus 7+ more tokens
- `fieldMode: boolean` — Is high-contrast field mode active?
- `t: (key: string) => string` — Terminology function (maps IIIF types to user-facing labels)
- `isAdvanced: boolean` — Progressive disclosure gate (show advanced UI when true)

**Props:**
- `children: (props: FieldModeTemplateRenderProps) => ReactNode` — Render function receiving context

**When to use:**
- Wrapping any view that needs theme-aware styling
- When organisms need access to design tokens
- For pages that should respect fieldMode toggle

### BaseTemplate

**Responsibility:** Provide overall layout structure (sidebar, header, main)

Wraps the entire app or major sections with consistent layout.

```typescript
import { BaseTemplate } from '@/src/app/templates';

<BaseTemplate
  showSidebar={showSidebar}
  onSidebarToggle={() => setShowSidebar(!showSidebar)}
  headerContent={<AppHeader />}
  sidebarContent={<Sidebar />}
>
  {/* Main content goes here */}
</BaseTemplate>
```

**Props:**
- `children: ReactNode` — Main content
- `showSidebar?: boolean` — Show/hide sidebar
- `onSidebarToggle?: () => void` — Sidebar toggle callback
- `headerContent?: ReactNode` — Custom header (optional)
- `sidebarContent?: ReactNode` — Custom sidebar (optional)

**Structure:**
```
┌─────────────────────────────────┐
│ Header                          │
├──────────┬──────────────────────┤
│ Sidebar  │ Main (children)      │
│          │                      │
│          │ Your content here    │
│          │                      │
└──────────┴──────────────────────┘
```

**When to use:**
- Root app layout
- Major section layouts
- Any view needing consistent sidebar/header structure

## Combining Templates

Templates are designed to be nested:

```typescript
<BaseTemplate
  showSidebar={showSidebar}
  onSidebarToggle={toggleSidebar}
  headerContent={<Header />}
  sidebarContent={<Sidebar />}
>
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
</BaseTemplate>
```

## Memoization

`FieldModeTemplate` is memoized to prevent unnecessary re-renders when settings haven't changed. This is critical for maintaining <50ms paint time after context changes.

## Migration from Prop-Drilling

Before templates, fieldMode was prop-drilled through many layers:

```typescript
// ❌ OLD: Prop-drilling
<App fieldMode={fieldMode}>
  <Page fieldMode={fieldMode}>
    <View fieldMode={fieldMode}>
      <Component fieldMode={fieldMode}>
        <Atom fieldMode={fieldMode} /> {/* Finally used here */}
      </Component>
    </View>
  </Page>
</App>
```

With templates, context is injected at the boundary:

```typescript
// ✅ NEW: Template injection
<FieldModeTemplate>
  {({ cx, fieldMode }) => (
    <View cx={cx} fieldMode={fieldMode} /> {/* Receive at view boundary */}
  )}
</FieldModeTemplate>
```

## Type Exports

```typescript
import {
  FieldModeTemplate,
  type FieldModeTemplateProps,
  type FieldModeTemplateRenderProps,
  BaseTemplate,
  type BaseTemplateProps,
} from '@/src/app/templates';
```
