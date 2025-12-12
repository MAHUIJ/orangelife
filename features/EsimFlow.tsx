
import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, CheckCircle2, QrCode, ArrowRight, Store, CreditCard, Shield, Signal, Euro, RefreshCcw, Download, History, Zap, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface EsimFlowProps {
  onComplete: () => void;
  onRegisterUser: (phone: string) => void;
}

type FlowState = 'intro' | 'checking' | 'compatible' | 'activating' | 'success' | 'incompatible' | 'manual_entry' | 'tracking';

const EsimFlow: React.FC<EsimFlowProps> = ({ onComplete, onRegisterUser }) => {
  // Initialize state from local storage or default to 'intro'
  const [state, setState] = useState<FlowState>(() => {
    const saved = localStorage.getItem('esim_persist_state');
    return saved ? (JSON.parse(saved).status as FlowState) : 'intro';
  });

  const [forceIncompatible, setForceIncompatible] = useState(false);
  const [passportNum, setPassportNum] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showAccountToast, setShowAccountToast] = useState(false);
  
  // Initialize manual number from local storage
  const [manualNumber, setManualNumber] = useState(() => {
    const saved = localStorage.getItem('esim_persist_state');
    return saved ? JSON.parse(saved).number : '';
  });
  
  // Get Language
  const langStr = localStorage.getItem('app_language') as Language || Language.EN;
  const t = TRANSLATIONS[langStr];

  // Helper to persist state
  const persistState = (newState: FlowState, number: string = '') => {
    setState(newState);
    if (newState === 'success' || newState === 'tracking') {
        localStorage.setItem('esim_persist_state', JSON.stringify({ status: newState, number }));
    }
  };

  // Step 1: Start -> Check
  const startCheck = () => {
    setState('checking');
  };

  // Step 2: Simulate Auto Detection
  useEffect(() => {
    if (state === 'checking') {
      const timer = setTimeout(() => {
        if (forceIncompatible) {
          setState('incompatible');
        } else {
          setState('compatible');
        }
      }, 2500); // 2.5s Simulation
      return () => clearTimeout(timer);
    }
  }, [state, forceIncompatible]);

  // Step 4: Simulate Activation
  const handleActivation = () => {
    if (!passportNum) return;
    setState('activating');
  };

  useEffect(() => {
    if (state === 'activating') {
      const timer = setTimeout(() => {
        // Automatically save success state
        const mockNumber = '06 12 34 56 78';
        setManualNumber(mockNumber);
        persistState('success', mockNumber);
        setShowSuccessBanner(true);
        
        // Auto-Register User
        onRegisterUser(mockNumber);
        setShowAccountToast(true);

        // Delay navigation slightly so user sees the success state
        setTimeout(() => {
            onComplete();
        }, 1500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Auto-hide banners
  useEffect(() => {
    if (showSuccessBanner) {
        const timer = setTimeout(() => setShowSuccessBanner(false), 4000);
        return () => clearTimeout(timer);
    }
  }, [showSuccessBanner]);

  useEffect(() => {
    if (showAccountToast) {
        const timer = setTimeout(() => setShowAccountToast(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [showAccountToast]);

  const handleManualEntry = () => {
    setState('manual_entry');
  };

  const startTracking = () => {
    if (manualNumber.length > 8) {
        persistState('tracking', manualNumber);
        onRegisterUser(manualNumber);
        onComplete();
    }
  };

  // --- RENDERERS ---

  if (state === 'intro') {
    return (
      <div className="flex flex-col h-full p-6 pt-10 animate-in slide-in-from-right duration-300">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
            <Smartphone size={32} className="text-white/90" />
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Wifi size={16} className="text-white" />
                <span className="text-xs font-bold">5G</span>
            </div>
            </div>
            <h2 className="text-3xl font-bold mb-1 relative z-10">Orange Holiday</h2>
            <p className="text-white/80 relative z-10">50GB Data • Calls & SMS included</p>
        </div>

        <div className="flex-1 space-y-4">
          <button 
            onClick={startCheck}
            className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{t.esim_start}</span>
            <ArrowRight size={20} />
          </button>

          <button 
            onClick={handleManualEntry}
            className="w-full py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
          >
            <CreditCard size={18} className="text-gray-400" />
            <span>{t.esim_already_have}</span>
          </button>

          {/* DEMO CONTROL */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${forceIncompatible ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                {forceIncompatible && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={forceIncompatible} 
                onChange={() => setForceIncompatible(!forceIncompatible)}
                className="hidden" 
              />
              <span className="text-xs text-gray-400 font-medium group-hover:text-orange-500 transition-colors">
                [Demo] Simulate Incompatible Device
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'manual_entry') {
    return (
        <div className="flex flex-col h-full p-6 pt-10 animate-in slide-in-from-right duration-300">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.esim_track_usage}</h2>
                <p className="text-gray-500">{t.esim_enter_number}</p>
            </div>
            <div className="flex-1">
                <input 
                    type="tel" 
                    value={manualNumber}
                    onChange={(e) => setManualNumber(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full p-5 border border-gray-300 rounded-2xl text-2xl font-mono text-center tracking-widest focus:ring-2 focus:ring-orange-500 outline-none mb-6"
                />
            </div>
            <button 
                onClick={startTracking}
                disabled={manualNumber.length < 8}
                className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                    manualNumber.length < 8 ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
            >
                <span>{t.esim_track_usage}</span>
                <ArrowRight size={20} />
            </button>
        </div>
    );
  }

  if (state === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-orange-100 rounded-full animate-ping absolute top-0 left-0"></div>
          <div className="w-24 h-24 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <Smartphone className="w-10 h-10 text-gray-400 absolute top-7 left-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.esim_checking}</h2>
        <div className="bg-gray-100 rounded-full px-4 py-1">
          <p className="text-xs text-gray-500 font-mono">Model: iPhone 14 Pro • iOS 17.2</p>
        </div>
      </div>
    );
  }

  if (state === 'compatible') {
    return (
      <div className="p-6 h-full flex flex-col pt-10 animate-in slide-in-from-right duration-300">
        <div className="mb-8 bg-green-50 border border-green-100 p-4 rounded-xl flex items-start">
            <CheckCircle2 className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-green-800 text-lg mb-1">Success</h3>
              <p className="text-sm text-green-700">{t.esim_compatible}</p>
            </div>
        </div>

        <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.esim_passport_label}</label>
            <input 
                type="text" 
                value={passportNum}
                onChange={(e) => setPassportNum(e.target.value.toUpperCase())}
                placeholder="E.g. G12345678"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-lg uppercase mb-4"
            />
            <p className="text-xs text-gray-400 flex items-center bg-gray-50 p-3 rounded-lg">
                <Shield size={12} className="mr-2" /> 
                ID verification required by French Law (Arcep)
            </p>
        </div>

        <button 
            onClick={handleActivation}
            disabled={passportNum.length < 5}
            className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                passportNum.length < 5 ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <span>{t.esim_activate}</span>
            <ArrowRight size={20} />
          </button>
      </div>
    );
  }

  if (state === 'activating') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="relative mb-8">
           {/* Scan Line Animation */}
           <div className="w-64 h-64 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative">
              <QrCode className="text-white/20 w-full h-full p-10" />
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] animate-[scan_2s_linear_infinite]"></div>
           </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mt-4">{t.esim_activating}</h2>
        <p className="text-gray-400 mt-2">{t.esim_connecting}</p>
      </div>
    );
  }

  // Unified Success / Tracking Dashboard
  if (state === 'success' || state === 'tracking') {
    const displayNum = manualNumber || "06 12 34 56 78";
    
    return (
      <div className="flex flex-col h-full p-6 animate-in fade-in zoom-in duration-500 pb-24 relative">
        {/* Transient Success Banner */}
        {showSuccessBanner && (
            <div className="text-center mb-6 animate-out fade-out slide-out-to-top duration-700 absolute top-0 left-0 right-0 z-50 pointer-events-none p-4">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-flex items-center shadow-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-bold">{t.esim_success}</span>
                </div>
            </div>
        )}
        
        {/* Account Created Toast */}
        {showAccountToast && (
             <div className="text-center mb-6 animate-out fade-out slide-out-to-top duration-1000 absolute top-14 left-0 right-0 z-40 pointer-events-none p-4">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-flex items-center shadow-lg border border-blue-200 text-xs">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="font-bold">{t.esim_account_created}</span>
                </div>
            </div>
        )}

        {/* Plan Dashboard */}
        <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden mt-8">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-[60px] opacity-30"></div>
             
             <div className="flex justify-between items-start mb-6">
                 <div>
                     <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">{t.qa_num}</p>
                     <p className="font-mono text-2xl font-bold tracking-widest">{displayNum}</p>
                 </div>
                 <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                     <Signal size={12} className="mr-1" /> 5G
                 </div>
             </div>

             <div className="space-y-4">
                 <div>
                     <div className="flex justify-between text-sm mb-2">
                         <span className="text-gray-300">{t.esim_data_left}</span>
                         <span className="font-bold">12.5 GB / 50 GB</span>
                     </div>
                     <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-500 w-[25%]"></div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                            <Euro size={12} className="mr-1" /> {t.esim_balance}
                        </div>
                        <p className="font-bold text-sm">€15.00</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center text-gray-400 text-xs mb-1">
                            <RefreshCcw size={12} className="mr-1" /> {t.esim_renew}
                        </div>
                        <p className="font-bold text-sm">01/01/2025</p>
                    </div>
                 </div>
             </div>
        </div>

        {/* eSIM Management */}
        <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
            <div className="flex items-center">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                    <Download size={20} />
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-sm">{t.esim_redownload}</p>
                    <p className="text-xs text-green-600 font-bold">{t.esim_redownload_available}</p>
                </div>
            </div>
            <ArrowRight size={16} className="text-gray-300" />
        </div>
        
        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                <History className="text-gray-600 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700 text-center">{t.esim_btn_history}</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                <Zap className="text-orange-500 mb-2 fill-orange-500" size={24} />
                <span className="text-xs font-bold text-gray-700 text-center">{t.esim_btn_topup}</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                <Smartphone className="text-blue-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700 text-center">{t.esim_btn_plan}</span>
            </button>
        </div>
      </div>
    );
  }

  if (state === 'incompatible') {
    return (
      <div className="p-6 h-full flex flex-col pt-10 animate-in slide-in-from-right duration-300">
        <div className="mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
             <AlertCircle className="text-red-600" size={24} />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Not Compatible</h2>
           <p className="text-gray-500 text-sm">
             {t.esim_incompatible}
           </p>
        </div>

        <div className="space-y-4 flex-1">
           {/* Option A: Store */}
           <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-200 transition-colors">
              <div className="flex items-start mb-3">
                 <div className="bg-orange-50 p-3 rounded-full mr-3">
                    <Store className="text-orange-600" size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">Orange Store</h4>
                    <p className="text-xs text-gray-500">12 Place de l'Opéra (5 min)</p>
                 </div>
              </div>
              <button className="w-full py-3 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-50 transition-colors">
                {t.esim_store_opt}
              </button>
           </div>

           {/* Option B: Kiosk */}
           <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex items-start mb-3">
                 <div className="bg-blue-50 p-3 rounded-full mr-3">
                    <CreditCard className="text-blue-600" size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">Airport SIM Kiosk</h4>
                    <p className="text-xs text-gray-500">Terminal 2E • Arrivals</p>
                 </div>
              </div>
              <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-black transition-colors">
                {t.esim_kiosk_opt}
              </button>
           </div>
        </div>

        <div className="mt-4 text-center">
            <button 
              onClick={onComplete}
              className="text-gray-400 text-sm hover:text-gray-600 underline"
            >
                {t.esim_skip}
            </button>
        </div>
      </div>
    );
  }

  return null;
};

export default EsimFlow;
