# iOS Double-Click Fix for Product Cards

## Problem
Product cards required double-clicking on iOS devices to navigate to product detail pages, while working correctly with single clicks on laptops and Android devices.

## Root Cause
The issue was caused by CSS hover states that iOS handles differently:
1. **First tap** - iOS activates the hover state (`:hover` pseudo-class)
2. **Second tap** - iOS triggers the actual click event

This happens because iOS needs to determine whether a tap should activate hover effects or navigate immediately.

## Solution Applied

### 1. CSS Media Query for Touch Devices
Added `@media (hover: none) and (pointer: coarse)` to completely disable hover effects on touch-capable devices:
```css
@media (hover: none) and (pointer: coarse) {
  /* Completely disable hover states on touch devices */
  .card-product:hover .img-product {
    opacity: 1 !important;
  }
  .card-product:hover .img-hover {
    opacity: 0 !important;
    transform: none !important;
  }
  /* Ensure links are immediately clickable */
  .card-product .product-img,
  .card-product-info .title.link {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}
```

### 2. Removed Touch Event Handlers
Removed `onTouchStart` and `onTouchEnd` event handlers from the product card wrapper that were interfering with navigation.

### 3. Simplified Link Click Handlers
Removed `e.stopPropagation()` and redundant inline styles from Link components to allow natural touch behavior.

## Files Modified
1. `app/globals.css` - Added touch device media query
2. `components/productCards/ProductCard1.jsx` - Removed interfering touch handlers and simplified links

## Expected Behavior
- **iOS devices**: Single tap now navigates directly to product detail page
- **Android devices**: Continues to work with single tap (no change)
- **Desktop/Laptop**: Hover effects still work normally with mouse

## Testing Notes
The `@media (hover: none) and (pointer: coarse)` query specifically targets:
- iOS devices (iPhone, iPad)
- Android touch devices
- Any device with only touch input (no mouse/trackpad)

Desktop devices with mouse/trackpad continue to show hover effects as intended.
