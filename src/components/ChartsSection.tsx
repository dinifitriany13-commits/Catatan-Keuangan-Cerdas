import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Transaction } from '../types';
import { formatRupiah, isCashlessMethod, INDONESIAN_MONTHS } from '../utils/formatters';
import { PieChart as PieIcon, TrendingUp, BarChart3, CreditCard } from 'lucide-react';

interface ChartsSectionProps {
  transactions: Transaction[];
  selectedYear: string;
}

const INCOME_COLORS = [
  '#588157', // Sage green
  '#3A5A40', // Deep forest
  '#70A288', // Soft emerald
  '#A3B18A', // Olive light
  '#B08968', // Teddy brown
  '#DDB892', // Beige sand
  '#E09F3E', // Soft amber
  '#9D8189', // Muted mauve
];

const EXPENSE_COLORS = [
  '#D97706', // Amber warm
  '#E07A5F', // Terra cotta
  '#C47281', // Rose pink
  '#8E284E', // Wine berry
  '#6F4E37', // Teddy mocha
  '#9C6644', // Caramel brown
  '#B08968', // Teddy base
  '#7F5539', // Dark teddy
  '#5E503F', // Espresso
  '#A53860', // Deep rose
  '#E6AA68', // Cream orange
  '#8B5E3C', // Wood
];

const CASH_CASHLESS_COLORS = [
  '#B08968', // Cash: Teddy Brown
  '#C47281', // Cashless: Soft Rose/Pink
];

