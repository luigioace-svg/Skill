/**
 * Palengke (Public Market) Section
 * 
 * Section 6.9: Separate, distinct list from supermarkets.
 * 6 items: Salt, Onion, Ginger, Garlic, Kamatis, Egg.
 * Salt has special Manual Bulk-Repack pricing (Section 4.1.C).
 * Uses same cart/budget/pie-chart mechanics as Grocery Planner.
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { computeSellingPrice } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowLeft, Plus, Minus, ShoppingCart, X, Trash2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PalengkeView() {
  const { items, settings, navigateTo } = useAppStore();
  const [cart, setCart] = useState<Array<{ itemId: string; itemName: string; qty: number; price: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budget, setBudget] = useState(0);
  const [budgetSet, setBudgetSet] = useState(false);

  const globalMarkup = settings.globalMarkup;

  const palengkeItems = items.filter(i => i.category === 'Palengke');

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const remaining = budget - cartTotal;

  const pieData = useMemo(() => {
    const byItem: Record<string, number> = {};
    for (const c of cart) {
      byItem[c.itemName] = (byItem[c.itemName] || 0) + c.price * c.qty;
    }
    return {
      labels: Object.keys(byItem),
      datasets: [{
        data: Object.values(byItem),
        backgroundColor: ['#15803d', '#1e40af', '#7c3aed', '#c2410c', '#0891b2', '#be185d'],
        borderWidth: 2,
        borderColor: '#f9fafb',
      }],
    };
  }, [cart]);

  const addToPalengkeCart = (itemId: string) => {
    const item = palengkeItems.find(i => i.id === itemId);
    if (!item) return;
    const price = computeSellingPrice(item, 'palengke', globalMarkup);
    const existing = cart.find(c => c.itemId === itemId);
    if (existing) {
      setCart(cart.map(c => c.itemId === itemId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { itemId, itemName: item.name, qty: 1, price }]);
    }
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.itemId !== itemId) return c;
      const newQty = Math.max(0, c.qty + delta);
      return { ...c, qty: newQty };
    }).filter(c => c.qty > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  if (!budgetSet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-800 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="hover:text-green-200"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold">Palengke (Public Market)</h1>
        </header>
        <div className="p-6 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-2">Set Your Palengke Budget</h2>
            <p className="text-gray-500 text-sm mb-4">Enter how much you plan to spend at the public market.</p>
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-xl border border-gray-200 text-lg font-semibold mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <Button
              onClick={() => { const b = parseFloat(budgetInput); if (b > 0) { setBudget(b); setBudgetSet(true); } }}
              disabled={!budgetInput || parseFloat(budgetInput) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 rounded-xl"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-1 text-sm hover:text-green-200">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-semibold text-sm">Palengke</h1>
        <button onClick={() => setShowCart(!showCart)} className="relative p-2 hover:bg-white/10 rounded-lg">
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center font-bold">
              {cart.reduce((s, c) => s + c.qty, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Budget bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="font-bold">₱{budget.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>₱{remaining.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Item list */}
      <div className="p-4 space-y-2">
        {palengkeItems.map(item => {
          const price = computeSellingPrice(item, 'palengke', globalMarkup);
          const inCart = cart.find(c => c.itemId === item.id);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.purchaseType === 'manual-bulk-repack' && item.customUnitName
                    ? `₱${price.toFixed(2)} / ${item.customUnitName}`
                    : `₱${price.toFixed(2)} / pc`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {inCart && (
                  <>
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold w-5 text-center">{inCart.qty}</span>
                  </>
                )}
                <button onClick={() => addToPalengkeCart(item.id)} className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold">Cart</h2>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">Cart is empty</p>
              ) : (
                <>
                  {cart.map(c => (
                    <div key={c.itemId} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="text-sm font-medium">{c.itemName}</p>
                        <p className="text-xs text-gray-500">{c.qty} × ₱{c.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₱{(c.qty * c.price).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(c.itemId)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <div className="mt-4 h-40">
                      <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
