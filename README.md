# Sari-Sari Store System

A single-page web application for grocery budget planning and sari-sari store sales/income tracking. Built with React + TypeScript + Vite + Tailwind CSS + Firebase Firestore.

## Features

### Grocery Budget Planner
- **Three-store comparison**: RCS Supermarket, Massway, Nesabel — each with independent price sheets
- **Public Market (Palengke)**: Separate section for wet market items (Salt, Onion, Ginger, Garlic, Kamatis, Egg)
- **Real-time budget tracking**: Running total, remaining budget, percentage used, visual progress bar
- **Pie chart breakdown**: By item and by category (Chart.js)
- **Piece vs Package purchase sections**: Separate subtotals for piece-based and package-based purchases
- **Two calculator modes**: Manual arithmetic calculator + tap-to-add auto calculator
- **Cart management**: Add, remove, update quantities, clear cart

### Item Classification System
- **Five purchase types**: Piece, Package-Roll, Manual Bulk-Repack, Candy, Cheap Packed Snack
- **Pre-classified seed items**: Fita, Hansel biscuit, Hansel with filling, Bravo, Dew berry, Milo, Recheese, Re-chee, Rechoco, Mang Juan items (Piece), Salt (Manual Bulk-Repack), Mr. Yema, Tahoos, Nimbles, Nips, Mentos, Mr. Keso, Lips, Bangus (snack)
- **Classification checklist**: Admin tool to review and set purchase types for all items
- **Visual flags**: Unclassified items highlighted with warning indicators

### Sari-Sari Store Pricing Logic
- **Global Markup**: Editable default (₱4.50), applies to Piece and Package-Roll items only
- **Per-item markup overrides**: Individual items can have custom markup amounts
- **Manual Final Sticker Price override**: Round computed prices for real-world convenience
- **No markup on**: Manual Bulk-Repack, Candy, Cheap Packed Snack (fully manual pricing)
- **Financial split**: Every sale separates Capital Recovered from Markup Profit

### Sales & Income Tracking
- **Transaction recording**: Per-item, per-quantity with auto-computed financials
- **Daily view**: Transactions list with Capital Recovered and Markup Profit totals
- **Weekly view**: Aggregated week summary with daily breakdown
- **Monthly report**: Full financial breakdown — Gross Income, Net Income (Growth Fund), Electricity/Transportation deductions, per-item breakdown
- **Expense logging**: Electricity (monthly) and Transportation (bi-monthly) only

### Access Control (Two-Tier)
- **Tier 1 — Google Sign-In**: Owner authentication, persists indefinitely per device
- **Tier 2 — 4-Character PIN**: Manager/staff lock, required on every fresh app open, stored in Firestore
- **First-run PIN setup**: Owner creates PIN on first use
- **In-app PIN change**: Change PIN from settings without code modification

### Admin Panel
- Add/edit/delete items
- Edit prices per store (3 supermarkets + Palengke)
- Edit purchase type classifications
- Edit Global Markup and per-item markup overrides
- Edit Final Sticker Price overrides
- Edit type-specific fields (pieces per pack, bulk costs, bundle sizes, etc.)

## Technology Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Zustand (state management)
- Firebase Firestore (data persistence)
- Firebase Authentication (Google Sign-In)
- Chart.js (pie charts)
- LocalStorage (offline cache)

## Project Structure

```
src/
  types/           # TypeScript type definitions
  lib/
    firebase.ts    # Firebase config (placeholder — needs your values)
    seedData.ts    # ~108 seed items from uploaded documents
    calculations.ts # Core pricing/markup/financial math engine
  store/
    appStore.ts    # Zustand global state
  hooks/
    useFirestore.ts # Firestore CRUD + offline cache
  sections/        # All page views
    AuthScreen.tsx
    PinScreen.tsx
    HomeScreen.tsx
    GroceryPlanner.tsx
    PalengkeView.tsx
    SariSariSales.tsx
    DailyView.tsx
    WeeklyView.tsx
    MonthlyView.tsx
    AdminPanel.tsx
    ClassificationChecklist.tsx
    ExpenseLogger.tsx
  App.tsx          # Main router
```

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase** (optional for local demo):
   Open `src/lib/firebase.ts` and replace the placeholder config with your Firebase project credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```
   
   For demo mode without Firebase, the app runs entirely in localStorage.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```
   Output will be in `dist/` — deploy this folder to GitHub Pages or any static host.

## Firestore Data Structure

```
users/{userId}/
  items/           # All items (supermarket + palengke)
  sales/           # Individual sale transactions
  expenses/        # Electricity and transportation expenses
  settings/
    global-settings  # Global markup value
    pin-settings     # PIN hash
```

## Security Notes

- **Phase 1 (current)**: Firestore runs in open/test mode. Do NOT deploy publicly with real data.
- **Phase 2 (future)**: Add Firestore Security Rules to restrict data access to the authenticated owner only.
- The PIN is stored hashed (base64 with salt) in Firestore — NOT in source code.

## Verified Worked Examples

All spec worked examples are verified in `src/lib/calculations.ts`:

| Example | Expected | Status |
|---------|----------|--------|
| Milo: ₱105.60 ÷ 12 | ₱8.80/piece | ✅ |
| Hansel: ₱60.00 ÷ 10 | ₱6.00/piece | ✅ |
| Kopiko Blanca: ₱12.40 + ₱4.60 | ₱17.00 | ✅ |
| Twinpack (4×): Capital ₱50.40 + Markup ₱17.60 | ₱68.00 total | ✅ |
| Salt manual price | ₱8.00 (no markup) | ✅ |
| Mr. Yema bundle: 3pcs/₱5.00 | No markup applied | ✅ |
| Tahoos bundle: 2pcs/₱5.00 | No markup applied | ✅ |
