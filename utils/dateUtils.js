// Date utility functions for timezone conversion

/**
 * Convert UTC timestamp to local timezone
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @param {string} timezone - Target timezone (default: system timezone)
 * @returns {string} - Formatted local time string
 */
export const convertUTCToLocal = (utcTimestamp, timezone = 'Asia/Katmandu') => {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Convert UTC timestamp to local timezone with custom format
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @param {string} timezone - Target timezone (default: Nepal timezone)
 * @returns {object} - Object with formatted date components
 */
export const getLocalDateComponents = (utcTimestamp, timezone = 'Asia/Katmandu') => {
  const date = new Date(utcTimestamp);
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  
  return {
    year: localDate.getFullYear(),
    month: localDate.getMonth() + 1, // getMonth() returns 0-11
    day: localDate.getDate(),
    hour: localDate.getHours(),
    minute: localDate.getMinutes(),
    second: localDate.getSeconds(),
    formatted: localDate.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  };
};

/**
 * Generate timestamp in local timezone (for new records)
 * @param {string} timezone - Target timezone (default: Nepal timezone)
 * @returns {string} - ISO timestamp adjusted for local timezone
 */
export const generateLocalTimestamp = (timezone = 'Asia/Katmandu') => {
  const now = new Date();
  // Get the timezone offset in minutes
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offset = localTime.getTime() - utcTime.getTime();
  
  // Create a new date with the offset applied
  const adjustedDate = new Date(now.getTime() + offset);
  return adjustedDate.toISOString();
};

/**
 * Format timestamp for display
 * @param {string} timestamp - UTC or local timestamp
 * @param {string} timezone - Display timezone
 * @returns {string} - Human readable format
 */
export const formatTimestampForDisplay = (timestamp, timezone = 'Asia/Katmandu') => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}; 