/**
 * ViewerView Organism
 *
 * Main organism for the IIIF viewer feature. Composes molecules for
 * toolbar, content, navigation, and panels.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Receives cx and fieldMode via props (no hook calls)
 * - Composes molecules: ViewerToolbar, ViewerContent, FilmstripNavigator, ViewerPanels
 * - Domain logic delegated to useViewer hook
 * - Under 300 lines (target ~150, current ~170 with legacy integration)
 *
 * IDEAL OUTCOME: Users can view, zoom, and annotate IIIF canvases
 * FAILURE PREVENTED: OSD memory leaks, stale image URLs, annotation loss
 *
 * @module features/viewer/ui/organisms/ViewerView
 */

import React, { useCallback, useRef, useState } from 'react';
import { getIIIFValue, type IIIFAnnotation, type IIIFCanvas, type IIIFManifest } from '@/src/shared/types';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';
import {
  AnnotationDrawingOverlay,
  FilmstripNavigator,
  KeyboardShortcutsModal,
  type SearchResult,
  ViewerContent,
  ViewerEmptyState,
  ViewerPanels,
  ViewerToolbar,
  ViewerWorkbench,
  type AnnotationDrawingMode,
} from '../molecules';
import { useViewer, type DrawingMode } from '../../model';
import { useVaultDispatch } from '@/src/entities/manifest/model/hooks/useIIIFEntity';
import { actions } from '@/src/entities/manifest/model/actions';

// Note: CanvasComposer has been phased out in favor of Board View
// See: src/features/board-design/ui/organisms/BoardView.tsx

export interface ViewerViewProps {
  item: IIIFCanvas | null;
  manifest: IIIFManifest | null;
  manifestItems?: IIIFCanvas[];
  onUpdate: (item: Partial<IIIFCanvas>) => void;
  /** @deprecated Canvas Composer phased out in favor of Board View */
  autoOpenComposer?: boolean;
  /** @deprecated Canvas Composer phased out in favor of Board View */
  onComposerOpened?: () => void;
  /** Navigate to Board view with current canvas */
  onAddToBoard?: (canvasId: string) => void;
  cx: ContextualClassNames;
  fieldMode: boolean;
  t: (key: string) => string;
  isAdvanced: boolean;
  // Controlled annotation mode (for integration with external Inspector)
  /** Whether annotation tool is active (controlled mode) */
  annotationToolActive?: boolean;
  /** Toggle annotation tool (controlled mode) */
  onAnnotationToolToggle?: (active: boolean) => void;
  /** Annotation text from Inspector */
  annotationText?: string;
  /** Annotation motivation from Inspector */
  annotationMotivation?: 'commenting' | 'tagging' | 'describing';
  /** Callback when drawing state changes */
  onAnnotationDrawingStateChange?: (state: { pointCount: number; isDrawing: boolean; canSave: boolean }) => void;
  /** Ref callback to expose save function */
  onAnnotationSaveRef?: (fn: () => void) => void;
  /** Ref callback to expose clear function */
  onAnnotationClearRef?: (fn: () => void) => void;
}

