import React, { useState, useEffect } from 'react';
import { AppState, OptimizedImage } from './types';
import { optimizeImage } from './utils/compression';
import { DropZone } from './components/DropZone';
import { ResultCard } from './components/ResultCard';
import { Zap, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<OptimizedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup object URLs to prevent memory leaks
    return () => {
      if (result) {
        URL.revokeObjectURL(result.originalPreview);
        URL.revokeObjectURL(result.optimizedPreview);
      }
    };
  }, [result]);

  const handleFileSelect = async (file: File) => {
    setState(AppState.PROCESSING);
    setError(null);

    try {
      // 1. Create Original Preview
      const originalPreview = URL.createObjectURL(file);
      
      // 2. Run Optimization Logic
      const optimizedBlob = await optimizeImage(file, 300); // Target 300KB
      const optimizedPreview = URL.createObjectURL(optimizedBlob);

      // 3. Calculate Stats
      const originalSize = file.size;
      const optimizedSize = optimizedBlob.size;
      const savedBytes = originalSize - optimizedSize;
      const compressionRatio = (savedBytes / originalSize) * 100;

      setResult({
        originalFile: file,
        originalPreview,
        optimizedBlob,
        optimizedPreview,
        originalSize,
        optimizedSize,
        compressionRatio,
        name: file.name
      });

      setState(AppState.DONE);
    } catch (err) {
      console.error(err);
      setError('Nepodařilo se optimalizovat obrázek. Zkuste jiný soubor.');
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setResult(null);
    setState(AppState.IDLE);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">WebOpti</span>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Client-side Secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        {state === AppState.IDLE && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Optimalizace obrázků <br/>
                <span className="text-blue-600">bez ztráty kvality</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Nahrajte velké obrázky (až 20MB) a my je bleskově zmenšíme na webovou velikost (~300KB) přímo ve vašem prohlížeči.
              </p>
            </div>

            <div className="mt-10">
              <DropZone onFileSelect={handleFileSelect} isProcessing={false} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <FeatureItem 
                icon={<ImageIcon className="w-5 h-5 text-blue-600" />}
                title="Chytrá komprese"
                desc="Automatické nastavení kvality pro dosažení cílové velikosti 300KB."
              />
              <FeatureItem 
                icon={<Zap className="w-5 h-5 text-blue-600" />}
                title="Bleskově rychle"
                desc="Vše běží lokálně ve vašem prohlížeči. Žádné nahrávání na server."
              />
              <FeatureItem 
                icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
                title="AI Analýza"
                desc="Volitelně využijte Gemini AI pro vygenerování popisku (alt text)."
              />
            </div>
          </div>
        )}

        {state === AppState.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <Zap className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700">Optimalizuji obrázek...</h2>
            <p className="text-slate-500">Hledám nejlepší poměr mezi kvalitou a velikostí.</p>
          </div>
        )}

        {state === AppState.DONE && result && (
          <ResultCard data={result} onReset={handleReset} />
        )}

        {state === AppState.ERROR && (
          <div className="text-center py-20 space-y-4">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
               <ShieldCheck className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold text-slate-800">Něco se pokazilo</h2>
             <p className="text-slate-500">{error}</p>
             <button 
               onClick={handleReset}
               className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
             >
               Zkusit znovu
             </button>
          </div>
        )}

      </main>
    </div>
  );
};

const FeatureItem: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({icon, title, desc}) => (
  <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default App;
