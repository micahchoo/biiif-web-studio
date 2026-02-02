---
name: indexeddb-management
description: Manage, monitor, and optimize Field Studio's IndexedDB storage layer. This skill provides tools for quota monitoring, space analysis, cleanup operations, checkpoint management, corruption recovery, and storage optimization. Use when managing storage quota, debugging storage issues, or optimizing storage usage.
---

# IndexedDB Management – Storage Layer Operations

When you need to manage Field Studio's browser storage, monitor quota usage, or debug storage issues, this skill guides you through storage management workflows.

## When to use this skill

- You need to **monitor storage quota** and remaining space
- You want to **analyze storage usage** by entity type
- You need to **clean up orphaned tiles** and derivatives
- You want to **manage checkpoints** (save/load/delete states)
- You're debugging **quota exceeded errors**
- You need to **recover from storage corruption**
- You want to **optimize storage usage** and reduce bloat
- You need to **export/import project state** safely

## When NOT to use this skill

- For general JavaScript storage APIs (use Web Storage docs)
- For database schema migrations (use database admin tools)
- For performance profiling (use performance-auditing skill)
- For encryption/security (use security tools)

## Inputs required from the user

- Optional: operation to perform (monitor, analyze, cleanup, recover, etc.)
- Optional: storage analysis depth (quick, full)
- Optional: cleanup strategy (aggressive, conservative)

## Field Studio Database Structure

**Database:** `biiif-archive-db`

**Stores (Object Stores):**

```
files                           (Content-addressed by SHA-256)
├── Key: SHA256 hash           (e.g., "abc123...")
├── Value: {
│   ├── hash: string
│   ├── size: number           (bytes)
│   ├── mimeType: string
│   ├── name: string           (original filename)
│   ├── uploadedAt: timestamp
│   └── data: Blob
│   }
└── Index: uploadedAt, mimeType

derivatives                     (Tile pyramids, variants)
├── Key: assetId|variant      (e.g., "asset-123|v3")
├── Value: {
│   ├── assetId: string
│   ├── variant: string        ('v2'|'v3'|'static')
│   ├── createdAt: timestamp
│   ├── tileInfo: { levels, width, height }
│   └── status: string         ('generating'|'complete'|'failed')
│   }
└── Size: typically 100MB-500MB per variant

project                        (IIIF tree state)
├── Key: 'current'            (Single project slot)
├── Value: {
│   ├── root: ICollection     (Full IIIF tree)
│   ├── version: number
│   └── lastModified: timestamp
│   }
└── Size: typically 1-10MB

checkpoints                    (Named save states)
├── Key: checkpointName       (e.g., "pre-migration-2026-02-01")
├── Value: {
│   ├── name: string
│   ├── createdAt: timestamp
│   ├── root: ICollection     (Full snapshot)
│   ├── description?: string
│   └── size: number          (bytes)
│   }
└── Size: 1-10MB per checkpoint

tiles                          (Individual tile blobs)
├── Key: tilePath             (e.g., "asset-123/0/0_0.jpg")
├── Value: Blob               (JPEG tile data)
├── Index: createdAt          (For LRU eviction)
└── LRU Cache: 500MB max (oldest tiles evicted)

tileManifests                  (Tile pyramid metadata)
├── Key: assetId
├── Value: {
│   ├── assetId: string
│   ├── levels: number        (0-indexed depth)
│   ├── tileSize: number      (typically 256)
│   ├── topLevelSize: number  (pixels)
│   ├── createdAt: timestamp
│   └── tiles: Map<path, size>
│   }
└── Index: createdAt
```

## Workflow

### 1. Monitor Storage Quota

**Check current quota:**
```typescript
import { storage } from '@/services/storage';

async function checkStorageStatus() {
  const quota = await storage.estimateQuota();

  console.log(`Storage Usage:`);
  console.log(`- Used: ${formatBytes(quota.usage)}`);
  console.log(`- Quota: ${formatBytes(quota.quota)}`);
  console.log(`- Percentage: ${((quota.usage / quota.quota) * 100).toFixed(1)}%`);

  if (quota.usage / quota.quota > 0.95) {
    console.warn('⚠️ CRITICAL: Storage at 95%+ capacity!');
  } else if (quota.usage / quota.quota > 0.90) {
    console.warn('⚠️ WARNING: Storage at 90%+ capacity');
  }

  return quota;
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
```

**Output:**
```
Storage Usage:
- Used: 523.4 MB
- Quota: 548.0 MB
- Percentage: 95.5%
⚠️ CRITICAL: Storage at 95%+ capacity!
```

### 2. Analyze Storage Usage by Type

