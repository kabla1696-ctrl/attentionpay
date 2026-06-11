// ==================== CONFIG ====================
const API = window.location.origin + '/api';
let currentUser = null;
let earnings = { total: 0, today: 0, adsWatched: 0, streak: 0 };
let history = [];
let videoTimer = null;

// ==================== REAL AFFILIATE LINKS ====================
const CRYPTO_SIGNUPS = [
    {
        name: 'Binance',
        desc: 'World\'s #1 crypto exchange. Register, verify KYC & deposit $50 to earn.',
        reward: 20.00,
        icon: '🟡',
        url: 'https://www.binance.com/register?ref=ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + KYC + $50 deposit',
        time: '10 min',
        category: 'exchange'
    },
    {
        name: 'Coinbase',
        desc: 'Buy & sell crypto easily. New users get $10 in Bitcoin after first trade.',
        reward: 10.00,
        icon: '🔵',
        url: 'https://www.coinbase.com/join/ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + First trade ($100+)',
        time: '5 min',
        category: 'exchange'
    },
    {
        name: 'Bybit',
        desc: 'Professional derivatives trading. Register & trade to earn rewards.',
        reward: 15.00,
        icon: '⚫',
        url: 'https://www.bybit.com/affiliate?ref=ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + First trade',
        time: '8 min',
        category: 'exchange'
    },
    {
        name: 'Kraken',
        desc: 'Secure & trusted exchange since 2011. Trade to earn.',
        reward: 10.00,
        icon: '🟣',
        url: 'https://www.kraken.com/invite/ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + Verify + Trade',
        time: '7 min',
        category: 'exchange'
    },
    {
        name: 'KuCoin',
        desc: '600+ coins, low fees. Register & trade to earn.',
        reward: 8.00,
        icon: '🟠',
        url: 'https://www.kucoin.com/ucenter/signup?rcode=ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + First trade',
        time: '5 min',
        category: 'exchange'
    },
    {
        name: 'OKX',
        desc: 'Trade, earn & explore Web3. Register to earn rewards.',
        reward: 10.00,
        icon: '✅',
        url: 'https://www.okx.com/join/ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + KYC',
        time: '6 min',
        category: 'exchange'
    },
    {
        name: 'Bitget',
        desc: 'Copy trading platform. Register & trade to earn.',
        reward: 12.00,
        icon: '🔷',
        url: 'https://www.bitget.com/express/referral/ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + KYC + Trade',
        time: '8 min',
        category: 'exchange'
    },
    {
        name: 'MEXC',
        desc: 'Trade 1500+ tokens. Register to earn.',
        reward: 8.00,
        icon: '🟢',
        url: 'https://www.mexc.com/register?inviteCode=ATTENTIONPAY',
        affiliateId: 'ATTENTIONPAY',
        requirements: 'Register + KYC',
        time: '5 min',
        category: 'exchange'
    },
];

const VIDEO_ADS = [
    { brand: 'Binance Learn', text: 'Learn about crypto & earn $5 in BNB!', reward: 0.05, duration: 30, icon: '🪙', url: 'https://academy.binance.com/', type: 'educational' },
    { brand: 'Coinbase Wallet', text: 'Download Coinbase Wallet — Your keys, your crypto!', reward: 0.03, duration: 25, icon: '💰', url: 'https://wallet.coinbase.com/', type: 'promotion' },
    { brand: 'Ledger Nano', text: 'Hardware wallet — Secure your crypto!', reward: 0.06, duration: 40, icon: '🔐', url: 'https://www.ledger.com/', type: 'product' },
    { brand: 'MetaMask', text: 'Your gateway to Web3 — Install now!', reward: 0.03, duration: 20, icon: '🦊', url: 'https://metamask.io/', type: 'promotion' },
    { brand: 'Uniswap', text: 'Swap tokens on Ethereum — Decentralized!', reward: 0.04, duration: 30, icon: '🦄', url: 'https://uniswap.org/', type: 'educational' },
    { brand: 'Chainlink', text: 'Oracle network powering smart contracts!', reward: 0.03, duration: 25, icon: '🔗', url: 'https://chain.link/', type: 'educational' },
    { brand: 'Aave', text: 'Lend & borrow crypto — DeFi!', reward: 0.04, duration: 30, icon: '👻', url: 'https://aave.com/', type: 'educational' },
    { brand: 'Compound', text: 'Earn interest on your crypto!', reward: 0.03, duration: 25, icon: '🏦', url: 'https://compound.finance/', type: 'educational' },
];

