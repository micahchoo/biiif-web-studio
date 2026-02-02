---
name: performance-auditing
description: Profile, audit, and optimize Field Studio performance. This skill provides tools for identifying bottlenecks, profiling rendering, analyzing vault updates, measuring component performance, and generating optimization recommendations. Use when diagnosing performance issues or optimizing for speed.
---

# Performance Auditing – Application Profiling & Optimization

When you need to diagnose performance issues, find bottlenecks, or optimize Field Studio's speed, this skill guides you through profiling and optimization workflows.

## When to use this skill

- You notice the **application is slow** or unresponsive
- You need to **identify performance bottlenecks**
- You want to **profile component rendering** performance
- You need to **analyze vault update performance**
- You want to **measure action dispatch latency**
- You need to **generate performance baseline metrics**
- You want to **recommend optimizations** based on data
- You're **optimizing before release** or after adding features

## When NOT to use this skill

- For network performance (use network analysis tools)
- For build-time optimization (use build analysis tools)
- For bundle size analysis (use bundle analysis tools)
- For deployment performance (use DevOps tools)

## Inputs required from the user

- Optional: specific area to profile (rendering, vault, actions, storage)
- Optional: profile duration (seconds)
- Optional: detail level (basic, detailed, comprehensive)

## Performance Baseline

Field Studio targets:
- **First Paint:** < 1s
- **Interactive:** < 2s
- **Large list render:** < 500ms for 1000 items
- **Action dispatch:** < 50ms
- **Vault update:** < 100ms per entity
- **Search indexing:** < 200ms per 1000 entities

## Workflow

### 1. Quick Performance Check

**Assess current state:**
```typescript
async function quickPerformanceCheck() {
  const metrics = {
    vaultSize: 0,
    componentCount: 0,
    renderTime: 0,
    actionLatency: [],
  };

  // 1. Check vault size
  const vault = useVaultState();
  metrics.vaultSize = Object.values(vault).reduce(
    (sum, map) => sum + map.size,
    0
  );

  // 2. Check action latency
  const start = performance.now();
  await actions.updateLabel('test-id', { en: ['Test'] });
  metrics.actionLatency.push(performance.now() - start);

  // 3. Check vault update performance
  const vault2 = useVaultState();
  console.log(`Current state:`);
  console.log(`- Total entities: ${metrics.vaultSize}`);
  console.log(`- Last action: ${metrics.actionLatency[0]?.toFixed(1)}ms`);

  return metrics;
}
```

### 2. Profile Component Rendering

**Measure render time:**
```typescript
import { useEffect, useRef } from 'react';

function useRenderProfiler(componentName) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      renderCount.current++;
      renderTimes.current.push(duration);

      if (renderCount.current % 10 === 0) {
        const avg = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        console.log(
          `[${componentName}] Render #${renderCount.current}: ` +
          `${duration.toFixed(1)}ms (avg: ${avg.toFixed(1)}ms)`
        );
      }
    };
  });

  return { renderCount: renderCount.current, times: renderTimes.current };
}

// Usage in component:
export function MyComponent() {
  const profiler = useRenderProfiler('MyComponent');
  return <div>...</div>;
}
```

**Measure React DevTools Profiler:**
```
1. Open React DevTools → Profiler tab
2. Click record circle
3. Interact with component
4. Stop recording
5. Analyze flame chart:
   - Red bars = slow commits (> 250ms)
   - Yellow bars = medium (25-250ms)
   - Green bars = fast (< 25ms)
6. Click component to see commit details
```

### 3. Analyze Vault Update Performance

**Measure action dispatch:**
```typescript
function measureActionPerformance() {
  const measurements = [];

  // Override action dispatcher temporarily
  const originalDispatch = actions.dispatch;
  actions.dispatch = function(action) {
    const start = performance.now();
    const result = originalDispatch.call(this, action);
    const duration = performance.now() - start;

    measurements.push({
      type: action.type,
      duration,
      timestamp: Date.now(),
    });

    if (duration > 100) {
      console.warn(`⚠️ Slow action: ${action.type} took ${duration.toFixed(1)}ms`);
    }

    return result;
  };

  // Restore after profiling
  setTimeout(() => {
    actions.dispatch = originalDispatch;
    analyzeResults(measurements);
  }, 60000); // Profile for 1 minute
}

