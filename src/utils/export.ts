import { Transaction } from '../types';

/**
 * Export transactions to CSV format compatible with Microsoft Excel & Google Sheets
 */
export function exportToCSV(transactions: Transaction[], filename = 'teddy-finance-transaksi.csv') {
  const headers = ['ID', 'Tanggal', 'Hari', 'Jenis', 'Kategori', 'Metode Pembayaran', 'Tipe Metode', 'Nominal (IDR)', 'Catatan'];
  
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.day,
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    t.paymentMethod.toLowerCase() === 'tunai' ? 'Cash' : 'Cashless',
    t.amount,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger print dialog with specific print styling
 */
export function printReport() {
  window.print();
}

/**
 * Export entire application state to a JSON backup file
 */
export function exportBackupJSON(data: Record<string, unknown>, filename = 'teddy-finance-backup.json') {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
