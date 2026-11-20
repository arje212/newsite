import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is required and must be at least 32 characters. Copy .env.example to .env and set a unique secret.');
}

const dataDir = path.resolve(rootDir, process.env.DATA_DIR || 'data');
const uploadDir = path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });
const dbPath = path.resolve(rootDir, process.env.DATABASE_PATH || 'data/codecraft.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','client')),
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    entity TEXT NOT NULL,
    data TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_records_entity ON records(entity);
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_date TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    delivered INTEGER NOT NULL DEFAULT 0,
    created_date TEXT NOT NULL
  );
`);

const entities = new Set([
  'ClientProject', 'Deliverable', 'ChangeRequest', 'DeliverableReview',
  'ProjectMessage', 'ProjectPhoto', 'TeamMember',
]);
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const publicUser = (user) => ({ id: user.id, email: user.email, full_name: user.full_name, role: user.role });
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'CodeCraft Administrator';
  if (!email || !password) {
    console.warn('Admin bootstrap skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before signing in.');
    return;
  }
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!existing) {
    const stamp = now();
    db.prepare('INSERT INTO users (id,email,full_name,password_hash,role,created_date,updated_date) VALUES (?,?,?,?,?,?,?)')
      .run(id(), email, fullName, await bcrypt.hash(password, 12), 'admin', stamp, stamp);
    console.log(`Initial admin account created: ${email}`);
  }
};
await createAdmin();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
  } },
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });

const readToken = (req) => {
  const cookie = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('cc_session='));
  let cookieToken = null;
  try { cookieToken = cookie ? decodeURIComponent(cookie.slice('cc_session='.length)) : null; } catch { cookieToken = null; }
  const headerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  return cookieToken || headerToken;
};
const authRequired = (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id,email,full_name,role FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'Your session is no longer valid.' });
    req.user = user;
    next();
  } catch {
    res.clearCookie('cc_session', cookieOptions);
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};
const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access is required.' });
const clientProjectIds = (user) => db.prepare("SELECT data FROM records WHERE entity='ClientProject'").all()
  .map((row) => JSON.parse(row.data)).filter((project) => project.client_email?.toLowerCase() === user.email.toLowerCase()).map((project) => project.id);
const isClientRecordAllowed = (entity, record, user) => {
  if (entity === 'TeamMember') return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (entity === 'ClientProject') return record.client_email?.toLowerCase() === user.email.toLowerCase();
  if (entity === 'DeliverableReview') return record.client_email?.toLowerCase() === user.email.toLowerCase();
  if (['Deliverable', 'ChangeRequest', 'ProjectMessage', 'ProjectPhoto'].includes(entity)) return clientProjectIds(user).includes(record.project_id);
  return false;
};

const optionalAuth = (req, _res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = db.prepare('SELECT id,email,full_name,role FROM users WHERE id = ?').get(payload.sub) || null;
    } catch { req.user = null; }
  }
  next();
};

app.get('/uploads/:filename', optionalAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const matchingRecords = db.prepare("SELECT entity,data FROM records WHERE entity IN ('Deliverable','ProjectPhoto','TeamMember') AND data LIKE ?").all(`%${filename}%`);
  const canAccess = matchingRecords.some((row) => isClientRecordAllowed(row.entity, JSON.parse(row.data), req.user));
  if (!canAccess) return res.status(404).json({ error: 'File not found.' });
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
  res.sendFile(filePath);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'sqlite', timestamp: now() }));
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const token = jwt.sign({}, JWT_SECRET, { subject: user.id, expiresIn: '7d', issuer: 'codecraft' });
  res.cookie('cc_session', token, cookieOptions);
  res.json({ user: publicUser(user) });
});
app.post('/api/auth/logout', (_req, res) => { res.clearCookie('cc_session', { httpOnly: true, secure: cookieOptions.secure, sameSite: 'lax', path: '/' }); res.status(204).end(); });
app.get('/api/auth/me', authRequired, (req, res) => res.json(publicUser(req.user)));

app.get('/api/users', authRequired, adminOnly, (_req, res) => {
  const rows = db.prepare('SELECT id,email,full_name,role,created_date FROM users ORDER BY created_date DESC').all();
  res.json(rows);
});
app.post('/api/users/invite', authRequired, adminOnly, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const fullName = String(req.body?.full_name || '').trim();
  const password = String(req.body?.password || '');
  if (!/^\S+@\S+\.\S+$/.test(email) || !fullName || password.length < 12) {
    return res.status(400).json({ error: 'Provide a valid email, full name, and password with at least 12 characters.' });
  }
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const stamp = now();
  const userId = id();
  db.prepare('INSERT INTO users (id,email,full_name,password_hash,role,created_date,updated_date) VALUES (?,?,?,?,?,?,?)')
    .run(userId, email, fullName, await bcrypt.hash(password, 12), 'client', stamp, stamp);
  res.status(201).json({ id: userId, email, full_name: fullName, role: 'client', created_date: stamp });
});

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
  'application/zip', 'application/x-zip-compressed', 'text/plain', 'video/mp4', 'video/webm',
  'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase().slice(0, 12)}`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) return cb(new Error('This file type is not allowed.'));
  cb(null, true);
} });

