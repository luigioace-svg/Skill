/**
 * Core Calculation Engine — Sari-Sari Store Pricing & Financial Tracking
 * 
 * CRITICAL: Every worked example in the spec must produce exact figures.
 * Test cases from the specification:
 * 
 * 1. Milo roll: ₱105.60 ÷ 12 = ₱8.80/piece base cost (Section 4.1.B)
 * 2. Hansel biscuit: ₱60.00 ÷ 10 = ₱6.00/piece base cost (Section 4.1.B)
 * 3. Kopiko Blanca: ₱12.40 + ₱4.60 = ₱17.00 selling price (Section 5.2)
 * 4. Twinpack Original: 4 pcs × ₱17.00 = ₱68.00 revenue;
 *    Capital: 4 × ₱12.60 = ₱50.40;
 *    Markup: 4 × ₱4.40 = ₱17.60;
 *    Check: ₱50.40 + ₱17.60 = ₱68.00 ✓ (Section 9.2)
 * 5. Salt: manual price ₱8.00, NO markup applied (Section 5.2)
 * 6. Mr. Yema: Bulk ₱23.50/24pcs, bundle 3pcs/₱5.00, NO markup (Section 4.1.D)
 * 7. Tahoos: Bulk ₱18.20/12pcs, bundle 2pcs/₱5.00, NO markup (Section 4.1.E)
 */

import type { Item, StoreId, SaleTransaction, Expense } from '@/types';

// =============================================================================
// ITEM-LEVEL PRICING CALCULATIONS
// =============================================================================

/** 
 * Compute the per-piece base cost for an item at a given store.
 * This is the cost the store incurs per unit sold.
 */
export function computeBaseCost(item: Item, storeId: StoreId | 'palengke'): number {
  const sp = item.storePrices[storeId];
  if (!sp) return 0;

  switch (item.purchaseType) {
    case 'piece':
      return sp.perPieceSRP;

    case 'package-roll':
      if (!item.piecesPerPack || item.piecesPerPack === 0) return 0;
      return sp.totalPackPrice / item.piecesPerPack;

    case 'manual-bulk-repack':
      return sp.manualUnitPrice;

    case 'candy':
    case 'cheap-packed-snack':
      if (!item.piecesPerBulkPack || item.piecesPerBulkPack === 0) return 0;
      return sp.bulkPackCost / item.piecesPerBulkPack;

    case 'unclassified':
    default:
      return 0;
  }
}

/**
 * Compute the per-piece base cost WITHOUT the Global Markup.
 * For piece/package-roll items, this is the grocery cost.
 * For manual/candy/cheap-packed-snack, same as base cost.
 */
export function computeGroceryCost(item: Item, storeId: StoreId | 'palengke'): number {
  return computeBaseCost(item, storeId);
}

/**
 * Compute the effective markup for an item.
 * Only Piece and Package-Roll items use markup.
 * Manual Bulk-Repack, Candy, Cheap Packed Snack = ₱0 markup.
 */
export function computeEffectiveMarkup(item: Item, globalMarkup: number): number {
  if (item.purchaseType === 'piece' || item.purchaseType === 'package-roll') {
    return item.markupOverride ?? globalMarkup;
  }
  return 0;
}

/**
 * Compute the store selling price (computed, before sticker override).
 * Piece: SRP + markup
 * Package-Roll: (pack price / pieces) + markup
 * Manual Bulk-Repack: manual unit price (no markup)
 * Candy/Cheap Packed Snack: sell bundle price (no markup)
 */
export function computeSellingPrice(item: Item, storeId: StoreId | 'palengke', globalMarkup: number): number {
  const baseCost = computeBaseCost(item, storeId);
  const markup = computeEffectiveMarkup(item, globalMarkup);

  switch (item.purchaseType) {
    case 'piece':
      return baseCost + markup;

    case 'package-roll': {
      const ppc = computeBaseCost(item, storeId);
      return ppc + markup;
    }

    case 'manual-bulk-repack':
      return baseCost;

    case 'candy':
    case 'cheap-packed-snack': {
      const sp = item.storePrices[storeId];
      return sp?.sellBundlePrice ?? 0;
    }

    default:
      return 0;
  }
}

/**
 * Get the final sticker price for an item at a store.
 * If user has overridden, use that; otherwise use computed selling price.
 */
export function getFinalStickerPrice(item: Item, storeId: StoreId | 'palengke', globalMarkup: number): number {
  const sp = item.storePrices[storeId];
  if (!sp) return 0;
  // If finalStickerPrice is set (> 0), use it; otherwise use computed
  if (sp.finalStickerPrice > 0) {
    return sp.finalStickerPrice;
  }
  return computeSellingPrice(item, storeId, globalMarkup);
}

// =============================================================================
// FINANCIAL CALCULATIONS
// =============================================================================

/** 
 * Compute financials for a single sale transaction.
 * Returns: totalRevenue, capitalRecovered, markupProfit
 */
