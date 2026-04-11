#!/usr/bin/env node

/**
 * Automated Exchange Rate Update Script
 * 
 * This script can be run periodically (via cron job or task scheduler) to:
 * 1. Fetch the latest USD to NPR exchange rate
 * 2. Update the fallback rate in currency.js if needed
 * 3. Log the update for monitoring
 * 
 * Usage:
 * - Manual: node scripts/update-exchange-rates.js
 * - Scheduled: Add to cron job or Windows Task Scheduler
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CURRENCY_FILE_PATH = path.join(__dirname, '../utils/currency.js');
const LOG_FILE_PATH = path.join(__dirname, '../logs/exchange-rate-updates.log');

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Fetch current exchange rate from API
 */
function fetchExchangeRate() {
  return new Promise((resolve, reject) => {
    const request = https.get(EXCHANGE_API_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.rates && parsed.rates.NPR) {
            resolve(parsed.rates.NPR);
          } else {
            reject(new Error('NPR rate not found in API response'));
          }
        } catch (error) {
          reject(new Error('Failed to parse API response: ' + error.message));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error('API request failed: ' + error.message));
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('API request timeout'));
    });
  });
}

/**
 * Update the fallback rate in currency.js
 */
function updateCurrencyFile(newRate) {
  try {
    let content = fs.readFileSync(CURRENCY_FILE_PATH, 'utf8');
    
    // Find and replace the fallback rate
    const fallbackRateRegex = /const FALLBACK_USD_TO_NPR_RATE = [\d.]+;/;
    const newFallbackLine = `const FALLBACK_USD_TO_NPR_RATE = ${newRate}; // Auto-updated on ${new Date().toISOString()}`;
    
    if (fallbackRateRegex.test(content)) {
      content = content.replace(fallbackRateRegex, newFallbackLine);
      fs.writeFileSync(CURRENCY_FILE_PATH, content, 'utf8');
      return true;
    } else {
      throw new Error('Fallback rate pattern not found in currency.js');
    }
  } catch (error) {
    throw new Error('Failed to update currency file: ' + error.message);
  }
}

/**
 * Log the update
 */
function logUpdate(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
  
  console.log(logEntry.trim());
}

/**
 * Main execution
 */
async function main() {
  try {
    logUpdate('Starting exchange rate update...');
    
    // Fetch current rate
    const newRate = await fetchExchangeRate();
    logUpdate(`Fetched new rate: 1 USD = ${newRate} NPR`);
    
    // Read current fallback rate
    const currentContent = fs.readFileSync(CURRENCY_FILE_PATH, 'utf8');
    const currentRateMatch = currentContent.match(/const FALLBACK_USD_TO_NPR_RATE = ([\d.]+);/);
    
    if (currentRateMatch) {
      const currentRate = parseFloat(currentRateMatch[1]);
      const rateDifference = Math.abs(newRate - currentRate);
      const percentageChange = (rateDifference / currentRate) * 100;
      
      logUpdate(`Current rate: ${currentRate}, New rate: ${newRate}, Change: ${percentageChange.toFixed(2)}%`);
      
      // Only update if there's a significant change (>0.5%)
      if (percentageChange > 0.5) {
        updateCurrencyFile(newRate);
        logUpdate(`✅ Updated fallback rate from ${currentRate} to ${newRate}`);
      } else {
        logUpdate(`ℹ️  Rate change (${percentageChange.toFixed(2)}%) is minimal, no update needed`);
      }
    } else {
      // Force update if we can't find current rate
      updateCurrencyFile(newRate);
      logUpdate(`✅ Updated fallback rate to ${newRate} (current rate not found)`);
    }
    
    logUpdate('Exchange rate update completed successfully');
    
  } catch (error) {
    logUpdate(`❌ Exchange rate update failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchExchangeRate, updateCurrencyFile, logUpdate };