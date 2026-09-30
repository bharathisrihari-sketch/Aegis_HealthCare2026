import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  RefreshCw,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { LanguageCode, PHC } from '../types';
import { extractVoiceReport } from '../gemini/client';
import { MEDICINES } from '../engine/config';
import { TRANSLATIONS } from '../i18n/translations';

interface VoiceReportModalProps {
  phc: PHC;
  onClose: () => void;
  onConfirmReport: (data: {
    medicineId: string;
    quantity: number;
    bedsOccupied: number;
    staffPresent: number;
    transcript: string;
  }) => void;
  lang: LanguageCode;
}

export const VoiceReportModal: React.FC<VoiceReportModalProps> = ({
  phc,
  onClose,
  onConfirmReport,
  lang,
}) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    transcript: string;
    medicineId: string;
    medicineName: string;
    quantity: number;
    bedsOccupied: number;
    staffPresent: number;
    confidence: number;
    mode: string;
  } | null>(null);

  const [selectedLang, setSelectedLang] = useState<LanguageCode>(lang || 'hi');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Form edit states
  const [editMedId, setEditMedId] = useState<string>('ors');
  const [editQty, setEditQty] = useState<number>(200);
  const [editBeds, setEditBeds] = useState<number>(phc.beds.occupied);
  const [editStaff, setEditStaff] = useState<number>(phc.staff.presentToday);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.warn('Microphone access denied or unavailable, running synthetic demo audio parser', err);
      // Run synthetic simulation if browser audio permission denied
      simulateVoiceCapture();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const simulateVoiceCapture = async () => {
    setRecording(true);
    setTimeout(async () => {
      setRecording(false);
      setIsExtracting(true);
      const fakeBlob = new Blob(['demo'], { type: 'audio/webm' });
      await processAudio(fakeBlob);
    }, 2000);
  };

  const processAudio = async (blob: Blob) => {
    setIsExtracting(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1] || '';
      const res = await extractVoiceReport(base64Audio, 'audio/webm', selectedLang, phc.id);
      setIsExtracting(false);

      if (res.data) {
        const matchedMed =
          MEDICINES.find((m) => m.id === res.data.medicineId) ||
          MEDICINES.find((m) => m.name.toLowerCase().includes((res.data.medicineName || '').toLowerCase())) ||
          MEDICINES[1]; // ORS default

        setEditMedId(matchedMed.id);
        setEditQty(res.data.quantity || 200);
        setEditBeds(res.data.bedsOccupied || phc.beds.occupied);
        setEditStaff(res.data.staffPresent || phc.staff.presentToday);

        setExtractedData({
          transcript: res.data.transcript,
          medicineId: matchedMed.id,
          medicineName: matchedMed.name,
          quantity: res.data.quantity || 200,
          bedsOccupied: res.data.bedsOccupied || phc.beds.occupied,
          staffPresent: res.data.staffPresent || phc.staff.presentToday,
          confidence: res.data.confidence,
          mode: res.mode,
        });
      }
    };

    reader.readAsDataURL(blob);
  };

  const handleSave = () => {
    onConfirmReport({
      medicineId: editMedId,
      quantity: editQty,
      bedsOccupied: editBeds,
      staffPresent: editStaff,
      transcript: extractedData?.transcript || 'Spoken stock report verified',
    });
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
            <Mic className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-lg text-white">Multilingual Voice-to-Data Entry</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Record spoken update for <strong className="text-white">{phc.name}</strong>
          </p>
        </div>

        {/* Language Selection for Voice */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> Spoken Language:
          </span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 font-semibold focus:outline-none"
          >
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="as">Assamese (অসমীয়া)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Recording Visualizer */}
        <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-4">
          {recording ? (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/50 animate-pulse">
                <Mic className="w-8 h-8" />
              </div>
              <p className="text-xs font-mono text-red-400 animate-pulse">
                Listening & Recording spoken audio in {selectedLang.toUpperCase()}...
              </p>
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 mx-auto shadow-md"
              >
                <Square className="w-4 h-4 fill-white" /> Stop & Process Audio
              </button>
            </div>
          ) : isExtracting ? (
            <div className="space-y-3 py-3">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                Gemini Audio Understanding extracting structured inventory JSON...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={startRecording}
                className="w-16 h-16 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-900/50 transition-transform hover:scale-105"
              >
                <Mic className="w-8 h-8" />
              </button>
              <p className="text-xs text-slate-400">
                Click microphone button to start spoken inventory report
              </p>
            </div>
          )}
        </div>

        {/* MANDATORY Confirm-Before-Save Review Step */}
        {extractedData && (
          <div className="p-4 bg-slate-950 border border-teal-800/80 rounded-xl space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Confirm Extracted Data Before Save
              </span>
              <span className="text-[10px] font-mono px-1.5 bg-teal-950 text-teal-300 border border-teal-800 rounded">
                Confidence: {(extractedData.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 italic text-slate-300">
              "{extractedData.transcript}"
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Medicine Item:</label>
                <select
                  value={editMedId}
                  onChange={(e) => setEditMedId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-2 focus:outline-none"
                >
                  {MEDICINES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Received / Updated Qty:</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-2 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Occupied Beds:</label>
                <input
                  type="number"
                  value={editBeds}
                  onChange={(e) => setEditBeds(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-2 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Present Staff Today:</label>
                <input
                  type="number"
                  value={editStaff}
                  onChange={(e) => setEditStaff(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-2 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors mt-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Verify & Apply to Inventory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
