import React, { useRef, useState } from 'react';
import { IIIFCanvas } from '../types';
import { Icon } from './Icon';

interface WorkspaceProps {
  canvas: IIIFCanvas | null;
  onAddAnnotation: (target: { x: number, y: number, w: number, h: number }) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  canvas, 
  onAddAnnotation, 
  selectedAnnotationId,
  onSelectAnnotation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  if (!canvas) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center text-slate-400 flex-col gap-4">
        <Icon name="collections" className="text-6xl opacity-20"/>
        <p>Select a canvas to view or annotate</p>
      </div>
    );
  }

  // Basic image url extraction
  const imageUrl = canvas._blobUrl || (canvas.items[0]?.items[0]?.body?.id);

  // Parse existing annotations
  const annotations = canvas.annotations?.[0]?.items || [];

  const getRelativeCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only Left click
    setIsDrawing(true);
    const pos = getRelativeCoords(e);
    setStartPos(pos);
    setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    onSelectAnnotation(null); // Deselect on new draw start
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getRelativeCoords(e);
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    setIsDrawing(false);
    if (currentRect.w > 5 && currentRect.h > 5) {
      onAddAnnotation(currentRect);
    }
    setCurrentRect(null);
  };

  // Helper to get color based on motivation
  const getAnnotationColor = (motivation: string, isSelected: boolean) => {
    if (isSelected) return 'border-iiif-blue bg-iiif-blue/10 opacity-100 z-20';
    
    switch (motivation) {
      case 'tagging':
        return 'border-green-500 bg-green-500/10 opacity-60';
      case 'supplementing':
        return 'border-purple-500 bg-purple-500/10 opacity-60';
      case 'commenting':
      default:
        return 'border-yellow-500 bg-yellow-500/10 opacity-60';
    }
  };

  return (
    <div className="flex-1 bg-slate-100 overflow-auto relative flex items-center justify-center p-8">
      <div 
        className="relative bg-white shadow-lg select-none cursor-crosshair"
        style={{ 
          width: 'fit-content', 
          height: 'fit-content',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <img 
          src={imageUrl} 
          alt={canvas.label?.none?.[0] || 'Canvas'}
          className="max-w-full max-h-[80vh] block"
          draggable={false}
        />
        
        {/* Overlay for drawing/displaying annotations */}
        <div 
          ref={containerRef}
          className="absolute inset-0 z-10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        >
          {/* Existing Annotations */}
          {annotations.map(anno => {
            const selector = typeof anno.target === 'object' ? anno.target.selector : null;
            
            // If it targets the whole canvas (e.g. string target matching canvas ID), maybe show an indicator in corner?
            if (typeof anno.target === 'string' || !selector) {
                // Skip rendering overlay for whole-canvas annotations for now, 
                // or render a border around the whole thing?
                return null; 
            }

            if (selector?.type !== 'FragmentSelector') return null;
            
            const [x, y, w, h] = selector.value.replace('xywh=', '').split(',').map(Number);
            const isSelected = selectedAnnotationId === anno.id;
            const styleClass = getAnnotationColor(anno.motivation, isSelected);

            return (
              <div
                key={anno.id}
                className={`absolute border-2 transition-opacity hover:opacity-100 ${styleClass}`}
                style={{
                  left: `${(x / canvas.width) * 100}%`,
                  top: `${(y / canvas.height) * 100}%`,
                  width: `${(w / canvas.width) * 100}%`,
                  height: `${(h / canvas.height) * 100}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnnotation(anno.id);
                }}
              />
            );
          })}

          {/* Drawing Preview */}
          {currentRect && (
            <div
              className="absolute border-2 border-iiif-red bg-iiif-red/20 z-30 pointer-events-none"
              style={{
                left: `${(currentRect.x / canvas.width) * 100}%`,
                top: `${(currentRect.y / canvas.height) * 100}%`,
                width: `${(currentRect.w / canvas.width) * 100}%`,
                height: `${(currentRect.h / canvas.height) * 100}%`
              }}
            />
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-sm rounded-full px-4 py-2 text-xs text-slate-600 flex gap-4">
          <span>Dimensions: {canvas.width} x {canvas.height}</span>
          <span>Zoom: Fit</span>
          <div className="flex gap-2 border-l border-slate-300 pl-4">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Comment</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Tag</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Supp.</span>
          </div>
      </div>
    </div>
  );
};