function analyzeResults(measurements) {
  const byType = {};

  measurements.forEach(m => {
    if (!byType[m.type]) {
      byType[m.type] = [];
    }
    byType[m.type].push(m.duration);
  });

  console.log('Action Performance Summary:');
  Object.entries(byType).forEach(([type, durations]) => {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    console.log(
      `- ${type}: avg=${avg.toFixed(1)}ms, max=${max.toFixed(1)}ms, count=${durations.length}`
    );
  });
}
```

### 4. Monitor Memory Usage

**Track memory over time:**
```typescript
async function monitorMemory() {
  if (!performance.memory) {
    console.log('memory API not available (Chrome only)');
    return;
  }

  const readings = [];

  const interval = setInterval(() => {
    const memory = performance.memory;
    const heapPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    readings.push({
      timestamp: Date.now(),
      usedHeap: memory.usedJSHeapSize,
      heapLimit: memory.jsHeapSizeLimit,
      percent: heapPercent,
    });

    console.log(
      `Heap: ${formatBytes(memory.usedJSHeapSize)} / ` +
      `${formatBytes(memory.jsHeapSizeLimit)} (${heapPercent.toFixed(1)}%)`
    );

    if (heapPercent > 90) {
      console.warn('⚠️ Heap usage critical!');
    }
  }, 5000); // Check every 5 seconds

  // Stop after 5 minutes
  setTimeout(() => {
    clearInterval(interval);
    analyzeMemoryTrend(readings);
  }, 300000);

  return readings;
}

function analyzeMemoryTrend(readings) {
  const start = readings[0]?.percent || 0;
  const end = readings[readings.length - 1]?.percent || 0;
  const trend = end - start;

  if (trend > 10) {
    console.warn(`⚠️ Memory leak detected: +${trend.toFixed(1)}% over 5 minutes`);
  } else if (trend < -10) {
    console.log(`✓ Memory recovering: ${trend.toFixed(1)}% over 5 minutes`);
  } else {
    console.log(`✓ Memory stable: ${trend.toFixed(1)}% change`);
  }
}
```

### 5. Large List Rendering Performance

**Measure virtualization:**
```typescript
function measureListPerformance(itemCount = 1000) {
  const start = performance.now();

  // Render without virtualization (will be slow)
  const items = Array(itemCount)
    .fill(null)
    .map((_, i) => <ListItem key={i} data={data[i]} />);

  const duration = performance.now() - start;
  console.log(`Rendering ${itemCount} items: ${duration.toFixed(1)}ms`);

  if (duration > 500) {
    console.warn('⚠️ List rendering slow - consider virtualization');
  }

  return duration;
}
```

**Verify virtualization works:**
```typescript
function testVirtualization() {
  const container = document.querySelector('.virtual-list');
  const renderedItems = container?.querySelectorAll('[data-item]');
  const expectedVisible = Math.ceil(container.clientHeight / 50); // assume 50px per item

  console.log(`Virtual list stats:`);
  console.log(`- DOM nodes: ${renderedItems.length}`);
  console.log(`- Expected visible: ${expectedVisible}`);
  console.log(`- Efficiency: ${(expectedVisible / renderedItems.length * 100).toFixed(1)}%`);

  if (renderedItems.length > expectedVisible * 2) {
    console.warn('⚠️ Virtual list rendering too many items');
  }
}
```

### 6. Storage Performance

**Measure IndexedDB operations:**
```typescript
async function measureStorageOps() {
  const ops = [];

  // Test project save
  let start = performance.now();
  await storage.saveProject(vault);
  ops.push({ op: 'saveProject', duration: performance.now() - start });

  // Test file save (500KB blob)
  const blob = new Blob(['x'.repeat(500000)]);
  start = performance.now();
  await storage.saveFile(blob);
  ops.push({ op: 'saveFile', duration: performance.now() - start });

  // Test project load
  start = performance.now();
  await storage.loadProject();
  ops.push({ op: 'loadProject', duration: performance.now() - start });

  console.log('Storage Performance:');
  ops.forEach(op => {
    console.log(`- ${op.op}: ${op.duration.toFixed(1)}ms`);
  });

  return ops;
}
```

### 7. Search Performance

**Measure search indexing and queries:**
```typescript
async function measureSearchPerformance() {
  const searchService = new SearchService();

  // Test indexing
  const start = performance.now();
  const indexed = await searchService.indexManifests(allManifests);
  const indexDuration = performance.now() - start;

  console.log(
    `Indexed ${allManifests.length} manifests in ${indexDuration.toFixed(1)}ms ` +
    `(${(indexDuration / allManifests.length).toFixed(2)}ms/item)`
  );

  // Test query performance
  const queries = ['canvas', 'painting', 'annotation', 'metadata'];
  queries.forEach(query => {
    const qStart = performance.now();
    const results = searchService.search(query, { limit: 100 });
    const qDuration = performance.now() - qStart;

    console.log(
      `Query "${query}": ${results.length} results in ${qDuration.toFixed(1)}ms`
    );
  });
}
```

## Common Performance Issues & Solutions

### Issue 1: Slow Rendering of Large Manifests

**Symptoms:**
- "Application is slow when opening large manifests"
- Multiple 1000+ ms render times in React DevTools

**Diagnosis:**
```typescript
// Check if all canvases rendered at once
const manifest = vault.manifests.get(id);
console.log(`Manifest has ${manifest.items?.length} canvases`);

