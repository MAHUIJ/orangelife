
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './features/Dashboard'; // Replaces Roadmap as main view
import EsimFlow from './features/EsimFlow';
import BankingAssistant from './features/BankingAssistant';
import SmartAssistant from './features/SmartAssistant';
import Onboarding from './features/Onboarding';
import Profile from './features/Profile';
import HelpCenter from './features/HelpCenter';
import { AppView, Language, RoadmapStep, UserDocument, BankDetails, WalletCard } from './types';
import { INITIAL_ROADMAP, TRANSLATIONS } from './constants';
import { Globe, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>(INITIAL_ROADMAP);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Document State (Shared between Banking and Profile)
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);

  // User State
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Bank & Wallet State
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [walletCards, setWalletCards] = useState<WalletCard[]>([]);

  // States
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const t = TRANSLATIONS[language];

  // Initialize App (Splash + LocalStorage)
  useEffect(() => {
    // 1. Simulate Splash Screen
    const splashTimer = setTimeout(() => {
        setShowSplash(false);
    }, 1200);

    // 2. Check Onboarding Status
    const onboardingDone = localStorage.getItem('onboarding_done');
    if (onboardingDone === 'true') {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }

    // 3. Check Saved Language
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && Object.values(Language).includes(savedLang as Language)) {
      setLanguage(savedLang as Language);
    }

    // 4. Check User Data
    const savedPhone = localStorage.getItem('user_phone');
    const savedId = localStorage.getItem('user_id');
    if (savedPhone) setUserPhone(savedPhone);
    if (savedId) setUserId(savedId);

    // 5. Check Bank Details
    const savedBank = localStorage.getItem('bank_details');
    if (savedBank) {
        setBankDetails(JSON.parse(savedBank));
        // Also update step status immediately
        setRoadmapSteps(prev => prev.map(step => 
            step.id === 'bank' ? { ...step, status: 'completed' } : step
        ));
    }
    
    // 6. Check Wallet
    const savedWallet = localStorage.getItem('wallet_cards');
    if (savedWallet) setWalletCards(JSON.parse(savedWallet));
    
    return () => clearTimeout(splashTimer);
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_done', 'true');
    setShowOnboarding(false);
  };

  // Handle Language Change (and save to local storage)
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
  };

  // Handle completion of a step
  const handleStepComplete = (stepId: string) => {
    setRoadmapSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const currentIndex = newSteps.findIndex(s => s.id === stepId);
      
      // Mark current as completed
      if (currentIndex !== -1) {
        newSteps[currentIndex] = { ...newSteps[currentIndex], status: 'completed' };
        
        // Unlock next
        if (currentIndex + 1 < newSteps.length) {
           newSteps[currentIndex + 1] = { ...newSteps[currentIndex + 1], status: 'current' };
        }
      }
      return newSteps;
    });

    // Determine where to navigate
    if (stepId === 'esim') {
        // Stay on ESIM view to show the Usage Dashboard
    } else if (stepId === 'bank') {
        // Stay on Banking view to show the Success state / Wallet
    } else {
        setCurrentView(AppView.DASHBOARD); // Return to hub for other tasks
    }
  };

  const handleRegisterUser = (phone: string) => {
      // Auto-create local user
      const newId = Math.floor(100000 + Math.random() * 900000).toString();
      setUserPhone(phone);
      setUserId(newId);
      localStorage.setItem('user_phone', phone);
      localStorage.setItem('user_id', newId);
  };

  const handleDeleteAccount = () => {
      localStorage.clear();
      // Reload to reset all state
      window.location.reload();
  };

  const handleResetDemo = () => {
      // Keep language preference but clear progress
      const currentLang = localStorage.getItem('app_language');
      localStorage.clear();
      if (currentLang) localStorage.setItem('app_language', currentLang);
      window.location.reload();
  };

  // Add documents (Simulated from Banking)
  const handleAddDocuments = (docs: UserDocument[]) => {
      setUserDocuments(prev => [...prev, ...docs]);
  };

  // Banking State Handlers
  const handleSetBankDetails = (details: BankDetails) => {
      setBankDetails(details);
      localStorage.setItem('bank_details', JSON.stringify(details));
      handleStepComplete('bank');
  };

  const handleAddWalletCard = (card: WalletCard) => {
      const newCards = [...walletCards, card];
      setWalletCards(newCards);
      localStorage.setItem('wallet_cards', JSON.stringify(newCards));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard steps={roadmapSteps} language={language} setView={setCurrentView} />;
      case AppView.ESIM:
        return (
          <EsimFlow 
            onComplete={() => handleStepComplete('esim')} 
            onRegisterUser={handleRegisterUser} 
          />
        );
      case AppView.BANKING:
        return (
          <BankingAssistant 
            onComplete={() => handleStepComplete('bank')} 
            onUploadDocuments={handleAddDocuments} 
            documents={userDocuments}
            bankDetails={bankDetails}
            setBankDetails={handleSetBankDetails}
            walletCards={walletCards}
            addWalletCard={handleAddWalletCard}
          />
        );
      case AppView.ASSISTANT:
        return <SmartAssistant language={language} />;
      case AppView.PROFILE:
        return (
          <Profile 
            language={language}
            setLanguage={handleLanguageChange}
            onResetDemo={handleResetDemo}
            setView={setCurrentView}
            documents={userDocuments}
            userPhone={userPhone}
            userId={userId}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case AppView.HELP_CENTER:
        return <HelpCenter language={language} setView={setCurrentView} />;
      default:
        return <Dashboard steps={roadmapSteps} language={language} setView={setCurrentView} />;
    }
  };

  // 0. SPLASH SCREEN
  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-orange-500 flex flex-col items-center justify-center z-[100] animate-out fade-out duration-500 fill-mode-forwards">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-orange-600 font-bold text-6xl shadow-2xl mb-6 animate-bounce">
                  O
              </div>
              <h1 className="text-white text-2xl font-bold tracking-wider mb-8">Orange Global Life</h1>
              <Loader2 className="text-white animate-spin" size={32} />
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 1. Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          setLanguage={handleLanguageChange}
          currentLanguage={language}
        />
      )}

      {/* Header - Show global header on all main views except Onboarding and Help Center */}
      {!showOnboarding && currentView !== AppView.HELP_CENTER && (
        <header className="bg-white sticky top-0 z-40 px-4 py-3 shadow-sm flex justify-between items-center">
          <div className="flex items-center space-x-2" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer shadow-orange-200 shadow-md">
              O
            </div>
            <span className="font-bold text-lg tracking-tight cursor-pointer">Global Life</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick Language Toggle */}
            <div className="relative">
                <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                <Globe size={16} className="text-gray-600" />
                <span>{language.split(' ')[0]}</span>
                </button>

                {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    {Object.values(Language).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => {
                        handleLanguageChange(lang);
                        setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 ${
                        language === lang ? 'text-orange-500 font-bold bg-orange-50' : 'text-gray-700'
                        }`}
                    >
                        {lang}
                    </button>
                    ))}
                </div>
                )}
            </div>

            {/* Profile Avatar Button */}
            <button
                onClick={() => setCurrentView(AppView.PROFILE)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-orange-600 font-bold transition-all border ${
                    currentView === AppView.PROFILE 
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md transform scale-105' 
                    : 'bg-orange-100 border-orange-200 hover:bg-orange-200'
                }`}
            >
                G
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area - Added padding-bottom to ensure content isn't hidden behind nav */}
      {!showOnboarding && (
        <>
          <main className="max-w-md mx-auto w-full pt-4 min-h-screen pb-24 px-0">
            {renderContent()}
          </main>
          {/* Bottom Navigation */}
          {currentView !== AppView.HELP_CENTER && (
            <Navigation 
                currentView={currentView} 
                setView={setCurrentView} 
                language={language} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
