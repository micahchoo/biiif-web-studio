# Viewer Feature

IIIF canvas viewer with OpenSeadragon deep zoom, annotations, and media playback.

## Architecture

This feature follows Atomic Design + Feature-Sliced Design principles:

```
src/features/viewer/
├── ui/organisms/
│   └── ViewerView.tsx        # Main organism (composes molecules)
├── model/
│   └── index.ts              # useViewer hook + domain logic
├── index.ts                  # Public API
└── README.md                 # This file
```

## Organism: ViewerView

The ViewerView organism receives context via props from FieldModeTemplate:

```typescript
<FieldModeTemplate>
  {({ cx, fieldMode, t, isAdvanced }) => (
    <ViewerView
      item={canvas}
      manifest={manifest}
      manifestItems={canvases}
      onUpdate={handleUpdate}
      cx={cx}
      fieldMode={fieldMode}
      t={t}
      isAdvanced={isAdvanced}
    />
  )}
</FieldModeTemplate>
```

**Key Design Decisions:**
- No `useAppSettings()` or `useContextualStyles()` calls in organism
- `cx`, `fieldMode`, `t`, `isAdvanced` received via props from template
- All UI elements composed from molecules in `src/shared/ui/molecules/`
- OpenSeadragon lifecycle managed in `useViewer` hook

## Model: useViewer Hook

Encapsulates all viewer state and OSD integration:

```typescript
const {
  mediaType,
  annotations,
  zoomLevel,
  viewerRef,
  osdContainerRef,
  zoomIn,
  zoomOut,
  resetView,
  // ...more
} = useViewer(item, manifest, autoOpenComposer, onComposerOpened);
```

**Responsibilities:**
- OpenSeadragon initialization and cleanup
- Media type detection (image/video/audio)
- Annotation extraction from canvas
- Image URL resolution (blob, file ref, IIIF service)
- Zoom/rotation state management
- Panel visibility state
- Memory cleanup (object URLs, OSD instances)

## Molecules Used

| Molecule | Purpose |
|----------|---------|
| `ZoomControl` | Zoom in/out/reset buttons |
| `PageCounter` | "Canvas X of Y" display |
| `EmptyState` | Empty states (no selection, unsupported) |
| `LoadingState` | Loading indicators |

## Legacy Migration

This replaces `components/views/Viewer.tsx`:

| Aspect | Legacy | New |
|--------|--------|-----|
| Lines of code | 1294 | ~300 (organism) + 350 (model) |
| fieldMode access | `useAppSettings()` | Via props from template |
| Styling | Inline classes | Via `cx` prop |
| OSD lifecycle | Inline useEffect | `useViewer` hook |
| Terminology | `useTerminology()` | Via `t` prop |

## Decomposition Notes

The Viewer is the most complex feature. The following components should be
extracted to molecules/organisms in future iterations:

### Future Molecules

1. **ViewerToolbar** - All toolbar buttons and controls
2. **AnnotationOverlay** - SVG annotation rendering over OSD
3. **FilmstripNavigator** - Canvas thumbnail strip
4. **ViewerPanel** - Collapsible side panel container

### Future Organisms (within feature)

1. **ImageRequestWorkbenchPanel** - Panel for image region extraction
2. **CanvasComposerPanel** - Panel for synthesizing new canvases
3. **PolygonAnnotationToolPanel** - Panel for drawing annotations
4. **ContentSearchPanel** - Search results within manifest
5. **MetadataPanel** - Canvas metadata display
6. **TranscriptionPanel** - Evidence and notes panel

### Legacy Components to Integrate

| Component | Legacy Path | Integration Status |
|-----------|-------------|-------------------|
| ImageRequestWorkbench | components/ImageRequestWorkbench.tsx | TODO |
| CanvasComposer | components/CanvasComposer.tsx | TODO |
| PolygonAnnotationTool | components/PolygonAnnotationTool.tsx | TODO |
| SearchPanel | components/SearchPanel.tsx | TODO |
| AVPlayer | components/AVPlayer.tsx | TODO |

These should be imported from `@/components/` during the transition period,
then refactored into proper molecules/organisms.

## OpenSeadragon Integration

The viewer uses OpenSeadragon for IIIF deep zoom:

```typescript
// OSD is initialized in useViewer when:
// 1. mediaType === 'image'
// 2. osdContainerRef is available
// 3. resolvedImageUrl is ready

// Tile source priority:
// 1. IIIF Image Service (info.json)
// 2. Simple image URL
```

**Memory Management:**
- OSD instance destroyed on unmount
- Object URLs revoked after use
- All handlers removed before destroy
- `isMounted` ref prevents state updates after unmount

## TODO / Known Issues

1. **Annotation overlays** - Not yet implemented in refactored version
2. **Rotation** - State tracked but not applied to OSD viewport
3. **Keyboard shortcuts** - Need to re-implement zoom/rotate shortcuts
4. **Content search** - SearchPanel integration pending
5. **AVPlayer** - Using native video/audio elements temporarily