// Check for unnecessary re-renders
// (Use React DevTools Profiler)
```

**Solution:**
- Implement virtualization for canvas lists (use `react-window`)
- Use React.memo for canvas items
- Lazy-load canvas metadata

### Issue 2: Slow Vault Updates

**Symptoms:**
- Action dispatch takes > 100ms
- UI freezes briefly during updates

**Diagnosis:**
```typescript
const start = performance.now();
actions.updateLabel(entityId, newLabel);
console.log(`Action took ${performance.now() - start}ms`);
```

**Solutions:**
- Batch multiple updates: `actions.batchUpdate([...])`
- Use `skipHistory` for temporary changes
- Split large operations across frames using `requestIdleCallback`

### Issue 3: Memory Leak

**Symptoms:**
- Heap grows > 10% per 5 minutes
- Performance degradates over time

**Diagnosis:**
```typescript
await monitorMemory(); // Run for 5 minutes while using app
```

**Common causes:**
- Event listeners not cleaned up
- Timer intervals not cleared
- Large object references retained

### Issue 4: Slow Search

**Symptoms:**
- Search queries take > 500ms
- Indexing takes very long

**Solution:**
- Use Web Worker for indexing
- Enable `USE_WORKER_SEARCH` feature flag
- Limit index size (don't index all text)

## Profiling Tools

### Browser DevTools
1. **Performance tab** - Timeline view of all events
2. **React DevTools Profiler** - React-specific profiling
3. **Memory tab** - Heap snapshots and timeline
4. **Coverage tab** - Unused CSS/JavaScript

### Lighthouse
```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

### Web Vitals
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

## Files in this skill

- **SKILL.md** – This entrypoint
- **references/performance-targets.md** – Baseline metrics and targets
- **references/profiling-guide.md** – Detailed profiling techniques
- **references/common-bottlenecks.md** – Known performance issues and fixes
- **scripts/profile-app.js** – Automated profiling script
- **scripts/generate-report.sh** – Performance report generator
- **scripts/benchmark.sh** – Benchmark suite runner

## Success criteria

Performance auditing is successful when:

- Bottlenecks are identified and quantified
- Action dispatch latency is < 50ms
- Large lists render in < 500ms
- Memory usage is stable (no leaks)
- Search queries complete in < 200ms
- Recommendations are data-driven
- Optimizations show measurable improvement
- Baseline metrics are tracked over time

---

*Skill last updated: 2026-02-01*
*Part of Field Studio AI assistant infrastructure*