export function computeTransactionFinancials(
  item: Item,
  storeId: StoreId | 'palengke',
  globalMarkup: number,
  quantity: number,
  unitType: 'piece' | 'bundle',
  overrideStickerPrice?: number
): { totalRevenue: number; capitalRecovered: number; markupProfit: number } {
  const baseCostPerUnit = computeBaseCost(item, storeId);
  const stickerPrice = overrideStickerPrice ?? getFinalStickerPrice(item, storeId, globalMarkup);

  let totalRevenue = 0;
  let capitalRecovered = 0;

  if (item.purchaseType === 'candy' || item.purchaseType === 'cheap-packed-snack') {
    // Bundle-based: quantity = number of bundles sold
    const bundleSize = item.sellBundleSize ?? 1;
    if (unitType === 'bundle') {
      totalRevenue = stickerPrice * quantity;
      capitalRecovered = baseCostPerUnit * bundleSize * quantity;
    } else {
      // Individual piece sale (less common for candy)
      totalRevenue = stickerPrice * quantity;
      capitalRecovered = baseCostPerUnit * quantity;
    }
  } else {
    // Per-piece sale
    totalRevenue = stickerPrice * quantity;
    capitalRecovered = baseCostPerUnit * quantity;
  }

  const markupProfit = totalRevenue - capitalRecovered;

  return { totalRevenue, capitalRecovered, markupProfit };
}

// =============================================================================
// AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Aggregate transactions by item for a given period.
 */
