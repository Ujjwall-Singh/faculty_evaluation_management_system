const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');

class EmailService {
  constructor() {
    // Check if email credentials are provided
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      console.log('⚠️  Email service not configured - running without email functionality');
      console.log('ℹ️  To enable emails, set EMAIL_USER and EMAIL_PASSWORD in .env file');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    if (!this.transporter) {
      console.log('📧 Email service disabled - no credentials provided');
      return;
    }
    
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      console.log('📧 Gmail App Password Setup Instructions:');
      console.log('   1. Go to Google Account Settings');
      console.log('   2. Enable 2-Factor Authentication');
      console.log('   3. Generate App Password for "Mail"');
      console.log('   4. Use the App Password (not your regular password)');
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.log('⚠️  Email not sent - service not configured:', { to, subject });
      return { success: false, error: 'Email service not configured' };
    }
    
    try {
      const mailOptions = {
        from: {
          name: 'FEMS - Faculty Evaluation System',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: html,
        // Add some headers for better deliverability
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'FEMS Email Service'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', {
        to: to,
        subject: subject,
        messageId: info.messageId
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send email verification
  async sendEmailVerification(email, name, verificationToken, verificationCode) {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const html = emailTemplates.emailVerification(name, verificationLink, verificationCode);
    
    return await this.sendEmail(
      email,
      '📧 Please Verify Your Email Address - FEMS',
      html
    );
  }

  // Send faculty approval/rejection notification
  async sendFacultyApprovalNotification(email, name, status, reason = null) {
    const html = emailTemplates.facultyApproval(name, status, reason);
    
    const subject = status === 'approved' 
      ? '🎉 Your FEMS Account Has Been Approved!'
      : '📋 Update on Your FEMS Account Application';
    
    return await this.sendEmail(email, subject, html);
  }

  // Send admin notification for new registration
  async sendAdminNewRegistrationAlert(adminEmail, userType, name, email, department) {
    const html = emailTemplates.adminNewRegistration(userType, name, email, department);
    
    return await this.sendEmail(
      adminEmail,
      `🔔 New ${userType} Registration Pending Approval - FEMS`,
      html
    );
  }

  // Send welcome email after approval
  async sendWelcomeEmail(email, name, role) {
    const dashboardLink = role === 'Faculty' 
      ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/facultylogin`
      : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/studentlogin`;
    
    const html = emailTemplates.welcomeEmail(name, role, dashboardLink);
    
    return await this.sendEmail(
      email,
      '🎉 Welcome to FEMS - Your Account is Ready!',
      html
    );
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Password Reset - FEMS</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🔐 Password Reset Request</h1>
                  <p>Faculty Evaluation Management System</p>
              </div>
              <div class="content">
                  <h2>Hello ${name}!</h2>
                  <p>We received a request to reset your password for your FEMS account.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetLink}" class="button">🔑 Reset Password</a>
                  </div>
                  
                  <div class="warning">
                      <h3>⚠️ Important Security Information:</h3>
                      <ul>
                          <li>This link expires in 1 hour</li>
                          <li>If you didn't request this reset, please ignore this email</li>
                          <li>Your password will remain unchanged if you don't click the link</li>
                      </ul>
                  </div>
                  
                  <p>For security reasons, this link can only be used once and expires after 1 hour.</p>
              </div>
              <div class="footer">
                  <p>© 2025 Faculty Evaluation Management System</p>
                  <p>If you didn't request this, please contact support immediately</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(
      email,
      '🔐 Password Reset Request - FEMS',
      html
    );
  }

  // Send bulk notification to users
  async sendBulkNotification(emails, subject, message, type = 'info') {
    const results = [];
    
    for (const email of emails) {
      try {
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <title>${subject}</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#007bff'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                  .message { background: white; border: 1px solid #dee2e6; padding: 20px; border-radius: 5px; margin: 20px 0; }
                  .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>📢 System Notification</h1>
                      <p>Faculty Evaluation Management System</p>
                  </div>
                  <div class="content">
                      <div class="message">
                          <h3>${subject}</h3>
                          <p>${message}</p>
                      </div>
                      <p>This is an automated notification from the FEMS system.</p>
                  </div>
                  <div class="footer">
                      <p>© 2025 Faculty Evaluation Management System</p>
                      <p>This is an automated email. Please do not reply.</p>
                  </div>
              </div>
          </body>
          </html>
        `;
        
        const result = await this.sendEmail(email, subject, html);
        results.push({ email, success: result.success });
      } catch (error) {
        results.push({ email, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Export singleton instance
module.exports = new EmailService();
