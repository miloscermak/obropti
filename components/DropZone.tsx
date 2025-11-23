import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, FileWarning } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Prosím nahrajte pouze soubor obrázku (JPG, PNG).');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      onClick={() => !isProcessing && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-2xl mx-auto h-64 
        border-2 border-dashed rounded-2xl 
        flex flex-col items-center justify-center 
        transition-all duration-300 cursor-pointer
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
        ${isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center space-y-4 p-6 text-center">
        <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-slate-100'}`}>
          {isDragOver ? (
            <UploadCloud className="w-10 h-10 text-blue-600" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-700">
            {isDragOver ? 'Pusťte obrázek sem' : 'Klikněte nebo přetáhněte obrázek'}
          </h3>
          <p className="text-sm text-slate-500">
            Podporujeme JPG, PNG do velikosti 20 MB
          </p>
        </div>
      </div>
    </div>
  );
};
