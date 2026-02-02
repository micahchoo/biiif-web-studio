---
name: component-scaffolding
description: Generate React components following Field Studio patterns and conventions. This skill automates creation of components with proper structure, hooks integration, styling, testing stubs, and type definitions. Use when building new UI components to ensure consistency with the project's 68 existing components.
---

# Component Scaffolding – Automated Component Generation

When you need to create new React components for Field Studio, this skill generates properly structured components aligned with project patterns and conventions.

## When to use this skill

- You need to **create a new UI component** following project conventions
- You want to **ensure consistency** with existing 68 components
- You need to **generate test stubs** alongside component code
- You want to **enforce proper hook usage** (useIIIFEntity, useVaultState, etc.)
- You need to **generate TypeScript interfaces** for props and state
- You want to **integrate with vault pattern** automatically
- You need to **generate component documentation** (Storybook, JSDoc)

## When NOT to use this skill

- For modifying existing components (use component-enhancement instead)
- For utility functions or services (use service scaffolding)
- For hook creation (use hook-scaffolding skill)
- For styling-only changes (use CSS/styling tools)

## Inputs required from the user

- Component name (e.g., "MediaThumbnail", "ManifestInspector")
- Optional: component type (Functional, Memoized, Stateful)
- Optional: parent component or feature area (e.g., "Staging", "Viewer")
- Optional: expected props (e.g., entity type, handlers)
- Optional: which hooks to integrate
- Optional: styling system (Tailwind, CSS Modules, styled-components)

## Component Patterns

### Pattern 1: Simple Presentational Component

Used for components that don't interact with vault/state.

```typescript
// src/components/SectionName/ComponentName.tsx
import { PropsWithChildren } from 'react';

export interface ComponentNameProps {
  /** Human-readable label */
  label?: string;
  /** Callback when action occurs */
  onAction?: (value: string) => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Brief description of what this component does
 *
 * @example
 * <ComponentName label="Example" onAction={handleAction} />
 */
export function ComponentName({
  label,
  onAction,
  className,
}: PropsWithChildren<ComponentNameProps>) {
  return (
    <div className={className}>
      <h3>{label}</h3>
      {/* Component content */}
    </div>
  );
}
```

### Pattern 2: Vault-Connected Component

Used for components that read from vault state.

```typescript
// src/components/SectionName/ComponentName.tsx
import { useIIIFEntity } from '@/hooks/useIIIFEntity';
import { actions } from '@/services/actions';

export interface ComponentNameProps {
  entityId: string;
  onUpdate?: (entityId: string) => void;
}

export function ComponentName({ entityId, onUpdate }: ComponentNameProps) {
  const entity = useIIIFEntity(entityId);

  if (!entity) {
    return <div>Entity not found</div>;
  }

  const handleChange = (label: Record<string, string[]>) => {
    actions.updateLabel(entityId, label);
    onUpdate?.(entityId);
  };

  return (
    <div>
      {/* Render entity data */}
    </div>
  );
}
```

### Pattern 3: Container Component

Used for components managing multiple entities or complex state.

```typescript
// src/components/SectionName/ComponentNameContainer.tsx
import { useVaultState } from '@/hooks/useVaultState';
import { useState } from 'react';
import { ComponentNameView } from './ComponentNameView';

export interface ComponentNameContainerProps {
  collectionId: string;
}

export function ComponentNameContainer({
  collectionId,
}: ComponentNameContainerProps) {
  const vault = useVaultState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const collection = vault.collections.get(collectionId);
  if (!collection) return <div>Collection not found</div>;

  return (
    <ComponentNameView
      collection={collection}
      selectedId={selectedId}
      onSelectChange={setSelectedId}
    />
  );
}
```

## Workflow

### 1. Choose Component Type

**Presentational** - No state or vault access
- Dumb display components
- Button variants, labels, badges
- Stubs for more complex children

**Stateful** - Local UI state only
- Modal dialogs with form state
- Temporary UI selections
- Animation controllers

**Vault-Connected** - Reads from vault, doesn't dispatch actions
- Entity viewers
- Read-only inspectors
- Data displays

**Vault-Mutating** - Reads and writes vault via actions
- Editors, forms
- List item handlers
- Drag-drop targets

**Container** - Manages multiple entities
- Workbench layouts
- Feature sections
- Multi-entity controllers

### 2. Define Props Interface

**Naming conventions:**

