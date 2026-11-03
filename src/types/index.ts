export type TransactionType = 'Pemasukan' | 'Pengeluaran';

export const INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'THR',
  'Freelance',
  'Komisi',
  'Penjualan',
  'Investasi',
  'Dividen',
  'Cashback',
  'Hadiah',
  'Uang Saku',
  'Pendapatan Lainnya',
] as const;

export const EXPENSE_CATEGORIES = [
  'Makan & Minum',
  'Belanja Bulanan',
  'Tagihan Listrik',
  'Tagihan Air',
  'Internet',
  'Pulsa',
  'Transportasi',
  'BBM',
  'Pendidikan',
  'Kesehatan',
  'Hiburan',
  'Liburan',
  'Cicilan',
  'Pajak',
  'Sedekah',
  'Donasi',
  'Perawatan Rumah',
  'Perawatan Kendaraan',
  'Fashion',
  'Skincare',
  'Elektronik',
  'Pengeluaran Lainnya',
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const PAYMENT_METHODS = {
  cash: ['Tunai'],
  cashless: [
    'Transfer Bank',
    'Debit',
    'Kredit',
    'QRIS',
    'OVO',
    'DANA',
    'GoPay',
    'ShopeePay',
    'LinkAja',
    'PayPal',
  ],
} as const;

export type PaymentMethod = 'Tunai' | typeof PAYMENT_METHODS.cashless[number];

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // Senin, Selasa, dll
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod | string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavingsTarget {
  id: string;
  targetName: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // YYYY-MM-DD
  status: 'active' | 'completed';
  createdAt: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1 - 31
  category: string;
  isPaidThisMonth: boolean;
  notes?: string;
}

export interface FilterOptions {
  searchQuery: string;
  startDate: string;
  endDate: string;
  day: string;
  month: string;
  year: string;
  type: string;
  category: string;
  paymentMethod: string;
}
