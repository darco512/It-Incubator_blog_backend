# Gmail SMTP Configuration Guide for Production

## ⚠️ The Problem on Render.com

When using Gmail SMTP on Render, you get `Connection timeout` errors because:
1. Gmail blocks regular passwords for security
2. Network/firewall restrictions on cloud hosting
3. Gmail rate limits rapid SMTP connections

## ✅ Solution: Gmail App Password (REQUIRED for Production)

Gmail requires **App Passwords** for SMTP access, NOT your regular Gmail password.

## 🔧 Setup Instructions for Gmail

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup wizard to enable 2FA (required for App Passwords)

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Or: Google Account → Security → 2-Step Verification → App passwords (at bottom)
3. Select app: **Mail**
4. Select device: **Other** (enter "Render Backend")
5. Click **Generate**
6. Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

#### Local Development (.env file):
```env
EMAIL_FROM=darcohaha@gmail.com
EMAIL_FROM_PASSWORD=abcdefghijklmnop
```
*(Use your 16-character App Password without spaces)*

#### Production (Render Dashboard):
Add these environment variables in Render:
```
EMAIL_FROM=darcohaha@gmail.com
EMAIL_FROM_PASSWORD=abcdefghijklmnop
```

## 🚀 Deploy to Render

1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add variables:
   - `EMAIL_FROM`: `darcohaha@gmail.com`
   - `EMAIL_FROM_PASSWORD`: `your-16-char-app-password`
5. Click "Save Changes"
6. Render will automatically redeploy

## 📊 How the Updated Code Works

The improved `email-adapter.ts` now:
1. ✅ Uses explicit Gmail SMTP settings (`smtp.gmail.com:587`)
2. ✅ Implements **60-second timeouts** (production-grade)
3. ✅ **Verifies connection** before sending (catches auth errors early)
4. ✅ Uses STARTTLS for secure connections
5. ✅ Provides detailed error logging
6. ✅ Supports Gmail App Passwords

## Testing

### Local Test:
```bash
yarn jest __tests__/service_tests/auth-service_db.test.ts
```

### Production Test (after deploying):
```bash
curl -X POST https://your-app.onrender.com/auth/registration \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","email":"test@example.com","password":"pass123"}'
```

Check the Render logs to see if email was sent successfully.

## 🐛 Troubleshooting

### Error: "Connection timeout"
**Cause:** Network/firewall blocking or wrong credentials

**Solutions:**
1. ✅ Verify you're using **App Password**, NOT regular password
2. ✅ Check Render logs for specific error messages
3. ✅ Try removing spaces from App Password
4. ✅ Regenerate App Password if older than 6 months

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. Generate new App Password at https://myaccount.google.com/apppasswords
2. Update `EMAIL_FROM_PASSWORD` in Render environment
3. Redeploy

### Error: "Connection verification failed"
**Cause:** 2FA not enabled or App Password not generated

**Solution:**
1. Enable 2-Factor Authentication first
2. Then generate App Password
3. Wait 5-10 minutes for Google to sync

### Emails sending locally but not on Render
**Cause:** Environment variable mismatch

**Check:**
```bash
# In Render logs, you should see:
=== EMAIL SENDING START ===
EMAIL_FROM: darcohaha@gmail.com
Verifying SMTP connection...
✅ SMTP connection verified
```

If you see "EMAIL_FROM: undefined", your env vars aren't set correctly.

### Emails not arriving in inbox
- ✅ Check Gmail "Sent" folder (it should appear there)
- ✅ Check recipient's spam folder
- ✅ Wait 1-2 minutes (Gmail can delay delivery)
- ✅ Check Gmail's sending limits (500 emails/day for free accounts)

## ✅ Why This Fixed Your Timeout Issue

The updated code:
1. ✅ Uses **explicit Gmail SMTP host** (`smtp.gmail.com:587`)
2. ✅ Implements **60-second timeouts** (was 10-15 seconds)
3. ✅ **Verifies connection** before attempting to send
4. ✅ **Awaits** email sending (IT Incubator test can verify via IMAP)
5. ✅ Provides detailed error logs for debugging
6. ✅ Supports Gmail App Passwords properly

## 🎯 Quick Test

After deploying to Render, test with curl:

```bash
curl -X POST https://your-app.onrender.com/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser123",
    "email": "darcohaha@gmail.com",
    "password": "test123"
  }'
```

Check Render logs for:
```
✅ SMTP connection verified
✅ Email sent successfully!
```

If you see those, Gmail is working! 🎉
