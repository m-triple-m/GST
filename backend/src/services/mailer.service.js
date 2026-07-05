const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create a transporter using SMTP configuration from environment variables
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  // If port is 465, secure is true, otherwise false. Ethereal usually uses 587.
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

/**
 * Send Event Registration Confirmation Email
 * @param {string} toEmail - Recipient email
 * @param {object} event - Event details
 * @param {object} registration - Registration details
 */
const sendEventRegistrationEmail = async (toEmail, event, registration) => {
  try {
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to: toEmail,
      subject: `Registration Confirmed: ${event.title}`,
      text: `Hello,

Your registration for "${event.title}" has been confirmed!

Event Details:
- Date: ${new Date(event.event_date).toLocaleDateString()}
- Location: ${event.location_type === 'online' ? 'Online' : event.location_address || 'TBD'}
- Attendee Type: ${registration.attendee_type}

Thank you for registering.

Best regards,
Geophysical Society of Tulsa`,
      html: `<p>Hello,</p>
<p>Your registration for <strong>${event.title}</strong> has been confirmed!</p>
<h3>Event Details:</h3>
<ul>
  <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</li>
  <li><strong>Location:</strong> ${event.location_type === 'online' ? 'Online' : event.location_address || 'TBD'}</li>
  <li><strong>Attendee Type:</strong> ${registration.attendee_type}</li>
</ul>
<p>Thank you for registering.</p>
<p>Best regards,<br/>Geophysical Society of Tulsa</p>`,
    });
    console.log(`Registration email sent to ${toEmail}. Message ID: ${info.messageId}`);
    // If using Ethereal in dev, print the test URL
    if (env.smtp.host && env.smtp.host.includes('ethereal.email')) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`Failed to send registration email to ${toEmail}:`, error);
  }
};

/**
 * Send Event Reminder Email
 * @param {string} toEmail - Recipient email
 * @param {object} event - Event details
 */
const sendEventReminderEmail = async (toEmail, event) => {
  try {
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to: toEmail,
      subject: `Reminder: Upcoming Event "${event.title}"`,
      text: `Hello,

This is a reminder that the event "${event.title}" is coming up soon!

Event Details:
- Date: ${new Date(event.event_date).toLocaleDateString()}
- Location: ${event.location_type === 'online' ? 'Online' : event.location_address || 'TBD'}

We look forward to seeing you there!

Best regards,
Geophysical Society of Tulsa`,
      html: `<p>Hello,</p>
<p>This is a reminder that the event <strong>${event.title}</strong> is coming up soon!</p>
<h3>Event Details:</h3>
<ul>
  <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</li>
  <li><strong>Location:</strong> ${event.location_type === 'online' ? 'Online' : event.location_address || 'TBD'}</li>
</ul>
<p>We look forward to seeing you there!</p>
<p>Best regards,<br/>Geophysical Society of Tulsa</p>`,
    });
    console.log(`Reminder email sent to ${toEmail}. Message ID: ${info.messageId}`);
    if (env.smtp.host && env.smtp.host.includes('ethereal.email')) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`Failed to send reminder email to ${toEmail}:`, error);
  }
};

/**
 * Send Password Reset OTP Email
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - The 6-digit OTP code
 */
const sendPasswordResetOtpEmail = async (toEmail, otpCode) => {
  try {
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to: toEmail,
      subject: 'Your GST Password Reset OTP',
      text: `Hello,

You requested a password reset for your GST Member Portal account.

Your One-Time Password (OTP) is: ${otpCode}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you did not request a password reset, please ignore this email.

Best regards,
Geophysical Society of Tulsa`,
      html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden;">
  <div style="background:#008080;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;color:#fff;">Password Reset</h1>
    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Geophysical Society of Tulsa</p>
  </div>
  <div style="padding:32px;">
    <p style="margin:0 0 16px;">Hello,</p>
    <p style="margin:0 0 24px;">You requested a password reset for your GST Member Portal account. Use the OTP below to proceed:</p>
    <div style="background:#1e293b;border:2px dashed #008080;border-radius:12px;text-align:center;padding:24px;margin:0 0 24px;">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00c0c0;font-family:monospace;">${otpCode}</span>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">⏱ This OTP expires in <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
    <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">🔒 Do not share this code with anyone.</p>
    <p style="margin:0;font-size:12px;color:#64748b;">If you did not request a password reset, simply ignore this email — your account remains secure.</p>
  </div>
</div>`,
    });
    console.log(`Password reset OTP sent to ${toEmail}. Message ID: ${info.messageId}`);
    if (env.smtp.host && env.smtp.host.includes('ethereal.email')) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`Failed to send OTP email to ${toEmail}:`, error);
  }
};

module.exports = {
  transporter,
  sendEventRegistrationEmail,
  sendEventReminderEmail,
  sendPasswordResetOtpEmail,
};
