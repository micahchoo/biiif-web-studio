---
name: iiif-manifest-tools
description: Validate, heal, and analyze IIIF manifests and collections. This skill provides tools for checking IIIF specification compliance, auto-fixing common issues, analyzing manifest structure, detecting broken references, and generating validation reports. Use when working with IIIF data quality, import validation, or manifest structure analysis.
---

# IIIF Manifest Tools – Validation & Healing

When you need to ensure IIIF manifest quality, structure validity, and specification compliance, this skill guides you through validation and healing workflows.

## When to use this skill

- You need to **validate IIIF manifests** against specification (v2/v3)
- You want to **auto-fix common issues** (validation healing)
- You need to **analyze manifest structure** for architectural issues
- You want to **detect broken references** (dangling canvas IDs, missing images)
- You need to **generate compliance reports** for data quality assessment
- You're **importing external IIIF data** and need quality assurance
- You want to **detect and fix schema violations**

## When NOT to use this skill

- For general JSON validation (use JSON validators)
- For image format validation (use image validation tools)
- For comparing manifests (use manifest-comparison skill)
- For IIIF API endpoint testing (use API testing tools)

## Inputs required from the user

- Path to IIIF manifest file (JSON) or entity ID in vault
- Optional: validation strictness (strict, moderate, lenient)
- Optional: auto-heal enabled (true/false)
- Optional: which validation category to focus on

## IIIF Specification Coverage

### Supported IIIF Versions
- **Presentation API 2.1** – Full support with v3 bridging
- **Presentation API 3.0** – Full support with v2 mapping
- **Web Annotation Model** – Annotation and annotation page validation

### Validation Categories

1. **Structure Validation**
   - Type checking (Collection, Manifest, Canvas, etc.)
   - Required fields present (id, type, label, etc.)
   - Array/object field types correct
   - Nested entity structure valid

2. **Reference Validation**
   - Canvas IDs in manifest.items exist
   - Range IDs in manifest.structures reference valid canvases
   - Image service URLs are resolvable
   - Body references in annotations point to valid entities

3. **Metadata Validation**
   - Labels are LanguageStrings or arrays
   - Language codes are valid (RFC 5646)
   - Required metadata not empty
   - Description/summary formats correct

4. **Image Validation**
   - Image resources have required properties
   - Width/height dimensions valid (> 0)
   - IIIF Image API info.json resolvable
   - Content-type headers indicate image format

5. **Relationship Validation**
   - Parent-child relationships consistent
   - No circular references
   - All referenced entities accessible
   - Collection manifests array non-empty

## Workflow

### 1. Load Manifest

**From vault:**
```typescript
import { useVaultState } from '@/hooks/useVaultState';
import { validator } from '@/services/validator';

const vault = useVaultState();
const manifest = vault.manifests.get('manifest-id');

// Validate
const issues = validator.validateTree(manifest);
```

**From file:**
```typescript
import { validator } from '@/services/validator';
import { readFile } from 'fs/promises';

const manifestJson = await readFile('manifest.json', 'utf-8');
const manifest = JSON.parse(manifestJson);

const issues = validator.validateTree(manifest);
```

### 2. Run Validation

**Basic validation:**
```typescript
import { validator } from '@/services/validator';

const issues = validator.validateTree(manifest);

console.log(`Found ${issues.length} issues`);
issues.forEach(issue => {
  console.log(`- [${issue.severity}] ${issue.message}`);
  console.log(`  Location: ${issue.path}`);
  console.log(`  Fix: ${issue.suggestion}`);
});
```

**Return format:**
```typescript
interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  path: string;                    // JSONPath to problematic field
  message: string;                 // Human-readable description
  value?: unknown;                 // The problematic value
  expected?: string;               // What was expected
  suggestion?: string;             // How to fix it
  fixable?: boolean;               // Can be auto-healed
}
```

**Example output:**
```
Found 5 issues:
- [error] Canvas "canvas-1" missing required property "height"
  Location: manifest.items[0].height
  Fix: Add positive integer height value
  Fixable: No - requires manual specification

- [warning] Label "Home" is not a LanguageString (should be { en: ['Home'] })
  Location: manifest.label
  Fix: Wrap label in language map
  Fixable: Yes

- [info] Image service at https://example.com/images/info.json not responding
  Location: manifest.items[0].body[0].service
  Fix: Verify service endpoint is online
  Fixable: No
```

### 3. Auto-Heal Common Issues

**Use validation healer:**
```typescript
import { validationHealer } from '@/services/validationHealer';

// Heal automatically fixable issues
const healedManifest = validationHealer.healTree(manifest);
const remainingIssues = validator.validateTree(healedManifest);

console.log(`Auto-fixed ${manifest_issues.length - remainingIssues.length} issues`);
```

**What gets auto-healed:**
- Labels converted to LanguageStrings
- Empty arrays/objects filled with defaults
- Missing required IDs generated (UUID)
- Deprecated properties mapped to new format (v2→v3)
- Duplicate items removed
- Invalid language codes corrected

### 4. Analyze Manifest Structure

