# SpendNest

A simple family expense manager for recording spending, watching monthly budgets, and remembering upcoming bills.

V1 is **not** a banking app. The loop is: **Add → Store → Calculate → Display → Remind**.

## Run on your Android phone

1. Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) on the phone.
2. In this folder:

```bash
npm start
```

3. Scan the QR code with Expo Go (or the camera app).

The app works immediately in **on-device mode**. Accounts, expenses, budgets, and bills are stored on the phone. No Supabase project is required to try the product.

### First-run path

1. Register with your name, email, and password.
2. Tap **+** and add an expense (amount + category is enough).
3. Open **Home** to see monthly totals.
4. Optional: **More → Load sample data** to explore a filled dashboard.

## What is in this build

| Tab | What it does |
| --- | --- |
| Home | Monthly spending, income / expenses / savings, category breakdown, upcoming bills, insights |
| Expenses | History grouped by day, search, category filter, edit / delete |
| + | Add expense in a few taps |
| Budget | Total and category budgets, progress bars, 100% warnings |
| More | Income, categories, recurring bills, sample data, logout |

Default categories match the spec (Groceries, Rent, Electricity, Water, Medical, Mobile, Internet, Fuel, Food, Shopping, Education, Child, Transport, EMI, Entertainment, Other). Custom categories can be added later from **More → Categories**.

## Architecture

```
Screen  →  Service  →  Supabase or local store
```

UI screens do not query the database directly. Services live in `services/`. Pure calculations live in `utils/` and are unit-tested.

If `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, the same services talk to Supabase. If they are not set, the app uses AsyncStorage on the device.

## Connect Supabase later

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env` and paste the project URL and anon key.
4. Restart Expo.

Email auth, row-level security, and the `users` / `categories` / `expenses` / `budgets` / `recurring_expenses` / `family_members` tables are already defined.

Google login, notifications, export, receipt scanning, and AI insights are intentionally out of V1.

## Tests

```bash
npm test
```

These cover `calculateMonthlyTotal`, `calculateRemainingBudget`, `calculateCategoryPercentage`, `calculateSavings`, budget warnings, category grouping, and insight copy.

## Next modules

After this foundation is running on your phone:

- V1.1: family members, payment methods as a table, notifications, richer filters, export
- V2: receipt scanner, AI insights, cloud backup / multi-device (once Supabase is on), reports
