export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format number to Indonesian Rupiah currency: Rp 1.500.000
 */
export function formatRupiah(value: number): string {
  if (isNaN(value)) return 'Rp 0';
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format raw number with thousand separators
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Parse string to clean number for currency inputs
 */
export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Get Indonesian day name from date string YYYY-MM-DD
 */
export function getIndonesianDay(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return INDONESIAN_DAYS[d.getDay()] || '';
}

/**
 * Format YYYY-MM-DD to "03 Nov 2026"
 */
export function formatDateIndo(dateString: string, full = false): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const monthName = full ? INDONESIAN_MONTHS[d.getMonth()] : INDONESIAN_MONTHS[d.getMonth()].slice(0, 3);
  return `${day.toString().padStart(2, '0')} ${monthName} ${year}`;
}

/**
 * Check if method is Cashless
 */
export function isCashlessMethod(method: string): boolean {
  return method.toLowerCase() !== 'tunai';
}

/**
 * Get visual branding badge details for payment methods
 */
export function getPaymentBadge(method: string) {
  switch (method) {
    case 'QRIS':
      return { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', type: 'cashless' };
    case 'GoPay':
      return { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', type: 'cashless' };
    case 'OVO':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', type: 'cashless' };
    case 'DANA':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', type: 'cashless' };
    case 'ShopeePay':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', type: 'cashless' };
    case 'LinkAja':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', type: 'cashless' };
    case 'Transfer Bank':
    case 'Debit':
    case 'Kredit':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', type: 'cashless' };
    case 'PayPal':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', type: 'cashless' };
    case 'Tunai':
    default:
      return { bg: 'bg-[#F5EBE0] dark:bg-[#32231A]', text: 'text-[#B08968] dark:text-[#DDB892]', border: 'border-[#B08968]/30', type: 'cash' };
  }
}
