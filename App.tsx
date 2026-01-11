
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LedgerEntry, AISuggestion, AppTab, ActivityLog } from './types';
import { INITIAL_LEDGER_DATA } from './constants';
import Dashboard from './components/Dashboard';
import LedgerTable from './components/LedgerTable';
import AIAssistant from './components/AIAssistant';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { LayoutDashboard, ReceiptText, Calculator, Settings, History, PlusCircle, BrainCircuit, X } from 'lucide-react';

const STORAGE_KEY = 'lx_ledger_data_v1'; 
const LOG_KEY = 'lx_ledger_logs_v1';

const App: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_LEDGER_DATA; }
    }
    return INITIAL_LEDGER_DATA;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [showAiMobile, setShowAiMobile] = useState(false);
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(LOG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((log: any) => ({ ...log, timestamp: new Date(log.timestamp) }));
      } catch (e) { return []; }
    }
    return [];
  });

  const existingCategories = useMemo(() => {
    return Array.from(new Set(entries.map(e => e.category).filter(Boolean)));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const recalculateBalances = useCallback((data: LedgerEntry[]) => {
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day).getTime();
      const dateB = new Date(b.year, b.month - 1, b.day).getTime();
      return dateA - dateB;
    });

    let currentBalance = 0;
    return sorted.map((entry, index) => {
      if (index === 0 && entry.summary === '接上月') {
        currentBalance = entry.balance;
        return entry;
      }
      currentBalance = currentBalance + entry.income - entry.expense;
      return { ...entry, balance: currentBalance };
    });
  }, []);

  const handleAddEntries = (suggestions: AISuggestion[]) => {
    const newEntries: LedgerEntry[] = suggestions.map((s) => ({
      id: Math.random().toString(36).substr(2, 9),
      ...s,
      balance: 0
    }));
    setEntries(prev => recalculateBalances([...prev, ...newEntries]));
    addLog('快速录入', `成功添加了 ${suggestions.length} 条记录`);
    setActiveTab('ledger');
    setShowAiMobile(false);
  };

  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (confirm('确定要删除这条记录吗？')) {
      setEntries(prev => recalculateBalances(prev.filter(e => e.id !== id)));
      addLog('删除记录', `删除了摘要为: ${entryToDelete?.summary} 的记录`);
    }
  };

  const exportToExcel = (entriesToExport: LedgerEntry[], dateRangeLabel?: string) => {
    const now = new Date();
    const fileName = `财务报表_${now.toISOString().slice(0,10)}.xls`;
    const html = `<html><meta charset="UTF-8"><body><table>
      <tr><th colspan="7">财务明细报表</th></tr>
      ${entriesToExport.map(e => `<tr><td>${e.year}-${e.month}-${e.day}</td><td>${e.category}</td><td>${e.summary}</td><td>${e.income}</td><td>${e.expense}</td><td>${e.balance}</td></tr>`).join('')}
    </table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    addLog('导出报表', `导出了 ${entriesToExport.length} 条记录`);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '概览' },
    { id: 'ledger', icon: ReceiptText, label: '明细' },
    { id: 'history', icon: History, label: '记录' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-20">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 text-indigo-600 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Calculator size={24} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">李璇的小工具</h1>
          </div>

          <nav className="space-y-1 mb-8">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as AppTab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-hidden min-h-[400px]">
            <AIAssistant onAddEntries={handleAddEntries} existingCategories={existingCategories} />
          </div>
        </div>
      </aside>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-4 py-2 safe-pb z-40">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as AppTab)} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 移动端 AI 悬浮按钮 */}
      <button 
        onClick={() => setShowAiMobile(true)}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all"
      >
        <BrainCircuit size={28} />
      </button>

      {/* 移动端 AI 输入抽屉/弹窗 */}
      {showAiMobile && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAiMobile(false)} />
          <div className="relative w-full bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <BrainCircuit size={20} className="text-indigo-600" />
                DeepSeek 智能录入
              </h3>
              <button onClick={() => setShowAiMobile(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>
            <AIAssistant onAddEntries={handleAddEntries} existingCategories={existingCategories} />
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <main className="flex-1 p-4 md:p-10 mb-20 md:mb-0 overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              {activeTab === 'dashboard' && '财务大盘分析'}
              {activeTab === 'ledger' && '明细账目管理'}
              {activeTab === 'history' && '操作审计记录'}
              {activeTab === 'settings' && '系统个性化设置'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">手机端已适配 · 随时随地高效记账</p>
          </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && <Dashboard entries={entries} />}
          {activeTab === 'ledger' && <LedgerTable entries={entries} onDelete={handleDeleteEntry} onExport={exportToExcel} />}
          {activeTab === 'history' && <HistoryView logs={logs} />}
          {activeTab === 'settings' && <SettingsView entries={entries} logs={logs} onImport={(e, l) => {setEntries(recalculateBalances(e)); setLogs(l)}} onClear={() => setEntries(INITIAL_LEDGER_DATA)} />}
        </div>
      </main>
    </div>
  );
};

export default App;
