// Global Variables
let currentPair = 'BTC/USDT';
let currentTab = 'spot';

// Navigation Functions
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageName}-section`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    if (pageName === 'wallet') {
        loadWalletData();
    }
}

// Initialize Market Data
function loadMarketData() {
    const marketList = document.getElementById('marketList');
    marketList.innerHTML = '';
    
    Object.entries(cryptoData.assets).forEach(([symbol, data]) => {
        const div = document.createElement('div');
        div.className = 'market-item';
        if (symbol === 'BTC') div.classList.add('active');
        
        div.innerHTML = `
            <div class="asset-info">
                <span class="asset-icon">${data.icon}</span>
                <div>
                    <div>${symbol}/USDT</div>
                    <div style="color: #848e9c; font-size: 0.9rem">${data.name}</div>
                </div>
            </div>
            <div style="text-align: right">
                <div>$${data.price.toFixed(2)}</div>
                <div style="color: ${data.change >= 0 ? '#02c076' : '#f6465d'}; font-size: 0.9rem">
                    ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%
                </div>
            </div>
        `;
        
        div.onclick = () => switchPair(symbol);
        marketList.appendChild(div);
    });
}

function switchPair(symbol) {
    currentPair = `${symbol}/USDT`;
    document.querySelector('.pair-name').textContent = currentPair;
    
    const price = cryptoData.assets[symbol].price;
    document.getElementById('currentPrice').textContent = `$${price.toFixed(2)}`;
    
    document.querySelectorAll('.market-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.market-item').classList.add('active');
    
    // Update order form
    document.getElementById('spotPrice').value = price.toFixed(2);
}

// Order Form Functions
function setTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.order-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.order-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-form`).classList.add('active');
    event.target.classList.add('active');
}

function setPercentage(percent) {
    const usdtBalance = cryptoData.userData.balance.USDT;
    const currentPrice = cryptoData.assets.BTC.price;
    const amount = (usdtBalance * percent / 100) / currentPrice;
    
    document.getElementById('spotAmount').value = amount.toFixed(6);
    document.getElementById('spotTotal').value = (usdtBalance * percent / 100).toFixed(2);
}

function executeOrder(type, orderType) {
    const symbol = 'BTC';
    let price, amount, total;
    
    switch(orderType) {
        case 'spot':
            price = parseFloat(document.getElementById('spotPrice').value);
            amount = parseFloat(document.getElementById('spotAmount').value);
            total = parseFloat(document.getElementById('spotTotal').value) || (amount * price);
            break;
        case 'limit':
            price = parseFloat(document.getElementById('limitPrice').value);
            amount = parseFloat(document.getElementById('limitAmount').value);
            total = amount * price;
            break;
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    if (type === 'buy') {
        if (cryptoData.userData.balance.USDT < total) {
            alert('Insufficient USDT balance');
            return;
        }
        
        cryptoData.userData.balance.USDT -= total;
        cryptoData.userData.balance[symbol] = (cryptoData.userData.balance[symbol] || 0) + amount;
        
    } else {
        if (cryptoData.userData.balance[symbol] < amount) {
            alert(`Insufficient ${symbol} balance`);
            return;
        }
        
        cryptoData.userData.balance[symbol] -= amount;
        cryptoData.userData.balance.USDT += total;
    }
    
    // Add to transaction history
    cryptoData.userData.transactionHistory.unshift({
        type: type.toUpperCase(),
        symbol: symbol,
        amount: amount,
        price: price,
        total: total,
        date: new Date().toLocaleString(),
        orderType: orderType.toUpperCase()
    });
    
    cryptoData.saveUserData();
    updateDisplays();

    // CHART MANAGEMENT
let priceChart = null;

function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Generate initial candlestick data
    const candleData = generateCandleData(50);
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'BTC/USDT',
                data: candleData,
                borderColor: '#02c076',
                backgroundColor: 'rgba(2, 192, 118, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    ticks: {
                        color: '#848e9c',
                        maxTicksLimit: 8
                    },
                    grid: {
                        color: '#2b3139'
                    }
                },
                y: {
                    position: 'right',
                    ticks: {
                        color: '#848e9c',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: '#2b3139'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function generateCandleData(count) {
    const data = [];
    const basePrice = 45000;
    let currentPrice = basePrice;
    
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(Date.now() - (count - i) * 60000);
        
        // Random price movement
        const change = (Math.random() - 0.5) * 100;
        currentPrice += change;
        
        data.push({
            x: timestamp,
            y: currentPrice
        });
    }
    
    return data;
}

function generateCandlestickData(count) {
    const data = [];
    let basePrice = 45000;
    
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(Date.now() - (count - i) * 60000);
        
        // Generate OHLC data
        const open = basePrice;
        const change = (Math.random() - 0.5) * 200;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        
        data.push({
            x: timestamp,
            o: open,
            h: high,
            l: low,
            c: close
        });
        
        basePrice = close;
    }
    
    return data;
}

