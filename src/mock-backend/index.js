const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// in-memory "db"
const users = [
  { id: 'u1', email: 'user@example.com', displayName: 'Anuja', role: 'Employee', password: 'password' },
  { id: 'm1', email: 'manager@example.com', displayName: 'Manager', role: 'Manager', password: 'password' }
];

let projects = [
  { id: 'p1', code: 'PROJ001', name: 'Project Alpha', clientName: 'Client A', billable: true },
  { id: 'p2', code: 'PROJ002', name: 'Project Beta', clientName: 'Client B', billable: false }
];

let timesheets = [
  { id: 't1', userId: 'u1', projectId: 'p1', projectName: 'Project Alpha', date: '2026-01-12', hours: 8, description: 'Feature work', status: 'Approved' }
];

function createTokenForUser(user) {
  // Mock token (not secure). Format: mock-token:<userId>
  return `mock-token:${user.id}`;
}

function getUserFromToken(token) {
  if (!token) return null;
  const m = token.match(/^mock-token:(.+)$/);
  if (!m) return null;
  return users.find(u => u.id === m[1]) || null;
}

// Auth: login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  return res.json({ accessToken: createTokenForUser(user) });
});

// Auth: me
app.get('/auth/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const { password, ...sanitized } = user;
  return res.json(sanitized);
});

// Projects
app.get('/projects', (req, res) => {
  return res.json(projects);
});

// Timesheets
app.get('/timesheets', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const userEntries = timesheets.filter(t => t.userId === user.id);
  return res.json(userEntries);
});

app.post('/timesheets', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { projectId, date, hours, description } = req.body;
  const project = projects.find(p => p.id === projectId);
  const entry = {
    id: uuid(),
    userId: user.id,
    projectId,
    projectName: project ? project.name : projectId,
    date,
    hours,
    description,
    status: 'Draft'
  };
  timesheets.push(entry);
  return res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`Mock backend listening at http://localhost:${PORT}`);
  console.log('Test accounts: user@example.com / password  OR manager@example.com / password');
});
