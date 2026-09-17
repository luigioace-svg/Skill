/**
 * Home Screen — Main Entry Flow
 * 
 * Section 6.1: Choose destination:
 * - Grocery → Store selection (RCS / Massway / Nesabel) → Budget → List
 * - Palengke
 * - Sari-Sari Store (sales, reports, expenses)
 * 
 * Also provides access to Admin Panel via hamburger menu.
 */

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { STORES } from '@/lib/seedData';
import {
  ShoppingCart, Store, TrendingUp,
  Settings, LogOut, Menu, X, ChevronRight, Receipt,
  PackageSearch, ClipboardList, Calculator, PiggyBank
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomeScreen() {
  const { navigateTo, startGrocerySession, setGoogleUser, setPinVerified } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  const handleBudgetSubmit = () => {
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget <= 0) return;
    startGrocerySession(selectedStore as 'rcs' | 'massway' | 'nesabel', budget);
    navigateTo('grocery');
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    setGoogleUser(null);
    setPinVerified(false);
    localStorage.clear();
    navigateTo('auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-400" />
          <h1 className="font-semibold text-sm">Sari-Sari Store System</h1>
        </div>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-lg">
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Menu Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-slate-900 text-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setShowMenu(false)} className="p-1 hover:bg-white/10 rounded"><X className="w-4 h-4" /></button>
            </div>
            <nav className="p-2 space-y-1">
              <MenuItem icon={<PackageSearch className="w-4 h-4" />} label="Item Classification" onClick={() => { navigateTo('classification'); setShowMenu(false); }} />
              <MenuItem icon={<Receipt className="w-4 h-4" />} label="Expense Logger" onClick={() => { navigateTo('expenses'); setShowMenu(false); }} />
              <MenuItem icon={<Settings className="w-4 h-4" />} label="Admin Panel" onClick={() => { navigateTo('admin'); setShowMenu(false); }} />
              <div className="border-t border-white/10 my-2" />
              <MenuItem icon={<LogOut className="w-4 h-4" />} label="Sign Out" onClick={handleLogout} />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
          <h2 className="text-lg font-bold mb-1">Welcome!</h2>
          <p className="text-blue-200/70 text-sm">Manage your grocery budget and track store sales.</p>
        </div>

        {/* Grocery Section */}
        {!showStores ? (
          <button
            onClick={() => setShowStores(true)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-200 text-left hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Grocery Shopping</h3>
                  <p className="text-gray-500 text-xs">Plan your budget across 3 stores</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </button>
        ) : !selectedStore ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select Store</h3>
              <button onClick={() => setShowStores(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {STORES.map(store => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store.id)}
                  className="w-full p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-all"
                >
                  <span className="font-medium text-gray-900">{store.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {STORES.find(s => s.id === selectedStore)?.name}
              </h3>
              <button onClick={() => { setSelectedStore(null); setBudgetInput(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <label className="block text-sm text-gray-600 mb-2">Enter your budget (₱)</label>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-xl border border-gray-200 text-lg font-semibold mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <Button
              onClick={handleBudgetSubmit}
              disabled={!budgetInput || parseFloat(budgetInput) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl disabled:opacity-40"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Start Planning
            </Button>
          </div>
        )}

        {/* Palengke Section */}
        <button
          onClick={() => navigateTo('palengke')}
          className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-200 text-left hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Public Market (Palengke)</h3>
                <p className="text-gray-500 text-xs">Wet market items with separate pricing</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          </div>
        </button>

        {/* Sari-Sari Store Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sari-Sari Store</h3>
              <p className="text-gray-500 text-xs">Sales tracking &amp; financial reports</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigateTo('sales-entry')} className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors text-center">
              <Receipt className="w-4 h-4 mx-auto mb-1" />Record Sale
            </button>
            <button onClick={() => navigateTo('daily-view')} className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors text-center">
              <ClipboardList className="w-4 h-4 mx-auto mb-1" />Daily View
            </button>
            <button onClick={() => navigateTo('weekly-view')} className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-colors text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-1" />Weekly View
            </button>
            <button onClick={() => navigateTo('monthly-view')} className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium transition-colors text-center">
              <PiggyBank className="w-4 h-4 mx-auto mb-1" />Monthly Report
            </button>
            <button onClick={() => navigateTo('expenses')} className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium transition-colors text-center">
              <Receipt className="w-4 h-4 mx-auto mb-1" />Expenses
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-left text-sm transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
