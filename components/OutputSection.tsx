import React, { useState } from 'react';
import { Copy, Check, Layers, Download, Link, Code2, Eye } from 'lucide-react';
import { EpisodeGroup } from '../types';
import { generateHtmlForGroup } from '../utils/parser';

interface OutputSectionProps {
  groups: EpisodeGroup[];
}

const OutputSection: React.FC<OutputSectionProps> = ({ groups }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allHtml = groups.map(g => generateHtmlForGroup(g)).join('\n\n');
    copyToClipboard(allHtml, 'all');
  };

  const downloadGroupFile = (group: EpisodeGroup) => {
    const htmlContent = generateHtmlForGroup(group);
    const blob = new Blob([htmlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${group.fullCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyRawLinks = (group: EpisodeGroup) => {
    const rawLinks = group.links.map(l => l.originalUrl).join('\n');
    copyToClipboard(rawLinks, `raw-${group.id}`);
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 items-center justify-center p-8 text-center transition-all duration-300">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Waiting for Input</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs leading-relaxed">
          Paste your links in the left panel and click "Process Links" to generate your organized episodes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Results
          </h2>
          <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Eye className="w-3 h-3" /> Visual
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'code' ? 'bg-white dark:bg-slate-600 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Code2 className="w-3 h-3" /> HTML Code
            </button>
          </div>
        </div>
        
        <button
          onClick={handleCopyAll}
          className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          {copiedId === 'all' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          Copy All HTML
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/30 custom-scrollbar">
        <div className="space-y-6">
          {groups.map((group) => {
             const htmlCode = generateHtmlForGroup(group);

             return (
               <div key={group.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800">
                 
                 {/* Card Header */}
                 <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                        {group.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{group.rawTitle}</h3>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{group.links.length} sources found</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyRawLinks(group)}
                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-1.5 rounded-md transition-colors"
                        title="Copy Only Links (No HTML)"
                      >
                         {copiedId === `raw-${group.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => downloadGroupFile(group)}
                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-1.5 rounded-md transition-colors"
                        title="Download .txt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      <button
                         onClick={() => copyToClipboard(htmlCode, group.id)}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-sm"
                       >
                         {copiedId === group.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         <span>Copy HTML</span>
                       </button>
                    </div>
                 </div>

                 <div className="p-4 bg-white dark:bg-slate-800/50">
                   {activeTab === 'preview' ? (
                     <div className="space-y-2">
                       {group.links.map((link, idx) => (
                         <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 text-sm hover:border-primary-200 dark:hover:border-primary-800 transition-colors group/link">
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                              <span className="flex-shrink-0 w-20 font-semibold text-slate-700 dark:text-slate-300 truncate text-xs">{link.serverName}</span>
                              <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30 uppercase tracking-wide">
                                {link.quality}
                              </span>
                              <span className="text-xs text-slate-400 truncate opacity-0 group-hover/link:opacity-100 transition-opacity">
                                {link.originalUrl}
                              </span>
                            </div>
                            <a href={link.originalUrl} target="_blank" rel="noreferrer" className="flex-shrink-0 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                              Open Link
                            </a>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="relative group/code">
                       <pre className="bg-slate-900 dark:bg-black text-slate-300 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed border border-slate-800 dark:border-slate-800 shadow-inner">
                         {htmlCode}
                       </pre>
                     </div>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default OutputSection;