import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const otpEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StreamVault Password Reset</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f9f9f9;
      padding: 20px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #e53e3e 0%, #dc2626 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .logo img {
      height: 32px;
      display: inline-block;
      filter: brightness(0) invert(1);
    }
    .content {
      padding: 40px 40px 32px 40px;
    }
    h1 {
      color: #0f0f0f;
      font-size: 28px;
      font-weight: 500;
      margin: 0 0 24px 0;
      line-height: 1.3;
    }
    .greeting {
      color: #0f0f0f;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    p {
      color: #606060;
      font-size: 14px;
      line-height: 22px;
      margin: 0 0 16px 0;
    }
    .code-section {
      background: linear-gradient(135deg, #e53e3e 0%, #dc2626 100%);
      border-radius: 12px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.25);
    }
    .code-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code {
      background-color: #ffffff;
      display: inline-block;
      padding: 20px 40px;
      border-radius: 8px;
      font-family: 'Roboto Mono', 'Courier New', monospace;
      font-size: 36px;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 10px;
      margin: 8px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .code-note {
      color: rgba(255, 255, 255, 0.95);
      font-size: 13px;
      margin-top: 12px;
      font-weight: 400;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .alert-box p {
      color: #856404;
      font-size: 13px;
      margin: 0;
      line-height: 20px;
    }
    .alert-box strong {
      color: #533f03;
    }
    .info-box {
      background-color: #e8f4fd;
      border-left: 4px solid #1a73e8;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      color: #174ea6;
      font-size: 13px;
      margin: 0;
      line-height: 20px;
    }
    .info-box strong {
      color: #0d3c7c;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #e53e3e 0%, #dc2626 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      margin: 16px 0;
      box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e0e0e0, transparent);
      margin: 32px 0;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 32px 40px;
      text-align: center;
    }
    .footer-logo {
      margin-bottom: 16px;
    }
    .footer-logo img {
      height: 24px;
      opacity: 0.7;
    }
    .footer p {
      color: #606060;
      font-size: 12px;
      line-height: 18px;
      margin: 8px 0;
    }
    .footer-links {
      margin: 16px 0 8px 0;
    }
    .footer-links a {
      color: #dc2626;
      font-size: 12px;
      text-decoration: none;
      margin: 0 12px;
      font-weight: 500;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .social-icons {
      margin: 16px 0;
    }
    .social-icons a {
      display: inline-block;
      margin: 0 8px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .social-icons a:hover {
      opacity: 1;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 32px 24px;
      }
      .header {
        padding: 24px 24px;
      }
      .footer {
        padding: 24px 24px;
      }
      .code {
        font-size: 30px;
        letter-spacing: 8px;
        padding: 16px 32px;
      }
      .code-section {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <div class="container">
            <div class="header">
              <div class="logo">
                <h2 style="color: white; margin: 0;">StreamVault</h2>
              </div>
            </div>
            
            <div class="content">
              <h1>🔐 Password Reset Request</h1>
              
              <p class="greeting">Hi ${name},</p>
              
              <p>
                We received a request to reset the password for your StreamVault account. 
                To keep your account secure, please use the verification code below to proceed.
              </p>
              
              <div class="code-section">
                <div class="code-label">Your Verification Code</div>
                <div class="code">${otp}</div>
                <div class="code-note">⏱ Expires in 10 minutes</div>
              </div>
              
              <div class="info-box">
                <p>
                  <strong>✓ Didn't request this?</strong><br>
                  No worries! If you didn't request a password reset, you can safely ignore 
                  this email. Your account remains secure and no changes will be made.
                </p>
              </div>
              
              <div class="alert-box">
                <p>
                  <strong>⚠ Security Alert:</strong><br>
                  Never share this verification code with anyone—not even someone claiming 
                  to be from StreamVault. Our team will never ask you for this code 
                  via email, phone, or social media.
                </p>
              </div>
              
              <div class="divider"></div>
            </div>
            
            <div class="footer">
              <div class="footer-logo">
                <h3 style="color: #606060; margin: 0;">StreamVault</h3>
              </div>
              
              <p style="font-size: 15px; color: #909090; margin-top: 12px;">
                You're receiving this email because a password reset was requested for your account.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const sendOtpEmail = async ({ to, name }) => {
    const otp = generateOTP();

    await transporter.sendMail({
        from: `"StreamVault Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Password Reset OTP",
        html: otpEmailTemplate(name, otp)
    });
    return otp;
};
