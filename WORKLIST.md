
# IIIF Field Archive Studio - Implementation Worklist

This document outlines the pending features and improvements required to fully realize the **Technical Specification v3.0**.

## 1. Core Infrastructure & Services
- [x] **Service Worker Image API**: Migrate `LocalIIIFServer` to a Service Worker to handle IIIF Image API 3.0 requests.
- [x] **Content State API**: Implement support for `iiif-content` parameter.
- [x] **Validation Service**: Integrate a IIIF validator for real-time compliance checks.
- [x] **Storage Management**: Implement quota checking and eviction policies.
- [x] **SearchService2 Declaration**: Manifests declare SearchService2 in their `service` array.
- [ ] **Content Search API Endpoint**: Implement actual `/search` endpoint returning AnnotationPages per IIIF Search API 2.0 spec (currently only local FlexSearch index, no API endpoint).
- [ ] **Pre-generated Tiles (Level 0)**: Generate tile pyramids during import for large images (currently all tiles generated on-demand).
- [x] **On-demand Tile Caching**: Service Worker caches generated tiles after first request.
- [x] **Error Boundaries**: Implement robust error handling for React components and Service Worker failures.
- [x] **Reliability & Recovery**: Implement "Safe Mode" and data rescue workflows for crashed sessions (Auto-save indicators added).

## 2. Ingest & Convention Layer
- [x] **Full IIIF Property Mapping**: `provider`, `homepage`, `seeAlso`, etc.
- [x] **Range Editing**: RangeEditor UI for building `structures` (table of contents).
- [x] **Auto Range Generation**: Infer Ranges from folder structure or numbered filename patterns.
- [x] **Processing Limits**: Max file size checks.
- [x] **Staging Area 2.0**: Implement "Non-Presumptive Staging Workflow" (Question-driven ingest wizard).
- [x] **Smart Sidecar Detection**: Auto-detect and link `jpg+txt` (transcription), `mp3+srt` (captions), and `tif+jpg` (derivatives).
- [x] **EXIF/XMP Metadata Extraction**: Extract camera, date, GPS data from images automatically.
- [ ] **Filename Pattern Detector**: Visual regex/pattern renaming interface for bulk file organization.
- [ ] **Duplicate Resolver**: Visual cluster view for handling file collisions (Keep A, Keep B, Keep Both).
- [ ] **Convention Configuration**: Toggle between "Standard biiif" and "Field Studio" naming conventions.
- [ ] **PDF Processing**: Render PDF pages as image sequence with text layer extraction to supplementing annotations.
- [ ] **External Manifest Import**: Fetch, validate, and reference external IIIF manifests via URL.
- [ ] **manifests.yml Parsing**: Link external manifests into collections via YAML references.
- [x] **CSV Metadata Import**: Map spreadsheet columns to IIIF properties for bulk metadata application.

## 3. Workspace Layout & UI (v3.0)
- [x] **Layout Architecture**: Standard 3-pane layout.
- [x] **Status Bar**: Global status indicators.
- [x] **Dual-View Toggle**: Persistent Files vs IIIF view.
- [x] **Command Palette**: `Cmd+K` global menu.
- [x] **Adaptive Entry**: Initial user assessment to auto-configure abstraction level (Simple/Standard/Advanced).
- [x] **Field Mode**: High-contrast toggle with larger touch targets (>48px) for outdoor use.
- [x] **Interruption Handling**: Robust auto-save and state restoration to handle browser unloads/crashes.

## 4. Mode Enhancements (Organization & Analysis)
- [x] **Collections Mode**: Hierarchy builder & Range editor.
- [x] **Boards Mode**: Spatial organization with connection tools, zoom/pan, and IIIF Manifest export.
- [x] **Viewer Mode**: Deep zoom (OpenSeadragon) with rectangle annotation tool and AV playback.
- [x] **Search Mode**: Full-text index.
- [x] **Archive: File DNA**: Visual metadata glyphs on thumbnails (Time, Location, Source).
- [x] **Archive: Drag-to-Compare**: Lightbox for side-by-side comparison of up to 4 items.
- [ ] **Archive: Synced Zoom**: Add synchronized pan/zoom across items in comparison mode.
- [x] **Collections: Drag-Drop Hierarchy**: Drag-and-drop structure manipulation (reordering, nesting).
- [x] **Collections: Convert Actions**: "Convert to Manifest" / "Convert to Collection" context menu actions.
- [ ] **Collections: Drag-to-Sequence**: Lasso tool to define Canvas ordering spatially.
- [ ] **Collections: Template Library**: Pre-configured IIIF structures (e.g., Oral History, Codex, Site Survey).
- [ ] **Viewer: Canvas Composer**: Visual interface for assembling multi-resource Canvases (images + AV + text).
- [ ] **Viewer: Overlay Comparison**: Opacity slider and difference mode for near-duplicate analysis.
- [ ] **Viewer: Light Table**: Multi-Canvas simultaneous viewing mode.
- [ ] **Viewer: Side-by-Side**: Synced pan/zoom comparison of two Canvases.
- [ ] **Viewer: AV Waveform**: Audio waveform visualization with playback controls.
- [ ] **Viewer: Video Keyframes**: Extract and display video keyframes as navigation.
- [ ] **Viewer: Thumbnail Strip**: Horizontal thumbnail navigation for Manifest items.
- [x] **Archive: Map View**: Spatial view for geotagged items using GPS coordinates.
- [x] **Archive: Timeline View**: Chronological view ordered by navDate.

## 5. Quality Control & Validation
- [x] **Real-time Validation**: Immediate visual indicators (borders, icons) on items violating IIIF specs.
- [x] **QC Dashboard**: Aggregated view of validation issues, image quality warnings, and metadata completeness.
- [ ] **Export Dry Run**: Detailed visual preview of the generated directory structure and JSON files before export.
- [ ] **Provenance Tracker**: Track and visualize file transformations and source history.
- [ ] **Checksum Verification**: SHA-256 calculation for file integrity verification.
- [ ] **Official Validator Integration**: Connect to IIIF Presentation Validator API for comprehensive compliance checks.

## 6. Instructional Design & Help
- [x] **Contextual Help**: Just-in-time micro-learning tooltips.
- [x] **Contextual Help 2.0**: Trigger-based guidance (e.g., show tip after 3 repeated errors or long hesitation).
- [x] **Scaffolding**: "Just-in-time" micro-learning overlays explaining IIIF concepts (Manifest, Canvas) when encountered.
- [ ] **Metacognitive Tools**: "Concepts Mastered" progress visualization.

## 7. Accessibility
- [ ] **Keyboard Navigation**: Comprehensive shortcuts for all new tools.
- [ ] **ARIA**: Focus management and labels.

## 8. Annotation System
- [x] **FragmentSelector (xywh)**: Basic rectangle fragment selectors for image annotations.
- [x] **Polygon Annotation Tool**: Polygon drawing tool in Viewer with SvgSelector support.
- [ ] **Extended Selectors**: Support for PointSelector, SvgSelector (polygon), TextQuoteSelector, XPathSelector, RangeSelector.
- [ ] **timeMode Support**: Implement trim/scale/loop modes for AV annotations per IIIF spec.
- [ ] **Annotation Versioning**: Conflict resolution and history tracking for concurrent edits.
- [ ] **Annotation Tombstoning**: Proper deletion tracking for annotation synchronization.
- [ ] **OCR Integration**: Auto-generate supplementing annotations from image text recognition.

## 9. Service Declarations
- [ ] **AutoCompleteService2**: Add autocomplete service declaration alongside SearchService2.
