
import React, { useState, useEffect } from 'react';
import { IIIFItem } from '../types';
import { csvImporter, CSVColumnMapping, CSVImportResult } from '../services/csvImporter';
import { Icon } from './Icon';

interface CSVImportDialogProps {
  root: IIIFItem;
  onApply: (updatedRoot: IIIFItem) => void;
  onClose: () => void;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({ root, onApply, onClose }) => {
  const [step, setStep] = useState<'upload' | 'map' | 'result'>('upload');
  const [csvText, setCsvText] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [filenameColumn, setFilenameColumn] = useState('');
  const [mappings, setMappings] = useState<CSVColumnMapping[]>([]);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  const supportedProps = csvImporter.getSupportedProperties();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const parsed = csvImporter.parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      const detected = csvImporter.detectFilenameColumn(parsed.headers);
      if (detected) setFilenameColumn(detected);

      const initialMappings: CSVColumnMapping[] = parsed.headers
        .filter(h => h !== detected)
        .slice(0, 5)
        .map(h => ({ csvColumn: h, iiifProperty: '', language: 'en' }));
      setMappings(initialMappings);

      setStep('map');
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (index: number, field: keyof CSVColumnMapping, value: string) => {
    setMappings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMapping = () => {
    const unmapped = headers.filter(h =>
      h !== filenameColumn && !mappings.some(m => m.csvColumn === h)
    );
    if (unmapped.length > 0) {
      setMappings(prev => [...prev, { csvColumn: unmapped[0], iiifProperty: '', language: 'en' }]);
    }
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const validMappings = mappings.filter(m => m.csvColumn && m.iiifProperty);
    const { updatedRoot, result } = csvImporter.applyMappings(root, rows, filenameColumn, validMappings);
    setResult(result);
    setStep('result');

    if (result.matched > 0) {
      onApply(updatedRoot);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Icon name="table_chart" className="text-green-600" />
            CSV Metadata Import
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="upload_file" className="text-4xl text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Upload CSV File</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Import metadata from a CSV spreadsheet. The file should have a column for filenames and columns for metadata fields.
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="bg-iiif-blue text-white px-6 py-3 rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                  <Icon name="folder_open" /> Choose CSV File
                </span>
              </label>
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 font-bold mb-1">
                  <Icon name="check_circle" /> CSV Loaded
                </div>
                <p className="text-green-700 text-sm">
                  Found {headers.length} columns and {rows.length} rows
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Filename Column (to match with archive items)
                </label>
                <select
                  value={filenameColumn}
                  onChange={(e) => setFilenameColumn(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Column Mappings
                  </label>
                  <button
                    onClick={addMapping}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold text-slate-600 flex items-center gap-1"
                  >
                    <Icon name="add" className="text-sm" /> Add Mapping
                  </button>
                </div>

                <div className="space-y-2">
                  {mappings.map((mapping, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg">
                      <select
                        value={mapping.csvColumn}
                        onChange={(e) => handleMappingChange(idx, 'csvColumn', e.target.value)}
                        className="flex-1 border rounded p-2 text-sm"
                      >
                        <option value="">Select CSV Column</option>
                        {headers.filter(h => h !== filenameColumn).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                      <Icon name="arrow_forward" className="text-slate-400" />

                      <select
                        value={mapping.iiifProperty}
                        onChange={(e) => handleMappingChange(idx, 'iiifProperty', e.target.value)}
                        className="flex-1 border rounded p-2 text-sm"
                      >
                        <option value="">Select IIIF Property</option>
                        {supportedProps.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>

                      <select
                        value={mapping.language}
                        onChange={(e) => handleMappingChange(idx, 'language', e.target.value)}
                        className="w-20 border rounded p-2 text-sm"
                      >
                        <option value="en">en</option>
                        <option value="none">none</option>
                        <option value="fr">fr</option>
                        <option value="de">de</option>
                        <option value="es">es</option>
                      </select>

                      <button
                        onClick={() => removeMapping(idx)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Icon name="delete" className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-100 rounded-lg p-4">
                <h4 className="font-bold text-sm text-slate-700 mb-2">Preview (first 3 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="border-b">
                        {headers.slice(0, 5).map(h => (
                          <th key={h} className="text-left p-2 font-bold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          {headers.slice(0, 5).map(h => (
                            <td key={h} className="p-2 text-slate-600 truncate max-w-[150px]">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                result.matched > 0 ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <Icon
                  name={result.matched > 0 ? 'check_circle' : 'warning'}
                  className={`text-4xl ${result.matched > 0 ? 'text-green-600' : 'text-amber-600'}`}
                />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-4">Import Complete</h3>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{result.matched}</div>
                  <div className="text-sm text-green-700">Items Updated</div>
                </div>
                <div className="bg-slate-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-slate-600">{result.unmatched}</div>
                  <div className="text-sm text-slate-500">Not Matched</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <div className="font-bold text-red-800 mb-2">Errors ({result.errors.length})</div>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between">
          {step === 'map' && (
            <>
              <button onClick={() => setStep('upload')} className="text-slate-500 font-bold hover:text-slate-700">
                Back
              </button>
              <button
                onClick={handleApply}
                disabled={mappings.filter(m => m.csvColumn && m.iiifProperty).length === 0}
                className="bg-iiif-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Icon name="play_arrow" /> Apply Mappings
              </button>
            </>
          )}
          {step === 'result' && (
            <button
              onClick={onClose}
              className="mx-auto bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
