# Debugging Instagram Videos - Poster Images Issue

## Current Status

✅ **What's Working:**
- Play buttons showing correctly
- Video structure is correct
- iOS tap-to-play functionality is ready

❌ **Issue:**
- Poster images showing as black backgrounds instead of thumbnails

## Debug Steps

### 1. **Open Browser Console** on your iOS device or laptop:

**On iOS Safari:**
1. Connect iPhone to Mac
2. On Mac: Safari → Develop → [Your iPhone] → [Your Page]
3. Or use Safari Web Inspector

**On Chrome (Laptop/Android):**
1. Press `F12` or Right-click → Inspect
2. Go to "Console" tab

### 2. **Refresh the page** and look for these logs:

You should see output like:
```
Item 0: {
  isVideo: true,
  mediaUrl: "https://your-api.com/uploads/video.mp4",
  posterSrc: "https://your-api.com/uploads/thumbnail_video.jpg",
  hasThumb: true,
  hasSmall: false,
  mime: "video/mp4"
}

Video Player: {
  src: "https://your-api.com/uploads/video.mp4",
  poster: "https://your-api.com/uploads/thumbnail_video.jpg",
  alt: "Instagram video"
}
```

### 3. **Check For Errors:**

Look for these messages:
- ❌ `Poster image failed to load: [URL]` - Means poster URL is wrong
- ❌ `Video error:` - Means video URL is wrong
- ❌ `404` or `403` errors - Means files don't exist or aren't accessible

### 4. **Test Poster URLs:**

Copy a `posterSrc` URL from the console and:
1. Paste it directly in your browser address bar
2. If it loads → Good! If not → URL is wrong

## Common Issues & Fixes

### Issue 1: No Thumbnail in Strapi

**Symptom:** `hasThumb: false` in console logs

**Fix:** Make sure your Strapi videos have thumbnail images:
1. Go to Strapi Media Library
2. Upload your video
3. Strapi should auto-generate thumbnails
4. OR manually upload a thumbnail image

### Issue 2: Wrong API URL

**Symptom:** Poster URL looks like `http://localhost:1337/...` but API is elsewhere

**Fix:** Check your `.env` file:
```env
NEXT_PUBLIC_API_URL=https://your-actual-api-url.com
```

### Issue 3: CORS Issues

**Symptom:** Browser console shows CORS errors

**Fix:** In Strapi, update `config/middlewares.js`:
```javascript
{
  name: 'strapi::cors',
  config: {
    origin: ['https://your-frontend-url.com']
  }
}
```

### Issue 4: Videos ARE Posters

**Symptom:** `posterSrc === mediaUrl` (both are the same video file)

**This means:** No separate thumbnail exists, so video file is used as poster

**Result:** Black screen until video metadata loads

**Fix:** 
1. Generate proper thumbnail images in Strapi
2. OR use a placeholder image as fallback

## Quick Fixes

### Option 1: Use Placeholder Image (Temporary)

Update line ~302 in `InstagramVideoCards.jsx`:

```javascript
// Get poster - use thumbnail if available, otherwise PLACEHOLDER
let posterSrc = '/images/default-video-poster.jpg'; // ← Default image
if (item.media?.formats?.thumbnail?.url) {
  const thumbUrl = item.media.formats.thumbnail.url;
  posterSrc = thumbUrl.startsWith('http')
    ? thumbUrl
    : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${thumbUrl}`;
}
```

Then add a default poster image to `/public/images/default-video-poster.jpg`

### Option 2: Generate Thumbnails in Strapi

1. Install `ffmpeg` on your Strapi server
2. Strapi will auto-generate video thumbnails
3. Re-upload your videos

### Option 3: Use Video First Frame (Browser will handle)

If poster URL is wrong, video's `poster` attribute will show first frame automatically once metadata loads.

## Checklist

Run through this:

- [ ] Console logs appear when page loads
- [ ] Check `mediaUrl` - does it look correct?
- [ ] Check `posterSrc` - does it look correct?
- [ ] Click/test `posterSrc` URL in browser - does it load?
- [ ] Check if `hasThumb: true` or `false`
- [ ] Look for any red error messages in console
- [ ] Try tapping a play button - does video play?

## Expected Behavior After Fix

Once poster URLs are correct:
1. Page loads
2. Thumbnails appear immediately (not black)
3. Play buttons visible on thumbnails
4. Tap play → video plays
5. No console errors

## Share With Me

Take a screenshot of your browser console showing:
1. The `Item 0: {...}` logs
2. The `Video Player: {...}` logs
3. Any error messages (in red)

This will tell me exactly what's wrong!
