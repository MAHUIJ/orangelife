
import React, { useState, useEffect, useRef } from 'react';
import { getBankRecommendations } from '../services/geminiService';
import { UserType, BankingRecommendation, ScoredBank, Language, UserDocument, BankDetails, WalletCard } from '../types';
import { REQUIRED_DOCUMENTS, TRANSLATIONS } from '../constants';
import { Camera, Upload, CheckCircle, Loader2, Building, ArrowRight, Wallet, Star, MapPin, Phone, Calendar, Trash2, FileText, Check, Sparkles, ChevronDown, CreditCard, Radio, Scan, Link as LinkIcon, X } from 'lucide-react';

interface BankingAssistantProps {
  onComplete: () => void;
  onUploadDocuments?: (docs: UserDocument[]) => void;
  documents?: UserDocument[]; // Global documents from App.tsx
  bankDetails?: BankDetails | null;
  setBankDetails?: (details: BankDetails) => void;
  walletCards?: WalletCard[];
  addWalletCard?: (card: WalletCard) => void;
}

const BankingAssistant: React.FC<BankingAssistantProps> = ({ 
    onComplete, 
    onUploadDocuments, 
    documents = [],
    bankDetails,
    setBankDetails,
    walletCards = [],
    addWalletCard
}) => {
  const [step, setStep] = useState<'identity' | 'checklist' | 'analyzing' | 'results'>('identity');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [recommendation, setRecommendation] = useState<BankingRecommendation | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'physical'>('all');
  
  // Existing Account State
  const [ibanInput, setIbanInput] = useState('');
  const [showExistingInput, setShowExistingInput] = useState(false);
  
  // Explicit State for Wallet View
  const [showWallet, setShowWallet] = useState(false);

  const [showAddCard, setShowAddCard] = useState<'none' | 'nfc' | 'manual'>('none');
  const [nfcScanning, setNfcScanning] = useState(false);
  
  // Manual Card Form
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // File State: Maps document key (e.g. 'passport') to File object
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  
  // Hidden inputs ref to trigger individual file dialogs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadDocKey, setActiveUploadDocKey] = useState<string | null>(null);

  const langStr = localStorage.getItem('app_language') as Language || Language.EN;
  const t = TRANSLATIONS[langStr];

  // Auto-Fill Logic: Check global documents
  useEffect(() => {
    if (documents.length > 0) {
        const newFiles = { ...uploadedFiles };
        documents.forEach(doc => {
            if (!newFiles[doc.type] && doc.type !== 'missing') {
                 const dummyFile = new File([""], doc.name, { type: "application/pdf" });
                 newFiles[doc.type] = dummyFile;
            }
        });
        setUploadedFiles(newFiles);
    }
  }, [documents]);

  // Sync with global prop on mount/change
  useEffect(() => {
    if (bankDetails?.hasAccount) {
        setShowWallet(true);
        setStep('results');
        return;
    }

    const storedType = localStorage.getItem('user_type'); 
    if (storedType) {
      setUserType(storedType as UserType);
      if (step === 'identity') setStep('checklist');
    }
  }, [bankDetails]);

  // Use the new identity_labels from translation
  const getIdentityLabel = (type: UserType) => {
    const key = type.toLowerCase();
    return t.identity_labels[key] || type;
  };

  const handleSetIdentity = (type: UserType) => {
    setUserType(type);
    localStorage.setItem('user_type', type);
    setStep('checklist');
  };

  // --- EXISTING ACCOUNT LOGIC ---
  const handleConfirmIban = () => {
      // Simplified validation for smoother demo flow
      if (ibanInput.length < 5) return;

      if (setBankDetails) {
          setBankDetails({
              hasAccount: true,
              iban: ibanInput,
              bankName: 'Detected Bank'
          });
      }
      
      // IMMEDIATE STATE TRANSITION
      setShowWallet(true);
      setStep('results');
      setShowExistingInput(false);
      
      // Notify parent app flow completion
      onComplete();
  };

  // --- NFC SIMULATION ---
  const handleStartNfc = () => {
      setNfcScanning(true);
      setTimeout(() => {
          setNfcScanning(false);
          const mockCard: WalletCard = {
              id: Math.random().toString(),
              type: 'nfc',
              maskedNumber: '4970 **** **** 1234',
              expiry: '12/28',
              brand: 'Visa',
              addedAt: new Date().toLocaleDateString()
          };
          if (addWalletCard) addWalletCard(mockCard);
          setShowAddCard('none');
      }, 3000); // 3s scan
  };

  // --- MANUAL ENTRY ---
  const handleCardNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 16) v = v.slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    setCardNum(parts.join(' '));
  };

  const handleManualAdd = () => {
      if (cardNum.length < 10 || !cardExpiry) return;
      const mockCard: WalletCard = {
          id: Math.random().toString(),
          type: 'manual',
          maskedNumber: cardNum.substring(0,4) + ' **** **** ' + cardNum.slice(-4),
          expiry: cardExpiry,
          brand: 'MasterCard',
          addedAt: new Date().toLocaleDateString()
      };
      if (addWalletCard) addWalletCard(mockCard);
      setCardNum('');
      setCardExpiry('');
      setShowAddCard('none');
  };

  // --- FILE HANDLING LOGIC ---
  const handleIndividualUploadClick = (docKey: string) => {
    setActiveUploadDocKey(docKey);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadDocKey) {
        const file = e.target.files[0];
        setUploadedFiles(prev => ({
            ...prev,
            [activeUploadDocKey]: file
        }));
    }
    setActiveUploadDocKey(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (docKey: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setUploadedFiles(prev => {
          const newState = { ...prev };
          delete newState[docKey];
          return newState;
      });
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!userType || !e.target.files || e.target.files.length === 0) return;
      
      const files = Array.from(e.target.files);
      const requiredDocs = REQUIRED_DOCUMENTS[userType];
      
      const newUploads = { ...uploadedFiles };
      let fileIndex = 0;

      requiredDocs.forEach(docKey => {
          if (!newUploads[docKey] && fileIndex < files.length) {
              newUploads[docKey] = files[fileIndex];
              fileIndex++;
          }
      });

      setUploadedFiles(newUploads);
  };

  const handleAnalyze = async () => {
    if (!userType) return;
    setStep('analyzing');

    if (onUploadDocuments) {
        const docKeys = Object.keys(uploadedFiles);
        const newDocs: UserDocument[] = docKeys.map(key => ({
            name: uploadedFiles[key].name,
            date: new Date().toLocaleDateString(),
            type: key as any
        }));
        onUploadDocuments(newDocs);
    }

    const result = await getBankRecommendations(userType, Object.values(uploadedFiles)); 
    setRecommendation(result);
    setStep('results');
  };

  // --- REUSABLE COMPONENT: EXISTING ACCOUNT TOGGLE ---
  const renderExistingAccountToggle = () => (
       <div className={`mb-8 bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${showExistingInput ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
           {!showExistingInput ? (
                <button 
                    onClick={() => setShowExistingInput(true)}
                    className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                            <LinkIcon size={20} className="text-orange-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 text-sm">{t.bk_already_have}</h3>
                            <p className="text-xs text-gray-500">Link your account to skip setup.</p>
                        </div>
                    </div>
                    <ChevronDown size={20} className="text-gray-400 group-hover:text-orange-500" />
                </button>
           ) : (
               <div className="p-5 animate-in fade-in slide-in-from-top-2">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-gray-900 flex items-center">
                           <LinkIcon size={16} className="mr-2 text-orange-600" />
                           Link Existing Account
                       </h3>
                       <button onClick={() => setShowExistingInput(false)} className="text-gray-400 hover:text-gray-600">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.bk_enter_iban}</label>
                   <div className="relative mb-4">
                        <input 
                            type="text" 
                            value={ibanInput}
                            onChange={(e) => setIbanInput(e.target.value.toUpperCase())}
                            placeholder={t.bk_iban_placeholder}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        />
                   </div>

                   <button 
                     onClick={handleConfirmIban}
                     disabled={ibanInput.length < 5}
                     className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                         ibanInput.length < 5 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-900 text-white hover:bg-black shadow-lg'
                     }`}
                   >
                       {t.bk_confirm_iban} <ArrowRight size={16} className="ml-2" />
                   </button>
               </div>
           )}
       </div>
  );

  // --- WALLET SECTION RENDERER ---
  const renderWalletSection = () => (
      <div className="animate-in fade-in space-y-6">
          {/* Success Banner */}
          <div className="bg-green-100 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle className="text-green-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-1">{t.bk_account_added}</h2>
              <p className="text-sm text-green-700 font-mono opacity-80 break-all">{bankDetails?.iban || ibanInput || "FR76 1234 5678"}</p>
          </div>

          <hr className="border-gray-100" />

          {/* Add Card */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">{t.bk_add_card_title}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.bk_add_card_intro}</p>
            
            {showAddCard === 'none' ? (
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowAddCard('nfc')}
                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all h-32 active:scale-95 group"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100">
                             <Radio className="text-blue-500 w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{t.bk_add_nfc}</span>
                    </button>
                    <button 
                        onClick={() => setShowAddCard('manual')}
                        className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all h-32 active:scale-95 group"
                    >
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-100">
                            <CreditCard className="text-gray-500 w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{t.bk_add_manual}</span>
                    </button>
                </div>
            ) : showAddCard === 'nfc' ? (
                <div className="bg-gray-900 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-xl animate-in fade-in zoom-in">
                    {nfcScanning ? (
                        <>
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_linear_infinite] shadow-[0_0_20px_blue]"></div>
                            <Scan className="mx-auto mb-4 animate-pulse w-16 h-16 text-blue-400" />
                            <h3 className="text-xl font-bold">{t.bk_nfc_scanning}</h3>
                        </>
                    ) : (
                        <>
                            <Radio className="mx-auto mb-4 w-16 h-16 text-white" />
                            <h3 className="text-xl font-bold mb-2">{t.bk_nfc_instruction}</h3>
                            <button onClick={handleStartNfc} className="mt-4 bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">Start Scan</button>
                        </>
                    )}
                    <button onClick={() => setShowAddCard('none')} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 relative shadow-lg animate-in fade-in zoom-in">
                    <button onClick={() => setShowAddCard('none')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                    
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.bk_manual_card_num}</label>
                        <input 
                            type="text" 
                            value={cardNum} 
                            onChange={handleCardNumChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full p-3 border border-gray-200 rounded-xl font-mono text-lg tracking-wide focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.bk_manual_expiry}</label>
                        <input 
                            type="text" 
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)} 
                            placeholder="MM/YY"
                            className="w-32 p-3 border border-gray-200 rounded-xl font-mono text-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    
                    <button className="w-full py-3 border border-dashed border-gray-300 rounded-xl mb-6 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Camera size={16} className="mr-2" />
                        <span className="text-xs font-bold">{t.bk_manual_upload}</span>
                    </button>

                    <button onClick={handleManualAdd} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all">{t.bk_add_card_btn}</button>
                </div>
            )}
          </div>

          {/* Wallet List */}
          {walletCards.length > 0 && (
              <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Wallet className="mr-2 text-orange-500" size={20}/>
                      {t.bk_my_cards}
                  </h3>
                  <div className="space-y-3">
                      {walletCards.map((card, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-2xl text-white shadow-lg flex justify-between items-center transform transition-transform hover:scale-[1.02] border-t border-gray-700">
                              <div>
                                  <p className="font-mono text-xl font-bold tracking-widest mb-1 shadow-black drop-shadow-md">{card.maskedNumber}</p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
                                      <span className="uppercase">{card.brand}</span>
                                      <span>•</span>
                                      <span>EXP {card.expiry}</span>
                                  </div>
                              </div>
                              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  {card.type === 'nfc' ? <Radio size={20} className="text-blue-400"/> : <CreditCard size={20} className="text-orange-400"/>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  const renderIdentityStep = () => (
    <div className="flex flex-col h-full justify-center p-4 animate-in fade-in pb-24">
       {/* Existing Account Toggle */}
       {renderExistingAccountToggle()}

       <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.bk_identity_title}</h2>
       <p className="text-gray-500 mb-8">{t.bk_identity_desc}</p>
       
       <div className="space-y-4">
         {[UserType.STUDENT, UserType.WORKER, UserType.VISITOR].map((type) => (
           <button 
             key={type}
             onClick={() => handleSetIdentity(type)}
             className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left flex items-center justify-between"
           >
             <span className="font-bold text-gray-900 capitalize">{getIdentityLabel(type)}</span>
             <ArrowRight size={16} className="text-gray-400" />
           </button>
         ))}
       </div>
    </div>
  );

  const renderChecklistStep = () => {
    const requiredDocKeys = userType ? REQUIRED_DOCUMENTS[userType] : [];
    const isReady = requiredDocKeys.every(key => !!uploadedFiles[key]);

    return (
      <div className="p-4 pt-8 pb-24 animate-in slide-in-from-right">
        {renderExistingAccountToggle()}

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.bk_step1_title}</h2>
        <p className="text-gray-500 mb-6">
            {t.bk_step1_desc} <span className="font-bold text-orange-600 capitalize">{userType ? getIdentityLabel(userType) : ''}</span>
        </p>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf"
            onChange={handleFileChange}
        />

        <div className="mb-6 relative group">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Upload className="w-6 h-6 text-blue-500 mb-2" />
                    <p className="text-sm font-bold text-blue-600">{t.cta.upload_all}</p>
                    <p className="text-xs text-blue-400 mt-1">{t.bk_upload_tip}</p>
                </div>
                <input type="file" className="hidden" multiple onChange={handleBulkUpload} />
            </label>
        </div>

        <div className="space-y-3 mb-8">
           {requiredDocKeys.map((docKey, idx) => {
             const file = uploadedFiles[docKey];
             const isUploaded = !!file;
             
             return (
               <div 
                 key={docKey} 
                 onClick={() => !isUploaded && handleIndividualUploadClick(docKey)}
                 className={`p-4 rounded-xl border transition-all flex items-center justify-center ${
                    isUploaded 
                        ? 'bg-white border-green-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-orange-300 cursor-pointer shadow-sm'
                 }`}
               >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${isUploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {isUploaded ? <Check size={20} className="text-green-600" /> : <span className="text-gray-500 font-bold text-sm">{idx + 1}</span>}
                    </div>
                    <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${isUploaded ? 'text-green-800' : 'text-gray-800'}`}>
                            {t.docs[docKey] || docKey}
                        </p>
                        {isUploaded ? (
                             <p className="text-xs text-green-600 truncate">{file.name}</p>
                        ) : (
                             <p className="text-xs text-gray-400">{t.cta.upload_single}</p>
                        )}
                    </div>
                  </div>

                  {isUploaded ? (
                      <button 
                        onClick={(e) => handleRemoveFile(docKey, e)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                          <Trash2 size={18} />
                      </button>
                  ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                          <Upload size={14} className="text-gray-400" />
                      </div>
                  )}
               </div>
             );
           })}
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={!isReady}
          className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isReady 
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isReady ? <Sparkles size={20} /> : <Camera size={20} />}
          <span>{t.cta.analyze}</span>
        </button>
      </div>
    );
  };

  const renderAnalyzingStep = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
      <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" />
      <h2 className="text-xl font-semibold text-gray-900">{t.bk_analyzing}</h2>
      
      <div className="w-full max-w-xs space-y-3 mt-8">
         <div className="flex justify-between text-xs text-gray-400">
           <span>{t.bk_stat_compat}</span>
           <span>40%</span>
         </div>
         <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 animate-[width_1s_ease-out] w-3/4"></div>
         </div>

         <div className="flex justify-between text-xs text-gray-400">
           <span>{t.bk_stat_success}</span>
           <span>30%</span>
         </div>
         <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 animate-[width_1.5s_ease-out] w-2/3"></div>
         </div>
      </div>
    </div>
  );

  const renderBankCard = (bank: ScoredBank) => (
    <div key={bank.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${bank.logoColor} rounded-lg flex items-center justify-center text-white font-bold mr-3`}>
             {bank.name[0]}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{bank.name}</h4>
            <div className="flex items-center mt-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-xs font-bold text-gray-700">{bank.score}/100</span>
            </div>
          </div>
        </div>
        {bank.score >= 90 && (
           <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">TOP PICK</span>
        )}
      </div>

      <p className="text-xs text-gray-500 italic mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
        " {t.bank_reasons[bank.reason] || bank.reason} "
      </p>

      {bank.category === 'physical' && (
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
           <div className="flex items-center">
             <MapPin size={12} className="mr-1 text-gray-400" />
             {bank.distance}
           </div>
           <div className="flex items-center">
             <Phone size={12} className="mr-1 text-gray-400" />
             {bank.phone}
           </div>
        </div>
      )}

      {bank.category === 'online' ? (
        <a 
          href={bank.url} 
          target="_blank" 
          rel="noreferrer"
          className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:bg-black transition-colors"
        >
          {t.bk_open} <ArrowRight size={12} className="ml-1" />
        </a>
      ) : (
        <div className="flex space-x-2">
           {bank.hasOnlineBooking ? (
             <a href={bank.url} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:bg-orange-600">
                <Calendar size={12} className="mr-1" /> {t.bk_book}
             </a>
           ) : (
             <a href={`tel:${bank.phone}`} className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center justify-center hover:bg-black">
                <Phone size={12} className="mr-1" /> {t.bk_call}
             </a>
           )}
        </div>
      )}
    </div>
  );

  const renderResultsStep = () => {
    // SINGLE SOURCE OF TRUTH: showWallet state
    if (showWallet) {
        return (
            <div className="p-4 pb-24 animate-in fade-in">
                {renderWalletSection()}
            </div>
        );
    }

    // Default: Recommendation View
    const showOnline = activeFilter === 'all' || activeFilter === 'online';
    const showPhysical = activeFilter === 'all' || activeFilter === 'physical';

    return (
      <div className="p-4 pb-24 animate-in fade-in">
        {renderExistingAccountToggle()}

        {recommendation ? (
            <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t.bk_rec_title}</h2>
                <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
                {(['all', 'online', 'physical'] as const).map((f) => (
                    <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                        activeFilter === f ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
                    }`}
                    >
                    {f === 'all' ? t.bk_filter_all : f === 'online' ? t.bk_filter_online : t.bk_filter_physical}
                    </button>
                ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {showOnline && (
                        <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <Wallet size={16} className="mr-2" />
                            {t.bk_rec_online}
                        </h3>
                        {recommendation.online.map(renderBankCard)}
                        </div>
                    )}
                    {showPhysical && (
                        <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <Building size={16} className="mr-2" />
                            {t.bk_rec_physical}
                        </h3>
                        {recommendation.physical.map(renderBankCard)}
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="text-center text-gray-400 mt-10">
                <Loader2 className="animate-spin mx-auto mb-2" />
                <p>Loading...</p>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      {step === 'identity' && renderIdentityStep()}
      {step === 'checklist' && renderChecklistStep()}
      {step === 'analyzing' && renderAnalyzingStep()}
      {step === 'results' && renderResultsStep()}
    </div>
  );
};

export default BankingAssistant;
