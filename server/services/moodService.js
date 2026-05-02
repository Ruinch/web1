const db = require('../db');

async function list(userId, query) {
  const filters = { userId, search: query.search, date: query.date, mood: query.mood, habit: query.habit, all: query.all === '1' || query.all === 'true' };
  if (filters.all) return await db.listMoods(filters);
  const limit = Number(query.limit || 10);
  const offset = Number(query.offset || 0);
  return await db.listMoods(filters, limit, offset);
}

async function create(userId, data) {
  const habits = Array.isArray(data.habits) ? data.habits : [];
  if (!data.mood || !habits.length || !data.comment) throw new Error('Missing fields');
  return await db.createMood({ user_id: userId, mood: data.mood, habits, comment: data.comment, created_at: data.created_at });
}

async function update(userId, id, data) {
  return await db.updateMood(id, userId, data);
}

async function remove(userId, id) {
  return await db.deleteMood(id, userId);
}

async function exportAll(userId) {
  return await db.exportMoods(userId);
}

module.exports = { list, create, update, remove, exportAll };
