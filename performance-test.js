/**
 * Hero Video Performance Testing Script
 * Tests video loading performance across different devices and connections
 */

class VideoPerformanceTester {
  constructor() {
    this.results = [];
    this.testStartTime = null;
    this.videoElement = null;
  }

  // Simulate different connection speeds
  getConnectionProfiles() {
    return {
      'fast-3g': { downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 562.5 },
      '4g': { downloadThroughput: 4 * 1024 * 1024 / 8, uploadThroughput: 3 * 1024 * 1024 / 8, latency: 20 },
      'wifi': { downloadThroughput: 30 * 1024 * 1024 / 8, uploadThroughput: 15 * 1024 * 1024 / 8, latency: 2 }
    };
  }

  // Test video loading performance
  async testVideoLoading(videoSrc, connectionType = 'wifi') {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const video = document.createElement('video');
      
      const metrics = {
        connectionType,
        videoSrc,
        fileSize: null,
        loadStartTime: null,
        firstFrameTime: null,
        canPlayTime: null,
        fullyLoadedTime: null,
        errors: []
      };

      // Track loading events
      video.addEventListener('loadstart', () => {
        metrics.loadStartTime = performance.now() - startTime;
      });

      video.addEventListener('loadedmetadata', () => {
        metrics.firstFrameTime = performance.now() - startTime;
      });

      video.addEventListener('canplay', () => {
        metrics.canPlayTime = performance.now() - startTime;
      });

      video.addEventListener('canplaythrough', () => {
        metrics.fullyLoadedTime = performance.now() - startTime;
        resolve(metrics);
      });

      video.addEventListener('error', (e) => {
        metrics.errors.push({
          type: 'video_error',
          message: e.target.error?.message || 'Unknown video error',
          code: e.target.error?.code
        });
        resolve(metrics);
      });

      // Set video properties for testing
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = videoSrc;
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!metrics.fullyLoadedTime) {
          metrics.errors.push({ type: 'timeout', message: 'Video loading timed out after 30s' });
          resolve(metrics);
        }
      }, 30000);
    });
  }

  // Test current hero videos
  async testHeroVideos() {
    console.log('🚀 Starting Hero Video Performance Tests...');
    
    const videoSources = [
      '/images/video/ta.mp4', // Current video
      // Add more video sources from your slides if any
    ];

    const connectionTypes = ['wifi', '4g', 'fast-3g'];
    
    for (const videoSrc of videoSources) {
      console.log(`\n📹 Testing video: ${videoSrc}`);
      
      for (const connectionType of connectionTypes) {
        console.log(`  📡 Connection: ${connectionType}`);
        
        try {
          const result = await this.testVideoLoading(videoSrc, connectionType);
          this.results.push(result);
          
          console.log(`    ⏱️  Load Start: ${result.loadStartTime?.toFixed(2) || 'N/A'}ms`);
          console.log(`    🎬 First Frame: ${result.firstFrameTime?.toFixed(2) || 'N/A'}ms`);
          console.log(`    ▶️  Can Play: ${result.canPlayTime?.toFixed(2) || 'N/A'}ms`);
          console.log(`    ✅ Fully Loaded: ${result.fullyLoadedTime?.toFixed(2) || 'N/A'}ms`);
          
          if (result.errors.length > 0) {
            console.log(`    ❌ Errors:`, result.errors);
          }
        } catch (error) {
          console.error(`    ❌ Test failed:`, error);
        }
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Analyze results and provide recommendations
  analyzeResults() {
    console.log('\n📊 Performance Analysis Results:');
    console.log('=' .repeat(50));
    
    const recommendations = [];
    
    this.results.forEach(result => {
      const { connectionType, canPlayTime, fullyLoadedTime, errors } = result;
      
      console.log(`\n📱 ${connectionType.toUpperCase()} Connection:`);
      
      if (errors.length > 0) {
        console.log(`  ❌ Errors detected: ${errors.length}`);
        recommendations.push(`Fix video loading errors for ${connectionType}`);
      }
      
      if (canPlayTime > 3000) {
        console.log(`  ⚠️  Slow initial playback: ${canPlayTime.toFixed(2)}ms`);
        recommendations.push(`Optimize video for faster initial playback on ${connectionType}`);
      } else if (canPlayTime > 0) {
        console.log(`  ✅ Good initial playback: ${canPlayTime.toFixed(2)}ms`);
      }
      
      if (fullyLoadedTime > 10000) {
        console.log(`  ⚠️  Slow full loading: ${fullyLoadedTime.toFixed(2)}ms`);
        recommendations.push(`Consider video compression for ${connectionType}`);
      } else if (fullyLoadedTime > 0) {
        console.log(`  ✅ Good full loading: ${fullyLoadedTime.toFixed(2)}ms`);
      }
    });
    
    console.log('\n🎯 Recommendations:');
    console.log('=' .repeat(30));
    
    if (recommendations.length === 0) {
      console.log('✅ Video performance looks good across all tested scenarios!');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // Additional general recommendations
    console.log('\n💡 General Optimization Tips:');
    console.log('- Keep video files under 5MB for hero videos');
    console.log('- Use H.264 codec with MP4 container for best compatibility');
    console.log('- Provide poster images for immediate visual feedback');
    console.log('- Consider lazy loading for non-active slides');
    console.log('- Test on actual mobile devices and slow connections');
  }

  // Get file size information
  async getVideoFileInfo(videoSrc) {
    try {
      const response = await fetch(videoSrc, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return {
        size: contentLength ? parseInt(contentLength) : null,
        sizeFormatted: contentLength ? this.formatBytes(parseInt(contentLength)) : 'Unknown'
      };
    } catch (error) {
      return { size: null, sizeFormatted: 'Unknown' };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Run complete test suite
  async runTests() {
    console.log('🎬 Hero Video Performance Testing Suite');
    console.log('=====================================');
    
    // Get video file information
    console.log('\n📁 Video File Information:');
    const videoInfo = await this.getVideoFileInfo('/images/video/ta.mp4');
    console.log(`Current video size: ${videoInfo.sizeFormatted}`);
    
    if (videoInfo.size > 5 * 1024 * 1024) {
      console.log('⚠️  Warning: Video file is larger than 5MB, consider compression');
    }
    
    // Run loading tests
    await this.testHeroVideos();
    
    // Analyze and provide recommendations
    this.analyzeResults();
    
    return this.results;
  }
}

// Export for use in browser console or as module
if (typeof window !== 'undefined') {
  window.VideoPerformanceTester = VideoPerformanceTester;
  
  // Auto-run tests when script is loaded
  window.runVideoPerformanceTests = async () => {
    const tester = new VideoPerformanceTester();
    return await tester.runTests();
  };
  
  console.log('📋 Video Performance Tester loaded!');
  console.log('Run: runVideoPerformanceTests() to start testing');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoPerformanceTester;
}