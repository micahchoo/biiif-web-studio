---
name: vault-debugging
description: Debug, inspect, and validate the Vault state management system in Field Studio. This skill provides tools for examining vault entities, tracing actions, analyzing update history, detecting state corruption, and validating entity relationships. Use when troubleshooting state-related bugs, verifying action execution, understanding state transitions, or diagnosing consistency issues.
---

# Vault Debugging – State Management Inspector

When you need to troubleshoot the Vault normalized state system, this skill guides you through debugging workflows for the Field Studio's core state management layer.

## When to use this skill

- You need to **inspect current vault state** and verify entities are stored correctly.
- You want to **trace action execution** to see how state changed over time.
- You need to **analyze entity relationships** and detect broken references.
- You're debugging **undo/redo history** and stack corruption.
- You suspect **state consistency issues** between normalized entities.
- You want to **validate vault integrity** after complex operations.
- You need to **understand state transitions** during a specific workflow.

## When NOT to use this skill

- For general Redux or Context debugging in other projects.
- For UI component state issues (use component debugging tools).
- For storage layer issues (use indexeddb-management skill).
- For performance profiling (use performance-auditing skill).

## Inputs required from the user

- Optional: specific entity type to inspect (Collection, Manifest, Canvas, etc.)
- Optional: entity ID to focus on
- Optional: time range or action count to analyze
- Optional: which check to run (integrity, relationships, history, etc.)

## Core Vault Concepts

**Vault Pattern:** Flat entity storage with relationship indexes (not nested trees)

```typescript
// What the Vault stores:
{
  collections: Map<string, ICollection>     // Root collections indexed by ID
  manifests: Map<string, IManifest>         // Manifests indexed by ID
  canvases: Map<string, ICanvas>            // Canvases indexed by ID
  ranges: Map<string, IRange>               // Ranges indexed by ID
  annotationPages: Map<string, IAnnotationPage>
  annotations: Map<string, IAnnotation>

  // Relationships (denormalized indexes):
  collectionStructure: Map<collectionId, childrenIds[]>
  manifestStructure: Map<manifestId, canvasIds[]>
  manifestRanges: Map<manifestId, rangeIds[]>
  annotationStructure: Map<canvasId, annotationPageIds[]>

  // Operations:
  typeIndex: Map<entityId, entityType>      // Quick type lookup
}
```

## Workflow

### 1. Inspect Current Vault State

**Use case:** Verify entities exist and are structured correctly after operations.

```bash
# Using browser DevTools console:
import { useVaultState } from '@/hooks/useVaultState';

// In a React component:
const vault = useVaultState();
console.log('All manifests:', vault.manifests);
console.log('All canvases:', vault.canvases);

// Check specific entity:
const manifest = vault.manifests.get('manifest-123');
console.log('Manifest:', manifest);
```

**What to check:**
- Entity exists in the correct Map
- ID matches the key in Map
- Required fields are present (id, type, label, etc.)
- Language maps are properly formatted (`{ [lang]: [values] }`)
- Relationships are present (for Manifests: canvases array should be non-empty)

### 2. Trace Action Execution

**Use case:** Understand how an action modified the vault.

```typescript
import { useHistory } from '@/hooks/useHistory';

// Get action history:
const { history, currentIndex } = useHistory();

// Inspect a specific action:
history.forEach((entry, i) => {
  console.log(`Action ${i}:`, entry);
  // Each entry contains: { type, payload, timestamp, ... }
});

// Find actions affecting a specific entity:
const relatedActions = history.filter(entry =>
  entry.payload.id === 'manifest-123' ||
  entry.payload.manifestId === 'manifest-123'
);
```

**Expected output:**
- Action type (UPDATE_LABEL, ADD_CANVAS, REORDER_CANVASES, etc.)
- Payload (what changed)
- Timestamp
- Result (whether action succeeded)

### 3. Validate Entity Relationships

**Use case:** Detect broken references and orphaned entities.

```typescript
// Check manifest-to-canvas references:
const manifest = vault.manifests.get('manifest-id');
manifest.items.forEach(canvasId => {
  const canvas = vault.canvases.get(canvasId);
  if (!canvas) {
    console.error(`Broken reference: Manifest has canvas ID "${canvasId}" but canvas doesn't exist`);
  }
});

// Check index consistency:
const expectedType = vault.typeIndex.get('entity-id');
const actualType = vault.canvases.get('entity-id') ? 'Canvas' : null;
if (expectedType !== actualType) {
  console.error(`Type mismatch: typeIndex says "${expectedType}" but entity is "${actualType}"`);
}
```

**What to validate:**
- All entity IDs referenced exist in their respective Maps
- `typeIndex` accurately reflects entity types
- Relationship indexes (collectionStructure, manifestStructure, etc.) are bidirectional
- No orphaned entities (entities with no parent references)
- IDs are globally unique (no duplicates across entity types)

### 4. Analyze Update History

**Use case:** Trace when and how a specific entity was modified.

```typescript
import { actions } from '@/services/actions';