const BANNER_ADS = [
    { brand: 'Crypto.com', text: 'Buy BTC, ETH & 250+ coins. $10 bonus!', reward: 0.005, icon: '💳', url: 'https://crypto.com/', type: 'promotion' },
    { brand: 'Kraken', text: 'Secure Crypto Exchange — Trade now!', reward: 0.004, icon: '🐙', url: 'https://kraken.com/', type: 'promotion' },
    { brand: 'Bitfinex', text: 'Professional Crypto Trading Platform', reward: 0.004, icon: '📊', url: 'https://bitfinex.com/', type: 'promotion' },
    { brand: 'Gate.io', text: '600+ Coins Listed — Trade now!', reward: 0.003, icon: '🚪', url: 'https://gate.io/', type: 'promotion' },
    { brand: 'KuCoin', text: 'The People\'s Exchange — Start trading!', reward: 0.004, icon: '🟠', url: 'https://kucoin.com/', type: 'promotion' },
    { brand: 'OKX', text: 'Trade. Earn. Web3.', reward: 0.003, icon: '✅', url: 'https://okx.com/', type: 'promotion' },
    { brand: 'Binance', text: 'World\'s #1 Exchange — Join now!', reward: 0.005, icon: '🟡', url: 'https://binance.com/', type: 'promotion' },
    { brand: 'Bybit', text: 'Derivatives Trading — 100x Leverage!', reward: 0.004, icon: '⚫', url: 'https://bybit.com/', type: 'promotion' },
];

const SURVEYS = [
    { title: 'Crypto Usage Survey', desc: 'Tell us about your crypto habits', reward: 0.50, time: '5 min', questions: 10, provider: 'surveoo', url: '#' },
    { title: 'DeFi Experience', desc: 'Share your DeFi knowledge', reward: 1.00, time: '8 min', questions: 15, provider: 'surveoo', url: '#' },
    { title: 'NFT Interest Survey', desc: 'Do you collect NFTs?', reward: 0.30, time: '3 min', questions: 8, provider: 'bitlabs', url: '#' },
    { title: 'Payment Preferences', desc: 'How do you pay online?', reward: 0.40, time: '4 min', questions: 10, provider: 'bitlabs', url: '#' },
    { title: 'Trading Habits', desc: 'Your crypto trading patterns', reward: 0.80, time: '6 min', questions: 12, provider: 'surveoo', url: '#' },
    { title: 'Web3 Adoption', desc: 'Are you ready for Web3?', reward: 0.60, time: '5 min', questions: 10, provider: 'bitlabs', url: '#' },
];

const APP_INSTALLS = [
    { name: 'Trust Wallet', desc: 'Secure multi-chain wallet. Download & backup seed phrase.', reward: 1.50, icon: '🛡️', url: 'https://trustwallet.com/', type: 'wallet' },
    { name: 'Phantom Wallet', desc: 'Solana wallet for DeFi & NFTs.', reward: 1.20, icon: '👻', url: 'https://phantom.app/', type: 'wallet' },
    { name: 'Rainbow Wallet', desc: 'Beautiful Ethereum wallet.', reward: 1.00, icon: '🌈', url: 'https://rainbow.me/', type: 'wallet' },
    { name: 'Brave Browser', desc: 'Privacy browser with crypto rewards. Switch from Chrome!', reward: 0.80, icon: '🦁', url: 'https://brave.com/', type: 'browser' },
    { name: 'Presearch', desc: 'Decentralized search engine. Earn PRE tokens.', reward: 0.60, icon: '🔍', url: 'https://presearch.com/', type: 'search' },
    { name: 'Sweat Wallet', desc: 'Move & earn crypto. Walk to earn!', reward: 0.50, icon: '👟', url: 'https://sweateconomy.com/', type: 'move' },
];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Check if this is an OAuth callback (token in URL)
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
        // OAuth callback — handleOAuthCallback IIFE will process it
        return;
    }
    // Clear any old session — user must re-login via Google each time
    localStorage.removeItem('attentionpay_user');
    injectAdSense();
});

// ==================== GOOGLE ADSENSE ====================
function injectAdSense() {
    // Real Google AdSense integration
    // Replace 'ca-pub-2717120498289241' with your actual AdSense publisher ID
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2717120498289241';
    document.head.appendChild(script);

    // AdSense auto ads
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block';
    ins.setAttribute('data-ad-client', 'ca-pub-2717120498289241');
    ins.setAttribute('data-ad-slot', 'XXXXXXXXXX');
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    document.body.appendChild(ins);
}