```typescript
// For entity references:
entityId: string                    // Single entity ID
entityIds?: string[]                // Multiple entity IDs
collectionId: string                // Specific entity type ID

// For callbacks:
onChange?: (value: T) => void       // Value changed
onAction?: (action: Action) => void // User action triggered
onUpdate?: (id: string) => void     // Entity updated
onExecute?: (cmd: Command) => void  // Command executed

// For display:
isLoading?: boolean                 // Loading state
isSelected?: boolean                // Selection state
variant?: 'primary' | 'secondary'   // Style variant
```

### 3. Generate Component Structure

```bash
# Create component directory:
mkdir -p src/components/SectionName

# Create component files:
touch src/components/SectionName/ComponentName.tsx
touch src/components/SectionName/ComponentName.test.tsx
touch src/components/SectionName/index.ts
```

### 4. Implement Component

Follow the chosen pattern from Component Patterns section above.

### 5. Generate Tests

**Test structure:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render with label', () => {
    render(<ComponentName label="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should call onAction when clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<ComponentName onAction={onAction} />);
    await user.click(screen.getByRole('button'));

    expect(onAction).toHaveBeenCalled();
  });
});
```

### 6. Export Component

```typescript
// src/components/SectionName/index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Common Component Categories

### 1. Entity Inspectors

Display and edit single entity properties.

```typescript
// src/components/Inspectors/ManifestInspector.tsx
export interface ManifestInspectorProps {
  manifestId: string;
  onUpdate?: () => void;
}

export function ManifestInspector({ manifestId, onUpdate }: ManifestInspectorProps) {
  const manifest = useIIIFEntity(manifestId) as IManifest | undefined;
  // ... render manifest properties
}
```

### 2. List Items

Render items in a list with selection/actions.

```typescript
// src/components/Lists/CanvasListItem.tsx
export interface CanvasListItemProps {
  canvasId: string;
  isSelected?: boolean;
  onSelect?: (canvasId: string) => void;
  onDelete?: (canvasId: string) => void;
}

export function CanvasListItem({
  canvasId,
  isSelected,
  onSelect,
  onDelete,
}: CanvasListItemProps) {
  const canvas = useIIIFEntity(canvasId) as ICanvas | undefined;
  // ... render canvas with actions
}
```

### 3. Forms/Editors

Capture user input and dispatch actions.

```typescript
// src/components/Forms/LabelEditor.tsx
export interface LabelEditorProps {
  entityId: string;
  onSave?: () => void;
}

export function LabelEditor({ entityId, onSave }: LabelEditorProps) {
  const entity = useIIIFEntity(entityId);
  const [localLabel, setLocalLabel] = useState(entity?.label || {});

  const handleSave = () => {
    actions.updateLabel(entityId, localLabel);
    onSave?.();
  };

  return (
    <form onSubmit={handleSave}>
      {/* Language-specific label inputs */}
    </form>
  );
}
```

## Styling Guidelines

### Use Tailwind CSS (primary)

```typescript
export function ComponentName() {
  return (
    <div className="flex items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Action
      </button>
    </div>
  );
}
```

### Use CSS Modules (for complex styling)

```typescript
// ComponentName.module.css
.container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
}

.button {
  background-color: var(--color-primary);
  border-radius: 0.375rem;
}

// ComponentName.tsx
import styles from './ComponentName.module.css';

export function ComponentName() {
  return <div className={styles.container}>...</div>;
}
```

## Files in this skill

- **SKILL.md** – This entrypoint
- **references/component-types.md** – Detailed component pattern guide
- **references/eslint-rules.md** – Component prop naming and validation rules
- **scripts/generate-component.sh** – CLI tool to scaffold component structure
- **scripts/validate-component.sh** – Check component against patterns
- **templates/component.template.tsx** – Component boilerplate template
- **templates/component.test.template.tsx** – Test boilerplate template

## Success criteria

Component scaffolding is successful when:

- Generated components follow ESLint naming conventions (onChange, onAction, etc.)
- Type safety with proper TypeScript interfaces
- Test files are generated alongside components
- Components integrate correctly with vault pattern (if needed)
- Props are well-documented with JSDoc comments
- Components match styling conventions (Tailwind or CSS Modules)
- Export structure enables easy importing and barrel exports

---

*Skill last updated: 2026-02-01*
*Part of Field Studio AI assistant infrastructure*
