// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ===== AUTH =====
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password, firstname, lastname, salary, age } = req.body;
    if (!username || !password || !firstname || !lastname) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = dbService.getDbServiceInstance();

    // prevent duplicate usernames
    const exists = await db.getUserByUsername(username);
    if (exists) return res.status(409).json({ error: 'Username already exists' });

    const result = await db.registerUser({ username, password, firstname, lastname, salary, age });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = dbService.getDbServiceInstance();
    const result = await db.signInUser({ username, password });
    if (!result.success) return res.status(401).json(result);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===== USER SEARCHES =====

// 1) first and/or last name
// /users/search?first=John&last=Doe  (either param optional)
app.get('/users/search', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const { first, last } = req.query;
    const rows = await db.searchUsersByFirstLast({ first: first || null, last: last || null });
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 2) by userid (username)
app.get('/users/:username', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const row = await db.getUserByUsername(req.params.username);
    if (!row) return res.status(404).json({ error: 'Not found' });
    // hide password
    const { password, ...safe } = row;
    res.json({ data: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// 3) salary between X and Y
app.get('/users/salary/range', async (req, res) => {
  try {
    const { min, max } = req.query;
    if (min == null || max == null) return res.status(400).json({ error: 'min and max required' });
    const db = dbService.getDbServiceInstance();
    const rows = await db.searchUsersBySalaryRange(Number(min), Number(max));
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 4) age between X and Y
app.get('/users/age/range', async (req, res) => {
  try {
    const { min, max } = req.query;
    if (min == null || max == null) return res.status(400).json({ error: 'min and max required' });
    const db = dbService.getDbServiceInstance();
    const rows = await db.searchUsersByAgeRange(Number(min), Number(max));
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 5) registered after john (by userid)
app.get('/users/registered-after/:username', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const rows = await db.registeredAfter(req.params.username);
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 6) never signed in
app.get('/users/never-signed-in', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const rows = await db.neverSignedIn();
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 7) registered same day as john
app.get('/users/same-day-as/:username', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const rows = await db.sameDayAs(req.params.username);
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 8) registered today
app.get('/users/registered-today', async (req, res) => {
  try {
    const db = dbService.getDbServiceInstance();
    const rows = await db.registeredToday();
    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ======== KEEP your existing demo routes below ========

// ... your /insert, /getAll, /search/:name, /update, /delete/:id, /debug, /testdb etc ...

// Listener (use env if you prefer)
app.listen(5050, () => {
  console.log('I am listening on the fixed port 5050.');
});
