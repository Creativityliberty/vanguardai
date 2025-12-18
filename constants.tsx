
import React from 'react';
import { 
  Search, Cpu, BrainCircuit, GitBranch, LayoutTemplate, 
  Eye, Target, Globe, Layers, PenTool, Crosshair, ShieldCheck 
} from 'lucide-react';
import { NodeId, NodeConfig, Question } from './types';

export const STATIC_NODES_CONFIG: NodeConfig[] = [
  { id: NodeId.RAW_INPUT, label: 'Scan Brut', icon: <Search className="w-4 h-4"/>, tech: 'NORMALIZATION' },
  { id: NodeId.BUSINESS_EXTRACTOR, label: 'Extracteur Business', icon: <Cpu className="w-4 h-4"/>, tech: 'GEMINI FLASH 3' },
  { id: NodeId.AVATAR_BUILDER, label: 'Ingénieur Psycho', icon: <BrainCircuit className="w-4 h-4"/>, tech: 'THINKING PROTOCOL' }, 
  { id: NodeId.INTERVIEW_SIMULATOR, label: 'Simulateur Interview', icon: <GitBranch className="w-4 h-4"/>, tech: 'QID MAPPING CORE' },
  { id: NodeId.PERSONA_SPLITTER, label: 'Segmentation', icon: <LayoutTemplate className="w-4 h-4"/>, tech: 'CONTEXTUAL SPLIT' },
  { id: NodeId.AWARENESS_DETECTOR, label: 'Radar Conscience', icon: <Eye className="w-4 h-4"/>, tech: 'EUGENE SCHWARTZ' },
  { id: NodeId.OFFER_STRATEGIST, label: 'Stratégie Offre', icon: <Target className="w-4 h-4"/>, tech: 'DYNAMIC STRATEGY' },
  { id: NodeId.INTEREST_LAB, label: 'Labo Intérêts', icon: <Globe className="w-4 h-4"/>, tech: 'SEARCH GROUNDING' }, 
  { id: NodeId.INTEREST_CLUSTER, label: 'Cluster Meta', icon: <Layers className="w-4 h-4"/>, tech: 'DATA CLUSTERING' },
  { id: NodeId.COPYWRITING_MASTER, label: 'Maître Copywriter', icon: <PenTool className="w-4 h-4"/>, tech: 'MATRIX WRITER' },
  { id: NodeId.AUDIENCE_ADVISOR, label: 'Config Meta', icon: <Crosshair className="w-4 h-4"/>, tech: 'TECHNICAL ADVISOR' },
  { id: NodeId.CAMPAIGN_ASSEMBLER, label: 'Rapport Final', icon: <ShieldCheck className="w-4 h-4"/>, tech: 'COMPILATION' },
];

export const QUESTION_BANK: Question[] = [
  { qid: "C1", text: "Quand tu penses à ton problème, quelle est ta croyance la plus profonde sur pourquoi c’est dur ?" },
  { qid: "C9", text: "Quel est ton 'saboteur' intérieur ? Que répète-t-il ?" },
  { qid: "P1", text: "Dans une pub, qu’est-ce qui capte ton attention en 2 secondes ?" },
  { qid: "L7", text: "Qu’est-ce qui te fait honte d’avouer ? (objection cachée)" }
];

export const QID_MAPPING: Record<string, string[]> = {
  "C1": ["cognitive_structure.core_beliefs.problem_root"],
  "C9": ["cognitive_structure.internal_voices.saboteur_script"],
  "P1": ["perceptual_filter.attentional_triggers.primary"],
  "L7": ["copy_payload.hidden_objections"]
};