app.get('/api/admin/contact-messages', authRequired, adminOnly, (_req, res) => {
  res.json(db.prepare('SELECT * FROM contact_messages ORDER BY created_date DESC LIMIT 200').all());
});

app.post('/api/uploads', authRequired, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a file to upload.' });
  res.status(201).json({ file_url: `/uploads/${req.file.filename}`, original_name: req.file.originalname, size: req.file.size, mime_type: req.file.mimetype });
});

app.post('/api/contact', contactLimiter, (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const email = String(req.body?.email || '').trim().slice(0, 254);
  const message = String(req.body?.message || '').trim().slice(0, 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10) return res.status(400).json({ error: 'Enter your name, a valid email, and a message of at least 10 characters.' });
  db.prepare('INSERT INTO contact_messages (id,name,email,message,created_date) VALUES (?,?,?,?,?)').run(id(), name, email, message, now());
  res.status(201).json({ message: 'Your message has been received.' });
});

app.get('/api/:entity', (req, res, next) => req.params.entity === 'TeamMember' ? optionalAuth(req, res, next) : authRequired(req, res, next), (req, res) => {
  const { entity } = req.params;
  if (!entities.has(entity)) return res.status(404).json({ error: 'Unknown resource.' });
  let rows = db.prepare('SELECT id,data,created_date,updated_date FROM records WHERE entity=?').all(entity)
    .map((row) => ({ ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date }));
  rows = rows.filter((row) => isClientRecordAllowed(entity, row, req.user));
  for (const [key, value] of Object.entries(req.query)) {
    if (['sort', 'limit', 'offset'].includes(key)) continue;
    rows = rows.filter((row) => String(row[key] ?? '').toLowerCase() === String(value).toLowerCase());
  }
  const sort = String(req.query.sort || '-created_date');
  const descending = sort.startsWith('-');
  const sortKey = (descending ? sort.slice(1) : sort);
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortKey)) {
    rows.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return descending ? -result : result;
    });
  }
  const offset = Math.max(0, Number(req.query.offset || 0));
  const limit = Math.min(200, Math.max(1, Number(req.query.limit || 200)));
  res.json(rows.slice(offset, offset + limit));
});
app.get('/api/:entity/:recordId', (req, res, next) => req.params.entity === 'TeamMember' ? optionalAuth(req, res, next) : authRequired(req, res, next), (req, res) => {
  const { entity, recordId } = req.params;
  if (!entities.has(entity)) return res.status(404).json({ error: 'Unknown resource.' });
  const row = db.prepare('SELECT id,data,created_date,updated_date FROM records WHERE entity=? AND id=?').get(entity, recordId);
  if (!row) return res.status(404).json({ error: 'Record not found.' });
  const record = { ...JSON.parse(row.data), id: row.id, created_date: row.created_date, updated_date: row.updated_date };
  if (!isClientRecordAllowed(entity, record, req.user)) return res.status(404).json({ error: 'Record not found.' });
  res.json(record);
});
app.post('/api/:entity', authRequired, (req, res) => {
  const { entity } = req.params;
  if (!entities.has(entity)) return res.status(404).json({ error: 'Unknown resource.' });
  if (req.user.role !== 'admin' && !['ChangeRequest', 'ProjectMessage', 'DeliverableReview'].includes(entity)) return res.status(403).json({ error: 'You cannot create this resource.' });
  let data = { ...(req.body || {}) };
  delete data.id; delete data.created_date; delete data.updated_date;
  if (req.user.role !== 'admin') {
    const projectId = String(data.project_id || '');
    const projectRow = db.prepare("SELECT data FROM records WHERE entity='ClientProject' AND id=?").get(projectId);
    if (!projectRow) return res.status(404).json({ error: 'Project not found.' });
    const project = JSON.parse(projectRow.data);
    if (project.client_email?.toLowerCase() !== req.user.email.toLowerCase()) return res.status(403).json({ error: 'You do not have access to this project.' });
    if (entity === 'ChangeRequest') {
      data = { project_id: projectId, title: String(data.title || '').slice(0, 160), description: String(data.description || '').slice(0, 5000), priority: ['Low','Medium','High','Critical'].includes(data.priority) ? data.priority : 'Medium', client_email: req.user.email, client_name: req.user.full_name, status: 'Submitted' };
    }
    if (entity === 'ProjectMessage') {
      data = { project_id: projectId, message: String(data.message || '').slice(0, 4000), sender_email: req.user.email, sender_name: req.user.full_name, sender_role: 'client' };
    }
    if (entity === 'DeliverableReview') {
      const deliverable = db.prepare("SELECT data FROM records WHERE entity='Deliverable' AND id=?").get(String(data.deliverable_id || ''));
      if (!deliverable || JSON.parse(deliverable.data).project_id !== projectId) return res.status(400).json({ error: 'The deliverable does not belong to this project.' });
      const deliverableData = JSON.parse(deliverable.data);
      data = { project_id: projectId, deliverable_id: String(data.deliverable_id), deliverable_title: deliverableData.title, decision: ['Approved','Needs Changes'].includes(data.decision) ? data.decision : 'Needs Changes', feedback: String(data.feedback || '').slice(0, 5000), client_email: req.user.email, client_name: req.user.full_name, status: 'Pending' };
    }
  }
  if (entity === 'ClientProject') data.progress_percent = Math.min(100, Math.max(0, Number(data.progress_percent || 0)));
  const stamp = now();
  const recordId = id();
  db.prepare('INSERT INTO records (id,entity,data,created_date,updated_date) VALUES (?,?,?,?,?)')
    .run(recordId, entity, JSON.stringify(data), stamp, stamp);
  res.status(201).json({ ...data, id: recordId, created_date: stamp, updated_date: stamp });
});
app.put('/api/:entity/:recordId', authRequired, adminOnly, (req, res) => {
  const { entity, recordId } = req.params;
  if (!entities.has(entity)) return res.status(404).json({ error: 'Unknown resource.' });
  const existing = db.prepare('SELECT data,created_date FROM records WHERE entity=? AND id=?').get(entity, recordId);
  if (!existing) return res.status(404).json({ error: 'Record not found.' });
  const data = { ...JSON.parse(existing.data), ...(req.body || {}) };
  delete data.id; delete data.created_date; delete data.updated_date;
  if (entity === 'ClientProject') data.progress_percent = Math.min(100, Math.max(0, Number(data.progress_percent || 0)));
  const stamp = now();
  db.prepare('UPDATE records SET data=?,updated_date=? WHERE entity=? AND id=?').run(JSON.stringify(data), stamp, entity, recordId);
  res.json({ ...data, id: recordId, created_date: existing.created_date, updated_date: stamp });
});
app.delete('/api/:entity/:recordId', authRequired, adminOnly, (req, res) => {
  const { entity, recordId } = req.params;
  if (!entities.has(entity)) return res.status(404).json({ error: 'Unknown resource.' });
  const result = db.prepare('DELETE FROM records WHERE entity=? AND id=?').run(entity, recordId);
  if (!result.changes) return res.status(404).json({ error: 'Record not found.' });
  res.status(204).end();
});


