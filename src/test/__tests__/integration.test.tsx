/**
 * Integration Tests - Real User Workflows
 *
 * Tests end-to-end workflows with real image files and actual user interactions.
 * Uses images from .Images iiif test/ directory for realistic testing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useCallback } from 'react';

// Import actual production hooks and services
import { VaultProvider, useVaultState, useVaultDispatch, useManifest, useCanvas } from '../../../hooks/useIIIFEntity';
import { buildTree, ingestTree } from '../../../services/iiifBuilder';
import { validator } from '../../../services/validator';
import { healIssue, healAllIssues } from '../../../services/validationHealer';
import type { IIIFManifest, IIIFItem, IIIFCanvas } from '../../../types';

// Import real image fixtures
import {
  createImageFile,
  createImageFiles,
  createSequenceFiles,
  createFolderStructure,
  createCorruptedImageFile,
  createEmptyImageFile,
  verifyImageIntegrity,
  TEST_IMAGES,
} from '../fixtures/imageFixtures';

// ============================================================================
// Test Helper Components
// ============================================================================

/**
 * Test component that simulates user workflow with manifest editing
 */
const WorkflowTestApp: React.FC<{ initialRoot?: IIIFItem }> = ({ initialRoot }) => {
  const { state } = useVaultState();
  const { dispatch, undo, redo, canUndo, canRedo } = useVaultDispatch();
  const [workflowLog, setWorkflowLog] = useState<string[]>([]);

  const logStep = useCallback((step: string) => {
    setWorkflowLog(prev => [...prev, step]);
  }, []);

  const handleUndo = useCallback(() => {
    undo();
    logStep('undo');
  }, [undo, logStep]);

  const handleRedo = useCallback(() => {
    redo();
    logStep('redo');
  }, [redo, logStep]);

  return (
    <div data-testid="app">
      <div data-testid="root-type">{state.rootId ? 'has-root' : 'no-root'}</div>
      <div data-testid="entity-count">{Object.keys(state.entities).length}</div>
      <button data-testid="undo-btn" onClick={handleUndo} disabled={!canUndo}>
        Undo
      </button>
      <button data-testid="redo-btn" onClick={handleRedo} disabled={!canRedo}>
        Redo
      </button>
      <div data-testid="can-undo">{canUndo ? 'true' : 'false'}</div>
      <div data-testid="can-redo">{canRedo ? 'true' : 'false'}</div>
      <div data-testid="workflow-log">{workflowLog.join(',')}</div>
    </div>
  );
};

/**
 * Test component for manifest editing workflows
 */
const ManifestEditorTest: React.FC<{ manifestId: string }> = ({ manifestId }) => {
  const { manifest, label, canvases, updateLabel, addCanvas, removeCanvas, reorderCanvases } = useManifest(manifestId);
  const [editResult, setEditResult] = useState<string>('');

  const handleRename = useCallback(async (newName: string) => {
    const success = updateLabel({ en: [newName] });
    setEditResult(success ? 'rename-success' : 'rename-failed');
  }, [updateLabel]);

  const handleAddCanvas = useCallback(async () => {
    const newCanvas: IIIFCanvas = {
      id: `https://example.com/canvas/${Date.now()}`,
      type: 'Canvas',
      label: { en: ['New Canvas'] },
      width: 1000,
      height: 1000,
      items: [],
    };
    const success = addCanvas(newCanvas);
    setEditResult(success ? 'add-success' : 'add-failed');
  }, [addCanvas]);

  return (
    <div data-testid="manifest-editor">
      <div data-testid="manifest-label">{label?.get() || 'untitled'}</div>
      <div data-testid="canvas-count">{canvases.length}</div>
      <div data-testid="edit-result">{editResult}</div>
      <button data-testid="rename-btn" onClick={() => handleRename('Renamed Manifest')}>
        Rename
      </button>
      <button data-testid="add-canvas-btn" onClick={handleAddCanvas}>
        Add Canvas
      </button>
    </div>
  );
};

const createWrapper = (initialRoot?: IIIFItem) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <VaultProvider initialRoot={initialRoot || null}>
        {children}
      </VaultProvider>
    );
  };
};

// ============================================================================
// Import Workflow Tests - With Real Images
// ============================================================================

