# Board Design Feature (`src/features/board-design/`)

The **Board Design feature** provides a canvas for arranging IIIF resources into visual layouts with connections and annotations.

## Structure

```
board-design/
├── ui/
│   └── organisms/
│       ├── BoardView.tsx       ← Main view (orchestrates board UI)
│       ├── BoardHeader.tsx     ← Header with undo/redo, title
│       ├── BoardToolbar.tsx    ← Tool selection (select, pan, connect)
│       └── BoardCanvas.tsx     ← Interactive canvas with drag-drop
├── model/
│   └── index.ts                ← Board state, items, connections, history
├── index.ts                    ← Public API
└── README.md                   ← This file
```

## What Each Component Does

### BoardView
**Responsibility:** Orchestrate the board design view
- Manages board state (items, connections, viewport)
- Provides undo/redo functionality
- Handles save/load operations
- Receives `cx`, `fieldMode`, `t`, `isAdvanced` via props from FieldModeTemplate
- Composes BoardHeader + BoardToolbar + BoardCanvas

### BoardHeader
**Responsibility:** Board header with title and actions
- Board title editing
- Undo/redo buttons
- Save/load controls
- Export functionality

### BoardToolbar
**Responsibility:** Tool selection
- Select tool (default)
- Pan tool
- Connect tool (draw connections between items)
- Note tool (add text annotations)
- Resource tool (add IIIF resources)

### BoardCanvas
**Responsibility:** Interactive canvas
- Drag-drop items
- Pan and zoom viewport
- Draw connections between items
- Select and move items
- Context menu for items

## Key Concepts

### BoardItem

An item on the board can be:
- A reference to a IIIF resource (manifest, canvas)
- A note/annotation
- A metadata node

```typescript
interface BoardItem {
  id: string;
  resourceId: string;      // Reference to IIIF resource
  x: number;               // Position
  y: number;
  w: number;               // Size
  h: number;
  resourceType: string;
  label: string;
  blobUrl?: string;        // Thumbnail
  annotation?: string;     // Custom annotation
  isNote?: boolean;
  isMetadataNode?: boolean;
}
```

### Connection

Connections link items with semantic relationships:

```typescript
type ConnectionType = 'associated' | 'partOf' | 'similarTo' | 'references' | 'requires' | 'sequence';

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
  fromAnchor?: AnchorSide;  // 'T' | 'R' | 'B' | 'L'
  toAnchor?: AnchorSide;
  style?: 'straight' | 'elbow' | 'curved';
  color?: string;
}
```

### BoardState

```typescript
interface BoardState {
  items: BoardItem[];
  connections: Connection[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
```

## Model API

### Selectors

```typescript
import {
  selectAllItems,
  selectAllConnections,
  selectItemById,
  selectConnectionsForItem,
} from '@/src/features/board-design';

const items = selectAllItems(boardState);
const connections = selectAllConnections(boardState);
const item = selectItemById(boardState, itemId);
const itemConnections = selectConnectionsForItem(boardState, itemId);
```

### State Management

```typescript
import { useBoardHistory } from '@/src/features/board-design';

const {
  state,
  canUndo,
  canRedo,
  undo,
  redo,
  pushState,
} = useBoardHistory(initialState);
```

## Usage

```typescript
import { BoardView } from '@/src/features/board-design';

<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <BoardView
      root={root}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
      isAdvanced={isAdvanced}
      initialBoard={savedBoard}
      onSave={handleSave}
    />
  )}
</FieldModeTemplate>
```

## Public API

```typescript
// Components
export { BoardView } from './ui/organisms/BoardView';
export { BoardHeader } from './ui/organisms/BoardHeader';
export { BoardToolbar } from './ui/organisms/BoardToolbar';
export { BoardCanvas } from './ui/organisms/BoardCanvas';

// Types
export type { BoardViewProps } from './ui/organisms/BoardView';
export type { BoardHeaderProps } from './ui/organisms/BoardHeader';
export type { BoardToolbarProps } from './ui/organisms/BoardToolbar';
export type { BoardCanvasProps } from './ui/organisms/BoardCanvas';

// Model
export {
  manifest,
  canvas,
  selectAllItems,
  selectAllConnections,
  selectItemById,
  selectConnectionsForItem,
  type BoardItem,
  type Connection,
  type ConnectionType,
  type AnchorSide,
  type BoardState,
} from './model';
```

## Molecules Used

| Molecule | Purpose | Source |
|----------|---------|--------|
| `Toolbar` | Action button group | `src/shared/ui/molecules/` |
| `IconButton` | Tool buttons | `src/shared/ui/molecules/` |
| `EmptyState` | Empty board state | `src/shared/ui/molecules/` |
| `ZoomControl` | Zoom in/out/reset | `src/shared/ui/molecules/` |

## Future Enhancements

- [ ] Multi-select and group operations
- [ ] Connection routing (auto-avoid items)
- [ ] Board templates
- [ ] Collaborative editing
- [ ] Export to various formats (PNG, SVG, IIIF)
