/**
 * Seed Data — Item Lists from Uploaded Documents
 * 
 * Sources:
 * - "Items to be purchased(supermarket-Massway-RCS).pdf" (~100 items)
 * - "Items to be purchased (public market-palengke).pdf" (6 items)
 * - Section 4.2 of spec (pre-classified items + new Candy/Cheap Packed Snack items)
 * 
 * Rules:
 * - All price fields initialized to 0 (blank/editable per spec Section 1)
 * - Item names preserved EXACTLY as written in source documents
 * - Pre-classified per Section 4.2; all others start as "unclassified"
 * - Candy and Cheap Packed Snack items added per explicit spec instruction
 */

import type { Item, StorePrice } from '@/types';

const emptyStorePrice = (): StorePrice => ({
  perPieceSRP: 0,
  totalPackPrice: 0,
  manualUnitPrice: 0,
  bulkPackCost: 0,
  sellBundlePrice: 0,
  finalStickerPrice: 0,
});

const emptyStorePrices = () => ({
  rcs: emptyStorePrice(),
  massway: emptyStorePrice(),
  nesabel: emptyStorePrice(),
  palengke: emptyStorePrice(),
});

let idCounter = 0;
const uid = () => `item_${String(++idCounter).padStart(4, '0')}`;

// =============================================================================
// CATEGORY: Coffee / Milk / Energy
// =============================================================================
const coffeeItems: Item[] = [
  { id: uid(), name: 'Kopiko blanca TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Kopiko brown TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Kopiko black TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Greatest white TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Greatest Choco TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Nescafe creamy white TP', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Nescafe 25 grams', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Nescafe stick', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Milo', category: 'Coffee / Milk / Energy', purchaseType: 'package-roll', piecesPerPack: 12, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Energen', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Bear brand pack', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Alaska pack', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Birch tree pack', category: 'Coffee / Milk / Energy', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Condiments / Sauces / Seasoning
// =============================================================================
const condimentItems: Item[] = [
  { id: uid(), name: 'Patis pack', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Paminta buo', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Paminta durog', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Paminta pino', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Datu puti soy sauce pack', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Datu puti vinegar pack', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Banana ketchup pack', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Bottled cooking oil', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Vinegar Quattro Kwantos', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Magic sarap', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Vetsin', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Laurel pino', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Laurel buo', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Mama sitas', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ginisa mix', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Crispy fry', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr cube chicken', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr cube beef', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr cube pork', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr cube original', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr sinigang mix small', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Knorr sinigang mix big', category: 'Condiments / Sauces / Seasoning', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Canned Goods
// =============================================================================
const cannedItems: Item[] = [
  { id: uid(), name: 'Youngstown green', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Argentina corned beef', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'CDO meatloaf', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Youngstown red', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tuna flakes & oil', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tuna mechado', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tune afritada', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tuna adobo', category: 'Canned Goods', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Instant Noodles
// =============================================================================
const noodleItems: Item[] = [
  { id: uid(), name: 'Lucky me beef', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Lucky me chicken', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ramen beef', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ramen creamy', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ramen chicken', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ramen seafood', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ramen spicy', category: 'Instant Noodles', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Snacks / Chips
// =============================================================================
const snackItems: Item[] = [
  { id: uid(), name: 'PC original', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'PC green', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'PC red', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'PC orange', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Pillows', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Rinbee', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Loaded', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Potato fries', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Potato chips', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Roller coaster', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Patata', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Mang Juan original', category: 'Snacks / Chips', purchaseType: 'piece', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Mang Juan chicken skin', category: 'Snacks / Chips', purchaseType: 'piece', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Fishda', category: 'Snacks / Chips', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Biscuits / Crackers
// =============================================================================
const biscuitItems: Item[] = [
  { id: uid(), name: 'Re-chee', category: 'Biscuits / Crackers', purchaseType: 'piece', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Rechoco', category: 'Biscuits / Crackers', purchaseType: 'piece', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Recheese', category: 'Biscuits / Crackers', purchaseType: 'piece', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Bread pan', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Clover', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Moby', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Oishi', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Hansel biscuit', category: 'Biscuits / Crackers', purchaseType: 'package-roll', piecesPerPack: 10, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Hansel with filling', category: 'Biscuits / Crackers', purchaseType: 'package-roll', piecesPerPack: 10, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Rebisco', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Dew berry', category: 'Biscuits / Crackers', purchaseType: 'package-roll', piecesPerPack: 10, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Sky flakes', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Magic flakes', category: 'Biscuits / Crackers', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Bravo', category: 'Biscuits / Crackers', purchaseType: 'package-roll', piecesPerPack: 10, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Fita', category: 'Biscuits / Crackers', purchaseType: 'package-roll', piecesPerPack: 10, storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Laundry / Fabric Conditioner
// =============================================================================
const laundryItems: Item[] = [
  { id: uid(), name: 'Downy single', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Downy double', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ariel single', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ariel double', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Calla', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf powder yellow', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf fabcon yellow', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf powder pink', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf fabcon pink', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf powder red', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Surf fabcon red', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tide double', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Tide single', category: 'Laundry / Fabric Conditioner', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Cleaning / Bleach
// =============================================================================
const cleaningItems: Item[] = [
  { id: uid(), name: 'Zonrox colored small', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Zonrox colored big', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Zonrox big', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Zonrox small', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'EC', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Speed bar calamansi', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Speed bar original', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Speed bar yellow', category: 'Cleaning / Bleach', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Shampoo
// =============================================================================
const shampooItems: Item[] = [
  { id: uid(), name: 'Sunsilk', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Palmolive red', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Palmolive pink', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Palmolive green', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Cream silk pink', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Cream silk green', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Cream silk blue', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Keratin black', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Keratin gold', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Head & shoulders', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Dove shampoo', category: 'Shampoo', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Bath Soap
// =============================================================================
const soapItems: Item[] = [
  { id: uid(), name: 'Safeguard soap', category: 'Bath Soap', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Palmolive soap', category: 'Bath Soap', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Silka soap', category: 'Bath Soap', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Candy (new — per Section 4.2)
// =============================================================================
const candyItems: Item[] = [
  { id: uid(), name: 'Nimbles', category: 'Candy', purchaseType: 'candy', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Nips', category: 'Candy', purchaseType: 'candy', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Mentos', category: 'Candy', purchaseType: 'candy', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
  {
    id: uid(), name: 'Mr. Yema', category: 'Candy', purchaseType: 'candy',
    piecesPerBulkPack: 24, sellBundleSize: 3,
    storePrices: {
      rcs: { ...emptyStorePrice(), bulkPackCost: 23.50, sellBundlePrice: 5.00 },
      massway: { ...emptyStorePrice(), bulkPackCost: 23.50, sellBundlePrice: 5.00 },
      nesabel: { ...emptyStorePrice(), bulkPackCost: 23.50, sellBundlePrice: 5.00 },
      palengke: emptyStorePrice(),
    }
  },
  { id: uid(), name: 'Mr. Keso', category: 'Candy', purchaseType: 'candy', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
  { id: uid(), name: 'Lips', category: 'Candy', purchaseType: 'candy', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
];

// =============================================================================
// CATEGORY: Cheap Packed Snack (new — per Section 4.2)
// =============================================================================
const cheapSnackItems: Item[] = [
  {
    id: uid(), name: 'Tahoos', category: 'Cheap Packed Snack', purchaseType: 'cheap-packed-snack',
    piecesPerBulkPack: 12, sellBundleSize: 2,
    storePrices: {
      rcs: { ...emptyStorePrice(), bulkPackCost: 18.20, sellBundlePrice: 5.00 },
      massway: { ...emptyStorePrice(), bulkPackCost: 18.20, sellBundlePrice: 5.00 },
      nesabel: { ...emptyStorePrice(), bulkPackCost: 18.20, sellBundlePrice: 5.00 },
      palengke: emptyStorePrice(),
    }
  },
  { id: uid(), name: 'Bangus (snack)', category: 'Cheap Packed Snack', purchaseType: 'cheap-packed-snack', piecesPerBulkPack: 0, sellBundleSize: 0, storePrices: emptyStorePrices() },
];

// =============================================================================
// PALENGKE ITEMS (separate list — Section 1.2)
// =============================================================================
const palengkeItems: Item[] = [
  {
    id: uid(), name: 'Salt', category: 'Palengke', purchaseType: 'manual-bulk-repack',
    customUnitName: 'half bag',
    storePrices: {
      rcs: emptyStorePrice(),
      massway: emptyStorePrice(),
      nesabel: emptyStorePrice(),
      palengke: { ...emptyStorePrice(), manualUnitPrice: 8.00 },
    }
  },
  { id: uid(), name: 'Onion', category: 'Palengke', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Ginger', category: 'Palengke', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Garlic', category: 'Palengke', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Kamatis', category: 'Palengke', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
  { id: uid(), name: 'Egg', category: 'Palengke', purchaseType: 'unclassified', storePrices: emptyStorePrices() },
];

// =============================================================================
// EXPORT ALL SEED DATA
// =============================================================================

/** All supermarket items (for the 3 stores: RCS, Massway, Nesabel) */
export const supermarketSeedItems: Item[] = [
  ...coffeeItems,
  ...condimentItems,
  ...cannedItems,
  ...noodleItems,
  ...snackItems,
  ...biscuitItems,
  ...laundryItems,
  ...cleaningItems,
  ...shampooItems,
  ...soapItems,
  ...candyItems,
  ...cheapSnackItems,
];

/** Palengke items (separate list) */
export const palengkeSeedItems: Item[] = palengkeItems;

/** All items combined (for initialization) */
export const allSeedItems: Item[] = [...supermarketSeedItems, ...palengkeSeedItems];

/** Store definitions */
export const STORES = [
  { id: 'rcs' as const, name: 'RCS Supermarket' },
  { id: 'massway' as const, name: 'Massway' },
  { id: 'nesabel' as const, name: 'Nesabel' },
] as const;