export function aggregateByItem(transactions: SaleTransaction[]) {
  const map = new Map<string, {
    itemId: string;
    itemName: string;
    unitsSold: number;
    totalRevenue: number;
    capitalRecovered: number;
    markupProfit: number;
  }>();

  for (const t of transactions) {
    const existing = map.get(t.itemId);
    if (existing) {
      existing.unitsSold += t.quantity;
      existing.totalRevenue += t.totalRevenue;
      existing.capitalRecovered += t.capitalRecovered;
      existing.markupProfit += t.markupProfit;
    } else {
      map.set(t.itemId, {
        itemId: t.itemId,
        itemName: t.itemName,
        unitsSold: t.quantity,
        totalRevenue: t.totalRevenue,
        capitalRecovered: t.capitalRecovered,
        markupProfit: t.markupProfit,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Compute daily/weekly/monthly financial summary.
 */
export function computeFinancialSummary(
  transactions: SaleTransaction[],
  expenses: Expense[],
  period: 'daily' | 'weekly' | 'monthly',
  referenceDate: Date
): {
  capitalRecovered: number;
  markupProfit: number;
  grossIncome: number;
  electricityDeduction: number;
  transportationDeduction: number;
  growthFund: number;
  itemBreakdown: ReturnType<typeof aggregateByItem>;
} {
  // Filter transactions by period
  const filteredTx = transactions.filter(t => isInPeriod(t.timestamp, period, referenceDate));
  const filteredExp = expenses.filter(e => isInPeriod(e.date, period, referenceDate));

  const capitalRecovered = filteredTx.reduce((sum, t) => sum + t.capitalRecovered, 0);
  const markupProfit = filteredTx.reduce((sum, t) => sum + t.markupProfit, 0);
  const grossIncome = markupProfit;

  const electricityDeduction = filteredExp
    .filter(e => e.type === 'electricity')
    .reduce((sum, e) => sum + e.amount, 0);

  const transportationDeduction = filteredExp
    .filter(e => e.type === 'transportation')
    .reduce((sum, e) => sum + e.amount, 0);

  const growthFund = markupProfit - electricityDeduction - transportationDeduction;

  return {
    capitalRecovered,
    markupProfit,
    grossIncome,
    electricityDeduction,
    transportationDeduction,
    growthFund,
    itemBreakdown: aggregateByItem(filteredTx),
  };
}

function isInPeriod(date: Date, period: 'daily' | 'weekly' | 'monthly', reference: Date): boolean {
  const d = new Date(date);
  const r = new Date(reference);

  if (period === 'daily') {
    return d.toDateString() === r.toDateString();
  }

  if (period === 'weekly') {
    // Same week (Monday-start)
    const dMon = new Date(d); dMon.setDate(d.getDate() - d.getDay() + 1); dMon.setHours(0,0,0,0);
    const rMon = new Date(r); rMon.setDate(r.getDate() - r.getDay() + 1); rMon.setHours(0,0,0,0);
    return dMon.getTime() === rMon.getTime();
  }

  if (period === 'monthly') {
    return d.getMonth() === r.getMonth() && d.getFullYear() === r.getFullYear();
  }

  return false;
}

// =============================================================================
// TEST VERIFICATION (runs at module init in dev)
// =============================================================================

/** Verify all worked examples from the spec */
export function verifyWorkedExamples(): boolean {
  let allPassed = true;
  const check = (name: string, actual: number, expected: number) => {
    const passed = Math.abs(actual - expected) < 0.01;
    if (!passed) {
      console.error(`FAIL: ${name} — expected ₱${expected.toFixed(2)}, got ₱${actual.toFixed(2)}`);
      allPassed = false;
    } else {
      console.log(`PASS: ${name} = ₱${actual.toFixed(2)}`);
    }
    return passed;
  };

  // Test 1: Milo roll — ₱105.60 ÷ 12 = ₱8.80/piece
  const miloItem: Item = {
    id: 'test-milo', name: 'Milo', category: 'Test', purchaseType: 'package-roll',
    piecesPerPack: 12,
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 105.60, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    }
  };
  check('Milo base cost', computeBaseCost(miloItem, 'rcs'), 8.80);

  // Test 2: Hansel biscuit — ₱60.00 ÷ 10 = ₱6.00/piece
  const hanselItem: Item = {
    id: 'test-hansel', name: 'Hansel biscuit', category: 'Test', purchaseType: 'package-roll',
    piecesPerPack: 10,
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 60.00, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    }
  };
  check('Hansel base cost', computeBaseCost(hanselItem, 'rcs'), 6.00);

  // Test 3: Kopiko Blanca — ₱12.40 + ₱4.60 = ₱17.00
  const kopikoItem: Item = {
    id: 'test-kopiko', name: 'Kopiko blanca TP', category: 'Test', purchaseType: 'piece',
    storePrices: {
      rcs: { perPieceSRP: 12.40, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 17.00 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    },
    markupOverride: 4.60,
  };
  check('Kopiko computed price', computeSellingPrice(kopikoItem, 'rcs', 4.50), 17.00);
  check('Kopiko sticker price', getFinalStickerPrice(kopikoItem, 'rcs', 4.50), 17.00);

  // Test 4: Twinpack Original financial split (Section 9.2)
  // Base cost ₱12.60, sticker ₱17.00, markup ₱4.40 per piece
  const twinpackItem: Item = {
    id: 'test-twinpack', name: 'Twinpack Original', category: 'Test', purchaseType: 'piece',
    storePrices: {
      rcs: { perPieceSRP: 12.60, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 17.00 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    },
    markupOverride: 4.40,
  };
  const twinpackFin = computeTransactionFinancials(twinpackItem, 'rcs', 4.50, 4, 'piece');
  check('Twinpack revenue (4×₱17)', twinpackFin.totalRevenue, 68.00);
  check('Twinpack capital (4×₱12.60)', twinpackFin.capitalRecovered, 50.40);
  check('Twinpack markup (4×₱4.40)', twinpackFin.markupProfit, 17.60);
  check('Twinpack check (50.40+17.60)', twinpackFin.capitalRecovered + twinpackFin.markupProfit, 68.00);

  // Test 5: Salt — manual price ₱8.00, NO markup
  const saltItem: Item = {
    id: 'test-salt', name: 'Salt', category: 'Test', purchaseType: 'manual-bulk-repack',
    customUnitName: 'half bag',
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 8.00, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    }
  };
  check('Salt manual price', computeSellingPrice(saltItem, 'palengke', 4.50), 8.00);
  check('Salt markup is 0', computeEffectiveMarkup(saltItem, 4.50), 0);

  // Test 6: Mr. Yema — bulk pricing, no markup
  const yemaItem: Item = {
    id: 'test-yema', name: 'Mr. Yema', category: 'Test', purchaseType: 'candy',
    piecesPerBulkPack: 24, sellBundleSize: 3,
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 23.50, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 23.50, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 23.50, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    }
  };
  check('Mr. Yema base cost/pc', computeBaseCost(yemaItem, 'rcs'), 23.50 / 24);
  check('Mr. Yema bundle price', computeSellingPrice(yemaItem, 'rcs', 4.50), 5.00);
  check('Mr. Yema markup is 0', computeEffectiveMarkup(yemaItem, 4.50), 0);

  // Test 7: Tahoos — bulk pricing, no markup
  const tahoosItem: Item = {
    id: 'test-tahoos', name: 'Tahoos', category: 'Test', purchaseType: 'cheap-packed-snack',
    piecesPerBulkPack: 12, sellBundleSize: 2,
    storePrices: {
      rcs: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 18.20, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      massway: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 18.20, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      nesabel: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 18.20, sellBundlePrice: 5.00, finalStickerPrice: 0 },
      palengke: { perPieceSRP: 0, totalPackPrice: 0, manualUnitPrice: 0, bulkPackCost: 0, sellBundlePrice: 0, finalStickerPrice: 0 },
    }
  };
  check('Tahoos base cost/pc', computeBaseCost(tahoosItem, 'rcs'), 18.20 / 12);
  check('Tahoos bundle price', computeSellingPrice(tahoosItem, 'rcs', 4.50), 5.00);

  if (allPassed) {
    console.log('\n✅ All worked examples verified successfully!');
  } else {
    console.error('\n❌ Some worked examples FAILED — check calculation engine!');
  }
  return allPassed;
}

// Run verification in development
if (import.meta.env.DEV) {
  verifyWorkedExamples();
}
