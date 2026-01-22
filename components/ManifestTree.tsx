import React, { useState } from 'react';
import { IIIFManifest, IIIFCanvas, IIIFCollection, IIIFItem } from '../types';
import { Icon } from './Icon';

interface ManifestTreeProps {
  rootResource: IIIFItem | null;
  activeManifestId: string | null;
  onSelectManifest: (manifest: IIIFManifest) => void;
  selectedCanvasId: string | null;
  onSelectCanvas: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeManifest: IIIFManifest | null;
}

// Recursive Tree Item Component
const TreeItem: React.FC<{
  item: IIIFItem;
  level: number;
  activeManifestId: string | null;
  onSelectManifest: (m: IIIFManifest) => void;
}> = ({ item, level, activeManifestId, onSelectManifest }) => {
  const [expanded, setExpanded] = useState(true); // Default expand

  const isCollection = item.type === 'Collection';
  const isActive = item.id === activeManifestId;
  const paddingLeft = `${level * 12 + 12}px`;

  if (isCollection) {
    const collection = item as IIIFCollection;
    return (
      <li>
        <div 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 py-1.5 pr-2 hover:bg-slate-100 cursor-pointer text-slate-700 select-none transition-colors rounded-r-md mr-1"
          style={{ paddingLeft }}
        >
          <Icon name={expanded ? "folder_open" : "folder"} className={`text-base ${expanded ? 'text-iiif-blue' : 'text-slate-400'}`}/>
          <span className="truncate text-xs font-medium flex-1">{item.label?.en?.[0] || 'Collection'}</span>
        </div>
        {expanded && collection.items.length > 0 && (
          <ul className="space-y-0.5">
            {collection.items.map((child) => (
              <TreeItem 
                key={child.id} 
                item={child as IIIFItem} 
                level={level + 1} 
                activeManifestId={activeManifestId}
                onSelectManifest={onSelectManifest}
              />
            ))}
          </ul>
        )}
      </li>
    );
  } else {
    // Manifest
    return (
      <li>
        <button
          onClick={() => onSelectManifest(item as IIIFManifest)}
          className={`w-full text-left py-1.5 pr-2 flex items-center gap-2 transition-colors rounded-r-md mr-1 ${
             isActive ? 'bg-blue-50 text-iiif-blue font-medium' : 'hover:bg-slate-100 text-slate-600'
          }`}
          style={{ paddingLeft }}
        >
          <Icon name="article" className={`text-base ${isActive ? 'text-iiif-blue' : 'text-slate-400 opacity-70'}`}/>
          <span className="truncate text-xs flex-1">{item.label?.en?.[0] || 'Manifest'}</span>
        </button>
      </li>
    );
  }
};

export const ManifestTree: React.FC<ManifestTreeProps> = ({ 
  rootResource,
  activeManifestId,
  onSelectManifest,
  selectedCanvasId, 
  onSelectCanvas,
  onUpload,
  activeManifest
}) => {

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Icon name="folder_special" className="text-iiif-blue text-xl"/>
          Project
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Project Structure Tree */}
        {rootResource && (
          <div className="py-2 border-b border-slate-100 bg-slate-50/30">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 block">Hierarchy</label>
             <ul className="space-y-0.5">
                <TreeItem 
                  item={rootResource} 
                  level={0} 
                  activeManifestId={activeManifestId}
                  onSelectManifest={onSelectManifest}
                />
             </ul>
          </div>
        )}

        {/* Active Manifest Canvases */}
        {activeManifest ? (
          <div className="p-2 flex-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 block flex justify-between items-center">
                 <span>{activeManifest.label?.en?.[0] || 'Manifest'}</span>
                 <span className="bg-slate-100 text-slate-500 px-1.5 rounded">{activeManifest.items.length}</span>
             </label>
             <ul className="space-y-1">
              {activeManifest.items.map((canvas, idx) => (
                <li key={canvas.id}>
                  <button
                    onClick={() => onSelectCanvas(canvas.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                      selectedCanvasId === canvas.id 
                        ? 'bg-blue-50 text-iiif-blue font-medium ring-1 ring-blue-100' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon name="image" className={`text-base ${selectedCanvasId === canvas.id ? 'text-iiif-blue' : 'text-slate-400'}`} />
                    <span className="truncate">{canvas.label?.none?.[0] || canvas.label?.en?.[0] || `Canvas ${idx + 1}`}</span>
                    {canvas.annotations && canvas.annotations.length > 0 && canvas.annotations[0].items.length > 0 && (
                       <span className="ml-auto flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] h-4 w-4 rounded-full">
                         {canvas.annotations[0].items.length}
                       </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
           <div className="p-4 text-center text-slate-400 text-sm italic">
              {rootResource ? "Select a manifest from the hierarchy to view canvases." : "No project loaded."}
           </div>
        )}
        
        {!rootResource && (
            <div className="p-4 text-center">
                <label className="cursor-pointer bg-iiif-blue hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2">
                <Icon name="upload_file" className="text-lg"/>
                Import Biiif Folder
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={onUpload}
                  {...({ webkitdirectory: "", directory: "", multiple: true } as any)} 
                />
              </label>
               <p className="mt-4 text-xs text-slate-400 text-left leading-relaxed px-2">
                 <strong>Structure:</strong><br/>
                 • Folders with images → Manifests<br/>
                 • Folders with folders → Collections<br/>
                 • <code>info.yml</code> for metadata
              </p>
            </div>
        )}
      </div>

      {rootResource && (
        <div className="p-3 border-t border-slate-200">
             <label className="flex items-center justify-center gap-2 w-full cursor-pointer border border-dashed border-slate-300 hover:border-iiif-blue text-slate-500 hover:text-iiif-blue px-3 py-2 rounded-md text-xs font-medium transition-colors">
              <Icon name="add_new" className="text-base"/>
              New Project
              <input 
                type="file" 
                className="hidden" 
                onChange={onUpload}
                {...({ webkitdirectory: "", directory: "", multiple: true } as any)} 
              />
            </label>
        </div>
      )}
    </div>
  );
};