// Date utility functions for dashboard filtering

// Get date range options for the filter
export const getDateRangeOptions = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const options = [
    { value: 'all', label: 'All Time', type: 'all' },
    { value: 'custom', label: 'Custom Range', type: 'custom' },
    { value: 'thisMonth', label: 'This Month', type: 'month' },
    { value: 'lastMonth', label: 'Last Month', type: 'month' },
    { value: 'last3Months', label: 'Last 3 Months', type: 'period' },
    { value: 'last6Months', label: 'Last 6 Months', type: 'period' },
    { value: 'thisYear', label: 'This Year', type: 'year' },
    { value: 'lastYear', label: 'Last Year', type: 'year' },
  ];

  // Add individual months for current and previous year
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Add current year months
  for (let i = 0; i <= currentMonth; i++) {
    options.push({
      value: `${currentYear}-${i + 1}`,
      label: `${months[i]} ${currentYear}`,
      type: 'specificMonth'
    });
  }

  // Add previous year months
  for (let i = 0; i < 12; i++) {
    options.push({
      value: `${currentYear - 1}-${i + 1}`,
      label: `${months[i]} ${currentYear - 1}`,
      type: 'specificMonth'
    });
  }

  return options;
};

// Get date range based on filter selection
export const getDateRange = (filterValue, customStartDate = null, customEndDate = null) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  switch (filterValue) {
    case 'all':
      return { start: null, end: null };
      
    case 'custom':
      if (customStartDate && customEndDate) {
        return {
          start: new Date(customStartDate),
          end: new Date(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1) // End of day
        };
      }
      return { start: null, end: null };
      
    case 'thisMonth':
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
      };
      
    case 'lastMonth':
      return {
        start: new Date(currentYear, currentMonth - 1, 1),
        end: new Date(currentYear, currentMonth, 0, 23, 59, 59)
      };
      
    case 'last3Months':
      return {
        start: new Date(currentYear, currentMonth - 2, 1),
        end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
      };
      
    case 'last6Months':
      return {
        start: new Date(currentYear, currentMonth - 5, 1),
        end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
      };
      
    case 'thisYear':
      return {
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31, 23, 59, 59)
      };
      
    case 'lastYear':
      return {
        start: new Date(currentYear - 1, 0, 1),
        end: new Date(currentYear - 1, 11, 31, 23, 59, 59)
      };
      
    default:
      // Handle specific month format: "YYYY-M"
      if (filterValue.includes('-')) {
        const [year, month] = filterValue.split('-').map(Number);
        return {
          start: new Date(year, month - 1, 1),
          end: new Date(year, month, 0, 23, 59, 59)
        };
      }
      return { start: null, end: null };
  }
};

// Filter payments by date range
export const filterPaymentsByDate = (payments, dateRange) => {
  if (!dateRange.start || !dateRange.end) {
    return payments; // Return all if no date filter
  }
  
  return payments.filter(payment => {
    const paymentDate = new Date(payment.createdAt || payment.updatedAt);
    return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
  });
};

// Filter products by date range (for recently added, etc.)
export const filterProductsByDate = (products, dateRange) => {
  if (!dateRange.start || !dateRange.end) {
    return products;
  }
  
  return products.filter(product => {
    const productDate = new Date(product.createdAt);
    return productDate >= dateRange.start && productDate <= dateRange.end;
  });
};

// Filter orders by date range
export const filterOrdersByDate = (orders, dateRange) => {
  if (!dateRange.start || !dateRange.end) {
    return orders;
  }
  
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.updatedAt);
    return orderDate >= dateRange.start && orderDate <= dateRange.end;
  });
};

// Get formatted date range string for display
export const getDateRangeDisplay = (filterValue) => {
  const option = getDateRangeOptions().find(opt => opt.value === filterValue);
  return option ? option.label : 'All Time';
};

// Check if a date is within the specified range
export const isDateInRange = (date, dateRange) => {
  if (!dateRange.start || !dateRange.end) {
    return true;
  }
  
  const checkDate = new Date(date);
  return checkDate >= dateRange.start && checkDate <= dateRange.end;
};

// Get month name from date
export const getMonthName = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[new Date(date).getMonth()];
};

// Get year from date
export const getYear = (date) => {
  return new Date(date).getFullYear();
};

