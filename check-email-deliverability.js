/**
 * Email Deliverability Checker
 * This script helps you check your current email authentication status
 * and identify potential deliverability issues.
 */

const dns = require('dns').promises;
const https = require('https');
const util = require('util');

// Configuration - Update with your domain
const CONFIG = {
  domain: 'traditionalalley.com.np', // Your actual domain
  testEmail: 'support@traditionalalley.com.np', // Your business email
  checkDomain: 'traditionalalley.com.np' // Domain to check for authentication records
};

class EmailDeliverabilityChecker {
  constructor(domain) {
    this.domain = domain;
    this.results = {
      spf: null,
      dkim: null,
      dmarc: null,
      mx: null,
      issues: [],
      recommendations: []
    };
  }

  async checkSPF() {
    try {
      console.log(`\n🔍 Checking SPF record for ${this.domain}...`);
      const txtRecords = await dns.resolveTxt(this.domain);
      
      const spfRecord = txtRecords.find(record => 
        record.join('').startsWith('v=spf1')
      );

      if (spfRecord) {
        const spfString = spfRecord.join('');
        console.log(`✅ SPF Record Found: ${spfString}`);
        
        this.results.spf = {
          exists: true,
          record: spfString,
          status: 'FOUND'
        };

        // Check for common issues
        if (spfString.includes('-all')) {
          this.results.recommendations.push('Consider using ~all instead of -all for better deliverability');
        }
        if (!spfString.includes('include:_spf.google.com') && !spfString.includes('include:spf.protection.outlook.com')) {
          this.results.recommendations.push('Add your email provider\'s SPF include (e.g., include:_spf.google.com)');
        }
      } else {
        console.log('❌ No SPF record found');
        this.results.spf = { exists: false, status: 'MISSING' };
        this.results.issues.push('Missing SPF record');
        this.results.recommendations.push('Add SPF record: v=spf1 include:_spf.google.com ~all');
      }
    } catch (error) {
      console.log(`❌ Error checking SPF: ${error.message}`);
      this.results.spf = { exists: false, status: 'ERROR', error: error.message };
    }
  }

  async checkDMARC() {
    try {
      console.log(`\n🔍 Checking DMARC record for _dmarc.${this.domain}...`);
      const txtRecords = await dns.resolveTxt(`_dmarc.${this.domain}`);
      
      const dmarcRecord = txtRecords.find(record => 
        record.join('').startsWith('v=DMARC1')
      );

      if (dmarcRecord) {
        const dmarcString = dmarcRecord.join('');
        console.log(`✅ DMARC Record Found: ${dmarcString}`);
        
        this.results.dmarc = {
          exists: true,
          record: dmarcString,
          status: 'FOUND'
        };

        // Parse DMARC policy
        const policyMatch = dmarcString.match(/p=([^;]+)/);
        if (policyMatch) {
          const policy = policyMatch[1];
          console.log(`📋 DMARC Policy: ${policy}`);
          
          if (policy === 'none') {
            this.results.recommendations.push('Consider upgrading DMARC policy from p=none to p=quarantine after monitoring');
          }
        }
      } else {
        console.log('❌ No DMARC record found');
        this.results.dmarc = { exists: false, status: 'MISSING' };
        this.results.issues.push('Missing DMARC record');
        this.results.recommendations.push('Add DMARC record: v=DMARC1; p=none; rua=mailto:dmarc@' + this.domain);
      }
    } catch (error) {
      console.log(`❌ Error checking DMARC: ${error.message}`);
      this.results.dmarc = { exists: false, status: 'ERROR', error: error.message };
    }
  }

  async checkMX() {
    try {
      console.log(`\n🔍 Checking MX records for ${this.domain}...`);
      const mxRecords = await dns.resolveMx(this.domain);
      
      if (mxRecords && mxRecords.length > 0) {
        console.log(`✅ MX Records Found:`);
        mxRecords.forEach(mx => {
          console.log(`   Priority ${mx.priority}: ${mx.exchange}`);
        });
        
        this.results.mx = {
          exists: true,
          records: mxRecords,
          status: 'FOUND'
        };
      } else {
        console.log('❌ No MX records found');
        this.results.mx = { exists: false, status: 'MISSING' };
        this.results.issues.push('Missing MX records');
      }
    } catch (error) {
      console.log(`❌ Error checking MX: ${error.message}`);
      this.results.mx = { exists: false, status: 'ERROR', error: error.message };
    }
  }

