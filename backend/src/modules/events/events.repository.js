'use strict';
const db = require('../../config/db');

// ── List / Count ─────────────────────────────────────────

const countEvents = async ({ search, status, category, type }) => {
  let sql = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
  const params = [];
  if (search)   { sql += ' AND MATCH(title,description,speaker_name,category) AGAINST(? IN BOOLEAN MODE)'; params.push(`${search}*`); }
  
  if (status) {
    if (status === 'past') {
      sql += " AND (status = 'past' OR (status = 'upcoming' AND event_date < CURRENT_DATE()))";
    } else if (status === 'upcoming') {
      sql += " AND status = 'upcoming' AND event_date >= CURRENT_DATE()";
    } else {
      sql += ' AND status = ?';
      params.push(status);
    }
  }
  
  if (category) { sql += ' AND category = ?';  params.push(category); }
  if (type)     { sql += ' AND event_type = ?'; params.push(type); }
  const [rows] = await db.execute(sql, params);
  return rows[0].total;
};

const listEvents = async ({ search, status, category, type, sort, order, limit, offset }) => {
  const allowedSort  = ['event_date', 'title', 'created_at'];
  const sortCol = allowedSort.includes(sort) ? sort : 'event_date';
  const sortDir = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let sql = `SELECT id, title, event_type, category, description, speaker_name, speaker_org,
                    event_date, start_time, end_time, duration_minutes, rsvp_deadline,
                    location_name, location_address,
                    location_type, capacity, 
                    CASE
                      WHEN status = 'upcoming' AND event_date < CURRENT_DATE() THEN 'past'
                      ELSE status
                    END as status, 
                    featured, color, banner_url, register_url
             FROM events WHERE 1=1`;
  const params = [];

  if (search)   { sql += ' AND MATCH(title,description,speaker_name,category) AGAINST(? IN BOOLEAN MODE)'; params.push(`${search}*`); }
  
  if (status) {
    if (status === 'past') {
      sql += " AND (status = 'past' OR (status = 'upcoming' AND event_date < CURRENT_DATE()))";
    } else if (status === 'upcoming') {
      sql += " AND status = 'upcoming' AND event_date >= CURRENT_DATE()";
    } else {
      sql += ' AND status = ?';
      params.push(status);
    }
  }
  
  if (category) { sql += ' AND category = ?';   params.push(category); }
  if (type)     { sql += ' AND event_type = ?'; params.push(type); }

  sql += ` ORDER BY ${sortCol} ${sortDir} LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

  const [rows] = await db.execute(sql, params);
  return rows;
};

// ── Single Event ─────────────────────────────────────────

const getEventById = async (id) => {
  const [events] = await db.execute('SELECT * FROM events WHERE id = ?', [id]);
  if (!events[0]) return null;

  const event = events[0];
  const eventDateStr = event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : null;
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (event.status === 'upcoming' && eventDateStr && eventDateStr < todayStr) {
    event.status = 'past';
  }

  const [gallery] = await db.execute(
    'SELECT image_url FROM event_gallery WHERE event_id = ? ORDER BY sort_order', [id]
  );
  const [keynotes] = await db.execute(
    'SELECT keynote FROM event_keynotes WHERE event_id = ? ORDER BY sort_order', [id]
  );

  return {
    ...event,
    gallery:  gallery.map(g => g.image_url),
    keynotes: keynotes.map(k => k.keynote),
  };
};

// ── Create / Update / Delete ─────────────────────────────

const createEvent = async (data, userId) => {
  const {
    title, event_type, category, description, detailed_summary,
    speaker_name, speaker_org, event_date, start_time, end_time,
    duration_minutes,
    rsvp_deadline, location_name, location_address, location_type,
    location_url, capacity, register_url, status, featured, color,
    banner_url, video_url, gallery = [], keynotes = [],
  } = data;

  // Auto-compute end_time from start_time + duration if end_time not supplied
  let resolvedEndTime = end_time || null;
  if (!resolvedEndTime && start_time && duration_minutes) {
    const [h, m] = start_time.split(':').map(Number);
    const totalMin = h * 60 + m + Number(duration_minutes);
    resolvedEndTime = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }

  const [result] = await db.execute(
    `INSERT INTO events
     (title, event_type, category, description, detailed_summary,
      speaker_name, speaker_org, event_date, start_time, end_time, duration_minutes,
      rsvp_deadline, location_name, location_address, location_type, location_url,
      capacity, register_url, status, featured, color, banner_url, video_url, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, event_type, category||null, description||null, detailed_summary||null,
     speaker_name||null, speaker_org||null, event_date, start_time||null, resolvedEndTime,
     duration_minutes ? Number(duration_minutes) : null,
     rsvp_deadline||null, location_name||null, location_address||null,
     location_type||'physical', location_url||null, capacity||0,
     register_url||null, status||'upcoming', featured?1:0, color||'teal',
     banner_url||null, video_url||null, userId]
  );

  const eventId = result.insertId;

  if (gallery.length) {
    const galleryVals = gallery.map((url, i) => [eventId, url, i]);
    for (const row of galleryVals) {
      await db.execute('INSERT INTO event_gallery (event_id, image_url, sort_order) VALUES (?,?,?)', row);
    }
  }
  if (keynotes.length) {
    for (let i = 0; i < keynotes.length; i++) {
      await db.execute('INSERT INTO event_keynotes (event_id, keynote, sort_order) VALUES (?,?,?)', [eventId, keynotes[i], i]);
    }
  }

  return eventId;
};

