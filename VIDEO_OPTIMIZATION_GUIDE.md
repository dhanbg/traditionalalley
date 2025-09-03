# Video Optimization Guide for Hero Component

This guide provides comprehensive recommendations for optimizing video performance in the Hero component to ensure fast loading times and smooth playback.

## Recent Performance Improvements

The Hero component has been enhanced with the following optimizations:

### ✅ Implemented Features
- **Lazy Loading**: Videos only load when they become the active slide
- **Smart Preloading**: Only active slide uses `preload="auto"`, others use `preload="none"`
- **Progressive Loading**: Next and previous slides are preloaded after a 1-second delay
- **Loading States**: Visual feedback with skeleton UI and loading indicators
- **Error Handling**: Graceful fallback to poster images when videos fail to load
- **Memory Management**: Proper cleanup of video promises and event listeners

## Video Format Optimization

### Recommended Video Specifications

#### For Desktop (1920x1080)
```
Resolution: 1920x1080 (Full HD)
Bitrate: 2-4 Mbps for standard quality, 4-8 Mbps for high quality
Frame Rate: 30fps (24fps for cinematic content)
Codec: H.264 (MP4) primary, WebM (VP9) fallback
Duration: 5-15 seconds for hero videos
```

#### For Mobile (720p)
```
Resolution: 1280x720 (HD)
Bitrate: 1-2 Mbps
Frame Rate: 30fps
Codec: H.264 (MP4)
Duration: 5-10 seconds
```

### File Size Guidelines
- **Desktop videos**: 2-8 MB maximum
- **Mobile videos**: 1-3 MB maximum
- **Poster images**: 100-300 KB (WebP format preferred)

## Video Compression Tools

### FFmpeg Commands

#### High-Quality Compression (Desktop)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

#### Mobile-Optimized Compression
```bash
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -preset medium -crf 28 -c:a aac -b:a 96k -movflags +faststart output_mobile.mp4
```

#### WebM Format (Fallback)
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 2M -c:a libopus -b:a 128k output.webm
```

### Online Tools
- **HandBrake**: Free, cross-platform video transcoder
- **Cloudinary**: Automatic video optimization and delivery
- **TinyPNG**: Also supports video compression
- **Adobe Media Encoder**: Professional video encoding

## Content Management System Setup

### Strapi Configuration

1. **Upload Limits**: Increase file upload limits in Strapi config
```javascript
// config/middlewares.js
export default [
  {
    name: 'strapi::body',
    config: {
      formLimit: '256mb',
      jsonLimit: '256mb',
      textLimit: '256mb',
      formidable: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
      },
    },
  },
];
```

2. **Media Fields**: Ensure both `media` and `mobileMedia` fields are configured
3. **Poster Images**: Always upload optimized poster images for better perceived performance

### File Organization
```
public/videos/
├── hero/
│   ├── desktop/
│   │   ├── slide1.mp4
│   │   ├── slide1.webm
│   │   └── slide1_poster.webp
│   └── mobile/
│       ├── slide1_mobile.mp4
│       └── slide1_mobile_poster.webp
```

## Performance Best Practices

### 1. Video Preparation
- **Optimize before upload**: Always compress videos before uploading to CMS
- **Multiple formats**: Provide both MP4 and WebM formats for better browser support
- **Poster images**: Create high-quality poster images that represent the video content
- **Mobile versions**: Create separate, smaller versions for mobile devices

### 2. Content Strategy
- **Keep it short**: Hero videos should be 5-15 seconds maximum
- **Loop-friendly**: Ensure videos loop seamlessly
- **Silent by default**: Videos autoplay muted, design accordingly
- **Meaningful content**: First frame should be visually appealing (used as poster)

### 3. Technical Considerations
- **CDN delivery**: Use a CDN for video delivery (Cloudinary, AWS CloudFront)
- **Adaptive streaming**: Consider HLS or DASH for larger videos
- **Preload strategy**: Current implementation optimizes preloading automatically
- **Fallback images**: Always provide high-quality fallback images

## Monitoring and Testing

### Performance Metrics to Track
- **Time to First Byte (TTFB)**: Video loading start time
- **Time to First Frame**: When first video frame appears
- **Core Web Vitals**: LCP, FID, CLS scores
- **Network usage**: Monitor data consumption on mobile

### Testing Checklist
- [ ] Test on slow 3G connections
- [ ] Verify autoplay works across browsers
- [ ] Check fallback image quality
- [ ] Test video loading on mobile devices
- [ ] Verify smooth transitions between slides
- [ ] Test with network throttling

## Browser Support

### Video Format Support
| Browser | MP4 (H.264) | WebM (VP9) | Autoplay |
|---------|-------------|------------|----------|
| Chrome  | ✅ | ✅ | ✅ (muted) |
| Firefox | ✅ | ✅ | ✅ (muted) |
| Safari  | ✅ | ❌ | ✅ (muted) |
| Edge    | ✅ | ✅ | ✅ (muted) |
| Mobile  | ✅ | Varies | ✅ (muted) |

### Autoplay Policies
- All modern browsers require videos to be muted for autoplay
- Some mobile browsers may still block autoplay
- Always provide poster images as fallback

## Troubleshooting Common Issues

### Video Not Loading
1. Check file format compatibility
2. Verify file size limits
3. Test network connectivity
4. Check browser console for errors

### Slow Loading
1. Reduce video file size
2. Optimize video compression settings
3. Use CDN for video delivery
4. Check server response times

### Autoplay Issues
1. Ensure videos are muted
2. Check browser autoplay policies
3. Verify video format support
4. Test on different devices/browsers

## Future Enhancements

### Potential Improvements
- **Adaptive bitrate streaming**: Automatically adjust quality based on connection
- **WebP poster images**: Better compression for poster images
- **Intersection Observer**: Load videos only when component is in viewport
- **Service Worker caching**: Cache frequently viewed videos
- **Analytics integration**: Track video performance metrics

---

*Last updated: January 2025*
*For technical support, refer to the development team or create an issue in the project repository.*