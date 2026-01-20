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
  { id: 'u1', email: 'user@example.com', displayName: 'Anujai', role: 'Employee', password: 'password' },
  { id: 'm1', email: 'manager@example.com', displayName: 'Manager', role: 'Manager', password: 'password' }
];

let projects = [
  { id: 'p1', code: 'PROJ001', name: 'Project Alpha', clientName: 'Client A', billable: true, isActive: true },
  { id: 'p2', code: 'PROJ002', name: 'Project Beta', clientName: 'Client B', billable: false, isActive: true }
];

let assignments = [
  // { id, projectId, userId, startDate, endDate, isActive }
  { id: 'a1', projectId: 'p1', userId: 'u1', startDate: '2026-01-01', endDate: null, isActive: true }
];

let timesheets = [
  { id: 't1', userId: 'u1', projectId: 'p1', projectName: 'Project Alpha', date: '2026-01-12', hours: 8, description: 'Feature work', status: 'Submitted' }
];

function createTokenForUser(user) {
  return `mock-token:${user.id}`;
}
function getUserFromToken(token) {
  if (!token) return null;
  const m = token.match(/^mock-token:(.+)$/);
  if (!m) return null;
  return users.find(u => u.id === m[1]) || null;
}

// Auth
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  return res.json({ accessToken: createTokenForUser(user) });
});
app.get('/auth/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const { password, ...sanitized } = user;
  return res.json(sanitized);
});

// Projects CRUD (Manager)
app.get('/projects', (req, res) => res.json(projects));
app.post('/projects', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const actor = getUserFromToken(token);
  if (!actor || actor.role !== 'Manager') return res.status(403).json({ message: 'Forbidden' });

  const { code, name, clientName, billable } = req.body;
  if (!code || !name) return res.status(400).json({ message: 'code and name required' });
  const p = { id: uuid(), code, name, clientName, billable: !!billable, isActive: true };
  projects.push(p);
  return res.status(201).json(p);
});
app.put('/projects/:id', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const actor = getUserFromToken(token);
  if (!actor || actor.role !== 'Manager') return res.status(403).json({ message: 'Forbidden' });

  const id = req.params.id;
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  projects[idx] = { ...projects[idx], ...req.body };
  return res.json(projects[idx]);
});

// Assignments
app.post('/assignments', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const actor = getUserFromToken(token);
  if (!actor || actor.role !== 'Manager') return res.status(403).json({ message: 'Forbidden' });

  const { projectId, userId, startDate, endDate } = req.body;
  if (!projectId || !userId || !startDate) return res.status(400).json({ message: 'projectId,userId,startDate required' });
  const a = { id: uuid(), projectId, userId, startDate, endDate: endDate || null, isActive: true };
  assignments.push(a);
  return res.status(201).json(a);
});

app.get('/assignments', (req, res) => res.json(assignments));

// Timesheet approval flow
app.get('/timesheets', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (user.role === 'Manager') {
    // manager: all submitted entries to review
    const pending = timesheets.filter(t => t.status === 'Submitted');
    return res.json(pending);
  }
  // employee: only own
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
    status: 'Submitted' // when employee creates, mark Submitted for manager review
  };
  timesheets.push(entry);
  return res.status(201).json(entry);
});

// Approve / Reject
app.post('/timesheets/:id/approve', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const manager = getUserFromToken(token);
  if (!manager || manager.role !== 'Manager') return res.status(403).json({ message: 'Forbidden' });

  const id = req.params.id;
  const t = timesheets.find(x => x.id === id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.status = 'Approved';
  t.managerComment = req.body.comment || null;
  return res.json(t);
});
app.post('/timesheets/:id/reject', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const manager = getUserFromToken(token);
  if (!manager || manager.role !== 'Manager') return res.status(403).json({ message: 'Forbidden' });

  const id = req.params.id;
  const t = timesheets.find(x => x.id === id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  t.status = 'Rejected';
  t.managerComment = req.body.comment || 'Rejected';
  return res.json(t);
});

// Reports (simple aggregates)
app.get('/reports/employee-hours', (req, res) => {
  // params: from,to
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const agg = {};
  timesheets.forEach(t => {
    if (t.date >= from && t.date <= to) {
      agg[t.userId] = (agg[t.userId] || 0) + (Number(t.hours) || 0);
    }
  });
  // map to array with user email
  const result = Object.keys(agg).map(uid => {
    const u = users.find(x => x.id === uid);
    return { userId: uid, userEmail: u?.email ?? '', hours: agg[uid] };
  });
  res.json(result);
});

app.get('/reports/project-hours', (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const agg = {};
  timesheets.forEach(t => {
    if (t.date >= from && t.date <= to) {
      agg[t.projectId] = (agg[t.projectId] || 0) + (Number(t.hours) || 0);
    }
  });
  const result = Object.keys(agg).map(pid => {
    const p = projects.find(x => x.id === pid);
    return { projectId: pid, projectName: p?.name ?? pid, hours: agg[pid] };
  });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Mock backend listening at http://localhost:${PORT}`);
  console.log('Test accounts: user@example.com / password  OR manager@example.com / password');
});