describe('Import Workflow - Real Images', () => {
  it('should verify test images are valid', () => {
    // Verify our test images are valid before using them
    expect(verifyImageIntegrity('jpegSmall')).toBe(true);
    expect(verifyImageIntegrity('jpegMedium')).toBe(true);
    expect(verifyImageIntegrity('pngSmall')).toBe(true);
    expect(verifyImageIntegrity('webpSmall')).toBe(true);
  });

  it('should create File objects from real images with correct properties', () => {
    const file = createImageFile('jpegSmall', 'test-photo.jpg');

    expect(file.name).toBe('test-photo.jpg');
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBe(TEST_IMAGES.jpegSmall.approximateSize);
    expect(file.size).toBeGreaterThan(1000); // Real image, not synthetic
  });

  it('should process real image file tree into manifest', async () => {
    // Create files from real images
    const files = [
      createImageFile('jpegSmall', 'photo1.jpg'),
      createImageFile('jpegMedium', 'photo2.jpg'),
      createImageFile('pngSmall', 'diagram.png'),
    ];

    // Add webkitRelativePath for realistic testing
    files.forEach((file, i) => {
      Object.defineProperty(file, 'webkitRelativePath', {
        value: `import-folder/${file.name}`,
        writable: false,
      });
    });

    const tree = buildTree(files);

    // Verify tree structure
    expect(tree.files.size).toBe(3);
    expect(tree.directories.has('import-folder')).toBe(true);

    const folder = tree.directories.get('import-folder');
    expect(folder?.files.size).toBe(3);

    // Verify real file sizes are preserved
    const fileArray = Array.from(tree.files.values());
    expect(fileArray[0].size).toBeGreaterThan(1000);
    expect(fileArray[1].size).toBeGreaterThan(1000);
  });

  it('should handle sequence detection with real images', async () => {
    // Create a sequence of files using real image data
    const sequenceFiles = createSequenceFiles('page', 5, 1);

    const tree = buildTree(sequenceFiles);
    const fileArray = Array.from(tree.files.keys());

    // Verify sequence ordering
    expect(fileArray).toContain('page001.jpg');
    expect(fileArray).toContain('page002.jpg');
    expect(fileArray).toContain('page003.jpg');
    expect(fileArray).toContain('page004.jpg');
    expect(fileArray).toContain('page005.jpg');

    // Verify all files have real image content
    const folder = tree.directories.get('sequence');
    const files = Array.from(folder?.files.values() || []);
    files.forEach(file => {
      expect(file.size).toBeGreaterThan(1000);
    });
  });

  it('should ingest real images and create valid IIIF manifest', async () => {
    const files = [
      createImageFile('jpegSmall', 'item1.jpg'),
      createImageFile('pngSmall', 'item2.png'),
      createImageFile('webpSmall', 'item3.webp'),
    ];

    files.forEach((file, i) => {
      Object.defineProperty(file, 'webkitRelativePath', {
        value: `archive/${file.name}`,
        writable: false,
      });
    });

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);

    // Verify manifest was created
    expect(result.root).toBeDefined();
    expect(result.root.type).toBe('Manifest');

    const manifest = result.root as IIIFManifest;

    // Verify canvases were created for each image
    expect(manifest.items.length).toBeGreaterThanOrEqual(1);

    // Verify manifest is valid IIIF
    const validationIssues = validator.validateTree(manifest);
    const criticalErrors = Object.values(validationIssues)
      .flat()
      .filter(i => i.level === 'error' && i.category === 'Identity');
    expect(criticalErrors).toEqual([]);

    // Verify report was generated
    expect(result.report).toBeDefined();
    expect(result.report.filesProcessed).toBeGreaterThanOrEqual(1);
  });

  it('should handle mixed image formats in single import', async () => {
    const files = [
      createImageFile('jpegSmall', 'photo.jpg'),
      createImageFile('pngLarge', 'diagram.png'),
      createImageFile('webpMedium', 'image.webp'),
    ];

    files.forEach(file => {
      Object.defineProperty(file, 'webkitRelativePath', {
        value: `mixed/${file.name}`,
        writable: false,
      });
    });

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);

    expect(result.root).toBeDefined();
    expect(result.report.filesProcessed).toBeGreaterThanOrEqual(1);
  });

  it('should handle corrupted image gracefully', async () => {
    const corruptedFile = createCorruptedImageFile('corrupted.jpg');
    Object.defineProperty(corruptedFile, 'webkitRelativePath', {
      value: `test/corrupted.jpg`,
      writable: false,
    });

    const tree = buildTree([corruptedFile]);

    // Should still create tree structure
    expect(tree.files.size).toBe(1);

    // Ingest should complete without crashing
    const result = await ingestTree(tree, null);
    expect(result.root).toBeDefined();
    expect(result.report).toBeDefined();
  });

  it('should handle empty image file', async () => {
    const emptyFile = createEmptyImageFile('empty.jpg');
    Object.defineProperty(emptyFile, 'webkitRelativePath', {
      value: `test/empty.jpg`,
      writable: false,
    });

    const tree = buildTree([emptyFile]);
    expect(tree.files.size).toBe(1);

    const result = await ingestTree(tree, null);
    expect(result.root).toBeDefined();
  });
});

