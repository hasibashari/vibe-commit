import type { Log } from './log';

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  description: string;
  type?: 'daily' | 'one-off' | 'project';
  targetXP?: number;
  currentXP?: number;
  status?: 'active' | 'completed' | 'failed' | 'archived';
  category: string;
  difficulty: number;
  reward_alpha: number;
  repetition_count: number;
  createdAt?: string;
  updatedAt?: string;
  logs?: Log[]; 
}
