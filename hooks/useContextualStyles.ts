/**
 * useContextualStyles
 *
 * Unified contextual styling utility.  Returns pre-computed Tailwind
 * className strings for the most common UI patterns, keyed by semantic
 * role.  All values branch on fieldMode — the single most pervasive
 * conditional in the codebase.
 *
 * Usage:
 *   const cx = useContextualStyles(settings.fieldMode);
 *   <div className={cx.surface}>...</div>
 *
 * This eliminates the recurring `fieldMode ? 'dark-class' : 'light-class'`
 * ternaries scattered across components.
 */

import { useMemo } from 'react';

export interface ContextualClassNames {
  /** Card / panel surface (background + border) */
  surface: string;
  /** Primary text */
  text: string;
  /** Secondary / muted text */
  textMuted: string;
  /** Default border */
  border: string;
  /** Text input field (bg + border + focus ring) */
  input: string;
  /** Field label (uppercase micro-label above inputs) */
  label: string;
  /** Horizontal rule / section divider border */
  divider: string;
  /** Active / selected tab or button */
  active: string;
  /** Inactive / default tab or button */
  inactive: string;
  /** Accent / primary-action text colour */
  accent: string;
  /** Validation warning surface */
  warningBg: string;
  /** Header bar background */
  headerBg: string;

  // ── Extended semantic tokens ────────────────────────────────────────
  /** Danger / destructive text colour */
  danger: string;
  /** Danger hover background */
  dangerHover: string;
  /** Subtle badge / pill background (lighter than surface) */
  subtleBg: string;
  /** Primary text on subtleBg */
  subtleText: string;
  /** Keyboard-shortcut label (text + bg combined) */
  kbd: string;
  /** Icon-only action button with hover feedback */
  iconButton: string;
  /** Accent-coloured badge (bg + text for icon badges, pills) */
  accentBadge: string;
  /** Search / filter input (lighter bg variant than standard input) */
  searchInput: string;
  /** Thumbnail / media container background */
  thumbnailBg: string;
  /** Main heading size (fieldMode-conditional) */
  headingSize: string;
  /** Page / main content area background */
  pageBg: string;
  /** SVG stroke color (canvas connections) */
  svgStroke: string;
  /** SVG fill color (canvas labels) */
  svgFill: string;
  /** Canvas container background */
  canvasBg: string;
  /** Canvas grid overlay background */
  gridBg: string;
  /** Canvas grid lines color (hex for gradient) */
  gridLine: string;
  /** Button/control surface (bg + text + hover) */
  buttonSurface: string;
  /** Placeholder/empty container background */
  placeholderBg: string;
  /** Placeholder icon color */
  placeholderIcon: string;
  /** Divider/separator line */
  separator: string;
  /** Focus ring styling (ring + offset) */
  focusRing: string;
  /** SVG accent color (for highlights) */
  svgAccent: string;
}

export function useContextualStyles(fieldMode: boolean): ContextualClassNames {
  return useMemo(() => {
    if (fieldMode) {
      return {
        surface:   'bg-slate-900 border-slate-800',
        text:      'text-white',
        textMuted: 'text-slate-400',
        border:    'border-slate-800',
        input:     'bg-slate-900 text-white border-slate-800 focus:border-yellow-400',
        label:     'text-slate-500',
        divider:   'border-slate-800',
        active:    'text-yellow-400 border-yellow-400',
        inactive:  'text-slate-400 hover:text-slate-200',
        accent:    'text-yellow-400',
        warningBg: 'bg-slate-900 border-slate-800',
        headerBg:  'bg-black border-slate-800',

        danger:       'text-red-400',
        dangerHover:  'hover:bg-red-900/20',
        subtleBg:     'bg-slate-800',
        subtleText:   'text-slate-200',
        kbd:          'text-slate-500 bg-slate-800',
        iconButton:   'text-slate-500 hover:text-slate-300 hover:bg-slate-700 focus:ring-yellow-400 focus:ring-offset-slate-900',
        accentBadge:  'bg-yellow-400/20 text-yellow-400',
        searchInput:  'bg-slate-800 border-slate-600 text-white focus:border-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-900',
        thumbnailBg:  'bg-black',
        headingSize:  'text-xl',
        pageBg:       'bg-black',
        svgStroke:    '#94a3b8',
        svgFill:      '#cbd5e1',
        canvasBg:     'bg-slate-950',
        gridBg:       'bg-slate-800',
        gridLine:     '#475569',
        buttonSurface: 'bg-slate-800 text-white hover:bg-slate-700',
        placeholderBg: 'bg-slate-700',
        placeholderIcon: 'text-slate-500',
        separator:     'bg-slate-700',
        focusRing:     'ring-yellow-400 ring-offset-slate-900',
        svgAccent:     '#facc15',
      };
    }

    return {
      surface:   'bg-white border-slate-200',
      text:      'text-slate-800',
      textMuted: 'text-slate-500',
      border:    'border-slate-300',
      input:     'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500',
      label:     'text-slate-400',
      divider:   'border-slate-100',
      active:    'text-blue-600 border-blue-600 bg-blue-50/20',
      inactive:  'text-slate-400 hover:text-slate-600',
      accent:    'text-blue-600',
      warningBg: 'bg-orange-50 border-orange-200',
      headerBg:  'bg-slate-50 border-slate-200',

      danger:       'text-red-600',
      dangerHover:  'hover:bg-red-50',
      subtleBg:     'bg-slate-100',
      subtleText:   'text-slate-700',
      kbd:          'text-slate-400 bg-slate-100',
      iconButton:   'text-slate-400 hover:text-slate-600 hover:bg-slate-200 focus:ring-blue-600 focus:ring-offset-white',
      accentBadge:  'bg-iiif-blue/10 text-iiif-blue',
      searchInput:  'bg-slate-100 border-transparent focus:bg-white focus:border-iiif-blue focus:ring-blue-600 focus:ring-offset-white',
      thumbnailBg:  'bg-slate-100',
      headingSize:  'text-lg',
      pageBg:       'bg-slate-50',
      svgStroke:    '#64748b',
      svgFill:      '#475569',
      canvasBg:     'bg-slate-100',
      gridBg:       'bg-slate-200',
      gridLine:     '#cbd5e1',
      buttonSurface: 'bg-white text-slate-700 hover:bg-slate-50',
      placeholderBg: 'bg-slate-100',
      placeholderIcon: 'text-slate-400',
      separator:     'bg-slate-200',
      focusRing:     'ring-iiif-blue ring-offset-white',
      svgAccent:     '#3b82f6',
    };
  }, [fieldMode]);
}
