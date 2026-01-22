import React, { useState, useEffect } from 'react';
import { createManifest, processInput, exportManifest } from './services/iiifBuilder';
import { IIIFManifest, IIIFCanvas, IIIFAnnotation, IIIFItem, IIIFCollection } from './types';
import { ManifestTree } from './components/ManifestTree';
import { Workspace } from './components/Workspace';
import { MetadataEditor } from './components/MetadataEditor';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  // Root resource can be a Manifest or a Collection
  const [rootResource, setRootResource] = useState<IIIFItem | null>(createManifest("New Project", "https://example.org/iiif/new"));
  const [activeManifestId, setActiveManifestId] = useState<string | null>(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Helper to find manifest in the tree (recursive)
  const findManifest = (item: IIIFItem | null, id: string): IIIFManifest | null => {
    if (!item) return null;
    if (item.id === id && item.type === 'Manifest') return item as IIIFManifest;
    if (item.type === 'Collection') {
        const col = item as IIIFCollection;
        for (const child of col.items) {
            const found = findManifest(child, id);
            if (found) return found;
        }
    }
    return null;
  };

  const activeManifest = activeManifestId ? findManifest(rootResource, activeManifestId) : (rootResource?.type === 'Manifest' ? rootResource as IIIFManifest : null);
  
  // Set default active manifest if none selected
  useEffect(() => {
    if (!activeManifestId && rootResource) {
        if (rootResource.type === 'Manifest') {
            setActiveManifestId(rootResource.id);
        } else {
             // Try to find first manifest in collection
             const firstManifest = findFirstManifest(rootResource);
             if (firstManifest) setActiveManifestId(firstManifest.id);
        }
    }
  }, [rootResource, activeManifestId]);

  const findFirstManifest = (item: IIIFItem): IIIFManifest | null => {
      if (item.type === 'Manifest') return item as IIIFManifest;
      if (item.type === 'Collection') {
          for (const child of (item as IIIFCollection).items) {
              const found = findFirstManifest(child);
              if (found) return found;
          }
      }
      return null;
  };

  // Helper to get current canvas
  const selectedCanvas = activeManifest?.items.find(c => c.id === selectedCanvasId) || null;
  // Helper to get current annotation
  const selectedAnnotation = selectedCanvas?.annotations?.[0]?.items.find(a => a.id === selectedAnnotationId) || null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { root } = await processInput(e.target.files);
      if (root) {
          setRootResource(root);
          // Selection logic will trigger via useEffect
          setActiveManifestId(null); 
          setSelectedCanvasId(null);
      }
    }
  };

  // Updates need to traverse the tree to find the node to update
  const updateResourceInTree = (root: IIIFItem, updated: IIIFItem): IIIFItem => {
      if (root.id === updated.id) return updated;
      if (root.type === 'Collection') {
          const col = root as IIIFCollection;
          return {
              ...col,
              items: col.items.map(child => updateResourceInTree(child, updated))
          };
      }
      return root;
  };

  const handleUpdateManifest = (changes: Partial<IIIFManifest>) => {
    if (!activeManifest || !rootResource) return;
    const updated = { ...activeManifest, ...changes };
    setRootResource(prev => prev ? updateResourceInTree(prev, updated) : null);
  };

  const handleUpdateCanvas = (updatedCanvas: IIIFCanvas) => {
    if (!activeManifest || !rootResource) return;
    const updatedItems = activeManifest.items.map(item => item.id === updatedCanvas.id ? updatedCanvas : item);
    const updatedManifest = { ...activeManifest, items: updatedItems };
    setRootResource(prev => prev ? updateResourceInTree(prev, updatedManifest) : null);
  };

  const handleAddAnnotation = (rect: { x: number, y: number, w: number, h: number }) => {
    if (!selectedCanvas) return;

    const annotationId = `${selectedCanvas.id}/annotation/${Date.now()}`;
    const newAnnotation: IIIFAnnotation = {
      id: annotationId,
      type: "Annotation",
      motivation: "commenting",
      body: {
        type: "TextualBody",
        value: "",
        format: "text/plain",
        language: "en"
      },
      target: {
        source: selectedCanvas.id,
        selector: {
          type: "FragmentSelector",
          value: `xywh=${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.w)},${Math.round(rect.h)}`
        }
      }
    };

    const updatedCanvas = { ...selectedCanvas };
    if (!updatedCanvas.annotations) {
      updatedCanvas.annotations = [{
        id: `${selectedCanvas.id}/page/annotations`,
        type: 'AnnotationPage',
        items: []
      }];
    }
    
    if (updatedCanvas.annotations.length === 0) {
         updatedCanvas.annotations.push({
            id: `${selectedCanvas.id}/page/annotations`,
            type: 'AnnotationPage',
            items: []
         });
    }

    updatedCanvas.annotations[0].items = [...updatedCanvas.annotations[0].items, newAnnotation];
    handleUpdateCanvas(updatedCanvas);
    setSelectedAnnotationId(annotationId);
  };

  const handleUpdateAnnotation = (updatedAnnotation: IIIFAnnotation) => {
    if (!selectedCanvas) return;
    const updatedCanvas = { ...selectedCanvas };
    if (updatedCanvas.annotations && updatedCanvas.annotations.length > 0) {
      updatedCanvas.annotations[0].items = updatedCanvas.annotations[0].items.map(a => 
        a.id === updatedAnnotation.id ? updatedAnnotation : a
      );
      handleUpdateCanvas(updatedCanvas);
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    if (!selectedCanvas) return;
    const updatedCanvas = { ...selectedCanvas };
    if (updatedCanvas.annotations && updatedCanvas.annotations.length > 0) {
      updatedCanvas.annotations[0].items = updatedCanvas.annotations[0].items.filter(a => a.id !== id);
      handleUpdateCanvas(updatedCanvas);
      setSelectedAnnotationId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-iiif-red text-white p-1 rounded font-bold text-xs tracking-tighter">IIIF</div>
            <h1 className="font-bold text-slate-800 text-lg">Web Studio</h1>
            {rootResource?.type === 'Collection' && (
                <span className="text-slate-400 text-sm border-l border-slate-200 pl-2 ml-2">
                    {(rootResource as IIIFCollection).items.length} items in root
                </span>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => rootResource && exportManifest(rootResource)}
                className="flex items-center gap-2 px-3 py-1.5 bg-iiif-blue hover:bg-blue-800 text-white rounded text-sm font-medium transition-colors"
                title={rootResource?.type === 'Collection' ? "Export Collection JSON" : "Export Manifest JSON"}
            >
                <Icon name="download" className="text-lg"/>
                Export
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ManifestTree 
          rootResource={rootResource}
          activeManifestId={activeManifestId}
          onSelectManifest={(m) => {
              setActiveManifestId(m.id);
              if(m.items.length > 0) setSelectedCanvasId(m.items[0].id);
          }}
          selectedCanvasId={selectedCanvasId}
          onSelectCanvas={setSelectedCanvasId}
          onUpload={handleFileUpload}
          activeManifest={activeManifest}
        />
        
        <Workspace 
            canvas={selectedCanvas}
            onAddAnnotation={handleAddAnnotation}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
        />
        
        {activeManifest && (
            <MetadataEditor 
                manifest={activeManifest}
                canvas={selectedCanvas}
                selectedAnnotation={selectedAnnotation}
                onUpdateManifest={handleUpdateManifest}
                onUpdateCanvas={handleUpdateCanvas}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
            />
        )}
      </div>
    </div>
  );
};

export default App;