const express = require('express');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Database
const adapter = new FileSync(path.join(__dirname, '../db.json'));
const db = low(adapter);
db.defaults({ users: [], earnings: [], withdrawals: [], ads: [] }).write();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../web')));

// ==================== AUTH ====================
app.post('/api/auth/google', (req, res) => {
    const { googleId, name, email, avatar } = req.body;
    let user = db.get('users').find({ googleId }).value();
    if (!user) {
        user = { id: uuidv4(), googleId, name, email, avatar, joinedAt: new Date().toISOString(), walletAddress: '' };
        db.get('users').push(user).write();
    }
    res.json({ success: true, user });
});

// ==================== EARNINGS ====================
app.post('/api/earn', (req, res) => {
    const { userId, type, amount, desc, icon } = req.body;
    const entry = { id: uuidv4(), userId, type, amount, desc, icon, time: new Date().toISOString() };
    db.get('earnings').push(entry).write();
    const userEarnings = db.get('earnings').filter({ userId }).value();
    const total = userEarnings.reduce((s, e) => s + e.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = userEarnings.filter(e => e.time.startsWith(today)).reduce((s, e) => s + e.amount, 0);
    res.json({ success: true, entry, total, today: todayTotal, adsWatched: userEarnings.length });
});

app.get('/api/earnings/:userId', (req, res) => {
    const earnings = db.get('earnings').filter({ userId: req.params.userId }).value();
    const total = earnings.reduce((s, e) => s + e.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = earnings.filter(e => e.time.startsWith(today)).reduce((s, e) => s + e.amount, 0);
    res.json({ earnings, total, today: todayTotal, adsWatched: earnings.length });
});

// ==================== WITHDRAWALS ====================
app.post('/api/withdraw', (req, res) => {
    const { userId, address, amount } = req.body;
    if (!address || !address.startsWith('0x')) return res.json({ success: false, error: 'Invalid address' });
    if (!amount || amount < 1) return res.json({ success: false, error: 'Min $1' });
    const userEarnings = db.get('earnings').filter({ userId }).value();
    const total = userEarnings.reduce((s, e) => s + e.amount, 0);
    const withdrawn = db.get('withdrawals').filter({ userId }).value().reduce((s, w) => s + w.amount, 0);
    if (total - withdrawn < amount) return res.json({ success: false, error: 'Insufficient balance' });
    const withdrawal = { id: uuidv4(), userId, address, amount, status: 'completed', txHash: '0x' + uuidv4().replace(/-/g, ''), time: new Date().toISOString() };
    db.get('withdrawals').push(withdrawal).write();
    res.json({ success: true, withdrawal });
});

app.get('/api/withdrawals/:userId', (req, res) => {
    const withdrawals = db.get('withdrawals').filter({ userId: req.params.userId }).value();
    res.json({ withdrawals });
});

// ==================== ADMIN ====================
app.get('/api/admin/stats', (req, res) => {
    const users = db.get('users').value().length;
    const earnings = db.get('earnings').value();
    const totalRevenue = earnings.reduce((s, e) => s + e.amount, 0);
    const withdrawals = db.get('withdrawals').value();
    const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
    res.json({ users, totalRevenue, adsWatched: earnings.length, totalWithdrawn });
});

app.get('/api/admin/users', (req, res) => {
    const users = db.get('users').value().slice(-50).reverse();
    res.json({ users });
});

// Serve SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/index.html'));
});

app.listen(PORT, () => {
    console.log(`AttentionPay server running on port ${PORT}`);
});
