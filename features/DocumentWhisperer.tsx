import React, { useState } from 'react';
import { getDocumentAdvice } from '../services/geminiService';
import { Language, DocumentAdvice } from '../types';
import { MessageSquare, Sparkles, Send, Copy, Zap } from 'lucide-react';

interface DocumentWhispererProps {
  language: Language;
}

const SAMPLE_TEXT = `Bonjour,
Suite à votre demande d'aide au logement, nous avons bien reçu votre dossier.
Cependant, après étude, il s'avère que la pièce jointe "Attestation de loyer" est illisible.
Merci de nous faire parvenir ce document signé par votre bailleur avant le 05/10/2024.
Sans réponse de votre part, vos droits seront suspendus.
Cordialement,
La CAF de Paris`;

const DocumentWhisperer: React.FC<DocumentWhispererProps> = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<DocumentAdvice | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setAdvice(null);
    try {
      const result = await getDocumentAdvice(inputText, language);
      setAdvice(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoText = () => {
      setInputText(SAMPLE_TEXT);
  };

  return (
    <div className="p-4 h-full flex flex-col pb-24">
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-2 right-2 text-white/20 w-24 h-24" />
        <h2 className="text-2xl font-bold mb-2 relative z-10">Document Whisperer</h2>
        <p className="text-white/90 text-sm relative z-10">
          Paste that confusing email from CAF or the Bank. We'll tell you exactly what to do.
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div className="relative">
          <textarea
            className="w-full h-40 p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm shadow-sm bg-white"
            placeholder="Paste French text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <div className="absolute bottom-3 left-3">
              <button 
                onClick={fillDemoText}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full flex items-center transition-colors"
              >
                  <Zap size={12} className="mr-1 fill-yellow-500 text-yellow-500" />
                  Try Demo Text
              </button>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading || !inputText}
            className={`absolute bottom-3 right-3 p-3 rounded-xl shadow-lg transition-all ${
              loading || !inputText ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105'
            }`}
          >
            {loading ? <Sparkles className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>

        {advice && (
          <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500 pb-10">
            {/* Summary Card */}
            <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
              <div className="flex items-center mb-2">
                <Sparkles className="text-orange-500 mr-2" size={18} />
                <h3 className="font-bold text-gray-900">Summary</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{advice.summary}</p>
            </div>

            {/* Action Items */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Action Items</h3>
              <ul className="space-y-3">
                {advice.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

             {/* Translation Toggle (Simple for now) */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-xs font-bold text-gray-400 uppercase">Original Translation</h4>
                 <Copy size={14} className="text-gray-400" />
               </div>
               <p className="text-sm text-gray-600 italic">
                 "{advice.translatedText}"
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentWhisperer;