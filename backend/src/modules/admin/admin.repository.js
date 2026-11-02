'use strict';
const db = require('../../config/db');

const getDashboardStats = async () => {
  const [[{ total_members }]] = await db.execute('SELECT COUNT(*) as total_members FROM members');
  const [[{ pending_applications }]] = await db.execute("SELECT COUNT(*) as pending_applications FROM members WHERE status='pending'");
  const [[{ active_events }]] = await db.execute("SELECT COUNT(*) as active_events FROM events WHERE status='upcoming'");
  const [[{ total_donations }]] = await db.execute("SELECT COALESCE(SUM(amount),0) as total_donations FROM donations WHERE payment_status='completed'");
  const [[{ total_registrations }]] = await db.execute('SELECT COUNT(*) as total_registrations FROM event_registrations');
  const [[{ unread_inquiries }]] = await db.execute('SELECT COUNT(*) as unread_inquiries FROM contact_inquiries WHERE is_read=0');
  const [[{ new_sponsor_enquiries }]] = await db.execute("SELECT COUNT(*) as new_sponsor_enquiries FROM sponsor_enquiries WHERE status='new'");

  // Membership growth over the last 12 months (including current month)
  const [growth_data] = await db.execute(`
    SELECT DATE_FORMAT(joined_at, '%Y-%m') as month, COUNT(*) as count 
    FROM members 
    WHERE joined_at >= DATE_SUB(NOW(), INTERVAL 11 MONTH)
    GROUP BY month 
    ORDER BY month ASC
  `);

  return {
    total_members,
    pending_applications,
    active_events,
    total_donations,
    total_registrations,
    unread_inquiries,
    new_sponsor_enquiries,
    membership_growth: growth_data,
  };
};

const getAuditLog = async ({ limit, offset, action_filter, actor_id, date_from, date_to }) => {
  const conditions = ['1=1'];
  const params = [];

  if (action_filter) {
    conditions.push('a.action LIKE ?');
    params.push(`%${action_filter}%`);
  }
  if (actor_id) {
    conditions.push('a.user_id = ?');
    params.push(actor_id);
  }
  if (date_from) {
    conditions.push('a.created_at >= ?');
    params.push(date_from);
  }
  if (date_to) {
    conditions.push('a.created_at <= ?');
    params.push(date_to);
  }

  const where = conditions.join(' AND ');

  const [rows] = await db.execute(
    `SELECT a.id, a.user_id, a.action, a.target, a.meta, a.created_at,
            u.email as actor_email,
            COALESCE(CONCAT(m.first_name, ' ', m.last_name), u.email) as actor_name,
            u.role as actor_role
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN members m ON m.user_id = a.user_id
     WHERE ${where}
     ORDER BY a.created_at DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );
  return rows;
};

const countAuditLog = async ({ action_filter, actor_id, date_from, date_to } = {}) => {
  const conditions = ['1=1'];
  const params = [];

  if (action_filter) {
    conditions.push('a.action LIKE ?');
    params.push(`%${action_filter}%`);
  }
  if (actor_id) {
    conditions.push('a.user_id = ?');
    params.push(actor_id);
  }
  if (date_from) {
    conditions.push('a.created_at >= ?');
    params.push(date_from);
  }
  if (date_to) {
    conditions.push('a.created_at <= ?');
    params.push(date_to);
  }

  const where = conditions.join(' AND ');
  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) as total FROM audit_logs a WHERE ${where}`,
    params
  );
  return total;
};

const writeAuditLog = async (userId, action, target, meta) => {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, target, meta) VALUES (?,?,?,?)',
      [userId || null, action, target || null, meta ? JSON.stringify(meta) : null]
    );
  } catch (err) {
    // Never let logging failures crash the app
    console.error('[AuditLog] Write failed:', err.message);
  }
};

const listAdminAccounts = async () => {
  const [rows] = await db.execute(
    `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
            m.first_name, m.last_name
     FROM users u
     LEFT JOIN members m ON m.user_id = u.id
     WHERE u.role = 'admin'
     ORDER BY u.created_at DESC`
  );
  return rows;
};

const createAdminAccount = async (email, passwordHash, role = 'admin') => {
  const [result] = await db.execute(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, passwordHash, role]
  );
  return result.insertId;
};

const getRevenueAnalytics = async ({ timeframe = 'all', event_id = null, payment_method = null } = {}) => {
  // Build time filter
  let timeFilterRegistrations = '';
  let timeFilterDonations = '';
  const paramsReg = [];
  const paramsDon = [];

  if (timeframe === '30d') {
    timeFilterRegistrations += ' AND er.registered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    timeFilterDonations += ' AND d.donated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
  } else if (timeframe === '90d') {
    timeFilterRegistrations += ' AND er.registered_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    timeFilterDonations += ' AND d.donated_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
  } else if (timeframe === '6m') {
    timeFilterRegistrations += ' AND er.registered_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
    timeFilterDonations += ' AND d.donated_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
  } else if (timeframe === '1y') {
    timeFilterRegistrations += ' AND er.registered_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    timeFilterDonations += ' AND d.donated_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
  }

  if (event_id) {
    timeFilterRegistrations += ' AND er.event_id = ?';
    paramsReg.push(event_id);
  }

  if (payment_method && payment_method !== 'all') {
    if (payment_method === 'cash') {
      timeFilterRegistrations += " AND (er.payment_method = 'at_door' OR er.payment_method = 'cash')";
      timeFilterDonations += " AND (d.payment_method = 'check' OR d.payment_method = 'cash')";
    } else if (payment_method === 'card') {
      timeFilterRegistrations += " AND er.payment_method = 'card'";
      timeFilterDonations += " AND d.payment_method = 'card'";
    }
  }

  // 1. Summary Totals from Event Registrations
  const [[eventTotals]] = await db.execute(`
    SELECT 
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' THEN er.amount_paid ELSE 0 END), 0) as total_event_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND (er.payment_method = 'at_door' OR er.payment_method = 'cash') THEN er.amount_paid ELSE 0 END), 0) as cash_event_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND er.payment_method = 'card' THEN er.amount_paid ELSE 0 END), 0) as card_event_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'pending' THEN er.amount_paid ELSE 0 END), 0) as pending_event_revenue,
      COUNT(CASE WHEN er.payment_status = 'paid' THEN 1 END) as paid_bookings_count,
      COUNT(CASE WHEN er.payment_status = 'pending' THEN 1 END) as pending_bookings_count,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND er.attendee_type = 'member' THEN er.amount_paid ELSE 0 END), 0) as member_event_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND er.attendee_type = 'guest' THEN er.amount_paid ELSE 0 END), 0) as guest_event_revenue
    FROM event_registrations er
    WHERE 1=1 ${timeFilterRegistrations}
  `, paramsReg);

  // 2. Summary Totals from Donations
  const [[donationTotals]] = await db.execute(`
    SELECT 
      COALESCE(SUM(CASE WHEN d.payment_status = 'completed' THEN d.amount ELSE 0 END), 0) as total_donation_revenue,
      COALESCE(SUM(CASE WHEN d.payment_status = 'completed' AND (d.payment_method = 'check' OR d.payment_method = 'cash') THEN d.amount ELSE 0 END), 0) as cash_donation_revenue,
      COALESCE(SUM(CASE WHEN d.payment_status = 'completed' AND d.payment_method = 'card' THEN d.amount ELSE 0 END), 0) as card_donation_revenue,
      COUNT(CASE WHEN d.payment_status = 'completed' THEN 1 END) as completed_donations_count
    FROM donations d
    WHERE 1=1 ${timeFilterDonations}
  `, paramsDon);

  // 3. Monthly Revenue Trend (Last 12 Months)
  const [monthlyEvents] = await db.execute(`
    SELECT 
      DATE_FORMAT(er.registered_at, '%Y-%m') as month,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' THEN er.amount_paid ELSE 0 END), 0) as event_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND (er.payment_method = 'at_door' OR er.payment_method = 'cash') THEN er.amount_paid ELSE 0 END), 0) as cash_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND er.payment_method = 'card' THEN er.amount_paid ELSE 0 END), 0) as card_revenue,
      COUNT(CASE WHEN er.payment_status = 'paid' THEN 1 END) as paid_count
    FROM event_registrations er
    WHERE er.registered_at >= DATE_SUB(NOW(), INTERVAL 11 MONTH)
    GROUP BY month
    ORDER BY month ASC
  `);

  const [monthlyDonations] = await db.execute(`
    SELECT 
      DATE_FORMAT(d.donated_at, '%Y-%m') as month,
      COALESCE(SUM(CASE WHEN d.payment_status = 'completed' THEN d.amount ELSE 0 END), 0) as donation_revenue,
      COUNT(CASE WHEN d.payment_status = 'completed' THEN 1 END) as donation_count
    FROM donations d
    WHERE d.donated_at >= DATE_SUB(NOW(), INTERVAL 11 MONTH)
    GROUP BY month
    ORDER BY month ASC
  `);

  // Merge monthly timeline
  const monthsMap = {};
  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = monthFormatter.format(d);
    monthsMap[key] = {
      key,
      label,
      total_revenue: 0,
      event_revenue: 0,
      donation_revenue: 0,
      cash_revenue: 0,
      card_revenue: 0,
      paid_count: 0
    };
  }

  monthlyEvents.forEach(row => {
    if (monthsMap[row.month]) {
      monthsMap[row.month].event_revenue = Number(row.event_revenue || 0);
      monthsMap[row.month].cash_revenue += Number(row.cash_revenue || 0);
      monthsMap[row.month].card_revenue += Number(row.card_revenue || 0);
      monthsMap[row.month].total_revenue += Number(row.event_revenue || 0);
      monthsMap[row.month].paid_count += Number(row.paid_count || 0);
    }
  });

  monthlyDonations.forEach(row => {
    if (monthsMap[row.month]) {
      monthsMap[row.month].donation_revenue = Number(row.donation_revenue || 0);
      monthsMap[row.month].card_revenue += Number(row.donation_revenue || 0);
      monthsMap[row.month].total_revenue += Number(row.donation_revenue || 0);
      monthsMap[row.month].paid_count += Number(row.donation_count || 0);
    }
  });

  const timeline = Object.values(monthsMap);

  // 4. Revenue by Event Ranking
  const [eventsBreakdown] = await db.execute(`
    SELECT 
      e.id as event_id,
      e.title as event_title,
      e.event_date,
      e.event_type,
      e.category,
      e.status,
      e.capacity,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' THEN er.amount_paid ELSE 0 END), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND (er.payment_method = 'at_door' OR er.payment_method = 'cash') THEN er.amount_paid ELSE 0 END), 0) as cash_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' AND er.payment_method = 'card' THEN er.amount_paid ELSE 0 END), 0) as card_revenue,
      COALESCE(SUM(CASE WHEN er.payment_status = 'pending' THEN er.amount_paid ELSE 0 END), 0) as pending_revenue,
      COUNT(CASE WHEN er.payment_status = 'paid' THEN 1 END) as paid_orders,
      COUNT(er.id) as total_registrations
    FROM events e
    LEFT JOIN event_registrations er ON e.id = er.event_id
    GROUP BY e.id
    ORDER BY total_revenue DESC, e.event_date DESC
  `);

  // 5. Revenue by Member Tiers & Types
  const [memberTiers] = await db.execute(`
    SELECT 
      COALESCE(m.tier, 'Non-Member / Guest') as tier,
      COALESCE(SUM(CASE WHEN er.payment_status = 'paid' THEN er.amount_paid ELSE 0 END), 0) as total_revenue,
      COUNT(CASE WHEN er.payment_status = 'paid' THEN 1 END) as paid_count
    FROM event_registrations er
    LEFT JOIN members m ON er.user_id = m.user_id
    GROUP BY m.tier
    ORDER BY total_revenue DESC
  `);

  // 6. Recent Paid Transactions (Cash & Card)
  // 6. Recent Transactions & Registrations
  const [recentTransactions] = await db.execute(`
    SELECT 
      er.id as id,
      'event_ticket' as type,
      er.attendee_name,
      er.attendee_email,
      er.company,
      er.attendee_type,
      e.id as event_id,
      e.title as source_title,
      e.event_date,
      er.amount_paid,
      er.payment_method,
      er.payment_status,
      er.registered_at as transaction_date
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    ORDER BY er.registered_at DESC
    LIMIT 20
  `);

  // 7. Pending Attendee Registrations for Fast Check-In / Payment Confirmation
  const [pendingRegistrations] = await db.execute(`
    SELECT 
      er.id as id,
      er.attendee_name,
      er.attendee_email,
      er.company,
      er.attendee_type,
      er.guests,
      e.id as event_id,
      e.title as event_title,
      e.event_date,
      er.amount_paid,
      er.payment_method,
      er.payment_status,
      er.registered_at
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.payment_status = 'pending'
    ORDER BY er.registered_at DESC
    LIMIT 10
  `);

  const totalRevenue = Number(eventTotals.total_event_revenue) + Number(donationTotals.total_donation_revenue);
  const totalCashRevenue = Number(eventTotals.cash_event_revenue) + Number(donationTotals.cash_donation_revenue);
  const totalCardRevenue = Number(eventTotals.card_event_revenue) + Number(donationTotals.card_donation_revenue);

  return {
    summary: {
      total_revenue: totalRevenue,
      cash_revenue: totalCashRevenue,
      card_revenue: totalCardRevenue,
      events_revenue: Number(eventTotals.total_event_revenue),
      donations_revenue: Number(donationTotals.total_donation_revenue),
      pending_revenue: Number(eventTotals.pending_event_revenue),
      pending_amount: Number(eventTotals.pending_event_revenue),
      paid_bookings_count: Number(eventTotals.paid_bookings_count),
      pending_bookings_count: Number(eventTotals.pending_bookings_count),
      completed_donations_count: Number(donationTotals.completed_donations_count),
      member_revenue: Number(eventTotals.member_event_revenue),
      guest_revenue: Number(eventTotals.guest_event_revenue),
    },
    timeline,
    events_breakdown: eventsBreakdown,
    member_tiers: memberTiers,
    recent_transactions: recentTransactions,
    pending_registrations: pendingRegistrations,
  };
};

module.exports = {
  getDashboardStats,
  getAuditLog,
  countAuditLog,
  writeAuditLog,
  listAdminAccounts,
  createAdminAccount,
  getRevenueAnalytics,
};
