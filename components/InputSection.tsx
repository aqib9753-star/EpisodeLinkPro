import React, { useRef, useState } from 'react';
import { Upload, Trash2, Play, FileText, Clipboard, Link as LinkIcon } from 'lucide-react';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  onProcess: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ inputText, setInputText, onProcess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Source Data
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePaste}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
          >
            <Clipboard className="w-3.5 h-3.5" /> Paste
          </button>
          <button 
            onClick={() => setInputText('')}
            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        
        {/* File Dropzone */}
        <div 
          className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
            ${dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
              : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt" 
          />
          <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
             <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Click to upload .txt file
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            or drag and drop your list here
          </p>
        </div>

        {/* Text Area Container */}
        <div className="flex-1 flex flex-col min-h-0 relative">
           <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-10 opacity-0 transition-opacity peer-scroll:opacity-100"></div>
           <textarea
             className="peer flex-1 w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none font-mono text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 transition-all custom-scrollbar"
             placeholder={`Paste your messy links here...
Example:
https://voe.sx/abc Squid Game S01E01 720p
https://mixdrop.co/xyz Squid Game S01E02 480p`}
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
           />
        </div>

        {/* Action Button */}
        <button
          onClick={onProcess}
          disabled={!inputText.trim()}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform active:scale-[0.99] transition-all flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5 fill-current" />
          PROCESS LINKS
        </button>

      </div>
    </div>
  );
};

export default InputSection;