// === Orion Coin - Full Script.js ===

// Telegram Mini App
const tg = window.Telegram ? Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#0a0a2e");
    tg.setBackgroundColor("#0a0a2e");
}

// Variables
let balance = parseFloat(localStorage.getItem('orionBalance')) || 0;
let energy = parseFloat(localStorage.getItem('orionEnergy')) || 1000;
const maxEnergy = 1000;
let miningSpeed = parseFloat(localStorage.getItem('miningSpeed')) || 1;

// DOM Elements
const balanceEl = document.getElementById('balance');
const energyEl = document.getElementById('energy');
const coin = document.getElementById('coin');
const miningSpeedEl = document.getElementById('mining-speed');
const levelEl = document.getElementById('level');
const dailyRewardBtn = document.getElementById('daily-reward-btn');
const floatingContainer = document.querySelector('.mining-area');

function updateUI() {
    balanceEl.textContent = Math.floor(balance);
    energyEl.textContent = Math.floor(energy);
    miningSpeedEl.textContent = miningSpeed;
    if (levelEl) levelEl.textContent = Math.floor(miningSpeed / 5) + 1;
}

function saveProgress() {
    localStorage.setItem('orionBalance', balance);
    localStorage.setItem('orionEnergy', energy);
    localStorage.setItem('miningSpeed', miningSpeed);
    localStorage.setItem('lastSaveTime', Date.now());
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-page') + '-section').classList.add('active');
    });
});

// Tap Mining
coin.addEventListener('click', () => {
    if (energy >= 1) {
        balance += 1;
        energy -= 1;

        const float = document.createElement('div');
        float.className = 'floating-text';
        float.textContent = '+1';
        float.style.left = (35 + Math.random() * 30) + '%';
        float.style.top = '40%';
        floatingContainer.appendChild(float);
        setTimeout(() => float.remove(), 1200);

        updateUI();
        saveProgress();
    }
});

// Passive Mining
setInterval(() => {
    balance += miningSpeed / 60;
    updateUI();
    saveProgress();
}, 1000);

// Energy Refill
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + 8);
        updateUI();
        saveProgress();
    }
}, 3000);

// Offline Mining
function calculateOfflineEarnings() {
    const lastTime = localStorage.getItem('lastSaveTime');
    if (!lastTime) return;
    const offlineMin = (Date.now() - parseInt(lastTime)) / 60000;
    const cappedMin = Math.min(offlineMin, 480);
    if (cappedMin > 1) {
        const earned = Math.floor(miningSpeed * cappedMin);
        balance += earned;
        alert(`⏰ Welcome back!\nYou earned ${earned} ORION while offline!`);
        updateUI();
        saveProgress();
    }
}

// Upgrade Shop
let upgrades = [
    { id: 1, name: "Faster Mining", cost: 100, increase: 2, level: 0, maxLevel: 20 },
    { id: 2, name: "Energy Capacity", cost: 150, increase: 0, level: 0, maxLevel: 10 },
    { id: 3, name: "Lucky Taps", cost: 200, increase: 0, level: 0, maxLevel: 5 }
];

function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    container.innerHTML = '';

    upgrades.forEach(upgrade => {
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div>
                <strong>${upgrade.name}</strong><br>
                <small>Level ${upgrade.level} / ${upgrade.maxLevel}</small>
            </div>
            <button data-id="${upgrade.id}" ${upgrade.level >= upgrade.maxLevel ? 'disabled' : ''}>
                ${upgrade.level >= upgrade.maxLevel ? 'MAX' : upgrade.cost + ' ORION'}
            </button>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const upgrade = upgrades.find(u => u.id === id);
            if (!upgrade || upgrade.level >= upgrade.maxLevel) return;

            if (balance >= upgrade.cost) {
                balance -= upgrade.cost;
                upgrade.level++;
                miningSpeed += upgrade.increase || 0;
                updateUI();
                saveProgress();
                renderUpgrades();
                alert(`✅ ${upgrade.name} upgraded to level ${upgrade.level}!`);
            } else {
                alert("Not enough ORION!");
            }
        });
    });
}

// Daily Reward
dailyRewardBtn.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('lastLoginDate') !== today) {
        balance += 75;
        localStorage.setItem('lastLoginDate', today);
        updateUI();
        saveProgress();
        alert("🌟 Daily Reward Claimed! +75 ORION");
    } else {
        alert("You've already claimed today's reward!");
    }
});

// Referral
document.getElementById('copy-btn').addEventListener('click', () => {
    const link = document.getElementById('referral-link');
    link.select();
    document.execCommand('copy');
    alert("✅ Link copied!");
});

// Daily Tasks
let tasks = [
    { id: 1, text: "Tap the coin 50 times", reward: 30, progress: 0, max: 50, completed: false },
    { id: 2, text: "Upgrade mining speed once", reward: 40, progress: 0, max: 1, completed: false },
    { id: 3, text: "Open Friends tab", reward: 25, progress: 0, max: 1, completed: false }
];

function renderTasks() {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    container.innerHTML = '<h3>Today\'s Tasks</h3>';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <strong>${task.text}</strong>
            <p style="color:#00ff9d; margin: 5px 0;">+${task.reward} ORION</p>
            <small>Progress: ${task.progress} / ${task.max}</small>
            ${!task.completed ? `<button data-id="${task.id}">Claim</button>` : '<span style="color:#00ff9d;">✓ Completed</span>'}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const task = tasks.find(t => t.id === id);
            if (task && task.progress >= task.max && !task.completed) {
                task.completed = true;
                balance += task.reward;
                updateUI();
                saveProgress();
                renderTasks();
                alert(`✅ Task completed! +${task.reward} ORION`);
            }
        });
    });
}

setInterval(() => {
    if (tasks[0].progress < tasks[0].max) {
        tasks[0].progress += 8;
        if (tasks[0].progress > tasks[0].max) tasks[0].progress = tasks[0].max;
        renderTasks();
    }
}, 7000);

document.querySelector('[data-page="tasks"]').addEventListener('click', renderTasks);

// Leaderboard
function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    container.innerHTML = `
        <div class="leaderboard-entry top"><span>1. You</span><span>${Math.floor(balance)} ORION</span></div>
        <div class="leaderboard-entry"><span>2. StarLord42</span><span>12450 ORION</span></div>
        <div class="leaderboard-entry"><span>3. NebulaQueen</span><span>9870 ORION</span></div>
        <div class="leaderboard-entry"><span>4. CosmicMiner</span><span>7650 ORION</span></div>
    `;
}

document.querySelector('[data-page="leaderboard"]').addEventListener('click', renderLeaderboard);

// Initialize
updateUI();
calculateOfflineEarnings();
renderUpgrades();
renderLeaderboard();