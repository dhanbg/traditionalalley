#!/usr/bin/env node

/**
 * Production API Diagnostic Script
 * 
 * This script helps diagnose the 405 error on POST /api/user-orders in production.
 * Run this on the production server to identify the root cause.
 * 
 * Usage: node debug-production-api.js [production-url]
 * Example: node debug-production-api.js https://admin.traditionalalley.com.np
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const PRODUCTION_URL = process.argv[2] || 'https://admin.traditionalalley.com.np';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Production-API-Debugger/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function runDiagnostics() {
  console.log('🔍 Production API Diagnostics for /api/user-orders');
  console.log('=' .repeat(60));
  console.log(`Target URL: ${PRODUCTION_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    {
      name: 'Health Check - Root Path',
      url: `${PRODUCTION_URL}/`,
      method: 'GET'
    },
    {
      name: 'API Route - GET /api/user-orders',
      url: `${PRODUCTION_URL}/api/user-orders`,
      method: 'GET'
    },
    {
      name: 'API Route - POST /api/user-orders (Main Issue)',
      url: `${PRODUCTION_URL}/api/user-orders`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          test: 'diagnostic-data',
          authUserId: 'test-user'
        }
      })
    },
    {
      name: 'API Route - PUT /api/user-orders',
      url: `${PRODUCTION_URL}/api/user-orders?id=test`,
      method: 'PUT',
      body: JSON.stringify({
        data: {
          test: 'diagnostic-update'
        }
      })
    },
    {
      name: 'API Route - DELETE /api/user-orders (Should 405)',
      url: `${PRODUCTION_URL}/api/user-orders`,
      method: 'DELETE'
    },
    {
      name: 'API Route - OPTIONS /api/user-orders (CORS Check)',
      url: `${PRODUCTION_URL}/api/user-orders`,
      method: 'OPTIONS'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n🧪 ${test.name}`);
    console.log(`   ${test.method} ${test.url}`);
    
    try {
      const result = await makeRequest(test.url, {
        method: test.method,
        body: test.body
      });
      
      console.log(`   ✅ Status: ${result.status} ${result.statusText}`);
      
      // Log important headers
      const importantHeaders = ['server', 'x-powered-by', 'content-type', 'allow', 'access-control-allow-methods'];
      importantHeaders.forEach(header => {
        if (result.headers[header]) {
          console.log(`   📋 ${header}: ${result.headers[header]}`);
        }
      });
      
      // Parse and log response body (first 200 chars)
      let bodyPreview = result.body.substring(0, 200);
      if (result.body.length > 200) bodyPreview += '...';
      console.log(`   📄 Response: ${bodyPreview}`);
      
      results.push({
        test: test.name,
        method: test.method,
        url: test.url,
        status: result.status,
        success: true,
        headers: result.headers,
        body: result.body
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        test: test.name,
        method: test.method,
        url: test.url,
        error: error.message,
        success: false
      });
    }
  }

  // Analysis
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DIAGNOSTIC ANALYSIS');
  console.log('=' .repeat(60));

  const postResult = results.find(r => r.method === 'POST' && r.url.includes('/api/user-orders'));
  
  if (postResult) {
    if (postResult.status === 405) {
      console.log('\n🚨 CONFIRMED: POST /api/user-orders returns 405 Method Not Allowed');
      
      // Check if Allow header is present
      if (postResult.headers && postResult.headers.allow) {
        console.log(`   Allowed methods: ${postResult.headers.allow}`);
      }
      
      // Check server type
      if (postResult.headers && postResult.headers.server) {
        console.log(`   Server: ${postResult.headers.server}`);
      }
      
      console.log('\n🔍 POSSIBLE CAUSES:');
      console.log('   1. API route not properly deployed/built in Docker image');
      console.log('   2. Next.js API routes not working in production environment');
      console.log('   3. Reverse proxy (nginx/apache) blocking POST requests');
      console.log('   4. Docker container routing issues');
      console.log('   5. Missing files in Docker production build');
      
    } else if (postResult.status === 401) {
      console.log('\n✅ GOOD: POST /api/user-orders is working (returns 401 Unauthorized as expected)');
    } else {
      console.log(`\n⚠️  POST /api/user-orders returned unexpected status: ${postResult.status}`);
    }
  }

  // Check if other methods work
  const getResult = results.find(r => r.method === 'GET' && r.url.includes('/api/user-orders'));
  if (getResult && getResult.status === 401) {
    console.log('✅ GET /api/user-orders is working (returns 401 as expected)');
  }

  console.log('\n📋 NEXT STEPS:');
  if (postResult && postResult.status === 405) {
    console.log('1. Check Docker container logs: docker logs nextjs-app');
    console.log('2. Verify API routes exist in production build');
    console.log('3. Check reverse proxy configuration');
    console.log('4. Rebuild and redeploy Docker image with latest fixes');
  }

  console.log('\n' + '=' .repeat(60));
  console.log('Diagnostic complete. Save this output for troubleshooting.');
}

// Run diagnostics
runDiagnostics().catch(console.error);
