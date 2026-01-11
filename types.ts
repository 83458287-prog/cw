
export interface LedgerEntry {
  id: string;
  year: number;
  month: number;
  day: number;
  summary: string;
  category: string; // 新增：账目类别
  income: number;
  expense: number;
  balance: number;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface AISuggestion {
  year: number;
  month: number;
  day: number;
  summary: string;
  category: string; // 新增：类别
  income: number;
  expense: number;
}

export type AppTab = 'dashboard' | 'ledger' | 'history' | 'settings';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}
