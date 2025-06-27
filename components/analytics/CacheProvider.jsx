'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const [cacheTimestamps, setCacheTimestamps] = useState({});

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const getCacheKey = useCallback((tabId, dateFilter) => {
    // Create a unique cache key based on tab and date filter
    const dateKey = dateFilter ? 
      `${dateFilter.start?.toISOString()}-${dateFilter.end?.toISOString()}-${dateFilter.preset || 'custom'}` : 
      'all';
    return `${tabId}-${dateKey}`;
  }, []);

  const getCachedData = useCallback((tabId, dateFilter) => {
    const key = getCacheKey(tabId, dateFilter);
    const cachedData = cache[key];
    const timestamp = cacheTimestamps[key];

    if (!cachedData || !timestamp) {
      return null;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (now - timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      setCacheTimestamps(prev => {
        const newTimestamps = { ...prev };
        delete newTimestamps[key];
        return newTimestamps;
      });
      return null;
    }

    return cachedData;
  }, [cache, cacheTimestamps, getCacheKey, CACHE_DURATION]);

  const setCachedData = useCallback((tabId, dateFilter, data) => {
    const key = getCacheKey(tabId, dateFilter);
    const timestamp = Date.now();

    setCache(prev => ({
      ...prev,
      [key]: data
    }));

    setCacheTimestamps(prev => ({
      ...prev,
      [key]: timestamp
    }));
  }, [getCacheKey]);

  const clearCache = useCallback((tabId = null) => {
    if (tabId) {
      // Clear cache for specific tab
      setCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(key => {
          if (key.startsWith(`${tabId}-`)) {
            delete newCache[key];
          }
        });
        return newCache;
      });

      setCacheTimestamps(prev => {
        const newTimestamps = { ...prev };
        Object.keys(newTimestamps).forEach(key => {
          if (key.startsWith(`${tabId}-`)) {
            delete newTimestamps[key];
          }
        });
        return newTimestamps;
      });
    } else {
      // Clear all cache
      setCache({});
      setCacheTimestamps({});
    }
  }, []);

  const getCacheInfo = useCallback(() => {
    const now = Date.now();
    const cacheInfo = Object.keys(cache).map(key => {
      const timestamp = cacheTimestamps[key];
      const age = timestamp ? now - timestamp : 0;
      const isExpired = age > CACHE_DURATION;
      
      return {
        key,
        age,
        isExpired,
        ageInMinutes: Math.floor(age / (1000 * 60)),
        data: cache[key] ? 'Available' : 'No data'
      };
    });

    return {
      totalCacheEntries: Object.keys(cache).length,
      validEntries: cacheInfo.filter(info => !info.isExpired).length,
      expiredEntries: cacheInfo.filter(info => info.isExpired).length,
      cacheDetails: cacheInfo
    };
  }, [cache, cacheTimestamps, CACHE_DURATION]);

  const value = {
    getCachedData,
    setCachedData,
    clearCache,
    getCacheInfo,
    cacheStats: {
      totalEntries: Object.keys(cache).length,
      cacheSize: JSON.stringify(cache).length
    }
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheProvider; 