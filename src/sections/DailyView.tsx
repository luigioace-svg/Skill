/**
 * Daily Sales View (Section 9.5)
 * 
 * Shows for the current day (and any past day via date picker):
 * - List of items sold with quantities and Final Sticker Prices
 * - Capital Recovered (day total)
 * - Markup Profit (day total)
 * - Gross Markup Profit (no expense deductions at daily level)
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { computeFinancialSummary } from '@/lib/calculations';
import { ArrowLeft, Calendar, TrendingUp, Coins, PiggyBank } from 'lucide-react';

export default function DailyView() {
  const { sales, navigateTo, selectedDate, setSelectedDate } = useAppStore();
  const [dateInput, setDateInput] = useState(selectedDate.toISOString().split('T')[0]);

  const handleDateChange = (val: string) => {
    setDateInput(val);
    if (val) setSelectedDate(new Date(val + 'T00:00:00'));
  };

  const summary = useMemo(() => {
    const allExpenses: import('@/types').Expense[] = [];
    return computeFinancialSummary(sales, allExpenses, 'daily', selectedDate);
  }, [sales, selectedDate]);

  const dayTransactions = useMemo(() => {
    return sales.filter(t => {
      const d = new Date(t.timestamp);
      return d.toDateString() === selectedDate.toDateString();
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="hover:text-blue-200"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Daily Sales</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Date Picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Select Date
          </label>
          <input
            type="date"
            value={dateInput}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-900 text-white rounded-xl p-3 text-center">
            <Coins className="w-5 h-5 mx-auto mb-1 text-blue-300" />
            <p className="text-xs text-blue-300">Capital Recovered</p>
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

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Transactions</h3>
          {dayTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No sales recorded for this day.</p>
          ) : (
            <div className="space-y-2">
              {dayTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.itemName}</p>
                    <p className="text-xs text-gray-500">
                      {t.quantity} {t.unitType === 'bundle' ? 'bundles' : 'pcs'} × ₱{t.finalStickerPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₱{t.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600">+₱{t.markupProfit.toFixed(2)} markup</p>
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