// Get current undo/redo stacks:
console.log('Undo stack size:', actions.getHistory().undoStack.length);
console.log('Redo stack size:', actions.getHistory().redoStack.length);

// Undo to previous state:
actions.undo();
console.log('After undo, vault state:', vault);

// Redo to return:
actions.redo();
```

**What to check:**
- Undo/redo stacks have expected depth (max 100 entries)
- State correctly reverts with undo
- State correctly reapplies with redo
- No duplicate actions in history
- Timestamps are sequential

### 5. Detect State Corruption

**Use case:** Run automated checks to identify consistency issues.

**Reference implementation - add to debug console:**

```typescript
function validateVaultIntegrity(vault) {
  const errors = [];

  // Check 1: All entity IDs exist in typeIndex
  vault.manifests.forEach((manifest, id) => {
    if (!vault.typeIndex.has(id)) {
      errors.push(`Manifest "${id}" missing from typeIndex`);
    }
  });

  // Check 2: All typeIndex entries point to real entities
  vault.typeIndex.forEach((type, id) => {
    if (type === 'Manifest' && !vault.manifests.has(id)) {
      errors.push(`typeIndex references non-existent Manifest "${id}"`);
    }
  });

  // Check 3: All canvas references are valid
  vault.manifests.forEach((manifest, mid) => {
    manifest.items?.forEach(cid => {
      if (!vault.canvases.has(cid)) {
        errors.push(`Manifest "${mid}" references non-existent Canvas "${cid}"`);
      }
    });
  });

  // Check 4: Canvas parent references are correct
  vault.canvases.forEach((canvas, cid) => {
    const parentManifest = vault.manifestStructure.get(canvas.partOf);
    if (parentManifest && !parentManifest.includes(cid)) {
      errors.push(`Canvas "${cid}" partOf Manifest but not in manifestStructure`);
    }
  });

  return errors.length === 0
    ? { valid: true, message: 'Vault integrity OK' }
    : { valid: false, errors };
}

// Run validation:
const result = validateVaultIntegrity(vault);
console.log(result);
```

## Common Debugging Scenarios

### Scenario 1: Canvas not appearing in Manifest

```typescript
// Check if canvas exists:
const canvas = vault.canvases.get('canvas-id');
if (!canvas) console.error('Canvas does not exist in vault');

// Check if canvas is in manifest's items array:
const manifest = vault.manifests.get('manifest-id');
if (!manifest.items.includes('canvas-id')) {
  console.error('Canvas not in manifest.items');
}

// Check manifestStructure index:
const manifestCanvases = vault.manifestStructure.get('manifest-id');
if (!manifestCanvases.includes('canvas-id')) {
  console.error('Canvas not in manifestStructure index');
}
```

**Fix:** Use action to add canvas properly:
```typescript
import { actions } from '@/services/actions';
actions.addCanvas('manifest-id', canvasEntity);
```

### Scenario 2: Label update not reflecting

```typescript
// Check vault contains the updated label:
const entity = vault.manifests.get('manifest-id');
console.log('Current label:', entity.label);

// Check if action succeeded:
console.log('Recent actions:', useHistory().history.slice(-5));

// Check if component is using the right hook:
// Correct: const entity = useIIIFEntity('manifest-id');
// Wrong: const entity = useState(initialState) // stale
```

**Fix:** Ensure components re-subscribe to vault changes:
```typescript
const entity = useIIIFEntity(entityId);  // Correct
const [entity, setEntity] = useState(initialEntity);  // Won't auto-update
```

### Scenario 3: Undo/Redo not working

```typescript
// Check history stack:
const { undoStack, redoStack } = actions.getHistory();
console.log(`Can undo: ${undoStack.length > 0}, entries: ${undoStack.length}`);
console.log(`Can redo: ${redoStack.length > 0}, entries: ${redoStack.length}`);

// Verify history was populated:
console.log('First action:', undoStack[0]);
console.log('Last action:', undoStack[undoStack.length - 1]);
```

**Common causes:**
- History pruning: Stack limited to 100 entries
- BATCH_UPDATE actions disable history (use sparingly)
- Actions dispatched with `skipHistory: true` flag

## Files in this skill

- **SKILL.md** – This entrypoint
- **references/vault-state-structure.md** – Detailed vault entity schema
- **references/action-types-reference.md** – All 17 action types with examples
- **scripts/vault-inspector.js** – Browser DevTools script for state inspection
- **scripts/detect-corruption.sh** – CLI tool to run integrity checks
- **scripts/action-tracer.js** – Trace and visualize action execution

## Success criteria

Vault debugging is successful when:

- All entity references are resolvable
- No orphaned or duplicate entities exist
- typeIndex accurately reflects entity locations
- Undo/redo stack operations work correctly
- State transitions match expected action effects
- No console errors when validating integrity

---

*Skill last updated: 2026-02-01*
*Part of Field Studio AI assistant infrastructure*
