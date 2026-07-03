'use strict';
const db = require('../../config/db');

const countResources = async ({ search, year, category, access }) => {
  let sql = 'SELECT COUNT(*) as total FROM resources WHERE 1=1';
  const params = [];
  if (search)   { sql += ' AND MATCH(title,speaker,category,summary) AGAINST(? IN BOOLEAN MODE)'; params.push(`${search}*`); }
  if (year)     { sql += ' AND year = ?';     params.push(year); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (access)   { sql += ' AND access = ?';   params.push(access); }
  const [rows] = await db.execute(sql, params);
  return rows[0].total;
};

const listResources = async ({ search, year, category, access, limit, offset }) => {
  let sql = `SELECT id, title, speaker, speaker_org, category, year, month,
                    has_video, has_slides, has_paper, access, duration, summary
             FROM resources WHERE 1=1`;
  const params = [];
  if (search)   { sql += ' AND MATCH(title,speaker,category,summary) AGAINST(? IN BOOLEAN MODE)'; params.push(`${search}*`); }
  if (year)     { sql += ' AND year = ?';     params.push(year); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (access)   { sql += ' AND access = ?';   params.push(access); }
  sql += ' ORDER BY year DESC, id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await db.execute(sql, params);
  return rows;
};

const getResourceById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM resources WHERE id = ?', [id]);
  return rows[0] || null;
};

const createResource = async (data) => {
  const {
    event_id, title, speaker, speaker_org, category, year, month,
    has_video, has_slides, has_paper, access, duration, summary,
    video_url, slides_url, paper_url,
  } = data;
  const [result] = await db.execute(
    `INSERT INTO resources
     (event_id,title,speaker,speaker_org,category,year,month,has_video,has_slides,has_paper,access,duration,summary,video_url,slides_url,paper_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [event_id||null, title, speaker||null, speaker_org||null, category||null, year||null, month||null,
     has_video?1:0, has_slides?1:0, has_paper?1:0, access||'members', duration||null, summary||null,
     video_url||null, slides_url||null, paper_url||null]
  );
  return result.insertId;
};

const updateResource = async (id, data) => {
  const fields = []; const values = [];
  const allowed = ['title','speaker','speaker_org','category','year','month',
    'has_video','has_slides','has_paper','access','duration','summary','video_url','slides_url','paper_url'];
  allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); } });
  if (!fields.length) return false;
  values.push(id);
  const [r] = await db.execute(`UPDATE resources SET ${fields.join(', ')} WHERE id = ?`, values);
  return r.affectedRows > 0;
};

const deleteResource = async (id) => {
  const [r] = await db.execute('DELETE FROM resources WHERE id = ?', [id]);
  return r.affectedRows > 0;
};

module.exports = { countResources, listResources, getResourceById, createResource, updateResource, deleteResource };
