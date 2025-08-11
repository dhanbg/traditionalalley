# Media Slider Implementation Guide

This guide explains how to use images, videos, and audio files in the home slider component of the Traditional Alley website.

## Overview

The Hero component has been enhanced to support multiple media types including images, videos, and audio files in the slider. The component automatically detects the media type based on MIME type and file extension, then renders the appropriate element with proper styling and functionality.

## Supported Media Types

### Images
- **Formats**: JPG, PNG, WebP, GIF
- **Usage**: Default media type for slider backgrounds
- **Features**: Responsive sizing, lazy loading, optimization

### Videos
- **Formats**: MP4, WebM, MOV, AVI
- **Features**: Auto-play, muted by default, loop, poster support
- **Fallback**: Poster image or fallback image if video fails to load

### Audio
- **Formats**: MP3, WAV, OGG
- **Features**: Manual controls, background image overlay, centered player
- **Display**: Audio controls overlaid on a background image with reduced opacity

## How to Add Media via Strapi CMS

### Backend Setup (Strapi)

1. **Media Field Configuration**:
   ```javascript
   // In your Strapi content type (hero-slides)
   {
     "media": {
       "type": "media",
       "multiple": false,
       "required": true,
       "allowedTypes": ["images", "videos", "audios"]
     },
     "poster": {
       "type": "media",
       "multiple": false,
       "required": false,
       "allowedTypes": ["images"]
     }
   }
   ```

2. **Content Structure**:
   ```javascript
   {
     "id": 1,
     "media": {
       "url": "/uploads/video.mp4",
       "mime": "video/mp4",
       "ext": ".mp4",
       "formats": {
         "large": {
           "url": "/uploads/large_video.mp4"
         }
       }
     },
     "poster": {
       "url": "/uploads/poster.jpg",
       "formats": {
         "large": {
           "url": "/uploads/large_poster.jpg"
         }
       }
     },
     "alt": "Fashion slideshow",
     "subheading": "New Collection",
     "heading": "Summer Fashion<br/>2024",
     "btnText": "Shop Now"
   }
   ```

### Frontend Implementation

The Hero component automatically processes the media field:

```javascript
// Media type detection
const mimeType = media.mime || "";
const fileExt = media.ext || "";

if (mimeType.startsWith("video/") || ['.mp4', '.webm', '.mov', '.avi'].includes(fileExt.toLowerCase())) {
  mediaType = "video";
} else if (mimeType.startsWith("audio/") || ['.mp3', '.wav', '.ogg'].includes(fileExt.toLowerCase())) {
  mediaType = "audio";
} else {
  mediaType = "image";
}
```

## Media Properties

### For All Media Types
- `alt`: Alternative text for accessibility
- `subheading`: Optional subtitle text
- `heading`: Main heading text (supports `<br/>` for line breaks)
- `btnText`: Call-to-action button text
- `poster`: Fallback/poster image (especially important for videos and audio)

### Video-Specific Features
- Auto-play on slide activation
- Muted by default (browser requirement)
- Loops continuously
- Poster image support
- Multiple format support (MP4, WebM)

### Audio-Specific Features
- Manual playback controls
- Background image overlay
- Centered audio player
- Multiple format support (MP3, OGG)
- No auto-play (better UX)

## File Requirements

### Video Files
- **Recommended format**: MP4 (H.264)
- **Alternative format**: WebM
- **Max file size**: 50MB (recommended)
- **Resolution**: 1920x1080 or higher
- **Duration**: 10-30 seconds for optimal UX

### Audio Files
- **Recommended format**: MP3
- **Alternative format**: OGG
- **Max file size**: 10MB (recommended)
- **Quality**: 128-320 kbps
- **Duration**: 30 seconds to 5 minutes

### Images
- **Recommended format**: WebP or JPG
- **Resolution**: 1920x1080 or higher
- **Max file size**: 2MB (recommended)
- **Aspect ratio**: 16:9 for best results

## Key Features

### Auto-Detection
- Automatically detects media type from MIME type and file extension
- Graceful fallback to images if media type cannot be determined

### Video Features
- Auto-play when slide becomes active
- Auto-pause when slide changes
- Muted playback (browser compliance)
- Poster image support
- Responsive sizing

### Audio Features
- Manual controls for user-initiated playback
- Background image with reduced opacity
- Centered audio player
- Responsive design

### Performance
- Lazy loading for images
- Preload metadata for videos and audio
- Optimized file serving
- Multiple format support for better browser compatibility

## Browser Support

### Video Support
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- Mobile browsers: Full support

### Audio Support
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- Mobile browsers: Full support

## File Structure

```
components/homes/
├── Hero.jsx                 # Main hero component with media support
├── heroSlides.js           # Static slide data (if not using CMS)
└── ...

public/scss/component/
├── _slider.scss            # Slider styles including video and audio
└── ...

strapi/
├── api/hero-slides/        # Strapi content type
└── uploads/                # Media files storage
```

## Example Usage

### Adding a Video Slide via CMS
1. Go to Strapi admin panel
2. Navigate to Hero Slides
3. Create new entry
4. Upload video file to `media` field
5. Upload poster image to `poster` field (optional but recommended)
6. Fill in text content
7. Save and publish

### Adding an Audio Slide via CMS
1. Go to Strapi admin panel
2. Navigate to Hero Slides
3. Create new entry
4. Upload audio file to `media` field
5. Upload background image to `poster` field (recommended)
6. Fill in text content
7. Save and publish

### Static Data Example
```javascript
export const slidesWithMedia = [
  {
    mediaType: 'video',
    videoSrc: '/videos/fashion-video.mp4',
    poster: '/images/video-poster.jpg',
    alt: 'Fashion video',
    subheading: 'New Collection',
    heading: 'Summer Fashion 2024',
    btnText: 'Watch Collection'
  },
  {
    mediaType: 'audio',
    audioSrc: '/audio/brand-story.mp3',
    poster: '/images/audio-background.jpg',
    alt: 'Brand story audio',
    subheading: 'Our Story',
    heading: 'Listen to Our Journey',
    btnText: 'Learn More'
  },
  {
    mediaType: 'image',
    imgSrc: '/images/hero-image.jpg',
    alt: 'Fashion collection',
    subheading: 'Featured',
    heading: 'Latest Trends',
    btnText: 'Shop Now'
  }
];
```

## Troubleshooting

### Video Issues
- **Video not playing**: Check if file format is supported (MP4 recommended)
- **No poster image**: Ensure poster field is populated in CMS
- **Poor performance**: Optimize video file size and resolution

### Audio Issues
- **Audio not loading**: Verify file format (MP3 recommended)
- **No background image**: Check poster field in CMS
- **Controls not visible**: Ensure proper CSS styling is applied

### General Issues
- **Media not detected**: Check MIME type and file extension
- **Fallback not working**: Ensure poster or imgSrc is provided
- **Slow loading**: Optimize file sizes and use appropriate formats

## Performance Tips

1. **Optimize file sizes**: Keep videos under 50MB, audio under 10MB
2. **Use appropriate formats**: MP4 for video, MP3 for audio, WebP for images
3. **Provide fallbacks**: Always include poster images
4. **Limit slide count**: Keep total slides under 10 for best performance
5. **Test on mobile**: Ensure good performance on mobile devices

## Accessibility

- Always provide `alt` text for all media
- Include captions for videos when possible
- Provide transcripts for audio content
- Ensure keyboard navigation works with audio controls
- Test with screen readers

This enhanced media slider provides a rich, interactive experience while maintaining performance and accessibility standards.