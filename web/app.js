// ==================== CONFIG ====================
const API = window.location.origin + '/api';
let currentUser = null;
let earnings = { total: 0, today: 0, adsWatched: 0, streak: 0 };
let history = [];
let videoTimer = null;

// ==================== AD DATA ====================
const VIDEO_ADS = [
    { brand: 'Binance', text: 'Trade Bitcoin & Crypto — Zero Fees!', reward: 0.03, duration: 30, icon: '🪙' },
    { brand: 'Coinbase', text: 'Buy Your First Crypto — Get $5 Free!', reward: 0.02, duration: 20, icon: '💰' },
    { brand: 'Bybit', text: 'Derivatives Trading — 100x Leverage!', reward: 0.04, duration: 30, icon: '📈' },
    { brand: 'Ledger', text: 'Hardware Wallet — Your Keys, Your Crypto!', reward: 0.05, duration: 45, icon: '🔐' },
    { brand: 'MetaMask', text: 'Your Gateway to Web3 — Install Now!', reward: 0.02, duration: 20, icon: '🦊' },
    { brand: 'Uniswap', text: 'Swap Tokens on Ethereum — Decentralized!', reward: 0.03, duration: 30, icon: '🦄' },
    { brand: 'OpenSea', text: 'The #1 NFT Marketplace — Explore Now!', reward: 0.02, duration: 25, icon: '🖼️' },
    { brand: 'Chainlink', text: 'Oracle Network powering smart contracts!', reward: 0.04, duration: 35, icon: '🔗' },
];

const BANNER_ADS = [
    { brand: 'Crypto.com', text: 'Buy BTC, ETH & 250+ coins', reward: 0.003, icon: '💳' },
    { brand: 'Kraken', text: 'Secure Crypto Exchange', reward: 0.002, icon: '🐙' },
    { brand: 'Bitfinex', text: 'Professional Crypto Trading', reward: 0.004, icon: '📊' },
    { brand: 'Gate.io', text: '600+ Coins Listed', reward: 0.002, icon: '🚪' },
    { brand: 'KuCoin', text: 'The People\'s Exchange', reward: 0.003, icon: '🟠' },
    { brand: 'OKX', text: 'Trade. Earn. Web3.', reward: 0.003, icon: '✅' },
];

const SURVEYS = [
    { title: 'Crypto Usage Survey', desc: 'Tell us about your crypto habits', reward: 0.50, time: '5 min', questions: 10 },
    { title: 'DeFi Experience', desc: 'Share your DeFi knowledge', reward: 1.00, time: '8 min', questions: 15 },
    { title: 'NFT Interest Survey', desc: 'Do you collect NFTs?', reward: 0.30, time: '3 min', questions: 8 },
    { title: 'Payment Preferences', desc: 'How do you pay online?', reward: 0.40, time: '4 min', questions: 10 },
    { title: 'Trading Habits', desc: 'Your crypto trading patterns', reward: 0.80, time: '6 min', questions: 12 },
    { title: 'Web3 Adoption', desc: 'Are you ready for Web3?', reward: 0.60, time: '5 min', questions: 10 },
];

const APP_INSTALLS = [
    { name: 'Trust Wallet', desc: 'Secure multi-chain wallet', reward: 1.00, icon: '🛡️' },
    { name: 'Phantom Wallet', desc: 'Solana wallet for DeFi & NFTs', reward: 0.80, icon: '👻' },
    { name: 'Rainbow Wallet', desc: 'Beautiful Ethereum wallet', reward: 0.70, icon: '🌈' },
    { name: 'Argent Wallet', desc: 'Smart wallet for Ethereum', reward: 0.90, icon: 'argent' },
    { name: 'Brave Browser', desc: 'Privacy browser with crypto rewards', reward: 0.50, icon: '🦁' },
    { name: 'Presearch', desc: 'Decentralized search engine', reward: 0.40, icon: '🔍' },
];

