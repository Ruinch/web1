const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

async function register(email, password) {
  const existing = await db.findUserByEmail(email);
  if (existing) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  const user = await db.createUser(email, hash);
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  return { user: { id: user.id, email: user.email }, token };
}

async function login(email, password) {
  const user = await db.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  return { user: { id: user.id, email: user.email }, token };
}

module.exports = { register, login };
