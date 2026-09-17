/**
 * Monthly Financial Report View (Section 9.6)
 * 
 * Full breakdown:
 * - Total Capital Recovered for the month
 * - Total Markup Profit (Gross, before deductions)
 * - Electricity deduction
 * - Transportation deduction (summed)
 * - Growth Fund = Markup Profit - (Electricity + Transportation) = Net Income
 * - Gross Income vs Net Income distinction
 * - Per-item breakdown: units sold, revenue, capital recovered, markup profit
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { computeFinancialSummary } from '@/lib/calculations';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  ArrowLeft, Calendar, TrendingUp, Coins, Zap, Truck,
  Sprout, Receipt
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MonthlyView() {
  const { sales, expenses, navigateTo } = useAppStore();
  const [monthInput, setMonthInput] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const referenceDate = useMemo(() => {
    const [y, m] = monthInput.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, [monthInput]);

  const summary = useMemo(() =>
    computeFinancialSummary(sales, expenses, 'monthly', referenceDate),
    [sales, expenses, referenceDate]
  );

  // Pie chart for item breakdown
  const itemPieData = useMemo(() => {
    const topItems = summary.itemBreakdown.slice(0, 8);
    return {
      labels: topItems.map(i => i.itemName),
      datasets: [{
        data: topItems.map(i => i.markupProfit),
        backgroundColor: [
          '#1e40af', '#15803d', '#7c3aed', '#c2410c', '#0891b2',
          '#be185d', '#4338ca', '#065f46',
        ],
        borderWidth: 2,
        borderColor: '#f9fafb',
      }],
    };
  }, [summary.itemBreakdown]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-purple-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="hover:text-purple-200"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Monthly Report</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Month Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Select Month
          </label>
          <input
            type="month"
            value={monthInput}
            onChange={e => setMonthInput(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Income Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 text-white rounded-xl p-4">
            <Receipt className="w-5 h-5 mb-2 text-emerald-300" />
            <p className="text-xs text-emerald-300 mb-1">Gross Income</p>
            <p className="text-2xl font-bold">₱{summary.grossIncome.toFixed(2)}</p>
            <p className="text-xs text-emerald-300 mt-1">Total markup profit</p>
          </div>
          <div className="bg-gradient-to-br from-purple-700 to-purple-800 text-white rounded-xl p-4">
            <Sprout className="w-5 h-5 mb-2 text-purple-300" />
            <p className="text-xs text-purple-300 mb-1">Net Income (Growth Fund)</p>
            <p className="text-2xl font-bold">₱{summary.growthFund.toFixed(2)}</p>
            <p className="text-xs text-purple-300 mt-1">After deductions</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Financial Breakdown</h3>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Capital Recovered</span>
            </div>
            <span className="font-medium text-sm">₱{summary.capitalRecovered.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">Markup Profit (Gross)</span>
            </div>
            <span className="font-medium text-sm text-emerald-600">₱{summary.markupProfit.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Electricity</span>
            </div>
            <span className="font-medium text-sm text-red-500">-₱{summary.electricityDeduction.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Transportation</span>
            </div>
            <span className="font-medium text-sm text-red-500">-₱{summary.transportationDeduction.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between py-2 bg-purple-50 rounded-lg px-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold">Growth Fund (Net)</span>
            </div>
            <span className="font-bold text-purple-700">₱{summary.growthFund.toFixed(2)}</span>
          </div>
        </div>

        {/* Item Breakdown Pie */}
        {summary.itemBreakdown.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-3">Markup Profit by Item</h3>
            <div className="h-48">
              <Pie data={itemPieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
            </div>
          </div>
        )}

        {/* Item Breakdown Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm mb-3">Item-Level Details</h3>
          {summary.itemBreakdown.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No sales this month.</p>
          ) : (
            <div className="space-y-2">
              {summary.itemBreakdown.map(item => (
                <div key={item.itemId} className="py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.itemName}</span>
                    <span className="text-sm text-gray-500">{item.unitsSold} sold</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs">
                    <span className="text-blue-600">Revenue: ₱{item.totalRevenue.toFixed(2)}</span>
                    <span className="text-gray-500">Capital: ₱{item.capitalRecovered.toFixed(2)}</span>
                    <span className="text-emerald-600">Markup: ₱{item.markupProfit.toFixed(2)}</span>
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
