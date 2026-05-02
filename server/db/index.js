const { Pool } = require('pg');

const hasPg = !!process.env.DATABASE_URL;
const memory = {
  users: [],
  moods: [],
  userSeq: 1,
  moodSeq: 1
};

const pool = hasPg ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
}) : null;

async function init() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS moods (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mood VARCHAR(10) NOT NULL,
      habits TEXT[] NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
    CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at);
  `);
}

function mapUser(row) {
  return row ? { id: row.id, email: row.email, password_hash: row.password_hash, created_at: row.created_at } : null;
}

function mapMood(row) {
  return row ? {
    id: row.id,
    user_id: row.user_id,
    mood: row.mood,
    habits: row.habits || [],
    comment: row.comment,
    created_at: row.created_at
  } : null;
}

async function createUser(email, password_hash) {
  if (pool) {
    const { rows } = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *', [email, password_hash]);
    return mapUser(rows[0]);
  }
  const user = { id: memory.userSeq++, email, password_hash, created_at: new Date().toISOString() };
  memory.users.push(user);
  return user;
}

async function findUserByEmail(email) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return mapUser(rows[0]);
  }
  return memory.users.find(u => u.email === email) || null;
}

async function findUserById(id) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return mapUser(rows[0]);
  }
  return memory.users.find(u => u.id === Number(id)) || null;
}

function buildFilters(filters) {
  const where = ['user_id = $1'];
  const params = [filters.userId];
  let i = 2;
  if (filters.search) { where.push(`LOWER(comment) LIKE $${i}`); params.push(`%${filters.search.toLowerCase()}%`); i++; }
  if (filters.date) { where.push(`DATE(created_at) = $${i}`); params.push(filters.date); i++; }
  if (filters.mood) { where.push(`mood = $${i}`); params.push(filters.mood); i++; }
  if (filters.habit) { where.push(`$${i} = ANY(habits)`); params.push(filters.habit); i++; }
  return { where: where.join(' AND '), params };
}

async function listMoods(filters = {}, limit = 10, offset = 0) {
  if (pool) {
    if (filters.all) {
      const { where, params } = buildFilters(filters);
      const { rows } = await pool.query(`SELECT * FROM moods WHERE ${where} ORDER BY created_at DESC, id DESC`, params);
      return rows.map(mapMood);
    }
    const { where, params } = buildFilters(filters);
    const countQuery = await pool.query(`SELECT COUNT(*)::int AS count FROM moods WHERE ${where}`, params);
    const total = countQuery.rows[0].count;
    const { rows } = await pool.query(`SELECT * FROM moods WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
    return { items: rows.map(mapMood), total };
  }

  let items = memory.moods.filter(m => m.user_id === Number(filters.userId));
  if (filters.search) items = items.filter(m => m.comment.toLowerCase().includes(filters.search.toLowerCase()));
  if (filters.date) items = items.filter(m => new Date(m.created_at).toISOString().slice(0, 10) === filters.date);
  if (filters.mood) items = items.filter(m => m.mood === filters.mood);
  if (filters.habit) items = items.filter(m => m.habits.includes(filters.habit));
  items = items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (filters.all) return items;
  return { items: items.slice(offset, offset + limit), total: items.length };
}

async function createMood(data) {
  if (pool) {
    const { rows } = await pool.query(
      'INSERT INTO moods (user_id, mood, habits, comment, created_at) VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP)) RETURNING *',
      [data.user_id, data.mood, data.habits, data.comment, data.created_at || null]
    );
    return mapMood(rows[0]);
  }
  const mood = {
    id: memory.moodSeq++,
    user_id: Number(data.user_id),
    mood: data.mood,
    habits: data.habits,
    comment: data.comment,
    created_at: data.created_at || new Date().toISOString()
  };
  memory.moods.push(mood);
  return mood;
}

async function updateMood(id, userId, data) {
  if (pool) {
    const { rows } = await pool.query(
      'UPDATE moods SET mood = COALESCE($1, mood), habits = COALESCE($2, habits), comment = COALESCE($3, comment) WHERE id = $4 AND user_id = $5 RETURNING *',
      [data.mood || null, data.habits || null, data.comment || null, id, userId]
    );
    return mapMood(rows[0]);
  }
  const item = memory.moods.find(m => m.id === Number(id) && m.user_id === Number(userId));
  if (!item) return null;
  if (data.mood) item.mood = data.mood;
  if (data.habits) item.habits = data.habits;
  if (data.comment) item.comment = data.comment;
  return item;
}

async function deleteMood(id, userId) {
  if (pool) {
    const { rowCount } = await pool.query('DELETE FROM moods WHERE id = $1 AND user_id = $2', [id, userId]);
    return rowCount > 0;
  }
  const idx = memory.moods.findIndex(m => m.id === Number(id) && m.user_id === Number(userId));
  if (idx === -1) return false;
  memory.moods.splice(idx, 1);
  return true;
}

async function exportMoods(userId) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM moods WHERE user_id = $1 ORDER BY created_at DESC, id DESC', [userId]);
    return rows.map(mapMood);
  }
  return memory.moods.filter(m => m.user_id === Number(userId));
}

module.exports = {
  init,
  createUser,
  findUserByEmail,
  findUserById,
  listMoods,
  createMood,
  updateMood,
  deleteMood,
  exportMoods
};
