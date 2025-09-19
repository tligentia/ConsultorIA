export type RagSourceStatus = 'active' | 'inactive';

export interface RagSource {
  id: string;
  type: 'url' | 'file' | 'text';
  content: string; // URL, file name, or the text itself
  status: RagSourceStatus;
}

export type ExpertTeam = 'red' | 'green' | null;

export interface Expert {
  id: string;
  title: string;
  isCustom: boolean;
  opinionFor: string | null;
  opinionAgainst: string | null;
  team: ExpertTeam;
  positioningIndex: number | null; // 0-10
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface Consultation {
    id: string;
    name: string;
    createdAt: string;
    ragSources: RagSource[];
    experts: Expert[];
    dataAssessmentResult: string | null;
    teamRedName: string;
    teamGreenName: string;
    chatHistory: ChatMessage[];
}

export enum AnalysisStage {
  IDLE = 'IDLE', // No analysis started, RAG is being configured
  ANALYSIS_STARTED = 'ANALYSIS_STARTED', // Experts generated
  OPINIONS_GENERATED = 'OPINIONS_GENERATED', // At least one opinion generated
  DATA_ASSESSED = 'DATA_ASSESSED', // Data assessment is complete
  CASE_EVALUATED = 'CASE_EVALUATED' // Case has been evaluated and teams assigned
}

export type LoadingAction = 
  | 'analysis' 
  | 'all-opinions' 
  | 'assess-data' 
  | 'evaluate'
  // FIX: Added 'chat' to the LoadingAction type to correctly handle chat loading state.
  | 'chat' 
  | `opinion-${string}` // e.g., opinion-expert-1-for
  | null;