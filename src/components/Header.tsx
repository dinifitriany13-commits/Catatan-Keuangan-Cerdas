import React from 'react';
import { Plus, Moon, Sun, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  isDarkMode,
  toggleDarkMode,
  onOpenBackupModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'reports', label: 'Rekap Keuangan' },
    { id: 'analytics', label: 'Diagram & Analisis' },
    { id: 'targets', label: 'Target Tabungan' },
    { id: 'calendar', label: 'Kalender & Tagihan' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#251C17]/95 backdrop-blur-md border-b border-[#F5EBE0] dark:border-[#3E2F26] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-18">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group focus-visible:outline-none cursor-pointer"
            >
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#F7D6E0] dark:border-[#5C303F] shadow-xs group-hover:scale-108 group-hover:rotate-3 transition-all duration-300 bg-[#F5EBE0]">
                <img
                  src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
                  alt="Teddy Face"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold font-display tracking-tight text-[#7F5539] dark:text-[#F5EBE0] block leading-tight">
                    Teddy Finance
                  </span>
                  <span className="text-xs text-rose-400 group-hover:scale-125 transition-transform">♥</span>
                </div>
                <span className="text-[11px] text-[#B08968] dark:text-[#DDB892] font-medium tracking-wide flex items-center gap-1">
                  <span>Cash & Cashless Ledger</span>
                  <span className="text-[10px]">🐾</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#F5EBE0] dark:bg-[#3E2F26] text-[#7F5539] dark:text-[#F7D6E0] font-semibold shadow-xs'
                      : 'text-[#8D6E63] dark:text-[#C5B3A6] hover:text-[#7F5539] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#2F241E]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Teddy Brown Dark Mode'}
              className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#32231A] border border-[#F5EBE0] dark:border-[#4A392F] text-[#8D6E63] dark:text-[#DDB892] flex items-center justify-center hover:bg-[#F5EBE0] dark:hover:bg-[#3E2F26] transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#F7D6E0]" /> : <Moon className="w-4 h-4 text-[#B08968]" />}
            </button>

            <button
              type="button"
              onClick={onOpenBackupModal}
              title="Backup & Restore Data"
              className="hidden sm:flex w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#32231A] border border-[#F5EBE0] dark:border-[#4A392F] text-[#8D6E63] dark:text-[#DDB892] items-center justify-center hover:bg-[#F5EBE0] dark:hover:bg-[#3E2F26] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#B08968] hover:bg-[#9C7555] active:scale-98 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-[#F5EBE0]/60 dark:border-[#3E2F26]/60 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#B08968] text-white shadow-xs'
                    : 'bg-[#FAF7F2] dark:bg-[#2F241E] text-[#8D6E63] dark:text-[#C5B3A6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
