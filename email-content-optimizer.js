/**
 * Email Content Optimizer
 * Analyzes email content for spam triggers and provides recommendations
 */

class EmailContentOptimizer {
  constructor() {
    this.spamWords = [
      // High-risk spam words
      'free', 'urgent', 'act now', 'limited time', 'click here', 'buy now',
      'cash', 'money back', 'guarantee', 'no obligation', 'risk free',
      'winner', 'congratulations', 'selected', 'exclusive', 'special offer',
      'discount', 'save', 'deal', 'promotion', 'bonus', 'gift',
      // Medium-risk words
      'amazing', 'incredible', 'fantastic', 'unbelievable', 'miracle',
      'secret', 'hidden', 'revealed', 'breakthrough', 'revolutionary',
      'instant', 'immediate', 'fast', 'quick', 'easy money'
    ];
    
    this.spamPhrases = [
      'act now', 'click here', 'buy now', 'order now', 'sign up free',
      'get started now', 'limited time offer', 'expires soon',
      'don\'t miss out', 'last chance', 'hurry up', 'what are you waiting for'
    ];
  }

  analyzeContent(subject, body) {
    const analysis = {
      score: 0,
      issues: [],
      recommendations: [],
      spamRisk: 'LOW'
    };

    // Analyze subject line
    const subjectAnalysis = this.analyzeSubject(subject);
    analysis.score += subjectAnalysis.score;
    analysis.issues.push(...subjectAnalysis.issues);
    analysis.recommendations.push(...subjectAnalysis.recommendations);

    // Analyze body content
    const bodyAnalysis = this.analyzeBody(body);
    analysis.score += bodyAnalysis.score;
    analysis.issues.push(...bodyAnalysis.issues);
    analysis.recommendations.push(...bodyAnalysis.recommendations);

    // Determine spam risk
    if (analysis.score >= 7) {
      analysis.spamRisk = 'HIGH';
    } else if (analysis.score >= 4) {
      analysis.spamRisk = 'MEDIUM';
    }

    return analysis;
  }

  analyzeSubject(subject) {
    const analysis = { score: 0, issues: [], recommendations: [] };
    
    if (!subject || subject.trim().length === 0) {
      analysis.score += 3;
      analysis.issues.push('Missing subject line');
      analysis.recommendations.push('Add a clear, descriptive subject line');
      return analysis;
    }

    // Check length
    if (subject.length > 50) {
      analysis.score += 1;
      analysis.issues.push('Subject line too long (>50 characters)');
      analysis.recommendations.push('Keep subject line under 50 characters');
    }

    // Check for ALL CAPS
    if (subject === subject.toUpperCase() && subject.length > 5) {
      analysis.score += 2;
      analysis.issues.push('Subject line in ALL CAPS');
      analysis.recommendations.push('Use normal capitalization in subject line');
    }

    // Check for excessive punctuation
    const exclamationCount = (subject.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      analysis.score += 1;
      analysis.issues.push('Too many exclamation marks in subject');
      analysis.recommendations.push('Use maximum 1 exclamation mark');
    }

    // Check for spam words
    const lowerSubject = subject.toLowerCase();
    this.spamWords.forEach(word => {
      if (lowerSubject.includes(word)) {
        analysis.score += 1;
        analysis.issues.push(`Spam word detected in subject: "${word}"`);
        analysis.recommendations.push(`Replace "${word}" with less promotional language`);
      }
    });

    return analysis;
  }