let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
}
app.post('/api/notifications/email', authRequired, async (req, res) => {
  const to = String(req.body?.to || '').trim();
  const subject = String(req.body?.subject || '').trim();
  const body = String(req.body?.body || '').trim();
  if (!to || !subject || !body) return res.status(400).json({ error: 'Recipient, subject, and message are required.' });
  if (req.user.role !== 'admin' && ![process.env.ADMIN_EMAIL, 'team@codecraft.dev'].filter(Boolean).some((address) => to.toLowerCase() === address.toLowerCase())) return res.status(403).json({ error: 'Client notifications can only be sent to the CodeCraft team.' });
  const notificationId = id();
  let delivered = false;
  if (mailer) {
    await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text: body });
    delivered = true;
  }
  db.prepare('INSERT INTO notifications (id,recipient,subject,body,delivered,created_date) VALUES (?,?,?,?,?,?)')
    .run(notificationId, to, subject, body, delivered ? 1 : 0, now());
  res.json({ id: notificationId, delivered, message: delivered ? 'Email delivered.' : 'Notification saved. Configure SMTP to send email.' });
});
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  res.status(400).json({ error: err.message || 'Something went wrong.' });
});

const distDir = path.resolve(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => req.path.startsWith('/api/') || req.path.startsWith('/uploads/') ? next() : res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => console.log(`CodeCraft API listening on http://localhost:${PORT}`));
