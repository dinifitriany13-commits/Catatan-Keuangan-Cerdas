import React, { useState } from 'react';
import { Target, Plus, CheckCircle, Trophy, Calendar, Sparkles, Trash2, Edit2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsTarget } from '../types';
import { formatRupiah, formatDateIndo, parseCurrencyInput } from '../utils/formatters';

interface SavingsTargetSectionProps {
  targets: SavingsTarget[];
  onAddTarget: (target: Omit<SavingsTarget, 'id' | 'createdAt'>) => void;
  onUpdateTarget: (id: string, updated: Partial<SavingsTarget>) => void;
  onDeleteTarget: (id: string) => void;
}

export const SavingsTargetSection: React.FC<SavingsTargetSectionProps> = ({
  targets,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [targetName, setTargetName] = useState('');
  const [targetAmountRaw, setTargetAmountRaw] = useState('');
  const [savedAmountRaw, setSavedAmountRaw] = useState('');
  const [deadline, setDeadline] = useState('');

  // Quick Deposit modal
  const [depositTargetId, setDepositTargetId] = useState<string | null>(null);
  const [depositAmountRaw, setDepositAmountRaw] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setTargetName('');
    setTargetAmountRaw('');
    setSavedAmountRaw('0');
    setDeadline('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: SavingsTarget) => {
    setEditingId(t.id);
    setTargetName(t.targetName);
    setTargetAmountRaw(t.targetAmount.toString());
    setSavedAmountRaw(t.savedAmount.toString());
    setDeadline(t.deadline);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tAmount = parseCurrencyInput(targetAmountRaw);
    const sAmount = parseCurrencyInput(savedAmountRaw);

    if (!targetName.trim() || tAmount <= 0) return;

    if (editingId) {
      onUpdateTarget(editingId, {
        targetName,
        targetAmount: tAmount,
        savedAmount: sAmount,
        deadline,
        status: sAmount >= tAmount ? 'completed' : 'active',
      });
    } else {
      onAddTarget({
        targetName,
        targetAmount: tAmount,
        savedAmount: sAmount,
        deadline: deadline || '2026-12-31',
        status: sAmount >= tAmount ? 'completed' : 'active',
      });
    }

    if (sAmount >= tAmount) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTargetId) return;
    const dep = parseCurrencyInput(depositAmountRaw);
    if (dep <= 0) return;

    const current = targets.find((t) => t.id === depositTargetId);
    if (!current) return;

    const newSaved = current.savedAmount + dep;
    const isCompleted = newSaved >= current.targetAmount;

    onUpdateTarget(depositTargetId, {
      savedAmount: newSaved,
      status: isCompleted ? 'completed' : 'active',
    });

    if (isCompleted) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    }

    setDepositTargetId(null);
    setDepositAmountRaw('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F7D6E0] dark:bg-[#7F5539]/40 flex items-center justify-center text-xl shadow-xs">
            🎯
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
              Target Tabungan & Rencana Masa Depan
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Disiplin menabung untuk impian, dana darurat, dan kebutuhan besar
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] active:scale-98 shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Target Baru</span>
        </button>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {targets.map((target) => {
          const progress = Math.min(100, Math.round((target.savedAmount / target.targetAmount) * 100));
          const remaining = Math.max(0, target.targetAmount - target.savedAmount);
          const isDone = target.savedAmount >= target.targetAmount;

          return (
            <div
              key={target.id}
              className={`relative overflow-hidden bg-white dark:bg-[#251C17] border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20'
                  : 'border-[#F5EBE0] dark:border-[#3E2F26]'
              }`}
            >
              {/* Header with name and actions */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isDone ? '🎉' : '🧸'}</span>
                    <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0] line-clamp-1">
                      {target.targetName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(target)}
                      className="p-1 rounded-lg text-[#8D6E63] hover:text-[#B08968] hover:bg-[#F5EBE0] dark:hover:bg-[#32231A]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTarget(target.id)}
                      className="p-1 rounded-lg text-[#8D6E63] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Deadline badge */}
                <div className="flex items-center gap-1.5 text-xs text-[#8D6E63] dark:text-[#A99385] mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {formatDateIndo(target.deadline)}</span>
                </div>

                {/* Dana terkumpul vs target */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-baseline justify-between text-xs font-mono-numbers">
                    <span className="text-base font-extrabold text-[#7F5539] dark:text-[#F5EBE0]">
                      {formatRupiah(target.savedAmount)}
                    </span>
                    <span className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                      / {formatRupiah(target.targetAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 w-full bg-[#FAF7F2] dark:bg-[#1E1714] rounded-full overflow-hidden p-0.5 border border-[#F5EBE0] dark:border-[#3E2F26]">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        isDone ? 'bg-emerald-500' : 'bg-[#B08968]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-[#B08968] dark:text-[#DDB892] font-mono-numbers">
                      {progress}%
                    </span>
                    <span className="text-[#8D6E63] dark:text-[#A99385]">
                      {isDone ? 'Tercapai Penuh!' : `Sisa ${formatRupiah(remaining)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Quick Deposit */}
              <div className="pt-3 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
                <button
                  onClick={() => {
                    setDepositTargetId(target.id);
                    setDepositAmountRaw('100000');
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-[#F5EBE0] dark:bg-[#32231A] text-[#7F5539] dark:text-[#DDB892] hover:bg-[#B08968] hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Tambah Tabungan Ekstra' : 'Nabung ke Target'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Target Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
              {editingId ? 'Edit Target Tabungan' : 'Target Tabungan Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Nama Target</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menabung Laptop, Dana Darurat..."
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Target Dana (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 8.000.000"
                  value={targetAmountRaw ? new Intl.NumberFormat('id-ID').format(parseCurrencyInput(targetAmountRaw)) : ''}
                  onChange={(e) => setTargetAmountRaw(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm font-mono-numbers text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Dana Terkumpul Awal (Rp)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={savedAmountRaw ? new Intl.NumberFormat('id-ID').format(parseCurrencyInput(savedAmountRaw)) : ''}
                  onChange={(e) => setSavedAmountRaw(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm font-mono-numbers text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8D6E63] mb-1">Deadline / Tanggal Target</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-[#8D6E63] hover:bg-[#F5EBE0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] rounded-xl shadow-xs"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositTargetId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
              Nabung ke Pos Target
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Masukkan nominal yang ingin disisihkan ke target ini.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#8D6E63] mb-1">
                  Nominal Simpanan (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={depositAmountRaw ? new Intl.NumberFormat('id-ID').format(parseCurrencyInput(depositAmountRaw)) : ''}
                  onChange={(e) => setDepositAmountRaw(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-sm font-mono-numbers text-[#7F5539] dark:text-[#F5EBE0]"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmountRaw(amt.toString())}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#F5EBE0] dark:bg-[#32231A] text-[#7F5539] dark:text-[#DDB892] hover:bg-[#B08968] hover:text-white transition-colors"
                  >
                    +{new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(amt)}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#F5EBE0] dark:border-[#3E2F26]">
                <button
                  type="button"
                  onClick={() => setDepositTargetId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-[#8D6E63] hover:bg-[#F5EBE0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#B08968] hover:bg-[#9C7555] rounded-xl shadow-xs"
                >
                  Tambahkan Tabungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