**Breakdown by store:**
```typescript
async function analyzeStorageBreakdown() {
  const breakdown = await storage.analyzeUsage();

  console.log('Storage by Type:');
  Object.entries(breakdown).forEach(([storeName, info]) => {
    console.log(`\n${storeName}:`);
    console.log(`  - Count: ${info.count} items`);
    console.log(`  - Size: ${formatBytes(info.size)}`);
    console.log(`  - Percentage: ${info.percentage.toFixed(1)}%`);
  });

  return breakdown;
}
```

**Example output:**
```
Storage by Type:

tiles:
  - Count: 8432 items
  - Size: 432.1 MB
  - Percentage: 82.5%

derivatives:
  - Count: 12 items
  - Size: 63.4 MB
  - Percentage: 12.1%

files:
  - Count: 245 items
  - Size: 22.8 MB
  - Percentage: 4.4%

project:
  - Count: 1 item
  - Size: 2.1 MB
  - Percentage: 0.4%

checkpoints:
  - Count: 5 items
  - Size: 2.6 MB
  - Percentage: 0.5%

Total: 523.0 MB / 548 MB (95.5%)
```

### 3. Identify Orphaned Tiles

**Find tiles for deleted assets:**
```typescript
async function findOrphanedTiles() {
  const orphaned = await storage.findOrphanedTiles();

  console.log(`Found ${orphaned.count} orphaned tiles`);
  console.log(`Recoverable space: ${formatBytes(orphaned.size)}`);

  orphaned.tiles.forEach(tile => {
    console.log(`- ${tile.path} (${formatBytes(tile.size)})`);
  });

  return orphaned;
}
```

### 4. Clean Up Storage

**Conservative cleanup (safe):**
```typescript
async function cleanupConservative() {
  const result = await storage.cleanup({
    strategy: 'conservative',
    options: {
      deleteOrphanedTiles: true,      // Delete unreferenced tiles
      deleteFailedDerivatives: true,  // Delete failed tile generations
      pruneLRUTiles: false,           // Keep all valid tiles
      deleteOldCheckpoints: false,    // Keep all checkpoints
    },
  });

  console.log(`Cleanup Results:`);
  console.log(`- Deleted: ${result.deleted} items`);
  console.log(`- Freed: ${formatBytes(result.freed)}`);
  console.log(`- New usage: ${formatBytes(result.newUsage)}`);

  return result;
}
```

**Aggressive cleanup (when critical):**
```typescript
async function cleanupAggressive() {
  const result = await storage.cleanup({
    strategy: 'aggressive',
    options: {
      deleteOrphanedTiles: true,
      deleteFailedDerivatives: true,
      pruneLRUTiles: true,            // Delete oldest tiles
      maxTileAge: 30 * 24 * 60 * 60,  // 30 days
      deleteOldCheckpoints: true,
      maxCheckpoints: 2,              // Keep 2 most recent
      maxProjectBackups: 1,           // Keep 1 backup
    },
  });

  return result;
}
```

### 5. Manage Checkpoints

**Create checkpoint:**
```typescript
async function createCheckpoint(name, description) {
  const checkpoint = await storage.saveCheckpoint({
    name,                          // e.g., "before-major-refactor"
    description,                   // e.g., "Backup before reorganizing collections"
  });

  console.log(`✓ Checkpoint created: "${name}" (${formatBytes(checkpoint.size)})`);
  return checkpoint;
}

// Usage:
await createCheckpoint(
  'pre-migration-' + new Date().toISOString().split('T')[0],
  'Before migrating from v2 to v3 manifests'
);
```

**List checkpoints:**
```typescript
async function listCheckpoints() {
  const checkpoints = await storage.listCheckpoints();

  console.log(`Checkpoints (${checkpoints.length}):`);
  checkpoints.forEach(cp => {
    const age = Date.now() - cp.createdAt;
    const days = Math.floor(age / (24 * 60 * 60 * 1000));
    console.log(`- "${cp.name}" (${formatBytes(cp.size)}, ${days}d old)`);
    console.log(`  ${cp.description || 'No description'}`);
  });

  return checkpoints;
}
```

**Load checkpoint:**
```typescript
async function loadCheckpoint(name) {
  try {
    const checkpoint = await storage.loadCheckpoint(name);
    console.log(`✓ Loaded checkpoint: "${name}"`);
    console.log(`  Contains ${checkpoint.root.items?.length || 0} collections`);
    return checkpoint;
  } catch (error) {
    console.error(`Failed to load checkpoint: ${error.message}`);
  }
}
```

