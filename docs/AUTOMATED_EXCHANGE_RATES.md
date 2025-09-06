# Automated Exchange Rate Updates

This system provides automated, up-to-date exchange rates for NPR to USD conversion in bill generation.

## How It Works

### 1. Live Exchange Rate API
- **API Source**: `https://api.exchangerate-api.com/v4/latest/USD`
- **Caching**: Rates are cached for 1 hour to reduce API calls
- **Fallback**: If API fails, uses the last known rate or fallback rate
- **Location**: `utils/currency.js`

### 2. Bill Generation Integration
- Bills now use live exchange rates via `getExchangeRate()` function
- Automatically converts NPR amounts to USD using current rates
- Shows the actual exchange rate used in the bill note
- No more hardcoded rates in the code

### 3. Automated Updates (Optional)
- **Script**: `scripts/update-exchange-rates.js`
- **Purpose**: Updates fallback rate periodically
- **Logging**: Tracks all updates in `logs/exchange-rate-updates.log`

## Setup Instructions

### Manual Rate Update
```bash
# Run once to update fallback rate
npm run update-rates
```

### Automated Scheduling

#### Option 1: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 9 AM)
4. Set action: Start a program
5. Program: `node`
6. Arguments: `C:\path\to\traditionalalley\scripts\update-exchange-rates.js`
7. Start in: `C:\path\to\traditionalalley`

#### Option 2: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add line for daily updates at 9 AM
0 9 * * * cd /path/to/traditionalalley && npm run update-rates
```

#### Option 3: GitHub Actions (CI/CD)
```yaml
# .github/workflows/update-rates.yml
name: Update Exchange Rates
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  update-rates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run update-rates
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git diff --staged --quiet || git commit -m "Auto-update exchange rates"
          git push
```

## Benefits

### ✅ Always Current
- Exchange rates update automatically every hour
- No manual intervention needed
- Bills show accurate, real-time conversions

### ✅ Reliable Fallback
- If API is down, uses cached rate
- Fallback rate can be updated via automation
- System never fails due to rate unavailability

### ✅ Transparent
- Bills show the exact exchange rate used
- Conversion notes explain the rate source
- Logs track all rate updates

### ✅ Performance Optimized
- 1-hour caching reduces API calls
- Async loading doesn't block UI
- Minimal impact on bill generation speed

## Monitoring

### Log Files
- **Location**: `logs/exchange-rate-updates.log`
- **Content**: Timestamps, rate changes, errors
- **Rotation**: Manual cleanup recommended

### Rate Change Threshold
- Only updates fallback if rate changes >0.5%
- Prevents unnecessary file modifications
- Logs all rate checks regardless

## Troubleshooting

### API Issues
```bash
# Test API connectivity
curl "https://api.exchangerate-api.com/v4/latest/USD"

# Check current cached rate
node -e "const {getExchangeRate} = require('./utils/currency'); getExchangeRate().then(console.log);"
```

### Script Issues
```bash
# Run with verbose output
node scripts/update-exchange-rates.js

# Check logs
tail -f logs/exchange-rate-updates.log
```

### Bill Generation Issues
- Check browser console for API errors
- Verify `utils/currency.js` is accessible
- Test with manual rate: `getExchangeRate().then(console.log)`

## Configuration

### Change API Provider
Edit `utils/currency.js`:
```javascript
// Replace with different API
const EXCHANGE_API_URL = 'https://api.fixer.io/latest?base=USD&symbols=NPR';

// Update parsing logic in getExchangeRate()
if (data.rates && data.rates.NPR) {
  // Handle different response format
}
```

### Adjust Cache Duration
```javascript
// In utils/currency.js
let exchangeRateCache = {
  rate: FALLBACK_USD_TO_NPR_RATE,
  timestamp: 0,
  ttl: 1800000 // 30 minutes instead of 1 hour
};
```

### Change Update Threshold
```javascript
// In scripts/update-exchange-rates.js
if (percentageChange > 1.0) { // 1% instead of 0.5%
  updateCurrencyFile(newRate);
}
```

## Security Notes

- Exchange rate API is public and doesn't require authentication
- No sensitive data is transmitted or stored
- Rate updates only modify fallback values, not live rates
- All changes are logged for audit purposes