/**
 * Zustand App Store — Central State Management
 * 
 * Manages all application state with real-time reactivity (Section 10).
 * All data changes immediately reflect across all views.
 */

import { create } from 'zustand';
import type { Item, StoreId, CartItem, SaleTransaction, Expense, GlobalSettings } from '@/types';

export type AppView =
  | 'auth'
  | 'pin-setup'
  | 'pin-lock'
  | 'home'
  | 'grocery'
  | 'palengke'
  | 'sales-entry'
  | 'daily-view'
  | 'weekly-view'
  | 'monthly-view'
  | 'admin'
  | 'classification'
  | 'expenses';

export interface GrocerySession {
  storeId: StoreId;
  budget: number;
  cart: CartItem[];
}

interface AppState {
  // Navigation
  currentView: AppView;
  previousView: AppView | null;
  navigateTo: (view: AppView) => void;
  goBack: () => void;

  // Auth
  googleUser: { uid: string; email: string | null; displayName: string | null } | null;
  pinVerified: boolean;
  pinExists: boolean;
  // True once we've asked Firestore (not just trusted a cached/default value)
  // whether a PIN exists for the current user. Gates routing decisions so we
  // never show pin-setup just because pinExists still holds its initial
  // default of false while the real check is in flight.
  pinCheckComplete: boolean;
  setGoogleUser: (user: AppState['googleUser']) => void;
  setPinVerified: (v: boolean) => void;
  setPinExists: (v: boolean) => void;
  setPinCheckComplete: (v: boolean) => void;

  // Data
  items: Item[];
  setItems: (items: Item[]) => void;
  updateItem: (item: Item) => void;
  deleteItem: (itemId: string) => void;

  // Sales
  sales: SaleTransaction[];
  addSale: (sale: SaleTransaction) => void;
  setSales: (sales: SaleTransaction[]) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  setExpenses: (expenses: Expense[]) => void;

  // Settings
  settings: GlobalSettings;
  setSettings: (s: GlobalSettings) => void;
  updateGlobalMarkup: (markup: number) => void;

  // Grocery Session
  grocerySession: GrocerySession | null;
  startGrocerySession: (storeId: StoreId, budget: number) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Selected date for views
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;

  // Admin
  adminFilterUnclassified: boolean;
  setAdminFilterUnclassified: (v: boolean) => void;

  // Loading
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'auth',
  previousView: null,
  navigateTo: (view) => set((s) => ({ previousView: s.currentView, currentView: view })),
  goBack: () => set((s) => ({ currentView: s.previousView ?? 'home', previousView: null })),

  // Auth
  googleUser: null,
  pinVerified: false,
  pinExists: false,
  pinCheckComplete: false,
  setGoogleUser: (user) => set({ googleUser: user }),
  setPinVerified: (v) => set({ pinVerified: v }),
  setPinExists: (v) => set({ pinExists: v }),
  setPinCheckComplete: (v) => set({ pinCheckComplete: v }),

  // Data
  items: [],
  setItems: (items) => set({ items }),
  updateItem: (item) => set((s) => ({
    items: s.items.map((i) => (i.id === item.id ? item : i)),
  })),
  deleteItem: (itemId) => set((s) => ({
    items: s.items.filter((i) => i.id !== itemId),
  })),

  // Sales
  sales: [],
  addSale: (sale) => set((s) => ({ sales: [...s.sales, sale] })),
  setSales: (sales) => set({ sales }),

  // Expenses
  expenses: [],
  addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, expense] })),
  setExpenses: (expenses) => set({ expenses }),

  // Settings
  settings: { globalMarkup: 4.50 },
  setSettings: (settings) => set({ settings }),
  updateGlobalMarkup: (markup) => set((s) => ({
    settings: { ...s.settings, globalMarkup: markup },
  })),

  // Grocery Session
  grocerySession: null,
  startGrocerySession: (storeId, budget) => set({
    grocerySession: { storeId, budget, cart: [] },
  }),
  addToCart: (item) => set((s) => {
    if (!s.grocerySession) return s;
    const existing = s.grocerySession.cart.find((c) => c.itemId === item.itemId && c.unitType === item.unitType);
    let newCart: CartItem[];
    if (existing) {
      newCart = s.grocerySession.cart.map((c) =>
        c.itemId === item.itemId && c.unitType === item.unitType
          ? { ...c, quantity: c.quantity + item.quantity, subtotal: c.subtotal + item.subtotal }
          : c
      );
    } else {
      newCart = [...s.grocerySession.cart, item];
    }
    return { grocerySession: { ...s.grocerySession, cart: newCart } };
  }),
  removeFromCart: (itemId) => set((s) => {
    if (!s.grocerySession) return s;
    return { grocerySession: { ...s.grocerySession, cart: s.grocerySession.cart.filter((c) => c.itemId !== itemId) } };
  }),
  updateCartQuantity: (itemId, quantity) => set((s) => {
    if (!s.grocerySession) return s;
    return {
      grocerySession: {
        ...s.grocerySession,
        cart: s.grocerySession.cart.map((c) =>
          c.itemId === itemId ? { ...c, quantity, subtotal: (c.subtotal / c.quantity) * quantity } : c
        ),
      },
    };
  }),
  clearCart: () => set((s) => {
    if (!s.grocerySession) return s;
    return { grocerySession: { ...s.grocerySession, cart: [] } };
  }),

  // Selected date
  selectedDate: new Date(),
  setSelectedDate: (d) => set({ selectedDate: d }),

  // Admin
  adminFilterUnclassified: false,
  setAdminFilterUnclassified: (v) => set({ adminFilterUnclassified: v }),

  // Loading
  loading: true,
  setLoading: (v) => set({ loading: v }),
}));
