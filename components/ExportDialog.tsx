
import React, { useState, useEffect } from 'react';
import { IIIFItem, getIIIFValue } from '../types';
import { exportService, ExportOptions, VirtualFile } from '../services/exportService';
import { staticSiteExporter, StaticSiteConfig } from '../services/staticSiteExporter';
import { validator, ValidationIssue } from '../services/validator';
import { Icon } from './Icon';
import { ExportDryRun } from './ExportDryRun';
import FileSaver from 'file-saver';

interface ExportDialogProps {
  root: IIIFItem | null;
  onClose: () => void;
}

type ExportStep = 'config' | 'wax-config' | 'dry-run' | 'exporting';
type ExportFormat = 'static-site' | 'raw-iiif' | 'wax-site';

export const ExportDialog: React.FC<ExportDialogProps> = ({ root, onClose }) => {
  const [step, setStep] = useState<ExportStep>('config');
  const [format, setFormat] = useState<ExportFormat>('static-site');
  const [includeAssets, setIncludeAssets] = useState(true);
  const [ignoreErrors, setIgnoreErrors] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ status: '', percent: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([]);
  const [integrityIssues, setIntegrityIssues] = useState<ValidationIssue[]>([]);

  // Wax static site configuration
  const [waxConfig, setWaxConfig] = useState<Partial<StaticSiteConfig>>({
    baseUrl: '',
    title: root ? getIIIFValue(root.label) || 'IIIF Collection' : 'IIIF Collection',
    description: '',
    collectionName: 'objects',
    thumbnailWidth: 250,
    fullWidth: 1140,
    includeSearch: true,
    includeViewer: true,
    template: 'gallery'
  });

  useEffect(() => {
      if (root && step === 'dry-run') {
          handleDryRun();
      }
  }, [step, format, includeAssets]);

  const handleDryRun = async () => {
      if (!root) return;
      setProcessing(true);
      try {
          // Map 'wax-site' to 'static-site' for the legacy export service
          const exportFormat = format === 'wax-site' ? 'static-site' : format;
          const files = await exportService.prepareExport(root, { format: exportFormat, includeAssets, ignoreErrors });
          setVirtualFiles(files);
          
          const issueMap = validator.validateTree(root);
          setIntegrityIssues(Object.values(issueMap).flat());
      } catch (e: any) {
          setErrorMsg(e.message);
      } finally {
          setProcessing(false);
      }
  };

  const handleFinalExport = async () => {
    if (!root) return;
    setStep('exporting');
    setErrorMsg(null);
    try {
        const blob = await exportService.exportArchive(root, { format: format === 'wax-site' ? 'static-site' : format, includeAssets, ignoreErrors }, (p) => {
            setProgress(p);
        });
        FileSaver.saveAs(blob, `archive-export-${new Date().toISOString().split('T')[0]}.zip`);
        onClose();
    } catch (e: any) {
        setErrorMsg(e.message);
        setStep('dry-run');
    }
  };

  const handleWaxExport = async () => {
    if (!root) return;
    setStep('exporting');
    setErrorMsg(null);
    setProgress({ status: 'Initializing static site generator...', percent: 0 });

    try {
        setProgress({ status: 'Collecting items and metadata...', percent: 10 });
        const result = await staticSiteExporter.exportSite(root, waxConfig as any);

        if (!result.success && result.errors.length > 0) {
            throw new Error(result.errors.join('; '));
        }

        setProgress({ status: 'Generating IIIF tiles...', percent: 40 });
        await new Promise(r => setTimeout(r, 500)); // Brief pause for UI

        setProgress({ status: 'Building search index...', percent: 60 });
        await new Promise(r => setTimeout(r, 300));

        setProgress({ status: 'Compressing ZIP archive...', percent: 80 });
        await staticSiteExporter.downloadAsZip(result, `${waxConfig.collectionName || 'site'}-${new Date().toISOString().split('T')[0]}.zip`);

        setProgress({ status: 'Complete!', percent: 100 });
        await new Promise(r => setTimeout(r, 500));
        onClose();
    } catch (e: any) {
        setErrorMsg(e.message || 'Failed to generate static site');
        setStep('wax-config');
    }
  };

  const criticalErrors = integrityIssues.filter(i => i.level === 'error');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="none">
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            className={`bg-white rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden flex flex-col ${step === 'dry-run' ? 'max-w-5xl w-full' : 'max-w-md w-full'}`}
        >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-iiif-blue rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Icon name="publish" />
                    </div>
                    <div>
                        <h2 id="export-dialog-title" className="text-lg font-black text-slate-800 uppercase tracking-tighter">Archive Export</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {step === 'config' ? 'Step 1: Format Selection' : step === 'wax-config' ? 'Step 2: Site Configuration' : step === 'dry-run' ? 'Step 2: Integrity & Preview' : 'Step 3: Generating'}
                        </p>
                    </div>
                </div>
                {step !== 'exporting' && (
                    <button onClick={onClose} aria-label="Close dialog" className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <Icon name="close"/>
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm mb-6 flex gap-3 animate-in shake" role="alert">
                        <Icon name="error" className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1 uppercase tracking-tighter">Integrity Failure</p>
                            <p className="opacity-80">{errorMsg}</p>
                        </div>
                    </div>
                )}

                {step === 'config' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-labelledby="export-format-label">
                            <span id="export-format-label" className="sr-only">Choose Export Format</span>
                            <button
                                role="radio"
                                aria-checked={format === 'static-site'}
                                className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${format === 'static-site' ? 'border-iiif-blue bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                onClick={() => setFormat('static-site')}
                            >
                                <Icon name="language" className={`text-2xl mb-3 ${format === 'static-site' ? 'text-iiif-blue' : 'text-slate-400'}`} />
                                <div className="font-bold text-sm text-slate-800 mb-1">Static Website</div>
                                <p className="text-[10px] text-slate-500 leading-tight">Embedded viewer for instant browsing.</p>
                                {format === 'static-site' && <div className="absolute top-4 right-4 text-iiif-blue"><Icon name="check_circle"/></div>}
                            </button>
                            <button
                                role="radio"
                                aria-checked={format === 'wax-site'}
                                className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${format === 'wax-site' ? 'border-green-600 bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}
                                onClick={() => setFormat('wax-site')}
                            >
                                <Icon name="public" className={`text-2xl mb-3 ${format === 'wax-site' ? 'text-green-600' : 'text-slate-400'}`} />
                                <div className="font-bold text-sm text-slate-800 mb-1">Wax Exhibition</div>
                                <p className="text-[10px] text-slate-500 leading-tight">Full static site with pages, search & IIIF tiles.</p>
                                {format === 'wax-site' && <div className="absolute top-4 right-4 text-green-600"><Icon name="check_circle"/></div>}
                            </button>
                            <button
                                role="radio"
                                aria-checked={format === 'raw-iiif'}
                                className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${format === 'raw-iiif' ? 'border-iiif-blue bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                onClick={() => setFormat('raw-iiif')}
                            >
                                <Icon name="code" className={`text-2xl mb-3 ${format === 'raw-iiif' ? 'text-iiif-blue' : 'text-slate-400'}`} />
                                <div className="font-bold text-sm text-slate-800 mb-1">Raw IIIF</div>
                                <p className="text-[10px] text-slate-500 leading-tight">JSON documents and assets only.</p>
                                {format === 'raw-iiif' && <div className="absolute top-4 right-4 text-iiif-blue"><Icon name="check_circle"/></div>}
                            </button>
                        </div>

                        {format === 'wax-site' && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                                <div className="flex items-center gap-2 text-green-800 font-bold text-sm mb-2">
                                    <Icon name="auto_awesome" /> Wax-Style Exhibition Site
                                </div>
                                <p className="text-xs text-green-700">
                                    Generates a complete static website compatible with GitHub Pages, Netlify, or any static host.
                                    Includes pre-computed IIIF tiles, item pages, search index, and gallery views.
                                </p>
                            </div>
                        )}

                        {format !== 'wax-site' && (
                            <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeAssets}
                                    onChange={e => setIncludeAssets(e.target.checked)}
                                    className="w-6 h-6 text-iiif-blue rounded-lg border-slate-300 focus:ring-iiif-blue"
                                />
                                <div>
                                    <div className="font-bold text-sm text-slate-700">Include Physical Assets</div>
                                    <div className="text-xs text-slate-500">Zip images and media files along with metadata.</div>
                                </div>
                            </label>
                        )}
                    </div>
                )}

                {step === 'wax-config' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="text-center mb-6">
                            <Icon name="public" className="text-4xl text-green-600 mb-2" />
                            <h3 className="text-lg font-bold text-slate-800">Configure Your Exhibition</h3>
                            <p className="text-sm text-slate-500">Customize how your static site will be generated</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Site Title</label>
                                <input
                                    type="text"
                                    value={waxConfig.title || ''}
                                    onChange={e => setWaxConfig({ ...waxConfig, title: e.target.value })}
                                    className="w-full border rounded-lg p-2 text-sm"
                                    placeholder="My IIIF Collection"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Collection Name</label>
                                <input
                                    type="text"
                                    value={waxConfig.collectionName || ''}
                                    onChange={e => setWaxConfig({ ...waxConfig, collectionName: e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase() })}
                                    className="w-full border rounded-lg p-2 text-sm"
                                    placeholder="objects"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea
                                value={waxConfig.description || ''}
                                onChange={e => setWaxConfig({ ...waxConfig, description: e.target.value })}
                                className="w-full border rounded-lg p-2 text-sm"
                                rows={2}
                                placeholder="A digital exhibition of..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Base URL (optional)</label>
                            <input
                                type="text"
                                value={waxConfig.baseUrl || ''}
                                onChange={e => setWaxConfig({ ...waxConfig, baseUrl: e.target.value })}
                                className="w-full border rounded-lg p-2 text-sm"
                                placeholder="https://username.github.io/my-collection"
                            />
                            <p className="text-xs text-slate-500 mt-1">Leave empty for relative paths (works locally)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Thumbnail Width</label>
                                <input
                                    type="number"
                                    value={waxConfig.thumbnailWidth || 250}
                                    onChange={e => setWaxConfig({ ...waxConfig, thumbnailWidth: parseInt(e.target.value) || 250 })}
                                    className="w-full border rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Image Width</label>
                                <input
                                    type="number"
                                    value={waxConfig.fullWidth || 1140}
                                    onChange={e => setWaxConfig({ ...waxConfig, fullWidth: parseInt(e.target.value) || 1140 })}
                                    className="w-full border rounded-lg p-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={waxConfig.includeSearch}
                                    onChange={e => setWaxConfig({ ...waxConfig, includeSearch: e.target.checked })}
                                    className="rounded text-green-600"
                                />
                                <span className="text-sm text-slate-700">Include Search</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={waxConfig.includeViewer}
                                    onChange={e => setWaxConfig({ ...waxConfig, includeViewer: e.target.checked })}
                                    className="rounded text-green-600"
                                />
                                <span className="text-sm text-slate-700">Include Viewer Page</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Template Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['minimal', 'gallery', 'scholarly'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setWaxConfig({ ...waxConfig, template: t })}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                                            waxConfig.template === t
                                                ? 'border-green-600 bg-green-50 text-green-800'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'dry-run' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {processing ? (
                            <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-slate-400" aria-live="polite">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-iiif-blue rounded-full animate-spin"></div>
                                <p className="text-xs font-black uppercase tracking-widest">Synthesizing Archive DNA...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-4 mb-4">
                                    <div className={`flex-1 p-4 rounded-2xl border-2 flex items-center gap-4 ${criticalErrors.length > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                        <Icon name={criticalErrors.length > 0 ? 'error' : 'verified'} className="text-2xl"/>
                                        <div>
                                            <p className="font-bold text-sm">{criticalErrors.length > 0 ? `${criticalErrors.length} Critical Issues` : 'Spec Compliance: Valid'}</p>
                                            <p className="text-[10px] opacity-75">{criticalErrors.length > 0 ? 'Fix issues below to ensure interoperability.' : 'Archive meets IIIF Presentation 3.0 standards.'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-center min-w-[120px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Package Size</span>
                                        <span className="text-sm font-bold text-slate-700">~{includeAssets ? 'Calculated' : 'Small'}</span>
                                    </div>
                                </div>

                                <ExportDryRun files={virtualFiles} />
                                
                                {criticalErrors.length > 0 && (
                                    <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Icon name="warning" className="text-amber-600"/>
                                            <span className="text-xs font-medium text-amber-900">Archive has critical issues. You must fix them or override integrity.</span>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                                            <input type="checkbox" checked={ignoreErrors} onChange={e => setIgnoreErrors(e.target.checked)} className="rounded text-amber-600"/>
                                            <span className="text-[9px] font-black uppercase text-amber-700">Ignore Errors</span>
                                        </label>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {step === 'exporting' && (
                    <div className="text-center py-12 space-y-6">
                        <div className="relative w-24 h-24 mx-auto" aria-live="polite">
                            <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                            <div 
                                className="absolute inset-0 border-8 border-iiif-blue rounded-full transition-all duration-300"
                                style={{ 
                                    clipPath: `polygon(50% 50%, -50% -50%, ${progress.percent}% -50%, ${progress.percent}% 150%, -50% 150%)`,
                                    transform: 'rotate(-90deg)'
                                }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-iiif-blue">
                                {Math.round(progress.percent)}%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{progress.status}</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">Archive Compression Engine</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-between items-center shrink-0">
                {step === 'config' && (
                    <>
                        <button onClick={onClose} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                        <button
                            onClick={() => format === 'wax-site' ? setStep('wax-config') : setStep('dry-run')}
                            className="bg-iiif-blue text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl flex items-center gap-2 transition-all active:scale-95"
                        >
                            {format === 'wax-site' ? 'Configure Site' : 'Start Dry Run'} <Icon name="arrow_forward" />
                        </button>
                    </>
                )}
                {step === 'wax-config' && (
                    <>
                        <button onClick={() => setStep('config')} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Back</button>
                        <button
                            onClick={handleWaxExport}
                            className="bg-green-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 shadow-xl flex items-center gap-2 transition-all active:scale-95"
                        >
                            Generate Site <Icon name="download" />
                        </button>
                    </>
                )}
                {step === 'dry-run' && !processing && (
                    <>
                        <button onClick={() => setStep('config')} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Back to Settings</button>
                        <button
                            onClick={handleFinalExport}
                            disabled={criticalErrors.length > 0 && !ignoreErrors}
                            className="bg-green-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Finalize & Download ZIP <Icon name="download" />
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};
