/**
 * AnnotationForm Molecule
 *
 * Form for entering annotation text and motivation.
 */

import React from 'react';

export interface AnnotationFormProps {
  text: string;
  motivation: 'commenting' | 'tagging' | 'describing';
  pointCount: number;
  canSave: boolean;
  onTextChange: (text: string) => void;
  onMotivationChange: (mot: 'commenting' | 'tagging' | 'describing') => void;
  onSave: () => void;
  onUndo: () => void;
  onClear: () => void;
}

const MOTIVATIONS: { value: 'commenting' | 'tagging' | 'describing'; label: string }[] = [
  { value: 'commenting', label: 'Comment' },
  { value: 'tagging', label: 'Tag' },
  { value: 'describing', label: 'Describe' },
];

export const AnnotationForm: React.FC<AnnotationFormProps> = ({
  text,
  motivation,
  pointCount,
  canSave,
  onTextChange,
  onMotivationChange,
  onSave,
  onUndo,
  onClear,
}) => {
  return (
    <div className="w-80 bg-slate-900 border-l border-white/10 p-4 flex flex-col">
      <h3 className="text-white font-bold text-sm mb-4">Annotation Details</h3>

      {/* Motivation */}
      <div className="mb-4">
        <label className="text-[10px] font-black text-white/40 uppercase block mb-2">
          Type
        </label>
        <div className="flex gap-2">
          {MOTIVATIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => onMotivationChange(m.value)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${
                motivation === m.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text */}
      <div className="mb-4 flex-1">
        <label className="text-[10px] font-black text-white/40 uppercase block mb-2">
          Text
        </label>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter annotation text..."
          className="w-full h-32 bg-black/40 text-white text-sm border border-white/10 rounded p-3 outline-none resize-none"
        />
      </div>

      {/* Stats */}
      <div className="text-[10px] text-white/40 mb-4">
        {pointCount} points selected
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`w-full py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
            canSave
              ? 'bg-green-600 text-white hover:bg-green-500 shadow-xl'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          Save Annotation
        </button>
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={pointCount === 0}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold uppercase rounded"
          >
            Undo Point
          </button>
          <button
            onClick={onClear}
            disabled={pointCount === 0}
            className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 text-[10px] font-bold uppercase rounded"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
