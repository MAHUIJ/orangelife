
import React from 'react';
import { Language, AppView } from '../types';
import { TRANSLATIONS } from '../constants';
import { ChevronLeft, ExternalLink, HelpCircle, ShieldAlert, BookOpen } from 'lucide-react';

interface HelpCenterProps {
  language: Language;
  setView: (view: AppView) => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ language, setView }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20 animate-in slide-in-from-right">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center">
        <button 
          onClick={() => setView(AppView.PROFILE)} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t.help_title}</h1>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Official Links */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
             <ExternalLink size={14} className="mr-2" />
             {t.help_official_links}
          </h2>
          <div className="grid grid-cols-1 gap-3">
             {t.help_links.map((link, idx) => (
               <a 
                 key={idx} 
                 href={link.url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-all group"
               >
                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">{link.icon}</span>
                   <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{link.name}</span>
                 </div>
                 <ExternalLink size={18} className="text-gray-300 group-hover:text-orange-500" />
               </a>
             ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
             <HelpCircle size={14} className="mr-2" />
             {t.help_faq}
          </h2>
          <div className="space-y-3">
            {t.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Tip */}
        <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex items-start space-x-4">
           <ShieldAlert className="text-orange-500 flex-shrink-0" size={24} />
           <div>
             <h3 className="font-bold text-orange-800 text-sm mb-1">{t.help_safety_title}</h3>
             <p className="text-xs text-orange-700 leading-relaxed">
               {t.help_safety_desc}
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
