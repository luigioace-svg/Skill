/**
 * Item Classification Checklist (Section 4.3)
 * 
 * Lists every item with controls to select Purchase Type.
 * Shows conditional fields based on selected type.
 * Visually flags unclassified items.
 * Filter to show only unclassified items.
 */

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useItemMutations } from '@/hooks/useFirestore';
import type { Item, PurchaseType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Check, Filter } from 'lucide-react';

const PURCHASE_TYPES: { value: PurchaseType; label: string; color: string }[] = [
  { value: 'piece', label: 'Piece', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'package-roll', label: 'Package-Roll', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'manual-bulk-repack', label: 'Manual Bulk', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'candy', label: 'Candy', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'cheap-packed-snack', label: 'Cheap Snack', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'unclassified', label: 'Unclassified', color: 'bg-gray-100 text-gray-500 border-gray-200' },
];

export default function ClassificationChecklist() {
  const { items, googleUser, navigateTo, adminFilterUnclassified, setAdminFilterUnclassified } = useAppStore();
  const { saveItem } = useItemMutations(googleUser?.uid ?? null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Item>>({});

  const filteredItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      // Unclassified first
      if (a.purchaseType === 'unclassified' && b.purchaseType !== 'unclassified') return -1;
      if (a.purchaseType !== 'unclassified' && b.purchaseType === 'unclassified') return 1;
      return a.name.localeCompare(b.name);
    });
    if (adminFilterUnclassified) {
      return sorted.filter(i => i.purchaseType === 'unclassified');
    }
    return sorted;
  }, [items, adminFilterUnclassified]);

  const startEdit = (item: Item) => {
    setEditingItemId(item.id);
    setEditValues({ ...item });
  };

  const saveEdit = async () => {
    if (!editingItemId || !editValues) return;
    const original = items.find(i => i.id === editingItemId);
    if (!original) return;
    const updated: Item = { ...original, ...editValues } as Item;
    await saveItem(updated);
    setEditingItemId(null);
    setEditValues({});
  };

  const handleTypeChange = async (item: Item, newType: PurchaseType) => {
    const updated: Item = { ...item, purchaseType: newType };
    // Set default values based on type
    if (newType === 'package-roll' && !updated.piecesPerPack) {
      updated.piecesPerPack = 10;
    }
    if (newType === 'candy' || newType === 'cheap-packed-snack') {
      if (!updated.piecesPerBulkPack) updated.piecesPerBulkPack = 0;
      if (!updated.sellBundleSize) updated.sellBundleSize = 0;
    }
    await saveItem(updated);
  };

  const unclassifiedCount = items.filter(i => i.purchaseType === 'unclassified').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-amber-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('admin')} className="hover:text-amber-200"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold text-sm">Item Classification Checklist</h1>
        </div>
        <button
          onClick={() => setAdminFilterUnclassified(!adminFilterUnclassified)}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${
            adminFilterUnclassified ? 'bg-amber-600 text-white' : 'bg-white/10 text-amber-200'
          }`}
        >
          <Filter className="w-3 h-3" />
          {adminFilterUnclassified ? 'Show All' : 'Unclassified Only'}
        </button>
      </header>

      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Unclassified</p>
              <p className={`text-2xl font-bold ${unclassifiedCount > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                {unclassifiedCount}
              </p>
            </div>
          </div>
          {unclassifiedCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
              <AlertTriangle className="w-3 h-3" />
              <span>{unclassifiedCount} items need classification before pricing works correctly.</span>
            </div>
          )}
        </div>

        {/* Item List */}
        {filteredItems.map(item => {
          const isEditing = editingItemId === item.id;
          const isUnclassified = item.purchaseType === 'unclassified';

          return (
            <div key={item.id} className={`bg-white rounded-xl border ${isUnclassified ? 'border-orange-300' : 'border-gray-200'} overflow-hidden`}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isUnclassified && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    <span className={`font-medium text-sm ${isUnclassified ? 'text-orange-700' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    PURCHASE_TYPES.find(t => t.value === item.purchaseType)?.color
                  }`}>
                    {item.purchaseType.replace(/-/g, ' ')}
                  </span>
                </div>

                {/* Type selector */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {PURCHASE_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(item, type.value)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                        item.purchaseType === type.value
                          ? type.color + ' font-medium'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {item.purchaseType === type.value && <Check className="w-3 h-3 inline mr-0.5" />}
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Conditional fields */}
                {isEditing ? (
                  <div className="mt-2 space-y-2 bg-gray-50 rounded-lg p-3">
                    {editValues.purchaseType === 'package-roll' && (
                      <div>
                        <label className="text-xs text-gray-500">Pieces Per Pack</label>
                        <input
                          type="number"
                          value={editValues.piecesPerPack ?? ''}
                          onChange={e => setEditValues({ ...editValues, piecesPerPack: Number(e.target.value) })}
                          className="w-full p-2 rounded border border-gray-200 text-sm"
                        />
                      </div>
                    )}
                    {editValues.purchaseType === 'manual-bulk-repack' && (
                      <div>
                        <label className="text-xs text-gray-500">Custom Unit Name</label>
                        <input
                          value={editValues.customUnitName ?? ''}
                          onChange={e => setEditValues({ ...editValues, customUnitName: e.target.value })}
                          className="w-full p-2 rounded border border-gray-200 text-sm"
                          placeholder="e.g., half bag"
                        />
                      </div>
                    )}
                    {(editValues.purchaseType === 'candy' || editValues.purchaseType === 'cheap-packed-snack') && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Pieces/Bulk</label>
                          <input
                            type="number"
                            value={editValues.piecesPerBulkPack ?? ''}
                            onChange={e => setEditValues({ ...editValues, piecesPerBulkPack: Number(e.target.value) })}
                            className="w-full p-2 rounded border border-gray-200 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Bundle Size</label>
                          <input
                            type="number"
                            value={editValues.sellBundleSize ?? ''}
                            onChange={e => setEditValues({ ...editValues, sellBundleSize: Number(e.target.value) })}
                            className="w-full p-2 rounded border border-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm" className="bg-blue-600 text-white">
                        <Check className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button onClick={() => setEditingItemId(null)} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Quick info */
                  <div className="mt-1 text-xs text-gray-500">
                    {item.purchaseType === 'package-roll' && item.piecesPerPack && (
                      <span>{item.piecesPerPack} pieces per pack</span>
                    )}
                    {item.purchaseType === 'manual-bulk-repack' && item.customUnitName && (
                      <span>Unit: {item.customUnitName}</span>
                    )}
                    {(item.purchaseType === 'candy' || item.purchaseType === 'cheap-packed-snack') && (
                      <span>
                        {item.piecesPerBulkPack ? `${item.piecesPerBulkPack} pcs/bulk` : ''}
                        {item.sellBundleSize ? `, ${item.sellBundleSize} pcs/bundle` : ''}
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      Edit details
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
