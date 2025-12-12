
import React, { useState } from 'react';
import { User, Globe, Bell, FileText, Download, Shield, HelpCircle, LogOut, Check, ChevronRight, Briefcase, GraduationCap, Plane } from 'lucide-react';
import { Language, UserType, AppView, UserDocument } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProfileProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onResetDemo: () => void;
  setView: (view: AppView) => void;
  documents: UserDocument[];
  userPhone?: string | null;
  userId?: string | null;
  onDeleteAccount: () => void;
}

const Profile: React.FC<ProfileProps> = ({ language, setLanguage, onResetDemo, setView, documents, userPhone, userId, onDeleteAccount }) => {
  const t = TRANSLATIONS[language];
  const [userType, setUserType] = useState<UserType>(UserType.STUDENT);
  const [notifications, setNotifications] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(t.p_downloading_alert);
    }, 2000);
  };

  const handleDelete = () => {
      if (confirm(t.p_delete_confirm)) {
          onDeleteAccount();
      }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 mb-6 flex items-center space-x-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl border-2 border-orange-200">
          G
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.p_guest}</h2>
          <div className="flex flex-col text-xs text-gray-500 mt-1">
             <div className="flex items-center mb-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize mr-2">{userType}</span>
                {userId && <span>ID: {userId}</span>}
             </div>
             {userPhone && (
                 <span className="text-orange-600 font-mono font-bold">{userPhone}</span>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-2">
        {/* Identity Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{t.p_identity}</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             {/* Name Input */}
             <div className="p-4 flex items-center justify-between border-b border-gray-50">
               <div className="flex items-center space-x-3 text-gray-700">
                 <User size={20} />
                 <span className="font-medium">{t.p_name_label}</span>
               </div>
               <input 
                 type="text" 
                 defaultValue={t.p_guest} 
                 className="text-right text-gray-900 font-bold bg-transparent outline-none focus:text-orange-600 w-32" 
               />
             </div>
             
             {/* User Type Selector */}
             <div className="p-4 flex flex-col space-y-3">
               <div className="flex items-center space-x-3 text-gray-700 mb-2">
                 <Briefcase size={20} />
                 <span className="font-medium">{t.p_type}</span>
               </div>
               <div className="grid grid-cols-3 gap-2">
                 {[
                   { type: UserType.STUDENT, icon: <GraduationCap size={16} />, label: t.p_student },
                   { type: UserType.WORKER, icon: <Briefcase size={16} />, label: t.p_worker },
                   { type: UserType.VISITOR, icon: <Plane size={16} />, label: t.p_visitor },
                 ].map((item) => (
                   <button
                     key={item.type}
                     onClick={() => setUserType(item.type)}
                     className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                       userType === item.type 
                         ? 'bg-orange-50 border-orange-200 text-orange-700' 
                         : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     {item.icon}
                     <span className="text-[10px] font-bold mt-1">{item.label}</span>
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{t.p_prefs}</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {/* Language */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Globe size={20} />
                  <span className="font-medium">{t.p_lang}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(Language).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      language === lang 
                        ? 'bg-orange-500 text-white border-orange-500' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setNotifications(!notifications)}>
               <div className="flex items-center space-x-3 text-gray-700">
                  <Bell size={20} />
                  <span className="font-medium">{t.p_notifs}</span>
               </div>
               <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${notifications ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
               </div>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{t.p_docs}</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {documents.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm italic">
                    {t.p_empty_docs}
                </div>
            ) : (
                documents.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${doc.type === 'missing' ? 'bg-red-50' : 'bg-blue-50'}`}>
                        <FileText size={18} className={doc.type === 'missing' ? 'text-red-400' : 'text-blue-500'} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.date}</p>
                    </div>
                    </div>
                    {doc.type === 'missing' ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">{t.p_doc_missing}</span>
                    ) : (
                    <Check size={16} className="text-green-500" />
                    )}
                </div>
                ))
            )}
          </div>
        </section>

        {/* Export Button */}
        <button 
          onClick={handleExport}
          className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-black transition-all"
        >
          {isExporting ? (
             <span className="animate-pulse">...</span>
          ) : (
            <>
              <Download size={20} />
              <span>{t.p_export}</span>
            </>
          )}
        </button>

        {/* Footer Actions */}
        <div className="space-y-1 pt-4">
           <button className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between text-gray-600 hover:bg-gray-50">
             <div className="flex items-center space-x-3">
               <Shield size={20} />
               <span className="font-medium">{t.p_privacy}</span>
             </div>
             <ChevronRight size={16} className="text-gray-300" />
           </button>

           <button 
             onClick={() => setView(AppView.HELP_CENTER)}
             className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between text-gray-600 hover:bg-gray-50"
           >
             <div className="flex items-center space-x-3">
               <HelpCircle size={20} />
               <span className="font-medium">{t.p_help}</span>
             </div>
             <ChevronRight size={16} className="text-gray-300" />
           </button>

           {/* Delete Account */}
           <button 
             onClick={handleDelete}
             className="w-full p-4 mt-4 flex items-center justify-center space-x-2 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-colors border border-red-100"
           >
             <LogOut size={18} />
             <span>{t.p_delete}</span>
           </button>

           {/* Reset Demo (Hidden or Secondary) */}
           <button 
             onClick={onResetDemo}
             className="w-full p-2 text-center text-xs text-gray-300 hover:text-gray-500 mt-2"
           >
             {t.p_reset}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
