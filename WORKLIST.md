# IIIF Field Archive Studio - Implementation Worklist

**Last Updated**: 2026-01-23
**Spec Version**: Technical Specification v3.0

---

## 🚀 Active Sprint (Next Batch)

These tasks prioritize offline reliability, spec compliance, and foundational accessibility.

- [x] **Static Export: Offline Viewer Bundling** (Critical)
  - Replace CDN links in `exportService.ts` with bundled Universal Viewer assets.
  - Ensure exported ZIP is fully self-contained and works without internet.
- [x] **Ingest: Smart Sidecar Detection** (High)
  - Automatically link `.txt` (transcriptions) and `.srt` (captions) to media files during ingest in `iiifBuilder.ts`.
  - Create `supplementing` annotations for detected sidecars.
- [x] **Accessibility: ARIA & Keyboard Audit** (Critical)
  - Add missing ARIA labels to Sidebar, Toolbar, and Inspector components.
  - Verify focus traps for modals and resizable panels.
- [x] **Compliance: Image API Protocol Property** (Medium)
  - Add `"protocol": "http://iiif.io/api/image"` to `info.json` generation in `exportService.ts` and `sw.js`.
- [x] **IIIF Compliance: Full Behavior Support** (High)
  - Added all 12+ IIIF spec behavior values with descriptions and category labels.
  - Implemented behavior conflict detection and auto-resolution in MetadataEditor.
  - Created `BEHAVIOR_DEFINITIONS` with full spec-compliant descriptions.
- [x] **Board System: IIIF Manifest Export** (High)
  - Export boards as valid IIIF Manifests with large Canvases.
  - Items positioned as painting annotations with fragment selectors.
  - Connections exported as linking annotations with relationship metadata.
- [x] **Performance: Background Tile Pre-generation** (High)
  - Created `tileWorker.ts` with Web Worker pool for parallel tile generation.
  - Thumbnails generated immediately for UI; larger sizes (600, 1200) queued for background processing.
  - Non-blocking ingest with progress reporting.
- [x] **Archival: Provenance PREMIS Export** (Medium)
  - Full PREMIS 3.0 compliant XML export with intellectual entities, events, agents, and relationships.
  - Added `exportMultiplePREMIS()` for batch export.
  - Enhanced event detail structure with property change tracking.

---

## 📋 Backlog (Prioritized)

### Critical - Architecture Foundation (from ARCHITECTURE_INSPIRATION.md)
- [x] **Vault: Normalized State** - O(1) entity lookup, no full-tree clones on update.
  - Created `services/vault.ts` with flat entity storage by type
  - `normalize()` and `denormalize()` functions for tree conversion
  - O(1) operations: getEntity, updateEntity, addEntity, removeEntity, moveEntity
- [x] **Vault: Action-Driven Mutations** - Pre-validated mutations with undo/redo.
  - Created `services/actions.ts` with 15+ typed action definitions
  - Reducer with validation (language maps, behaviors, dimensions, rights URLs)
  - `ActionHistory` class with configurable max size, `ActionDispatcher` with listeners
- [x] **LanguageString Class** - Immutable wrapper for language maps.
  - Added to `types.ts` with fallback chain (locale → none → @none → en → first)
  - Immutable operations: set, setAll, append, remove, merge
  - Utilities: isEmpty, hasLocale, locales, equals, of, empty
- [x] **Entity Hooks** - React hooks for IIIF resources with memoization.
  - Created `hooks/useIIIFEntity.ts` with VaultProvider context
  - Specialized: `useManifest`, `useCanvas`, `useAnnotation`, `useCollection`, `useRange`
  - Utilities: `useHistory`, `useRoot`, `useBulkOperations`, `useEntitySearch`

### High Priority - Architecture Integration
- [ ] **Spec Bridge: V2/V3 Import** - Auto-upgrade IIIF v2 manifests on import.
  - Integrate `@iiif/parser` upgrader or implement lightweight upgrader
  - Detect version from @context, normalize to v3 internally

### Medium Priority
- [ ] **UX: Metadata Complexity Slider** - Toggle visible metadata fields based on user persona (Simple vs Expert).
- [ ] **Ingest: Visual Preview Wizard** - Show the proposed IIIF structure before committing files to IndexedDB.
- [ ] **Annotation: Polygon Tool (SvgSelector)** - Implementation of non-rectangular selection regions.
- [ ] **Search: Autocomplete Service** - Implement `AutoCompleteService2` for global search.
- [ ] **Selector Abstraction** - Parse URI fragments (`#xywh=`, `#t=`) into objects for AV/region support.

### Low Priority / Future
- [ ] **AI: OCR Integration** - Tesseract.js integration for auto-transcription of image sidecars.
- [ ] **Learning: Progress Analytics** - Dashboard showing IIIF concepts mastered by the user.
- [ ] **Convention: biiif Migration Tools** - Bidirectional conversion for standard `biiif` folder structures.
- [ ] **Workbench Architecture** - Refactor views into self-contained workbench modules.

---

## ✅ Completed Items

### Architecture Foundation
- [x] **Vault Normalized State** - `services/vault.ts` with O(1) entity lookups, flat storage.
- [x] **Action-Driven Mutations** - `services/actions.ts` with validated mutations and undo/redo.
- [x] **LanguageString Class** - Immutable language map wrapper in `types.ts`.
- [x] **Entity Hooks** - `hooks/useIIIFEntity.ts` with useManifest, useCanvas, useAnnotation, etc.
- [x] **Background Tile Generation** - `services/tileWorker.ts` with Web Worker pool.

### Core Infrastructure
- [x] **Static Export Offline Bundling** - Self-contained exports with local viewer assets.
- [x] **Smart Sidecar Detection** - Auto-linking of transcriptions and captions during ingest.
- [x] **Service Worker Image API** - IIIF Image API 3.0 Level 2 implementation.
- [x] **IndexedDB Storage** - Local-first persistence for files and project state.
- [x] **Search Service** - Full-text search using FlexSearch.
- [x] **Content State API** - `iiif-content` parameter handling and link generation (Verified in `App.tsx`).
- [x] **Virtualized Data Model** - LRU cache and lazy loading implemented in `services/virtualizedData.ts`.
- [x] **Provenance System** - Change tracking, history panel, full PREMIS 3.0 export.
- [x] **Full Behavior Support** - All 12+ IIIF behaviors with descriptions and conflict detection.
- [x] **Board Export** - Export boards as IIIF Manifests with positioned annotations.

### User Interface
- [x] **3-Panel Layout** - Responsive workspace with resizable panels.
- [x] **Field Mode** - High-contrast, touch-optimized UI for outdoor research.
- [x] **Archive Views** - Grid, List, Map, and Timeline visualizations.
- [x] **Onboarding** - Persona selection and abstraction level scaffolding.
- [x] **Command Palette** - Quick navigation and actions (Cmd+K).

---

## Notes
- **Architecture**: Moving toward `@iiif/vault` pattern for state normalization (See `ARCHITECTURE_INSPIRATION.md`).
- **Expert Feedback**: Incorporated recommendations from simulated Archivist, HF Engineer, and IIIF Expert reviews.
