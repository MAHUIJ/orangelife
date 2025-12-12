
import React, { useState, useEffect } from 'react';
import { AssistantMode, SmartAssistantResult, Language } from '../types';
import { analyzeAssistantContent } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { 
  Shield, FileText, Upload, Sparkles, Send, 
  AlertTriangle, CheckCircle, ExternalLink, Zap, 
  ChevronRight, Clock, History, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

interface SmartAssistantProps {
  language: Language;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [mode, setMode] = useState<AssistantMode | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartAssistantResult | null>(null);
  const [history, setHistory] = useState<SmartAssistantResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sa_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalyze = async () => {
    if ((!inputContent && !selectedFile) || !mode) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeAssistantContent(mode, selectedFile || inputContent, language);
      setResult(res);
      
      // Save to history
      const newHistory = [res, ...history].slice(0, 3);
      setHistory(newHistory);
      localStorage.setItem('sa_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setMode(null);
    setResult(null);
    setInputContent('');
    setSelectedFile(null);
  };

  // --- RENDER: MENU MODE ---
  if (!mode) {
    return (
      <div className="p-4 h-full flex flex-col pb-24 animate-in fade-in duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.sa_title}</h2>
          <p className="text-gray-500">{t.sa_subtitle}</p>
        </div>

        <div className="space-y-4">
          {/* Admin Card */}
          <button 
            onClick={() => setMode('administrative')}
            className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
              <FileText className="text-blue-600" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{t.sa_mode_admin}</h3>
              <p className="text-sm text-gray-500">{t.sa_mode_admin_desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-600" />
          </button>

          {/* Safety Card */}
          <button 
            onClick={() => setMode('safety')}
            className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center text-left hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-orange-100 transition-colors">
              <Shield className="text-orange-600" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{t.sa_mode_safety}</h3>
              <p className="text-sm text-gray-500">{t.sa_mode_safety_desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-orange-600" />
          </button>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <History size={14} className="mr-2" />
              {t.sa_history}
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center shadow-sm opacity-75">
                  <div className={`w-2 h-2 rounded-full mr-3 ${item.type === 'safety' ? (item.risk_level === 'high' ? 'bg-red-500' : 'bg-green-500') : 'bg-blue-500'}`}></div>
                  <p className="text-xs text-gray-600 truncate flex-1">
                    {item.summary || item.explanation?.slice(0, 40) + '...'}
                  </p>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: INPUT & RESULT MODE ---
  return (
    <div className="p-4 h-full flex flex-col pb-24 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={resetFlow} className="mr-3 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'administrative' ? t.sa_mode_admin : t.sa_mode_safety}
          </h2>
        </div>
      </div>

      {/* RESULT VIEW */}
      {result ? (
        <div className="flex-1 overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-300 pb-20">
          
          {/* SAFETY RESULT */}
          {result.type === 'safety' && (
            <>
              <div className={`p-6 rounded-3xl text-center ${
                result.risk_level === 'high' ? 'bg-red-500 text-white' : 
                result.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {result.risk_level === 'high' ? <AlertTriangle size={48} className="mx-auto mb-2" /> : <Shield size={48} className="mx-auto mb-2" />}
                <h3 className="text-2xl font-bold uppercase tracking-wider">
                  {result.risk_level === 'high' ? t.sa_risk_high : result.risk_level === 'medium' ? t.sa_risk_medium : t.sa_risk_low}
                </h3>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">{t.sa_section_analysis}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-lg">
                <h4 className="font-bold mb-2 flex items-center"><Shield size={16} className="mr-2" /> {t.sa_section_advice}</h4>
                <p className="text-sm opacity-90">{result.advice}</p>
              </div>

              {result.official_link && (
                <a href={result.official_link.url} target="_blank" rel="noreferrer" className="block bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between text-blue-700 hover:bg-blue-100 transition-colors">
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-400">{t.sa_safe_link}</span>
                    <p className="font-bold">{result.official_link.name}</p>
                  </div>
                  <ExternalLink size={20} />
                </a>
              )}
            </>
          )}

          {/* ADMIN RESULT */}
          {result.type === 'administrative' && (
            <>
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                <div className="flex items-start mb-3">
                  <Sparkles className="text-blue-600 mr-2 mt-1" size={20} />
                  <h3 className="font-bold text-gray-900 text-lg">{t.sa_doc_summary}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                {result.deadline && (
                  <div className="mt-4 inline-flex items-center bg-white px-3 py-1 rounded-lg text-sm text-red-600 font-bold border border-red-100">
                    <Clock size={14} className="mr-2" />
                    {t.sa_deadline}: {result.deadline}
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">{t.actions}</h4>
                <div className="space-y-4">
                  {result.steps?.map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.official_links?.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between text-gray-700 hover:bg-gray-100 transition-colors">
                  <span className="font-bold">{link.name}</span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </>
          )}

          <button 
            onClick={resetFlow} 
            className="w-full py-4 mt-6 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200"
          >
            {t.sa_btn_another}
          </button>
        </div>
      ) : (
        /* INPUT FORM */
        <div className="flex-1 flex flex-col relative">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 mb-20 relative">
            <textarea
              className="w-full h-full p-6 text-lg focus:outline-none resize-none placeholder:text-gray-300"
              placeholder={t.sa_input_placeholder}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
            />
            
            {selectedFile && (
              <div className="absolute bottom-4 left-4 bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center shadow-sm">
                <ImageIcon size={16} className="mr-2" />
                {selectedFile.name}
                <button onClick={() => setSelectedFile(null)} className="ml-2 text-orange-400 hover:text-orange-700">×</button>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center space-x-3 bg-gray-50 pt-2 pb-4">
            <label className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 hover:text-orange-500 transition-colors shadow-sm">
              <Upload size={24} />
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
            </label>

            {/* DEMO BUTTON */}
            <button 
              onClick={() => setInputContent(mode === 'administrative' ? "Bonjour, veuillez nous envoyer votre attestation de loyer avant le 05/10." : "URGENT: Cliquez ici pour renouveler votre carte vitale ameli-renouvellement.com")}
              className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-yellow-600 font-bold text-xs flex flex-col items-center justify-center hover:bg-yellow-100"
            >
              <Zap size={16} className="mb-1" />
              {t.sa_demo_btn}
            </button>

            <button
              onClick={handleAnalyze}
              disabled={loading || (!inputContent && !selectedFile)}
              className={`flex-1 p-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all ${
                loading || (!inputContent && !selectedFile) ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? <Sparkles className="animate-spin" /> : <Send />}
              <span>{t.sa_analyze_btn}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAssistant;
