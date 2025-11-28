import React, { useState, useEffect } from 'react';
import { parseInputText } from './utils/parser';
import { EpisodeGroup } from './types';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import { Sparkles, Moon, Sun, Download, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [groups, setGroups] = useState<EpisodeGroup[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleProcess = () => {
    if (!inputText.trim()) return;
    const result = parseInputText(inputText);
    setGroups(result.groups);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // This function generates a standalone HTML file containing the entire app logic in Vanilla JS
  const downloadOfflineVersion = () => {
    // We construct the HTML carefully to avoid template literal escaping hell
    const offlineHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Episode Link Pro (Offline)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
              primary: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
              slate: { 750: '#2d3748', 800: '#1e293b', 850: '#172033', 900: '#0f172a', 950: '#020617' }
            }
          }
        }
      }
    </script>
    <style>
      body { transition: background-color 0.3s ease, color 0.3s ease; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .dark ::-webkit-scrollbar-thumb { background: #475569; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 transition-colors duration-300">
    <div id="app-root" class="min-h-screen flex flex-col max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        
        <header class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold tracking-tight dark:text-white">EpisodeLink<span class="text-primary-600 dark:text-primary-400">Pro</span></h1>
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Offline Version</p>
                </div>
            </div>
            <button id="theme-toggle" class="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Turn Dark Mode On
            </button>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-[calc(100vh-8rem)]">
            
            <div class="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div class="bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 font-bold dark:text-white">Input Links</div>
                <div class="flex-1 flex flex-col p-6 gap-4">
                    <textarea id="input-area" class="flex-1 w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm dark:text-slate-300 resize-none" placeholder="Paste links here..."></textarea>
                    <button id="process-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">PROCESS LINKS</button>
                </div>
            </div>

            <div class="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div class="bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span class="font-bold dark:text-white">Results</span>
                    <button id="copy-all-btn" class="text-xs bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-lg font-bold dark:text-white">Copy All HTML</button>
                </div>
                <div id="output-area" class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/30 space-y-6">
                    <div class="text-center text-slate-400 mt-20">Waiting for input...</div>
                </div>
            </div>

        </div>
    </div>

    <script>
        // LOGIC START
        const identifyServer = (url) => {
            const lower = url.toLowerCase();
            if (lower.includes('voe')) return 'Voe';
            if (lower.includes('mixdrop')) return 'Mixdrop';
            if (lower.includes('drive')) return 'GDrive';
            if (lower.includes('mega')) return 'Mega';
            try { return new URL(url).hostname.replace('www.','').split('.')[0].toUpperCase(); } catch(e){ return 'Server'; }
        };
        const identifyQuality = (text) => {
            const m = text.match(/(480p|720p|1080p|4k|hd|sd)/i);
            return m ? m[1].toUpperCase() : 'HD';
        };
        const extractEp = (text) => {
            let m = /s(\\d{1,2})\\s*e(\\d{1,2})/i.exec(text);
            if(m) return {s:parseInt(m[1]), e:parseInt(m[2])};
            m = /\\b(\\d{1,2})x(\\d{1,2})\\b/.exec(text);
            if(m) return {s:parseInt(m[1]), e:parseInt(m[2])};
            m = /episode\\s*(\\d{1,2})/i.exec(text);
            if(m) return {s:1, e:parseInt(m[1])};
            return null;
        };
        
        const parse = (text) => {
            const groups = {};
            let ctx = null;
            text.split('\\n').forEach(line => {
                const tr = line.trim();
                if(!tr) return;
                const ep = extractEp(tr);
                const q = identifyQuality(tr);
                const urls = tr.match(/(https?:\\/\\/[^\\s]+)/g) || [];
                
                if(ep) {
                    const code = \`S\${ep.s.toString().padStart(2,'0')}E\${ep.e.toString().padStart(2,'0')}\`;
                    ctx = { s: ep.s, e: ep.e, code: code, title: tr.replace(/(https?:\\/\\/[^\\s]+)/g,'').trim() || code };
                }
                
                if(urls.length > 0) {
                    const code = ctx ? ctx.code : 'S01E01';
                    if(!groups[code]) groups[code] = { id: code, title: ctx ? ctx.title : 'Unknown', links: [] };
                    urls.forEach(u => groups[code].links.push({ url: u, server: identifyServer(u), qual: q }));
                }
            });
            return Object.values(groups).sort((a,b) => a.id.localeCompare(b.id));
        };

        const generateHTML = (g) => {
            const lis = g.links.map(l => \`  <li>\\n    <a href="\${l.url}" target="_blank" class="download-link"><span class="server">\${l.server}</span> <span class="quality badge">\${l.qual}</span></a>\\n  </li>\`).join('\\n');
            return \`<div class="episode-container" data-episode="\${g.id}">\\n  <h3 class="episode-title"><span class="ep-code">\${g.id}</span></h3>\\n  <ul class="link-list">\\n\${lis}\\n  </ul>\\n</div>\`;
        };

        // UI HANDLING
        const inputArea = document.getElementById('input-area');
        const outputArea = document.getElementById('output-area');
        const processBtn = document.getElementById('process-btn');
        const themeBtn = document.getElementById('theme-toggle');
        const copyAllBtn = document.getElementById('copy-all-btn');

        // Theme Logic
        if(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
        themeBtn.onclick = () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        };

        // Main Process Logic
        processBtn.onclick = () => {
            const res = parse(inputArea.value);
            outputArea.innerHTML = '';
            
            res.forEach(g => {
                const htmlCode = generateHTML(g);
                const linksText = g.links.map(l=>l.url).join('\\n');
                
                const div = document.createElement('div');
                div.className = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6';
                
                // We build innerHTML carefully using placeholders or simpler strings
                // Note: We do NOT use inline onclick="..." for complex logic to avoid escaping hell.
                div.innerHTML = \`
                    <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">\${g.id}</div>
                            <h3 class="font-bold text-slate-800 dark:text-slate-200 text-sm">\${g.title}</h3>
                        </div>
                        <div class="flex gap-2">
                             <button class="btn-copy-links text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white transition">Copy Links</button>
                             <button class="btn-copy-html text-xs bg-slate-800 text-white px-2 py-1.5 rounded hover:bg-slate-700 transition">Copy HTML</button>
                        </div>
                    </div>
                    <div class="p-4 space-y-2">
                        \${g.links.map(l => \`
                            <div class="flex justify-between p-2 rounded border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800/50">
                                <span class="text-xs font-bold dark:text-white w-20">\${l.server}</span>
                                <span class="text-[10px] bg-primary-50 text-primary-600 px-1 rounded border border-primary-100">\${l.qual}</span>
                                <a href="\${l.url}" target="_blank" class="text-xs text-primary-600 hover:underline">Open</a>
                            </div>
                        \`).join('')}
                    </div>
                \`;
                
                // Add event listeners using JS properties (Safer than inline HTML attributes)
                const copyLinksBtn = div.querySelector('.btn-copy-links');
                copyLinksBtn.onclick = () => {
                    navigator.clipboard.writeText(linksText);
                    const originalText = copyLinksBtn.textContent;
                    copyLinksBtn.textContent = 'Copied!';
                    setTimeout(() => copyLinksBtn.textContent = originalText, 1500);
                };
                
                const copyHtmlBtn = div.querySelector('.btn-copy-html');
                copyHtmlBtn.onclick = () => {
                    navigator.clipboard.writeText(htmlCode);
                    const originalText = copyHtmlBtn.textContent;
                    copyHtmlBtn.textContent = 'Copied!';
                    setTimeout(() => copyHtmlBtn.textContent = originalText, 1500);
                };

                outputArea.appendChild(div);
            });
        };

        copyAllBtn.onclick = () => {
             const res = parse(inputArea.value);
             const all = res.map(g => generateHTML(g)).join('\\n\\n');
             navigator.clipboard.writeText(all);
             const originalText = copyAllBtn.textContent;
             copyAllBtn.textContent = 'Copied!';
             setTimeout(() => copyAllBtn.textContent = originalText, 2000);
        };
    </script>
</body>
</html>
    `;

    const blob = new Blob([offlineHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EpisodeLinkPro_Offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-xl text-white shadow-lg shadow-primary-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  EpisodeLink<span className="text-primary-600 dark:text-primary-400">Pro</span>
                </h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Advanced HTML Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={downloadOfflineVersion}
                className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                title="Download single HTML file to use offline forever"
              >
                <Download className="w-4 h-4" />
                <span>Save Offline App</span>
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {/* Mobile Download Button */}
          <div className="md:hidden px-4 pb-2">
             <button
                onClick={downloadOfflineVersion}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
              >
                <WifiOff className="w-4 h-4" />
                <span>Download Offline Version</span>
              </button>
          </div>
        </header>

        {/* Main Layout - Split View */}
        <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)] min-h-[600px]">
            
            {/* Left Panel */}
            <section className="h-full flex flex-col">
              <InputSection 
                inputText={inputText} 
                setInputText={setInputText} 
                onProcess={handleProcess} 
              />
            </section>

            {/* Right Panel */}
            <section className="h-full flex flex-col">
              <OutputSection groups={groups} />
            </section>

          </div>
        </main>

      </div>
    </div>
  );
};

export default App;