const updateEvent = async (id, data) => {
  const fields = [];
  const values = [];
  const allowed = [
    'title','event_type','category','description','detailed_summary',
    'speaker_name','speaker_org','event_date','start_time','end_time','duration_minutes',
    'rsvp_deadline','location_name','location_address','location_type','location_url',
    'capacity','register_url','status','featured','color','banner_url','video_url',
  ];
  allowed.forEach((f) => {
    if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); }
  });

  // Auto-compute end_time if duration_minutes changed and start_time is available
  if (data.duration_minutes && data.start_time && !data.end_time) {
    const [h, m] = data.start_time.split(':').map(Number);
    const totalMin = h * 60 + m + Number(data.duration_minutes);
    const computedEnd = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
    fields.push('end_time = ?');
    values.push(computedEnd);
  }
  
  let affected = 0;
  
  if (fields.length) {
    values.push(id);
    const [result] = await db.execute(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    affected += result.affectedRows;
  }

  if (data.gallery !== undefined) {
    await db.execute('DELETE FROM event_gallery WHERE event_id = ?', [id]);
    if (data.gallery.length) {
      const galleryVals = data.gallery.map((url, i) => [id, url, i]);
      for (const row of galleryVals) {
        await db.execute('INSERT INTO event_gallery (event_id, image_url, sort_order) VALUES (?,?,?)', row);
      }
    }
    affected++; // To ensure we return true if gallery was updated
  }

  if (data.keynotes !== undefined) {
    await db.execute('DELETE FROM event_keynotes WHERE event_id = ?', [id]);
    if (data.keynotes.length) {
      for (let i = 0; i < data.keynotes.length; i++) {
        await db.execute('INSERT INTO event_keynotes (event_id, keynote, sort_order) VALUES (?,?,?)', [id, data.keynotes[i], i]);
      }
    }
    affected++; // To ensure we return true if keynotes were updated
  }

  return affected > 0;
};

const deleteEvent = async (id) => {
  const [result] = await db.execute('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// ── Registrations ─────────────────────────────────────────

const registerForEvent = async (eventId, data, userId) => {
  const { attendee_name, attendee_email, company, dietary_notes, attendee_type, payment_method } = data;
  const amount = attendee_type === 'guest' ? 35.00 : 25.00;

  const [result] = await db.execute(
    `INSERT INTO event_registrations
     (event_id, user_id, attendee_name, attendee_email, company, dietary_notes,
      attendee_type, payment_method, payment_status, amount_paid)
     VALUES (?,?,?,?,?,?,?,?,'pending',?)`,
    [eventId, userId||null, attendee_name, attendee_email, company||null,
     dietary_notes||null, attendee_type||'member', payment_method||'card', amount]
  );
  return result.insertId;
};

const getEventRegistrations = async (eventId) => {
  const [rows] = await db.execute(
    'SELECT * FROM event_registrations WHERE event_id = ? ORDER BY registered_at DESC',
    [eventId]
  );
  return rows;
};

const countRegistrations = async (eventId) => {
  const [rows] = await db.execute(
    "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND payment_status != 'refunded'",
    [eventId]
  );
  return rows[0].count;
};

module.exports = {
  countEvents, listEvents, getEventById,
  createEvent, updateEvent, deleteEvent,
  registerForEvent, getEventRegistrations, countRegistrations,
};
