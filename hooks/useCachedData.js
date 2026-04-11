'use client'
import { useState, useEffect, useCallback } from 'react';
import { useCache } from '../components/analytics/CacheProvider';

export const useCachedData = (tabId, dateFilter, fetchFunction, dependencies = []) => {
  const { getCachedData, setCachedData } = useCache();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Check for cached data first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData(tabId, dateFilter);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setIsFromCache(true);
          return cachedData;
        }
      }

      // No cached data or force refresh, fetch fresh data
      setLoading(true);
      setIsFromCache(false);
      
      const freshData = await fetchFunction();
      
      // Cache the fresh data
      setCachedData(tabId, dateFilter, freshData);
      
      setData(freshData);
      setLastFetchTime(Date.now());
      setLoading(false);
      
      return freshData;
    } catch (err) {
      setError(err);
      setLoading(false);
      setIsFromCache(false);
      throw err;
    }
  }, [tabId, dateFilter, fetchFunction, getCachedData, setCachedData]);

  const refreshData = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [tabId, dateFilter, ...dependencies]);

  return {
    data,
    loading,
    error,
    isFromCache,
    lastFetchTime,
    fetchData,
    refreshData
  };
};

export default useCachedData; 