/**
 * ViewRouter
 *
 * Routes requests to feature views based on app mode.
 * Each route is wrapped with BaseTemplate and FieldModeTemplate.
 *
 * Usage:
 *   <ViewRouter
 *     currentMode="archive"
 *     selectedId={selectedId}
 *     root={root}
 *     onModeChange={setCurrentMode}
 *     onSelect={setSelectedId}
 *   />
 *
 * Philosophy:
 * - Router knows about templates, not features directly
 * - Each route is wrapped with required context
 * - Incremental switchover: old components → new feature slices
 */

import React from 'react';
import type { AppMode, IIIFItem } from '@/types';
import { BaseTemplate } from '../templates/BaseTemplate';
import { FieldModeTemplate } from '../templates/FieldModeTemplate';

// Import old components (temporary, during switchover)
import { ViewRouter as OldViewRouter } from '@/components/ViewRouter';

export interface ViewRouterProps {
  /** Current app mode (archive, boards, metadata, etc.) */
  currentMode: AppMode;
  /** Currently selected entity ID */
  selectedId: string | null;
  /** IIIF tree root */
  root: IIIFItem | null;
  /** Show/hide sidebar */
  showSidebar: boolean;
  /** Callback when mode changes */
  onModeChange: (mode: AppMode) => void;
  /** Callback when selection changes */
  onSelect: (id: string | null) => void;
  /** Callback when sidebar toggle is clicked */
  onSidebarToggle: () => void;
  /** Optional sidebar content */
  sidebarContent?: React.ReactNode;
  /** Optional header content */
  headerContent?: React.ReactNode;
}

/**
 * Route dispatcher
 *
 * Maps app mode to appropriate view.
 * Wrapped with BaseTemplate for layout and FieldModeTemplate for context.
 *
 * During implementation, uses old components via OldViewRouter.
 * As features are implemented (Phase 4), routes are updated to use new feature slices.
 */
export const ViewRouter: React.FC<ViewRouterProps> = ({
  currentMode,
  selectedId,
  root,
  showSidebar,
  onModeChange,
  onSelect,
  onSidebarToggle,
  sidebarContent,
  headerContent
}) => {
  // Placeholder for future phase 4 feature routes
  // Example:
  // if (currentMode === 'archive') {
  //   return (
  //     <BaseTemplate showSidebar={showSidebar} onSidebarToggle={onSidebarToggle}>
  //       <FieldModeTemplate>
  //         {({ cx, fieldMode }) => (
  //           <ArchiveView
  //             root={root}
  //             selectedId={selectedId}
  //             cx={cx}
  //             fieldMode={fieldMode}
  //             onSelect={onSelect}
  //           />
  //         )}
  //       </FieldModeTemplate>
  //     </BaseTemplate>
  //   );
  // }

  // Currently: delegate to old component system during implementation
  // This is the "strangler fig" pattern - new features are wired in gradually

  return (
    <BaseTemplate
      showSidebar={showSidebar}
      onSidebarToggle={onSidebarToggle}
      sidebarContent={sidebarContent}
      headerContent={headerContent}
    >
      <FieldModeTemplate>
        {({ cx, fieldMode }) => (
          // Temporary: use old ViewRouter while features are being implemented
          <OldViewRouter
            currentMode={currentMode}
            root={root}
            selectedId={selectedId}
            onModeChange={onModeChange}
            onSelect={onSelect}
            cx={cx}
            fieldMode={fieldMode}
          />
        )}
      </FieldModeTemplate>
    </BaseTemplate>
  );
};

export default ViewRouter;