**Check completeness:**
```typescript
function analyzeStructure(manifest) {
  const stats = {
    collectionCount: manifest.items?.length || 0,
    manifestCount: 0,
    canvasCount: 0,
    annotationCount: 0,
    orphanedCanvases: [],
    orphanedRanges: [],
    referencedImages: new Set(),
  };

  // Count nested entities
  manifest.items?.forEach(child => {
    if (child.type === 'Manifest') stats.manifestCount++;
    if (child.type === 'Canvas') stats.canvasCount++;
    if (child.items) {
      child.items.forEach(canvas => {
        stats.canvasCount++;
        // Track image references
        canvas.items?.forEach(ap => {
          ap.items?.forEach(anno => {
            stats.referencedImages.add(anno.body?.id);
          });
        });
      });
    }
  });

  return stats;
}
```

**Detect structural issues:**
```typescript
function findStructuralIssues(manifest) {
  const issues = [];

  // Single canvas manifest should be simple type
  if (manifest.items?.length === 1 && manifest.items[0].type === 'Canvas') {
    issues.push({
      type: 'structure',
      message: 'Single-canvas manifest - consider using simple structure',
    });
  }

  // Missing ranges for navigation
  if (!manifest.structures && manifest.items?.length > 10) {
    issues.push({
      type: 'missing',
      message: 'Large manifest lacks Range structure for navigation',
    });
  }

  // Orphaned ranges
  manifest.structures?.forEach(range => {
    const referencedCanvases = new Set();
    range.canvases?.forEach(canvasId => {
      const exists = manifest.items?.some(c => c.id === canvasId);
      if (!exists) {
        issues.push({
          type: 'dangling_reference',
          message: `Range references non-existent canvas: ${canvasId}`,
        });
      }
    });
  });

  return issues;
}
```

### 5. Generate Validation Report

**Export validation report:**
```bash
# Using CLI tool (see scripts/validate-manifest.sh):
./validate-manifest.sh path/to/manifest.json --format=html --output=report.html

# Or programmatically:
const report = validator.generateReport(manifest, { includeStats: true });
console.log(report);
```

**Report includes:**
- Summary (total issues by severity)
- Detailed findings with paths and fixes
- Structure analysis (entity counts, relationships)
- Compliance score (0-100%)
- Recommendations

### 6. Fix Issues

**For auto-fixable issues:**
```typescript
import { validationHealer } from '@/services/validationHealer';

const fixed = validationHealer.healTree(manifest);
const revalidate = validator.validateTree(fixed);
```

**For manual fixes:**
```typescript
// Example: Add missing canvas height
const canvas = manifest.items[0];
canvas.height = 2000; // Required dimension

// Example: Fix label format
manifest.label = { en: [manifest.label] };

// Example: Correct invalid language code
manifest.label = {
  'en-US': manifest.label['en-US'],
  'en': manifest.label['en-US'], // Add standard code
};
```

## Common Issues & Solutions

### Issue 1: "Canvas is missing image content"

**Problem:** Canvas has no images in body.

**Diagnosis:**
```typescript
const canvases = manifest.items.filter(c => !c.items?.length);
console.log(`Canvases without images: ${canvases.length}`);
```

**Solution:**
```typescript
// Add image to canvas
canvas.items = [{
  type: 'AnnotationPage',
  items: [{
    type: 'Annotation',
    motivation: 'painting',
    target: canvas.id,
    body: {
      id: 'https://example.com/image.jpg',
      type: 'Image',
      format: 'image/jpeg',
      height: 1000,
      width: 1500,
    },
  }],
}];
```

### Issue 2: "Broken image service reference"

**Problem:** Image service URL returns 404.

**Diagnosis:**
```typescript
async function checkImageServices(manifest) {
  const broken = [];

  for (const canvas of manifest.items) {
    for (const ap of canvas.items || []) {
      for (const anno of ap.items || []) {
        const serviceId = anno.body?.service?.id;
        if (serviceId) {
          const response = await fetch(serviceId + '/info.json');
          if (!response.ok) {
            broken.push({ canvas: canvas.id, service: serviceId });
          }
        }
      }
    }
  }

  return broken;
}
```

**Solution:**
- Update service URL to accessible endpoint
- Or remove service reference if image is self-sufficient

### Issue 3: "Circular parent-child relationships"

**Problem:** Entity A references B which references A.

**Solution:**
```typescript
function detectCycles(manifest, visited = new Set(), path = []) {
  const id = manifest.id;

  if (path.includes(id)) {
    return { cycle: true, path: [...path, id] };
  }

  for (const childId of manifest.items || []) {
    const result = detectCycles(children[childId], visited, [...path, id]);
    if (result.cycle) return result;
  }

  return { cycle: false };
}
```

Remove circular references by restructuring collections/manifests.

## Files in this skill

- **SKILL.md** – This entrypoint
- **references/validation-rules.md** – Detailed validation rules and specifications
- **references/healing-capabilities.md** – What issues can be auto-healed
- **references/iiif-compliance-guide.md** – IIIF v2 vs v3 differences
- **scripts/validate-manifest.sh** – CLI validation tool
- **scripts/generate-report.sh** – Generate HTML/JSON validation reports
- **scripts/batch-validate.sh** – Validate multiple manifests

## Success criteria

IIIF manifest validation is successful when:

- All manifests pass validation with zero errors
- Warnings are understood and deliberately accepted
- Auto-healed manifests are re-validated successfully
- Broken references are identified and fixed
- Compliance score is >90%
- Structure analysis confirms manifest is well-formed
- Reports can be shared with stakeholders

---

*Skill last updated: 2026-02-01*
*Part of Field Studio AI assistant infrastructure*
