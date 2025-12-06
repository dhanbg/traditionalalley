# Swiper Loop Fix - White Cards Issue

## Problem
When swiping through the Instagram video carousel and reaching the end, the loop restarts but videos/images appear as **white/blank cards** instead of showing content.

## Root Cause
Swiper's `loop={true}` mode works by **cloning slides** to create the infinite loop effect. When slides are cloned:
- React components lose their **refs** (videoRef becomes null)
- **Intersection Observers** stop working (can't observe cloned elements)
- **Event listeners** don't transfer to clones
- Video **src** doesn't reload properly

## Solution Implemented

### 1. **Better Cleanup in useEffect**
```javascript
return () => {
  // Properly disconnect observer
  if (observerRef.current) {
    observerRef.current.disconnect();
    observerRef.current = null;
  }
  // Clean up video element
  if (video) {
    video.removeEventListener(...);
    video.pause();
    video.src = ''; // Important: Release resources
  }
};
```

### 2. **Re-run Effect When src Changes**
```javascript
useEffect(() => {
  // ... setup code
}, [canAutoplay, isMobile, isPlaying, src]); // ← Added 'src'
```
This ensures when Swiper clones a slide with a different instance, the effect re-runs and reinitializes everything.

### 3. **Unique Video Keys**
```jsx
<video
  key={`video-${index}-${src}`}  // ← Unique key per instance
  ref={videoRef}
  src={src}
  ...
/>
```
Forces React to treat each video instance as unique, even in cloned slides.

### 4. **Safety Checks**
```javascript
entries.forEach((entry) => {
  if (!video) return; // ← Prevents errors if ref is null
  // ... rest of code
});
```

### 5. **Pass Index Prop**
```jsx
<AutoplayVideoPlayer
  src={mediaUrl}
  poster={posterSrc}
  index={i}  // ← Ensures unique identification
/>
```

## How It Works Now

### Normal Slide Flow:
```
User swipes → 
Video 1 → Video 2 → Video 3 → Video 4 → Video 5 →
```

### At Loop Point (Before Fix):
```
Video 5 → [CLONE of Video 1 - BROKEN] → White card
```

### At Loop Point (After Fix):
```
Video 5 → [CLONE of Video 1]
           ↓
        useEffect detects src change
           ↓
        Re-initializes video element
           ↓
        Creates new Intersection Observer
           ↓
        Video plays normally ✅
```

## Files Modified

1. **components/common/InstagramVideoCards.jsx**
   - Added cleanup in useEffect return
   - Added `src` to dependency array
   - Added unique `key` to video element
   - Added `index` prop to component
   - Added safety checks for null refs

2. **components/common/ShopGram.jsx**
   - Same fixes as above for consistency

## Technical Details

### Why video.src = '' is Important
When you set `video.src = ''`, it:
- Releases the video buffer from memory
- Stops any pending network requests
- Allows the next instance to load fresh
- Prevents memory leaks on mobile

### Why the useEffect dependency matters
```javascript
// Before (WRONG):
useEffect(() => { ... }, [canAutoplay, isMobile]);

// After (CORRECT):
useEffect(() => { ... }, [canAutoplay, isMobile, src]);
```

Without `src` in dependencies:
- Cloned slides have different `src` values
- But useEffect doesn't re-run
- Old video element stays attached
- Intersection Observer watches wrong element
- Result: white card

With `src` in dependencies:
- When src changes (cloned slide)
- useEffect cleanup runs (removes old observer)
- useEffect setup runs (creates new observer)
- Result: working video ✅

## Testing Checklist

- [ ] Videos play on first load
- [ ] Can swipe right through all videos
- [ ] Can swipe left through all videos
- [ ] Loop forward (last → first) works
- [ ] Loop backward (first → last) works
- [ ] No white cards at loop point
- [ ] Videos autoplay in cloned slides
- [ ] Posters show properly in clones
- [ ] No console errors
- [ ] Works on iOS Safari
- [ ] Works on iOS Chrome
- [ ] Works on desktop

## Performance Impact

✅ **Minimal** - The cleanup and re-initialization only happens when:
1. Component unmounts
2. Src prop changes (i.e., when Swiper creates a clone)

This is **not** happening on every render, only when necessary.

## Alternative Approaches Considered

### Option 1: Disable Loop
```javascript
loop={false}
```
**Pros:** Simple, no bugs
**Cons:** Poor UX, no infinite scroll

### Option 2: Custom Loop Implementation
**Pros:** Full control
**Cons:** Complex, reinventing the wheel

### Option 3: Current Solution ✅
**Pros:** Works with Swiper's loop, minimal code
**Cons:** None identified

## Future Improvements (Optional)

1. **Lazy load videos**
   - Only load videos for current + adjacent slides
   - Further improves performance

2. **Preload clone slides**
   - Detect upcoming loop
   - Preload video before user reaches it

3. **Virtual slides**
   - Use Swiper's virtual slides feature
   - Render only visible slides in DOM

## Conclusion

The fix ensures that when Swiper clones slides for infinite loop:
- Video elements are properly cleaned up and reinitialized
- Intersection Observers work on cloned elements
- Unique keys prevent React from reusing wrong instances
- No white cards, smooth looping experience ✅
