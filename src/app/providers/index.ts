/**
 * App Providers - Consolidated Context Provider
 *
 * Centralizes all context providers used by the app.
 * This is the single point where global context is set up.
 *
 * Provider hierarchy:
 * 1. VaultProvider - Normalized state management for IIIF data
 * 2. ToastProvider - Toast notifications
 * 3. ErrorBoundary - Error handling
 * 4. UserIntentProvider - User intent tracking (editing, viewing, etc.)
 * 5. ResourceContextProvider - Current resource state (type, validation, etc.)
 *
 * Usage:
 *   import { AppProviders } from '@/src/app/providers';
 *
 *   export default function App() {
 *     return (
 *       <AppProviders>
 *         <MainApp />
 *       </AppProviders>
 *     );
 *   }
 */

import React, { ReactNode } from 'react';
import { VaultProvider } from '@/hooks/useIIIFEntity';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UserIntentProvider } from '@/hooks/useUserIntent';
import { ResourceContextProvider } from '@/hooks/useResourceContext';

export interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Consolidated provider wrapper
 *
 * Wraps the app with all required context providers in the correct order.
 * Order matters: outer providers are available to inner ones.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <VaultProvider>
    <ToastProvider>
      <ErrorBoundary>
        <UserIntentProvider>
          <ResourceContextProvider>
            {children}
          </ResourceContextProvider>
        </UserIntentProvider>
      </ErrorBoundary>
    </ToastProvider>
  </VaultProvider>
);

export default AppProviders;
