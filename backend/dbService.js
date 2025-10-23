// dbService.js
const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

let instance = null;

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
  console.log('db ' + connection.state);
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  // ====== EXISTING NAMES DEMO (unchanged) ======
  async getAllData() { /* ... keep your existing implementation ... */ }
  async insertNewName(name) { /* ... keep your existing implementation ... */ }
  async searchByName(name) { /* ... keep your existing implementation ... */ }
  async deleteRowById(id) { /* ... keep your existing implementation ... */ }
  async updateNameById(id, newName) { /* ... keep your existing implementation ... */ }

  // ====== USERS FEATURE SET (NEW) ======

  // Create (register) user with bcrypt hash
  async registerUser({ username, password, firstname, lastname, salary, age }) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hash = await bcrypt.hash(password, rounds);

    const payload = [
      username,
      hash,
      firstname,
      lastname,
      salary ?? null,
      age ?? null
    ];

    return await new Promise((resolve, reject) => {
      const q = `
        INSERT INTO Users (username, password, firstname, lastname, salary, age, registerday)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE)
      `;
      connection.query(q, payload, (err, result) => {
        if (err) {
          // duplicate username error, etc.
          return reject(new Error(err.message));
        }
        resolve({ success: true, username });
      });
    });
  }

  // Verify password and update sign-in time
  async signInUser({ username, password }) {
    const user = await this.getUserByUsername(username);
    if (!user) return { success: false, message: 'Invalid credentials' };
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return { success: false, message: 'Invalid credentials' };

    await new Promise((resolve, reject) => {
      const q = `UPDATE Users SET signintime = CURRENT_TIMESTAMP WHERE username = ?`;
      connection.query(q, [username], (err) => {
        if (err) return reject(new Error(err.message));
        resolve();
      });
    });

    // return user without password
    const { password: _, ...safe } = user;
    return { success: true, user: safe };
  }

  async getUserByUsername(username) {
    return await new Promise((resolve, reject) => {
      const q = `SELECT * FROM Users WHERE username = ?`;
      connection.query(q, [username], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows[0] || null);
      });
    });
  }

  async searchUsersByFirstLast({ first, last }) {
    // If missing, pass null and rely on IS NULL OR = ? trick
    const params = [
      first ?? null, first ?? null,
      last ?? null,  last ?? null
    ];
    const q = `
      SELECT * FROM Users
      WHERE (? IS NULL OR firstname = ?)
        AND (? IS NULL OR lastname = ?)
    `;
    return await new Promise((resolve, reject) => {
      connection.query(q, params, (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async searchUsersBySalaryRange(min, max) {
    return await new Promise((resolve, reject) => {
      const q = `SELECT * FROM Users WHERE salary BETWEEN ? AND ?`;
      connection.query(q, [min, max], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async searchUsersByAgeRange(min, max) {
    return await new Promise((resolve, reject) => {
      const q = `SELECT * FROM Users WHERE age BETWEEN ? AND ?`;
      connection.query(q, [min, max], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async registeredAfter(username) {
    const q = `
      SELECT u.*
      FROM Users u
      JOIN Users j ON j.username = ?
      WHERE u.registerday > j.registerday
    `;
    return await new Promise((resolve, reject) => {
      connection.query(q, [username], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async neverSignedIn() {
    return await new Promise((resolve, reject) => {
      const q = `SELECT * FROM Users WHERE signintime IS NULL`;
      connection.query(q, [], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async sameDayAs(username) {
    const q = `
      SELECT u.*
      FROM Users u
      JOIN Users j ON j.username = ?
      WHERE u.registerday = j.registerday
    `;
    return await new Promise((resolve, reject) => {
      connection.query(q, [username], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }

  async registeredToday() {
    return await new Promise((resolve, reject) => {
      const q = `SELECT * FROM Users WHERE registerday = CURRENT_DATE`;
      connection.query(q, [], (err, rows) => {
        if (err) return reject(new Error(err.message));
        resolve(rows);
      });
    });
  }
}

module.exports = DbService;
