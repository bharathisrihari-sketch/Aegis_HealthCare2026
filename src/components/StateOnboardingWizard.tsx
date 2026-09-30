import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, ArrowRight, ShieldCheck, Database, Layers, X } from 'lucide-react';

interface StateOnboardingWizardProps {
  onClose: () => void;
  onStateAdded: (stateName: string, code: string) => void;
}

export const StateOnboardingWizard: React.FC<StateOnboardingWizardProps> = ({
  onClose,
  onStateAdded,
}) => {
  const [step, setStep] = useState<number>(1);
  const [newStateName, setNewStateName] = useState<string>('Kerala');
  const [newStateCode, setNewStateCode] = useState<string>('KL');

  const handleFinish = () => {
    onStateAdded(newStateName, newStateCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full text-slate-200 shadow-2xl relative space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600/20 text-teal-400 border border-teal-800/50 rounded-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">State Onboarding Wizard</h3>
            <p className="text-xs text-slate-400">Join a new State Health Mission node to the Federated Control Tower</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono">
          <span className={step >= 1 ? 'text-teal-400 font-bold' : 'text-slate-500'}>1. Data Contract</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={step >= 2 ? 'text-teal-400 font-bold' : 'text-slate-500'}>2. State Profile</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className={step >= 3 ? 'text-teal-400 font-bold' : 'text-slate-500'}>3. Federated Handshake</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> AegisHealth Federated Data Contract
              </div>
              <p className="text-slate-300 leading-relaxed">
                By joining the federated network, the state agrees to host its own local node. The state retains 100% data residency of raw daily consumption logs. Only model parameters (`levelWeight`, `trendWeight`, `seasonalIndices`) are shared during FedAvg aggregation rounds.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              Accept Data Contract & Proceed
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              <label className="block text-slate-400 font-mono">State Name:</label>
              <input
                type="text"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-400 font-mono">2-Letter State Code:</label>
              <input
                type="text"
                value={newStateCode}
                onChange={(e) => setNewStateCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono font-bold"
              />
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              Initialize Node & Continue
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3 text-xs text-center py-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm text-white">Federated Handshake Complete!</div>
            <p className="text-slate-400 font-mono">
              State node <strong className="text-teal-400">{newStateName} ({newStateCode})</strong> successfully registered with 25 simulated PHC units.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 mt-3"
            >
              Complete Onboarding & View Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
