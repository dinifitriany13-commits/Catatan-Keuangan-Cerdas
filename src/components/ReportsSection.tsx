import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  INDONESIAN_MONTHS,
} from '../utils/formatters';
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { exportToCSV, printReport } from '../utils/export';

interface ReportsSectionProps {
  transactions: Transaction[];
  selectedYear: string;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ transactions, selectedYear }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string>('11'); // Default Nov

  // 1. Rekap Harian: Tanggal | Pemasukan | Pengeluaran | Saldo Harian
  const dailyReports = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number; day: string }> = {};

    transactions.forEach((t) => {
      const [yr, mo] = t.date.split('-');
      if (yr !== selectedYear) return;
      if (selectedMonth && mo !== selectedMonth) return;

      if (!map[t.date]) {
        map[t.date] = { income: 0, expense: 0, count: 0, day: t.day };
      }
      if (t.type === 'Pemasukan') {
        map[t.date].income += t.amount;
      } else {
        map[t.date].expense += t.amount;
      }
      map[t.date].count += 1;
    });

    return Object.entries(map)
      .map(([date, data]) => ({
        date,
        day: data.day,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
        count: data.count,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedYear, selectedMonth]);

  // 2. Rekap Mingguan: Total Pemasukan | Total Pengeluaran | Selisih (per Week of the month / year)
  const weeklyReports = useMemo(() => {
    // Break month into Week 1 (1-7), Week 2 (8-14), Week 3 (15-21), Week 4 (22-28), Week 5 (29-end)
    const weeks = [
      { id: 'w1', label: 'Minggu I (Tgl 01 - 07)', start: 1, end: 7, income: 0, expense: 0 },
      { id: 'w2', label: 'Minggu II (Tgl 08 - 14)', start: 8, end: 14, income: 0, expense: 0 },
      { id: 'w3', label: 'Minggu III (Tgl 15 - 21)', start: 15, end: 21, income: 0, expense: 0 },
      { id: 'w4', label: 'Minggu IV (Tgl 22 - 28)', start: 22, end: 28, income: 0, expense: 0 },
      { id: 'w5', label: 'Minggu V (Tgl 29 - Akhir)', start: 29, end: 31, income: 0, expense: 0 },
    ];

    transactions.forEach((t) => {
      const [yr, mo, da] = t.date.split('-');
      if (yr !== selectedYear) return;
      if (selectedMonth && mo !== selectedMonth) return;

      const dayNum = parseInt(da, 10);
      const targetWeek = weeks.find((w) => dayNum >= w.start && dayNum <= w.end);
      if (targetWeek) {
        if (t.type === 'Pemasukan') {
          targetWeek.income += t.amount;
        } else {
          targetWeek.expense += t.amount;
        }
      }
    });

    return weeks.map((w) => ({
      ...w,
      net: w.income - w.expense,
    }));
  }, [transactions, selectedYear, selectedMonth]);

  // 3. Rekap Bulanan: Total Pemasukan | Total Pengeluaran | Saldo Akhir | Kategori Terbesar | Pengeluaran Terbesar | Pemasukan Terbesar
  const monthlyReports = useMemo(() => {
    return INDONESIAN_MONTHS.map((monthName, idx) => {
      const monthStr = (idx + 1).toString().padStart(2, '0');
      const monthlyTx = transactions.filter((t) => {
        const [yr, mo] = t.date.split('-');
        return yr === selectedYear && mo === monthStr;
      });

      const incomeTx = monthlyTx.filter((t) => t.type === 'Pemasukan');
      const expenseTx = monthlyTx.filter((t) => t.type === 'Pengeluaran');

      const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
      const finalSaldo = totalIncome - totalExpense;

      // Find largest expense category
      const expCategoryMap: Record<string, number> = {};
      expenseTx.forEach((t) => {
        expCategoryMap[t.category] = (expCategoryMap[t.category] || 0) + t.amount;
      });
      const topExpCatEntry = Object.entries(expCategoryMap).sort((a, b) => b[1] - a[1])[0];

      // Find largest single expense transaction
      const topSingleExpense = expenseTx.sort((a, b) => b.amount - a.amount)[0];

      // Find largest single income transaction
      const topSingleIncome = incomeTx.sort((a, b) => b.amount - a.amount)[0];

      return {
        monthStr,
        monthName,
        totalIncome,
        totalExpense,
        finalSaldo,
        topCategory: topExpCatEntry ? `${topExpCatEntry[0]} (${formatRupiah(topExpCatEntry[1])})` : '-',
        largestExpense: topSingleExpense ? `${topSingleExpense.category}: ${formatRupiah(topSingleExpense.amount)}` : '-',
        largestIncome: topSingleIncome ? `${topSingleIncome.category}: ${formatRupiah(topSingleIncome.amount)}` : '-',
        txCount: monthlyTx.length,
      };
    });
  }, [transactions, selectedYear]);

  // 4. Rekap Tahunan: Total Pemasukan Tahunan | Total Pengeluaran Tahunan | Tren Keuangan
  const yearlyReport = useMemo(() => {
    const yearTx = transactions.filter((t) => t.date.startsWith(selectedYear));
    const totalIncome = yearTx
      .filter((t) => t.type === 'Pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = yearTx
      .filter((t) => t.type === 'Pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRatio = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    return {
      year: selectedYear,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatio,
      txCount: yearTx.length,
    };
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Controls */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Report Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] dark:bg-[#1E1714] rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] overflow-x-auto">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F7D6E0] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#7F5539]'
              }`}
            >
              Rekap Harian
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F7D6E0] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#7F5539]'
              }`}
            >
              Rekap Mingguan
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F7D6E0] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#7F5539]'
              }`}
            >
              Rekap Bulanan
            </button>
            <button
              onClick={() => setReportType('yearly')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                reportType === 'yearly'
                  ? 'bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F7D6E0] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#7F5539]'
              }`}
            >
              Rekap Tahunan
            </button>
          </div>

          {/* Month selector for Daily & Weekly */}
          {(reportType === 'daily' || reportType === 'weekly') && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8D6E63]">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0] font-medium"
              >
                {INDONESIAN_MONTHS.map((m, idx) => {
                  const val = (idx + 1).toString().padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {m} {selectedYear}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Export & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(transactions, `rekap-${reportType}-${selectedYear}.csv`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F5EBE0] dark:bg-[#3E2F26] text-[#7F5539] dark:text-[#F7D6E0] border border-[#B08968]/30 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. REKAP HARIAN */}
      {reportType === 'daily' && (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Rekap Harian — {INDONESIAN_MONTHS[parseInt(selectedMonth, 10) - 1]} {selectedYear}
              </h3>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Menampilkan: Tanggal | Pemasukan | Pengeluaran | Saldo Harian
              </p>
            </div>
            <span className="text-xs font-mono-numbers text-[#8D6E63]">
              {dailyReports.length} Hari Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] dark:bg-[#1E1714] text-xs font-semibold text-[#8D6E63] dark:text-[#A99385] uppercase tracking-wider border-b border-[#F5EBE0] dark:border-[#3E2F26]">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-3">Hari</th>
                  <th className="py-3 px-4 text-right">Pemasukan</th>
                  <th className="py-3 px-4 text-right">Pengeluaran</th>
                  <th className="py-3 px-4 text-right">Saldo Harian (Net)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE0] dark:divide-[#3E2F26]">
                {dailyReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#8D6E63]">
                      Belum ada catatan transaksi pada bulan ini.
                    </td>
                  </tr>
                ) : (
                  dailyReports.map((row) => (
                    <tr key={row.date} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-xs text-[#7F5539] dark:text-[#E2D5CC]">
                        {formatDateIndo(row.date)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-xs text-[#8D6E63]">
                        {row.day}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.income > 0 ? `+${formatRupiah(row.income)}` : '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs font-semibold text-rose-700 dark:text-rose-400">
                        {row.expense > 0 ? `-${formatRupiah(row.expense)}` : '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs font-bold">
                        <span className={row.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                          {row.net >= 0 ? '+' : ''}{formatRupiah(row.net)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          row.net >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {row.net >= 0 ? 'Surplus' : 'Defisit'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. REKAP MINGGUAN */}
      {reportType === 'weekly' && (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
              Rekap Mingguan — {INDONESIAN_MONTHS[parseInt(selectedMonth, 10) - 1]} {selectedYear}
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Menampilkan: Total Pemasukan | Total Pengeluaran | Selisih per Pekan
            </p>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyReports.map((week) => (
              <div
                key={week.id}
                className="bg-[#FAF7F2] dark:bg-[#1E1714] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-4 shadow-xs"
              >
                <div className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0] mb-3 border-b border-[#F5EBE0] dark:border-[#3E2F26] pb-2">
                  {week.label}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8D6E63]">Total Pemasukan:</span>
                    <span className="font-mono-numbers font-semibold text-emerald-700 dark:text-emerald-400">
                      +{formatRupiah(week.income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8D6E63]">Total Pengeluaran:</span>
                    <span className="font-mono-numbers font-semibold text-rose-700 dark:text-rose-400">
                      -{formatRupiah(week.expense)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between font-bold">
                    <span className="text-[#7F5539] dark:text-[#F5EBE0]">Selisih (Net):</span>
                    <span className={`font-mono-numbers ${week.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {week.net >= 0 ? '+' : ''}{formatRupiah(week.net)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REKAP BULANAN */}
      {reportType === 'monthly' && (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
              Rekap Bulanan — Tahun {selectedYear}
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Menampilkan: Total Pemasukan | Total Pengeluaran | Saldo Akhir | Kategori Terbesar | Pengeluaran Terbesar | Pemasukan Terbesar
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] dark:bg-[#1E1714] text-xs font-semibold text-[#8D6E63] dark:text-[#A99385] uppercase tracking-wider border-b border-[#F5EBE0] dark:border-[#3E2F26]">
                <tr>
                  <th className="py-3 px-4">Bulan</th>
                  <th className="py-3 px-4 text-right">Total Pemasukan</th>
                  <th className="py-3 px-4 text-right">Total Pengeluaran</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3 px-4">Kategori Terbesar</th>
                  <th className="py-3 px-4">Pengeluaran Terbesar</th>
                  <th className="py-3 px-4">Pemasukan Terbesar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE0] dark:divide-[#3E2F26]">
                {monthlyReports.map((m) => (
                  <tr key={m.monthStr} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-xs text-[#7F5539] dark:text-[#E2D5CC]">
                      {m.monthName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                      {m.totalIncome > 0 ? `+${formatRupiah(m.totalIncome)}` : '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs text-rose-700 dark:text-rose-400 font-semibold">
                      {m.totalExpense > 0 ? `-${formatRupiah(m.totalExpense)}` : '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-xs font-bold">
                      <span className={m.finalSaldo >= 0 ? 'text-[#8E284E] dark:text-[#F7D6E0]' : 'text-rose-600'}>
                        {m.finalSaldo >= 0 ? '+' : ''}{formatRupiah(m.finalSaldo)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-[#5D4037] dark:text-[#E2D5CC]">
                      {m.topCategory}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-rose-700 dark:text-rose-400">
                      {m.largestExpense}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-emerald-700 dark:text-emerald-400">
                      {m.largestIncome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REKAP TAHUNAN */}
      {reportType === 'yearly' && (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#7F5539] dark:text-[#F5EBE0]">
              Rekap Tahunan ({selectedYear})
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Menampilkan: Total Pemasukan Tahunan | Total Pengeluaran Tahunan | Tren Keuangan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
              <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                Total Pemasukan Tahunan
              </span>
              <span className="font-mono-numbers text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                +{formatRupiah(yearlyReport.totalIncome)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
              <span className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-400 block mb-1">
                Total Pengeluaran Tahunan
              </span>
              <span className="font-mono-numbers text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                -{formatRupiah(yearlyReport.totalExpense)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1714] border border-[#B08968]/30">
              <span className="text-xs font-semibold uppercase text-[#B08968] dark:text-[#DDB892] block mb-1">
                Net Tabungan & Akumulasi
              </span>
              <span className="font-mono-numbers text-2xl font-extrabold text-[#7F5539] dark:text-[#F5EBE0]">
                {formatRupiah(yearlyReport.netSavings)}
              </span>
              <span className="text-xs text-[#8D6E63] block mt-1">
                Rasio Tabungan: {yearlyReport.savingsRatio}% dari pendapatan
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF5F8] dark:bg-[#2D1C22] border border-[#F7D6E0] dark:border-[#5C303F] text-xs text-[#5D4037] dark:text-[#E2D5CC] flex items-center gap-3">
            <span className="text-2xl">🧸</span>
            <div>
              <strong className="text-[#8E284E] dark:text-[#F7D6E0] block mb-0.5">
                Evaluasi Tahunan Teddy Finance
              </strong>
              <span>
                Dengan rasio tabungan {yearlyReport.savingsRatio}%, kondisi keuangan Anda tergolong{' '}
                {yearlyReport.savingsRatio >= 20 ? 'sangat sehat (memenuhi standar ideal 20%+ tabungan)' : 'cukup baik, disarankan memperkecil pos pengeluaran impulsif'}.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
