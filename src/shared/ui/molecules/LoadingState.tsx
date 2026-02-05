/**
 * LoadingState Molecule
 *
 * Composes: Spinner/skeleton + message
 *
 * Standardized loading indicator with fieldmode-aware styling.
 * Provides visual feedback during async operations.
 *
 * IDEAL OUTCOME: Clear loading feedback prevents user confusion
 * FAILURE PREVENTED: Unclear state — user doesn't know if app is working
 */

import React from 'react';
import { Icon } from '../atoms';
import type { ContextualClassNames } from '@/hooks/useContextualStyles';
import { UI_TIMING } from '../../config/tokens';

export interface LoadingStateProps {
  /** Optional status message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full container height (centered) */
  fullHeight?: boolean;
  /** Show skeleton placeholder instead of spinner */
  skeleton?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Contextual styles from template */
  cx?: ContextualClassNames;
  /** Current field mode */
  fieldMode?: boolean;
}

const sizeClasses = {
  sm: { icon: 'text-lg', spinner: 'w-5 h-5', text: 'text-sm' },
  md: { icon: 'text-2xl', spinner: 'w-8 h-8', text: 'text-base' },
  lg: { icon: 'text-4xl', spinner: 'w-12 h-12', text: 'text-lg' },
};

/**
 * LoadingState Molecule
 *
 * @example
 * {isLoading ? (
 *   <LoadingState message="Loading archive..." size="lg" fullHeight />
 * ) : (
 *   <Content />
 * )}
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullHeight = false,
  skeleton = false,
  className = '',
  cx = {},
  fieldMode: _fieldMode = false,
}) => {
  // Context is provided via props (no hook calls)

  const sizeClass = sizeClasses[size];

  if (skeleton) {
    return (
      <div
        className={`
          animate-pulse
          ${fullHeight ? 'h-full flex items-center justify-center' : ''}
          ${className}
        `}
        role="status"
        aria-label={message}
      >
        <div className={`${cx.subtleBg} rounded-md w-full h-24`} />
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3
        ${fullHeight ? 'h-full min-h-[200px]' : 'py-8'}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Spinner animation */}
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`
            ${sizeClass.spinner}
            rounded-full
            border-2 ${cx.border}
            border-t-transparent
            animate-spin
          `}
          style={{ animationDuration: `${UI_TIMING.animation * 2}ms` }}
          aria-hidden="true"
        />

        {/* Center icon (optional visual enhancement) */}
        <div
          className={`
            absolute inset-0
            flex items-center justify-center
            ${sizeClass.icon} ${cx.textMuted}
          `}
        >
          <Icon name="refresh" className="animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* Message */}
      <p className={`${sizeClass.text} ${cx.textMuted} text-center`}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
