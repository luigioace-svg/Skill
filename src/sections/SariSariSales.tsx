/**
 * Sari-Sari Store Sales Entry Module
 * 
 * Section 9.1: Record customer transactions.
 * - Select item → enter quantity → system auto-looks up Final Sticker Price
 * - Computes total revenue, capital recovered, markup profit
 * - Stores discrete transaction records
 * - Supports both piece sales and bundle sales (for candy/cheap-packed-snack)
 */

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useSaleMutations } from '@/hooks/useFirestore';
import type { SaleTransaction } from '@/types';
import { getFinalStickerPrice, computeBaseCost, computeTransactionFinancials } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Receipt, Check } from 'lucide-react';

export default function SariSariSales() {
  const { items, settings, googleUser, navigateTo } = useAppStore();
  const { recordSale } = useSaleMutations(googleUser?.uid ?? null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitType] = useState<'piece' | 'bundle'>('piece');
  const [recentSales, setRecentSales] = useState<Array<{ name: string; qty: number; total: number; time: string }>>([]);
  const [feedback, setFeedback] = useState('');

  const globalMarkup = settings.globalMarkup;

  // Only show classified items that have prices set
  const sellableItems = items.filter(i =>
    i.purchaseType !== 'unclassified' &&
    i.category !== 'Palengke' &&
    getFinalStickerPrice(i, 'rcs', globalMarkup) > 0
  );

  // Also include candy/cheap-packed-snack items
  const candyItems = items.filter(i =>
    (i.purchaseType === 'candy' || i.purchaseType === 'cheap-packed-snack') &&
    i.storePrices.rcs.sellBundlePrice > 0
  );

  const allSellable = [...sellableItems, ...candyItems.filter(ci => !sellableItems.some(si => si.id === ci.id))];

  const selectedItem = allSellable.find(i => i.id === selectedItemId);

  const handleRecordSale = async () => {
    if (!selectedItem || quantity <= 0) return;

    const storeId = 'rcs'; // Default to RCS for sales
    const stickerPrice = getFinalStickerPrice(selectedItem, storeId, globalMarkup);
    const baseCost = computeBaseCost(selectedItem, storeId);

    // Use the transaction financials calculator
    const fin = computeTransactionFinancials(
      selectedItem,
      storeId,
      globalMarkup,
      quantity,
      selectedItem.purchaseType === 'candy' || selectedItem.purchaseType === 'cheap-packed-snack' ? 'bundle' : unitType,
      stickerPrice
    );

    const sale: SaleTransaction = {
      id: `sale_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      unitType: (selectedItem.purchaseType === 'candy' || selectedItem.purchaseType === 'cheap-packed-snack' ? 'bundle' : 'piece') as 'piece' | 'bundle',
      finalStickerPrice: stickerPrice,
      baseCost,
      totalRevenue: fin.totalRevenue,
      capitalRecovered: fin.capitalRecovered,
      markupProfit: fin.markupProfit,
      timestamp: new Date(),
    };

    await recordSale(sale);

    setRecentSales(prev => [{
      name: selectedItem.name,
      qty: quantity,
      total: fin.totalRevenue,
      time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 10));

    setFeedback(`Recorded: ${quantity} × ${selectedItem.name} = ₱${fin.totalRevenue.toFixed(2)}`);
    setTimeout(() => setFeedback(''), 2000);
    setQuantity(1);
    setSelectedItemId(null);
  };

  // Preview calculation
  const previewTotal = selectedItem
    ? getFinalStickerPrice(selectedItem, 'rcs', globalMarkup) * quantity
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-emerald-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigateTo('home')} className="hover:text-emerald-200"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Record Sale</h1>
      </header>

      {/* Feedback toast */}
      {feedback && (
        <div className="mx-4 mt-3 bg-emerald-100 text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top">
          <Check className="w-4 h-4" /> {feedback}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Item Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Item</label>
          <select
            value={selectedItemId ?? ''}
            onChange={e => { setSelectedItemId(e.target.value || null); setQuantity(1); }}
            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Choose an item --</option>
            {allSellable.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} — ₱{getFinalStickerPrice(item, 'rcs', globalMarkup).toFixed(2)}
                {item.purchaseType === 'candy' || item.purchaseType === 'cheap-packed-snack' ? ' / bundle' : ' / pc'}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{selectedItem.name}</h3>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">
                {selectedItem.purchaseType.replace(/-/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500 text-xs">Base Cost</p>
                <p className="font-semibold">₱{computeBaseCost(selectedItem, 'rcs').toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-emerald-600 text-xs">Sticker Price</p>
                <p className="font-semibold text-emerald-700">₱{getFinalStickerPrice(selectedItem, 'rcs', globalMarkup).toFixed(2)}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Quantity ({selectedItem.purchaseType === 'candy' || selectedItem.purchaseType === 'cheap-packed-snack' ? 'bundles' : 'pieces'})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-emerald-900 text-white rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-emerald-300 text-xs">Total Revenue</p>
                  <p className="text-2xl font-bold">₱{previewTotal.toFixed(2)}</p>
                </div>
                <Receipt className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-emerald-300">
                <span>Capital: ₱{(computeBaseCost(selectedItem, 'rcs') * quantity).toFixed(2)}</span>
                <span>Markup: ₱{(previewTotal - computeBaseCost(selectedItem, 'rcs') * quantity).toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleRecordSale}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl"
            >
              <Receipt className="w-4 h-4 mr-2" /> Record Sale
            </Button>
          </div>
        )}

        {/* Recent Sales */}
        {recentSales.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-3">Recent Sales (Today)</h3>
            <div className="space-y-2">
              {recentSales.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gray-500 ml-2">×{s.qty}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">₱{s.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-xs ml-2">{s.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
