# Architecture Inspiration: Digirati Manifest Editor Patterns

**Analysis Date**: 2026-01-23 | **Source**: Digirati IIIF Manifest Editor (`@iiif/vault`, `@iiif/parser`)

This document identifies opportunities to improve Field Studio's codebase based on Digirati's architectural patterns.

---

## 1. Normalized State (Vault) - **CRITICAL**
**Current**: Deep cloning `root` (`JSON.parse(JSON.stringify(root))`) and nested tree traversal on every update. O(n) performance.
**Opportunity**: Implement a flat, normalized store (Vault pattern).
```typescript
interface NormalizedState {
  entities: { [Type in IIIFType]: Record<string, IIIFItem> };
  references: Record<string, string[]>; // parent → child IDs
  rootId: string;
}
```
**Benefits**: O(1) lookups/updates, stable references for `React.memo`, natural undo/redo.

## 2. V2 ↔ V3 Bridge - **HIGH**
**Current**: Inconsistent handling of IIIF versions.
**Opportunity**: Standardize on V3 internally. Upgrade on load, optionally downgrade on export.
**Benefits**: Simplified component logic, better interoperability.

## 3. Entity Hooks & Action Mutations - **HIGH**
**Current**: Direct object mutation and manual state drilling.
**Opportunity**: Use custom hooks (`useManifest(id)`) and validated actions (`dispatch({type: 'UPDATE_LABEL', ...})`).
**Benefits**: Encapsulated complexity, spec-compliant mutations, auditable change history.

## 4. Modular Workbench Architecture - **MEDIUM**
**Current**: Monolithic view components.
**Opportunity**: Refactor into self-contained "Workbenches" (archive, collections, metadata, viewer).
**Benefits**: Clear ownership, isolated state management, easier testing.

## 5. Internationalization Utilities - **MEDIUM**
**Current**: Manual language map property access.
**Opportunity**: Implement a `LanguageString` utility class for fallback-aware getting/setting.
**Benefits**: Robust multi-locale support, cleaner component code.

---

## Pattern Summary (Best Practices)
- **Relational Identity Mapping**: Hold references (`{id, type}`) instead of full objects.
- **Annotation-as-Content**: Treat Canvas as a coordinate grid; media = painting annotations.
- **Dumb Components / Smart Store**: Move spec interpretation logic into selectors.
- **Selector Abstraction**: Parse URI fragments (`#xywh=`) into state-driven objects.
- **Resource Ghosting**: Use shell objects for lazy-loading large collections.
- **Delta-based Serialization**: Only save/sync modified fragments of the IIIF graph.