const CRYPTO_SIGNUPS = [
    { name: 'Binance', desc: 'World\'s #1 crypto exchange. Register & verify to earn.', reward: 5.00, icon: '🟡', url: '#', time: '10 min' },
    { name: 'Coinbase', desc: 'Buy & sell crypto easily. New users get $5 bonus.', reward: 3.00, icon: '🔵', url: '#', time: '5 min' },
    { name: 'Bybit', desc: 'Professional derivatives trading platform.', reward: 4.00, icon: '⚫', url: '#', time: '8 min' },
    { name: 'Kraken', desc: 'Secure & trusted exchange since 2011.', reward: 3.50, icon: '🟣', url: '#', time: '7 min' },
    { name: 'KuCoin', desc: '600+ coins, low fees, high liquidity.', reward: 2.50, icon: '🟠', url: '#', time: '5 min' },
    { name: 'OKX', desc: 'Trade, earn, and explore Web3.', reward: 3.00, icon: '✅', url: '#', time: '6 min' },
];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('attentionpay_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        loadUserData();
        switchPage('app');
    }
});

// ==================== NAVIGATION ====================
function showLanding() { switchPage('landing'); }
function showLogin() { switchPage('login'); }

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    if (navItem) navItem.classList.add('active');
    if (tab === 'video') renderVideoQueue();
    if (tab === 'banner') renderBanners();
    if (tab === 'survey') renderSurveys();
    if (tab === 'install') renderInstalls();
    if (tab === 'crypto') renderCrypto();
    if (tab === 'history') renderHistory();
    if (tab === 'wallet') updateWallet();
}

// ==================== AUTH ====================
function googleLogin() {
    // Simulate Google login (in production, use Google OAuth)
    currentUser = {
        id: 'user_' + Date.now(),
        name: 'User' + Math.floor(Math.random() * 9999),
        email: 'user' + Date.now() + '@gmail.com',
        avatar: null,
        joinedAt: new Date().toISOString(),
        walletAddress: ''
    };
    localStorage.setItem('attentionpay_user', JSON.stringify(currentUser));
    loadUserData();
    switchPage('app');
    showToast('Welcome to AttentionPay! Start watching ads to earn USDC 🎉');
}

function logout() {
    localStorage.removeItem('attentionpay_user');
    currentUser = null;
    switchPage('landing');
}

// ==================== DASHBOARD ====================
function loadUserData() {
    const saved = localStorage.getItem('attentionpay_earnings_' + currentUser.id);
    if (saved) earnings = JSON.parse(saved);
    const savedHistory = localStorage.getItem('attentionpay_history_' + currentUser.id);
    if (savedHistory) history = JSON.parse(savedHistory);
    updateDashboard();
}

function saveUserData() {
    localStorage.setItem('attentionpay_earnings_' + currentUser.id, JSON.stringify(earnings));
    localStorage.setItem('attentionpay_history_' + currentUser.id, JSON.stringify(history));
}

function updateDashboard() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-balance').textContent = '$' + earnings.total.toFixed(2);
    document.getElementById('total-earnings').textContent = '$' + earnings.total.toFixed(2);
    document.getElementById('today-earnings').textContent = '$' + earnings.today.toFixed(2);
    document.getElementById('total-ads').textContent = earnings.adsWatched;
    document.getElementById('streak-count').textContent = earnings.streak;
    document.getElementById('wallet-balance').textContent = '$' + earnings.total.toFixed(2);
    const withdrawBtn = document.getElementById('withdraw-btn');
    const walletNote = document.getElementById('wallet-note');
    if (earnings.adsWatched >= 50) {
        withdrawBtn.disabled = false;
        walletNote.textContent = 'You can withdraw! Min $1, instant USDC payout.';
    } else {
        withdrawBtn.disabled = true;
        walletNote.textContent = `Watch ${50 - earnings.adsWatched} more ads to unlock withdrawals`;
    }
    renderRecentActivity();
    renderChart();
}

function renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (history.length === 0) {
        container.innerHTML = '<div class="activity-empty">No activity yet. Start watching ads!</div>';
        return;
    }
    container.innerHTML = history.slice(0, 10).map(h => `
        <div class="activity-item">
            <div class="activity-left">
                <span class="activity-icon">${h.icon}</span>
                <div>
                    <div class="activity-text">${h.desc}</div>
                    <div class="activity-time">${timeAgo(h.time)}</div>
                </div>
            </div>
            <span class="activity-amount">+$${h.amount.toFixed(2)}</span>
        </div>
    `).join('');
}

function renderChart() {
    const canvas = document.getElementById('earningsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.offsetWidth - 48;
    const h = canvas.height = 200;
    ctx.clearRect(0, 0, w, h);
    // Simple bar chart from history (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayTotal = history.filter(x => x.time && x.time.startsWith(key)).reduce((s, x) => s + x.amount, 0);
        days.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), total: dayTotal });
    }
    const max = Math.max(...days.map(d => d.total), 0.01);
    const barW = (w - 40) / 7;
    days.forEach((d, i) => {
        const barH = (d.total / max) * (h - 40);
        const x = 20 + i * barW + barW * 0.2;
        const y = h - 20 - barH;
        const grad = ctx.createLinearGradient(x, y, x, h - 20);
        grad.addColorStop(0, '#00d4ff');
        grad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW * 0.6, barH, 4);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barW * 0.3, h - 5);
        if (d.total > 0) {
            ctx.fillStyle = '#e0e0e0';
            ctx.fillText('$' + d.total.toFixed(2), x + barW * 0.3, y - 5);
        }
    });
}

// ==================== VIDEO ADS ====================
function renderVideoQueue() {
    const container = document.getElementById('video-queue');
    const player = document.getElementById('video-player');
    player.style.display = 'none';
    container.style.display = 'grid';
    container.innerHTML = VIDEO_ADS.map((ad, i) => `
        <div class="ad-queue-item" onclick="startVideoAd(${i})">
            <span class="ad-queue-icon">${ad.icon}</span>
            <div class="ad-queue-info">
                <h4>${ad.brand}</h4>
                <p>${ad.duration}s video</p>
            </div>
            <span class="ad-queue-reward">+$${ad.reward.toFixed(2)}</span>
        </div>
    `).join('');
}

function startVideoAd(index) {
    const ad = VIDEO_ADS[index];
    const queue = document.getElementById('video-queue');
    const player = document.getElementById('video-player');
    queue.style.display = 'none';
    player.style.display = 'block';
    document.getElementById('video-ad-brand').textContent = ad.brand;
    document.getElementById('video-ad-text').textContent = ad.text;
    document.getElementById('video-earn').textContent = '+$' + ad.reward.toFixed(2);
    document.getElementById('skip-countdown').textContent = ad.duration;
    document.getElementById('video-skip-btn').disabled = true;
    let remaining = ad.duration;
    const fill = document.getElementById('video-timer-fill');
    fill.style.width = '0%';
    document.getElementById('video-timer').textContent = formatTime(remaining);
    videoTimer = setInterval(() => {
        remaining--;
        document.getElementById('video-timer').textContent = formatTime(remaining);
        document.getElementById('skip-countdown').textContent = remaining;
        fill.style.width = ((ad.duration - remaining) / ad.duration * 100) + '%';
        if (remaining <= 0) {
            clearInterval(videoTimer);
            completeVideoAd(ad);
        }
    }, 1000);
}

function skipVideoAd() {
    clearInterval(videoTimer);
    renderVideoQueue();
}

function completeVideoAd(ad) {
    earnings.total += ad.reward;
    earnings.today += ad.reward;
    earnings.adsWatched++;
    history.unshift({ icon: ad.icon, desc: ad.brand + ' video ad', amount: ad.reward, time: new Date().toISOString(), type: 'video' });
    saveUserData();
    updateDashboard();
    showToast(`+$${ad.reward.toFixed(2)} earned from ${ad.brand}! 💰`);
    setTimeout(() => renderVideoQueue(), 1500);
}