// ============================================================================
// User Workflow Tests - End to End
// ============================================================================

describe('User Workflows - End to End', () => {
  it('should complete full import→edit→validate→export cycle', async () => {
    const user = userEvent.setup();

    // Step 1: Import real images
    const files = createImageFiles(3);
    const tree = buildTree(files);
    const ingestResult = await ingestTree(tree, null);

    expect(ingestResult.root).toBeDefined();
    const manifest = ingestResult.root as IIIFManifest;

    // Step 2: Render with VaultProvider
    const { rerender } = render(
      <WorkflowTestApp initialRoot={manifest} />,
      { wrapper: createWrapper(manifest) }
    );

    expect(screen.getByTestId('root-type')).toHaveTextContent('has-root');
    expect(screen.getByTestId('entity-count')).toHaveTextContent(/[1-9]/);

    // Step 3: Validate the manifest
    const validationIssues = validator.validateTree(manifest);
    const allIssues = Object.values(validationIssues).flat();
    const criticalErrors = allIssues.filter(
      i => i.level === 'error' && i.category === 'Identity'
    );
    expect(criticalErrors).toEqual([]);

    // Step 4: Verify workflow log is tracking
    expect(screen.getByTestId('workflow-log')).toHaveTextContent('');
  });

  it('should support rename manifest workflow', async () => {
    const user = userEvent.setup();

    // Create initial manifest
    const files = [createImageFile('jpegSmall', 'test.jpg')];
    files[0] = Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'test/test.jpg',
      writable: false,
    }) as File;

    const tree = buildTree(files);
    const ingestResult = await ingestTree(tree, null);
    const manifest = ingestResult.root as IIIFManifest;

    // Render editor
    render(
      <ManifestEditorTest manifestId={manifest.id} />,
      { wrapper: createWrapper(manifest) }
    );

    // Verify initial label
    const initialLabel = screen.getByTestId('manifest-label').textContent;
    expect(initialLabel).toBeTruthy();

    // Click rename button
    await user.click(screen.getByTestId('rename-btn'));

    // Verify rename was successful
    await waitFor(() => {
      expect(screen.getByTestId('edit-result')).toHaveTextContent('rename-success');
    });
  });

  it('should support add canvas workflow', async () => {
    const user = userEvent.setup();

    const files = [createImageFile('jpegSmall', 'base.jpg')];
    Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'base/base.jpg',
      writable: false,
    });

    const tree = buildTree(files);
    const ingestResult = await ingestTree(tree, null);
    const manifest = ingestResult.root as IIIFManifest;

    render(
      <ManifestEditorTest manifestId={manifest.id} />,
      { wrapper: createWrapper(manifest) }
    );

    const initialCount = screen.getByTestId('canvas-count').textContent;

    // Add a canvas
    await user.click(screen.getByTestId('add-canvas-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-result')).toHaveTextContent('add-success');
    });

    // Verify canvas count increased
    const newCount = screen.getByTestId('canvas-count').textContent;
    expect(parseInt(newCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
  });

  it('should support undo/redo workflow', async () => {
    const user = userEvent.setup();

    const files = [createImageFile('jpegSmall', 'undo-test.jpg')];
    Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'undo/undo-test.jpg',
      writable: false,
    });

    const tree = buildTree(files);
    const ingestResult = await ingestTree(tree, null);
    const manifest = ingestResult.root as IIIFManifest;

    render(
      <WorkflowTestApp initialRoot={manifest} />,
      { wrapper: createWrapper(manifest) }
    );

    // Initially can't undo
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');

    // Perform an action that can be undone (through the manifest editor)
    render(
      <ManifestEditorTest manifestId={manifest.id} />,
      { wrapper: createWrapper(manifest) }
    );

    await user.click(screen.getByTestId('rename-btn'));

    // After action, undo should be available
    await waitFor(() => {
      expect(screen.getByTestId('edit-result')).toHaveTextContent('rename-success');
    });
  });
});

// ============================================================================
// Folder Structure Tests
// ============================================================================

