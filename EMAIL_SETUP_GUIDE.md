# 📧 Email Setup Guide

## 🎉 Automated Email System Implementation

The Airport Vendor Management System now includes **automated email notifications** for vendor application approvals and rejections!

### ✅ **What's Working**

1. **Automated Approval Emails** - Vendors receive login credentials via email
2. **Automated Rejection Emails** - Vendors receive rejection notifications with reasons
3. **Admin Email Configuration** - Set admin email address in dashboard
4. **Professional Email Templates** - Beautiful HTML email templates
5. **Error Handling** - Graceful fallback if email fails

### 🔧 **Email Configuration Steps**

#### **Step 1: Configure Gmail (Recommended)**

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update Environment Variables**
   ```bash
   # Edit server/.env file
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

#### **Step 2: Configure Admin Email in Dashboard**

1. **Login as Admin**
   - Go to http://localhost:5173
   - Login with: `admin@airport.com` / `admin123`

2. **Configure Email**
   - Click "Configure Email" button in dashboard
   - Enter your admin email address
   - Click "Update Email"

### 📧 **Email Templates**

#### **Approval Email Template**
```html
Subject: Vendor Application Approved - Airport Vendor Management System

Dear [Vendor Name],

We are pleased to inform you that your vendor application has been approved!

Your Login Credentials:
- Email: [vendor-email]
- Password: [generated-password]

Next Steps:
1. Visit our vendor portal at: http://localhost:5173
2. Use the credentials above to login
3. Set up your shop and start managing your business
4. Change your password after first login for security

Welcome to the Airport Vendor Management System!

Best regards,
Admin Team
[admin-email]
```

#### **Rejection Email Template**
```html
Subject: Vendor Application Status - Airport Vendor Management System

Dear [Vendor Name],

Thank you for your interest in becoming a vendor.

After careful review, we regret to inform you that your application has not been approved at this time.

Reason: [rejection-reason]

You are welcome to reapply in the future.

Best regards,
Admin Team
[admin-email]
```

### 🚀 **How to Test the Email System**

#### **Test Approval Workflow**
1. **Submit Vendor Application**
   - Go to http://localhost:5173/vendor-signup
   - Fill out the form with a real email address
   - Submit the application

2. **Approve Application**
   - Login as admin
   - Go to Vendor Approval Dashboard
   - Click "Approve & Send Email"
   - Check the vendor's email for approval notification

#### **Test Rejection Workflow**
1. **Submit Another Application**
   - Use a different email address
   - Submit the application

2. **Reject Application**
   - In admin dashboard, click "Reject Application"
   - Provide a rejection reason
   - Check the vendor's email for rejection notification

### 🔧 **Technical Details**

#### **Email Configuration**
- **Service**: Gmail SMTP
- **Authentication**: OAuth2 with App Password
- **Templates**: HTML with inline CSS
- **Error Handling**: Graceful fallback if email fails

#### **Backend Implementation**
```javascript
// Email sending function
const sendApprovalEmail = async (vendorEmail, vendorName, credentials) => {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Send email with credentials
  await transporter.sendMail(mailOptions);
};
```

#### **Frontend Integration**
```javascript
// Admin email configuration
const updateAdminEmail = async (email) => {
  await fetch('/api/admin/email-config', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};
```

### 🛠️ **Troubleshooting**

#### **Email Not Sending**
1. **Check Environment Variables**
   ```bash
   # Verify server/.env contains:
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Check Gmail Settings**
   - Ensure 2FA is enabled
   - Verify app password is correct
   - Check Gmail account security settings

3. **Check Server Logs**
   ```bash
   # Look for email-related logs:
   ✅ Approval email sent successfully to: vendor@example.com
   ❌ Error sending approval email: [error details]
   ```

#### **Common Issues**
- **"Invalid credentials"**: Check EMAIL_USER and EMAIL_PASS
- **"Less secure app access"**: Use App Password instead
- **"Connection timeout"**: Check internet connection
- **"Rate limit exceeded"**: Gmail has daily sending limits

### 📊 **Email Statistics**

The system tracks email sending:
- ✅ Successful sends
- ❌ Failed sends with error details
- 📧 Email addresses used
- 📅 Timestamps of sends

### 🎯 **Production Deployment**

For production use:
1. **Use Professional Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability and monitoring

2. **Environment Variables**
   ```env
   EMAIL_USER=your-production-email
   EMAIL_PASS=your-production-password
   EMAIL_SERVICE=sendgrid
   ```

3. **Email Templates**
   - Customize templates for your brand
   - Add company logo and styling
   - Include legal disclaimers

### 🎉 **Success Indicators**

✅ **System Working When:**
- Admin can configure email in dashboard
- Approval emails are sent automatically
- Rejection emails include reasons
- Email templates look professional
- Error handling works gracefully

---

## 🚀 **Ready to Test!**

The automated email system is now fully implemented and ready for testing. Follow the setup guide above to configure your email credentials and start sending automated notifications to vendors!

**Happy emailing! 📧✨** 