export const ViewerView: React.FC<ViewerViewProps> = ({
  item,
  manifest,
  manifestItems,
  onUpdate,
  autoOpenComposer: _autoOpenComposer,
  onComposerOpened: _onComposerOpened,
  onAddToBoard,
  cx,
  fieldMode,
  t,
  isAdvanced: _isAdvanced,
  // Controlled annotation props
  annotationToolActive,
  onAnnotationToolToggle,
  annotationText: annotationTextProp,
  annotationMotivation: annotationMotivationProp,
  onAnnotationDrawingStateChange,
  onAnnotationSaveRef,
  onAnnotationClearRef,
}) => {
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Annotation state - use controlled props if provided, otherwise internal state
  const [internalShowAnnotationTool, setInternalShowAnnotationTool] = useState(false);
  const [internalAnnotationText, setInternalAnnotationText] = useState('');
  const [internalAnnotationMotivation, setInternalAnnotationMotivation] = useState<'commenting' | 'tagging' | 'describing'>('commenting');

  // Use controlled or internal state
  const isControlledAnnotation = annotationToolActive !== undefined;
  const showAnnotationTool = isControlledAnnotation ? annotationToolActive : internalShowAnnotationTool;
  const setShowAnnotationTool = isControlledAnnotation
    ? (active: boolean) => onAnnotationToolToggle?.(active)
    : setInternalShowAnnotationTool;
  const annotationText = isControlledAnnotation ? (annotationTextProp ?? '') : internalAnnotationText;
  const annotationMotivation = isControlledAnnotation ? (annotationMotivationProp ?? 'commenting') : internalAnnotationMotivation;

  // Annotation drawing state - controlled from toolbar, used by overlay
  const [annotationDrawingMode, setAnnotationDrawingMode] = useState<DrawingMode>('polygon');
  const annotationUndoRef = useRef<(() => void) | null>(null);
  const annotationClearRef = useRef<(() => void) | null>(null);
  const annotationSaveRef = useRef<(() => void) | null>(null);

  // Get vault dispatch for persisting annotations
  const { dispatch } = useVaultDispatch();

  const {
    mediaType,
    annotations,
    resolvedImageUrl,
    zoomLevel,
    rotation,
    isFlipped,
    showNavigator,
    isFullscreen,
    showFilmstrip,
    showKeyboardHelp,
    viewerRef,
    osdContainerRef,
    containerRef,
    zoomIn,
    zoomOut,
    resetView,
    rotateCW,
    rotateCCW,
    flipHorizontal,
    takeScreenshot,
    toggleFullscreen,
    toggleNavigator,
    toggleFilmstrip,
    toggleKeyboardHelp,
    canDownload,
    hasSearchService,
  } = useViewer(item, manifest);

  // Handle screenshot with download
  const handleScreenshot = useCallback(async () => {
    const blob = await takeScreenshot();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [takeScreenshot]);

  // Handle creating annotation - persist to vault and update canvas
  const handleCreateAnnotation = useCallback((annotation: IIIFAnnotation) => {
    if (!item?.id) {
      console.warn('[ViewerView] Cannot create annotation: no canvas selected');
      return;
    }

    // Dispatch to vault to persist the annotation
    const result = dispatch(actions.addAnnotation(item.id, annotation));
    if (result) {
      console.log('[ViewerView] Annotation persisted to canvas:', item.id, annotation.id);

      // Also update the canvas through onUpdate to ensure UI refresh
      if (onUpdate && item) {
        // Create a new annotations array by adding the new annotation
        const existingPages = item.annotations || [];
        let annotationPage = existingPages[0];

        if (!annotationPage) {
          // Create a new annotation page if none exists
          annotationPage = {
            id: `${item.id}/annotations/1`,
            type: 'AnnotationPage',
            items: [annotation]
          } as any;
          onUpdate({ annotations: [annotationPage] });
        } else {
          // Add to existing annotation page
          const updatedPage = {
            ...annotationPage,
            items: [...(annotationPage.items || []), annotation]
          };
          onUpdate({ annotations: [updatedPage, ...existingPages.slice(1)] });
        }
      }
    }
    // Keep annotation tool open so user can add more annotations
  }, [item, dispatch, onUpdate]);

  // Handle adding current canvas to Board
  const handleAddToBoard = () => {
    if (item && onAddToBoard) {
      onAddToBoard(item.id);
    }
  };

  const currentSearchService = manifest?.service?.find(
    (s: any) => s.type === 'SearchService2' || s.profile?.includes('search')
  ) || null;

  if (!item) {
    return <ViewerEmptyState t={t} cx={cx as any} fieldMode={fieldMode} />;
  }

  const label = getIIIFValue(item.label);
  const currentIndex = manifestItems?.findIndex((c) => c.id === item.id) ?? -1;
  const totalItems = manifestItems?.length ?? 1;

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col overflow-hidden relative ${fieldMode ? 'bg-black' : 'bg-slate-100 dark:bg-slate-900'}`}
    >
      <ViewerToolbar
        label={label}
        mediaType={mediaType}
        zoomLevel={zoomLevel}
        rotation={rotation}
        isFlipped={isFlipped}
        showNavigator={showNavigator}
        annotationCount={annotations.length}
        hasSearchService={hasSearchService}
        canDownload={canDownload}
        isFullscreen={isFullscreen}
        showSearchPanel={showSearchPanel}
        showWorkbench={showWorkbench}
        showComposer={false}
        showAnnotationTool={showAnnotationTool}
        annotationDrawingMode={annotationDrawingMode}
        hasMultipleCanvases={!!manifestItems && manifestItems.length > 1}
        showFilmstrip={showFilmstrip}
        viewerReady={!!viewerRef.current}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onRotateCW={rotateCW}
        onRotateCCW={rotateCCW}
        onFlipHorizontal={flipHorizontal}
        onTakeScreenshot={handleScreenshot}
        onToggleNavigator={toggleNavigator}
        onToggleKeyboardHelp={toggleKeyboardHelp}
        onToggleSearch={() => setShowSearchPanel(true)}
        onToggleWorkbench={() => setShowWorkbench(true)}
        onToggleComposer={handleAddToBoard}
        onToggleAnnotationTool={() => setShowAnnotationTool(!showAnnotationTool)}
        onAnnotationModeChange={setAnnotationDrawingMode}
        onAnnotationUndo={() => annotationUndoRef.current?.()}
        onAnnotationClear={() => annotationClearRef.current?.()}
        onToggleMetadata={() => {}}
        onToggleFullscreen={toggleFullscreen}
        onToggleFilmstrip={toggleFilmstrip}
        cx={cx as any}
        fieldMode={fieldMode}
      />

      <div className="flex-1 flex min-h-0 relative">
        <ViewerContent
          canvas={item}
          mediaType={mediaType}
          resolvedUrl={resolvedImageUrl}
          osdContainerRef={osdContainerRef}
          annotations={annotations as any}
          cx={cx as any}
          fieldMode={fieldMode}
        />

        {/* Integrated Annotation Drawing Overlay */}
        <AnnotationDrawingOverlay
          canvas={item}
          viewerRef={viewerRef}
          isActive={showAnnotationTool}
          drawingMode={annotationDrawingMode}
          onDrawingModeChange={setAnnotationDrawingMode}
          onCreateAnnotation={handleCreateAnnotation}
          onClose={() => setShowAnnotationTool(false)}
          existingAnnotations={annotations}
          onUndoRef={(fn) => { annotationUndoRef.current = fn; }}
          onClearRef={(fn) => {
            annotationClearRef.current = fn;
            onAnnotationClearRef?.(fn);
          }}
          onSaveRef={(fn) => {
            annotationSaveRef.current = fn;
            onAnnotationSaveRef?.(fn);
          }}
          onDrawingStateChange={onAnnotationDrawingStateChange}
          annotationText={annotationText}
          annotationMotivation={annotationMotivation}
          cx={cx as any}
          fieldMode={fieldMode}
        />
      </div>

      <FilmstripNavigator
        currentIndex={currentIndex}
        totalItems={totalItems}
        loadingStatus={resolvedImageUrl ? 'Image loaded' : 'Loading...'}
        label={t('Canvas')}
        cx={cx as any}
        fieldMode={fieldMode}
      />

      {/* Legacy Modals */}
      {showWorkbench && item && (
        <ViewerWorkbench
          canvas={item}
          onClose={() => setShowWorkbench(false)}
          onApply={(url) => {
            console.log('Applied IIIF URL:', url);
            setShowWorkbench(false);
          }}
          cx={cx as any}
          fieldMode={fieldMode}
        />
      )}

      {/* Canvas Composer removed - use Board View for composition */}

      <ViewerPanels
        currentCanvasId={item?.id}
        manifest={manifest}
        searchService={currentSearchService as { id: string; type: string; profile?: string } | null}
        showSearchPanel={showSearchPanel}
        onCloseSearchPanel={() => setShowSearchPanel(false)}
        onSearchResultSelect={(result: SearchResult) => console.log('Selected:', result)}
        onSearch={async (query: string) => {
          console.log('Searching for:', query);
          return [];
        }}
        cx={cx as any}
        fieldMode={fieldMode}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardHelp}
        onClose={toggleKeyboardHelp}
        cx={cx as any}
        fieldMode={fieldMode}
      />
    </div>
  );
};

export default ViewerView;
