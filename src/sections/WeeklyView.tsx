/**
 * Weekly Sales View (Section 9.6)
 * 
 * Aggregates daily records into weekly summaries:
 * - Capital Recovered (week total)
 * - Markup Profit (week total)
 * - Same categories as daily, summed across the week
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { computeFinancialSummary } from '@/lib/calculations';
import { ArrowLeft, Calendar, TrendingUp, Coins, PiggyBank } from 'lucide-react';

export default function WeeklyView() {
  const { sales, navigateTo, selectedDate, setSelectedDate } = useAppStore();
  const [weekInput, setWeekInput] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  const handleWeekChange = (val: string) => {
    setWeekInput(val);
    if (val) setSelectedDate(new Date(val + 'T00:00:00'));
  };

  // Get week range for display
  const weekRange = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      end: sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [selectedDate]);

  const summary = useMemo(() => {
    const allExpenses: import('@/types').Expense[] = [];
    return computeFinancialSummary(sales, allExpenses, 'weekly', selectedDate);
  }, [sales, selectedDate]);

  const weekTransactions = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    return sales.filter(t => {
      const td = new Date(t.timestamp);
      return td >= monday && td < sunday;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, selectedDate]);

  // Daily breakdown within the week
  const dailyBreakdown = useMemo(() => {
    const days: Record<string, { capital: number; markup: number; count: number }> = {};
    for (const t of weekTransactions) {
      const key = new Date(t.timestamp).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!days[key]) days[key] = { capital: 0, markup: 0, count: 0 };
      days[key].capital += t.capitalRecovered;
      days[key].markup += t.markupProfit;
      days[key].count += 1;
    }
    return Object.entries(days);
  }, [weekTransactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-indigo-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="hover:text-indigo-200"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Weekly Sales</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Week Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Select Week
          </label>
          <input
            type="date"
            value={weekInput}
            onChange={e => handleWeekChange(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Week of {weekRange.start} — {weekRange.end}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-900 text-white rounded-xl p-3 text-center">
            <Coins className="w-5 h-5 mx-auto mb-1 text-indigo-300" />
            <p className="text-xs text-indigo-300">Capital Recovered</p>
            <p className="font-bold text-sm">₱{summary.capitalRecovered.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-700 text-white rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-300" />
            <p className="text-xs text-emerald-300">Markup Profit</p>
            <p className="font-bold text-sm">₱{summary.markupProfit.toFixed(2)}</p>
          </div>
          <div className="bg-purple-800 text-white rounded-xl p-3 text-center">
            <PiggyBank className="w-5 h-5 mx-auto mb-1 text-purple-300" />
            <p className="text-xs text-purple-300">Gross Income</p>
            <p className="font-bold text-sm">₱{summary.grossIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Daily Breakdown */}
        {dailyBreakdown.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-3">Daily Breakdown</h3>
            <div className="space-y-2">
              {dailyBreakdown.map(([day, data]) => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm">{day}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-blue-600">Cap: ₱{data.capital.toFixed(2)}</span>
                    <span className="text-emerald-600">Markup: ₱{data.markup.toFixed(2)}</span>
                    <span className="text-gray-500">{data.count} sales</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm mb-3">All Transactions This Week</h3>
          {weekTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No sales this week.</p>
          ) : (
            <div className="space-y-2">
              {weekTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.itemName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.timestamp).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' '}· {t.quantity} {t.unitType === 'bundle' ? 'bundles' : 'pcs'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₱{t.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600">+₱{t.markupProfit.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
