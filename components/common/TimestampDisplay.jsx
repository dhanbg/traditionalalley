import React from 'react';
const { formatToLocalTime, formatForDisplay } = require('../../utils/timezone');

/**
 * Component to display timestamps in local timezone
 * @param {Object} props
 * @param {string} props.timestamp - UTC timestamp to display
 * @param {string} props.format - Display format ('short' or 'long')
 * @param {string} props.timezone - Target timezone (optional)
 */
const TimestampDisplay = ({ 
  timestamp, 
  format = 'short', 
  timezone = 'Asia/Katmandu',
  className = '' 
}) => {
  if (!timestamp) {
    return <span className={className}>--</span>;
  }

  try {
    const displayTime = format === 'long' 
      ? formatForDisplay(timestamp, timezone)
      : formatToLocalTime(timestamp, timezone);
    
    return (
      <span className={className} title={`UTC: ${timestamp}`}>
        {displayTime}
      </span>
    );
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return <span className={className}>Invalid date</span>;
  }
};

export default TimestampDisplay; 