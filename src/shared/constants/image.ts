/**
 * Image Processing Constants
 * 
 * Derivative presets, quality settings, and image pipeline configuration.
 */

/**
 * Derivative preset configuration for image size generation.
 */
export interface DerivativePreset {
  /** Unique preset identifier */
  name: string;
  /** Human-readable label */
  label: string;
  /** Description of use case */
  description: string;
  /** Thumbnail width (smallest size) */
  thumbnailWidth: number;
  /** Standard derivative widths to generate */
  sizes: number[];
  /** Full-width size for detail views */
  fullWidth: number;
  /** Tile size for deep zoom (Level 0) */
  tileSize: number;
  /** Scale factors for tile pyramid */
  scaleFactors: number[];
}

/**
 * Named derivative presets for different use cases
 */
export const DERIVATIVE_PRESETS: Record<string, DerivativePreset> = {
  /**
   * WAX-compatible preset - matches minicomp/wax defaults
   */
  'wax-compatible': {
    name: 'wax-compatible',
    label: 'WAX Compatible',
    description: 'Matches minicomp/wax defaults for static Jekyll sites',
    thumbnailWidth: 250,
    sizes: [250, 1140],
    fullWidth: 1140,
    tileSize: 256,
    scaleFactors: [1, 2, 4, 8]
  },

  /**
   * Level 0 static preset - pre-generated sizes for serverless deployment
   */
  'level0-static': {
    name: 'level0-static',
    label: 'Level 0 Static',
    description: 'Pre-generated sizes for static/serverless hosting (default)',
    thumbnailWidth: 150,
    sizes: [150, 600, 1200],
    fullWidth: 1200,
    tileSize: 512,
    scaleFactors: [1, 2, 4, 8]
  },

  /**
   * Level 2 dynamic preset - relies on image server for on-demand sizing
   */
  'level2-dynamic': {
    name: 'level2-dynamic',
    label: 'Level 2 Dynamic',
    description: 'Minimal derivatives for Level 2 image server deployment',
    thumbnailWidth: 150,
    sizes: [150],
    fullWidth: 0,
    tileSize: 512,
    scaleFactors: [1, 2, 4, 8, 16]
  },

  /**
   * Mobile-optimized preset
   */
  'mobile-optimized': {
    name: 'mobile-optimized',
    label: 'Mobile Optimized',
    description: 'Smaller derivatives optimized for mobile viewing',
    thumbnailWidth: 100,
    sizes: [100, 400, 800],
    fullWidth: 800,
    tileSize: 256,
    scaleFactors: [1, 2, 4]
  },

  /**
   * Archive quality preset
   */
  'archive-quality': {
    name: 'archive-quality',
    label: 'Archive Quality',
    description: 'Larger derivatives for archival and print use',
    thumbnailWidth: 250,
    sizes: [250, 800, 1600, 3200],
    fullWidth: 3200,
    tileSize: 512,
    scaleFactors: [1, 2, 4, 8, 16]
  }
} as const;

/**
 * Default derivative preset name
 */
export const DEFAULT_DERIVATIVE_PRESET = 'level0-static';

/**
 * Get a derivative preset by name, with fallback to default
 */
export function getDerivativePreset(name?: string): DerivativePreset {
  if (name && DERIVATIVE_PRESETS[name]) {
    return DERIVATIVE_PRESETS[name];
  }
  return DERIVATIVE_PRESETS[DEFAULT_DERIVATIVE_PRESET];
}

/**
 * Image processing quality settings
 */
export const IMAGE_QUALITY = {
  /** JPEG quality for thumbnails and previews */
  jpeg: 0.85,
  /** WebP quality (slightly higher since WebP compresses better) */
  webp: 0.85,
  /** Lower quality for quick previews during ingest */
  preview: 0.8,
} as const;

/**
 * MIME type mappings for file extensions
 */
