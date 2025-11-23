import React, { useState } from 'react';
import { OptimizedImage } from '../types';
import { formatBytes } from '../utils/compression';
import { Download, RefreshCw, Sparkles, Check, ArrowRight } from 'lucide-react';
import { generateImageDescription } from '../services/geminiService';

interface ResultCardProps {
  data: OptimizedImage;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [altText, setAltText] = useState<string | null>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.optimizedPreview;
    link.download = `optimized-${data.name.replace(/\.[^/.]+$/, "")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateAltText = async () => {
    if (isGenerating || altText) return;
    setIsGenerating(true);
    const text = await generateImageDescription(data.optimizedBlob);
    setAltText(text);
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      
      {/* Comparison View */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Original */}
          <div className="p-6 space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase bg-slate-200 rounded-full">
                Původní
              </span>
              <span className="text-sm font-medium text-slate-600">{formatBytes(data.originalSize)}</span>
            </div>
            <div className="relative aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
              <img src={data.originalPreview} alt="Original" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Optimized */}
          <div className="p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 text-xs font-bold tracking-wider text-green-600 uppercase bg-green-100 rounded-full">
                Optimalizovaný
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-600">
                  -{data.compressionRatio.toFixed(0)}%
                </span>
                <span className="text-sm font-bold text-slate-800">{formatBytes(data.optimizedSize)}</span>
              </div>
            </div>
            <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-green-200 ring-4 ring-green-50/50">
              <img src={data.optimizedPreview} alt="Optimized" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium w-full md:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nahrát jiný
          </button>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* AI Feature */}
            <div className="relative group">
               <button
                onClick={handleGenerateAltText}
                disabled={isGenerating || !!altText}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium w-full md:w-auto border transition-all
                  ${altText 
                    ? 'bg-purple-50 text-purple-700 border-purple-200 cursor-default' 
                    : 'bg-white text-slate-700 border-slate-300 hover:border-purple-400 hover:text-purple-600 hover:shadow-sm'}
                `}
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                ) : altText ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                )}
                {altText ? 'Popis vygenerován' : 'AI Analýza'}
              </button>
              
              {/* Tooltip / Result for AI */}
              {altText && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-10">
                  <p className="mb-1 font-semibold text-purple-300">Gemini popis:</p>
                  {altText}
                  <div className="absolute top-full right-6 border-8 border-transparent border-t-slate-800"></div>
                </div>
              )}
            </div>

            <button 
              onClick={handleDownload}
              className="flex items-center justify-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-95 text-sm font-medium w-full md:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Stáhnout ({formatBytes(data.optimizedSize)})
            </button>
          </div>
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="mt-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <span>Optimalizováno pro web</span>
        <ArrowRight className="w-3 h-3" />
        <span>JPG formát</span>
        <span className="w-1 h-1 rounded-full bg-slate-400 mx-1"></span>
        <span>Max 1920px</span>
      </div>
    </div>
  );
};
