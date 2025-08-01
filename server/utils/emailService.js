const nodemailer = require('nodemailer');

// Email configuration
const createTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate random credentials
const generateCredentials = () => {
  const loginId = 'VEN' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const password = Math.random().toString(36).substr(2, 12);
  return { loginId, password };
};

// Send approval email with credentials
const sendApprovalEmail = async (vendorEmail, vendorName, credentials) => {
  try {
    const transporter = createTransport();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendorEmail,
      subject: 'Vendor Application Approved - Airport Vendor Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Congratulations! Your Vendor Application is Approved</h2>
          
          <p>Dear ${vendorName},</p>
          
          <p>We are pleased to inform you that your vendor application has been approved by our admin team.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Login ID:</strong> ${credentials.loginId}</p>
            <p><strong>Password:</strong> ${credentials.password}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Visit our vendor portal</li>
            <li>Use the credentials above to complete your registration</li>
            <li>Set up your shop and start managing your business</li>
          </ol>
          
          <p style="color: #dc2626;"><strong>Important:</strong> Please keep these credentials secure and change your password after first login.</p>
          
          <p>Welcome to the Airport Vendor Management System!</p>
          
          <p>Best regards,<br>Admin Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully to:', vendorEmail);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

// Send rejection email
const sendRejectionEmail = async (vendorEmail, vendorName, reason) => {
  try {
    const transporter = createTransport();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendorEmail,
      subject: 'Vendor Application Status - Airport Vendor Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Vendor Application Update</h2>
          
          <p>Dear ${vendorName},</p>
          
          <p>Thank you for your interest in becoming a vendor with our Airport Vendor Management System.</p>
          
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p>You are welcome to reapply in the future. Please ensure all requirements are met before resubmitting.</p>
          
          <p>Thank you for your understanding.</p>
          
          <p>Best regards,<br>Admin Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully to:', vendorEmail);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

module.exports = {
  generateCredentials,
  sendApprovalEmail,
  sendRejectionEmail
};
