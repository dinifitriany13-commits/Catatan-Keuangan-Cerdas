import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TeddyHeroBanner } from './components/TeddyHeroBanner';
import { TeddyMascotCard } from './components/TeddyMascotCard';
import { TransactionTable } from './components/TransactionTable';
import { TransactionForm } from './components/TransactionForm';
import { ChartsSection } from './components/ChartsSection';
import { ReportsSection } from './components/ReportsSection';
import { SavingsTargetSection } from './components/SavingsTargetSection';
import { FinancialCalendar } from './components/FinancialCalendar';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { BackupModal } from './components/BackupModal';
import { Transaction, SavingsTarget, BillReminder } from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_TARGETS,
  INITIAL_BILL_REMINDERS,
} from './utils/sampleData';
import { exportToCSV, printReport } from './utils/export';
import { formatRupiah, formatDateIndo, isCashlessMethod, INDONESIAN_MONTHS } from './utils/formatters';
import { Plus, Sparkles, Heart } from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'teddy_finance_transactions_v2',
  TARGETS: 'teddy_finance_targets_v2',
  BILLS: 'teddy_finance_bills_v2',
  THEME: 'teddy_finance_darkmode_v2',
};

export default function App() {
  // 1. Data States with LocalStorage Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [targets, setTargets] = useState<SavingsTarget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVINGS_TARGETS;
  });

  const [billReminders, setBillReminders] = useState<BillReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BILL_REMINDERS;
  });

  // 2. Theme State (Teddy Brown Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(billReminders));
  }, [billReminders]);

  // 3. Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // 4. Current Month & Financial Statistics Calculation
  const currentYear = '2026';
  const currentMonthNum = '11'; // November
  const currentMonthName = 'November 2026';

  const stats = useMemo(() => {
    let totalIncomeAll = 0;
    let totalExpenseAll = 0;

    let totalIncomeMonth = 0;
    let totalExpenseMonth = 0;

    let cashMonth = 0;
    let cashlessMonth = 0;

    const currentMonthExpenseByCat: Record<string, number> = {};
    const currentMonthIncomeByCat: Record<string, number> = {};

    let prevMonthExpense = 0;
    const prevMonthNum = '10'; // October

    transactions.forEach((t) => {
      const [yr, mo] = t.date.split('-');

      // All time
      if (t.type === 'Pemasukan') {
        totalIncomeAll += t.amount;
      } else {
        totalExpenseAll += t.amount;
      }

      // Current month
      if (yr === currentYear && mo === currentMonthNum) {
        if (t.type === 'Pemasukan') {
          totalIncomeMonth += t.amount;
          currentMonthIncomeByCat[t.category] = (currentMonthIncomeByCat[t.category] || 0) + t.amount;
        } else {
          totalExpenseMonth += t.amount;
          currentMonthExpenseByCat[t.category] = (currentMonthExpenseByCat[t.category] || 0) + t.amount;
        }

        if (isCashlessMethod(t.paymentMethod)) {
          cashlessMonth += t.amount;
        } else {
          cashMonth += t.amount;
        }
      }

      // Previous month
      if (yr === currentYear && mo === prevMonthNum && t.type === 'Pengeluaran') {
        prevMonthExpense += t.amount;
      }
    });

    const totalSaldo = totalIncomeAll - totalExpenseAll;

    // Top categories
    const topExpEntry = Object.entries(currentMonthExpenseByCat).sort((a, b) => b[1] - a[1])[0];
    const topIncEntry = Object.entries(currentMonthIncomeByCat).sort((a, b) => b[1] - a[1])[0];

    const totalVolMonth = cashMonth + cashlessMonth;
    const cashlessPct = totalVolMonth > 0 ? Math.round((cashlessMonth / totalVolMonth) * 100) : 85;

    // Total saved in targets
    const totalSavedTargets = targets.reduce((sum, tg) => sum + tg.savedAmount, 0);

    // Monthly expense comparison notice
    let expenseNotice: string | null = null;
    if (prevMonthExpense > 0 && totalExpenseMonth > 0) {
      const diffPct = Math.round(((totalExpenseMonth - prevMonthExpense) / prevMonthExpense) * 100);
      if (diffPct > 0) {
        expenseNotice = `Pengeluaran bulan ini bertambah ${diffPct}% dibanding bulan lalu. Pertahankan batas aman!`;
      } else if (diffPct < 0) {
        expenseNotice = `Hebat! Pengeluaran berhasil ditekan hemat ${Math.abs(diffPct)}% dibanding bulan lalu.`;
      }
    } else {
      expenseNotice = 'Pengeluaran Makan & Minum merupakan alokasi tertinggi di awal bulan ini.';
    }

    // Financial Health score (0-100)
    let score = 75;
    if (totalIncomeMonth > 0) {
      const savingsRate = ((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100;
      if (savingsRate >= 30) score = 95;
      else if (savingsRate >= 20) score = 88;
      else if (savingsRate >= 10) score = 78;
      else if (savingsRate >= 0) score = 65;
      else score = 45;
    }

    return {
      totalSaldo,
      totalIncomeMonth,
      totalExpenseMonth,
      cashMonth,
      cashlessMonth,
      cashlessPct,
      topExpenseCategory: topExpEntry ? { category: topExpEntry[0], amount: topExpEntry[1] } : null,
      topIncomeCategory: topIncEntry ? { category: topIncEntry[0], amount: topIncEntry[1] } : null,
      totalSavedTargets,
      expenseNotice,
      healthScore: score,
    };
  }, [transactions, targets]);

  // 5. CRUD Transaction Handlers
  const handleCreateOrUpdateTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      );
      setEditingTransaction(null);
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan transaksi ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  // 6. Savings Target Handlers
  const handleAddTarget = (newTarget: Omit<SavingsTarget, 'id' | 'createdAt'>) => {
    const t: SavingsTarget = {
      ...newTarget,
      id: `target-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTargets((prev) => [...prev, t]);
  };

  const handleUpdateTarget = (id: string, updated: Partial<SavingsTarget>) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const handleDeleteTarget = (id: string) => {
    if (window.confirm('Hapus target tabungan ini?')) {
      setTargets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // 7. Bill Reminders Handlers
  const handleToggleBillPaid = (billId: string) => {
    setBillReminders((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, isPaidThisMonth: !b.isPaidThisMonth } : b))
    );
  };

  const handleAddBillReminder = (bill: Omit<BillReminder, 'id'>) => {
    const b: BillReminder = {
      ...bill,
      id: `bill-${Date.now()}`,
    };
    setBillReminders((prev) => [...prev, b]);
  };

  // 8. Restore & Reset Handlers
  const handleRestoreData = (restored: any) => {
    if (restored.transactions) setTransactions(restored.transactions);
    if (restored.targets) setTargets(restored.targets);
    if (restored.bills) setBillReminders(restored.bills);
  };

  const handleResetToSample = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setTargets(INITIAL_SAVINGS_TARGETS);
    setBillReminders(INITIAL_BILL_REMINDERS);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1E1714] text-[#2D2424] dark:text-[#F5EBE0] flex flex-col transition-colors selection:bg-[#F7D6E0] selection:text-[#7F5539]">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenBackupModal={() => setIsBackupOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Printable Statement Header (Visible only on print) */}
        <div className="hidden print-only mb-6 border-b-2 border-[#B08968] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-[#7F5539]">
                Teddy Finance — Laporan Keuangan Pribadi
              </h1>
              <p className="text-xs text-gray-500">
                Pencatatan Transaksi Cash & Cashless · Dicetak pada {formatDateIndo(new Date().toISOString().split('T')[0], true)}
              </p>
            </div>
            <div className="text-right font-mono-numbers">
              <span className="text-xs block text-gray-500">Total Saldo Riil:</span>
              <span className="text-xl font-bold text-[#7F5539]">{formatRupiah(stats.totalSaldo)}</span>
            </div>
          </div>
        </div>

        {/* Tab 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cute Teddy Room Hero Banner */}
            <TeddyHeroBanner
              onOpenNewTransaction={handleOpenNewTransaction}
              onGoToTargets={() => setActiveTab('targets')}
              onGoToCalendar={() => setActiveTab('calendar')}
              currentDayName="Selasa"
            />

            {/* 4 Summary Cards */}
            <DashboardStats
              totalSaldo={stats.totalSaldo}
              totalIncomeMonth={stats.totalIncomeMonth}
              totalExpenseMonth={stats.totalExpenseMonth}
              cashTotal={stats.cashMonth}
              cashlessTotal={stats.cashlessMonth}
              selectedMonthName={currentMonthName}
            />

            {/* Teddy AI Insights & Avatar Card */}
            <TeddyMascotCard
              topExpenseCategory={stats.topExpenseCategory}
              topIncomeCategory={stats.topIncomeCategory}
              cashlessPercentage={stats.cashlessPct}
              totalSaved={stats.totalSavedTargets}
              expenseChangeNotice={stats.expenseNotice}
              healthScore={stats.healthScore}
            />

            {/* Quick Preview of Recent Transactions with direct link to all */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
                    Catatan Transaksi Terkini
                  </h3>
                  <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                    Riwayat pemasukan & pengeluaran hari ini dan hari sebelumnya
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-[#B08968] dark:text-[#DDB892] hover:underline"
                >
                  Lihat Semua Transaksi ({transactions.length}) →
                </button>
              </div>

              <TransactionTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onViewDetail={(tx) => setDetailTransaction(tx)}
                onOpenNew={handleOpenNewTransaction}
                onExportCSV={(list) => exportToCSV(list)}
                onPrintReport={printReport}
              />
            </div>
          </div>
        )}

        {/* Tab 2: SEMUA TRANSAKSI */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
                Buku Kas Transaksi Lengkap
              </h2>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Pencatatan harian dengan filter hari, tanggal, kategori, dan metode pembayaran
              </p>
            </div>

            <TransactionTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onViewDetail={(tx) => setDetailTransaction(tx)}
              onOpenNew={handleOpenNewTransaction}
              onExportCSV={(list) => exportToCSV(list)}
              onPrintReport={printReport}
            />
          </div>
        )}

        {/* Tab 3: REKAP KEUANGAN */}
        {activeTab === 'reports' && (
          <ReportsSection transactions={transactions} selectedYear={currentYear} />
        )}

        {/* Tab 4: DIAGRAM DAN ANALISIS */}
        {activeTab === 'analytics' && (
          <ChartsSection transactions={transactions} selectedYear={currentYear} />
        )}

        {/* Tab 5: TARGET TABUNGAN */}
        {activeTab === 'targets' && (
          <SavingsTargetSection
            targets={targets}
            onAddTarget={handleAddTarget}
            onUpdateTarget={handleUpdateTarget}
            onDeleteTarget={handleDeleteTarget}
          />
        )}

        {/* Tab 6: KALENDER & TAGIHAN */}
        {activeTab === 'calendar' && (
          <FinancialCalendar
            transactions={transactions}
            billReminders={billReminders}
            onToggleBillPaid={handleToggleBillPaid}
            onAddBillReminder={handleAddBillReminder}
            onOpenNewTransactionWithDate={(d) => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#F5EBE0] dark:border-[#3E2F26] py-6 bg-white/50 dark:bg-[#251C17]/50 text-xs text-[#8D6E63] dark:text-[#A99385]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-base">🧸</span>
            <span className="font-semibold text-[#7F5539] dark:text-[#F5EBE0]">Teddy Finance</span>
            <span>· Elegant Personal Cash & Cashless Ledger</span>
          </div>
          <div>
            <span>Format Ekspor CSV / Excel & Cetak PDF Otomatis</span>
          </div>
        </div>
      </footer>

      {/* Transaction Input Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleCreateOrUpdateTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Transaction Detail Receipt Modal */}
      <TransactionDetailModal
        transaction={detailTransaction}
        onClose={() => setDetailTransaction(null)}
        onEdit={(tx) => {
          setDetailTransaction(null);
          handleEditTransaction(tx);
        }}
      />

      {/* Backup & Settings Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        fullData={{
          transactions,
          targets,
          bills: billReminders,
          exportedAt: new Date().toISOString(),
        }}
        onRestoreData={handleRestoreData}
        onResetToSample={handleResetToSample}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />
    </div>
  );
}
