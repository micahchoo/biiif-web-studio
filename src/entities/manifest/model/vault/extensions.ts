/**
 * Vault Extension Preservation (Molecule Layer)
 *
 * Handles preservation of unknown/vendor-specific properties
 * for round-tripping IIIF resources. Ensures properties like
 * Mirador configs, Tify settings survive import/export.
 */

import { getAllowedProperties } from '@/utils/iiifSchema';
import type { EntityType } from '@/src/shared/types';
import { cloneAsRecord } from './cloning';

/**
 * Known IIIF Presentation API 3.0 properties by entity type
 * Properties not in this list are preserved as extensions
 */
const KNOWN_IIIF_PROPERTIES: Record<EntityType | 'common', Set<string>> = {
  common: new Set([
    // Core JSON-LD / Internal
    '@context', 'id', 'type',
    // Internal properties (prefixed with _)
    '_fileRef', '_blobUrl', '_parentId', '_state', '_filename'
  ]),
  Collection: new Set(getAllowedProperties('Collection')),
  Manifest: new Set(getAllowedProperties('Manifest')),
  Canvas: new Set(getAllowedProperties('Canvas')),
  Range: new Set(getAllowedProperties('Range')),
  AnnotationPage: new Set(getAllowedProperties('AnnotationPage')),
  Annotation: new Set([...getAllowedProperties('Annotation'), 'bodyValue'])
};

/**
 * Extract unknown properties from an entity for extension preservation
 */
export function extractExtensions(
  item: Record<string, unknown>,
  type: EntityType
): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};
  const knownCommon = KNOWN_IIIF_PROPERTIES.common;
  const knownForType = KNOWN_IIIF_PROPERTIES[type];

  for (const [key, value] of Object.entries(item)) {
    // Skip known properties
    if (knownCommon.has(key) || knownForType.has(key)) continue;
    // Skip undefined/null values
    if (value === undefined || value === null) continue;
    // Preserve unknown property
    extensions[key] = value;
  }

  return extensions;
}

/**
 * Apply preserved extensions back to an entity during denormalization
 */
export function applyExtensions(
  item: Record<string, unknown>,
  extensions: Record<string, unknown> | undefined
): void {
  if (!extensions) return;
  for (const [key, value] of Object.entries(extensions)) {
    item[key] = value;
  }
}

/**
 * Helper to extract extensions from a typed entity
 */
export function extractExtensionsFromEntity<T extends object>(
  entity: T,
  type: EntityType
): Record<string, unknown> {
  return extractExtensions(cloneAsRecord(entity), type);
}
