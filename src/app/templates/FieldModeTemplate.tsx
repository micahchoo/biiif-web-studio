/**
 * FieldModeTemplate
 *
 * Provides fieldMode context and design tokens (cx) to child organisms.
 * This template ensures that organisms don't need to call useAppSettings or
 * useContextualStyles directly - they receive these via render props.
 *
 * Philosophy:
 * - Organisms are context-agnostic. App provides context via templates.
 * - No fieldMode prop-drilling. Use render props instead.
 * - cx (contextual styles) is always available, never undefined.
 *
 * Usage:
 *   <FieldModeTemplate>
 *     {({ cx, fieldMode }) => (
 *       <ArchiveView cx={cx} />
 *     )}
 *   </FieldModeTemplate>
 */

import React, { ReactNode } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useContextualStyles, ContextualClassNames } from '@/hooks/useContextualStyles';

export interface FieldModeTemplateRenderProps {
  /** Contextual class names for current fieldMode (light/dark) */
  cx: ContextualClassNames;
  /** Current field mode state (true = high-contrast dark mode) */
  fieldMode: boolean;
}

export interface FieldModeTemplateProps {
  /** Render function receives cx and fieldMode */
  children: (props: FieldModeTemplateRenderProps) => ReactNode;
}

/**
 * Template that injects fieldMode context to child organisms
 *
 * This is the primary way organisms receive styling and mode information.
 * Organisms wrapped in this template don't need to know about useAppSettings.
 */
export const FieldModeTemplate: React.FC<FieldModeTemplateProps> = ({ children }) => {
  // Get current app settings (fieldMode, etc.)
  const { settings } = useAppSettings();

  // Get contextual styles based on current fieldMode
  const cx = useContextualStyles(settings.fieldMode);

  // Pass both to children via render prop
  return (
    <>
      {children({
        cx,
        fieldMode: settings.fieldMode
      })}
    </>
  );
};

export default FieldModeTemplate;
