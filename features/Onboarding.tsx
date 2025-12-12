import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Smartphone, CreditCard, Train, HeartPulse, Check, ArrowRight, Globe } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, setLanguage, currentLanguage }) => {
  const [step, setStep] = useState(1);
  const t = TRANSLATIONS[currentLanguage];

  // STEP 1: Language Selection
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-6">
              O
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Select Language</h1>
            <p className="text-gray-500 mt-2">Choose your preferred language</p>
          </div>

          <div className="space-y-3">
            {Object.values(Language).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                  currentLanguage === lang
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                    : 'border-gray-100 bg-white text-gray-700 hover:border-orange-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Globe size={20} className={currentLanguage === lang ? 'text-orange-500' : 'text-gray-400'} />
                  <span className="font-bold">{lang}</span>
                </div>
                {currentLanguage === lang && <Check size={20} className="text-orange-500" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition-all flex items-center justify-center space-x-2"
        >
          <span>{t.btn_continue}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // STEP 2: Product Introduction
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 animate-in slide-in-from-right duration-500">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-orange-200 mb-8 transform -rotate-3">
            O
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.ob_step2_title}</h1>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-xs mx-auto">
            {t.ob_step2_desc}
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Smartphone className="text-orange-600" size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.ob_feat_esim}</span>
              <Check size={12} className="text-green-500 mt-1" />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <CreditCard className="text-blue-600" size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.ob_feat_bank}</span>
              <Check size={12} className="text-green-500 mt-1" />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Train className="text-purple-600" size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.ob_feat_navigo}</span>
              <Check size={12} className="text-green-500 mt-1" />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <HeartPulse className="text-green-600" size={20} />
              </div>
              <span className="text-xs font-bold text-gray-800">{t.ob_feat_caf}</span>
              <Check size={12} className="text-green-500 mt-1" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(3)}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center space-x-2"
        >
          <span>{t.btn_continue}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // STEP 3: Roadmap Preview
  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col p-6 animate-in slide-in-from-right duration-500">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-4">{t.ob_step3_title}</h1>
          <p className="text-gray-500 mb-8">We have mapped out everything you need.</p>

          <div className="relative space-y-0 pl-4">
             {/* Vertical Line */}
             <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-gray-200"></div>

             {/* Item 1 */}
             <div className="relative flex items-start mb-8 group">
               <div className="w-6 h-6 rounded-full bg-orange-500 border-4 border-white shadow-md z-10 flex-shrink-0 mr-4"></div>
               <div>
                 <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mb-1">{t.ob_day1}</span>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-64">
                    <h3 className="font-bold text-gray-900">{t.ob_feat_esim}</h3>
                    <p className="text-xs text-gray-400 mt-1">Connectivity & Internet</p>
                 </div>
               </div>
             </div>

             {/* Item 2 */}
             <div className="relative flex items-start mb-8 group">
               <div className="w-6 h-6 rounded-full bg-gray-300 border-4 border-white shadow-sm z-10 flex-shrink-0 mr-4"></div>
               <div>
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.ob_day3}</span>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-64 opacity-80">
                    <h3 className="font-bold text-gray-900">{t.ob_feat_bank}</h3>
                    <p className="text-xs text-gray-400 mt-1">Account & Payments</p>
                 </div>
               </div>
             </div>

             {/* Item 3 */}
             <div className="relative flex items-start mb-8 group">
               <div className="w-6 h-6 rounded-full bg-gray-300 border-4 border-white shadow-sm z-10 flex-shrink-0 mr-4"></div>
               <div>
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.ob_week1}</span>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-64 opacity-60">
                    <h3 className="font-bold text-gray-900">{t.ob_feat_navigo}</h3>
                 </div>
               </div>
             </div>

             {/* Item 4 */}
             <div className="relative flex items-start group">
               <div className="w-6 h-6 rounded-full bg-gray-300 border-4 border-white shadow-sm z-10 flex-shrink-0 mr-4"></div>
               <div>
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.ob_week2}</span>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-64 opacity-40">
                    <h3 className="font-bold text-gray-900">{t.ob_feat_caf}</h3>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 mt-4"
        >
          <span>{t.btn_start}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return null;
};

export default Onboarding;