export const MIME_TYPE_MAP: Record<string, { type: string; format: string; motivation: string }> = {
  // Images
  'jpg': { type: 'Image', format: 'image/jpeg', motivation: 'painting' },
  'jpeg': { type: 'Image', format: 'image/jpeg', motivation: 'painting' },
  'png': { type: 'Image', format: 'image/png', motivation: 'painting' },
  'webp': { type: 'Image', format: 'image/webp', motivation: 'painting' },
  'gif': { type: 'Image', format: 'image/gif', motivation: 'painting' },
  'avif': { type: 'Image', format: 'image/avif', motivation: 'painting' },
  'bmp': { type: 'Image', format: 'image/bmp', motivation: 'painting' },
  'tiff': { type: 'Image', format: 'image/tiff', motivation: 'painting' },
  'tif': { type: 'Image', format: 'image/tiff', motivation: 'painting' },
  'svg': { type: 'Image', format: 'image/svg+xml', motivation: 'painting' },
  // Audio
  'mp3': { type: 'Sound', format: 'audio/mpeg', motivation: 'painting' },
  'wav': { type: 'Sound', format: 'audio/wav', motivation: 'painting' },
  'ogg': { type: 'Sound', format: 'audio/ogg', motivation: 'painting' },
  'm4a': { type: 'Sound', format: 'audio/mp4', motivation: 'painting' },
  'aac': { type: 'Sound', format: 'audio/aac', motivation: 'painting' },
  'flac': { type: 'Sound', format: 'audio/flac', motivation: 'painting' },
  // Video
  'mp4': { type: 'Video', format: 'video/mp4', motivation: 'painting' },
  'webm': { type: 'Video', format: 'video/webm', motivation: 'painting' },
  'mov': { type: 'Video', format: 'video/quicktime', motivation: 'painting' },
  // Documents
  'pdf': { type: 'Text', format: 'application/pdf', motivation: 'painting' },
  'txt': { type: 'Text', format: 'text/plain', motivation: 'supplementing' },
  'json': { type: 'Dataset', format: 'application/json', motivation: 'supplementing' },
  'csv': { type: 'Dataset', format: 'text/csv', motivation: 'supplementing' },
  // 3D Models
  'glb': { type: 'Model', format: 'model/gltf-binary', motivation: 'painting' },
  'gltf': { type: 'Model', format: 'model/gltf+json', motivation: 'painting' },
} as const;

/**
 * Image file extensions (raster + vector)
 */
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'tiff', 'tif', 'svg']);

/**
 * Raster image extensions (can use createImageBitmap)
 */
const RASTER_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'tiff', 'tif']);

/**
 * Audio file extensions
 */
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);

/**
 * Video file extensions
 */
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);

/**
 * Check if a file is an image by extension OR file.type.
 * Fixes the bug where file.type can be empty (Linux, webkitdirectory, drag-drop).
 */
export function isImageFile(file: { name: string; type: string }): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.has(ext) || file.type.startsWith('image/');
}

/**
 * Check if a file is a raster image (supports createImageBitmap).
 * SVGs are excluded — they need separate dimension parsing.
 */
export function isRasterImage(file: { name: string; type: string }): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return RASTER_IMAGE_EXTENSIONS.has(ext) || (file.type.startsWith('image/') && file.type !== 'image/svg+xml');
}

/**
 * Check if a file is an SVG.
 */
export function isSvgFile(file: { name: string; type: string }): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ext === 'svg' || file.type === 'image/svg+xml';
}

/**
 * Check if a file is audio by extension OR file.type.
 */
export function isAudioFile(file: { name: string; type: string }): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXTENSIONS.has(ext) || file.type.startsWith('audio/');
}

/**
 * Check if a file is video by extension OR file.type.
 */
export function isVideoFile(file: { name: string; type: string }): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return VIDEO_EXTENSIONS.has(ext) || file.type.startsWith('video/');
}

/**
 * Resolve the correct MIME format string for a file.
 * Falls back to extension-based lookup when file.type is empty.
 */
export function resolveFileFormat(file: { name: string; type: string }): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPE_MAP[ext]?.format || 'application/octet-stream';
}

/**
 * Legacy default derivative sizes (for backwards compatibility)
 * @deprecated Use getDerivativePreset() instead
 */
export const DEFAULT_DERIVATIVE_SIZES = [150, 600, 1200];

/**
 * Legacy background generation sizes (for backwards compatibility)
 * @deprecated Use getDerivativePreset().sizes instead
 */
export const DEFAULT_BACKGROUND_SIZES = [600, 1200];
