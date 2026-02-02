# User Goal Matrix – Feature Set Mapping

This matrix maps each feature set (directory) to the user goals it supports, the specific user achievements, and example test files. Use it to understand coverage gaps and ensure tests align with what users actually achieve.

## Overview

The IIIF Field Archive Studio test suite is organized into eight feature sets, each representing a distinct user goal. Every test file within a feature set should correspond to one or more user achievements listed below.

## Feature Set 1: `organize-media/`

**User Goal:** Import field research media and organize it into structured collections.

**User Achievements:**
- Import photos from camera/phone
- Detect numbered sequences automatically
- Preserve folder hierarchies
- Group multi‑angle captures
- Handle mixed media formats (images, PDFs, videos)

**Example Test Files:**
- `import‑and‑structure.test.ts` – Import workflows with real images
- `reorder‑and‑reorganize.test.ts` – Structure management (add, remove, reorder)
- `csvImporter.test.ts` – Import metadata from CSV
- `filenameUtils.test.ts` – Sequence detection and pattern matching
- `mediaTypes.test.ts` – Media format recognition

**Key Actions Tested:** Import, detect sequences, create ranges, reorder, import CSV.

**Coverage Checklist:**
- [ ] Import from local files
- [ ] Import from external URLs
- [ ] Sequence detection (numbered patterns)
- [ ] Hierarchy preservation
- [ ] Multi‑angle grouping
- [ ] CSV metadata import
- [ ] Media type detection
- [ ] Reordering of items
- [ ] Bulk import performance

## Feature Set 2: `describe-content/`

**User Goal:** Add context and metadata to make research discoverable and meaningful.

**User Achievements:**
- Add descriptive labels
- Record metadata (date, location, researcher)
- Set rights and attributions
- Add annotations and notes
- Extract EXIF/GPS automatically

**Example Test Files:**
- `labels‑and‑metadata.test.ts` – Content management (labels, metadata, rights, behaviors)
- `exif‑extraction.test.ts` – Automatic metadata extraction from photos
- `MetadataEditor.test.tsx` – React component for editing metadata
- `provenanceService.test.ts` – Provenance tracking
- `useVaultSelectors.test.tsx` – React hooks for selecting vault data

**Key Actions Tested:** updateLabel, updateMetadata, updateRights, extract EXIF, add provenance.

**Coverage Checklist:**
- [ ] Label editing
- [ ] Metadata field editing
- [ ] Rights statement management
- [ ] Annotation creation/editing
- [ ] EXIF extraction (GPS, date, camera)
- [ ] Provenance tracking
- [ ] Multi‑language support
- [ ] Validation of metadata fields

## Feature Set 3: `validate-quality/`

**User Goal:** Ensure IIIF compliance and catch errors before sharing.

**User Achievements:**
- Validate manifests against IIIF spec
- Auto‑fix common issues
- Detect conflicts (behaviors, IDs)
- Preview viewer compatibility
- Get clear error messages with fixes

**Example Test Files:**
- `iiifValidation.test.ts` – ID validation, URI checking, duplicate detection
- `validationHealer.test.ts` – Auto‑fixing validation issues
- `validator.test.ts` – Full‑tree validation
- `sanitization.test.ts` – Security sanitization (XSS prevention)
- `iiifBehaviors.test.ts` – IIIF behavior validation and conflict detection
- `iiifHierarchy.test.ts` – Hierarchy integrity validation
- `iiifTypes.test.ts` – Type‑related validation
- `vault.test.ts` – Vault integrity under load
- `errorRecovery.test.ts` – Recovery from corruption

**Key Actions Tested:** Validate tree, auto‑heal, check behaviors, sanitize input, recover from errors.

**Coverage Checklist:**
- [ ] IIIF spec validation (Presentation API 3.0)
- [ ] URI validity
- [ ] Required fields presence
- [ ] Duplicate ID detection
- [ ] Behavior conflict detection
- [ ] Hierarchy integrity
- [ ] Sanitization of user input
- [ ] Auto‑healing of common issues
- [ ] Error recovery mechanisms
- [ ] Performance under load

## Feature Set 4: `search-and-find/`

**User Goal:** Quickly find content across large archives without manual browsing.

**User Achievements:**
- Full‑text search across labels/metadata
- Fuzzy matching for misspellings
- Filter by type (manifest/canvas)
- Autocomplete from history
- Temporal search (by date)
- Spatial search (by location)

**Example Test Files:**
- `search‑and‑filter.test.ts` – Keyword search, fuzzy matching, filtering
- `fuzzyMatch.test.ts` – Fuzzy matching algorithm

**Key Actions Tested:** Search, filter, autocomplete, navigate timeline/map.

**Coverage Checklist:**
- [ ] Keyword search across labels
- [ ] Keyword search across metadata
- [ ] Fuzzy matching (typo tolerance)
- [ ] Filter by resource type
- [ ] Autocomplete suggestions
- [ ] Date‑range filtering
- [ ] Location‑based filtering
- [ ] Search performance with large datasets

## Feature Set 5: `export-and-share/`

**User Goal:** Turn field research archives into shareable formats for collaboration, publication, and preservation.

**User Achievements:**
- Export raw IIIF bundles
- Generate static websites (Canopy)
- Share via IIIF Presentation API
- Prepare for long‑term preservation
- Collaborate with external teams
- Export subsets and selections

