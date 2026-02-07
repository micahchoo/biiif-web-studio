/**
 * PlaceholderCanvasEditor Atom
 *
 * Editor for the IIIF `placeholderCanvas` property on AV canvases.
 * Shows poster image preview with upload/remove functionality.
 *
 * @module features/metadata-edit/ui/atoms/PlaceholderCanvasEditor
 */

import React, { useRef } from 'react';
import { Button, Icon } from '@/src/shared/ui/atoms';

export interface PlaceholderCanvasEditorProps {
  /** Current placeholder canvas poster URL */
  posterUrl?: string;
  /** Canvas dimensions for display */
  canvasWidth?: number;
  canvasHeight?: number;
  /** Called when poster image is uploaded */
  onUpload: (file: File) => void;
  /** Called when poster is removed */
  onRemove: () => void;
  /** Field mode styling */
  fieldMode?: boolean;
  /** Whether editing is disabled */
  disabled?: boolean;
}

export const PlaceholderCanvasEditor: React.FC<PlaceholderCanvasEditorProps> = ({
  posterUrl,
  canvasWidth,
  canvasHeight,
  onUpload,
  onRemove,
  fieldMode = false,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon
          name="image"
          className={`text-sm ${fieldMode ? 'text-slate-400' : 'text-slate-500'}`}
        />
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          fieldMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Poster Image
        </span>
      </div>

      <div className={`flex items-start gap-3 p-3 rounded-lg border ${
        fieldMode
          ? 'border-slate-700 bg-slate-800/50'
          : 'border-slate-200 bg-slate-50'
      }`}>
        {/* Preview */}
        <div className={`shrink-0 w-24 h-16 rounded overflow-hidden flex items-center justify-center ${
          fieldMode ? 'bg-slate-900' : 'bg-slate-200'
        }`}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="Poster preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon
              name="wallpaper"
              className={`text-2xl ${fieldMode ? 'text-slate-700' : 'text-slate-300'}`}
            />
          )}
        </div>

        {/* Info + Actions */}
        <div className="flex-1 min-w-0">
          {posterUrl ? (
            <div className={`text-xs truncate mb-2 ${fieldMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {canvasWidth && canvasHeight
                ? `${canvasWidth} × ${canvasHeight}`
                : 'Custom poster'}
            </div>
          ) : (
            <div className={`text-xs mb-2 ${fieldMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No poster image set
            </div>
          )}

          {!disabled && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="upload" className="text-sm mr-1" />
                {posterUrl ? 'Replace' : 'Upload'}
              </Button>
              {posterUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                >
                  <Icon name="delete" className="text-sm mr-1 text-red-400" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload poster image"
        />
      </div>
    </div>
  );
};

export default PlaceholderCanvasEditor;
