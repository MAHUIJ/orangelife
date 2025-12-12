
import React from 'react';
import { RoadmapStep, AppView, Language, Alert } from '../types';
import { TRANSLATIONS } from '../constants';
import { Smartphone, CreditCard, Train, Home, HeartPulse, ArrowRight, Bell, AlertCircle, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  steps: RoadmapStep[];
  language: Language;
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ steps, language, setView }) => {
  const t = TRANSLATIONS[language];
  const userName = localStorage.getItem('user_name') || "Nuonuo"; // Mock user name
  const completedCount = steps.filter(s => s.status === 'completed').length;
  
  // Find Next Action
  const nextStep = steps.find(s => s.status !== 'completed') || steps[steps.length - 1];

  const handleStepClick = (stepId: string) => {
    if (stepId === 'esim') setView(AppView.ESIM);
    if (stepId === 'bank') setView(AppView.BANKING);
  };

  // Format date based on language
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const localeMap: Record<Language, string> = {
      [Language.EN]: 'en-US',
      [Language.FR]: 'fr-FR',
      [Language.CN]: 'zh-CN',
      [Language.KR]: 'ko-KR',
      [Language.JP]: 'ja-JP'
  };
  const currentDate = new Date().toLocaleDateString(localeMap[language], dateOptions);

  return (
    <div className="flex flex-col w-full space-y-6 animate-in fade-in duration-500 px-4 pb-32">
      
      {/* A. Header Greeting (Simplified - Profile Icon removed as Global Header is now visible) */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.dash_hello}, {userName}</h1>
          <p className="text-gray-500 text-sm capitalize">{currentDate}</p>
        </div>
      </div>

      {/* B. Current Stage (Clean & Flexible) */}
      <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-visible shadow-xl h-auto min-h-[fit-content] shrink-0 w-full">
        {/* Background Blur constrained to card bounds via separate div if needed, but allowing card to grow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-full blur-[60px] opacity-20 pointer-events-none overflow-hidden rounded-3xl"></div>
        
        <div className="relative z-10 flex justify-between items-center w-full">
             <div className="flex-1 min-w-0 pr-4">
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 opacity-80">{t.dash_stage_title}</p>
               <h2 className="text-4xl font-bold tracking-tight text-white truncate">
                 1 <span className="text-2xl text-gray-500 font-normal">/ 90</span>
               </h2>
             </div>
             {/* Progress Circle - Flex shrink 0 prevents squashing */}
             <div className="w-16 h-16 rounded-full border-4 border-orange-500 flex items-center justify-center font-bold text-lg bg-gray-800 shadow-lg flex-shrink-0">
               {Math.round((completedCount / steps.length) * 100)}%
             </div>
        </div>
      </div>

      {/* C. Next Action */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <ArrowRight className="w-5 h-5 mr-2 text-orange-500" />
          {t.dash_next_action}
        </h3>
        <div 
          onClick={() => handleStepClick(nextStep.id)}
          className="bg-white p-5 rounded-2xl shadow-sm border border-orange-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-95 group h-auto"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors flex-shrink-0">
               {nextStep.id === 'esim' && <Smartphone className="text-orange-600" />}
               {nextStep.id === 'bank' && <CreditCard className="text-orange-600" />}
               {nextStep.id === 'navigo' && <Train className="text-orange-600" />}
               {nextStep.id === 'caf' && <Home className="text-orange-600" />}
               {nextStep.id === 'ameli' && <HeartPulse className="text-orange-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 truncate">{nextStep.title}</h4>
              <p className="text-xs text-gray-500 truncate">{nextStep.description}</p>
            </div>
          </div>
          <button className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm shadow-orange-200 ml-2 flex-shrink-0">
            {t.dash_start_btn}
          </button>
        </div>
      </div>

      {/* D. Alerts */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-gray-400" />
          {t.dash_alerts}
        </h3>
        <div className="space-y-3">
          {t.alerts.map((alert: Alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-2xl border-l-4 shadow-sm flex items-start justify-between h-auto ${
                alert.type === 'security' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-400'
              }`}
            >
              <div className="flex items-start flex-1 min-w-0">
                <div className="mr-3 mt-1 flex-shrink-0">
                  {alert.type === 'security' 
                    ? <AlertTriangle size={20} className="text-red-500" />
                    : <AlertCircle size={20} className="text-yellow-600" />
                  }
                </div>
                <div className="min-w-0">
                  <h4 className={`font-bold text-sm truncate ${alert.type === 'security' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {alert.title}
                  </h4>
                  <p className={`text-xs mt-1 line-clamp-2 ${alert.type === 'security' ? 'text-red-600' : 'text-yellow-700'}`}>
                    {alert.description}
                  </p>
                  {alert.date && <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{t.sa_deadline}: {alert.date}</p>}
                </div>
              </div>
              {alert.actionLabel && (
                <button 
                    onClick={() => setView(AppView.ASSISTANT)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg ml-2 flex-shrink-0 ${
                    alert.type === 'security' 
                        ? 'bg-white text-red-600 border border-red-100' 
                        : 'bg-white text-yellow-700 border border-yellow-100'
                    }`}
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
