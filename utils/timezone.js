// Centralized timezone utility for consistent timestamp handling

const DEFAULT_TIMEZONE = 'Asia/Katmandu';

/**
 * Generate timestamp in local timezone
 * @param {string} timezone - Target timezone (default: Nepal timezone)
 * @returns {string} - ISO timestamp adjusted for local timezone
 */
const generateLocalTimestamp = (timezone = DEFAULT_TIMEZONE) => {
  const now = new Date();
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offset = localTime.getTime() - utcTime.getTime();
  
  return new Date(now.getTime() + offset).toISOString();
};

/**
 * Convert UTC timestamp to local timezone for display
 * @param {string} utcTimestamp - UTC timestamp in ISO format
 * @param {string} timezone - Target timezone (default: Nepal timezone)
 * @returns {string} - Formatted local time string
 */
const formatToLocalTime = (utcTimestamp, timezone = DEFAULT_TIMEZONE) => {
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
 * Get human-readable format for display
 * @param {string} timestamp - UTC or local timestamp
 * @param {string} timezone - Display timezone
 * @returns {string} - Human readable format
 */
const formatForDisplay = (timestamp, timezone = DEFAULT_TIMEZONE) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// CommonJS exports for Node.js compatibility
module.exports = {
  generateLocalTimestamp,
  formatToLocalTime,
  formatForDisplay,
  DEFAULT_TIMEZONE
}; 