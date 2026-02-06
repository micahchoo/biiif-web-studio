/**
 * Shared Services
 *
 * FSD Location: src/shared/services/
 *
 * Domain-agnostic services used across the application.
 * These should contain zero domain-specific logic.
 */

// ============================================================================
// Logging Service
// ============================================================================
export {
  logger,
  appLog,
  vaultLog,
  storageLog,
  networkLog,
  uiLog,
  workerLog,
} from './logger';
export type { LogLevel, LogGroup, LogEntry } from './logger';

// ============================================================================
// Storage Service
// ============================================================================
export { storage } from './storage';
export type { TileManifest, TileStorage } from './storage';

// ============================================================================
// Authentication Service
// ============================================================================
export { authService } from './authService';
export type { AuthService } from './authService';

// ============================================================================
// Content State API
// ============================================================================
export { parseContentState, createContentState, isContentStateUri } from './contentState';

// ============================================================================
// Remote Loader (IIIF Resource Fetching)
// ============================================================================
export { remoteLoader } from './remoteLoader';

// ============================================================================
// Search Service
// ============================================================================
export { searchService } from './searchService';

// ============================================================================
// Field Registry
// ============================================================================
export { fieldRegistry } from './fieldRegistry';

// ============================================================================
// Provenance Service
// ============================================================================
export { provenanceService } from './provenanceService';

// ============================================================================
// Metadata Services
// ============================================================================
export { metadataHarvester } from './metadataHarvester';
export { metadataTemplateService } from './metadataTemplateService';

// ============================================================================
// Guidance Service
// ============================================================================
export { guidanceService } from './guidanceService';
