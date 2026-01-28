# Field Studio: User Experience (UX)

The user experience of Field Studio is grounded in the metaphor of a physical **Workbench**, explicitly separating the "raw material" of field data from the "constructed" archival object. It prioritizes transparency in how digital requests are made and emphasizes spatial thinking.

---

## Design Philosophy: "Request, Don't Edit"

A key UX principle is exposing the mechanics of the IIIF Image API. Instead of "cropping" or "resizing" an image—which implies destructive editing of the source file—the interface visualizes the **Image Request**.

### Visual Formula

The UI displays the Image API URL being constructed in real-time:

```
/iiif/image/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
                           ▲        ▲       ▲          ▲         ▲
                           │        │       │          │         │
                    ┌──────┘  ┌─────┘ ┌─────┘    ┌─────┘   ┌─────┘
                    │         │       │          │         │
              Region Panel  Size   Rotation   Quality   Format
              (crop box)   Slider  Control    Toggle    Select
```

### Source vs. Output

Overlays clearly distinguish between:
- **Source Image** — The full, unaltered original (solid border)
- **Requested Output** — The derived view (dashed border, highlighted region)

### Parameter Visualization

Controls map directly to API parameters:

| Control | API Parameter | Visual Representation |
|---------|---------------|----------------------|
| Crop box | `region` | Draggable rectangle overlay |
| Size slider | `size` | Percentage indicator + pixel preview |
| Rotation dial | `rotation` | Circular control with snap points |
| Quality toggle | `quality` | Live preview (color/gray/bitonal) |
| Format select | `format` | Dropdown with size estimation |

---

## Core Workflows & Affordances

### 1. The Board (Spatial Thinking)

**Component:** `components/views/BoardView.tsx`

A spatial canvas that breaks free from linear file lists.

#### Features

| Feature | Description |
|---------|-------------|
| **Infinite Canvas** | Pan/zoom with configurable scale (0.1x–5x) |
| **Grid Snapping** | Optional 24px grid alignment |
| **Piles & Clusters** | Natural grouping like a physical research desk |
| **Visual Connections** | Typed relationships between items |

#### Tools

| Tool | Icon | Action |
|------|------|--------|
| Select | ↖ | Move items, select connections |
| Connect | ↗ | Draw relationships between items |
| Pan | ✋ | Navigate the canvas |
| Note | 📝 | Add text annotations |

#### Connection Types

| Type | Meaning | Visual |
|------|---------|--------|
| `depicts` | Image shows the subject | Solid line |
| `transcribes` | Text represents content | Dashed line |
| `relatesTo` | General association | Dotted line |
| `contradicts` | Conflicting information | Red line |
| `precedes` | Temporal ordering | Arrow |

#### De Facto Manifest

The spatial arrangement serializes as a IIIF Manifest, preserving intellectual context.

---

### 2. The Workbench (Request Composition)

**Component:** `components/ImageRequestWorkbench.tsx`

A dedicated view for fine-tuning IIIF Image API requests.

#### Principles

- **No "Save" Button** — Actions result in "Copy URI" or "Use Request"
- **Non-Destructive** — Original asset is never modified
- **Real-Time Feedback** — URI updates instantly on parameter change

#### Workflow

```
┌────────────────────────────────────────────────────────────────┐
│                    Image Request Workbench                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │                     │    │    Parameter Panel   │           │
│  │   Source Preview    │    ├─────────────────────┤           │
│  │   (with crop box)   │    │ Region: 100,200,... │           │
│  │                     │    │ Size:   800,        │           │
│  │                     │    │ Rotation: 0         │           │
│  └─────────────────────┘    │ Quality: default    │           │
│                              │ Format:  jpg        │           │
│  ┌─────────────────────┐    └─────────────────────┘           │
│  │   Output Preview    │                                      │
│  │   (derived view)    │    URI:                              │
│  │                     │    /iiif/image/abc/100,200,500,400/  │
│  └─────────────────────┘    800,/0/default.jpg                │
│                                                                │
│                    [ Copy URI ]  [ Use Request ]               │
└────────────────────────────────────────────────────────────────┘
```

---

### 3. State Awareness (Offline First)

The UI provides distinct visual states for resources to prevent data loss confusion.

#### Resource States

| State | Visual | Meaning |
|-------|--------|---------|
| **Cached** | Solid border | Content available offline |
| **Stub** | Dashed/dimmed | Metadata exists, content not downloaded |
| **Local-only** | Badge icon | Created in session, not yet exported |
| **Stale** | Warning icon | Local version differs from remote |
| **Conflict** | Error icon | Merge required |

#### Type Definition

```typescript
type ResourceState = 'cached' | 'stub' | 'local-only' | 'stale' | 'conflict';
```

#### Visual Indicators

```
┌───────────────┐  ┌ ─ ─ ─ ─ ─ ─ ┐  ┌───────────────┐
│               │                    │  ⚡ LOCAL     │
│   CACHED      │  │   STUB        │ │               │
│               │                    │   LOCAL-ONLY  │
└───────────────┘  └ ─ ─ ─ ─ ─ ─ ┘  └───────────────┘
  Solid border      Dashed border      Badge indicator
```

---

### 4. Navigation & Views

**Component:** `components/ViewRouter.tsx`