**Delete checkpoint:**
```typescript
async function deleteCheckpoint(name) {
  const freed = await storage.deleteCheckpoint(name);
  console.log(`✓ Deleted checkpoint: "${name}" (freed ${formatBytes(freed)})`);
}
```

### 6. Recover from Storage Issues

**Corruption detection:**
```typescript
async function detectCorruption() {
  const issues = await storage.validateIntegrity();

  if (issues.length === 0) {
    console.log('✓ Storage integrity OK');
    return;
  }

  console.log(`Found ${issues.length} issues:`);
  issues.forEach(issue => {
    console.log(`- [${issue.severity}] ${issue.message}`);
    console.log(`  Location: ${issue.store}/${issue.key}`);
  });

  return issues;
}
```

**Recovery steps:**
```typescript
async function recover(strategy = 'automatic') {
  console.log('Starting recovery process...');

  // 1. Validate current state
  const issues = await storage.validateIntegrity();
  console.log(`Found ${issues.length} integrity issues`);

  // 2. Try to heal
  if (strategy === 'automatic') {
    const healed = await storage.heal();
    console.log(`✓ Automatically healed ${healed.count} issues`);
  }

  // 3. Load from checkpoint if needed
  if (issues.some(i => i.severity === 'error')) {
    const checkpoints = await storage.listCheckpoints();
    if (checkpoints.length > 0) {
      console.log(`Loading from checkpoint: "${checkpoints[0].name}"`);
      await storage.loadCheckpoint(checkpoints[0].name);
      console.log('✓ State restored from checkpoint');
    }
  }
}
```

### 7. Export & Import Data

**Export project state:**
```typescript
async function exportProject(filename = 'field-studio-export.json') {
  const quota = await storage.estimateQuota();

  if (quota.usage > 100 * 1024 * 1024) {
    console.warn('⚠️ Large export may take time. Consider using streaming export.');
  }

  const project = await storage.loadProject();
  const data = JSON.stringify(project, null, 2);

  // In Node.js:
  // await writeFile(filename, data);

  // In browser:
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  console.log(`✓ Exported to ${filename}`);
}
```

**Import project state:**
```typescript
async function importProject(file) {
  // Create checkpoint first
  const backup = await storage.saveCheckpoint({
    name: 'pre-import-' + new Date().toISOString(),
    description: 'Automatic backup before import',
  });

  try {
    const text = await file.text();
    const project = JSON.parse(text);

    // Validate before importing
    const { isValid, errors } = validator.validateTree(project.root);
    if (!isValid) {
      console.warn(`Validation issues found: ${errors.length}`);
    }

    // Save to storage
    await storage.saveProject(project);
    console.log('✓ Import successful');
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    console.log('Restoring from backup...');
    await storage.loadCheckpoint(backup.name);
    throw error;
  }
}
```

## Storage Optimization Guidelines

### Tier 1: Files Store
- **Content-addressed by SHA-256**
- Automatic deduplication
- Immutable once stored
- Low maintenance
- Rarely needs cleanup

### Tier 2: Project Store
- **Single current state slot**
- Compressed automatically
- Regular saves (on every action)
- Typically 1-10MB
- Can cause slow saves if too large

### Tier 3: Derivatives Store
- **Regenerable tile pyramids**
- Takes longest to generate
- Consider keeping multiple variants
- Can be deleted and regenerated
- Monitor for failed generations

### Tier 4: Tiles Store
- **LRU-evicted cache (500MB max)**
- Highest churn (created/deleted often)
- Regenerated on demand
- Safe to clean aggressively
- Oldest tiles evicted automatically

### Tier 5: Checkpoints Store
- **Named snapshots**
- Keep 2-5 most recent
- Delete older than 30 days
- Use before major operations
- Occupies significant space

## Files in this skill

- **SKILL.md** – This entrypoint
- **references/database-schema.md** – Detailed IndexedDB schema
- **references/storage-limits.md** – Quota limits by browser
- **scripts/monitor-quota.js** – Continuous quota monitoring
- **scripts/analyze-usage.sh** – Detailed usage breakdown
- **scripts/cleanup.sh** – Automated cleanup routines
- **scripts/checkpoint-manager.sh** – Checkpoint management

## Success criteria

IndexedDB management is successful when:

- Storage usage is monitored and alerts trigger before quota exceeded
- Cleanup operations recover significant space without data loss
- Checkpoints are created before risky operations
- Orphaned tiles are identified and removed
- Project state can be exported/imported safely
- Recovery procedures restore functional state after corruption
- Users understand storage limits and optimization strategies

---

*Skill last updated: 2026-02-01*
*Part of Field Studio AI assistant infrastructure*
