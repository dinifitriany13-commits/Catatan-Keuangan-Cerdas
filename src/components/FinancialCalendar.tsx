import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { Transaction, BillReminder } from '../types';
import { formatRupiah, formatDateIndo, INDONESIAN_MONTHS, INDONESIAN_DAYS } from '../utils/formatters';

interface FinancialCalendarProps {
  transactions: Transaction[];
  billReminders: BillReminder[];
  onToggleBillPaid: (billId: string) => void;
  onAddBillReminder: (bill: Omit<BillReminder, 'id'>) => void;
  onOpenNewTransactionWithDate: (dateStr: string) => void;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({
  transactions,
  billReminders,
  onToggleBillPaid,
  onAddBillReminder,
  onOpenNewTransactionWithDate,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 is November (0-indexed)
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>('2026-11-03');

  // New Bill modal
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDay, setBillDueDay] = useState('10');
  const [billCategory, setBillCategory] = useState('Tagihan Listrik');

  // Daily Reminder Setting Simulation
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [isReminderActive, setIsReminderActive] = useState<boolean>(true);
  const [reminderSavedNotice, setReminderSavedNotice] = useState<boolean>(false);

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Group transactions by date for fast calendar dot lookup
  const dateTxMap = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number; items: Transaction[] }> = {};
    transactions.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = { income: 0, expense: 0, count: 0, items: [] };
      }
      if (t.type === 'Pemasukan') {
        map[t.date].income += t.amount;
      } else {
        map[t.date].expense += t.amount;
      }
      map[t.date].count += 1;
      map[t.date].items.push(t);
    });
    return map;
  }, [transactions]);

  // Selected date transactions
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDayDate || !dateTxMap[selectedDayDate]) return [];
    return dateTxMap[selectedDayDate].items;
  }, [selectedDayDate, dateTxMap]);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(billAmount.replace(/\D/g, ''), 10);
    if (!billTitle || isNaN(amt) || amt <= 0) return;

    onAddBillReminder({
      title: billTitle,
      amount: amt,
      dueDay: parseInt(billDueDay, 10),
      category: billCategory,
      isPaidThisMonth: false,
    });

    setBillTitle('');
    setBillAmount('');
    setShowAddBillModal(false);
  };

  const handleSaveReminder = () => {
    setReminderSavedNotice(true);
    setTimeout(() => setReminderSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Kalender Keuangan & Pengingat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F5EBE0] dark:bg-[#32231A] text-[#B08968] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                  Kalender Keuangan Teddy
                </h3>
                <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                  Pantau hari aktif pencatatan & pengeluaran harian
                </p>
              </div>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26] text-[#7F5539] dark:text-[#F5EBE0] hover:bg-[#F5EBE0]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0] min-w-28 text-center">
                {INDONESIAN_MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26] text-[#7F5539] dark:text-[#F5EBE0] hover:bg-[#F5EBE0]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8D6E63] mb-2 border-b border-[#F5EBE0] dark:border-[#3E2F26] pb-2">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-transparent" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const dayData = dateTxMap[dateStr];
              const isSelected = selectedDayDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`h-16 p-1 rounded-xl text-left flex flex-col justify-between border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#B08968] bg-[#F5EBE0]/60 dark:bg-[#3E2F26] shadow-xs'
                      : 'border-[#F5EBE0]/60 dark:border-[#3E2F26]/60 hover:bg-[#FAF7F2] dark:hover:bg-[#1E1714]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#7F5539] dark:text-[#F7D6E0]' : 'text-[#8D6E63]'}`}>
                      {dayNum}
                    </span>
                    {dayData && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08968]" />
                    )}
                  </div>

                  {/* Summary indicators */}
                  <div className="space-y-0.5 font-mono-numbers text-[9px]">
                    {dayData && dayData.income > 0 && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold truncate leading-none">
                        +{(dayData.income / 1000).toFixed(0)}k
                      </div>
                    )}
                    {dayData && dayData.expense > 0 && (
                      <div className="text-rose-700 dark:text-rose-400 font-semibold truncate leading-none">
                        -{(dayData.expense / 1000).toFixed(0)}k
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details for clicked day */}
          {selectedDayDate && (
            <div className="mt-5 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1714] border border-[#F5EBE0] dark:border-[#3E2F26]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                  Rincian Tanggal: {formatDateIndo(selectedDayDate, true)}
                </span>
                <button
                  onClick={() => onOpenNewTransactionWithDate(selectedDayDate)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B08968] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Catat di Tanggal Ini
                </button>
              </div>

              {selectedDateTransactions.length === 0 ? (
                <p className="text-xs text-[#8D6E63] py-2">
                  Tidak ada transaksi tercatat pada tanggal ini.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {selectedDateTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs bg-white dark:bg-[#251C17] p-2.5 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26]"
                    >
                      <div>
                        <span className="font-semibold text-[#5D4037] dark:text-[#E2D5CC]">
                          {tx.category}
                        </span>
                        <span className="text-[#8D6E63] text-[11px] block">{tx.paymentMethod} · {tx.notes || 'Tanpa catatan'}</span>
                      </div>
                      <span className={`font-mono-numbers font-bold ${
                        tx.type === 'Pemasukan' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}>
                        {tx.type === 'Pemasukan' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Tagihan Bulanan & Reminder Harian */}
        <div className="space-y-6">
          {/* Tagihan Bulanan Manager */}
          <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#B08968]" />
                <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                  Notifikasi Tagihan Rutin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBillModal(true)}
                className="text-xs text-[#B08968] hover:underline font-semibold"
              >
                + Tambah
              </button>
            </div>

            <p className="text-xs text-[#8D6E63] dark:text-[#A99385] mb-3">
              Tagihan jatuh tempo tiap bulan agar tidak terkena denda keterlambatan.
            </p>

            <div className="space-y-2.5">
              {billReminders.map((bill) => (
                <div
                  key={bill.id}
                  className={`p-3 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                    bill.isPaidThisMonth
                      ? 'bg-emerald-50/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-[#FAF7F2] dark:bg-[#1E1714] border-[#F5EBE0] dark:border-[#3E2F26] text-[#5D4037] dark:text-[#E2D5CC]'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{bill.title}</span>
                      {bill.isPaidThisMonth && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-semibold">
                          Lunas
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8D6E63] dark:text-[#A99385] mt-0.5">
                      Jatuh tempo: Tgl {bill.dueDay} · {formatRupiah(bill.amount)}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleBillPaid(bill.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      bill.isPaidThisMonth
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-[#B08968] text-white hover:bg-[#9C7555]'
                    }`}
                  >
                    {bill.isPaidThisMonth ? '✓ Terbayar' : 'Bayar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pengingat Catat Harian */}
          <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B08968]" />
              <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Reminder Catat Pengeluaran
              </h3>
            </div>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Teddy akan mengingatkanmu merekap pengeluaran harian di jam santaimu.
            </p>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">Status Notifikasi:</span>
              <button
                type="button"
                onClick={() => setIsReminderActive(!isReminderActive)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                  isReminderActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {isReminderActive ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">Waktu Pengingat:</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="p-1 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-xs font-mono-numbers"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveReminder}
              className="w-full py-2 text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] rounded-xl transition-colors cursor-pointer"
            >
              Simpan Jadwal Pengingat
            </button>

            {reminderSavedNotice && (
              <p className="text-[11px] text-emerald-600 text-center font-medium">
                ✓ Jadwal pengingat berhasil disimpan!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
              Tambah Tagihan Bulanan
            </h3>

            <form onSubmit={handleCreateBill} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tagihan Listrik PLN"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Estimasi Nominal (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 450.000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm font-mono-numbers text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Jatuh Tempo (Tanggal tiap bulan)</label>
                <select
                  value={billDueDay}
                  onChange={(e) => setBillDueDay(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0]"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Tanggal {d} tiap bulan
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-[#8D6E63] hover:bg-[#F5EBE0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] rounded-xl shadow-xs"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
