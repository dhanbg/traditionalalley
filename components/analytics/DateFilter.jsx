'use client'
import React from 'react';
import { getDateRangeOptions, getRelativeDateDescription } from '../../lib/date-utils';

const DateFilter = ({ selectedFilter, onFilterChange, className = '', customStartDate, customEndDate, onCustomDateChange }) => {
  const dateOptions = getDateRangeOptions();
  
  // Group options by type for better UX
  const groupedOptions = {
    quick: dateOptions.filter(opt => ['all', 'custom', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'].includes(opt.value)),
    periods: dateOptions.filter(opt => opt.type === 'period'),
    months: dateOptions.filter(opt => opt.type === 'specificMonth')
  };

  const handleCustomDateChange = (field, value) => {
    if (onCustomDateChange) {
      onCustomDateChange(field, value);
    }
  };

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];
  
  // Validate custom date range
  const isValidCustomRange = customStartDate && customEndDate && new Date(customStartDate) <= new Date(customEndDate);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            id="dateFilter"
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <optgroup label="Quick Filters">
              {groupedOptions.quick.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Periods">
              {groupedOptions.periods.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            
            <optgroup label="Specific Months">
              {groupedOptions.months.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {getRelativeDateDescription(selectedFilter, customStartDate, customEndDate)}
          </span>
        </div>
      </div>
      
      {/* Custom Date Range Inputs */}
      {selectedFilter === 'custom' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          {/* Quick custom date presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Custom Ranges</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Last 7 days', days: 7 },
                { label: 'Last 14 days', days: 14 },
                { label: 'Last 30 days', days: 30 },
                { label: 'Last 90 days', days: 90 }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - preset.days);
                    handleCustomDateChange('start', start.toISOString().split('T')[0]);
                    handleCustomDateChange('end', end.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="customStartDate"
                value={customStartDate || ''}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                max={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="customEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="customEndDate"
                value={customEndDate || ''}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                min={customStartDate || undefined}
                max={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 text-sm">
            {customStartDate && customEndDate && isValidCustomRange && (
              <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800">
                ✓ Custom range: {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
              </span>
            )}
            {customStartDate && customEndDate && !isValidCustomRange && (
              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800">
                ⚠ Invalid range: End date must be after start date
              </span>
            )}
            {(!customStartDate || !customEndDate) && (
              <span className="text-gray-500">
                Please select both start and end dates for custom range
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick filter buttons for mobile/tablet */}
      <div className="mt-4 sm:hidden">
        <div className="flex flex-wrap gap-2">
          {groupedOptions.quick.slice(0, 5).map(option => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateFilter; 