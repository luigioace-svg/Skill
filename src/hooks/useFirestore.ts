/**
 * Firestore Data Layer — Hooks for all database operations
 * 
 * Handles read/write for: items, sales, expenses, settings, PIN.
 * Uses localStorage as offline cache with Firestore sync.
 * All data is scoped to the authenticated user's UID.
 * 
 * SECURITY NOTE: Firestore runs in open/test mode for Phase 1.
 * Data reads/writes are filtered by user UID in application logic only.
 * Firestore Security Rules must be added in Phase 2 before public deployment.
 */

import { useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, onSnapshot, writeBatch
} from 'firebase/firestore';
import { db, COLLECTIONS, DOC_IDS } from '@/lib/firebase';
import { useAppStore } from '@/store/appStore';
import { allSeedItems } from '@/lib/seedData';
import type { Item, SaleTransaction, Expense, GlobalSettings } from '@/types';

// LocalStorage keys for offline cache
const LS_KEYS = {
  items: 'sss_items',
  sales: 'sss_sales',
  expenses: 'sss_expenses',
  settings: 'sss_settings',
  pinExists: 'sss_pin_exists',
};

/** Get user-scoped collection reference */
function userCol(userId: string, col: string) {
  return collection(db, 'users', userId, col);
}

function userDoc(userId: string, col: string, docId: string) {
  return doc(db, 'users', userId, col, docId);
}

// =============================================================================
// INITIALIZATION — Seed data + Firestore sync
// =============================================================================

export function useInitializeData(userId: string | null) {
  const { setItems, setSales, setExpenses, setSettings, setPinExists, setLoading } = useAppStore();

  const initialize = useCallback(async () => {
    // First, try to load from localStorage for immediate display
    const cachedItems = localStorage.getItem(LS_KEYS.items);
    const cachedSales = localStorage.getItem(LS_KEYS.sales);
    const cachedExpenses = localStorage.getItem(LS_KEYS.expenses);
    const cachedSettings = localStorage.getItem(LS_KEYS.settings);
    const cachedPinExists = localStorage.getItem(LS_KEYS.pinExists);

    if (cachedItems) { try { setItems(JSON.parse(cachedItems)); } catch {} }
    if (cachedSales) { try { setSales(JSON.parse(cachedSales)); } catch {} }
    if (cachedExpenses) { try { setExpenses(JSON.parse(cachedExpenses)); } catch {} }
    if (cachedSettings) { try { setSettings(JSON.parse(cachedSettings)); } catch {} }
    if (cachedPinExists) { setPinExists(cachedPinExists === 'true'); }

    if (!userId) {
      // No user — use localStorage-only mode (demo/offline)
      if (!cachedItems) {
        // First run with no user — use seed data
        setItems(allSeedItems);
        localStorage.setItem(LS_KEYS.items, JSON.stringify(allSeedItems));
      }
      setLoading(false);
      return;
    }

    // Check if user has data in Firestore
    try {
      const itemsSnap = await getDocs(userCol(userId, COLLECTIONS.items));
      if (itemsSnap.empty) {
        // First run — seed Firestore with initial data
        const batch = writeBatch(db);
        for (const item of allSeedItems) {
          const ref = doc(userCol(userId, COLLECTIONS.items));
          batch.set(ref, { ...item, firestoreId: ref.id });
        }
        // Initialize settings
        batch.set(userDoc(userId, COLLECTIONS.settings, DOC_IDS.globalSettings), {
          globalMarkup: 4.50,
        });
        await batch.commit();
      }

      // Subscribe to real-time updates
      const unsubItems = onSnapshot(userCol(userId, COLLECTIONS.items), (snap) => {
        const items: Item[] = snap.docs.map(d => ({ ...d.data(), id: d.data().id || d.id } as Item));
        setItems(items);
        localStorage.setItem(LS_KEYS.items, JSON.stringify(items));
      });

      const unsubSales = onSnapshot(userCol(userId, COLLECTIONS.sales), (snap) => {
        const sales: SaleTransaction[] = snap.docs.map(d => {
          const data = d.data();
          return { ...data, timestamp: data.timestamp?.toDate() || new Date(data.timestamp) } as SaleTransaction;
        });
        setSales(sales);
        localStorage.setItem(LS_KEYS.sales, JSON.stringify(sales));
      });

      const unsubExpenses = onSnapshot(userCol(userId, COLLECTIONS.expenses), (snap) => {
        const expenses: Expense[] = snap.docs.map(d => {
          const data = d.data();
          return { ...data, date: data.date?.toDate() || new Date(data.date) } as Expense;
        });
        setExpenses(expenses);
        localStorage.setItem(LS_KEYS.expenses, JSON.stringify(expenses));
      });

      const unsubSettings = onSnapshot(userDoc(userId, COLLECTIONS.settings, DOC_IDS.globalSettings), (docSnap) => {
        if (docSnap.exists()) {
          const s = docSnap.data() as GlobalSettings;
          setSettings(s);
          localStorage.setItem(LS_KEYS.settings, JSON.stringify(s));
        }
      });

      const unsubPin = onSnapshot(userDoc(userId, COLLECTIONS.settings, DOC_IDS.pinSettings), (docSnap) => {
        const exists = docSnap.exists() && docSnap.data()?.pinHash;
        setPinExists(!!exists);
        localStorage.setItem(LS_KEYS.pinExists, String(!!exists));
      });

      setLoading(false);

      return () => {
        unsubItems();
        unsubSales();
        unsubExpenses();
        unsubSettings();
        unsubPin();
      };
    } catch (err) {
      console.error('Firestore init error:', err);
      // Fallback to localStorage
      if (!cachedItems) setItems(allSeedItems);
      setLoading(false);
    }
  }, [userId, setItems, setSales, setExpenses, setSettings, setPinExists, setLoading]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initialize().then((fn) => { cleanup = fn; });
    return () => cleanup?.();
  }, [initialize]);
}

