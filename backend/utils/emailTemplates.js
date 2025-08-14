// Email Templates
const emailTemplates = {
  // Email Verification Template
  emailVerification: (name, verificationLink, verificationCode) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification - Faculty Evaluation Management System</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .code { background: #e9ecef; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; }
            .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 Email Verification Required</h1>
                <p>Faculty Evaluation Management System</p>
            </div>
            <div class="content">
                <h2>Hello ${name}! 👋</h2>
                <p>Thank you for registering with our Faculty Evaluation Management System. To complete your registration and ensure account security, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" class="button">✅ Verify Email Address</a>
                </div>
                
                <p><strong>Alternative Verification:</strong></p>
                <p>If the button doesn't work, copy and paste this verification code in the verification page:</p>
                <div class="code">${verificationCode}</div>
                
                <p><strong>Important Notes:</strong></p>
                <ul>
                    <li>🔒 This verification link expires in 24 hours</li>
                    <li>📱 You cannot login until your email is verified</li>
                    <li>🚫 If you didn't create this account, please ignore this email</li>
                </ul>
                
                <p>If you're having trouble with the verification, please contact our support team.</p>
            </div>
            <div class="footer">
                <p>© 2025 Faculty Evaluation Management System</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `,

  // Faculty Approval Notification
  facultyApproval: (name, status, reason = null) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Account ${status === 'approved' ? 'Approved' : 'Update'} - FEMS</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${status === 'approved' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${status === 'approved' ? '🎉 Account Approved!' : '❌ Account Update'}</h1>
                <p>Faculty Evaluation Management System</p>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                
                ${status === 'approved' ? `
                    <div class="success">
                        <h3>✅ Congratulations! Your faculty account has been approved.</h3>
                        <p>You can now access the Faculty Dashboard and all system features.</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/facultylogin" class="button">🚀 Login to Dashboard</a>
                    </div>
                ` : `
                    <div class="error">
                        <h3>❌ Your faculty account registration has been ${status}.</h3>
                        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                    </div>
                    <p>If you believe this is an error or would like to discuss this decision, please contact our administrative team.</p>
                `}
                
                <p><strong>Account Details:</strong></p>
                <ul>
                    <li>📧 Email: Your registered email</li>
                    <li>👤 Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
                    <li>📅 Updated: ${new Date().toLocaleDateString()}</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2025 Faculty Evaluation Management System</p>
                <p>Need help? Contact us at support@fems.edu</p>
            </div>
        </div>
    </body>
    </html>
  `,

  // Admin Notification for New Registration
  adminNewRegistration: (userType, name, email, department) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>New ${userType} Registration - FEMS Admin</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 New ${userType} Registration</h1>
                <p>FEMS Admin Notification</p>
            </div>
            <div class="content">
                <h2>New Registration Alert!</h2>
                <p>A new ${userType.toLowerCase()} has registered and is awaiting approval.</p>
                
                <div class="info">
                    <h3>👤 Registration Details:</h3>
                    <ul>
                        <li><strong>Name:</strong> ${name}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Department:</strong> ${department}</li>
                        <li><strong>Role:</strong> ${userType}</li>
                        <li><strong>Registration Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/adminlogin" class="button">📋 Review Registration</a>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>🔍 Review the registration details in admin dashboard</li>
                    <li>✅ Approve or reject the application</li>
                    <li>📧 Notification will be sent to the user automatically</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2025 Faculty Evaluation Management System</p>
                <p>Admin Panel - This is an automated notification</p>
            </div>
        </div>
    </body>
    </html>
  `,

  // Welcome Email After Approval
  welcomeEmail: (name, role, dashboardLink) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to FEMS - ${name}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007bff 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .welcome { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .features { background: white; border: 1px solid #dee2e6; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to FEMS!</h1>
                <p>Faculty Evaluation Management System</p>
            </div>
            <div class="content">
                <div class="welcome">
                    <h2>Hello ${name}! 👋</h2>
                    <p>Welcome to the Faculty Evaluation Management System. Your account has been approved and you're all set to get started!</p>
                </div>
                
                <div class="features">
                    <h3>🚀 What you can do now:</h3>
                    ${role === 'Faculty' ? `
                        <ul>
                            <li>📊 View your performance analytics and ratings</li>
                            <li>📈 Track student feedback and reviews</li>
                            <li>👤 Manage your profile and information</li>
                            <li>📚 Access department-wise performance data</li>
                            <li>🔔 Receive real-time notifications</li>
                        </ul>
                    ` : `
                        <ul>
                            <li>✍️ Submit reviews and ratings for faculty</li>
                            <li>🔍 Browse faculty by departments</li>
                            <li>📝 Provide detailed feedback and suggestions</li>
                            <li>👤 Manage your student profile</li>
                            <li>📊 View your submission history</li>
                        </ul>
                    `}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardLink}" class="button">🚀 Access Your Dashboard</a>
                </div>
                
                <p><strong>Getting Started Tips:</strong></p>
                <ul>
                    <li>🔑 Keep your login credentials secure</li>
                    <li>👤 Complete your profile information</li>
                    <li>🔔 Enable notifications for important updates</li>
                    <li>❓ Contact support if you need any assistance</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2025 Faculty Evaluation Management System</p>
                <p>Need help? Contact us at support@fems.edu</p>
            </div>
        </div>
    </body>
    </html>
  `
};

module.exports = emailTemplates;