  async checkDKIM() {
    try {
      console.log(`\n🔍 Checking DKIM records for ${this.domain}...`);
      
      // Common DKIM selectors to check
      const selectors = ['default', 'google', 'k1', 'selector1', 'selector2', 'dkim'];
      let dkimFound = false;

      for (const selector of selectors) {
        try {
          const dkimDomain = `${selector}._domainkey.${this.domain}`;
          const txtRecords = await dns.resolveTxt(dkimDomain);
          
          const dkimRecord = txtRecords.find(record => 
            record.join('').includes('v=DKIM1') || record.join('').includes('k=rsa')
          );

          if (dkimRecord) {
            console.log(`✅ DKIM Record Found (${selector}): ${dkimRecord.join('').substring(0, 100)}...`);
            dkimFound = true;
            this.results.dkim = {
              exists: true,
              selector: selector,
              record: dkimRecord.join(''),
              status: 'FOUND'
            };
            break;
          }
        } catch (err) {
          // Continue checking other selectors
        }
      }

      if (!dkimFound) {
        console.log('❌ No DKIM records found with common selectors');
        this.results.dkim = { exists: false, status: 'MISSING' };
        this.results.issues.push('Missing DKIM record');
        this.results.recommendations.push('Enable DKIM signing in your email provider and add DKIM DNS record');
      }
    } catch (error) {
      console.log(`❌ Error checking DKIM: ${error.message}`);
      this.results.dkim = { exists: false, status: 'ERROR', error: error.message };
    }
  }

  async checkBlacklist() {
    console.log(`\n🔍 Checking if ${this.domain} is blacklisted...`);
    console.log('ℹ️  For comprehensive blacklist checking, visit: https://mxtoolbox.com/blacklists.aspx');
    console.log(`   Enter your domain: ${this.domain}`);
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EMAIL DELIVERABILITY REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n🏷️  Domain: ${this.domain}`);
    console.log(`📅 Checked: ${new Date().toLocaleString()}`);
    
    // Status Summary
    console.log('\n📋 AUTHENTICATION STATUS:');
    console.log(`   SPF:   ${this.results.spf?.status || 'NOT CHECKED'} ${this.results.spf?.exists ? '✅' : '❌'}`);
    console.log(`   DKIM:  ${this.results.dkim?.status || 'NOT CHECKED'} ${this.results.dkim?.exists ? '✅' : '❌'}`);
    console.log(`   DMARC: ${this.results.dmarc?.status || 'NOT CHECKED'} ${this.results.dmarc?.exists ? '✅' : '❌'}`);
    console.log(`   MX:    ${this.results.mx?.status || 'NOT CHECKED'} ${this.results.mx?.exists ? '✅' : '❌'}`);
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      this.results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    // Overall Score
    const authCount = [this.results.spf, this.results.dkim, this.results.dmarc, this.results.mx]
      .filter(result => result?.exists).length;
    const totalChecks = 4;
    const score = Math.round((authCount / totalChecks) * 100);
    
    console.log(`\n🎯 DELIVERABILITY SCORE: ${score}%`);
    
    if (score >= 75) {
      console.log('✅ Good! Your email authentication is well configured.');
    } else if (score >= 50) {
      console.log('⚠️  Fair. Some improvements needed for better deliverability.');
    } else {
      console.log('❌ Poor. Significant improvements needed to avoid spam folder.');
    }
    
    console.log('\n🔗 NEXT STEPS:');
    console.log('   1. Fix any missing authentication records');
    console.log('   2. Test your emails using: https://www.mail-tester.com/');
    console.log('   3. Monitor with Google Postmaster Tools');
    console.log('   4. Check blacklist status: https://mxtoolbox.com/blacklists.aspx');
    console.log('   5. Review the setup guide: email-deliverability-setup-guide.md');
    
    console.log('\n' + '='.repeat(60));
  }

  async runAllChecks() {
    console.log('🚀 Starting Email Deliverability Check...');
    console.log(`📧 Domain: ${this.domain}`);
    
    await this.checkSPF();
    await this.checkDKIM();
    await this.checkDMARC();
    await this.checkMX();
    await this.checkBlacklist();
    
    this.generateReport();
    
    return this.results;
  }
}

// Usage
async function main() {
  try {
    console.log('📧 Email Deliverability Checker');
    console.log('================================\n');
    
    // Update the domain in CONFIG at the top of this file
    if (CONFIG.domain === 'yourdomain.com') {
      console.log('⚠️  Please update the CONFIG.domain at the top of this file with your actual domain!');
      console.log('   Example: domain: "traditionalalley.com"');
      return;
    }
    
    const checker = new EmailDeliverabilityChecker(CONFIG.domain);
    const results = await checker.runAllChecks();
    
    // Save results to file
    const fs = require('fs');
    const reportFile = `deliverability-report-${CONFIG.domain}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed results saved to: ${reportFile}`);
    
  } catch (error) {
    console.error('❌ Error running deliverability check:', error.message);
  }
}

// Run the checker
if (require.main === module) {
  main();
}

module.exports = EmailDeliverabilityChecker;