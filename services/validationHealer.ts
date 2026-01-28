import { IIIFItem, getIIIFValue } from '../types';
import { ValidationIssue } from './validator';
import { createLanguageMap } from '../utils';
import { DEFAULT_INGEST_PREFS } from '../constants';

/**
 * ValidationHealer provides auto-fix capabilities for common IIIF validation issues.
 *
 * This service is used by both the Inspector and QCDashboard to provide consistent
 * healing behavior across the application.
 */

export interface HealResult {
  success: boolean;
  updatedItem?: IIIFItem;
  message?: string;
}

/**
 * Attempt to automatically fix a validation issue on an item.
 * Returns a new item with the fix applied, or null if the issue cannot be auto-fixed.
 */
export function healIssue(item: IIIFItem, issue: ValidationIssue): HealResult {
  if (!issue.fixable) {
    return { success: false, message: 'Issue is not auto-fixable' };
  }

  // Clone the item to avoid mutations
  const healed = JSON.parse(JSON.stringify(item)) as IIIFItem;
  const msg = issue.message.toLowerCase();

  // Label fixes
  if (msg.includes('label')) {
    const fallbackLabel = healed.id.split('/').pop() || 'Fixed Resource';
    healed.label = createLanguageMap(fallbackLabel, 'none');
    return { success: true, updatedItem: healed, message: 'Added label from ID' };
  }

  // Summary fixes
  if (msg.includes('summary')) {
    const labelText = getIIIFValue(healed.label) || 'resource';
    healed.summary = createLanguageMap(`Summary for ${labelText}`, 'none');
    return { success: true, updatedItem: healed, message: 'Added placeholder summary' };
  }

  // HTTP URI fixes
  if (msg.includes('http') && msg.includes('uri')) {
    healed.id = `http://archive.local/iiif/resource/${crypto.randomUUID()}`;
    return { success: true, updatedItem: healed, message: 'Generated valid HTTP URI' };
  }

  // Duplicate ID fixes
  if (msg.includes('duplicate id')) {
    healed.id = `${healed.id}-${crypto.randomUUID().slice(0, 4)}`;
    return { success: true, updatedItem: healed, message: 'Made ID unique' };
  }

  // Dimension fixes (width/height)
  if (msg.includes('dimensions') || msg.includes('width') || msg.includes('height')) {
    (healed as any).width = DEFAULT_INGEST_PREFS.defaultCanvasWidth;
    (healed as any).height = DEFAULT_INGEST_PREFS.defaultCanvasHeight;
    return { success: true, updatedItem: healed, message: 'Set default dimensions' };
  }

  // Collection structures fix (structures not allowed on Collection)
  if (msg.includes('structures') && healed.type === 'Collection') {
    delete (healed as any).structures;
    return { success: true, updatedItem: healed, message: 'Removed invalid structures property' };
  }

  // Empty items array fix
  if (msg.includes('items')) {
    if (!healed.items) healed.items = [];

    if (healed.type === 'Manifest' && healed.items.length === 0) {
      const canvasId = `${healed.id}/canvas/1`;
      healed.items.push({
        id: canvasId,
        type: 'Canvas' as const,
        label: createLanguageMap('Page 1', 'none'),
        width: DEFAULT_INGEST_PREFS.defaultCanvasWidth,
        height: DEFAULT_INGEST_PREFS.defaultCanvasHeight,
        items: []
      });
      return { success: true, updatedItem: healed, message: 'Added placeholder canvas' };
    }

    return { success: true, updatedItem: healed, message: 'Initialized items array' };
  }

  // Behavior conflict fixes - remove conflicting behaviors
  if (msg.includes('behavior') && msg.includes('conflict')) {
    // Extract conflicting behaviors from message if possible
    // For now, just clear behaviors as a safe fallback
    healed.behavior = [];
    return { success: true, updatedItem: healed, message: 'Cleared conflicting behaviors' };
  }

  return { success: false, message: 'No auto-fix available for this issue type' };
}

/**
 * Attempt to heal multiple issues on an item.
 * Returns the healed item with all applicable fixes applied.
 */
export function healAllIssues(item: IIIFItem, issues: ValidationIssue[]): { item: IIIFItem; healed: number; failed: number } {
  let currentItem = item;
  let healed = 0;
  let failed = 0;

  for (const issue of issues.filter(i => i.fixable)) {
    const result = healIssue(currentItem, issue);
    if (result.success && result.updatedItem) {
      currentItem = result.updatedItem;
      healed++;
    } else {
      failed++;
    }
  }

  return { item: currentItem, healed, failed };
}

/**
 * Apply a healed item back to the tree.
 * Returns a new root with the item updated.
 */
export function applyHealToTree(root: IIIFItem, itemId: string, healedItem: IIIFItem): IIIFItem {
  const newRoot = JSON.parse(JSON.stringify(root)) as IIIFItem;
  const visited = new Set<string>();

  const traverse = (node: IIIFItem): boolean => {
    if (visited.has(node.id)) return false;
    visited.add(node.id);

    if (node.id === itemId) {
      Object.assign(node, healedItem);
      return true;
    }

    const children = (node as any).items || (node as any).annotations || (node as any).structures || [];
    for (const child of children) {
      if (child && typeof child === 'object' && traverse(child)) return true;
    }
    return false;
  };

  traverse(newRoot);
  return newRoot;
}

/**
 * Get a human-readable description of what fix will be applied.
 */
export function getFixDescription(issue: ValidationIssue): string {
  const msg = issue.message.toLowerCase();

  if (msg.includes('label')) return 'Add label derived from ID';
  if (msg.includes('summary')) return 'Add placeholder summary';
  if (msg.includes('http') && msg.includes('uri')) return 'Generate valid HTTP URI';
  if (msg.includes('duplicate id')) return 'Append unique suffix to ID';
  if (msg.includes('dimensions') || msg.includes('width')) return 'Set default canvas dimensions';
  if (msg.includes('structures') && issue.itemLabel) return 'Remove invalid structures';
  if (msg.includes('items')) return 'Initialize or populate items array';
  if (msg.includes('behavior')) return 'Clear conflicting behaviors';

  return 'Auto-fix available';
}