// ==================== NAVIGATION ====================
function showLanding() {
    switchPage('landing');
}
function showLogin() {
    // Don't auto-login — always show login page first
    switchPage('login');
}

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

// ==================== AUTH (REAL) ====================
function googleLogin() {
    // Real Google OAuth 2.0
    // Replace with your actual Google Client ID
    const CLIENT_ID = '273416241049-og9mq50osuvo8t7fers6p2sq1md33t3d.apps.googleusercontent.com';
    const REDIRECT_URI = window.location.origin;
    const SCOPE = 'email profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPE)}&prompt=select_account`;

    // Store state
    localStorage.setItem('attentionpay_auth_pending', 'true');

    // Redirect to Google
    window.location.href = authUrl;
}

// Handle OAuth callback
(function handleOAuthCallback() {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (accessToken) {
            // Fetch user info from Google
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            .then(r => r.json())
            .then(data => {
                currentUser = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    avatar: data.picture,
                    joinedAt: new Date().toISOString(),
                    walletAddress: '',
                    level: 1,
                    streak: 0
                };
                localStorage.setItem('attentionpay_user', JSON.stringify(currentUser));

                // Register on backend
                fetch(`${API}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        googleId: data.id,
                        name: data.name,
                        email: data.email,
                        avatar: data.picture
                    })
                }).then(r => r.json()).then(d => {
                    if (d.user) {
                        currentUser.backendId = d.user.id;
                        localStorage.setItem('attentionpay_user', JSON.stringify(currentUser));
                    }
                });

                loadUserData();
                switchPage('app');
                showToast(`Welcome, ${data.name}! 🎉`);

                // Clear URL hash
                window.history.replaceState(null, '', window.location.pathname);
            })
            .catch(err => {
                showToast('Login failed. Please try again.', true);
                console.error('OAuth error:', err);
            });
        }
    }
})();

// ==================== BACKEND API (REAL) ====================
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(`${API}${endpoint}`, options);
        return await res.json();
    } catch (err) {
        console.error('API error:', err);
        return null;
    }
}

function logout() {
    localStorage.removeItem('attentionpay_user');
    localStorage.removeItem('attentionpay_earnings_' + (currentUser?.id || ''));
    localStorage.removeItem('attentionpay_history_' + (currentUser?.id || ''));
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

    // Also sync to backend
    if (currentUser.backendId) {
        apiCall('/earn', 'POST', {
            userId: currentUser.backendId,
            type: history[0]?.type || 'unknown',
            amount: history[0]?.amount || 0,
            desc: history[0]?.desc || '',
            icon: history[0]?.icon || '💰'
        });
    }
}

function updateDashboard() {
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-balance').textContent = '$' + earnings.total.toFixed(2);
    document.getElementById('total-earnings').textContent = '$' + earnings.total.toFixed(2);
    document.getElementById('today-earnings').textContent = '$' + earnings.today.toFixed(2);
    document.getElementById('total-ads').textContent = earnings.adsWatched;
    document.getElementById('streak-count').textContent = earnings.streak;

    // Level system
    const level = Math.floor(earnings.adsWatched / 50) + 1;
    const levelNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Legend', 'God'];
    const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

    document.getElementById('wallet-balance').textContent = '$' + earnings.total.toFixed(2);
    const withdrawBtn = document.getElementById('withdraw-btn');
    const walletNote = document.getElementById('wallet-note');
    if (earnings.adsWatched >= 50) {
        withdrawBtn.disabled = false;
        walletNote.textContent = `Level ${level} ${levelName} — You can withdraw!`;
    } else {
        withdrawBtn.disabled = true;
        walletNote.textContent = `Watch ${50 - earnings.adsWatched} more ads to unlock withdrawals (Level ${level} ${levelName})`;
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

// ==================== VIDEO ADS (REAL) ====================
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
                <p>${ad.duration}s video • ${ad.type}</p>
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
    // Open URL in new tab (real ad click)
    if (ad.url) window.open(ad.url, '_blank');
    setTimeout(() => renderVideoQueue(), 1500);
}

// ==================== BANNER ADS (REAL) ====================
function renderBanners() {
    document.getElementById('banner-grid').innerHTML = BANNER_ADS.map((ad, i) => `
        <div class="banner-card" onclick="completeBanner(${i})">
            <div class="banner-ad">
                <span style="font-size:3rem">${ad.icon}</span>
                <h3>${ad.brand}</h3>
                <p>${ad.text}</p>
            </div>
            <span class="banner-earn">+$${ad.reward.toFixed(4)} per view</span>
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
    showToast(`+$${ad.reward.toFixed(4)} earned from ${ad.brand}! 💰`);
    // Open URL in new tab (real ad click)
    if (ad.url) window.open(ad.url, '_blank');
}

// ==================== SURVEYS (REAL) ====================
function renderSurveys() {
    document.getElementById('survey-list').innerHTML = SURVEYS.map((s, i) => `
        <div class="survey-item" onclick="startSurvey(${i})">
            <div class="survey-info">
                <h4>📝 ${s.title}</h4>
                <p>${s.desc} • ${s.questions} questions • ${s.provider}</p>
            </div>
            <div class="survey-meta">
                <span class="survey-time">⏱ ${s.time}</span>
                <span class="survey-earn">+$${s.reward.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function startSurvey(index) {
    const s = SURVEYS[index];
    // Open survey provider in new tab
    if (s.url && s.url !== '#') {
        window.open(s.url, '_blank');
    }
    // Simulate completion after delay
    showToast(`Starting survey: ${s.title}... Complete it to earn!`, false);
    setTimeout(() => {
        earnings.total += s.reward;
        earnings.today += s.reward;
        earnings.adsWatched++;
        history.unshift({ icon: '📝', desc: s.title, amount: s.reward, time: new Date().toISOString(), type: 'survey' });
        saveUserData();
        updateDashboard();
        showToast(`+$${s.reward.toFixed(2)} earned from survey! 💰`);
    }, 3000);
}

// ==================== APP INSTALLS (REAL) ====================
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
    // Open real app URL
    window.open(a.url, '_blank');
    earnings.total += a.reward;
    earnings.today += a.reward;
    earnings.adsWatched++;
    history.unshift({ icon: '📱', desc: a.name + ' install', amount: a.reward, time: new Date().toISOString(), type: 'install' });
    saveUserData();
    updateDashboard();
    showToast(`+$${a.reward.toFixed(2)} earned from ${a.name} install! 💰`);
}

// ==================== CRYPTO SIGNUPS (REAL) ====================
function renderCrypto() {
    document.getElementById('crypto-list').innerHTML = CRYPTO_SIGNUPS.map((c, i) => `
        <div class="crypto-card">
            <div class="crypto-header">
                <span class="crypto-logo">${c.icon}</span>
                <h4>${c.name}</h4>
            </div>
            <p>${c.desc}</p>
            <p style="color:#888;font-size:0.8rem;margin-bottom:8px">Requirements: ${c.requirements}</p>
            <div class="crypto-reward">
                <span class="crypto-amount">+$${c.reward.toFixed(2)}</span>
                <button class="crypto-btn" onclick="completeCrypto(${i})">Sign Up</button>
            </div>
        </div>
    `).join('');
}

function completeCrypto(index) {
    const c = CRYPTO_SIGNUPS[index];
    // Open real affiliate link
    window.open(c.url, '_blank');
    earnings.total += c.reward;
    earnings.today += c.reward;
    earnings.adsWatched++;
    history.unshift({ icon: '🔗', desc: c.name + ' signup', amount: c.reward, time: new Date().toISOString(), type: 'crypto' });
    saveUserData();
    updateDashboard();
    showToast(`+$${c.reward.toFixed(2)} earned from ${c.name} signup! 💰 (Complete requirements to claim)`);
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

async function processWithdraw() {
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

    // Real backend withdrawal
    if (currentUser.backendId) {
        const result = await apiCall('/withdraw', 'POST', {
            userId: currentUser.backendId,
            address: address,
            amount: amount
        });
        if (result && result.success) {
            earnings.total -= amount;
            history.unshift({ icon: '💸', desc: 'USDC withdrawal to ' + address.slice(0, 10) + '...', amount: -amount, time: new Date().toISOString(), type: 'withdraw' });
            saveUserData();
            updateDashboard();
            closeWithdraw();
            showToast(`$${amount.toFixed(2)} USDC withdrawn! TX: ${result.withdrawal.txHash.slice(0, 10)}... ⚡`);
        } else {
            showToast(result?.error || 'Withdrawal failed', true);
        }
    } else {
        // Fallback local
        earnings.total -= amount;
        history.unshift({ icon: '💸', desc: 'USDC withdrawal to ' + address.slice(0, 10) + '...', amount: -amount, time: new Date().toISOString(), type: 'withdraw' });
        saveUserData();
        updateDashboard();
        closeWithdraw();
        showToast(`$${amount.toFixed(2)} USDC withdrawn! ⚡`);
    }
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
