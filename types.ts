
export enum Language {
  EN = 'English',
  FR = 'Français',
  CN = '中文',
  KR = '한국어',
  JP = '日本語'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ESIM = 'ESIM',
  BANKING = 'BANKING',
  ASSISTANT = 'ASSISTANT',
  PROFILE = 'PROFILE',
  HELP_CENTER = 'HELP_CENTER'
}

export enum UserType {
  STUDENT = 'student',
  WORKER = 'worker',
  VISITOR = 'visitor'
}

export interface UserDocument {
  name: string;
  date: string;
  // Expanded types for better matching with required docs
  type: 'passport' | 'visa' | 'address_proof' | 'school_certificate' | 'work_contract' | 'other' | 'missing' | 'id' | 'address' | 'contract'; 
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  day: string;
  iconName: string;
}

export interface BankingAnalysisResult {
  isValid: boolean;
  documentType: string;
  extractedName?: string;
  issues: string[];
  confidence: number;
}

export type AssistantMode = 'administrative' | 'safety';

export interface SmartAssistantResult {
  type: AssistantMode;
  
  // Admin specific
  summary?: string;
  steps?: string[];
  deadline?: string | null;
  official_links?: { name: string; url: string }[];
  
  // Safety specific
  risk_level?: 'low' | 'medium' | 'high';
  explanation?: string;
  advice?: string;
  official_link?: { name: string; url: string };
}

export interface DocumentAdvice {
  summary: string;
  actionItems: string[];
  translatedText: string;
}

export type BankCategory = 'online' | 'physical';

export interface Bank {
  id: string;
  name: string;
  category: BankCategory;
  logoColor: string;
  url: string;
  hasOnlineBooking?: boolean;
  phone?: string;
  address?: string; // Mock address for physical
  features: string[];
}

export interface ScoredBank extends Bank {
  score: number;
  reason: string; // This will now be a translation key
  distance?: string; // "1.2 km"
  compatibilityScore: number;
  successRate: number;
  profileMatchScore: number;
}

export interface BankingRecommendation {
  online: ScoredBank[];
  physical: ScoredBank[];
}

export type AlertType = 'administrative' | 'security';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  date?: string;
  actionLabel?: string;
}

export interface BankDetails {
  hasAccount: boolean;
  iban: string;
  bankName: string;
}

export interface WalletCard {
  id: string;
  type: 'nfc' | 'manual';
  maskedNumber: string;
  expiry: string;
  brand: string;
  addedAt: string;
}
