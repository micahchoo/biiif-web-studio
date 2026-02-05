# Collection Entity (`src/entities/collection/`)

The **Collection entity** represents a IIIF Collection — a grouping of Manifests and/or other Collections.

## What is a Collection?

In IIIF Presentation API 3.0, a Collection:
- Contains an ordered list of Manifests and/or nested Collections
- Has descriptive metadata (label, description, attribution)
- Can be hierarchical (collections within collections)
- Can reference manifests without owning them (membership)

## Entity Structure

```
src/entities/collection/
├── model.ts      ← Selectors: read collection data from vault
├── actions.ts    ← Action creators: modify collection data
├── index.ts      ← Public API export
└── README.md     ← This file
```

## Key Concepts

Collections in IIIF 3.0 have two types of relationships:

1. **Hierarchical** (parent-child): A collection can own nested collections
2. **Membership** (many-to-many): A collection can reference manifests or other collections without owning them

The Collection entity supports both patterns.

## Usage in Features

### Reading Collection Data (Model)

```typescript
import { collection } from '@/src/entities';

// Get a collection by ID
const collectionData = collection.model.selectById(state, 'collection-id');

// Get all collections
const allCollections = collection.model.selectAll(state);

// Get member IDs (manifests or nested collections)
const memberIds = collection.model.selectMembers(state, collectionId);

// Get parent collection (hierarchical ownership)
const parentId = collection.model.selectParentCollection(state, collectionId);

// Get all collections that reference this collection (many-to-many)
const memberOfCollections = collection.model.selectCollectionMemberships(state, collectionId);

// Get ancestors (path to root)
const ancestors = collection.model.selectAncestors(state, collectionId);

// Get descendants (nested items)
const descendants = collection.model.selectDescendants(state, collectionId);

// Get metadata
const label = collection.model.selectLabel(state, collectionId);
const summary = collection.model.selectSummary(state, collectionId);
const metadata = collection.model.selectMetadata(state, collectionId);

// Get counts
const memberCount = collection.model.countMembers(state, collectionId);
const manifestCount = collection.model.countManifests(state, collectionId);
```

### Modifying Collection Data (Actions)

```typescript
import { collection } from '@/src/entities';
import { useVault } from '@/services/vault';

const vault = useVault();

// Update collection label
const action = collection.actions.updateLabel(collectionId, { en: ['New Collection Name'] });
vault.dispatch(action);

// Update summary/description
const action = collection.actions.updateSummary(collectionId, { en: ['Description'] });
vault.dispatch(action);

// Update metadata
const action = collection.actions.updateMetadata(collectionId, [
  { label: { en: ['Author'] }, value: { en: ['Name'] } }
]);
vault.dispatch(action);

// Add a member (manifest or collection)
const action = collection.actions.addMember(collectionId, memberId);
vault.dispatch(action);

// Move to different parent collection
const action = collection.actions.moveToParentCollection(collectionId, newParentId, index);
vault.dispatch(action);

// Update rights
const action = collection.actions.updateRights(collectionId, 'https://creativecommons.org/licenses/by/4.0/');
vault.dispatch(action);

// Update viewing behavior
const action = collection.actions.updateBehavior(collectionId, ['multi-part']);
vault.dispatch(action);

// Batch update
const action = collection.actions.batchUpdate(collectionId, { 
  label: { en: ['New'] }, 
  summary: { en: ['Desc'] } 
});
vault.dispatch(action);
```

## Available Selectors (Model)

| Selector | Purpose |
|----------|---------|
| `selectById(state, id)` | Get collection by ID |
| `selectAll(state)` | Get all collections |
| `selectMembers(state, collectionId)` | Get member IDs |
| `selectParentCollection(state, collectionId)` | Get parent collection ID |
| `selectCollectionMemberships(state, collectionId)` | Get collections referencing this one |
| `selectAncestors(state, collectionId)` | Get path to root |
| `selectDescendants(state, collectionId)` | Get all nested items |
| `selectLabel(state, collectionId)` | Get label |
| `selectSummary(state, collectionId)` | Get description |
| `selectMetadata(state, collectionId)` | Get metadata array |
| `countMembers(state, collectionId)` | Count total members |
| `countManifests(state, collectionId)` | Count manifest members only |

## Available Actions

| Action | Purpose |
|--------|---------|
| `updateLabel(collectionId, label)` | Update collection label |
| `updateSummary(collectionId, summary)` | Update description |
| `updateMetadata(collectionId, metadata)` | Update metadata |
| `addMember(collectionId, memberId)` | Add member reference |
| `moveToParentCollection(collectionId, parentId, index?)` | Move to different parent |
| `updateRights(collectionId, rights)` | Update rights statement |
| `updateBehavior(collectionId, behavior)` | Update viewing behavior |
| `batchUpdate(collectionId, changes)` | Update multiple properties |

## Rules

✅ **Correct Usage:**
- Import from `@/src/entities` not from `@/services`
- Use selectors for reading, actions for writing
- Dispatch actions through vault
- Understand the difference between members and children

❌ **Incorrect Usage:**
- Don't import directly from `services/vault` in features
- Don't mutate collection data directly
- Don't confuse `selectMembers` (membership) with `selectDescendants` (hierarchy)

## Relationships

```
Collection (can be parent)
    ├── Collection (nested - owned)
    │       └── Manifest
    └── Manifest (member - referenced)
            └── Canvas
```

A collection can both own nested collections AND reference manifests as members.
