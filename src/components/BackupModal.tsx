import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Smartphone, ShieldCheck, Check } from 'lucide-react';
import { exportBackupJSON } from '../utils/export';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullData: Record<string, unknown>;
  onRestoreData: (restored: any) => void;
  onResetToSample: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  fullData,
  onRestoreData,
  onResetToSample,
  deferredPrompt,
  onInstallPwa,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successNotice, setSuccessNotice] = useState<string>('');

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJSON(fullData, `teddy-finance-backup-${new Date().toISOString().split('T')[0]}.json`);
    setSuccessNotice('File backup JSON berhasil diunduh!');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.transactions || parsed.targets)) {
          onRestoreData(parsed);
          setSuccessNotice('Data berhasil dipulihkan dari backup!');
          setTimeout(() => setSuccessNotice(''), 3000);
        } else {
          alert('Format backup tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#F5EBE0] dark:border-[#3E2F26] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#F7D6E0] shadow-xs bg-[#F5EBE0] shrink-0">
              <img
                src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
                alt="Cute Teddy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
                Pengaturan & Backup Data
              </h3>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Simpan cadangan offline & instalasi PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#8D6E63] hover:text-[#7F5539] dark:hover:text-white hover:bg-[#F5EBE0] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successNotice && (
          <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Section 1: Backup & Restore */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B08968] dark:text-[#DDB892]">
            Cadangan Database Lokal
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExport}
              className="p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-left hover:border-[#B08968] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#B08968] mb-1.5" />
              <div className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0]">Unduh Backup</div>
              <div className="text-[10px] text-[#8D6E63]">Simpan file .JSON aman</div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-left hover:border-[#B08968] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#B08968] mb-1.5" />
              <div className="text-xs font-bold text-[#7F5539] dark:text-[#F5EBE0]">Pulihkan Data</div>
              <div className="text-[10px] text-[#8D6E63]">Impor dari file .JSON</div>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* Section 2: PWA Mobile Install */}
        <div className="space-y-2 pt-2 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#B08968] dark:text-[#DDB892]">
            Install Aplikasi di Smartphone (PWA)
          </h4>
          <div className="p-3.5 rounded-2xl bg-[#FFF5F8] dark:bg-[#2D1C22] border border-[#F7D6E0] dark:border-[#5C303F] text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#7F5539] dark:text-[#F5EBE0] font-semibold">
              <Smartphone className="w-4 h-4 text-[#A84B6E]" />
              <span>Gunakan seperti Aplikasi Native</span>
            </div>
            <p className="text-[11px] text-[#8D6E63] dark:text-[#C5B3A6]">
              Teddy Finance sudah siap PWA! Di Chrome / Safari mobile, pilih menu browser lalu klik{' '}
              <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
            </p>
            {deferredPrompt && (
              <button
                onClick={onInstallPwa}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] shadow-xs cursor-pointer"
              >
                Install Sekarang
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Reset to sample */}
        <div className="pt-2 border-t border-[#F5EBE0] dark:border-[#3E2F26] flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Muat ulang data contoh awal? Data saat ini akan diganti dengan data contoh.')) {
                onResetToSample();
                setSuccessNotice('Data berhasil dikembalikan ke contoh awal.');
                setTimeout(() => setSuccessNotice(''), 3000);
              }
            }}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
