
import { LedgerEntry } from './types';

export const INITIAL_LEDGER_DATA: LedgerEntry[] = [
  { id: '1', year: 2025, month: 1, day: 1, summary: '接上月', category: '期初余额', income: 0, expense: 0, balance: 71724.33 },
  { id: '2', year: 2025, month: 1, day: 6, summary: '刘禹成7月份工资、社保及公积金', category: '人力成本', income: 0, expense: 16459.19, balance: 55265.14 },
  { id: '3', year: 2025, month: 1, day: 9, summary: '张纯芳酒', category: '商务招待', income: 0, expense: 11397.00, balance: 43868.14 },
  { id: '4', year: 2025, month: 1, day: 9, summary: '收到刘群英12月份工资', category: '经营收入', income: 10400.00, expense: 0, balance: 54268.14 },
  { id: '5', year: 2025, month: 1, day: 8, summary: '房租定金退回', category: '经营收入', income: 3000.00, expense: 0, balance: 57268.14 },
  { id: '6', year: 2025, month: 1, day: 13, summary: '刘北南购手机', category: '办公设备', income: 0, expense: 22280.00, balance: 34988.14 },
  { id: '15', year: 2025, month: 1, day: 17, summary: '业务员提成（多名员工）', category: '人力成本', income: 0, expense: 329858.00, balance: -43791.00 },
  { id: '17', year: 2025, month: 1, day: 24, summary: '收到雅图2024管理费（多项目）', category: '经营收入', income: 623041.13, expense: 0, balance: 801471.13 },
];
