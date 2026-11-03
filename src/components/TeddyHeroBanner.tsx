import React from 'react';
import { Plus, Target, Calendar, Sparkles, Heart } from 'lucide-react';

interface TeddyHeroBannerProps {
  onOpenNewTransaction: () => void;
  onGoToTargets: () => void;
  onGoToCalendar: () => void;
  currentDayName: string;
}

export const TeddyHeroBanner: React.FC<TeddyHeroBannerProps> = ({
  onOpenNewTransaction,
  onGoToTargets,
  onGoToCalendar,
  currentDayName,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF5F8] via-[#FAF7F2] to-[#F5EBE0] dark:from-[#2D1C22] dark:via-[#261C18] dark:to-[#1E1714] border border-[#F7D6E0] dark:border-[#4A342B] shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Left Col: Welcoming text & CTAs */}
        <div className="p-6 sm:p-8 md:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#32231A] border border-[#F7D6E0] dark:border-[#5C303F] text-xs font-semibold text-[#8E284E] dark:text-[#F7D6E0] shadow-xs">
            <span>🧸</span>
            <span>Selamat Hari {currentDayName}! Semangat Menabung</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-[#7F5539] dark:text-[#F5EBE0] tracking-tight leading-tight">
            Keuangan Rapi, Hati Tenang bersama <span className="text-[#B08968] dark:text-[#DDB892]">Teddy Finance</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#8D6E63] dark:text-[#C5B3A6] leading-relaxed max-w-lg">
            Catat transaksi tunai (cash) maupun nontunai (QRIS, e-Wallet, Bank) dengan mudah. Teddy siap menemani setiap langkah perencanaan finansialmu!
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#B08968] hover:bg-[#9C7555] active:scale-98 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Transaksi Hari Ini</span>
            </button>

            <button
              type="button"
              onClick={onGoToTargets}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F5EBE0] border border-[#F5EBE0] dark:border-[#3E2F26] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4 text-[#A84B6E]" />
              <span>Target Tabungan</span>
            </button>

            <button
              type="button"
              onClick={onGoToCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white dark:bg-[#32231A] text-[#7F5539] dark:text-[#F5EBE0] border border-[#F5EBE0] dark:border-[#3E2F26] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#B08968]" />
              <span>Kalender & Tagihan</span>
            </button>
          </div>
        </div>

        {/* Right Col: Cute Teddy Reading Bear Savings Illustration */}
        <div className="md:col-span-5 h-48 sm:h-56 md:h-full relative overflow-hidden flex items-center justify-center p-4">
          <div className="w-full h-full max-h-64 rounded-2xl overflow-hidden border-2 border-white dark:border-[#3E2F26] shadow-md bg-[#F5EBE0]">
            <img
              src="/src/assets/images/cute_teddy_hero_1793709947426.jpg"
              alt="Cute Teddy Bear reading savings book"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