function switchChartType(type) {
    if (priceChart) {
        priceChart.destroy();
    }
    
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    if (type === 'candlestick') {
        // Candlestick chart
        const candleData = generateCandlestickData(50);
        
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'BTC/USDT',
                    data: candleData,
                    segment: {
                        borderColor: ctx => {
                            const data = ctx.p0.parsed.y < ctx.p1.parsed.y ? '#02c076' : '#f6465d';
                            return data;
                        }
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: { minute: 'HH:mm' }
                        },
                        ticks: { color: '#848e9c', maxTicksLimit: 8 },
                        grid: { color: '#2b3139' }
                    },
                    y: {
                        position: 'right',
                        ticks: {
                            color: '#848e9c',
                            callback: v => '$' + v.toLocaleString()
                        },
                        grid: { color: '#2b3139' }
                    }
                }
            }
        });
    } else {
        // Line chart
        initChart();
    }
}

function updateChartData() {
    if (!priceChart) return;
    
    const symbol = currentPair.split('/')[0];
    const newPrice = cryptoData.assets[symbol].price;
    
    const newData = {
        x: new Date(),
        y: newPrice
    };
    
    priceChart.data.datasets[0].data.push(newData);
    
    // Keep only last 50 data points
    if (priceChart.data.datasets[0].data.length > 50) {
        priceChart.data.datasets[0].data.shift();
    }
    
    priceChart.update('none');
}

// Real-time chart updates
function startChartUpdates() {
    setInterval(updateChartData, 3000);
}

// Update DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    loadMarketData();
    updateDisplays();
    initChart();
    startPriceSimulation();
    startChartUpdates();
    
    // ... (event listeners lainnya) ...
    
    // Chart type buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            if (e.target.textContent === '1m') switchChartType('line');
            else switchChartType('candlestick');
        });
    });
});
    
    alert(`${type.toUpperCase()} order executed successfully!`);
}

// Wallet Functions
function loadWalletData() {
    const walletAssets = document.getElementById('walletAssets');
    walletAssets.innerHTML = '';
    
    Object.entries(cryptoData.userData.balance).forEach(([asset, balance]) => {
        if (balance > 0) {
            const value = asset === 'USDT' ? balance : balance * cryptoData.assets[asset]?.price || 0;
            const div = document.createElement('div');
            div.className = 'wallet-item';
            div.innerHTML = `
                <div class="asset-info">
                    <span class="asset-icon">${cryptoData.assets[asset]?.icon || '$'}</span>
                    <div>
                        <div>${asset}</div>
                        <div style="color: #848e9c; font-size: 0.9rem">${cryptoData.assets[asset]?.name || 'USD Tether'}</div>
                    </div>
                </div>
                <div>${balance.toFixed(6)}</div>
                <div>${balance.toFixed(6)}</div>
                <div>0.000000</div>
                <div style="color: #f0b90b">$${value.toFixed(2)}</div>
            `;
            walletAssets.appendChild(div);
        }
    });
}

// Modal Functions
function openModal(type) {
    document.getElementById(`${type}Modal`).style.display = 'block';
    
    if (type === 'withdraw') {
        document.getElementById('withdrawAvailable').textContent = 
            cryptoData.userData.balance.USDT.toFixed(2);
    }
}

function closeModal(type) {
    document.getElementById(`${type}Modal`).style.display = 'none';
}

function processDeposit() {
    const asset = document.getElementById('depositAsset').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    cryptoData.userData.balance[asset] = (cryptoData.userData.balance[asset] || 0) + amount;
    cryptoData.saveUserData();
    updateDisplays();
    closeModal('deposit');
    
    alert(`Successfully deposited ${amount} ${asset}`);
}

function processWithdraw() {
    const asset = document.getElementById('withdrawAsset').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const available = cryptoData.userData.balance[asset] || 0;
    
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    if (amount > available) {
        alert('Insufficient balance');
        return;
    }
    
    cryptoData.userData.balance[asset] -= amount;
    cryptoData.saveUserData();
    updateDisplays();
    closeModal('withdraw');
    
    alert(`Successfully withdrew ${amount} ${asset}`);
}

// Update UI Displays
function updateDisplays() {
    const totalBalance = cryptoData.getTotalBalance();
    document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
    document.getElementById('availableUSDT').textContent = cryptoData.userData.balance.USDT.toFixed(2);
}

// Price Simulation
function startPriceSimulation() {
    setInterval(() => {
        Object.keys(cryptoData.assets).forEach(symbol => {
            cryptoData.updatePrice(symbol);
        });
        loadMarketData();
        
        if (document.querySelector('.page.active').id === 'wallet-section') {
            loadWalletData();
        }
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadMarketData();
    updateDisplays();
    startPriceSimulation();
    
    // Tab switching
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            showPage(page);
        });
    });
    
    // Order form tabs
    document.querySelectorAll('.order-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            setTab(tab);
        });
    });
    
    // Modal close on outside click
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // Real-time calculations
    document.getElementById('spotAmount').addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value) || 0;
        const price = parseFloat(document.getElementById('spotPrice').value) || 0;
        document.getElementById('spotTotal').value = (amount * price).toFixed(2);
    });
    
    document.getElementById('limitAmount').addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value) || 0;
        const price = parseFloat(document.getElementById('limitPrice').value) || 0;
        document.getElementById('limitTotal').value = (amount * price).toFixed(2);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
});
