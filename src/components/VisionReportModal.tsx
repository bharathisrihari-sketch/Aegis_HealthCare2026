import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  FileImage,
  Layers,
} from 'lucide-react';
import { LanguageCode, PHC } from '../types';
import { extractStockPhoto } from '../gemini/client';
import { MEDICINES } from '../engine/config';
import { TRANSLATIONS } from '../i18n/translations';

interface VisionReportModalProps {
  phc: PHC;
  onClose: () => void;
  onConfirmVisionItems: (items: { medicineId: string; count: number }[]) => void;
  lang: LanguageCode;
}

export const VisionReportModal: React.FC<VisionReportModalProps> = ({
  phc,
  onClose,
  onConfirmVisionItems,
  lang,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedItems, setExtractedItems] = useState<{
    items: { name: string; count: number; matchedId?: string }[];
    mode: string;
  } | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      const base64Str = dataUrl.split(',')[1] || '';

      setIsAnalyzing(true);
      const res = await extractStockPhoto(base64Str, file.type);
      setIsAnalyzing(false);

      if (res.data) {
        setExtractedItems({
          items: res.data.items,
          mode: res.mode,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplySampleImage = async () => {
    // Generate simple placeholder image URL and analyze
    setIsAnalyzing(true);
    const res = await extractStockPhoto('', 'image/jpeg');
    setIsAnalyzing(false);

    if (res.data) {
      setSelectedImage('sample_stock_register.jpg');
      setExtractedItems({
        items: res.data.items,
        mode: res.mode,
      });
    }
  };

  const handleConfirm = () => {
    if (!extractedItems) return;
    const itemsToApply = extractedItems.items.map((it) => ({
      medicineId: it.matchedId || 'ors',
      count: it.count,
    }));
    onConfirmVisionItems(itemsToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-lg text-white">Stock Register / Shelf Vision Extraction</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload photo of shelf or physical log register for <strong className="text-white">{phc.name}</strong>
          </p>
        </div>

        {/* Upload Zone */}
        <div className="p-6 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center space-y-3">
          <FileImage className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">
            Drag & drop stock register photo or click to browse
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer border border-slate-700">
              <Upload className="w-3.5 h-3.5 inline mr-1.5" /> Upload File
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              onClick={handleApplySampleImage}
              className="px-3 py-2 bg-teal-950 text-teal-300 border border-teal-800 text-xs font-semibold rounded-lg hover:bg-teal-900"
            >
              Use Sample Register Photo
            </button>
          </div>
        </div>

        {/* Analysis Spinner */}
        {isAnalyzing && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2 text-xs">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-slate-400">Gemini Multimodal Vision parsing handwriting & shelf boxes...</p>
          </div>
        )}

        {/* Extracted Review Table */}
        {extractedItems && !isAnalyzing && (
          <div className="p-4 bg-slate-950 border border-teal-800/80 rounded-xl space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Extracted Medicine Counts
              </span>
              <span className="text-[10px] font-mono px-1.5 bg-teal-950 text-teal-300 border border-teal-800 rounded">
                Mode: {extractedItems.mode.toUpperCase()}
              </span>
            </div>

            <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
              {extractedItems.items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between font-mono">
                  <span className="text-white">{it.name}</span>
                  <span className="font-bold text-teal-400">{it.count} units</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors mt-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Apply Extracted Counts to PHC Inventory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
