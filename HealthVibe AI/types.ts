export type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

export interface Diagnosis {
  condition: string;
  confidence: number; // 0 to 100
  description: string;
}

export enum UrgencyLevel {
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Baja'
}

export interface ClinicalSummary {
  duration: string;
  painLevel: string; // e.g. "Moderado (5/10)"
  keySymptoms: string[];
}

export interface AnalysisResponse {
  urgency: UrgencyLevel;
  urgencyReason: string;
  clinicalSummary: ClinicalSummary;
  recommendedSpecialist: string;
  referralLetter: string; // New V4: Professional letter for the doctor
  diagnoses: Diagnosis[];
  warningSigns: string[];
  followUpQuestions: string[];
  homeCareSteps: string[];
  medicalAdvice: string;
  visualSummaryDescription: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}