  analyzeBody(body) {
    const analysis = { score: 0, issues: [], recommendations: [] };
    
    if (!body || body.trim().length === 0) {
      analysis.score += 2;
      analysis.issues.push('Empty email body');
      analysis.recommendations.push('Add meaningful content to email body');
      return analysis;
    }

    const lowerBody = body.toLowerCase();
    
    // Check text-to-link ratio
    const linkCount = (body.match(/https?:\/\//g) || []).length;
    const wordCount = body.split(/\s+/).length;
    
    if (linkCount > 0 && wordCount / linkCount < 20) {
      analysis.score += 2;
      analysis.issues.push('Too many links relative to text content');
      analysis.recommendations.push('Add more text content or reduce number of links');
    }

    // Check for spam words in body
    let spamWordCount = 0;
    this.spamWords.forEach(word => {
      if (lowerBody.includes(word)) {
        spamWordCount++;
      }
    });
    
    if (spamWordCount > 3) {
      analysis.score += 2;
      analysis.issues.push(`Multiple spam words detected (${spamWordCount})`);
      analysis.recommendations.push('Reduce promotional language and spam trigger words');
    }

    // Check for spam phrases
    this.spamPhrases.forEach(phrase => {
      if (lowerBody.includes(phrase)) {
        analysis.score += 1;
        analysis.issues.push(`Spam phrase detected: "${phrase}"`);
        analysis.recommendations.push(`Replace "${phrase}" with more natural language`);
      }
    });

    // Check for excessive capitalization
    const capsWords = body.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 2) {
      analysis.score += 1;
      analysis.issues.push('Excessive use of capital letters');
      analysis.recommendations.push('Use normal capitalization throughout the email');
    }

    // Check for missing unsubscribe
    if (!lowerBody.includes('unsubscribe') && !lowerBody.includes('opt out')) {
      analysis.score += 1;
      analysis.issues.push('Missing unsubscribe option');
      analysis.recommendations.push('Include an unsubscribe link');
    }

    return analysis;
  }

  generateReport(subject, body) {
    const analysis = this.analyzeContent(subject, body);
    
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL CONTENT ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 SPAM RISK: ${analysis.spamRisk}`);
    console.log(`🎯 SPAM SCORE: ${analysis.score}/10`);
    
    if (analysis.spamRisk === 'HIGH') {
      console.log('🚨 HIGH RISK: This email will likely go to spam folder');
    } else if (analysis.spamRisk === 'MEDIUM') {
      console.log('⚠️  MEDIUM RISK: Some improvements recommended');
    } else {
      console.log('✅ LOW RISK: Good email content');
    }
    
    if (analysis.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      analysis.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      analysis.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n📋 BEST PRACTICES:');
    console.log('   • Keep subject line under 50 characters');
    console.log('   • Use personalization when possible');
    console.log('   • Include both text and HTML versions');
    console.log('   • Add your physical business address');
    console.log('   • Include clear unsubscribe option');
    console.log('   • Test with mail-tester.com before sending');
    
    console.log('\n' + '='.repeat(60));
    
    return analysis;
  }

  optimizeContent(subject, body) {
    const suggestions = {
      subject: this.optimizeSubject(subject),
      body: this.optimizeBody(body)
    };
    
    return suggestions;
  }

  optimizeSubject(subject) {
    if (!subject) return 'Your Invoice from [Company Name]';
    
    let optimized = subject;
    
    // Fix ALL CAPS
    if (optimized === optimized.toUpperCase()) {
      optimized = optimized.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Remove excessive exclamation marks
    optimized = optimized.replace(/!{2,}/g, '!');
    
    // Replace common spam words
    const replacements = {
      'free': 'complimentary',
      'urgent': 'important',
      'act now': 'please review',
      'click here': 'view details',
      'buy now': 'order today'
    };
    
    Object.keys(replacements).forEach(spam => {
      const regex = new RegExp(spam, 'gi');
      optimized = optimized.replace(regex, replacements[spam]);
    });
    
    return optimized;
  }

  optimizeBody(body) {
    if (!body) return 'Please find your invoice attached. Thank you for your business.';
    
    let optimized = body;
    
    // Add unsubscribe if missing
    if (!optimized.toLowerCase().includes('unsubscribe')) {
      optimized += '\n\nTo unsubscribe from future emails, please reply with "UNSUBSCRIBE".';
    }
    
    return optimized;
  }
}

// Example usage and testing
function testEmailContent() {
  const optimizer = new EmailContentOptimizer();
  
  // Test cases
  const testEmails = [
    {
      name: 'Current Invoice Email',
      subject: 'Invoice from Traditional Alley',
      body: 'Hello,\n\nPlease find your invoice attached.\n\nThank you for your business!\n\nBest regards,\nTraditional Alley Team'
    },
    {
      name: 'Spammy Email (Bad Example)',
      subject: 'URGENT!!! FREE MONEY - ACT NOW!!!',
      body: 'CONGRATULATIONS! You are a WINNER! Click here NOW to claim your FREE cash bonus! Limited time offer - don\'t miss out! Buy now or lose this amazing deal forever!'
    }
  ];
  
  testEmails.forEach(email => {
    console.log(`\n🧪 Testing: ${email.name}`);
    console.log(`Subject: "${email.subject}"`);
    console.log(`Body: "${email.body.substring(0, 100)}..."`);
    
    const analysis = optimizer.generateReport(email.subject, email.body);
    
    if (analysis.spamRisk !== 'LOW') {
      console.log('\n🔧 OPTIMIZED VERSION:');
      const optimized = optimizer.optimizeContent(email.subject, email.body);
      console.log(`Subject: "${optimized.subject}"`);
      console.log(`Body: "${optimized.body.substring(0, 100)}..."`);
    }
  });
}

// Main function
function main() {
  console.log('📧 Email Content Optimizer');
  console.log('==========================\n');
  
  // You can test your email content here
  const yourSubject = 'Invoice from Traditional Alley';
  const yourBody = `Hello,

Please find your invoice attached.

Thank you for your business!

Best regards,
Traditional Alley Team`;
  
  const optimizer = new EmailContentOptimizer();
  const analysis = optimizer.generateReport(yourSubject, yourBody);
  
  if (analysis.spamRisk !== 'LOW') {
    console.log('\n🔧 SUGGESTED IMPROVEMENTS:');
    const optimized = optimizer.optimizeContent(yourSubject, yourBody);
    console.log(`Optimized Subject: "${optimized.subject}"`);
    console.log(`Optimized Body: "${optimized.body}"`);
  }
  
  console.log('\n💡 To test different content, modify the yourSubject and yourBody variables above.');
}

// Run the optimizer
if (require.main === module) {
  main();
}

module.exports = EmailContentOptimizer;