// Format date for display
export const formatDateForDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get relative date description
export const getRelativeDateDescription = (filterValue, customStartDate = null, customEndDate = null) => {
  const descriptions = {
    'all': 'showing all-time data',
    'custom': customStartDate && customEndDate 
      ? `showing data from ${formatDateForDisplay(customStartDate)} to ${formatDateForDisplay(customEndDate)}`
      : 'custom date range (select dates)',
    'thisMonth': 'showing current month data',
    'lastMonth': 'showing previous month data',
    'last3Months': 'showing last 3 months data',
    'last6Months': 'showing last 6 months data',
    'thisYear': 'showing current year data',
    'lastYear': 'showing previous year data'
  };
  
  if (descriptions[filterValue]) {
    return descriptions[filterValue];
  }
  
  // Handle specific months
  if (filterValue.includes('-')) {
    const [year, month] = filterValue.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `showing ${monthNames[parseInt(month) - 1]} ${year} data`;
  }
  
  return 'showing filtered data';
};

/**
 * Date utilities for DHL shipping operations
 */

/**
 * Get the next business day (skipping weekends and holidays)
 * @param {Date} fromDate - Starting date (defaults to today)
 * @param {number} daysToAdd - Number of business days to add (default: 1)
 * @returns {Date} Next business day
 */
export function getNextBusinessDay(fromDate = new Date(), daysToAdd = 1) {
  const date = new Date(fromDate);
  let addedDays = 0;
  
  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return date;
}

/**
 * Check if a date is a business day (Monday-Friday)
 * @param {Date} date - Date to check
 * @returns {boolean} True if business day
 */
export function isBusinessDay(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
}

/**
 * Get the earliest possible shipping date based on current time and DHL cutoff
 * @param {Date} currentDate - Current date/time (defaults to now)
 * @returns {Date} Earliest shipping date
 */
export function getEarliestShippingDate(currentDate = new Date()) {
  const now = new Date(currentDate);
  const cutoffHour = 13; // 1:00 PM cutoff for same-day pickup
  
  // If it's before cutoff and a business day, can ship today
  if (now.getHours() < cutoffHour && isBusinessDay(now)) {
    return now;
  }
  
  // Otherwise, next business day
  return getNextBusinessDay(now);
}

/**
 * Format date for DHL API (YYYY-MM-DDTHH:MM:SS GMT+XX:XX)
 * @param {Date} date - Date to format
 * @param {string} timezone - Timezone offset (default: Nepal GMT+05:45)
 * @returns {string} DHL formatted date string
 */
export function formatDHLDate(date, timezone = 'GMT+05:45') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T12:00:00 ${timezone}`;
}

/**
 * Get automatic planned shipping date with smart defaults
 * @param {string|Date} requestedDate - Requested shipping date (optional)
 * @returns {Object} Shipping date info
 */
export function getAutomaticShippingDate(requestedDate = null) {
  let shippingDate;
  let isAutomatic = false;
  let reason = '';
  
  if (requestedDate) {
    const requested = new Date(requestedDate);
    const earliest = getEarliestShippingDate();
    
    // If requested date is in the past or not a business day, use automatic
    if (requested < earliest || !isBusinessDay(requested)) {
      shippingDate = earliest;
      isAutomatic = true;
      reason = requested < earliest ? 'Requested date is too early' : 'Requested date is not a business day';
    } else {
      shippingDate = requested;
      reason = 'Using requested date';
    }
  } else {
    shippingDate = getEarliestShippingDate();
    isAutomatic = true;
    reason = 'No date specified, using next business day';
  }
  
  return {
    date: shippingDate,
    formatted: formatDHLDate(shippingDate),
    isAutomatic,
    reason,
    isToday: shippingDate.toDateString() === new Date().toDateString(),
    dayOfWeek: shippingDate.toLocaleDateString('en-US', { weekday: 'long' }),
    dateString: shippingDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
}

/**
 * Get business days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of business days
 */
export function getBusinessDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    if (isBusinessDay(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

/**
 * Add business days to a date
 * @param {Date} date - Starting date
 * @param {number} businessDays - Number of business days to add
 * @returns {Date} New date
 */
export function addBusinessDays(date, businessDays) {
  return getNextBusinessDay(date, businessDays);
}

export default {
  getDateRangeOptions,
  getDateRange,
  filterPaymentsByDate,
  filterProductsByDate,
  filterOrdersByDate,
  getDateRangeDisplay,
  isDateInRange,
  getMonthName,
  getYear,
  formatDateForDisplay,
  getRelativeDateDescription,
  getNextBusinessDay,
  isBusinessDay,
  getEarliestShippingDate,
  formatDHLDate,
  getAutomaticShippingDate,
  getBusinessDaysBetween,
  addBusinessDays
}; 