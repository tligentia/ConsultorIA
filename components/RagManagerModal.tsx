import React, { useState, useRef } from 'react';
import type { RagSource } from '../types';
import { STRINGS } from '../constants';
import { LinkIcon, FileIcon, TrashIcon, LoadingSpinner, QuoteIcon } from './icons';

interface RagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ragSources: RagSource[];
  setRagSources: React.Dispatch<React.SetStateAction<RagSource[]>>;
}

export const RagManagerModal: React.FC<RagManagerModalProps> = ({ isOpen, onClose, ragSources, setRagSources }) => {
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddUrl = () => {
    if (urlInput.trim() && !isUploading) {
      const newSource: RagSource = {
        id: Date.now().toString(),
        type: 'url',
        content: urlInput.trim(),
        status: 'active',
      };
      setRagSources(prev => [...prev, newSource]);
      setUrlInput('');
    }
  };
  
  const handleAddText = () => {
    if (textInput.trim() && !isUploading) {
        const newSource: RagSource = {
            id: Date.now().toString(),
            type: 'text',
            content: textInput.trim(),
            status: 'active',
        };
        setRagSources(prev => [...prev, newSource]);
        setTextInput('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsUploading(true);
      setTimeout(() => {
        const newSources: RagSource[] = Array.from(event.target.files).map(file => ({
          id: `${Date.now()}-${file.name}`,
          type: 'file',
          content: file.name,
          status: 'active',
        }));
        setRagSources(prev => [...prev, ...newSources]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsUploading(false);
      }, 500);
    }
  };

  const handleToggleSource = (id: string) => {
    setRagSources(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const handleRemoveSource = (id: string) => {
    setRagSources(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl transform transition-all animate-slide-in-up" onClick={e => e.stopPropagation()}>
        <header className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{STRINGS.ragModalTitle}</h2>
          <p className="text-gray-600 text-sm mt-1">{STRINGS.ragDescription}</p>
        </header>

        <div className="p-4 space-y-4">
          <div className="space-y-2 pb-4 border-b">
             <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder={STRINGS.addTextPlaceholder}
                disabled={isUploading}
                className="w-full form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 resize-y"
                rows={2}
                title={STRINGS.ragTextTooltip}
            />
            <button 
                onClick={handleAddText} 
                disabled={isUploading || !textInput.trim()} 
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto disabled:bg-gray-400"
                title={STRINGS.ragTextTooltip}
            >
                {STRINGS.addTextButton}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder={STRINGS.addUrlPlaceholder} disabled={isUploading} className="flex-grow form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100" title={STRINGS.ragUrlTooltip} />
            <button onClick={handleAddUrl} disabled={isUploading || !urlInput.trim()} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto disabled:bg-gray-400" title={STRINGS.ragUrlTooltip}>{STRINGS.addUrlButton}</button>
            <input type="file" id="file-upload" className="hidden" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} ref={fileInputRef} disabled={isUploading} />
            <label htmlFor="file-upload" title={STRINGS.ragFileUploadTooltip} className={`cursor-pointer text-center px-4 py-2 rounded-md transition-colors w-full sm:w-auto ${isUploading ? 'bg-gray-400 cursor-not-allowed text-gray-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
              <span className="flex items-center justify-center">
                {isUploading && <LoadingSpinner />}
                {STRINGS.uploadFileButton}
              </span>
            </label>
          </div>

          {ragSources.length > 0 && (
            <div className="space-y-2 pt-3 border-t max-h-64 overflow-y-auto pr-2">
              {ragSources.map((source, index) => (
                <div key={source.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                  <div className="flex items-center truncate">
                    <span className="text-sm font-bold text-gray-500 mr-2">{index + 1}.</span>
                    {source.type === 'url' && <LinkIcon />}
                    {source.type === 'file' && <FileIcon />}
                    {source.type === 'text' && <QuoteIcon />}
                    <span className="text-sm text-gray-700 truncate pr-2" title={source.content}>{source.content}</span>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer mr-3" title={STRINGS.ragSourceActiveTooltip}>
                      <input type="checkbox" checked={source.status === 'active'} onChange={() => handleToggleSource(source.id)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                    <button onClick={() => handleRemoveSource(source.id)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" title={STRINGS.ragSourceDeleteTooltip}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="px-4 py-2 bg-gray-50 rounded-b-xl text-right">
          <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" title={STRINGS.ragModalCloseButtonTooltip}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};