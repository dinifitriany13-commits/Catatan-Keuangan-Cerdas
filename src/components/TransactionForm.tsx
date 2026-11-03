import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, Check, Tag, CreditCard } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
} from '../types';
import { getIndonesianDay, formatRupiah, parseCurrencyInput, getPaymentBadge, isCashlessMethod } from '../utils/formatters';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [day, setDay] = useState<string>(getIndonesianDay(today));
  const [type, setType] = useState<TransactionType>('Pengeluaran');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setDay(editingTransaction.day || getIndonesianDay(editingTransaction.date));
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod);
      setAmountRaw(editingTransaction.amount.toString());
      setNotes(editingTransaction.notes || '');
    } else {
      setDate(today);
      setDay(getIndonesianDay(today));
      setType('Pengeluaran');
      setCategory(EXPENSE_CATEGORIES[0]);
      setPaymentMethod('QRIS');
      setAmountRaw('');
      setNotes('');
    }
    setErrorMsg('');
  }, [editingTransaction, isOpen, today]);

  // When date changes, automatically calculate Indonesian day
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setDay(getIndonesianDay(newDate));
  };

  // When type changes, adjust default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'Pemasukan') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  // Quick increment buttons
  const addAmount = (increment: number) => {
    const current = parseCurrencyInput(amountRaw);
    setAmountRaw((current + increment).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amountRaw);

    if (parsedAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari Rp 0');
      return;
    }

    if (!category) {
      setErrorMsg('Silakan pilih kategori transaksi');
      return;
    }

    onSubmit({
      date,
      day: day || getIndonesianDay(date),
      type,
      category,
      paymentMethod,
      amount: parsedAmount,
      notes,
    });

    onClose();
  };

  if (!isOpen) return null;

  const currentBadge = getPaymentBadge(paymentMethod);
  const isCashless = isCashlessMethod(paymentMethod);
  const currentCategories = type === 'Pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl shadow-xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#1E1714]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#F7D6E0] shadow-xs bg-[#F5EBE0] shrink-0">
              <img
                src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
                alt="Cute Teddy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
                {editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <p className="text-xs text-[#8D6E63] dark:text-[#C5B3A6]">
                Isi form lengkap untuk pencatatan otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-[#8D6E63] hover:text-[#7F5539] dark:hover:text-white hover:bg-[#F5EBE0] dark:hover:bg-[#32231A] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[#5D4037] dark:text-[#E2D5CC]">
          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {/* Jenis Transaksi Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8D6E63] dark:text-[#C5B3A6] mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] dark:bg-[#1E1714] rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26]">
              <button
                type="button"
                onClick={() => handleTypeChange('Pengeluaran')}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  type === 'Pengeluaran'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-[#8D6E63] dark:text-[#C5B3A6] hover:text-rose-600'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Pemasukan')}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  type === 'Pemasukan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#8D6E63] dark:text-[#C5B3A6] hover:text-emerald-600'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Tanggal & Hari (Hari Otomatis) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6] mb-1">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6] mb-1">
                Hari (Otomatis)
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#F5EBE0]/50 dark:bg-[#32231A] text-sm font-medium text-[#7F5539] dark:text-[#F7D6E0] flex items-center justify-between">
                <span>{day || '-'}</span>
                <span className="text-[11px] text-[#B08968] font-normal">Sistem</span>
              </div>
            </div>
          </div>

          {/* Kategori Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6] mb-1">
              Kategori ({type})
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metode Pembayaran Dropdown (Cash & Cashless with Badge & Icon) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6]">
                Metode Pembayaran
              </label>
              {/* Cashless badge display as requested */}
              {isCashless && (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
                  <CreditCard className="w-3 h-3" /> Cashless ({paymentMethod})
                </span>
              )}
            </div>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
            >
              <optgroup label="💵 Cash">
                {PAYMENT_METHODS.cash.map((m) => (
                  <option key={m} value={m}>
                    {m} (Uang Tunai Fisik)
                  </option>
                ))}
              </optgroup>
              <optgroup label="💳 Cashless (Nontunai)">
                {PAYMENT_METHODS.cashless.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Nominal Currency Input with Quick Add Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6]">
                Nominal (IDR)
              </label>
              <span className="font-mono-numbers text-xs font-bold text-[#B08968] dark:text-[#DDB892]">
                {formatRupiah(parseCurrencyInput(amountRaw))}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8D6E63]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountRaw ? new Intl.NumberFormat('id-ID').format(parseCurrencyInput(amountRaw)) : ''}
                onChange={(e) => setAmountRaw(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] font-mono-numbers text-base font-semibold text-[#7F5539] dark:text-[#F5EBE0] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-[#8D6E63] mr-1">Cepat:</span>
              {[20000, 50000, 100000, 500000, 1000000].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => addAmount(inc)}
                  className="px-2 py-1 text-[11px] rounded-lg bg-[#F5EBE0] dark:bg-[#32231A] text-[#7F5539] dark:text-[#DDB892] hover:bg-[#B08968] hover:text-white transition-colors"
                >
                  +{new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(inc)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountRaw('')}
                className="px-2 py-1 text-[11px] rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Catatan (Text Area) */}
          <div>
            <label className="block text-xs font-semibold text-[#8D6E63] dark:text-[#C5B3A6] mb-1">
              Catatan / Keterangan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Makan siang rendang + es jeruk..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0] focus:outline-none focus:ring-2 focus:ring-[#B08968]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#8D6E63] hover:bg-[#F5EBE0] dark:hover:bg-[#32231A] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#B08968] hover:bg-[#9C7555] active:scale-98 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
