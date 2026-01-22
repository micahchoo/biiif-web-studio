import React, { useState, useEffect } from 'react';
import { IIIFCanvas, IIIFAnnotation, IIIFManifest, IIIFMotivation, AIConfig } from '../types';
import { Icon } from './Icon';
import { analyzeImage, blobToBase64, DEFAULT_AI_CONFIG } from '../services/geminiService';

interface MetadataEditorProps {
  manifest: IIIFManifest;
  canvas: IIIFCanvas | null;
  selectedAnnotation: IIIFAnnotation | null;
  onUpdateManifest: (m: Partial<IIIFManifest>) => void;
  onUpdateCanvas: (c: IIIFCanvas) => void;
  onUpdateAnnotation: (a: IIIFAnnotation) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  manifest,
  canvas,
  selectedAnnotation,
  onUpdateManifest,
  onUpdateCanvas,
  onUpdateAnnotation,
  onDeleteAnnotation
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'annotations'>('info');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('biiif_ai_config');
    return saved ? JSON.parse(saved) : DEFAULT_AI_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('biiif_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Auto switch to annotation tab if an annotation is selected
  useEffect(() => {
    if (selectedAnnotation) setActiveTab('annotations');
  }, [selectedAnnotation]);

  const handleAnalyze = async () => {
    if (!canvas || !canvas._blobUrl) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(canvas._blobUrl);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      
      const analysis = await analyzeImage(base64, blob.type, aiConfig);
      
      onUpdateCanvas({
        ...canvas,
        summary: { en: [analysis.summary] },
        // Append labels nicely
        label: { ...canvas.label, en: [...(canvas.label?.en || []), ...analysis.labels] }
      });
    } catch (e: any) {
      alert(`Analysis failed: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const motivations: { value: IIIFMotivation; label: string }[] = [
    { value: 'commenting', label: 'Comment' },
    { value: 'tagging', label: 'Tag' },
    { value: 'supplementing', label: 'Transcription / Supplement' },
  ];

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20 relative">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'info' ? 'border-iiif-blue text-iiif-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="info" className="text-lg"/>
          Metadata
        </button>
        <button 
          onClick={() => setActiveTab('annotations')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'annotations' ? 'border-iiif-blue text-iiif-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="comment" className="text-lg"/>
          Annotations
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manifest Label</label>
              <input 
                type="text" 
                value={manifest.label?.en?.[0] || ''}
                onChange={(e) => onUpdateManifest({ label: { en: [e.target.value] } })}
                className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-iiif-blue focus:outline-none"
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rights / Attribution</label>
              <input 
                type="text" 
                value={manifest.rights || ''}
                onChange={(e) => onUpdateManifest({ rights: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-iiif-blue focus:outline-none"
                placeholder="http://creativecommons.org/licenses/by/4.0/"
              />
            </div>
            
            {canvas ? (
               <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-slate-800">Current Canvas</h3>
                   <div className="flex items-center gap-2">
                     <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="AI Settings"
                     >
                       <Icon name="settings" className="text-sm"/>
                     </button>
                     <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`text-xs flex items-center gap-1 hover:underline disabled:opacity-50 font-medium ${aiConfig.provider === 'none' ? 'text-slate-500' : 'text-iiif-blue'}`}
                      title={aiConfig.provider === 'none' ? "Fill with local file info" : `Analyze with ${aiConfig.provider}`}
                     >
                       <Icon name={aiConfig.provider === 'none' ? 'article' : 'auto_awesome'} className="text-sm"/>
                       {isAnalyzing ? 'Working...' : 'Fill'}
                     </button>
                   </div>
                </div>

                {/* AI Settings Panel */}
                {showSettings && (
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm space-y-3 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Analysis Provider</label>
                      <select 
                        value={aiConfig.provider}
                        onChange={e => setAiConfig(prev => ({...prev, provider: e.target.value as any}))}
                        className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                      >
                        <option value="none">None (Local Metadata)</option>
                        <option value="ollama">Ollama (Self-Hosted)</option>
                        <option value="gemini">Gemini (Cloud API)</option>
                      </select>
                    </div>

                    {aiConfig.provider === 'ollama' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Ollama Model</label>
                          <input 
                            type="text" 
                            value={aiConfig.ollamaModel}
                            onChange={e => setAiConfig(prev => ({...prev, ollamaModel: e.target.value}))}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            placeholder="llava"
                          />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">Ollama Endpoint</label>
                           <input 
                              type="text" 
                              value={aiConfig.ollamaEndpoint}
                              onChange={e => setAiConfig(prev => ({...prev, ollamaEndpoint: e.target.value}))}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs"
                           />
                           <p className="text-[10px] text-slate-400 mt-1">Requires <code>OLLAMA_ORIGINS="*"</code></p>
                        </div>
                      </>
                    )}
                     {aiConfig.provider === 'gemini' && (
                        <p className="text-[10px] text-green-600 flex items-center gap-1">
                          <Icon name="check_circle" className="text-xs"/>
                          Using environment API Key
                        </p>
                     )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label</label>
                  <input 
                    type="text" 
                    value={canvas.label?.none?.[0] || canvas.label?.en?.[0] || ''}
                    onChange={(e) => onUpdateCanvas({ ...canvas, label: { en: [e.target.value] } })}
                    className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-iiif-blue focus:outline-none"
                  />
                </div>

                 <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</label>
                  <textarea 
                    rows={4}
                    value={canvas.summary?.en?.[0] || ''}
                    onChange={(e) => onUpdateCanvas({ ...canvas, summary: { en: [e.target.value] } })}
                    className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-iiif-blue focus:outline-none resize-none"
                    placeholder="Brief description of the image..."
                  />
                </div>
               </div>
            ) : (
              <p className="text-sm text-slate-400 italic mt-4">Select a canvas to edit its properties.</p>
            )}
          </div>
        )}

        {activeTab === 'annotations' && (
           <div className="space-y-4">
              {!canvas ? (
                 <p className="text-sm text-slate-400 italic">Select a canvas to view annotations.</p>
              ) : selectedAnnotation ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Edit Annotation</h3>
                    <button onClick={() => onDeleteAnnotation(selectedAnnotation.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Icon name="delete"/>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Motivation</label>
                      <select 
                        value={selectedAnnotation.motivation}
                        onChange={(e) => onUpdateAnnotation({ ...selectedAnnotation, motivation: e.target.value as IIIFMotivation })}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                      >
                        {motivations.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                     </div>

                     <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">
                        {selectedAnnotation.motivation === 'tagging' ? 'Tag' : 'Content'}
                      </label>
                      <textarea 
                        autoFocus
                        rows={selectedAnnotation.motivation === 'tagging' ? 1 : 5}
                        value={selectedAnnotation.body.value || ''}
                        onChange={(e) => onUpdateAnnotation({ ...selectedAnnotation, body: { ...selectedAnnotation.body, value: e.target.value } })}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-iiif-blue focus:outline-none"
                        placeholder={selectedAnnotation.motivation === 'tagging' ? 'Enter tag...' : 'Enter text...'}
                      />
                     </div>

                     {selectedAnnotation.motivation !== 'tagging' && (
                       <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Format</label>
                        <select 
                          value={selectedAnnotation.body.format || 'text/plain'}
                          onChange={(e) => onUpdateAnnotation({ ...selectedAnnotation, body: { ...selectedAnnotation.body, format: e.target.value } })}
                          className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                        >
                          <option value="text/plain">Plain Text</option>
                          <option value="text/html">HTML</option>
                        </select>
                       </div>
                     )}

                      <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Language</label>
                      <select 
                        value={selectedAnnotation.body.language || 'en'}
                        onChange={(e) => onUpdateAnnotation({ ...selectedAnnotation, body: { ...selectedAnnotation.body, language: e.target.value } })}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                        <option value="jp">Japanese</option>
                      </select>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-mono">
                    ID: {selectedAnnotation.id.split('/').pop()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Icon name="draw" className="text-4xl mb-2 opacity-30"/>
                  <p className="text-sm">Draw a box on the canvas to create an annotation.</p>
                   {canvas.annotations && canvas.annotations.length > 0 && canvas.annotations[0].items.length > 0 && (
                      <div className="mt-6 text-left border-t border-slate-100 pt-4">
                        <p className="font-bold text-xs text-slate-500 uppercase mb-2">Existing Annotations</p>
                        <ul className="space-y-2">
                           {canvas.annotations[0].items.map((anno, i) => (
                             <li key={anno.id} className="text-sm p-2 bg-slate-50 rounded border border-slate-100 text-slate-600 flex gap-2 items-start">
                               <Icon name={anno.motivation === 'tagging' ? 'label' : anno.motivation === 'supplementing' ? 'description' : 'comment'} className="text-slate-400 text-base mt-0.5"/>
                               <span className="truncate flex-1">{anno.body.value || '(No content)'}</span>
                             </li>
                           ))}
                        </ul>
                      </div>
                   )}
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};