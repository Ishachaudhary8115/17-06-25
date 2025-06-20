const db = require('../Config/db');

// GET all users with optional search filters
exports.getUsers = (req, res) => {
  const { name, email } = req.query;
  let query = 'SELECT * FROM users';
  const params = [];
  const conditions = [];

  if (name && typeof name === 'string' && name.trim() !== '') {
    conditions.push('name LIKE ?');
    params.push(`%${name.trim()}%`);
  }
  if (email && typeof email === 'string' && email.trim() !== '') {
    conditions.push('email LIKE ?');
    params.push(`%${email.trim()}%`);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// DELETE multiple users by IDs
exports.deleteUsersBatch = (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Please provide a non-empty array of user IDs to delete.' });
  }
  // Filter out invalid IDs (non-number or less than 1)
  const validIds = ids.filter(id => Number.isInteger(id) && id > 0);
  if (validIds.length === 0) {
    return res.status(400).json({ error: 'No valid user IDs provided for deletion.' });
  }
  const placeholders = validIds.map(() => '?').join(',');
  const query = `DELETE FROM users WHERE id IN (${placeholders})`;
  db.query(query, validIds, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Users deleted successfully' });
  });
};

// CREATE user
exports.createUser = (req, res) => {
  const { name, email ,password,phone} = req.body;
  db.query('INSERT INTO users (name, email,password,phone) VALUES (?, ?, ?, ?)', [name, email,password,phone], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User created', userId: result.insertId });
  });
};

// UPDATE user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 3) {
    return res.status(400).json({ error: 'Password is required and must be at least 3 characters long' });
  }
  if (password.length > 8) {
    return res.status(400).json({ error: 'Password must not exceed 8 characters' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({ error: 'Phone is required and must be a non-empty string' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  db.query('UPDATE users SET name = ?, email = ?, password = ?, phone = ? WHERE id = ?', [name, email, password, phone, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User updated' });
  });
};

// DELETE user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User deleted' });
  });
};
