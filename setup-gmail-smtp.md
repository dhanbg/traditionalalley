# Gmail SMTP Setup for OTP

## Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process

## Step 2: Generate App Password
1. In the same Security section, click **2-Step Verification**
2. Scroll down to **App passwords**
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Enter: `Traditional Alley OTP`
6. Click **GENERATE**
7. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

## Step 3: Update .env File
Replace these values in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=Traditional Alley <your-actual-gmail@gmail.com>
```

## Step 4: Test the Configuration
Restart your development server and try registering a new user!

## Example Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=traditionalalley@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=Traditional Alley <traditionalalley@gmail.com>
```

## Troubleshooting
- Make sure 2FA is enabled
- Use the app password, not your regular Gmail password
- Check spam folder for OTP emails
- Restart your Next.js server after changing .env 