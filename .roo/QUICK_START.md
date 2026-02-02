# .roo Quick Start Guide

**Last Updated:** 2026-02-01

## What is .roo?

The `.roo` directory contains AI assistant configuration and development patterns for Field Studio. It includes:
- **6 Project Skills** - Reusable workflows for common development tasks
- **15 Tool Documentation Files** - Comprehensive pattern guides
- **MCP Configuration** - Extended AI capabilities
- **Scripts & Templates** - Ready-to-use code generation tools

---

## 🚀 Getting Started (5 minutes)

### Step 1: Understand Your Project Structure

Field Studio is built with:
- **Vault Pattern** - Normalized state management (flat entities with indexes)
- **Action System** - All state changes go through 17 action types
- **Service Architecture** - 42 services organized by domain
- **68 Components** - React components with vault integration
- **27 Hooks** - Custom hooks for state and UI
- **IndexedDB Storage** - Local-first persistence with content-addressing

**Read First:** `CLAUDE.md` in project root (project overview)

### Step 2: Choose Your Task

Find your task below and jump to the corresponding skill:

---

## 📋 Task-to-Skill Mapping

### ⚙️ State Management Issues

**Problem:** "Component not updating when state changes" or "State looks wrong"

👉 Use: **vault-debugging** skill
```bash
./.roo/skills/vault-debugging/SKILL.md
```

**Quick Workflow:**
1. Inspect current vault state (browser console)
2. Trace recent actions
3. Validate entity relationships
4. Check for corruption

**Common Fix:** Component not subscribing to vault updates (use `useIIIFEntity` hook)

---

### 🧩 Creating New Components

**Problem:** "I need to add a new UI component"

👉 Use: **component-scaffolding** skill
```bash
./.roo/skills/component-scaffolding/SKILL.md
```

**Quick Workflow:**
1. Choose component type (presentational, vault-connected, container, etc.)
2. Define props interface (use naming conventions: `onChange`, `onAction`, `onUpdate`)
3. Generate component structure
4. Write component logic and tests
5. Export in barrel file

**Naming Rules:**
- Props: `onChange`, `onAction`, `onUpdate`, `onExecute`
- Files: PascalCase components, lowercase directories
- Props interfaces: `ComponentNameProps`

---

### 📖 Working with IIIF Data

**Problem:** "Manifest has errors" or "Need to validate IIIF structure"

👉 Use: **iiif-manifest-tools** skill
```bash
./.roo/skills/iiif-manifest-tools/SKILL.md
```

**Quick Workflow:**
1. Load manifest from vault or file
2. Run validation
3. Review validation issues
4. Auto-heal fixable issues
5. Generate compliance report

**Common Issues:**
- Missing canvas images → Add image to canvas body
- Broken references → Check canvas/manifest IDs exist
- Non-standard labels → Convert to language strings (`{ en: ['Label'] }`)

---

### 💾 Storage Issues

**Problem:** "Storage quota exceeded" or "Need to backup project"

👉 Use: **indexeddb-management** skill
```bash
./.roo/skills/indexeddb-management/SKILL.md
```

**Quick Workflow:**
1. Check storage quota (`estimateQuota()`)
2. Analyze usage breakdown
3. Create checkpoint backup
4. Run cleanup (conservative or aggressive)
5. Monitor for recurring issues

**Storage Tiers:**
1. **Files** (immutable, deduplicated)
2. **Project** (current state, 1-10MB)
3. **Derivatives** (tile pyramids, 100-500MB)
4. **Tiles** (LRU cache, 500MB max)
5. **Checkpoints** (save states, 1-10MB each)

---

### ⚡ Performance Problems

**Problem:** "App is slow" or "Need to find bottleneck"

👉 Use: **performance-auditing** skill
```bash
./.roo/skills/performance-auditing/SKILL.md
```

**Quick Workflow:**
1. Run quick performance check
2. Profile specific area (rendering, vault, storage)
3. Identify bottleneck (action latency, large renders, memory leaks)
4. Apply optimization
5. Measure improvement

**Performance Targets:**
- First Paint: < 1s
- Large list render: < 500ms
- Action dispatch: < 50ms
- Vault update: < 100ms per entity

---

### ✅ Testing & QA

**Problem:** "Need to run tests" or "Improve test coverage"

👉 Use: **test-suite-management** skill
```bash
./.roo/skills/test-suite-management/SKILL.md
```

**Quick Workflow:**
1. Run tests by feature set
2. Check test adherence (IDEAL OUTCOME/FAILURE PREVENTED)
3. Measure coverage
4. Identify gaps
5. Add missing tests

