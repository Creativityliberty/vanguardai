
import React from 'react';

export enum NodeId {
  RAW_INPUT = '01_SCAN_BRUT',
  BUSINESS_EXTRACTOR = '02_EXTRACTEUR_BUSINESS',
  AVATAR_BUILDER = '03_INGENIEUR_PSYCHO',
  INTERVIEW_SIMULATOR = '03b_SIMULATION_INTERVIEW', 
  PERSONA_SPLITTER = '04_ARCHITECTE_SEGMENTATION',
  AWARENESS_DETECTOR = '05_DETECTEUR_CONSCIENCE',
  OFFER_STRATEGIST = '06_STRATEGISTE_OFFRE',
  INTEREST_LAB = '07_LABO_INTERETS',
  INTEREST_CLUSTER = '08_CLUSTER_META',
  COPYWRITING_MASTER = '09_MAITRE_COPYWRITER',
  AUDIENCE_ADVISOR = '10_CONSEILLER_AUDIENCE',
  CAMPAIGN_ASSEMBLER = '11_ASSEMBLEUR_FINAL'
}

export enum FlowStatus { 
  IDLE = 'IDLE', 
  RUNNING = 'RUNNING', 
  COMPLETED = 'COMPLETED', 
  FAILED = 'FAILED' 
}

export type ViewMode = 'LAB' | 'DOSSIER';

export type ImageSize = '1K' | '2K' | '4K';

export interface NodeConfig {
  id: NodeId;
  label: string;
  icon: React.ReactNode;
  tech: string;
}

// Add Question interface to fix import error in constants.tsx
export interface Question {
  qid: string;
  text: string;
}

export interface AdData {
  persona: string;
  angle: string;
  hook: string;
  body: string;
  cta: string;
  image_prompt: string;
  image_url?: string;
}

export interface Store {
  artifacts: Record<string, any>;
  paradigm: {
    partial: any;
  };
  logs: string[];
  viewMode: ViewMode;
}
