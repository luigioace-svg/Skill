/**
 * Grocery Budget Planner Module
 * 
 * Features (Section 6):
 * - Item list organized by category
 * - Cart with real-time budget tracking
 * - Pie chart breakdown (Chart.js)
 * - Piece vs Package purchase sections
 * - Manual calculator + Tap-to-add auto calculator
 * - Three-store parallel price sheets
 * 
 * Real-time reactivity: all totals update immediately on any change (Section 10).
 */

import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { computeSellingPrice } from '@/lib/calculations';
import { STORES } from '@/lib/seedData';
import { Button } from '@/components/ui/button';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Calculator,
  PieChart as PieIcon, X, ChevronDown, ChevronUp, Package, Hash
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GroceryPlanner() {
  const { grocerySession, items, settings, navigateTo, addToCart, removeFromCart, updateCartQuantity, clearCart } = useAppStore();
  const [showCart, setShowCart] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showTapCalc, setShowTapCalc] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [tapQty, setTapQty] = useState(1);
  const [tapUnit, setTapUnit] = useState<'piece' | 'package'>('piece');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const storeId = grocerySession?.storeId ?? 'rcs';
  const storeName = STORES.find(s => s.id === storeId)?.name ?? 'Store';
  const budget = grocerySession?.budget ?? 0;
  const cart = grocerySession?.cart ?? [];
  const globalMarkup = settings.globalMarkup;

  // Filter to supermarket items only (not palengke, not candy/cheap-snack for main list)
  const supermarketItems = useMemo(() =>
    items.filter(i => i.category !== 'Palengke' && i.category !== 'Candy' && i.category !== 'Cheap Packed Snack'),
    [items]
  );

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof supermarketItems> = {};
    for (const item of supermarketItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [supermarketItems]);

  // Cart totals
  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + c.subtotal, 0), [cart]);
  const remaining = budget - cartTotal;
  const percentUsed = budget > 0 ? (cartTotal / budget) * 100 : 0;

  // Pie chart data
  const pieData = useMemo(() => {
    const byItem: Record<string, number> = {};
    for (const c of cart) {
      byItem[c.itemName] = (byItem[c.itemName] || 0) + c.subtotal;
    }
    return {
      labels: Object.keys(byItem),
      datasets: [{
        data: Object.values(byItem),
        backgroundColor: [
          '#1e40af', '#15803d', '#7c3aed', '#c2410c', '#0891b2',
          '#be185d', '#4338ca', '#065f46', '#92400e', '#1e3a5f',
        ],
        borderWidth: 2,
        borderColor: '#f9fafb',
      }],
    };
  }, [cart]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const getItemPrice = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 0;
    return computeSellingPrice(item, storeId, globalMarkup);
  }, [items, storeId, globalMarkup]);

  const handleAddToCart = (itemId: string, qty: number, unitType: 'piece' | 'package') => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    let price = 0;
    if (unitType === 'piece') {
      price = computeSellingPrice(item, storeId, globalMarkup);
    } else {
      price = item.storePrices[storeId]?.totalPackPrice ?? 0;
    }
    addToCart({
      itemId,
      itemName: item.name,
      quantity: qty,
      unitType,
      subtotal: price * qty,
    });
  };

  // Calculator functions
  const handleCalcPress = (key: string) => {
    if (['+', '-', '*', '/'].includes(key)) {
      setCalcOp(key);
      setCalcPrev(parseFloat(calcDisplay));
      setCalcDisplay('0');
    } else if (key === '=') {
      if (calcOp && calcPrev !== null) {
        const curr = parseFloat(calcDisplay);
        let result = 0;
        switch (calcOp) {
          case '+': result = calcPrev + curr; break;
          case '-': result = calcPrev - curr; break;
          case '*': result = calcPrev * curr; break;
          case '/': result = curr !== 0 ? calcPrev / curr : 0; break;
        }
        setCalcDisplay(String(result));
        setCalcOp(null);
        setCalcPrev(null);
      }
    } else if (key === 'C') {
      setCalcDisplay('0');
      setCalcOp(null);
      setCalcPrev(null);
    } else if (key === '%') {
      setCalcDisplay(String(parseFloat(calcDisplay) / 100));
    } else {
      setCalcDisplay(prev => prev === '0' ? key : prev + key);
    }
  };

  const pieceCart = cart.filter(c => c.unitType === 'piece');
  const packageCart = cart.filter(c => c.unitType === 'package');
  const pieceTotal = pieceCart.reduce((s, c) => s + c.subtotal, 0);
  const packageTotal = packageCart.reduce((s, c) => s + c.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-1 text-sm hover:text-blue-300">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <h1 className="font-semibold text-sm">Items Inside Grocery</h1>
          <p className="text-xs text-blue-300/60">{storeName}</p>
        </div>
        <button onClick={() => setShowCart(!showCart)} className="relative p-2 hover:bg-white/10 rounded-lg">
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* Budget Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="font-bold text-lg">₱{budget.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className={`font-bold text-lg ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
              ₱{remaining.toFixed(2)}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentUsed > 100 ? 'bg-red-500' : percentUsed > 80 ? 'bg-orange-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{percentUsed.toFixed(1)}% used</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 p-4">
        <button onClick={() => { setShowTapCalc(!showTapCalc); setShowCalc(false); }} className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
          <Hash className="w-4 h-4 inline mr-1" />Tap Calculator
        </button>
        <button onClick={() => { setShowCalc(!showCalc); setShowTapCalc(false); }} className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          <Calculator className="w-4 h-4 inline mr-1" />Manual Calc
        </button>
        <button onClick={() => setShowCart(!showCart)} className="flex-1 py-2 px-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors">
          <PieIcon className="w-4 h-4 inline mr-1" />Cart &amp; Chart
        </button>
      </div>

      {/* Manual Calculator */}
      {showCalc && (
        <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="bg-gray-900 rounded-lg p-3 mb-3 text-right">
            <p className="text-white text-2xl font-mono">{calcDisplay}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '%', '0', '.'].map(key => (
              <button
                key={key}
                onClick={() => handleCalcPress(key)}
                className={`h-12 rounded-lg font-semibold text-lg transition-colors ${
                  ['C', '/', '*', '-', '+', '=', '%'].includes(key)
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } ${key === '=' ? 'row-span-1' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tap-to-Add Calculator */}
      {showTapCalc && (
        <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-2">Tap an item below, then set quantity</p>
          {selectedItemId && (
            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <p className="text-sm font-medium text-blue-900">
                {items.find(i => i.id === selectedItemId)?.name}
              </p>
              <p className="text-xs text-blue-600">
                ₱{getItemPrice(selectedItemId).toFixed(2)} per piece
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setTapQty(Math.max(1, tapQty - 1))} className="w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold w-8 text-center">{tapQty}</span>
                <button onClick={() => setTapQty(tapQty + 1)} className="w-8 h-8 bg-white rounded-lg border flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
                <select
                  value={tapUnit}
                  onChange={(e) => setTapUnit(e.target.value as 'piece' | 'package')}
                  className="ml-2 text-sm border rounded-lg px-2 py-1"
                >
                  <option value="piece">Piece</option>
                  <option value="package">Package</option>
                </select>
                <Button onClick={() => { handleAddToCart(selectedItemId, tapQty, tapUnit); setSelectedItemId(null); }} size="sm" className="ml-auto bg-blue-600 text-white">
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Item List */}
      <div className="px-4 space-y-2">
        {groupedItems.map(([category, catItems]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-sm text-gray-800">{category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{catItems.length} items</span>
                {expandedCategories.has(category) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            {expandedCategories.has(category) && (
              <div className="divide-y divide-gray-100">
                {catItems.map(item => {
                  const price = computeSellingPrice(item, storeId, globalMarkup);
                  const inCart = cart.find(c => c.itemId === item.id);
                  return (
                    <div key={item.id} className="px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.purchaseType === 'piece' && `₱${price.toFixed(2)} / pc`}
                          {item.purchaseType === 'package-roll' && item.piecesPerPack && `₱${price.toFixed(2)} / pc (roll of ${item.piecesPerPack})`}
                          {item.purchaseType === 'unclassified' && <span className="text-orange-500">Unclassified</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {showTapCalc ? (
                          <button
                            onClick={() => { setSelectedItemId(item.id); setTapQty(1); }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              selectedItemId === item.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            {inCart && (
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => updateCartQuantity(item.id, Math.max(0, inCart.quantity - 1))} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-5 text-center">{inCart.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.id, inCart.quantity + 1)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleAddToCart(item.id, 1, 'piece')}
                              className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart & Pie Chart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowCart(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Cart
              </h2>
              <button onClick={() => setShowCart(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4">
              {/* Budget summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="font-bold">₱{budget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="font-bold text-blue-600">₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>₱{remaining.toFixed(2)}</span>
                </div>
                {remaining < 0 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Budget exceeded!</p>
                )}
              </div>

              {/* Pie Chart */}
              {cart.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Spending Breakdown</h3>
                  <div className="h-48">
                    <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
                  </div>
                </div>
              )}

              {/* Piece vs Package sections */}
              <div className="space-y-3 mb-4">
                {/* Piece purchases */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-1 mb-2">
                    <Package className="w-3 h-3" /> Piece Purchases — ₱{pieceTotal.toFixed(2)}
                  </h4>
                  {pieceCart.length === 0 ? (
                    <p className="text-xs text-blue-400">No piece items</p>
                  ) : (
                    pieceCart.map(c => (
                      <div key={`${c.itemId}-piece`} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm">{c.itemName}</p>
                          <p className="text-xs text-blue-600">{c.quantity} × ₱{(c.subtotal / c.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₱{c.subtotal.toFixed(2)}</span>
                          <button onClick={() => removeFromCart(c.itemId)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Package purchases */}
                <div className="bg-green-50 rounded-xl p-3">
                  <h4 className="text-sm font-semibold text-green-800 flex items-center gap-1 mb-2">
                    <Package className="w-3 h-3" /> Package Purchases — ₱{packageTotal.toFixed(2)}
                  </h4>
                  {packageCart.length === 0 ? (
                    <p className="text-xs text-green-400">No package items</p>
                  ) : (
                    packageCart.map(c => (
                      <div key={`${c.itemId}-pkg`} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm">{c.itemName}</p>
                          <p className="text-xs text-green-600">{c.quantity} × ₱{(c.subtotal / c.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₱{c.subtotal.toFixed(2)}</span>
                          <button onClick={() => removeFromCart(c.itemId)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button onClick={clearCart} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