// =============================================================================
// ITEM CRUD
// =============================================================================

export function useItemMutations(userId: string | null) {
  const { items, setItems } = useAppStore();

  const saveItem = useCallback(async (item: Item) => {
    // Optimistic local update
    const updated = items.map(i => i.id === item.id ? item : i);
    if (!items.find(i => i.id === item.id)) {
      updated.push(item);
    }
    setItems(updated);
    localStorage.setItem(LS_KEYS.items, JSON.stringify(updated));

    if (!userId) return;
    try {
      const q = query(userCol(userId, COLLECTIONS.items), where('id', '==', item.id));
      const snap = await getDocs(q);
      if (snap.empty) {
        await setDoc(doc(userCol(userId, COLLECTIONS.items)), item);
      } else {
        await setDoc(snap.docs[0].ref, item);
      }
    } catch (err) {
      console.error('Save item error:', err);
    }
  }, [userId, items, setItems]);

  const removeItem = useCallback(async (itemId: string) => {
    const updated = items.filter(i => i.id !== itemId);
    setItems(updated);
    localStorage.setItem(LS_KEYS.items, JSON.stringify(updated));

    if (!userId) return;
    try {
      const q = query(userCol(userId, COLLECTIONS.items), where('id', '==', itemId));
      const snap = await getDocs(q);
      for (const d of snap.docs) await deleteDoc(d.ref);
    } catch (err) {
      console.error('Remove item error:', err);
    }
  }, [userId, items, setItems]);

  return { saveItem, removeItem };
}

// =============================================================================
// SALES
// =============================================================================

export function useSaleMutations(userId: string | null) {
  const { sales, setSales } = useAppStore();

  const recordSale = useCallback(async (sale: SaleTransaction) => {
    const updated = [...sales, sale];
    setSales(updated);
    localStorage.setItem(LS_KEYS.sales, JSON.stringify(updated));

    if (!userId) return;
    try {
      await setDoc(doc(userCol(userId, COLLECTIONS.sales)), sale);
    } catch (err) {
      console.error('Record sale error:', err);
    }
  }, [userId, sales, setSales]);

  return { recordSale };
}