// ==================== BANNER ADS ====================
function renderBanners() {
    document.getElementById('banner-grid').innerHTML = BANNER_ADS.map((ad, i) => `
        <div class="banner-card" onclick="completeBanner(${i})">
            <div class="banner-ad">
                <span style="font-size:3rem">${ad.icon}</span>
                <h3>${ad.brand}</h3>
                <p>${ad.text}</p>
            </div>
            <span class="banner-earn">+$${ad.reward.toFixed(3)} per view</span>
        </div>
    `).join('');
}

function completeBanner(index) {
    const ad = BANNER_ADS[index];
    earnings.total += ad.reward;
    earnings.today += ad.reward;
    earnings.adsWatched++;
    history.unshift({ icon: ad.icon, desc: ad.brand + ' banner', amount: ad.reward, time: new Date().toISOString(), type: 'banner' });
    saveUserData();
    updateDashboard();
    showToast(`+$${ad.reward.toFixed(3)} earned from ${ad.brand}! 💰`);
}

// ==================== SURVEYS ====================
function renderSurveys() {
    document.getElementById('survey-list').innerHTML = SURVEYS.map((s, i) => `
        <div class="survey-item" onclick="completeSurvey(${i})">
            <div class="survey-info">
                <h4>📝 ${s.title}</h4>
                <p>${s.desc} • ${s.questions} questions</p>
            </div>
            <div class="survey-meta">
                <span class="survey-time">⏱ ${s.time}</span>
                <span class="survey-earn">+$${s.reward.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function completeSurvey(index) {
    const s = SURVEYS[index];
    earnings.total += s.reward;
    earnings.today += s.reward;
    earnings.adsWatched++;
    history.unshift({ icon: '📝', desc: s.title, amount: s.reward, time: new Date().toISOString(), type: 'survey' });
    saveUserData();
    updateDashboard();
    showToast(`+$${s.reward.toFixed(2)} earned from survey! 💰`);
}

// ==================== APP INSTALLS ====================
function renderInstalls() {
    document.getElementById('install-list').innerHTML = APP_INSTALLS.map((a, i) => `
        <div class="install-card">
            <div class="install-icon">${a.icon}</div>
            <h4>${a.name}</h4>
            <p>${a.desc}</p>
            <div class="install-earn">+$${a.reward.toFixed(2)}</div>
            <button class="btn btn-primary btn-sm" onclick="completeInstall(${i})">Install & Earn</button>
        </div>
    `).join('');
}

function completeInstall(index) {
    const a = APP_INSTALLS[index];
    earnings.total += a.reward;
    earnings.today += a.reward;
    earnings.adsWatched++;
    history.unshift({ icon: '📱', desc: a.name + ' install', amount: a.reward, time: new Date().toISOString(), type: 'install' });
    saveUserData();
    updateDashboard();
    showToast(`+$${a.reward.toFixed(2)} earned from ${a.name} install! 💰`);
}

// ==================== CRYPTO SIGNUPS ====================
function renderCrypto() {
    document.getElementById('crypto-list').innerHTML = CRYPTO_SIGNUPS.map((c, i) => `
        <div class="crypto-card">
            <div class="crypto-header">
                <span class="crypto-logo">${c.icon}</span>
                <h4>${c.name}</h4>
            </div>
            <p>${c.desc}</p>
            <div class="crypto-reward">
                <span class="crypto-amount">+$${c.reward.toFixed(2)}</span>
                <button class="crypto-btn" onclick="completeCrypto(${i})">Sign Up</button>
            </div>
        </div>
    `).join('');
}

function completeCrypto(index) {
    const c = CRYPTO_SIGNUPS[index];
    earnings.total += c.reward;
    earnings.today += c.reward;
    earnings.adsWatched++;
    history.unshift({ icon: '🔗', desc: c.name + ' signup', amount: c.reward, time: new Date().toISOString(), type: 'crypto' });
    saveUserData();
    updateDashboard();
    showToast(`+$${c.reward.toFixed(2)} earned from ${c.name} signup! 💰`);
}

// ==================== HISTORY ====================
function renderHistory(filter = 'all') {
    let filtered = [...history];
    const now = new Date();
    if (filter === 'today') {
        const today = now.toISOString().split('T')[0];
        filtered = filtered.filter(h => h.time && h.time.startsWith(today));
    } else if (filter === 'week') {
        const weekAgo = new Date(now - 7 * 86400000).toISOString();
        filtered = filtered.filter(h => h.time >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now - 30 * 86400000).toISOString();
        filtered = filtered.filter(h => h.time >= monthAgo);
    }
    const total = filtered.reduce((s, h) => s + h.amount, 0);
    document.getElementById('history-list').innerHTML = `
        <div class="history-item" style="background:rgba(0,212,255,0.05)">
            <span class="history-type">📊</span>
            <span class="history-desc"><strong>Total (${filtered.length} entries)</strong></span>
            <span class="history-amount"><strong>$${total.toFixed(2)}</strong></span>
            <span class="history-time">—</span>
        </div>
        ${filtered.map(h => `
            <div class="history-item">
                <span class="history-type">${h.icon}</span>
                <span class="history-desc">${h.desc}</span>
                <span class="history-amount">+$${h.amount.toFixed(3)}</span>
                <span class="history-time">${timeAgo(h.time)}</span>
            </div>
        `).join('')}
    `;
}

function filterHistory(filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderHistory(filter);
}

// ==================== WALLET ====================
function updateWallet() {
    document.getElementById('wallet-balance').textContent = '$' + earnings.total.toFixed(2);
    document.getElementById('withdraw-available').textContent = '$' + earnings.total.toFixed(2);
    if (earnings.adsWatched >= 50) {
        document.getElementById('withdraw-btn').disabled = false;
        document.getElementById('wallet-note').textContent = 'You can withdraw! Min $1, instant USDC payout.';
    }
}

function showWithdraw() {
    if (earnings.adsWatched < 50) {
        showToast('Watch at least 50 ads to unlock withdrawals!', true);
        return;
    }
    document.getElementById('withdraw-modal').style.display = 'flex';
    document.getElementById('withdraw-available').textContent = '$' + earnings.total.toFixed(2);
}

function closeWithdraw() { document.getElementById('withdraw-modal').style.display = 'none'; }

function setMaxWithdraw() {
    document.getElementById('withdraw-amount').value = earnings.total.toFixed(2);
}

function processWithdraw() {
    const address = document.getElementById('withdraw-address').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!address || !address.startsWith('0x')) {
        showToast('Enter a valid Base chain address (0x...)', true);
        return;
    }
    if (!amount || amount < 1) {
        showToast('Minimum withdrawal is $1', true);
        return;
    }
    if (amount > earnings.total) {
        showToast('Insufficient balance', true);
        return;
    }
    earnings.total -= amount;
    history.unshift({ icon: '💸', desc: 'USDC withdrawal to ' + address.slice(0, 10) + '...', amount: -amount, time: new Date().toISOString(), type: 'withdraw' });
    saveUserData();
    updateDashboard();
    closeWithdraw();
    showToast(`$${amount.toFixed(2)} USDC withdrawn instantly! ⚡`);
    document.getElementById('withdraw-address').value = '';
    document.getElementById('withdraw-amount').value = '';
}

// ==================== UTILS ====================
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => toast.className = 'toast', 3000);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

// Animate stats on load
setInterval(() => {
    const el = document.getElementById('stat-users');
    if (el) {
        const base = 12847;
        el.textContent = (base + Math.floor(Math.random() * 20)).toLocaleString();
    }
}, 5000);
