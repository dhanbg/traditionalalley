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
  getRelativeDateDescription
}; 