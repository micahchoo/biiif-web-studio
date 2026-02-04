/**
 * Viewer Feature
 *
 * IIIF canvas viewer with deep zoom, annotations, and media playback.
 *
 * @example
 * import { ViewerView } from '@/src/features/viewer';
 *
 * <ViewerView
 *   item={canvas}
 *   manifest={manifest}
 *   onUpdate={handleUpdate}
 *   cx={cx}
 *   fieldMode={fieldMode}
 *   t={t}
 *   isAdvanced={isAdvanced}
 * />
 */

export { ViewerView } from './ui/organisms/ViewerView';
export type { ViewerViewProps } from './ui/organisms/ViewerView';

export {
  useViewer,
  type MediaType,
  type ViewerState,
  type UseViewerReturn,
} from './model';

// Composer exports
export {
  useComposer,
  type UseComposerReturn,
} from './model';

export {
  ComposerToolbar,
  ComposerSidebar,
  ComposerCanvas,
  type ComposerToolbarProps,
  type ComposerSidebarProps,
  type ComposerCanvasProps,
} from './ui/molecules';

export { CanvasComposerPanel } from './ui/organisms/CanvasComposerPanel';
export type { CanvasComposerPanelProps } from './ui/organisms/CanvasComposerPanel';

// Annotation exports
export {
  useAnnotation,
  pointsToSvgPath,
  createSvgSelector,
  parseSvgSelector,
  type DrawingMode,
  type UseAnnotationReturn,
} from './model';

export {
  AnnotationToolbar,
  AnnotationCanvas,
  AnnotationForm,
  type AnnotationToolbarProps,
  type AnnotationCanvasProps,
  type AnnotationFormProps,
} from './ui/molecules';

export { AnnotationToolPanel } from './ui/organisms/AnnotationToolPanel';
export type { AnnotationToolPanelProps } from './ui/organisms/AnnotationToolPanel';