**8 Feature Sets:**
1. organize-media
2. describe-content
3. validate-quality
4. search-and-find
5. export-and-share
6. manage-lifecycle
7. view-and-navigate
8. collaborate

---

## 📚 Tool Documentation

### Deep Dives (Read When You Need Deep Knowledge)

- **tools/12_vault_pattern_advanced.xml** - Vault internals, debugging, optimization
- **tools/13_testing_patterns.xml** - Unit, component, integration, snapshot testing
- **tools/14_web_workers_and_async.xml** - Web Workers, async patterns, error handling

### Pattern References (Quick Lookups)

- **tools/1_iiif_types_and_patterns.xml** - Type guards, IIIF helpers
- **tools/2_component_patterns.xml** - React conventions
- **tools/3_hook_patterns.xml** - Custom hook patterns
- **tools/4_constants_and_config.xml** - Feature flags
- **tools/5_services_patterns.xml** - Service layer
- **tools/6_file_organization.xml** - Project structure
- **tools/7_best_practices.xml** - General best practices
- **tools/8_tool_usage_patterns.xml** - Development tools
- **tools/9_type_guard_patterns.xml** - Type narrowing
- **tools/10_iiif_api_patterns.xml** - IIIF Image API
- **tools/11_performance_optimizations.xml** - Performance tips

---

## 🔍 Finding What You Need

### If you want to...

| Goal | File |
|------|------|
| Understand vault state | `tools/12_vault_pattern_advanced.xml` + `vault-debugging/SKILL.md` |
| Create a component | `component-scaffolding/SKILL.md` |
| Write tests | `tools/13_testing_patterns.xml` + `test-suite-management/SKILL.md` |
| Use Web Workers | `tools/14_web_workers_and_async.xml` |
| Fix async bugs | `tools/14_web_workers_and_async.xml` |
| Validate IIIF | `iiif-manifest-tools/SKILL.md` |
| Check storage | `indexeddb-management/SKILL.md` |
| Speed up app | `performance-auditing/SKILL.md` |
| Learn IIIF types | `tools/1_iiif_types_and_patterns.xml` |
| Follow best practices | `tools/7_best_practices.xml` |

---

## 💡 Pro Tips

### 1. Always Start with Hooks
If using vault data in React:
```typescript
// ✅ Correct - auto-updates when data changes
const entity = useIIIFEntity(entityId)

// ❌ Wrong - stale reference
const [entity] = useState(initialEntity)
```

### 2. Use Actions for All State Changes
```typescript
// ✅ Correct - goes through action system, enables undo/redo
actions.updateLabel(id, newLabel)

// ❌ Wrong - direct mutation breaks everything
vault.manifests.get(id).label = newLabel
```

### 3. Batch Related Changes
```typescript
// ✅ Correct - single history entry, atomic update
actions.batchUpdate([
  { type: 'UPDATE_LABEL', id: '1', label: {...} },
  { type: 'UPDATE_LABEL', id: '2', label: {...} }
])

// ❌ Wrong - multiple updates, partial state visible
actions.updateLabel('1', {...})
actions.updateLabel('2', {...})
```

### 4. Component Props Naming
```typescript
// ✅ Correct - follows ESLint rules
<Component
  onChange={(value) => ...}   // Value change
  onAction={() => ...}        // User action
  onUpdate={() => ...}        // Entity update
  onExecute={() => ...}       // Command execution
/>

// ❌ Wrong - arbitrary naming
<Component
  onValueChange={() => ...}   // Use onChange
  onClick={() => ...}         // Use onAction
  onSave={() => ...}          // Use onUpdate
/>
```

### 5. Create Checkpoint Before Major Operations
```typescript
// Backup current state
await storage.saveCheckpoint({
  name: 'pre-migration-' + new Date().toISOString(),
  description: 'Before reorganizing collections'
})

// Do something risky...
await doComplexOperation()

// If needed, restore: await storage.loadCheckpoint(name)
```

---

## 🎯 Common Workflows

### Workflow 1: Add New Feature (Component)

1. **Understand** - Read component patterns in tools
2. **Scaffold** - Use component-scaffolding skill to create structure
3. **Implement** - Write component logic
4. **Test** - Generate and write tests
5. **Validate** - Run test suite, check coverage
6. **Optimize** - Use performance-auditing if needed

### Workflow 2: Debug State Bug

1. **Identify** - Reproduce the bug
2. **Inspect** - Use vault-debugging to examine state
3. **Trace** - Follow recent actions
4. **Fix** - Update component or action logic
5. **Verify** - Check vault consistency
6. **Test** - Add regression test

