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
export { contentStateService } from './contentState';
export type { ContentState } from './contentState';

// ============================================================================
// Remote Loader (IIIF Resource Fetching)
// ============================================================================
export {
  fetchRemoteManifest,
  fetchRemoteResource,
  requiresAuth
} from './remoteLoader';
export type { RemoteResource, FetchResult, FetchOptions } from './remoteLoader';

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
export { extractMetadata } from './metadataHarvester';
export {
  exportMetadataTemplate,
  previewMetadataTemplate,
  getVocabularyOptions,
  downloadMetadataTemplate
} from './metadataTemplateService';
export type { MetadataTemplateOptions, MetadataTemplateExport } from './metadataTemplateService';

// ============================================================================
// Guidance Service
// ============================================================================
export { guidance } from './guidanceService';
export type { GuidanceTopic } from './guidanceService';
