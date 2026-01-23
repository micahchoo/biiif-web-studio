
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IIIFCanvas, IIIFAnnotation, IIIFAnnotationPage } from '../../types';
import { Icon } from '../Icon';
import { useToast } from '../Toast';

declare const OpenSeadragon: any;

interface ViewerProps {
  item: IIIFCanvas | null;
  onUpdate: (item: Partial<IIIFCanvas>) => void;
}

interface PolygonPoint {
  x: number;
  y: number;
}

export const Viewer: React.FC<ViewerProps> = ({ item, onUpdate }) => {
  const { showToast } = useToast();
  const viewerRef = useRef<any>(null);
  const osdContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);

  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'other'>('other');
  const [tool, setTool] = useState<'pan' | 'rect' | 'polygon'>('pan');
  const [annotations, setAnnotations] = useState<IIIFAnnotation[]>([]);
  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);

  const paintingBody = item?.items?.[0]?.items?.[0]?.body as any;
  const mimeType = paintingBody?.format || '';
  const serviceId = paintingBody?.service?.[0]?.id;

  useEffect(() => {
      if (!item) return;
      if (mimeType.startsWith('video/')) setMediaType('video');
      else if (mimeType.startsWith('audio/')) setMediaType('audio');
      else if (mimeType.startsWith('image/')) setMediaType('image');
      else setMediaType('other');

      const existingAnnos: IIIFAnnotation[] = [];
      if (item.annotations) {
          item.annotations.forEach(page => {
              existingAnnos.push(...page.items);
          });
      }
      setAnnotations(existingAnnos);
  }, [item?.id, mimeType]);

  useEffect(() => {
      if (mediaType === 'image' && item && osdContainerRef.current) {
          if (viewerRef.current) viewerRef.current.destroy();

          const tileSource = serviceId 
            ? `${serviceId}/info.json`
            : { type: 'image', url: item._blobUrl }; // Fallback if no service

          const viewer = OpenSeadragon({
              element: osdContainerRef.current,
              prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
              tileSources: tileSource,
              gestureSettingsMouse: { clickToZoom: false },
              showNavigationControl: false
          });

          viewerRef.current = viewer;

          return () => {
              if (viewerRef.current) viewerRef.current.destroy();
              viewerRef.current = null;
          };
      }
  }, [item?.id, mediaType, serviceId]);

  // ... Drawing handlers (handleMouseDown, etc.) kept same as before but omitted for brevity if no logic change ...
  // Re-implementing drawing handlers for completeness
  const getViewportCoords = (e: React.MouseEvent) => {
      if (!viewerRef.current) return { x: 0, y: 0 };
      const point = new OpenSeadragon.Point(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      return viewerRef.current.viewport.pointFromPixel(point);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (tool === 'pan' || mediaType !== 'image') return;
      const coords = getViewportCoords(e);
      setDrawing(true);
      if (tool === 'rect') {
          setCurrentShape({ x: coords.x, y: coords.y, w: 0, h: 0 });
      }
      // Polygon: first click starts, handled in handleClick
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (tool === 'rect' && drawing && currentShape) {
          const coords = getViewportCoords(e);
          setCurrentShape((prev: any) => ({ ...prev, w: coords.x - prev.x, h: coords.y - prev.y }));
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if (tool === 'rect' && drawing) {
          finishRectAnnotation();
      }
  };

  const handleClick = (e: React.MouseEvent) => {
      if (tool !== 'polygon' || mediaType !== 'image') return;
      const coords = getViewportCoords(e);
      setPolygonPoints(prev => [...prev, { x: coords.x, y: coords.y }]);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      if (tool !== 'polygon' || polygonPoints.length < 3) return;
      finishPolygonAnnotation();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape') {
          setPolygonPoints([]);
          setCurrentShape(null);
          setDrawing(false);
      } else if (e.key === 'Enter' && tool === 'polygon' && polygonPoints.length >= 3) {
          finishPolygonAnnotation();
      }
  }, [tool, polygonPoints]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const finishRectAnnotation = () => {
      setDrawing(false);
      if (!currentShape || !item) return;
      const imgW = item.width || 1000;
      const content = prompt("Enter annotation text:");
      if (!content) { setCurrentShape(null); return; }

      const x = Math.min(currentShape.x, currentShape.x + currentShape.w) * imgW;
      const y = Math.min(currentShape.y, currentShape.y + currentShape.h) * imgW;
      const w = Math.abs(currentShape.w) * imgW;
      const h = Math.abs(currentShape.h) * imgW;
      const selector = { type: "FragmentSelector", value: `xywh=${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)}` };

      createAnnotation(selector, content);
      setCurrentShape(null);
  };

  const finishPolygonAnnotation = () => {
      if (!item || polygonPoints.length < 3) return;
      const content = prompt("Enter annotation text:");
      if (!content) { setPolygonPoints([]); return; }

      const imgW = item.width || 1000;
      const imgH = item.height || 1000;

      // Convert OSD viewport coords to image pixel coords
      const svgPoints = polygonPoints.map(p => `${Math.round(p.x * imgW)},${Math.round(p.y * imgH)}`).join(' ');
      const svgPath = `<svg xmlns="http://www.w3.org/2000/svg"><polygon points="${svgPoints}"/></svg>`;

      const selector = {
          type: "SvgSelector",
          value: svgPath
      };

      createAnnotation(selector, content);
      setPolygonPoints([]);
  };

  const createAnnotation = (selector: any, content: string) => {
      if (!item) return;

      const newAnno: IIIFAnnotation = {
          id: `${item.id}/annotation/${crypto.randomUUID()}`,
          type: "Annotation",
          motivation: "commenting",
          target: { type: "SpecificResource", source: item.id, selector },
          body: { type: "TextualBody", value: content, format: "text/plain" }
      };

      const newAnnos = [...annotations, newAnno];
      setAnnotations(newAnnos);
      onUpdate({ annotations: [{ id: `${item.id}/page/annotations`, type: "AnnotationPage", items: newAnnos }] });
      showToast("Annotation added", "success");
  };

  const deleteAnnotation = (annoId: string) => {
      const newAnnos = annotations.filter(a => a.id !== annoId);
      setAnnotations(newAnnos);
      setSelectedAnnoId(null);
      onUpdate({ annotations: [{ id: `${item!.id}/page/annotations`, type: "AnnotationPage", items: newAnnos }] });
      showToast("Annotation deleted", "info");
  };

  // Parse annotation selector for rendering
  const parseSelector = (anno: IIIFAnnotation): { type: 'rect' | 'polygon'; coords: any } | null => {
      const target = anno.target as any;
      if (!target?.selector) return null;

      const selector = target.selector;
      if (selector.type === 'FragmentSelector' && selector.value) {
          const match = selector.value.match(/xywh=(\d+),(\d+),(\d+),(\d+)/);
          if (match) {
              const imgW = item?.width || 1000;
              const imgH = item?.height || 1000;
              return {
                  type: 'rect',
                  coords: {
                      x: parseInt(match[1]) / imgW,
                      y: parseInt(match[2]) / imgH,
                      w: parseInt(match[3]) / imgW,
                      h: parseInt(match[4]) / imgH
                  }
              };
          }
      } else if (selector.type === 'SvgSelector' && selector.value) {
          const pointsMatch = selector.value.match(/points="([^"]+)"/);
          if (pointsMatch) {
              const imgW = item?.width || 1000;
              const imgH = item?.height || 1000;
              const points = pointsMatch[1].split(' ').map((p: string) => {
                  const [x, y] = p.split(',').map(Number);
                  return { x: x / imgW, y: y / imgH };
              });
              return { type: 'polygon', coords: { points } };
          }
      }
      return null;
  };

  if (!item) return <div className="flex-1 bg-black flex items-center justify-center text-slate-500">No Item Selected</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative">
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-800 z-20">
        <div className="flex items-center gap-4">
            <h2 className="font-bold text-sm truncate max-w-[200px]">{item.label?.['none']?.[0]}</h2>
            {mediaType === 'image' && (
                <div className="flex bg-slate-700 rounded overflow-hidden">
                    <button className="p-1.5 hover:bg-slate-600" onClick={() => viewerRef.current?.viewport.zoomBy(1.2)}><Icon name="zoom_in"/></button>
                    <button className="p-1.5 hover:bg-slate-600" onClick={() => viewerRef.current?.viewport.zoomBy(0.8)}><Icon name="zoom_out"/></button>
                    <button className="p-1.5 hover:bg-slate-600" onClick={() => viewerRef.current?.viewport.goHome()}><Icon name="home"/></button>
                </div>
            )}
        </div>
        {mediaType === 'image' && (
            <div className="flex items-center gap-2 bg-slate-700 p-1 rounded">
                <button onClick={() => { setTool('pan'); setPolygonPoints([]); }} className={`p-1 rounded ${tool === 'pan' ? 'bg-iiif-blue' : ''}`} title="Pan"><Icon name="pan_tool" /></button>
                <button onClick={() => { setTool('rect'); setPolygonPoints([]); }} className={`p-1 rounded ${tool === 'rect' ? 'bg-iiif-blue' : ''}`} title="Rectangle"><Icon name="crop_square" /></button>
                <button onClick={() => { setTool('polygon'); setCurrentShape(null); }} className={`p-1 rounded ${tool === 'polygon' ? 'bg-green-500' : ''}`} title="Polygon"><Icon name="polyline" /></button>
            </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {mediaType === 'image' && (
            <>
                <div
                    ref={osdContainerRef}
                    className={`w-full h-full absolute inset-0 ${tool !== 'pan' ? 'cursor-crosshair' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                />
                {/* SVG Overlay for annotations */}
                <svg
                    ref={overlayRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                >
                    {/* Existing annotations */}
                    {annotations.map(anno => {
                        const parsed = parseSelector(anno);
                        if (!parsed) return null;
                        const isSelected = selectedAnnoId === anno.id;
                        const bodyText = (anno.body as any)?.value || '';

                        if (parsed.type === 'rect') {
                            const { x, y, w, h } = parsed.coords;
                            return (
                                <g key={anno.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedAnnoId(anno.id)}>
                                    <rect
                                        x={`${x * 100}%`}
                                        y={`${y * 100}%`}
                                        width={`${w * 100}%`}
                                        height={`${h * 100}%`}
                                        fill={isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'}
                                        stroke={isSelected ? '#2563eb' : '#3b82f6'}
                                        strokeWidth={isSelected ? 3 : 2}
                                    />
                                    {isSelected && (
                                        <foreignObject x={`${x * 100}%`} y={`${(y + h) * 100}%`} width="200" height="80">
                                            <div className="bg-white rounded shadow-lg p-2 text-xs text-slate-700 border">
                                                <div className="font-bold mb-1 truncate">{bodyText}</div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteAnnotation(anno.id); }}
                                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        } else if (parsed.type === 'polygon') {
                            const points = parsed.coords.points.map((p: PolygonPoint) => `${p.x * 100}%,${p.y * 100}%`).join(' ');
                            return (
                                <g key={anno.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedAnnoId(anno.id)}>
                                    <polygon
                                        points={points}
                                        fill={isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)'}
                                        stroke={isSelected ? '#059669' : '#10b981'}
                                        strokeWidth={isSelected ? 3 : 2}
                                    />
                                </g>
                            );
                        }
                        return null;
                    })}

                    {/* Current drawing shape */}
                    {tool === 'rect' && currentShape && (
                        <rect
                            x={`${Math.min(currentShape.x, currentShape.x + currentShape.w) * 100}%`}
                            y={`${Math.min(currentShape.y, currentShape.y + currentShape.h) * 100}%`}
                            width={`${Math.abs(currentShape.w) * 100}%`}
                            height={`${Math.abs(currentShape.h) * 100}%`}
                            fill="rgba(59, 130, 246, 0.2)"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}

                    {/* Polygon in progress */}
                    {tool === 'polygon' && polygonPoints.length > 0 && (
                        <>
                            <polyline
                                points={polygonPoints.map(p => `${p.x * 100}%,${p.y * 100}%`).join(' ')}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                            {polygonPoints.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={`${p.x * 100}%`}
                                    cy={`${p.y * 100}%`}
                                    r="5"
                                    fill="#10b981"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            ))}
                        </>
                    )}
                </svg>
                {/* Polygon instructions */}
                {tool === 'polygon' && (
                    <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded z-20">
                        {polygonPoints.length === 0
                            ? 'Click to add points. Double-click or Enter to finish.'
                            : `${polygonPoints.length} points. Double-click or Enter to finish. Esc to cancel.`}
                    </div>
                )}
            </>
        )}
        {mediaType === 'video' && item._blobUrl && (
            <video controls src={item._blobUrl} className="w-full max-h-[80vh]" />
        )}
        {mediaType === 'audio' && item._blobUrl && (
            <audio controls src={item._blobUrl} className="w-96" />
        )}
      </div>
      
      <div className="h-8 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500">
        <span>{mediaType.toUpperCase()} MODE</span>
        <span>{annotations.length} Annotations</span>
      </div>
    </div>
  );
};
