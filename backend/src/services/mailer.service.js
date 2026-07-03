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

module.exports = {
  transporter,
  sendEventRegistrationEmail,
  sendEventReminderEmail,
};