### Workflow 3: Optimize Slow Feature

1. **Measure** - Use performance-auditing to find bottleneck
2. **Analyze** - Profile specific area (rendering, vault, storage)
3. **Fix** - Apply optimization
4. **Re-measure** - Verify improvement
5. **Test** - Ensure no regressions

### Workflow 4: Import External IIIF Data

1. **Validate** - Use iiif-manifest-tools to validate structure
2. **Heal** - Auto-fix common issues
3. **Report** - Generate compliance report
4. **Ingest** - Use iiifBuilder to normalize into vault
5. **Store** - Save to IndexedDB via storage service

### Workflow 5: Manage Storage Space

1. **Check** - Use indexeddb-management to estimate quota
2. **Analyze** - Get breakdown by entity type
3. **Backup** - Create checkpoint before cleanup
4. **Clean** - Run cleanup (conservative or aggressive)
5. **Monitor** - Check quota regularly

---

## 🆘 Troubleshooting

### "I'm not sure which skill to use"

1. Look at what you're trying to do
2. Find it in the "Task-to-Skill Mapping" section above
3. Open the linked skill file
4. Read the "When to use this skill" section
5. Follow the workflow

### "I need to understand how Vault works"

1. Read `CLAUDE.md` in project root
2. Read `tools/12_vault_pattern_advanced.xml`
3. Use `vault-debugging` skill to explore your actual state
4. Try the code examples from the vault pattern docs

### "I'm getting type errors"

1. Check IIIF types in `tools/1_iiif_types_and_patterns.xml`
2. Use type guards (`isCanvas()`, `isManifest()`, etc.)
3. Check component props in `component-scaffolding/SKILL.md`
4. Validate against TypeScript configs in `tsconfig.json`

### "My component isn't updating"

1. Verify it's using `useIIIFEntity` hook (not useState)
2. Check vault-debugging to see if state actually changed
3. Verify action was called (trace actions in browser console)
4. Check for stale closures in useEffect dependencies

### "Tests are failing"

1. Run specific test file: `npm test vault.test.ts`
2. Read `tools/13_testing_patterns.xml` for pattern guidance
3. Use `test-suite-management` skill to understand structure
4. Check fixtures in `src/test/fixtures/`

---

## 📖 Learning Path

**Beginner (Start Here)**
1. Read `CLAUDE.md` (project overview)
2. Skim `tools/2_component_patterns.xml` (how components work)
3. Review `component-scaffolding/SKILL.md` (create first component)

**Intermediate (Deepen Knowledge)**
1. Study `tools/12_vault_pattern_advanced.xml` (state management)
2. Use `vault-debugging/SKILL.md` to explore your state
3. Read `tools/13_testing_patterns.xml` (write better tests)
4. Use `test-suite-management/SKILL.md` to organize tests

**Advanced (Optimize & Diagnose)**
1. Master `tools/14_web_workers_and_async.xml` (background processing)
2. Use `performance-auditing/SKILL.md` to optimize
3. Use `iiif-manifest-tools/SKILL.md` for IIIF expertise
4. Use `indexeddb-management/SKILL.md` for storage expertise

---

## 🎓 Code Examples

Each skill and tool has 10+ code examples. Examples follow this structure:

```typescript
// ✅ CORRECT way
const result = doSomething()
// Comment explaining why this is correct

// ❌ WRONG way
const result = doSomethingElse()
// Comment explaining why this is wrong
```

Look for "IDEAL OUTCOME:" and "FAILURE PREVENTED:" labels in test examples.

---

## 📞 Getting Help

### In This Repo
- Read the specific skill for your task
- Check the tools documentation for patterns
- Look for code examples in the .roo directory
- Review CLAUDE.md for architecture overview

### Using Claude AI
- Reference the skill: "I'm using the vault-debugging skill"
- Quote the workflow you're following
- Share code and error messages
- Ask about patterns from tools documentation

---

## ✨ Key Takeaways

1. **Find Your Task** → Task-to-Skill Mapping section
2. **Open the Skill** → Read the workflow section
3. **Follow the Steps** → Each skill has clear step-by-step guidance
4. **Reference Examples** → Code examples show ✅ correct and ❌ wrong approaches
5. **Check Tools Docs** → Deep technical details in tools/ directory
6. **Apply Best Practices** → Pro Tips section above
7. **Test Your Changes** → Use test-suite-management skill

---

**Happy coding! 🚀**

For detailed information, open the specific skill file referenced above.
