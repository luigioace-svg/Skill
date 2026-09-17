/**
 * Expense Logging (Section 9.4)
 * 
 * Two expense types only:
 * - Electricity: logged once per month, deducted from monthly Markup Profit
 * - Transportation: logged roughly twice per month, deducted from monthly Markup Profit
 * 
 * Simple date + amount entry. No other expense categories.
 */

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useExpenseMutations } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Truck, Receipt } from 'lucide-react';

export default function ExpenseLogger() {
  const { expenses, googleUser, navigateTo } = useAppStore();
  const { logExpense } = useExpenseMutations(googleUser?.uid ?? null);
  const [type, setType] = useState<'electricity' | 'transportation'>('electricity');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    await logExpense({
      id: `exp_${Date.now()}`,
      type,
      amount: amt,
      date: new Date(date + 'T00:00:00'),
      note: note || undefined,
    });

    setFeedback(`${type === 'electricity' ? 'Electricity' : 'Transportation'} expense of ₱${amt.toFixed(2)} logged!`);
    setTimeout(() => setFeedback(''), 3000);
    setAmount('');
    setNote('');
  };

  // Group expenses by month
  const groupedExpenses = expenses.reduce((groups, e) => {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
    return groups;
  }, {} as Record<string, typeof expenses>);

  const sortedMonths = Object.keys(groupedExpenses).sort().reverse();

  const monthlyElectricity = expenses
    .filter(e => e.type === 'electricity')
    .reduce((s, e) => s + e.amount, 0);
  const monthlyTransportation = expenses
    .filter(e => e.type === 'transportation')
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-orange-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="hover:text-orange-200"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Expense Logger</h1>
      </header>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-3 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
            <p className="text-xs text-yellow-600">Total Electricity</p>
            <p className="font-bold">₱{monthlyElectricity.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
            <Truck className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-blue-600">Total Transportation</p>
            <p className="font-bold">₱{monthlyTransportation.toFixed(2)}</p>
          </div>
        </div>

        {feedback && (
          <div className="bg-emerald-100 text-emerald-800 rounded-xl p-3 text-sm font-medium text-center">
            {feedback}
          </div>
        )}

        {/* Entry Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-1"><Receipt className="w-4 h-4" /> Log New Expense</h3>

          {/* Type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('electricity')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                type === 'electricity' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" /> Electricity
            </button>
            <button
              onClick={() => setType('transportation')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                type === 'transportation' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <Truck className="w-3 h-3" /> Transportation
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Amount (₱)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-lg border border-gray-200 text-lg font-bold"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g., Meralco bill" className="w-full p-3 rounded-lg border border-gray-200" />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5 rounded-xl disabled:opacity-40"
          >
            <Receipt className="w-4 h-4 mr-2" /> Log Expense
          </Button>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm mb-3">Expense History</h3>
          {sortedMonths.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No expenses logged yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedMonths.map(month => (
                <div key={month}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{month}</h4>
                  <div className="space-y-1">
                    {groupedExpenses[month].sort((a, b) => b.date.getTime() - a.date.getTime()).map(exp => (
                      <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          {exp.type === 'electricity' ? <Zap className="w-3 h-3 text-yellow-500" /> : <Truck className="w-3 h-3 text-blue-500" />}
                          <div>
                            <p className="text-sm font-medium capitalize">{exp.type}</p>
                            <p className="text-xs text-gray-500">{exp.date.toLocaleDateString('en-PH')}</p>
                          </div>
                        </div>
                        <span className="font-medium text-sm">₱{exp.amount.toFixed(2)}</span>
                      </div>
                    ))}
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
