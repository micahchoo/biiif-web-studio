/**
 * ViewerToolbar Molecule
 *
 * Composes: IconButton + ZoomControl + Icon atoms
 *
 * Toolbar for IIIF viewer with zoom controls, annotation badges,
 * search, workbench, composer, and fullscreen toggles.
 *
 * ATOMIC DESIGN COMPLIANCE:
 * - Receives cx and fieldMode via props (no hook calls)
 * - Composes molecules: IconButton, ZoomControl
 * - Composes atoms: Icon
 * - Local UI state only
 * - No domain logic - all actions passed as callbacks
 *
 * IDEAL OUTCOME: Consistent viewer toolbar across all viewer modes
 * FAILURE PREVENTED: Missing controls, inconsistent button states
 *
 * @module features/viewer/ui/molecules/ViewerToolbar
 */

import React from 'react';
import { Icon } from '@/src/shared/ui/atoms';
import { IconButton } from '@/src/shared/ui/molecules';
import { ZoomControl } from '@/src/features/viewer/ui/atoms';
import type { ContextualClassNames } from '@/src/shared/lib/hooks/useContextualStyles';

export type AnnotationDrawingMode = 'polygon' | 'rectangle' | 'freehand' | 'select';

export interface ViewerToolbarProps {
  /** Canvas label/title to display */
  label: string;
  /** Media type for icon display */
  mediaType: 'image' | 'video' | 'audio' | 'other';
  /** Current zoom level (percentage) */
  zoomLevel: number;
  /** Current rotation in degrees */
  rotation?: number;
  /** Whether image is flipped */
  isFlipped?: boolean;
  /** Whether navigator is visible */
  showNavigator?: boolean;
  /** Number of annotations */
  annotationCount: number;
  /** Whether search service is available */
  hasSearchService: boolean;
  /** Whether image can be downloaded */
  canDownload: boolean;
  /** Whether viewer is in fullscreen */
  isFullscreen: boolean;
  /** Whether search panel is open */
  showSearchPanel: boolean;
  /** Whether workbench is open */
  showWorkbench: boolean;
  /** Whether composer is open */
  showComposer: boolean;
  /** Whether annotation tool is open */
  showAnnotationTool: boolean;
  /** Current drawing mode when annotation tool is active */
  annotationDrawingMode?: AnnotationDrawingMode;
  /** Whether there are multiple canvases */
  hasMultipleCanvases: boolean;
  /** Whether filmstrip is visible */
  showFilmstrip: boolean;
  /** Whether OSD viewer is ready */
  viewerReady: boolean;
  /** Zoom in handler */
  onZoomIn: () => void;
  /** Zoom out handler */
  onZoomOut: () => void;
  /** Reset view handler */
  onResetView: () => void;
  /** Rotate clockwise handler */
  onRotateCW?: () => void;
  /** Rotate counter-clockwise handler */
  onRotateCCW?: () => void;
  /** Flip horizontal handler */
  onFlipHorizontal?: () => void;
  /** Screenshot handler */
  onTakeScreenshot?: () => void;
  /** Navigator toggle */
  onToggleNavigator?: () => void;
  /** Keyboard help toggle */
  onToggleKeyboardHelp?: () => void;
  /** Search panel toggle */
  onToggleSearch: () => void;
  /** Workbench toggle */
  onToggleWorkbench: () => void;
  /** Composer toggle */
  onToggleComposer: () => void;
  /** Annotation tool toggle */
  onToggleAnnotationTool: () => void;
  /** Change annotation drawing mode */
  onAnnotationModeChange?: (mode: AnnotationDrawingMode) => void;
  /** Undo annotation drawing */
  onAnnotationUndo?: () => void;
  /** Clear annotation drawing */
  onAnnotationClear?: () => void;
  /** Metadata panel toggle */
  onToggleMetadata: () => void;
  /** Download handler */
  onDownload?: () => void;
  /** Fullscreen toggle */
  onToggleFullscreen: () => void;
  /** Filmstrip toggle */
  onToggleFilmstrip: () => void;
  /** Contextual styles from template */
  cx: ContextualClassNames;
  /** Current field mode */
  fieldMode: boolean;
}

/**
 * ViewerToolbar Molecule
 *
 * @example
 * <ViewerToolbar
 *   label="Page 1"
 *   mediaType="image"
 *   zoomLevel={100}
 *   annotationCount={3}
 *   hasSearchService={true}
 *   onZoomIn={zoomIn}
 *   onZoomOut={zoomOut}
 *   cx={cx}
 *   fieldMode={fieldMode}
 * />
 */
