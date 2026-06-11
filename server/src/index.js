const express = require('express');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');

// ==================== DATABASE ====================
const adapter = new FileSync(path.join(__dirname, '../db.json'));
const db = low(adapter);

db.defaults({
    users: [],
    earnings: [],
    withdrawals: [],
    adminStats: { totalRevenue: 0, totalWithdrawn: 0, totalAdsWatched: 0 }
}).write();

const app = express();
app.use(cors());
app.use(express.json());

// Serve web files
app.use(express.static(path.join(__dirname, '../../web')));

// ==================== AUTH ====================
app.post('/api/auth/google', (req, res) => {
    const { googleId, name, email, avatar } = req.body;
    if (!googleId || !email) {
        return res.status(400).json({ error: 'Google ID and email required' });
    }

    let user = db.get('users').find({ googleId }).value();
    if (!user) {
        user = {
            id: uuidv4(),
            googleId,
            name,
            email,
            avatar,
            walletAddress: '',
            joinedAt: new Date().toISOString(),
            level: 1,
            streak: 0,
            lastLogin: new Date().toISOString(),
            adsWatched: 0,
            totalEarned: 0
        };
        db.get('users').push(user).write();
    } else {
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            user.streak = (user.streak || 0) + 1;
        } else if (diffDays > 1) {
            user.streak = 1;
        }
        user.lastLogin = now.toISOString();
        db.get('users').find({ id: user.id }).assign(user).write();
    }

    res.json({ success: true, user });
});

// ==================== EARNINGS ====================
app.post('/api/earn', (req, res) => {
    const { userId, type, amount, desc, icon } = req.body;
    if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
    }

    const earning = {
        id: uuidv4(),
        userId,
        type: type || 'unknown',
        amount: parseFloat(amount),
        desc: desc || '',
        icon: icon || '💰',
        createdAt: new Date().toISOString()
    };

    db.get('earnings').push(earning).write();

    const user = db.get('users').find({ id: userId }).value();
    if (user) {
        user.totalEarned = (user.totalEarned || 0) + earning.amount;
        user.adsWatched = (user.adsWatched || 0) + 1;
        user.level = Math.floor(user.adsWatched / 50) + 1;
        db.get('users').find({ id: userId }).assign(user).write();
    }

    const stats = db.get('adminStats').value();
    stats.totalRevenue += earning.amount;
    stats.totalAdsWatched += 1;
    db.get('adminStats').assign(stats).write();

    res.json({ success: true, earning });
});

app.get('/api/earnings/:userId', (req, res) => {
    const earnings = db.get('earnings').filter({ userId: req.params.userId }).value();
    const total = earnings.reduce((sum, e) => sum + e.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = earnings
        .filter(e => e.createdAt && e.createdAt.startsWith(today))
        .reduce((sum, e) => sum + e.amount, 0);

    res.json({ earnings, total, today: todayTotal, count: earnings.length });
});

// ==================== WITHDRAWALS ====================
app.post('/api/withdraw', (req, res) => {
    const { userId, address, amount } = req.body;
    if (!userId || !address || !amount) {
        return res.status(400).json({ error: 'userId, address, and amount required' });
    }

    if (!address.startsWith('0x')) {
        return res.status(400).json({ error: 'Invalid Base chain address' });
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount < 1) {
        return res.status(400).json({ error: 'Minimum withdrawal is $1' });
    }

    const userEarnings = db.get('earnings').filter({ userId }).value();
    const userWithdrawals = db.get('withdrawals').filter({ userId }).value();
    const totalEarned = userEarnings.reduce((sum, e) => sum + e.amount, 0);
    const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const available = totalEarned - totalWithdrawn;

    if (parsedAmount > available) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (userEarnings.length < 50) {
        return res.status(400).json({ error: 'Watch at least 50 ads to unlock withdrawals' });
    }

    const txHash = '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

    const withdrawal = {
        id: uuidv4(),
        userId,
        address,
        amount: parsedAmount,
        txHash,
        chain: 'base',
        status: 'completed',
        createdAt: new Date().toISOString()
    };

    db.get('withdrawals').push(withdrawal).write();

    const stats = db.get('adminStats').value();
    stats.totalWithdrawn += parsedAmount;
    db.get('adminStats').assign(stats).write();

    res.json({ success: true, withdrawal });
});

app.get('/api/withdrawals/:userId', (req, res) => {
    const withdrawals = db.get('withdrawals').filter({ userId: req.params.userId }).value();
    res.json({ withdrawals });
});

// ==================== ADMIN ====================
app.get('/api/admin/stats', (req, res) => {
    const users = db.get('users').value().length;
    const stats = db.get('adminStats').value();
    res.json({
        users,
        totalRevenue: stats.totalRevenue || 0,
        totalWithdrawn: stats.totalWithdrawn || 0,
        adsWatched: stats.totalAdsWatched || 0,
        pendingWithdrawals: db.get('withdrawals').filter({ status: 'pending' }).value().length
    });
});

app.get('/api/admin/users', (req, res) => {
    const users = db.get('users').value().map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        level: u.level,
        adsWatched: u.adsWatched,
        totalEarned: u.totalEarned,
        joinedAt: u.joinedAt,
        lastLogin: u.lastLogin
    }));
    res.json({ users });
});

app.get('/api/admin/withdrawals', (req, res) => {
    const withdrawals = db.get('withdrawals').value();
    res.json({ withdrawals });
});

// ==================== LEADERBOARD ====================
app.get('/api/leaderboard', (req, res) => {
    const users = db.get('users')
        .sortBy('totalEarned')
        .reverse()
        .take(100)
        .value()
        .map((u, i) => ({
            rank: i + 1,
            name: u.name,
            avatar: u.avatar,
            totalEarned: u.totalEarned || 0,
            adsWatched: u.adsWatched || 0,
            level: u.level || 1
        }));
    res.json({ leaderboard: users });
});

// ==================== SURVEY CALLBACKS ====================
app.post('/api/survey/callback', (req, res) => {
    const { userId, surveyId, reward, status } = req.body;
    if (status === 'completed' && reward > 0) {
        const earning = {
            id: uuidv4(),
            userId,
            type: 'survey',
            amount: parseFloat(reward),
            desc: `Survey ${surveyId} completed`,
            icon: '📝',
            createdAt: new Date().toISOString()
        };
        db.get('earnings').push(earning).write();

        const user = db.get('users').find({ id: userId }).value();
        if (user) {
            user.totalEarned = (user.totalEarned || 0) + earning.amount;
            user.adsWatched = (user.adsWatched || 0) + 1;
            db.get('users').find({ id: userId }).assign(user).write();
        }
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ==================== HILLTOPADS VERIFICATION ====================
app.get('/d37dac8e7052fc858527.txt', (req, res) => {
    res.type('text/plain').send('d37dac8e7052fc858527');
});

// ==================== CATCH ALL ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/index.html'));
});

// ==================== START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AttentionPay server running on port ${PORT}`);
});
// HilltopAds verified
