
import React from 'react';
import { AppView, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { LayoutDashboard, Smartphone, CreditCard, Sparkles, User } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  language: Language;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, language }) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    { view: AppView.DASHBOARD, label: t.dashboard, icon: <LayoutDashboard size={20} /> },
    { view: AppView.ESIM, label: t.esim, icon: <Smartphone size={20} /> },
    { view: AppView.ASSISTANT, label: t.assistant, icon: <Sparkles size={24} className="text-orange-500 fill-orange-100" /> }, // Center Highlight
    { view: AppView.BANKING, label: t.banking, icon: <CreditCard size={20} /> },
    { view: AppView.PROFILE, label: t.profile, icon: <User size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-safe z-50 shadow-lg">
      <div className="flex justify-between items-end max-w-md mx-auto relative">
        {navItems.map((item, index) => {
          const isCenter = index === 2; // Assistant is center
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                currentView === item.view ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              } ${isCenter ? '-mt-6' : ''}`} // Bump up center icon
            >
              {isCenter ? (
                <div className={`p-3 rounded-full shadow-lg ${currentView === item.view ? 'bg-orange-100 border-2 border-orange-500' : 'bg-white border border-gray-100'}`}>
                   {item.icon}
                </div>
              ) : (
                item.icon
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
