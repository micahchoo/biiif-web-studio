/**
 * File Lifecycle Manager - Stub Implementation
 *
 * NOTE: Original fileLifecycle.ts was removed as unused code in commit 9857b003.
 * This stub prevents import errors while file lifecycle tracking is disabled.
 *
 * If file lifecycle tracking is needed in the future, recover the original
 * implementation from git history or implement a new solution.
 */

export interface FileLifecycleManager {
  register(entityId: string, file: File, onRevoke?: () => void): void;
  unregister(entityId: string): void;
  revokeAll(): void;
}

/**
 * Mock file lifecycle manager that does nothing
 */
export function getFileLifecycleManager(): FileLifecycleManager {
  return {
    register(entityId: string, file: File, onRevoke?: () => void): void {
      // No-op - file lifecycle tracking disabled
    },

    unregister(entityId: string): void {
      // No-op
    },

    revokeAll(): void {
      // No-op
    }
  };
}
