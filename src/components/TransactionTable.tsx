import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  Edit2,
  Trash2,
  Eye,
  CreditCard,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Transaction,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  FilterOptions,
} from '../types';
import {
  formatRupiah,
  formatDateIndo,
  getPaymentBadge,
  isCashlessMethod,
  INDONESIAN_DAYS,
  INDONESIAN_MONTHS,
} from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onViewDetail: (tx: Transaction) => void;
  onOpenNew: () => void;
  onExportCSV: (filtered: Transaction[]) => void;
  onPrintReport: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetail,
  onOpenNew,
  onExportCSV,
  onPrintReport,
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDay('');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedMethod('');
    setCurrentPage(1);
  };

  // Derive unique years from transactions
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach((t) => {
      if (t.date) years.add(t.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  }, [transactions]);

  // Combined categories for filter
  const allCategories = useMemo(() => {
    return Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])).sort();
  }, []);

  const allPaymentMethods = useMemo(() => {
    return [...PAYMENT_METHODS.cash, ...PAYMENT_METHODS.cashless];
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search in notes or category
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const inCategory = (t.category || '').toLowerCase().includes(query);
        const inNotes = (t.notes || '').toLowerCase().includes(query);
        const inMethod = (t.paymentMethod || '').toLowerCase().includes(query);
        if (!inCategory && !inNotes && !inMethod) return false;
      }

      // Day filter
      if (selectedDay && t.day !== selectedDay) {
        return false;
      }

      // Date range filter
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Month filter (01 to 12)
      if (selectedMonth) {
        const monthPart = t.date.split('-')[1];
        if (monthPart !== selectedMonth) return false;
      }

      // Year filter
      if (selectedYear) {
        const yearPart = t.date.split('-')[0];
        if (yearPart !== selectedYear) return false;
      }

      // Type filter
      if (selectedType && t.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory && t.category !== selectedCategory) {
        return false;
      }

      // Method filter
      if (selectedMethod) {
        if (selectedMethod === 'CASH_GROUP' && isCashlessMethod(t.paymentMethod)) return false;
        if (selectedMethod === 'CASHLESS_GROUP' && !isCashlessMethod(t.paymentMethod)) return false;
        if (selectedMethod !== 'CASH_GROUP' && selectedMethod !== 'CASHLESS_GROUP' && t.paymentMethod !== selectedMethod) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    selectedDay,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    selectedType,
    selectedCategory,
    selectedMethod,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const activeFilterCount = [
    searchQuery,
    selectedDay,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    selectedType,
    selectedCategory,
    selectedMethod,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top Action & Control Bar */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D6E63] dark:text-[#A99385]" />
            <input
              type="text"
              placeholder="Cari transaksi, kategori, catatan, atau metode..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0] placeholder-[#A99385] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
            />
          </div>

          {/* Action Buttons: Filter, Reset, Export Excel, Export PDF, Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#B08968] text-white border-[#B08968]'
                  : 'bg-[#FAF7F2] dark:bg-[#1E1714] border-[#F5EBE0] dark:border-[#3E2F26] text-[#7F5539] dark:text-[#E2D5CC] hover:bg-[#F5EBE0]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset Semua Filter"
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onExportCSV(filteredTransactions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
              title="Unduh file Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              onClick={onPrintReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#F5EBE0] dark:bg-[#3E2F26] text-[#7F5539] dark:text-[#F7D6E0] border border-[#B08968]/30 hover:bg-[#B08968] hover:text-white transition-colors cursor-pointer"
              title="Cetak atau Simpan PDF Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#F5EBE0] dark:border-[#3E2F26] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Filter Jenis */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Jenis Transaksi
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Jenis (Pemasukan & Pengeluaran)</option>
                <option value="Pemasukan">Hanya Pemasukan</option>
                <option value="Pengeluaran">Hanya Pengeluaran</option>
              </select>
            </div>

            {/* Filter Hari */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Hari
              </label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Hari</option>
                {INDONESIAN_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Bulan */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Bulan</option>
                {INDONESIAN_MONTHS.map((m, idx) => {
                  const val = (idx + 1).toString().padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {m}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter Tahun */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Kategori</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Metode Pembayaran */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Metode Pembayaran
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              >
                <option value="">Semua Metode</option>
                <option value="CASH_GROUP">💵 Hanya Tunai (Cash)</option>
                <option value="CASHLESS_GROUP">💳 Semua Cashless (Nontunai)</option>
                {allPaymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Rentang Tanggal Mulai */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              />
            </div>

            {/* Rentang Tanggal Selesai */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8D6E63] dark:text-[#A99385] mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl shadow-xs overflow-hidden">
        {/* Table summary kicker */}
        <div className="px-5 py-3 border-b border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between text-xs text-[#8D6E63] dark:text-[#A99385]">
          <span>
            Menampilkan <strong className="text-[#7F5539] dark:text-[#F7D6E0]">{filteredTransactions.length}</strong> transaksi ditemukan
          </span>
          <span>Halaman {currentPage} dari {totalPages}</span>
        </div>

        {/* Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F2] dark:bg-[#1E1714] text-xs font-semibold text-[#8D6E63] dark:text-[#A99385] uppercase tracking-wider border-b border-[#F5EBE0] dark:border-[#3E2F26]">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-3">Hari</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBE0] dark:divide-[#3E2F26]">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-[#F7D6E0] shadow-sm bg-[#F5EBE0]">
                        <img
                          src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
                          alt="Cute Teddy Empty"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                        Belum Ada Catatan Transaksi
                      </p>
                      <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                        Coba sesuaikan kata kunci atau filter pencarian Anda, atau catat transaksi baru.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenNew}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] rounded-xl shadow-xs transition-all"
                      >
                        + Catat Transaksi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isIncome = tx.type === 'Pemasukan';
                  const badge = getPaymentBadge(tx.paymentMethod);
                  const isCashless = isCashlessMethod(tx.paymentMethod);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#FAF7F2]/70 dark:hover:bg-[#2A201A]/60 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#7F5539] dark:text-[#E2D5CC]">
                        {formatDateIndo(tx.date)}
                      </td>

                      {/* Hari (Otomatis) */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs font-medium text-[#8D6E63] dark:text-[#C5B3A6]">
                        {tx.day}
                      </td>

                      {/* Jenis */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isIncome
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {tx.type}
                        </span>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-[#5D4037] dark:text-[#F5EBE0]">
                        {tx.category}
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {isCashless ? (
                            <CreditCard className="w-3 h-3 shrink-0" />
                          ) : (
                            <Banknote className="w-3 h-3 shrink-0" />
                          )}
                          <span>{tx.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono-numbers text-sm font-bold">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }
                        >
                          {isIncome ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-4 text-xs text-[#8D6E63] dark:text-[#A99385] max-w-xs truncate" title={tx.notes}>
                        {tx.notes || '-'}
                      </td>

                      {/* Aksi: Edit, Hapus, Detail */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onViewDetail(tx)}
                            title="Lihat Detail Transaksi"
                            className="w-7 h-7 rounded-lg text-[#8D6E63] hover:text-[#7F5539] dark:hover:text-white hover:bg-[#F5EBE0] dark:hover:bg-[#3E2F26] flex items-center justify-center transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(tx)}
                            title="Edit Transaksi"
                            className="w-7 h-7 rounded-lg text-[#8D6E63] hover:text-[#B08968] dark:hover:text-[#DDB892] hover:bg-[#F5EBE0] dark:hover:bg-[#3E2F26] flex items-center justify-center transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(tx.id)}
                            title="Hapus Transaksi"
                            className="w-7 h-7 rounded-lg text-[#8D6E63] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between">
            <span className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26] text-xs text-[#7F5539] dark:text-[#F5EBE0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5EBE0] flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  type="button"
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pg
                      ? 'bg-[#B08968] text-white shadow-xs'
                      : 'border border-[#F5EBE0] dark:border-[#3E2F26] text-[#7F5539] dark:text-[#F5EBE0] hover:bg-[#F5EBE0]'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-[#F5EBE0] dark:border-[#3E2F26] text-xs text-[#7F5539] dark:text-[#F5EBE0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5EBE0] flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
