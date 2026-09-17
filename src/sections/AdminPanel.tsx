/**
 * Admin / Edit Panel (Section 8)
 * 
 * Accessible from hamburger menu: "Add Items and Edit Prices or Quantity"
 * 
 * Capabilities:
 * - Add new item
 * - Edit item name, purchase type
 * - Edit prices per store
 * - Edit Global Markup
 * - Edit per-item markup overrides
 * - Edit Final Sticker Price overrides
 * - Edit Package-Roll fields (pieces per pack, total pack price)
 * - Edit Manual Bulk-Repack fields (custom unit name, manual unit price)
 * - Edit Candy/Cheap Packed Snack fields (bulk pack cost, pieces per pack, sell bundle size, sell bundle price)
 * - Delete items
 * - Link to Classification Checklist
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useItemMutations, useSettingsMutations } from '@/hooks/useFirestore';
import { STORES } from '@/lib/seedData';
import type { Item, PurchaseType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Plus, Trash2, Save, Tag, DollarSign, Package,
  Settings, AlertTriangle
} from 'lucide-react';

type EditMode = 'list' | 'edit-item' | 'add-item' | 'settings';

const PURCHASE_TYPES: { value: PurchaseType; label: string }[] = [
  { value: 'piece', label: 'Piece' },
  { value: 'package-roll', label: 'Package-Roll' },
  { value: 'manual-bulk-repack', label: 'Manual Bulk-Repack' },
  { value: 'candy', label: 'Candy' },
  { value: 'cheap-packed-snack', label: 'Cheap Packed Snack' },
  { value: 'unclassified', label: 'Unclassified' },
];

const CATEGORIES = [
  'Coffee / Milk / Energy',
  'Condiments / Sauces / Seasoning',
  'Canned Goods',
  'Instant Noodles',
  'Snacks / Chips',
  'Biscuits / Crackers',
  'Laundry / Fabric Conditioner',
  'Cleaning / Bleach',
  'Shampoo',
  'Bath Soap',
  'Candy',
  'Cheap Packed Snack',
  'Palengke',
];

export default function AdminPanel() {
  const { items, settings, googleUser, navigateTo, updateGlobalMarkup } = useAppStore();
  const { saveItem, removeItem } = useItemMutations(googleUser?.uid ?? null);
  const { saveSettings } = useSettingsMutations(googleUser?.uid ?? null);
  const [mode, setMode] = useState<EditMode>('list');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PurchaseType | 'all'>('all');

  // New item form
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    category: CATEGORIES[0],
    purchaseType: 'unclassified',
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    },
  });

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || i.purchaseType === filterType;
      return matchSearch && matchType;
    });
  }, [items, search, filterType]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredItems]);

  const handleSaveItem = async (item: Item) => {
    await saveItem(item);
    setEditingItem(null);
    setMode('list');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Delete this item?')) {
      await removeItem(itemId);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) return;
    const item: Item = {
      id: `item_${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      purchaseType: (newItem.purchaseType ?? 'unclassified') as PurchaseType,
      piecesPerPack: newItem.piecesPerPack,
      customUnitName: newItem.customUnitName,
      piecesPerBulkPack: newItem.piecesPerBulkPack,
      sellBundleSize: newItem.sellBundleSize,
      markupOverride: newItem.markupOverride,
      storePrices: newItem.storePrices ?? {
        rcs: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
        massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
        nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
        palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      },
    };
    await saveItem(item);
    setNewItem({ name: '', category: CATEGORIES[0], purchaseType: 'unclassified', storePrices: item.storePrices });
    setMode('list');
  };

  const updateItemPrice = (item: Item, storeId: string, field: string, value: number) => {
    setEditingItem({
      ...item,
      storePrices: {
        ...item.storePrices,
        [storeId]: { ...item.storePrices[storeId as keyof typeof item.storePrices], [field]: value },
      },
    });
  };

  if (mode === 'add-item') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMode('list')} className="hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold">Add New Item</h1>
        </header>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Item Name</label>
            <input value={newItem.name ?? ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200" placeholder="Enter item name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-3 rounded-lg border border-gray-200">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Purchase Type</label>
            <select value={newItem.purchaseType} onChange={e => setNewItem({ ...newItem, purchaseType: e.target.value as PurchaseType })} className="w-full p-3 rounded-lg border border-gray-200">
              {PURCHASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Button onClick={handleAddItem} disabled={!newItem.name} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'edit-item' && editingItem) {
    const item = editingItem;
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMode('list')} className="hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-sm truncate">Edit: {item.name}</h1>
          <Button onClick={() => handleSaveItem(item)} size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        </header>

        <div className="p-4 max-w-lg mx-auto space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1"><Tag className="w-4 h-4" /> Basic Info</h3>
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <input value={item.name} onChange={e => setEditingItem({ ...item, name: e.target.value })} className="w-full p-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <select value={item.category} onChange={e => setEditingItem({ ...item, category: e.target.value })} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Purchase Type</label>
              <select value={item.purchaseType} onChange={e => setEditingItem({ ...item, purchaseType: e.target.value as PurchaseType })} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                {PURCHASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Type-specific fields */}
          {item.purchaseType === 'package-roll' && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-blue-800 flex items-center gap-1"><Package className="w-4 h-4" /> Package-Roll Settings</h3>
              <div>
                <label className="text-xs text-blue-600">Pieces Per Pack (shared across stores)</label>
                <input type="number" value={item.piecesPerPack ?? ''} onChange={e => setEditingItem({ ...item, piecesPerPack: Number(e.target.value) })} className="w-full p-2 rounded-lg border border-blue-200 text-sm" />
              </div>
              {STORES.map(store => (
                <div key={store.id}>
                  <label className="text-xs text-blue-600">{store.name} — Total Pack Price (₱)</label>
                  <input type="number" value={item.storePrices[store.id].totalPackPrice || ''} onChange={e => updateItemPrice(item, store.id, 'totalPackPrice', Number(e.target.value))} className="w-full p-2 rounded-lg border border-blue-200 text-sm" />
                </div>
              ))}
            </div>
          )}

          {item.purchaseType === 'manual-bulk-repack' && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-orange-800">Manual Bulk-Repack Settings</h3>
              <div>
                <label className="text-xs text-orange-600">Custom Unit Name (e.g., "half bag")</label>
                <input value={item.customUnitName ?? ''} onChange={e => setEditingItem({ ...item, customUnitName: e.target.value })} className="w-full p-2 rounded-lg border border-orange-200 text-sm" />
              </div>
              {(['rcs', 'massway', 'nesabel', 'palengke'] as const).map(sid => (
                <div key={sid}>
                  <label className="text-xs text-orange-600">{sid === 'palengke' ? 'Palengke' : STORES.find(s => s.id === sid)?.name ?? sid} — Manual Unit Price (₱)</label>
                  <input type="number" value={item.storePrices[sid].manualUnitPrice || ''} onChange={e => updateItemPrice(item, sid, 'manualUnitPrice', Number(e.target.value))} className="w-full p-2 rounded-lg border border-orange-200 text-sm" />
                </div>
              ))}
            </div>
          )}

          {(item.purchaseType === 'candy' || item.purchaseType === 'cheap-packed-snack') && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-purple-800">{item.purchaseType === 'candy' ? 'Candy' : 'Cheap Packed Snack'} Settings</h3>
              <div>
                <label className="text-xs text-purple-600">Pieces Per Bulk Pack</label>
                <input type="number" value={item.piecesPerBulkPack ?? ''} onChange={e => setEditingItem({ ...item, piecesPerBulkPack: Number(e.target.value) })} className="w-full p-2 rounded-lg border border-purple-200 text-sm" />
              </div>
              <div>
                <label className="text-xs text-purple-600">Sell Bundle Size (pieces per bundle)</label>
                <input type="number" value={item.sellBundleSize ?? ''} onChange={e => setEditingItem({ ...item, sellBundleSize: Number(e.target.value) })} className="w-full p-2 rounded-lg border border-purple-200 text-sm" />
              </div>
              {STORES.map(store => (
                <div key={store.id} className="space-y-1">
                  <label className="text-xs text-purple-600 font-medium">{store.name}</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Bulk Cost" value={item.storePrices[store.id].bulkPackCost || ''} onChange={e => updateItemPrice(item, store.id, 'bulkPackCost', Number(e.target.value))} className="flex-1 p-2 rounded-lg border border-purple-200 text-sm" />
                    <input type="number" placeholder="Bundle Price" value={item.storePrices[store.id].sellBundlePrice || ''} onChange={e => updateItemPrice(item, store.id, 'sellBundlePrice', Number(e.target.value))} className="flex-1 p-2 rounded-lg border border-purple-200 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Per-Store Piece Prices */}
          {item.purchaseType === 'piece' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-1"><DollarSign className="w-4 h-4" /> Per-Piece SRP by Store</h3>
              {STORES.map(store => (
                <div key={store.id}>
                  <label className="text-xs text-gray-500">{store.name} (₱)</label>
                  <input type="number" value={item.storePrices[store.id].perPieceSRP || ''} onChange={e => updateItemPrice(item, store.id, 'perPieceSRP', Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Markup Override */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm">Markup & Pricing Overrides</h3>
            <div>
              <label className="text-xs text-gray-500">Per-Item Markup Override (₱) — blank = use global</label>
              <input type="number" value={item.markupOverride ?? ''} onChange={e => setEditingItem({ ...item, markupOverride: e.target.value ? Number(e.target.value) : undefined })} className="w-full p-2 rounded-lg border border-gray-200 text-sm" placeholder={`Global: ₱${settings.globalMarkup.toFixed(2)}`} />
            </div>
            {STORES.map(store => (
              <div key={store.id}>
                <label className="text-xs text-gray-500">{store.name} — Final Sticker Price Override (₱)</label>
                <input type="number" value={item.storePrices[store.id].finalStickerPrice || ''} onChange={e => updateItemPrice(item, store.id, 'finalStickerPrice', Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 text-sm" placeholder="Auto-calculated" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMode('list')} className="hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold">Settings</h1>
        </header>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-1"><Settings className="w-4 h-4" /> Global Markup</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">₱</span>
              <input
                type="number"
                value={settings.globalMarkup}
                onChange={e => {
                  const val = Number(e.target.value);
                  updateGlobalMarkup(val);
                  saveSettings({ ...settings, globalMarkup: val });
                }}
                step="0.50"
                className="flex-1 p-3 rounded-lg border border-gray-200 text-lg font-bold"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Applied to Piece and Package-Roll items only.</p>
          </div>

          <Button onClick={() => { setMode('list'); }} variant="outline" className="w-full">
            Back to Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-sm">Add Items and Edit Prices or Quantity</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('settings')} className="p-2 hover:bg-white/10 rounded-lg"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => setMode('add-item')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
          <Button onClick={() => navigateTo('classification')} variant="outline" className="flex-1 py-5 rounded-xl">
            <Tag className="w-4 h-4 mr-2" /> Classify
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="flex-1 p-3 rounded-lg border border-gray-200 text-sm"
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value as PurchaseType | 'all')} className="p-3 rounded-lg border border-gray-200 text-sm">
            <option value="all">All Types</option>
            {PURCHASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Unclassified warning */}
        {items.some(i => i.purchaseType === 'unclassified') && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2 text-sm text-orange-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{items.filter(i => i.purchaseType === 'unclassified').length} items still unclassified</span>
            <button onClick={() => navigateTo('classification')} className="ml-auto text-blue-600 font-medium hover:underline">Review</button>
          </div>
        )}

        {/* Item list */}
        <div className="space-y-3">
          {groupedItems.map(([category, catItems]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{category}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {catItems.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item.purchaseType === 'unclassified' ? 'bg-orange-100 text-orange-700' :
                          item.purchaseType === 'piece' ? 'bg-blue-100 text-blue-700' :
                          item.purchaseType === 'package-roll' ? 'bg-purple-100 text-purple-700' :
                          item.purchaseType === 'manual-bulk-repack' ? 'bg-orange-100 text-orange-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {item.purchaseType.replace(/-/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => { setEditingItem(item); setMode('edit-item'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