The interface switches between distinct modes of interaction.

#### View Modes

| Mode | Component | Purpose |
|------|-----------|---------|
| `archive` | `ArchiveView` | Hierarchical tree navigation |
| `collections` | `CollectionsView` | Collection management |
| `boards` | `BoardView` | Spatial arrangement |
| `search` | `SearchView` | Full-text search |
| `viewer` | `Viewer` | Deep-zoom image viewing |
| `metadata` | `MetadataSpreadsheet` | Bulk table editing |

#### App Mode Type

```typescript
type AppMode = 'archive' | 'collections' | 'boards' | 'search' | 'viewer' | 'metadata';
```

#### View-Specific Features

**Archive View:**
- Collapsible tree with drag-drop
- Multi-selection and batch operations
- Context menu for item management

**Collections View:**
- Non-hierarchical IIIF 3.0 collections
- Membership management
- Quick-add from search

**Metadata Spreadsheet:**
- Inline editing
- Language-aware columns
- CSV export/import
- Validation highlighting

**Search View:**
- Full-text search via Lunr.js
- Faceted filtering
- Result highlighting
- Quick navigation to items

---

### 5. The Inspector (Property Editing)

**Component:** `components/Inspector.tsx`

The main property editor for selected IIIF items.

#### Tabs

| Tab | Content |
|-----|---------|
| **Properties** | IIIF metadata fields |
| **Design** | Layout and styling (Board view) |
| **Validation** | Issues with heal buttons |

#### Features

- Language-aware metadata editing
- Inline validation with auto-heal UI
- Rights statement management
- Thumbnail preview
- Provenance history

---

### 6. Staging Workbench (Ingest)

**Directory:** `components/staging/`

A two-pane interface for organizing ingested content.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                       Staging Workbench                         │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                      │
│      SOURCE PANE         │          ARCHIVE PANE                │
│                          │                                      │
│  ┌────────────────────┐  │  ┌────────────────────────────────┐ │
│  │ Uploaded Manifest 1 │  │  │        Collection A            │ │
│  │   • Canvas 1       │  │  │  ┌──────────┐ ┌──────────┐    │ │
│  │   • Canvas 2       │──┼──▶  │ Manifest │ │ Manifest │    │ │
│  │   • Canvas 3       │  │  │  └──────────┘ └──────────┘    │ │
│  └────────────────────┘  │  └────────────────────────────────┘ │
│                          │                                      │
│  ┌────────────────────┐  │  ┌────────────────────────────────┐ │
│  │ Uploaded Manifest 2 │  │  │        Collection B            │ │
│  │   • Canvas 1       │  │  │  ┌──────────┐                  │ │
│  │   • Canvas 2       │  │  │  │ Manifest │                  │ │
│  └────────────────────┘  │  │  └──────────┘                  │ │
│                          │  └────────────────────────────────┘ │
└──────────────────────────┴──────────────────────────────────────┘
```

#### Panes

| Pane | Purpose |
|------|---------|
| **Source** | Uploaded manifests and files |
| **Archive** | Organization workspace with collections |

#### Actions

- Drag from Source to Archive
- Create/rename/delete collections
- Move manifests between collections
- Export metadata template (CSV)

---

## Interaction Patterns

### Drag and Drop

Used extensively throughout the application:

| Context | Drag Source | Drop Target | Action |
|---------|-------------|-------------|--------|
| Ingest | Desktop files | Staging area | Import media |
| Board | Archive items | Canvas | Add to spatial layout |
| Staging | Source manifest | Collection | Organize |
| Archive | Tree item | Tree item | Reparent |

### Keyboard Shortcuts

**Global:**
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save/Export |
| `Ctrl+F` | Search |
| `Escape` | Cancel/Close |

**Archive View:**
| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate items |
| `←/→` | Collapse/Expand |
| `Delete` | Delete item |
| `Enter` | Edit item |
| `Ctrl+D` | Duplicate |

**Board View:**
| Shortcut | Action |
|----------|--------|
| `Space` | Pan mode (hold) |
| `+/-` | Zoom in/out |
| `G` | Toggle grid |
| `C` | Connect mode |
| `N` | Add note |

### Contextual Help

**Component:** `components/ContextualHelp.tsx`

Inline guidance on IIIF concepts:

- Tooltips on technical terms
- "Learn more" links to IIIF documentation
- Concept explanations (Canvas vs. Image)
- Validation issue descriptions

---

## Abstraction Levels

The interface adapts to user expertise via `AppSettings.abstractionLevel`:

| Level | Exposed Features |
|-------|------------------|
| **Simple** | Basic metadata, hide technical IDs |
| **Standard** | Full metadata, behaviors, thumbnails |
| **Advanced** | Raw JSON, extensions, provenance |

```typescript
type AbstractionLevel = 'simple' | 'standard' | 'advanced';
```

---

## Persona Settings

**Component:** `components/PersonaSettings.tsx`

User preferences that shape the interface:

| Setting | Effect |
|---------|--------|
| `fieldMode` | Simplified UI for fieldwork |
| `theme` | Light/dark mode |
| `language` | Interface language |
| `metadataComplexity` | Basic/standard/advanced metadata fields |
| `showTechnicalIds` | Show/hide internal identifiers |
| `autoSaveInterval` | Background save frequency |
