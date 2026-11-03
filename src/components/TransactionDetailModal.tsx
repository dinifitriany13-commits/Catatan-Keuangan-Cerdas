import React from 'react';
import { X, Calendar, CreditCard, Banknote, Tag, FileText, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo, getPaymentBadge, isCashlessMethod } from '../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'Pemasukan';
  const badge = getPaymentBadge(transaction.paymentMethod);
  const isCashless = isCashlessMethod(transaction.paymentMethod);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl shadow-xl overflow-hidden">
        {/* Receipt Header Banner */}
        <div className="bg-[#FAF7F2] dark:bg-[#1E1714] p-6 text-center border-b border-dashed border-[#B08968]/30 relative">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-[#F7D6E0] shadow-sm mb-2 bg-[#F5EBE0]">
            <img
              src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
              alt="Cute Teddy Stamp"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0] flex items-center justify-center gap-1.5">
            <span>Teddy Finance Receipt</span>
            <span className="text-rose-400">♥</span>
          </h3>
          <p className="text-[11px] text-[#8D6E63] dark:text-[#A99385]">
            Bukti Transaksi Keuangan Pribadi Sahabat Teddy
          </p>

          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isIncome
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {isIncome ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
              {transaction.type}
            </span>
            <div className="font-mono-numbers text-2xl sm:text-3xl font-extrabold text-[#7F5539] dark:text-[#F5EBE0] mt-1">
              {isIncome ? '+' : '-'}{formatRupiah(transaction.amount)}
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <span className="text-[#8D6E63] dark:text-[#A99385]">ID Transaksi:</span>
            <span className="font-mono-numbers text-[#5D4037] dark:text-[#E2D5CC] font-semibold">{transaction.id}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <span className="text-[#8D6E63] dark:text-[#A99385]">Tanggal:</span>
            <span className="text-[#5D4037] dark:text-[#E2D5CC] font-medium">
              {formatDateIndo(transaction.date, true)} ({transaction.day})
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <span className="text-[#8D6E63] dark:text-[#A99385]">Kategori:</span>
            <span className="font-semibold text-[#5D4037] dark:text-[#E2D5CC]">{transaction.category}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#F5EBE0] dark:border-[#3E2F26]">
            <span className="text-[#8D6E63] dark:text-[#A99385]">Metode:</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
              {isCashless ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
              {transaction.paymentMethod} ({isCashless ? 'Cashless' : 'Cash'})
            </span>
          </div>

          <div className="py-1.5">
            <span className="text-[#8D6E63] dark:text-[#A99385] block mb-1">Catatan:</span>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1714] text-[#5D4037] dark:text-[#E2D5CC] border border-[#F5EBE0] dark:border-[#3E2F26]">
              {transaction.notes || 'Tidak ada catatan tambahan'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] dark:bg-[#1E1714] border-t border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8D6E63] hover:bg-[#F5EBE0]"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] shadow-xs"
          >
            Edit Transaksi
          </button>
        </div>
      </div>
    </div>
  );
};
