const cron = require('node-cron');
const db = require('../config/db');
const mailerService = require('../services/mailer.service');

const sendEventReminders = async () => {
  console.log('[Cron] Running scheduled job: sendEventReminders');
  try {
    // Find events that are 'upcoming' and happening within the next 24 hours
    const queryEvents = `
      SELECT id, title, event_date, location_type, location_address 
      FROM events 
      WHERE status = 'upcoming' 
        AND event_date > NOW() 
        AND event_date <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
    `;
    const [events] = await db.query(queryEvents);
    
    if (events.length === 0) {
      console.log('[Cron] No events starting within 24 hours.');
      return;
    }

    for (const event of events) {
      // Get all registrations for this event where a reminder hasn't been sent yet
      const queryRegs = `
        SELECT id, attendee_name, attendee_email 
        FROM event_registrations 
        WHERE event_id = ? AND reminder_sent = 0
      `;
      const [registrations] = await db.query(queryRegs, [event.id]);

      if (registrations.length === 0) continue;

      console.log(`[Cron] Sending reminders for event: ${event.title} (${registrations.length} attendees)`);
      
      for (const reg of registrations) {
        if (!reg.attendee_email) continue;

        try {
          // Send reminder email
          await mailerService.sendEventReminderEmail(reg.attendee_email, event);
          
          // Mark reminder as sent
          await db.query(`UPDATE event_registrations SET reminder_sent = 1 WHERE id = ?`, [reg.id]);
        } catch (emailErr) {
          console.error(`[Cron] Error sending reminder to ${reg.attendee_email}:`, emailErr);
        }
      }
    }
    console.log('[Cron] sendEventReminders job completed successfully.');
  } catch (error) {
    console.error('[Cron] Error in sendEventReminders job:', error);
  }
};

// Schedule the job to run every hour
const initCronJobs = () => {
  cron.schedule('0 * * * *', sendEventReminders);
  console.log('[Cron] Event reminder job scheduled (runs every hour).');
};

module.exports = {
  initCronJobs,
  sendEventReminders // Exported for manual testing if needed
};
