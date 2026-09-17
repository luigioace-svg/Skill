/**
 * Sari-Sari Store System — Type Definitions
 * 
 * Data model design notes:
 * - Items are shared across all stores (classification is per-item)
 * - Prices are per-store (3 supermarkets + Palengke)
 * - PurchaseType determines which pricing fields are active
 * - All price fields default to 0 (blank/editable per spec Section 1)
 */

export type StoreId = 'rcs' | 'massway' | 'nesabel';
export type PurchaseType = 'piece' | 'package-roll' | 'manual-bulk-repack' | 'candy' | 'cheap-packed-snack' | 'unclassified';

/** A store in the system */
export interface Store {
  id: StoreId;
  name: string;
}

/** Core item definition — shared across all stores */
export interface Item {
  id: string;
  name: string;
  category: string;
  purchaseType: PurchaseType;
  // Package-Roll: shared across stores (manufacturer constant)
  piecesPerPack?: number;
  // Manual Bulk-Repack: shared unit name
  customUnitName?: string;
  // Candy / Cheap Packed Snack: shared pack info
  piecesPerBulkPack?: number;
  sellBundleSize?: number;
  // Per-item markup override (only applies to piece/package-roll)
  markupOverride?: number;
  // Per-store pricing data
  storePrices: Record<StoreId | 'palengke', StorePrice>;
}

/** Per-store pricing data for an item */
export interface StorePrice {
  // Piece: per-piece SRP
  perPieceSRP: number;
  // Package-Roll: total pack price (piecesPerPack is on Item)
  totalPackPrice: number;
  // Manual Bulk-Repack: manual unit price
  manualUnitPrice: number;
  // Candy / Cheap Packed Snack
  bulkPackCost: number;
  sellBundlePrice: number;
  // Final sticker price override (Section 5.4) — per-store
  finalStickerPrice: number;
}

/** A cart entry for grocery shopping */
export interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitType: 'piece' | 'package';
  subtotal: number;
}

/** A cart session for a shopping trip */
export interface CartSession {
  id: string;
  storeId: StoreId | 'palengke';
  budget: number;
  items: CartItem[];
  createdAt: Date;
}

/** A recorded sale transaction */
export interface SaleTransaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  // For candy/cheap-packed-snack: quantity is in BUNDLES
  unitType: 'piece' | 'bundle';
  finalStickerPrice: number;
  baseCost: number;
  totalRevenue: number;
  capitalRecovered: number;
  markupProfit: number;
  timestamp: Date;
}

/** Expense entry */
export interface Expense {
  id: string;
  type: 'electricity' | 'transportation';
  amount: number;
  date: Date;
  note?: string;
}

/** Global settings */
export interface GlobalSettings {
  globalMarkup: number;
  pinHash?: string; // Stored in Firestore, not local
}

/** Financial summary for a period */
export interface FinancialSummary {
  capitalRecovered: number;
  markupProfit: number;
  grossIncome: number; // Same as markupProfit before deductions
  electricityDeduction: number;
  transportationDeduction: number;
  growthFund: number; // Net Income
  itemBreakdown: ItemFinancialBreakdown[];
}

/** Per-item financial breakdown */
export interface ItemFinancialBreakdown {
  itemId: string;
  itemName: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  capitalRecovered: number;
  markupProfit: number;
}

/** Auth state */
export interface AuthState {
  googleUser: GoogleUser | null;
  pinVerified: boolean;
  pinExists: boolean;
}

export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/** Category group for display */
export interface CategoryGroup {
  name: string;
  items: Item[];
}
