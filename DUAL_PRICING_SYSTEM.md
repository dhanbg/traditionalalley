# Dual Currency Pricing System (USD/NPR)

This document explains the implementation of the dual currency pricing system that automatically shows prices in USD for global users and NPR (Nepali Rupees) for Nepali users.

## Overview

The system automatically detects user location and displays prices in the appropriate currency:
- **Nepali Users**: Prices shown in NPR with USD conversion for reference
- **Global Users**: Prices shown in USD with option to switch to NPR

## Key Features

### 🌍 Automatic Location Detection
- **Timezone Detection**: Detects `Asia/Kathmandu` timezone for Nepal
- **IP Geolocation**: Uses free IP geolocation service as fallback
- **Browser Language**: Checks for Nepali language preference
- **Manual Override**: Users can manually switch currencies

### 💱 Real-time Exchange Rates
- **Live API**: Uses exchangerate-api.com for current USD to NPR rates
- **Caching**: Exchange rates cached for 1 hour to reduce API calls
- **Fallback Rate**: Uses fallback rate (134.5) if API fails
- **Auto Refresh**: Rates refresh every hour for NPR users

### 🔄 Smart Price Display
- **Primary Currency**: Shows user's preferred currency prominently
- **Conversion Reference**: NPR users see USD equivalent
- **Discount Calculations**: Maintains discount percentages across currencies
- **Responsive Design**: Works on all device sizes

## Implementation

### Files Structure

```
traditionalalley/
├── utils/
│   └── currency.js              # Core currency utilities
├── components/
│   └── common/
│       ├── CurrencySwitcher.jsx # Currency selection component
│       └── PriceDisplay.jsx     # Smart price display component
├── context/
│   └── Context.jsx              # Updated with currency state
└── app/
    └── pricing-demo/
        └── page.jsx             # Demo page
```

### Core Components

#### 1. Currency Utilities (`utils/currency.js`)
- `detectUserCountry()` - Auto-detect user's country
- `getExchangeRate()` - Fetch current USD to NPR rate
- `formatPrice()` - Format prices based on currency
- `getDualPriceDisplay()` - Get price info for both currencies

#### 2. Currency Switcher (`components/common/CurrencySwitcher.jsx`)
- Dropdown to switch between USD and NPR
- Shows current exchange rate for NPR
- Saves user preference to localStorage

#### 3. Price Display (`components/common/PriceDisplay.jsx`)
- Smart component that shows prices in user's currency
- Displays conversion info for NPR users
- Handles old prices and discount calculations

#### 4. Context Integration (`context/Context.jsx`)
- Manages global currency state
- Initializes currency on app load
- Provides currency functions to all components

## Usage

### Basic Price Display

```jsx
import PriceDisplay from '@/components/common/PriceDisplay';

// Simple usage
<PriceDisplay price={29.99} />

// With old price (sale)
<PriceDisplay 
  price={29.99} 
  oldPrice={39.99} 
  size="large"
/>
```

### Currency Switcher

```jsx
import CurrencySwitcher from '@/components/common/CurrencySwitcher';

// In header or anywhere
<CurrencySwitcher className="my-custom-class" />
```

### Using Currency Context

```jsx
import { useContextElement } from '@/context/Context';

function MyComponent() {
  const { 
    userCurrency, 
    userCountry, 
    exchangeRate, 
    setCurrency 
  } = useContextElement();

  return (
    <div>
      <p>Current Currency: {userCurrency}</p>
      <p>Country: {userCountry}</p>
      {exchangeRate && (
        <p>Rate: 1 USD = Rs. {exchangeRate.toFixed(2)}</p>
      )}
    </div>
  );
}
```

## Strapi Backend - No Changes Required

### Existing Schema Works Perfectly

The dual pricing system uses the **existing product schema** without any modifications:

```json
{
  "price": {
    "type": "float",
    "required": true
  },
  "oldPrice": {
    "type": "float"
  }
}
```

### How It Works

- **All prices stored in USD** (base currency)
- **Dynamic conversion** to NPR using live exchange rates
- **No redundant fields** needed in database
- **Clean and simple** - leverages existing data structure

## Configuration

### Environment Variables

No additional environment variables needed. The system uses:
- Free exchange rate API (no key required)
- Free IP geolocation service
- Browser-based detection methods

### Customization

#### Exchange Rate API
To use a different exchange rate service, modify `EXCHANGE_API_URL` in `utils/currency.js`:

```javascript
const EXCHANGE_API_URL = 'https://your-api.com/rates';
```

#### Fallback Rate
Update the fallback rate in `utils/currency.js`:

```javascript
const FALLBACK_USD_TO_NPR_RATE = 134.5; // Your preferred rate
```

#### Supported Currencies
To add more currencies, update the currency utilities and components:

```javascript
const currencies = {
  NP: { code: 'NPR', symbol: 'Rs.', name: 'Nepali Rupee' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  // Add more currencies
};
```

## Testing

### Demo Page
Visit `/pricing-demo` to see the system in action:
- Shows current detection status
- Demonstrates price conversion
- Allows testing currency switching
- Displays sample products with dual pricing

### Manual Testing
1. **Nepal Detection**: Set browser timezone to `Asia/Kathmandu`
2. **Currency Switching**: Use the currency switcher in header
3. **Price Display**: Check prices update correctly
4. **Exchange Rates**: Verify rates are fetched and cached

## Best Practices

### Performance
- Exchange rates are cached for 1 hour
- Only fetch rates when needed (NPR users)
- Use fallback rates to prevent API failures

### User Experience
- Auto-detect but allow manual override
- Show conversion info for transparency
- Maintain consistent discount percentages
- Responsive design for all devices

### Error Handling
- Graceful fallback to USD if detection fails
- Use cached rates if API is unavailable
- Show loading states during currency switches

## Integration with Existing Components

### Product Cards
Updated `ProductCard1.jsx` to use `PriceDisplay`:

```jsx
// Before
<span className="price">
  ${product.price?.toFixed(2)}
</span>

// After
<PriceDisplay 
  price={product.price}
  oldPrice={product.oldPrice}
  size="normal"
/>
```

### Headers
Added `CurrencySwitcher` to `Header1.jsx`:

```jsx
<li className="nav-currency">
  <CurrencySwitcher className="header-currency-switcher" />
</li>
```

## Future Enhancements

### Potential Improvements
1. **More Currencies**: Add support for INR, EUR, etc.
2. **Regional Pricing**: Different base prices per region
3. **Payment Integration**: Currency-specific payment methods
4. **Analytics**: Track currency preferences and conversions
5. **Admin Panel**: Manage exchange rates and pricing rules

### Payment Integration
The system is already compatible with your NPS (Nepal Payment Solution) setup:
- NPR users can pay in NPR through NPS
- USD users can use international payment methods
- Cart totals automatically calculated in user's currency

## Support

For questions or issues with the dual pricing system:
1. Check the demo page at `/pricing-demo`
2. Review browser console for any errors
3. Verify exchange rate API is accessible
4. Test with different timezone settings

## Changelog

### Version 1.0.0
- Initial implementation of dual currency system
- Auto location detection
- Real-time exchange rates
- Currency switcher component
- Price display component
- Context integration
- Demo page
- Documentation 