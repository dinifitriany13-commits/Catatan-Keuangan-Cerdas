import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Scale, CreditCard, Banknote } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface DashboardStatsProps {
  totalSaldo: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  cashTotal: number;
  cashlessTotal: number;
  selectedMonthName: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSaldo,
  totalIncomeMonth,
  totalExpenseMonth,
  cashTotal,
  cashlessTotal,
  selectedMonthName,
}) => {
  const selisih = totalIncomeMonth - totalExpenseMonth;
  const isProfit = selisih >= 0;

  const totalVol = cashTotal + cashlessTotal;
  const cashlessPercent = totalVol > 0 ? Math.round((cashlessTotal / totalVol) * 100) : 0;
  const cashPercent = totalVol > 0 ? 100 - cashlessPercent : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#8D6E63] dark:text-[#C5B3A6] px-1">
        <span>Periode Ringkasan: <strong className="text-[#7F5539] dark:text-[#F7D6E0]">{selectedMonthName}</strong></span>
        <span>Akumulasi Saldo Riil</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saldo = Coklat (#B08968) */}
        <div className="relative overflow-hidden bg-white dark:bg-[#251C17] border border-[#B08968]/30 dark:border-[#7F5539]/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B08968] dark:text-[#DDB892]">
              Total Saldo
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#B08968]/15 dark:bg-[#B08968]/25 text-[#B08968] dark:text-[#DDB892] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono-numbers text-2xl sm:text-3xl font-extrabold text-[#7F5539] dark:text-[#F5EBE0] tracking-tight">
            {formatRupiah(totalSaldo)}
          </div>
          <div className="mt-2 text-xs text-[#8D6E63] dark:text-[#A99385] flex items-center gap-1.5">
            <span>Kas Tersedia (Cash + Bank/E-Wallet)</span>
          </div>
        </div>

        {/* Card 2: Pemasukan Bulan Ini = Hijau Soft */}
        <div className="relative overflow-hidden bg-white dark:bg-[#251C17] border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Pemasukan Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono-numbers text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
            +{formatRupiah(totalIncomeMonth)}
          </div>
          <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80 flex items-center gap-1.5">
            <span>Gaji, Bonus, Freelance & Lainnya</span>
          </div>
        </div>

        {/* Card 3: Pengeluaran Bulan Ini = Merah Soft */}
        <div className="relative overflow-hidden bg-white dark:bg-[#251C17] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Pengeluaran Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono-numbers text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-300 tracking-tight">
            -{formatRupiah(totalExpenseMonth)}
          </div>
          <div className="mt-2 text-xs text-rose-700/80 dark:text-rose-400/80 flex items-center gap-1.5">
            <span>Kebutuhan pokok, jajan & tagihan</span>
          </div>
        </div>

        {/* Card 4: Selisih (Profit / Defisit) = Pink Soft (#F7D6E0) */}
        <div className="relative overflow-hidden bg-[#FFF5F8] dark:bg-[#2D1C22] border border-[#F7D6E0] dark:border-[#5C303F] rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A84B6E] dark:text-[#F7D6E0]">
              Selisih ({isProfit ? 'Surplus / Profit' : 'Defisit'})
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F7D6E0] dark:bg-[#5C303F] text-[#A84B6E] dark:text-[#FEEAF0] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className={`font-mono-numbers text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isProfit ? 'text-[#8E284E] dark:text-[#FEEAF0]' : 'text-rose-600 dark:text-rose-300'
          }`}>
            {isProfit ? `+${formatRupiah(selisih)}` : `-${formatRupiah(Math.abs(selisih))}`}
          </div>
          <div className="mt-2 text-xs text-[#8E284E]/80 dark:text-[#F7D6E0]/80 flex items-center gap-1.5">
            <span>{isProfit ? 'Kondisi keuangan sehat & produktif' : 'Perlu atur ulang pos pengeluaran'}</span>
          </div>
        </div>
      </div>

      {/* Cash vs Cashless Quick Distribution Bar */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0] uppercase tracking-wide">
              Komposisi Transaksi Kas vs Nontunai
            </span>
            <span className="text-[11px] text-[#8D6E63] dark:text-[#A99385]">· Rasio Pembayaran</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-numbers">
            <span className="flex items-center gap-1.5 text-[#B08968] dark:text-[#DDB892]">
              <Banknote className="w-3.5 h-3.5" /> Cash (Tunai): {formatRupiah(cashTotal)} ({cashPercent}%)
            </span>
            <span className="flex items-center gap-1.5 text-[#A84B6E] dark:text-[#F7D6E0]">
              <CreditCard className="w-3.5 h-3.5" /> Cashless: {formatRupiah(cashlessTotal)} ({cashlessPercent}%)
            </span>
          </div>
        </div>

        {/* Visual Dual Progress Track */}
        <div className="h-2.5 w-full bg-[#FAF7F2] dark:bg-[#1E1714] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${cashPercent}%` }}
            className="bg-[#B08968] transition-all duration-500"
            title={`Tunai: ${cashPercent}%`}
          />
          <div
            style={{ width: `${cashlessPercent}%` }}
            className="bg-[#F7D6E0] dark:bg-[#A84B6E] transition-all duration-500"
            title={`Cashless: ${cashlessPercent}%`}
          />
        </div>
      </div>
    </div>
  );
};
