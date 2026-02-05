/**
 * Atoms: UI Primitives
 *
 * Re-exports indivisible UI elements from the existing ui/primitives/ directory.
 * These are zero-state, zero-logic components that form the foundation of molecules.
 *
 * ATOMIC DESIGN PRINCIPLES:
 * - Atoms are the smallest building blocks - they cannot be broken down further
 * - Atoms have ZERO business logic and ZERO state
 * - Atoms only receive props and render based on design tokens
 * - Atoms are never imported directly in application code - always composed into Molecules first
 *
 * COMPLIANCE CHECKLIST:
 * ✅ No useState, useEffect, or other React hooks
 * ✅ No context consumption (useContext, useAppSettings, etc.)
 * ✅ No domain knowledge (IIIF, vault, etc.)
 * ✅ Pure props-driven rendering
 * ✅ Styling from design tokens only
 */

// ============================================================================
// Button Atom - Interactive element for user actions
// ============================================================================
export { Button } from '@/ui/primitives/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from '@/ui/primitives/Button';

// ============================================================================
// Input Atom - Text entry primitive
// ============================================================================
export { Input } from '@/ui/primitives/Input';
export type { InputProps, InputSize } from '@/ui/primitives/Input';

// ============================================================================
// Icon Atom - Visual indicator using Material Icons
// ============================================================================
export { Icon } from './Icon';
export type { IconProps } from './Icon';

// ============================================================================
// Card Atom - Elevated surface container
// ============================================================================
export { Card } from '@/ui/primitives/Card';
export type { CardProps } from '@/ui/primitives/Card';