export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  label,
  mediaType,
  zoomLevel,
  rotation = 0,
  isFlipped = false,
  showNavigator = true,
  annotationCount,
  hasSearchService,
  canDownload,
  isFullscreen,
  showSearchPanel,
  showWorkbench,
  showComposer,
  showAnnotationTool,
  hasMultipleCanvases,
  showFilmstrip,
  viewerReady,
  onZoomIn,
  onZoomOut,
  onResetView,
  onRotateCW,
  onRotateCCW,
  onFlipHorizontal,
  onTakeScreenshot,
  onToggleNavigator,
  onToggleKeyboardHelp,
  onToggleSearch,
  onToggleWorkbench,
  onToggleComposer,
  onToggleAnnotationTool,
  onAnnotationModeChange,
  onAnnotationUndo,
  onAnnotationClear,
  onToggleMetadata,
  onDownload,
  onToggleFullscreen,
  onToggleFilmstrip,
  cx,
  fieldMode,
  annotationDrawingMode,
}) => {
  const iconName = mediaType === 'video' ? 'movie' : mediaType === 'audio' ? 'audiotrack' : 'image';

  return (
    <div
      className={`h-14 border-b flex items-center justify-between px-4 shrink-0 z-20 ${cx.headerBg} ${cx.border}`}
    >
      {/* Left: Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Icon name={iconName} className={`${cx.accent} shrink-0`} />
        <h2 className={`font-bold truncate ${cx.text}`}>
          {label}
        </h2>
      </div>

      {/* Right: Toolbar Actions */}
      <div className="flex items-center gap-1">
        {mediaType === 'image' && (
          <>
            {/* Zoom Controls */}
            <ZoomControl
              zoom={zoomLevel / 100}
              onZoomChange={(z) => {
                const pct = Math.round(z * 100);
                if (pct > zoomLevel) onZoomIn();
                else if (pct < zoomLevel) onZoomOut();
              }}
              onReset={onResetView}
              disabled={!viewerReady}
              cx={cx}
            />

            {/* Divider */}
            <div className={`w-px h-6 ${cx.divider}`} />

            {/* Rotation Controls */}
            {onRotateCCW && (
              <IconButton
                icon="rotate_left"
                ariaLabel="Rotate counter-clockwise"
                onClick={onRotateCCW}
                disabled={!viewerReady}
                variant="ghost"
                cx={cx}
                fieldMode={fieldMode}
              />
            )}

            {rotation !== 0 && (
              <span className={`text-xs font-mono ${fieldMode ? 'text-yellow-400' : 'text-blue-400'}`}>
                {rotation}°
              </span>
            )}

            {onRotateCW && (
              <IconButton
                icon="rotate_right"
                ariaLabel="Rotate clockwise"
                onClick={onRotateCW}
                disabled={!viewerReady}
                variant="ghost"
                cx={cx}
                fieldMode={fieldMode}
              />
            )}

            {/* Flip Button */}
            {onFlipHorizontal && (
              <IconButton
                icon="flip"
                ariaLabel="Flip horizontally"
                onClick={onFlipHorizontal}
                disabled={!viewerReady}
                variant={isFlipped ? 'primary' : 'ghost'}
                cx={cx}
                fieldMode={fieldMode}
              />
            )}

            {/* Navigator Toggle */}
            {onToggleNavigator && (
              <IconButton
                icon="picture_in_picture"
                ariaLabel="Toggle navigator"
                onClick={onToggleNavigator}
                disabled={!viewerReady}
                variant={showNavigator ? 'primary' : 'ghost'}
                cx={cx}
                fieldMode={fieldMode}
              />
            )}

            {/* Divider */}
            <div className={`w-px h-6 ${cx.divider}`} />

            {/* Annotation Badge */}
            <div
              className={`p-2 rounded-lg relative cursor-pointer transition-colors ${
                annotationCount > 0
                  ? fieldMode ? 'text-yellow-400' : 'text-green-400'
                  : cx.textMuted
              } ${fieldMode ? 'hover:bg-yellow-900/30' : 'hover:bg-slate-700'} hover:${cx.text}`}
              title={`${annotationCount} Annotation${annotationCount !== 1 ? 's' : ''}`}
            >
              <Icon name="sticky_note_2" />
              {annotationCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center ${
                  fieldMode ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {annotationCount}
                </span>
              )}
            </div>
          </>
        )}

        {/* Search Button */}
        {hasSearchService && (
          <IconButton
            icon="search"
            ariaLabel="Search in Manifest"
            onClick={onToggleSearch}
            variant={showSearchPanel ? 'primary' : 'ghost'}
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Image Workbench Button */}
        {mediaType === 'image' && (
          <IconButton
            icon="tune"
            ariaLabel="Image Request Workbench"
            onClick={onToggleWorkbench}
            variant={showWorkbench ? 'primary' : 'ghost'}
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Add to Board Button (replaces Canvas Composer) */}
        <IconButton
          icon="dashboard"
          ariaLabel="Add to Board"
          onClick={onToggleComposer}
          variant="ghost"
          cx={cx}
          fieldMode={fieldMode}
        />

        {/* Annotation Tool Button */}
        {mediaType === 'image' && (
          <IconButton
            icon="gesture"
            ariaLabel="Annotation Tool"
            onClick={onToggleAnnotationTool}
            variant={showAnnotationTool ? 'primary' : 'ghost'}
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Drawing Mode Buttons - shown when annotation tool is active */}
        {showAnnotationTool && onAnnotationModeChange && (
          <>
            <div className={`w-px h-6 ${cx.divider}`} />

            <IconButton
              icon="pentagon"
              ariaLabel="Polygon mode"
              onClick={() => onAnnotationModeChange('polygon')}
              variant={annotationDrawingMode === 'polygon' ? 'primary' : 'ghost'}
              cx={cx}
              fieldMode={fieldMode}
            />
            <IconButton
              icon="crop_square"
              ariaLabel="Rectangle mode"
              onClick={() => onAnnotationModeChange('rectangle')}
              variant={annotationDrawingMode === 'rectangle' ? 'primary' : 'ghost'}
              cx={cx}
              fieldMode={fieldMode}
            />
            <IconButton
              icon="gesture"
              ariaLabel="Freehand mode"
              onClick={() => onAnnotationModeChange('freehand')}
              variant={annotationDrawingMode === 'freehand' ? 'primary' : 'ghost'}
              cx={cx}
              fieldMode={fieldMode}
            />
            <IconButton
              icon="pan_tool"
              ariaLabel="Pan mode (disable drawing)"
              onClick={() => onAnnotationModeChange('select')}
              variant={annotationDrawingMode === 'select' ? 'primary' : 'ghost'}
              cx={cx}
              fieldMode={fieldMode}
            />

            <div className={`w-px h-6 ${cx.divider}`} />

            {onAnnotationUndo && (
              <IconButton
                icon="undo"
                ariaLabel="Undo last point"
                onClick={onAnnotationUndo}
                variant="ghost"
                cx={cx}
                fieldMode={fieldMode}
              />
            )}
            {onAnnotationClear && (
              <IconButton
                icon="delete_outline"
                ariaLabel="Clear drawing"
                onClick={onAnnotationClear}
                variant="ghost"
                cx={cx}
                fieldMode={fieldMode}
              />
            )}
          </>
        )}

        {/* Metadata Toggle */}
        <IconButton
          icon="info"
          ariaLabel="Canvas Metadata"
          onClick={onToggleMetadata}
          variant="ghost"
          cx={cx}
          fieldMode={fieldMode}
        />

        {/* Screenshot */}
        {onTakeScreenshot && mediaType === 'image' && (
          <IconButton
            icon="photo_camera"
            ariaLabel="Take Screenshot"
            onClick={onTakeScreenshot}
            disabled={!viewerReady}
            variant="ghost"
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Download */}
        {canDownload && (
          <IconButton
            icon="download"
            ariaLabel="Download Image"
            onClick={onDownload || (() => {})}
            disabled={!onDownload}
            variant="ghost"
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Keyboard Shortcuts */}
        {onToggleKeyboardHelp && (
          <IconButton
            icon="keyboard"
            ariaLabel="Keyboard Shortcuts"
            onClick={onToggleKeyboardHelp}
            variant="ghost"
            cx={cx}
            fieldMode={fieldMode}
          />
        )}

        {/* Fullscreen */}
        <IconButton
          icon={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          ariaLabel="Toggle Fullscreen"
          onClick={onToggleFullscreen}
          variant="ghost"
          cx={cx}
          fieldMode={fieldMode}
        />

        {/* Filmstrip Toggle */}
        {hasMultipleCanvases && (
          <IconButton
            icon="view_carousel"
            ariaLabel="Toggle Canvas Navigator"
            onClick={onToggleFilmstrip}
            variant={showFilmstrip ? 'primary' : 'ghost'}
            cx={cx}
            fieldMode={fieldMode}
          />
        )}
      </div>
    </div>
  );
};

export default ViewerToolbar;
