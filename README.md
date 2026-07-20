# Budget Master — iOS Budgeting App

A React Native (Expo) budgeting app that mirrors the cash-stack UI from the design mockup.

## Features

- **Home screen** — Animated cash stack that visually represents remaining budget
- **Bank notification simulation** — Tap the demo button to trigger a mock bank charge and watch the stack animate
- **Deduction animation** — Bills "fly off" the stack when spending is detected
- **Summary card** — After first transaction, budget transforms into a detailed spent/remaining card
- **Activity screen** — Full transaction history grouped by date
- **Insights screen** — Spending by category with progress bars and budget health metrics
- **Profile screen** — Settings, notifications toggles, bank connection

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator (macOS only), or the **Expo Go** app on your iPhone

### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start

# Then press:
#   i  → open in iOS Simulator
#   Scan the QR code → open in Expo Go on your iPhone
```

## Project Structure

```
BudgetMaster/
├── App.js                          # Root: navigation + providers
├── src/
│   ├── context/
│   │   └── BudgetContext.js        # Global state: budget, transactions, animations
│   ├── components/
│   │   └── CashStack.js            # Animated cash stack visual
│   └── screens/
│       ├── HomeScreen.js           # Main dashboard
│       ├── ActivityScreen.js       # Transaction list
│       ├── InsightsScreen.js       # Spending analytics
│       └── ProfileScreen.js        # Settings & profile
```

## How the Animation Works

1. Tap **"Simulate Bank Notification"** on the Home screen
2. The app "detects" a $25.60 charge from Coffee Corner
3. The cash stack shakes and a bill flies off
4. The budget updates and the new transaction appears in the list
5. After first spend, the header transforms into the blue summary card

## Extending the App

### Add real bank integration
Replace `simulateBankNotification()` in `BudgetContext.js` with a real webhook/push notification handler (e.g. Plaid, MX, or your bank's API).

### Add persistent storage
Install `@react-native-async-storage/async-storage` and persist `transactions` to disk:
```js
import AsyncStorage from '@react-native-async-storage/async-storage';
// Save: await AsyncStorage.setItem('transactions', JSON.stringify(transactions))
// Load: const saved = await AsyncStorage.getItem('transactions')
```

### Add more transaction categories
Edit the `CATEGORY_CONFIG` object in `InsightsScreen.js` and `ActivityScreen.js`.
