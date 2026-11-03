import React, { useState } from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Heart, MessageCircleHeart, Smile, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupiah } from '../utils/formatters';

interface TeddyMascotCardProps {
  topExpenseCategory: { category: string; amount: number } | null;
  topIncomeCategory: { category: string; amount: number } | null;
  cashlessPercentage: number;
  totalSaved: number;
  expenseChangeNotice: string | null;
  healthScore: number;
}

const TEDDY_QUOTES = [
  "Halo sahabatku! Yuk catat setiap rupiah hari ini, Teddy siap bantu rapikan! 🌸",
  "Wah, kamu rajin banget! Disiplin menabung bikin masa depan makin cerah lho! 🧸💖",
  "Ingat kata Teddy: Sedikit demi sedikit, lama-lama jadi bukit madu yang manis! 🍯",
  "Keren! Transaksi cashless kamu tercatat rapi, nggak ada yang luput lagi! 💳✨",
  "Teddy bangga padamu! Terus jaga selisih surplus ya sahabat baikku! 🐾",
  "Pengen beli barang impian? Yuk tambah tabungan di fitur Target Tabungan! 🎯"
];

export const TeddyMascotCard: React.FC<TeddyMascotCardProps> = ({
  topExpenseCategory,
  topIncomeCategory,
  cashlessPercentage,
  totalSaved,
  expenseChangeNotice,
  healthScore,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [loveCount, setLoveCount] = useState(128);

  const handlePetTeddy = () => {
    setIsWiggling(true);
    setLoveCount((prev) => prev + 1);
    setQuoteIndex((prev) => (prev + 1) % TEDDY_QUOTES.length);

    // Cute mini heart confetti
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#F7D6E0', '#B08968', '#E07A5F', '#FFB4D6'],
    });

    setTimeout(() => setIsWiggling(false), 600);
  };

  const isHealthy = healthScore >= 70;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F5] via-[#FFF3F6] to-[#F5EBE0] dark:from-[#2A201A] dark:via-[#261C18] dark:to-[#1E1714] border-2 border-[#F7D6E0] dark:border-[#5C303F] rounded-3xl p-6 sm:p-7 shadow-sm transition-all">
      {/* Decorative cute paw prints in corner */}
      <div className="absolute top-3 right-4 text-[#F7D6E0]/70 dark:text-[#5C303F]/50 select-none pointer-events-none text-2xl font-bold">
        🐾 🐾
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Interactive Teddy Mascot Avatar with cute bear ears and heart aura */}
        <div className="relative shrink-0 flex flex-col items-center">
          {/* Bear ear decorative top frames */}
          <div className="flex items-center justify-between w-24 sm:w-28 -mb-2 px-1 pointer-events-none">
            <div className="w-6 h-6 rounded-t-full bg-[#B08968] dark:bg-[#7F5539] border-2 border-[#F7D6E0] dark:border-[#5C303F] shadow-xs" />
            <div className="w-6 h-6 rounded-t-full bg-[#B08968] dark:bg-[#7F5539] border-2 border-[#F7D6E0] dark:border-[#5C303F] shadow-xs" />
          </div>

          <button
            type="button"
            onClick={handlePetTeddy}
            title="Klik untuk menyapa dan mengelus Teddy! 🧸"
            className={`group relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-[#3E2F26] shadow-lg bg-[#F5EBE0] dark:bg-[#32231A] transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
              isWiggling ? 'animate-bounce' : ''
            }`}
          >
            <img
              src="/src/assets/images/cute_teddy_happy_1793709947427.jpg"
              alt="Ultra Cute Teddy Bear Mascot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Soft pink blush gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#B08968]/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-1.5 inset-x-1.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-xs text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Usap Teddy!</span>
            </div>
          </button>

          {/* Interactive Cute Status Badge below Teddy */}
          <button
            type="button"
            onClick={handlePetTeddy}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-[#32231A] border border-[#F7D6E0] dark:border-[#5C303F] text-xs font-semibold text-[#8E284E] dark:text-[#F7D6E0] shadow-xs hover:bg-[#FEEAF0] transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>{loveCount} Sayang Teddy</span>
          </button>
        </div>

        {/* Content & Insights */}
        <div className="flex-1 space-y-3.5 w-full">
          {/* Header & Cute Speech Bubble */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧸</span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-[#7F5539] dark:text-[#F5EBE0]">
                  Analisis Sahabat Finansial Teddy
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#F7D6E0] dark:bg-[#5C303F] text-[#8E284E] dark:text-[#FEEAF0]">
                  <Smile className="w-3.5 h-3.5 text-[#8E284E]" />
                  <span>Kesehatan Keuangan: {healthScore}/100</span>
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                  {isHealthy ? '🧸 Teddy Senang!' : '🧸 Teddy Semangatin!'}
                </span>
              </div>
            </div>

            {/* Cute Speech Bubble from Teddy */}
            <div className="mt-2.5 relative bg-white dark:bg-[#1E1714] p-3.5 rounded-2xl border-2 border-[#F7D6E0] dark:border-[#5C303F] shadow-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MessageCircleHeart className="w-4 h-4 text-[#C47281] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-[#7F5539] dark:text-[#F7D6E0] italic leading-relaxed">
                  "{TEDDY_QUOTES[quoteIndex]}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteIndex((prev) => (prev + 1) % TEDDY_QUOTES.length)}
                title="Ganti pesan Teddy"
                className="text-[#8D6E63] hover:text-[#B08968] p-1 rounded-lg hover:bg-[#FAF7F2] transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bulleted Insights specified in Prompt with cute iconography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {/* Insight 1: Pengeluaran terbesar */}
            <div className="flex items-start gap-2 text-xs bg-white/90 dark:bg-[#1E1714]/80 p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">
                Pengeluaran terbesar bulan ini pada kategori{' '}
                <strong className="text-[#7F5539] dark:text-[#F7D6E0]">
                  {topExpenseCategory ? topExpenseCategory.category : '-'}
                </strong>{' '}
                sebesar{' '}
                <strong className="font-mono-numbers text-[#A84B6E] dark:text-[#F7D6E0]">
                  {topExpenseCategory ? formatRupiah(topExpenseCategory.amount) : 'Rp 0'}
                </strong>.
              </span>
            </div>

            {/* Insight 2: Pemasukan utama */}
            <div className="flex items-start gap-2 text-xs bg-white/90 dark:bg-[#1E1714]/80 p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">
                Pemasukan utama berasal dari kategori{' '}
                <strong className="text-[#7F5539] dark:text-[#F7D6E0]">
                  {topIncomeCategory ? topIncomeCategory.category : '-'}
                </strong>{' '}
                sebesar{' '}
                <strong className="font-mono-numbers text-emerald-700 dark:text-emerald-400">
                  {topIncomeCategory ? formatRupiah(topIncomeCategory.amount) : 'Rp 0'}
                </strong>.
              </span>
            </div>

            {/* Insight 3: Cashless usage */}
            <div className="flex items-start gap-2 text-xs bg-white/90 dark:bg-[#1E1714]/80 p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">
                Cashless digunakan pada{' '}
                <strong className="font-mono-numbers text-[#B08968] dark:text-[#DDB892]">
                  {cashlessPercentage}%
                </strong>{' '}
                transaksi Anda (Transfer, QRIS, e-Wallet).
              </span>
            </div>

            {/* Insight 4: Savings achieved */}
            <div className="flex items-start gap-2 text-xs bg-white/90 dark:bg-[#1E1714]/80 p-3 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[#5D4037] dark:text-[#E2D5CC]">
                Anda berhasil menabung{' '}
                <strong className="font-mono-numbers text-emerald-700 dark:text-emerald-400">
                  {formatRupiah(totalSaved)}
                </strong>{' '}
                ke pos target tabungan impian!
              </span>
            </div>
          </div>

          {/* Dynamic Comparative Trend Note */}
          {expenseChangeNotice && (
            <div className="flex items-center gap-2 text-xs text-[#8D6E63] dark:text-[#C5B3A6] bg-white/70 dark:bg-[#1E1714]/60 px-3.5 py-2.5 rounded-2xl border border-[#F5EBE0] dark:border-[#3E2F26]">
              <TrendingUp className="w-4 h-4 text-[#B08968] shrink-0" />
              <span>{expenseChangeNotice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