// =============================================================================
// EXPENSES
// =============================================================================

export function useExpenseMutations(userId: string | null) {
  const { expenses, setExpenses } = useAppStore();

  const logExpense = useCallback(async (expense: Expense) => {
    const updated = [...expenses, expense];
    setExpenses(updated);
    localStorage.setItem(LS_KEYS.expenses, JSON.stringify(updated));

    if (!userId) return;
    try {
      await setDoc(doc(userCol(userId, COLLECTIONS.expenses)), expense);
    } catch (err) {
      console.error('Log expense error:', err);
    }
  }, [userId, expenses, setExpenses]);

  return { logExpense };
}

// =============================================================================
// SETTINGS
// =============================================================================

export function useSettingsMutations(userId: string | null) {
  const { setSettings } = useAppStore();

  const saveSettings = useCallback(async (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    localStorage.setItem(LS_KEYS.settings, JSON.stringify(newSettings));

    if (!userId) return;
    try {
      await setDoc(userDoc(userId, COLLECTIONS.settings, DOC_IDS.globalSettings), newSettings);
    } catch (err) {
      console.error('Save settings error:', err);
    }
  }, [userId, setSettings]);

  return { saveSettings };
}

// =============================================================================
// PIN
// =============================================================================

export function usePinMutations(userId: string | null) {
  const setPinExists = useAppStore(s => s.setPinExists);

  /**
   * Saves the PIN to Firestore. Throws on failure so the caller (UI) can
   * surface a real error to the user instead of failing silently.
   * pinExists is only set — and only local state updated — once the write
   * is confirmed to have succeeded.
   */
  const savePin = useCallback(async (pin: string) => {
    if (!userId) {
      localStorage.setItem(LS_KEYS.pinExists, 'true');
      setPinExists(true);
      return;
    }
    // Simple hash — NOT cryptographically secure, but sufficient for this use case
    // In production, use a proper hashing library
    const hash = btoa(pin + '_salt_' + userId);
    // No try/catch here: let the error propagate to the caller. Swallowing
    // it here is what previously caused "Create PIN" to do nothing on failure.
    await setDoc(userDoc(userId, COLLECTIONS.settings, DOC_IDS.pinSettings), { pinHash: hash });
    // Only reached if setDoc genuinely resolved successfully.
    setPinExists(true);
    localStorage.setItem(LS_KEYS.pinExists, 'true');
  }, [userId, setPinExists]);

  /**
   * Verifies a PIN against Firestore. Throws on read failure (e.g. offline,
   * permissions) so the caller can distinguish "wrong PIN" from "couldn't
   * check the PIN" and show an appropriate message.
   */
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!userId) {
      // Local-only mode — check against localStorage
      return true; // In local mode, any PIN works (demo)
    }
    const snap = await getDoc(userDoc(userId, COLLECTIONS.settings, DOC_IDS.pinSettings));
    if (!snap.exists()) return false;
    const hash = btoa(pin + '_salt_' + userId);
    return snap.data()?.pinHash === hash;
  }, [userId]);

  /**
   * Checks Firestore directly for whether a PIN document already exists for
   * this user. Used on fresh app load so the "which screen do I show" decision
   * is never based on stale client-side state (Bug 2 fix).
   */
  const checkPinExists = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      return localStorage.getItem(LS_KEYS.pinExists) === 'true';
    }
    const snap = await getDoc(userDoc(userId, COLLECTIONS.settings, DOC_IDS.pinSettings));
    const exists = snap.exists() && !!snap.data()?.pinHash;
    localStorage.setItem(LS_KEYS.pinExists, String(exists));
    return exists;
  }, [userId]);

  return { savePin, verifyPin, checkPinExists };
                                            }
      