export const ChartsSection: React.FC<ChartsSectionProps> = ({ transactions, selectedYear }) => {
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  // Filter transactions by selected year & month
  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const [year, month] = t.date.split('-');
      if (year !== selectedYear) return false;
      if (filterMonth !== 'ALL' && month !== filterMonth) return false;
      return true;
    });
  }, [transactions, selectedYear, filterMonth]);

  // 1. Diagram Pemasukan Berdasarkan Kategori
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    activeTransactions
      .filter((t) => t.type === 'Pemasukan')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeTransactions]);

  // 2. Diagram Pengeluaran Berdasarkan Kategori
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    activeTransactions
      .filter((t) => t.type === 'Pengeluaran')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeTransactions]);

  // 3. Grafik Tren Keuangan (Line Chart: Pemasukan, Pengeluaran, Saldo per bulan)
  const monthlyTrendData = useMemo(() => {
    // 12 months array for selectedYear
    return INDONESIAN_MONTHS.map((monthName, idx) => {
      const monthStr = (idx + 1).toString().padStart(2, '0');
      const monthlyTx = transactions.filter((t) => {
        const [yr, mo] = t.date.split('-');
        return yr === selectedYear && mo === monthStr;
      });

      const pemasukan = monthlyTx
        .filter((t) => t.type === 'Pemasukan')
        .reduce((sum, t) => sum + t.amount, 0);

      const pengeluaran = monthlyTx
        .filter((t) => t.type === 'Pengeluaran')
        .reduce((sum, t) => sum + t.amount, 0);

      const saldo = pemasukan - pengeluaran;

      return {
        month: monthName.slice(0, 3),
        fullMonth: monthName,
        Pemasukan: pemasukan,
        Pengeluaran: pengeluaran,
        Saldo: saldo,
      };
    });
  }, [transactions, selectedYear]);

  // 4. Perbandingan Cash vs Cashless (Donut Chart)
  const cashVsCashlessData = useMemo(() => {
    let cashTotal = 0;
    let cashlessTotal = 0;
    let cashCount = 0;
    let cashlessCount = 0;

    activeTransactions.forEach((t) => {
      if (isCashlessMethod(t.paymentMethod)) {
        cashlessTotal += t.amount;
        cashlessCount++;
      } else {
        cashTotal += t.amount;
        cashCount++;
      }
    });

    return [
      { name: 'Cash (Tunai)', value: cashTotal, count: cashCount },
      { name: 'Cashless (Nontunai)', value: cashlessTotal, count: cashlessCount },
    ].filter((item) => item.value > 0);
  }, [activeTransactions]);

  // 5. Top 10 Kategori Pengeluaran (Bar Chart sorted descending)
  const top10ExpenseData = useMemo(() => {
    return expenseCategoryData.slice(0, 10);
  }, [expenseCategoryData]);

  // Custom tooltips
  const renderCurrencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] p-2.5 rounded-xl shadow-md text-xs">
          <p className="font-semibold text-[#7F5539] dark:text-[#F5EBE0]">{data.name}</p>
          <p className="font-mono-numbers text-sm font-bold text-[#B08968] dark:text-[#DDB892] mt-0.5">
            {formatRupiah(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] p-3 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-bold text-[#7F5539] dark:text-[#F5EBE0] border-b border-[#F5EBE0] pb-1">
            Bulan: {label} {selectedYear}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono-numbers">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>
              <span className="font-bold text-[#5D4037] dark:text-[#E2D5CC]">
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Month Filter Bar for Charts */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-[#B08968]" />
          <div>
            <h3 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
              Visualisasi Analisis Keuangan ({selectedYear})
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
              Diagram otomatis sinkron dengan perubahan transaksi
            </p>
          </div>
        </div>

        {/* Filter Month */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8D6E63] dark:text-[#A99385]">Filter Bulan:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#F5EBE0] dark:border-[#3E2F26] bg-[#FAF7F2] dark:bg-[#1E1714] text-[#7F5539] dark:text-[#F5EBE0] font-medium focus:ring-1 focus:ring-[#B08968]"
          >
            <option value="ALL">Semua Bulan (Kumulatif {selectedYear})</option>
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
      </div>

      {/* Row 1: Diagram Pemasukan & Diagram Pengeluaran (2 Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pemasukan Berdasarkan Kategori */}
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Diagram Pemasukan Berdasarkan Kategori
              </h4>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Persentase sumber pendapatan
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
              Pie Chart
            </span>
          </div>

          <div className="h-68">
            {incomeCategoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8D6E63]">
                Belum ada data pemasukan pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={30}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {incomeCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderCurrencyTooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Pengeluaran Berdasarkan Kategori */}
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Diagram Pengeluaran Berdasarkan Kategori
              </h4>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Proporsi pengeluaran harian
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200">
              Pie Chart
            </span>
          </div>

          <div className="h-68">
            {expenseCategoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8D6E63]">
                Belum ada data pengeluaran pada periode ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={30}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-exp-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderCurrencyTooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Grafik Tren Keuangan (Line Chart) */}
      <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B08968]" />
            <div>
              <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Grafik Tren Keuangan Bulanan ({selectedYear})
              </h4>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Perbandingan fluktuasi Pemasukan, Pengeluaran, dan Saldo per bulan
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1714] text-[#B08968] dark:text-[#DDB892] border border-[#F5EBE0]">
            Line Chart
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EBE0" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8D6E63' }} />
              <YAxis
                tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}jt`}
                tick={{ fontSize: 11, fill: '#8D6E63' }}
              />
              <Tooltip content={renderTrendTooltip} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="Pemasukan"
                stroke="#588157"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Pengeluaran"
                stroke="#E07A5F"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Saldo"
                stroke="#B08968"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Perbandingan Cash vs Cashless (Donut) & Top 10 Kategori Pengeluaran (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Cash vs Cashless */}
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                Cash vs Cashless
              </h4>
              <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                Perbandingan volume transaksi
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1714] text-[#B08968] border border-[#F5EBE0]">
              Donut
            </span>
          </div>

          <div className="h-60">
            {cashVsCashlessData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8D6E63]">
                Belum ada transaksi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cashVsCashlessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cashVsCashlessData.map((entry, index) => (
                      <Cell
                        key={`cell-cash-${index}`}
                        fill={CASH_CASHLESS_COLORS[index % CASH_CASHLESS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderCurrencyTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Top 10 Kategori Pengeluaran */}
        <div className="bg-white dark:bg-[#251C17] border border-[#F5EBE0] dark:border-[#3E2F26] rounded-2xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#B08968]" />
              <div>
                <h4 className="text-sm font-bold text-[#7F5539] dark:text-[#F5EBE0]">
                  Top 10 Kategori Pengeluaran
                </h4>
                <p className="text-xs text-[#8D6E63] dark:text-[#A99385]">
                  Urutan pos pengeluaran dari terbesar ke terkecil
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1E1714] text-[#B08968] border border-[#F5EBE0]">
              Bar Chart
            </span>
          </div>

          <div className="h-60">
            {top10ExpenseData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8D6E63]">
                Belum ada data pengeluaran
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10ExpenseData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5EBE0" opacity={0.6} />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}rb`}
                    tick={{ fontSize: 10, fill: '#8D6E63' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#7F5539' }}
                    width={90}
                  />
                  <Tooltip content={renderCurrencyTooltip} />
                  <Bar dataKey="value" fill="#B08968" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
