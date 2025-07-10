# 📧 Gmail SMTP Setup for Traditional Alley OTP System

## 🚀 Quick Setup (5 minutes)

Follow these steps to enable email OTP functionality for your registration system.

---

## Step 1: Enable 2-Factor Authentication

### Method 1: Direct Link (Fastest)
1. **Click this link**: https://myaccount.google.com/security
2. Sign in to your Gmail account
3. Look for **"2-Step Verification"** section
4. Click **"Get started"** or **"Turn on"**

### Method 2: Manual Navigation
1. Go to https://gmail.com and sign in
2. Click your profile picture (top right)
3. Click **"Manage your Google Account"**
4. Click **"Security"** in the left sidebar
5. Find **"2-Step Verification"** and click **"Get started"**

### Complete 2FA Setup:
1. **Enter your phone number**
2. **Choose verification method**: Text message or Phone call
3. **Enter the verification code** you receive
4. **Click "Turn on"** to enable 2-Step Verification

---

## Step 2: Generate App Password

### Method 1: Direct Link (Recommended)
1. **Click this link**: https://myaccount.google.com/apppasswords
2. You'll be taken directly to the App Passwords page
3. **Skip to Step 3** below

### Method 2: Manual Navigation
1. Go to https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Scroll down to find **"App passwords"**
4. Click on **"App passwords"**

### Generate the Password:
1. **Select app**: Choose **"Other (Custom name)"**
2. **Enter name**: Type `Traditional Alley OTP`
3. **Click "Generate"**
4. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

⚠️ **Important**: Copy this password immediately - you won't see it again!

---

## Step 3: Update Your .env File

Open your `.env` file in the `traditionalalley` folder and update these values:

```env
# Email Configuration for OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-gmail@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Traditional Alley <your-actual-gmail@gmail.com>
```

### Example with Real Values:
```env
# Email Configuration for OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=traditionalalley@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Traditional Alley <traditionalalley@gmail.com>
```

⚠️ **Important Notes**:
- Remove ALL spaces from the app password (use `abcdefghijklmnop`, not `abcd efgh ijkl mnop`)
- Use your ACTUAL Gmail address
- Use the app password, NOT your regular Gmail password

---

## Step 4: Test the Configuration

1. **Save your .env file**
2. **Restart your development server**:
   ```bash
   npm run dev
   ```
3. **Try registering a new user** on your website
4. **Check your email** for the OTP code!

---

## 🔧 Troubleshooting

### Problem: "Invalid login credentials"
- ✅ Make sure 2-Factor Authentication is enabled
- ✅ Use the app password, not your regular password
- ✅ Remove all spaces from the app password
- ✅ Restart your server after changing .env

### Problem: "App passwords option not showing"
- ✅ Ensure 2-Factor Authentication is fully set up
- ✅ Wait a few minutes after enabling 2FA
- ✅ Try the direct link: https://myaccount.google.com/apppasswords

### Problem: "Email not received"
- ✅ Check your spam/junk folder
- ✅ Try a different email address for testing
- ✅ Check the server console for error messages

### Problem: "Connection timeout"
- ✅ Check your internet connection
- ✅ Try using port 465 with secure: true
- ✅ Disable antivirus/firewall temporarily

---

## 🎯 Alternative Configuration (if port 587 doesn't work)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-actual-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Traditional Alley <your-actual-gmail@gmail.com>
```

---

## 📊 Gmail Limits

- **Daily limit**: 500 emails per day
- **Rate limit**: 100 emails per hour
- **Perfect for**: Development and small-scale production

For higher volume, consider:
- SendGrid (12,000 emails/month free)
- Mailgun (5,000 emails/month free)
- Amazon SES (pay-as-you-go)

---

## ✅ Success Checklist

- [ ] 2-Factor Authentication enabled
- [ ] App password generated and copied
- [ ] .env file updated with correct credentials
- [ ] Server restarted
- [ ] Test registration completed
- [ ] OTP email received

---

## 🆘 Still Need Help?

If you're still having issues:

1. **Check the server console** for detailed error messages
2. **Try a different Gmail account** for testing
3. **Use the alternative port configuration** above
4. **Contact me** with the specific error messages you're seeing

The OTP system should now work perfectly! 🎉 