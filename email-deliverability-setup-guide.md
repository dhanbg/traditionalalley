# Email Deliverability Setup Guide

This guide will help you implement the solutions to prevent your emails from going to spam.

## 1. Check Current Email Authentication Status

### Tools to Use:
- **Google Postmaster Tools**: https://postmaster.google.com/
- **Mail Tester**: https://www.mail-tester.com/
- **MXToolbox**: https://mxtoolbox.com/
- **DMARC Analyzer**: https://dmarcly.com/

### Quick Test:
1. Send a test email to: check@dmarcly.com
2. You'll receive a report showing your SPF/DKIM/DMARC status

## 2. DNS Records Setup

### SPF Record
Add this TXT record to your domain's DNS:
```
v=spf1 include:_spf.google.com ~all
```

### DKIM Setup
1. Enable DKIM in your email provider (Gmail Workspace, etc.)
2. Add the provided DKIM TXT record to your DNS

### DMARC Record
Start with a monitoring policy:
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

Gradually move to:
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

Then finally:
```
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com
```

### MX Record
Ensure you have a valid MX record pointing to your mail server.

## 3. Email Content Optimization

### Avoid These Spam Triggers:
- ALL CAPS text
- Excessive exclamation marks!!!
- Words like: FREE, URGENT, ACT NOW, GUARANTEED
- Too many links (keep under 3-5 per email)
- Image-only emails
- Suspicious attachments

### Best Practices:
- Use a clear, descriptive subject line
- Include both HTML and plain text versions
- Maintain 60:40 text-to-image ratio
- Use professional email signatures
- Include your physical address
- Add clear unsubscribe links

## 4. Sender Reputation Building

### Email Warm-up Process:
1. **Week 1**: Send 10-20 emails per day
2. **Week 2**: Send 50-100 emails per day
3. **Week 3**: Send 200-500 emails per day
4. **Week 4+**: Gradually increase to your target volume

### List Hygiene:
- Remove bounced email addresses immediately
- Segment inactive subscribers
- Use double opt-in for new subscribers
- Regular list cleaning (monthly)

## 5. Monitoring and Maintenance

### Key Metrics to Track:
- **Delivery Rate**: Should be >95%
- **Open Rate**: Industry average 15-25%
- **Bounce Rate**: Should be <2%
- **Spam Complaint Rate**: Should be <0.1%
- **Unsubscribe Rate**: Should be <0.5%

### Tools for Monitoring:
- Google Postmaster Tools (for Gmail)
- Microsoft SNDS (for Outlook)
- Sender Score (overall reputation)
- Your email provider's analytics

## 6. Immediate Actions for Your Current System

### For Your Invoice Email System:
1. **Update email template**:
   - Add personal greeting
   - Include company information
   - Add clear reason for the email
   - Include contact information

2. **Technical fixes**:
   - Ensure proper From address (not noreply@)
   - Add Reply-To header
   - Include List-Unsubscribe header
   - Set proper Message-ID

3. **Content improvements**:
   - Use conversational tone
   - Explain why you're sending the email
   - Include next steps or call-to-action
   - Add social proof or testimonials

## 7. Emergency Fixes

### If Emails Are Currently Going to Spam:
1. **Ask recipients to whitelist your email**
2. **Check blacklist status**: Use MXToolbox blacklist check
3. **Reduce sending volume temporarily**
4. **Review recent email content for spam triggers**
5. **Contact your email provider for assistance**

### Whitelist Instructions for Recipients:
**Gmail:**
1. Find the email in spam folder
2. Select it and click "Not Spam"
3. Add sender to contacts

**Outlook:**
1. Go to Settings > Mail > Junk Email
2. Add sender to Safe Senders list

## 8. Testing Your Setup

### Send Test Emails To:
- Gmail account
- Outlook account
- Yahoo account
- Your own business email

### Check Email Headers:
Look for these in email headers:
- `Authentication-Results: spf=pass`
- `Authentication-Results: dkim=pass`
- `Authentication-Results: dmarc=pass`

## 9. Advanced Solutions

### If Basic Setup Doesn't Work:
1. **Dedicated IP address** (for high-volume senders)
2. **Email warm-up services** (like Warmup Inbox)
3. **Professional email deliverability consultant**
4. **Switch to dedicated email service** (SendGrid, Mailgun, etc.)

## 10. Maintenance Schedule

### Weekly:
- Check spam complaint rates
- Review bounce reports
- Monitor delivery rates

### Monthly:
- Clean email lists
- Review DMARC reports
- Update content based on engagement

### Quarterly:
- Full deliverability audit
- Review and update DNS records
- Analyze sender reputation trends

---

## Quick Checklist

- [ ] SPF record configured
- [ ] DKIM enabled and configured
- [ ] DMARC policy set (start with p=none)
- [ ] MX record properly configured
- [ ] Email content optimized
- [ ] Sender reputation monitoring setup
- [ ] Test emails sent and verified
- [ ] Monitoring tools configured
- [ ] Emergency procedures documented

## Need Help?

If you need assistance implementing any of these solutions, consider:
1. Contacting your domain registrar for DNS help
2. Reaching out to your email provider's support
3. Using professional deliverability services
4. Consulting with an email marketing expert

Remember: Email deliverability is an ongoing process, not a one-time setup. Regular monitoring and maintenance are essential for long-term success.