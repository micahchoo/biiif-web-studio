/**
 * Metadata Edit Feature
 *
 * Public API for the metadata-edit feature slice.
 *
 * Provides:
 * - MetadataView: Main organism for spreadsheet-style metadata editing
 * - MetadataEditorPanel: Side panel for single-item metadata editing
 * - Model: Selectors, flattening, CSV export/import, change detection
 *
 * ATOMIC REFACTOR STATUS: Phase 4c - Partially Implemented
 *
 * This feature slice follows the Atomic Design + FSD architecture:
 * - Organisms receive context via props from FieldModeTemplate (no hook calls)
 * - Molecules from shared/ui/molecules are composed here
 * - Domain logic is centralized in model/
 * - Zero prop-drilling of fieldMode
 *
 * DECOMPOSITION NOTES:
 * - MetadataView organism: New refactored version of MetadataSpreadsheet
 *   - Uses ViewContainer, FilterInput, Toolbar, EmptyState molecules
 *   - Delegates CSV logic to model
 *   - Still needs: Full edit tracking, cell validation, batch operations
 *
 * - Model layer: Extracted from scattered logic in old components
 *   - flattenTree: Converts IIIF hierarchy to flat spreadsheet rows
 *   - filterByTerm: Search across all metadata fields
 *   - extractColumns: Dynamic column detection
 *   - itemsToCSV / parseCSV: Import/export functionality
 *   - detectChanges: Unsaved change tracking
 *
 * TODO FOR FULL REFACTOR:
 * 1. Implement MetadataEditorPanel organism (extract from MetadataEditor.tsx)
 * 2. Add edit tracking with original vs current state comparison
 * 3. Implement batch metadata operations (add/remove columns)
 * 4. Add cell-level validation
 * 5. Extract CSV import modal to molecules
 * 6. Navigation guard integration with app layer
 *
 * @module features/metadata-edit
 */

export { MetadataView } from './ui/organisms/MetadataView';
export type { MetadataViewProps } from './ui/organisms/MetadataView';

export { MetadataEditorPanel } from './ui/organisms/MetadataEditorPanel';
export type { MetadataEditorPanelProps } from './ui/organisms/MetadataEditorPanel';

export { Inspector } from './ui/organisms/Inspector';

export { CSVImportModal } from './ui/molecules/CSVImportModal';
export type { CSVImportModalProps, ImportStep, CSVImportResult } from './ui/molecules/CSVImportModal';

export { StructureTabPanel } from './ui/molecules/StructureTabPanel';

export * from './model';