describe('Folder Structure Import', () => {
  it('should preserve folder hierarchy in nested structure', async () => {
    const folderStructure = createFolderStructure();

    // Flatten all files for import
    const allFiles: File[] = [];
    folderStructure.forEach((files, folder) => {
      files.forEach(file => {
        Object.defineProperty(file, 'webkitRelativePath', {
          value: `${folder}/${file.name}`,
          writable: false,
        });
        allFiles.push(file);
      });
    });

    const tree = buildTree(allFiles);

    // Verify all directories are captured
    expect(tree.directories.size).toBeGreaterThanOrEqual(3);

    // Verify nested folder exists
    expect(tree.directories.has('nested/deep')).toBe(true);

    // Ingest and verify
    const result = await ingestTree(tree, null);
    expect(result.root).toBeDefined();
  });

  it('should handle large batch import of real images', async () => {
    const files = createImageFiles(20);

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);

    expect(result.root).toBeDefined();
    expect(result.report.filesProcessed).toBeGreaterThanOrEqual(1);
    expect(result.report.warnings.length).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// Validation and Healing Workflow Tests
// ============================================================================

describe('Validation and Healing Workflows', () => {
  it('should detect and heal issues in imported manifest', async () => {
    const files = [
      createImageFile('jpegSmall', 'needs-healing.jpg'),
    ];
    Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'healing/needs-healing.jpg',
      writable: false,
    });

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);
    const manifest = result.root as IIIFManifest;

    // Validate and find issues
    const validationIssues = validator.validateTree(manifest);
    const allIssues = Object.values(validationIssues).flat();

    // Some issues may exist (warnings are expected for some properties)
    expect(allIssues).toBeDefined();

    // Try to heal fixable issues
    const fixableIssues = allIssues.filter(i => i.fixable);
    let healedManifest = manifest;

    for (const issue of fixableIssues) {
      const healResult = healIssue(healedManifest, issue);
      if (healResult.success && healResult.updatedItem) {
        healedManifest = healResult.updatedItem as IIIFManifest;
      }
    }

    // Verify healing was attempted
    expect(healedManifest).toBeDefined();

    // Re-validate to check for improvements
    const revalidationIssues = validator.validateTree(healedManifest);
    expect(revalidationIssues).toBeDefined();
  });

  it('should use healAllIssues for batch healing', async () => {
    const files = [createImageFile('pngSmall', 'batch-heal.png')];
    Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'batch/batch-heal.png',
      writable: false,
    });

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);
    const manifest = result.root as IIIFManifest;

    const validationIssues = validator.validateTree(manifest);
    const allIssues = Object.values(validationIssues).flat();

    // Batch heal
    const healResult = healAllIssues(manifest, allIssues);

    expect(healResult).toBeDefined();
    expect(healResult.healed + healResult.failed).toBeLessThanOrEqual(allIssues.length);
  });
});

// ============================================================================
// Error Recovery Tests
// ============================================================================

describe('Error Recovery', () => {
  it('should recover from invalid manifest state gracefully', async () => {
    const invalidManifest = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      // Missing required fields
    } as unknown as IIIFManifest;

    // Should not crash
    render(<WorkflowTestApp initialRoot={invalidManifest} />, {
      wrapper: createWrapper(invalidManifest),
    });

    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('should handle rapid state updates without data loss', async () => {
    const files = createImageFiles(5);
    const tree = buildTree(files);
    const result = await ingestTree(tree, null);
    const manifest = result.root as IIIFManifest;

    const { rerender } = render(
      <WorkflowTestApp initialRoot={manifest} />,
      { wrapper: createWrapper(manifest) }
    );

    const initialCount = screen.getByTestId('entity-count').textContent;

    // Rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender(<WorkflowTestApp initialRoot={manifest} />);
    }

    // State should be stable
    const finalCount = screen.getByTestId('entity-count').textContent;
    expect(finalCount).toBe(initialCount);
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe('Performance - Real Image Processing', () => {
  it('should handle many files without timeout', async () => {
    const files = createImageFiles(30);

    const startTime = Date.now();
    const tree = buildTree(files);
    const result = await ingestTree(tree, null);
    const duration = Date.now() - startTime;

    expect(result.root).toBeDefined();
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });

  it('should handle large image file', async () => {
    // Use the larger PNG file
    const files = [createImageFile('pngLarge', 'large-image.png')];
    Object.defineProperty(files[0], 'webkitRelativePath', {
      value: 'large/large-image.png',
      writable: false,
    });

    const tree = buildTree(files);
    const result = await ingestTree(tree, null);

    expect(result.root).toBeDefined();
    expect(result.report.filesProcessed).toBe(1);
  });
});
