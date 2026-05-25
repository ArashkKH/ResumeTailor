export interface ParsedParagraph {
  idx: number;
  text: string;
  style: string;
  isEmpty: boolean;
}

export type ChangeAction = 'rewrite' | 'tweak' | 'keep';

export interface Change {
  para_idx: number;
  section: string;
  action: ChangeAction;
  reasoning: string;
  original_text: string;
  new_text: string;
}

export interface TailorResult {
  job_title: string;
  changes: Change[];
  keywords_added: string[];
  overall_tip: string;
}

export type StatusState = 'idle' | 'loading' | 'success' | 'error';