**Example Test Files:**
- `export‑actions.test.ts` – User‑facing export workflows (button clicks, format selection)
- `exportService.test.ts` – Unit tests for export service logic
- `iiifBuilder.test.ts` – IIIF manifest building from file trees

**Key Actions Tested:** Export raw IIIF, export static site, export Canopy, export archival.

**Coverage Checklist:**
- [ ] IIIF bundle export (ZIP)
- [ ] Static website generation
- [ ] IIIF Presentation API endpoint
- [ ] Preservation packaging (BagIt/PREMIS)
- [ ] Shareable link generation
- [ ] Subset export (filtered selection)
- [ ] Validation before export
- [ ] Performance with large archives

## Feature Set 6: `manage-lifecycle/`

**User Goal:** Control storage, deletion, and application settings to maintain archives over time.

**User Achievements:**
- Monitor and manage storage
- Soft delete with recovery
- Configure application settings
- Handle large archives
- Maintain data integrity

**Example Test Files:**
- `trashService.test.ts` – Trash/restore functionality
- `storage.test.ts` – Storage quota monitoring and optimization
- `useAppSettings.test.ts` – Application settings persistence

**Key Actions Tested:** moveToTrash, restoreFromTrash, emptyTrash, cleanup storage, update settings.

**Coverage Checklist:**
- [ ] Soft delete (move to trash)
- [ ] Restore from trash
- [ ] Permanent deletion
- [ ] Storage quota monitoring
- [ ] Storage cleanup
- [ ] Application settings persistence
- [ ] Data integrity after deletions
- [ ] Bulk delete operations

## Feature Set 7: `view-and-navigate/`

**User Goal:** Browse, inspect, and interact with research archives in a responsive, accessible viewer.

**User Achievements:**
- View high‑resolution images with IIIF Image API
- Navigate hierarchical archives
- Responsive design across devices
- Performance optimization
- Multi‑viewer compatibility

**Example Test Files:**
- `imageSourceResolver.test.ts` – Image URI resolution and format handling
- `iiifImageApi.test.ts` – IIIF Image API request building and tile calculation
- `performance.test.ts` – Rendering performance with large archives
- `useResponsive.test.ts` – Responsive breakpoints and layout adaptation

**Key Actions Tested:** Zoom, pan, tile loading, navigate sequence, view annotations.

**Coverage Checklist:**
- [ ] IIIF Image API tile loading
- [ ] Deep zoom and pan
- [ ] Responsive layout adaptation
- [ ] Performance with many canvases
- [ ] Navigation (prev/next, hierarchy)
- [ ] Multi‑viewer compatibility (Mirador, Universal Viewer)
- [ ] Accessibility (keyboard navigation, screen readers)

## Feature Set 8: `collaborate/`

**User Goal:** Work together with other researchers on the same archive without conflicts or data loss.

**User Achievements:**
- Concurrent editing without conflicts
- Change tracking and audit trail
- Multi‑user synchronization
- Permission and access control
- Collaborative annotations and discussion

**Example Test Files:**
- `concurrency.test.ts` – Concurrent vault and storage operations, race‑condition detection

**Key Actions Tested:** Sync, detect conflicts, resolve conflicts, offline editing.

**Coverage Checklist:**
- [ ] Concurrent edits (optimistic locking)
- [ ] Conflict detection
- [ ] Conflict resolution UI
- [ ] Change audit trail
- [ ] Multi‑user synchronization
- [ ] Offline editing and sync
- [ ] Permission levels (view/edit/admin)

## Cross‑Cutting Tests (Root Level)

Some tests span multiple feature sets and are kept at the root of `src/test/__tests__/`:

- `actions.test.ts` – Action dispatcher, mutations, and history management
- `components.test.tsx` – Production UI components (Icon, EmptyState, LoadingState, etc.)
- `hooks.test.ts` – React hooks (useAppSettings, useResponsive, etc.)
- `integration.test.tsx` – End‑to‑end user workflows with real image files and React components

These tests verify foundational behavior that is used across multiple user goals.

## Using This Matrix for Coverage Analysis

1. **Identify gaps** – Compare the coverage checklist against existing test files. If a checkbox has no corresponding test, consider adding one.

2. **Align new tests** – When writing a new test, decide which user achievement it supports and place it in the appropriate feature set directory.

3. **Refactor mis‑placed tests** – If a test file exists in a directory that doesn’t match its user goal, move it to the correct feature set.

4. **Measure completeness** – Count the number of checked items per feature set to gauge how well each user goal is covered.

## Mapping to IDEAL OUTCOME / FAILURE PREVENTED

Each test should define:

- **IDEAL OUTCOME:** What success looks like for the app's aspirations.
- **FAILURE PREVENTED X Actions:** What the failure in the app prevented the user from doing
Refer to the test structure pattern in [src/test/__tests__/README.md](src/test/__tests__/README.md) lines 190‑206.

## Version History

- **2026‑01‑31** – Test suite reorganization completed; feature‑based structure established.
- **2026‑02‑01** – This matrix created as part of the test‑suite‑management skill.

---
*Use this matrix to ensure every user achievement has corresponding tests and that the test suite remains user‑centric.*