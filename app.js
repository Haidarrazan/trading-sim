// Initial data
const initialData = {
    balance: 1000,
    portfolio: {},
    transactions: []
};

// Crypto prices (simulated)
const cryptos = {
    BTC: { name: 'Bitcoin', price: 45000, symbol: '₿' },
    ETH: { name: 'Ethereum', price: 3000, symbol: 'Ξ' },
    BNB: { name: 'Binance Coin', price: 350, symbol: 'BNB' },
    ADA: { name: 'Cardano', price: 0.45, symbol: '₳' },
    SOL: { name: 'Solana', price: 120, symbol: '◎' }
};

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('cryptoSimData');
    return saved ? JSON.parse(saved) : initialData;
}

// Save data to localStorage
function saveData(data) {
    localStorage.setItem('cryptoSimData', JSON.stringify(data));
}

// Update balance display
function updateBalance() {
    const data = loadData();
    document.getElementById('balance').textContent = `Balance: $${data.balance.toFixed(2)}`;
}

// Load crypto list
function loadCryptoList() {
    const cryptoList = document.getElementById('cryptoList');
    cryptoList.innerHTML = '';
    
    Object.entries(cryptos).forEach(([code, crypto]) => {
        const div = document.createElement('div');
        div.className = 'crypto-item';
        div.innerHTML = `
            <div>
                <strong>${crypto.symbol} ${code}</strong>
                <p>${crypto.name}</p>
            </div>
            <div>
                <p>$${crypto.price.toFixed(2)}</p>
                <button class="btn-trade" onclick="openTradeModal('${code}')">
                    Trade
                </button>
            </div>
        `;
        cryptoList.appendChild(div);
    });
}

// Open trade modal
function openTradeModal(cryptoCode) {
    const crypto = cryptos[cryptoCode];
    const modal = document.getElementById('tradeModal');
    const title = document.getElementById('modalTitle');
    const price = document.getElementById('currentPrice');
    
    title.textContent = `Trade ${crypto.name}`;
    price.textContent = crypto.price.toFixed(2);
    modal.style.display = 'block';
    
    // Store current crypto for trade execution
    window.currentCrypto = cryptoCode;
}

// Close modal
document.querySelector('.close').onclick = function() {
    document.getElementById('tradeModal').style.display = 'none';
};

// Execute trade
function executeTrade() {
    const type = document.getElementById('tradeType').value;
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const cryptoCode = window.currentCrypto;
    const crypto = cryptos[cryptoCode];
    
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    const data = loadData();
    const cryptoAmount = amount / crypto.price;
    
    if (type === 'buy') {
        if (amount > data.balance) {
            alert('Insufficient balance');
            return;
        }
        
        data.balance -= amount;
        data.portfolio[cryptoCode] = (data.portfolio[cryptoCode] || 0) + cryptoAmount;
        
    } else if (type === 'sell') {
        if (!data.portfolio[cryptoCode] || data.portfolio[cryptoCode] < cryptoAmount) {
            alert('Insufficient crypto balance');
            return;
        }
        
        data.balance += amount;
        data.portfolio[cryptoCode] -= cryptoAmount;
        
        if (data.portfolio[cryptoCode] < 0.000001) {
            delete data.portfolio[cryptoCode];
        }
    }
    
    // Add transaction
    data.transactions.unshift({
        type: type.toUpperCase(),
        crypto: cryptoCode,
        amount: amount,
        cryptoAmount: cryptoAmount,
        price: crypto.price,
        date: new Date().toLocaleString()
    });
    
    saveData(data);
    updateBalance();
    updatePortfolio();
    updateTransactions();
    
    document.getElementById('tradeModal').style.display = 'none';
    document.getElementById('tradeAmount').value = '';
}

// Update portfolio
function updatePortfolio() {
    const data = loadData();
    const portfolioDiv = document.getElementById('portfolioItems');
    
    if (Object.keys(data.portfolio).length === 0) {
        portfolioDiv.innerHTML = '<p>No assets yet</p>';
        return;
    }
    
    let html = '';
    Object.entries(data.portfolio).forEach(([code, amount]) => {
        const crypto = cryptos[code];
        const value = amount * crypto.price;
        html += `
            <div class="crypto-item">
                <div>
                    <strong>${crypto.symbol} ${code}</strong>
                    <p>${amount.toFixed(6)} ${code}</p>
                </div>
                <div>
                    <p>$${value.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    portfolioDiv.innerHTML = html;
}

// Update transactions
function updateTransactions() {
    const data = loadData();
    const transactionsDiv = document.getElementById('transactionHistory');
    
    if (data.transactions.length === 0) {
        transactionsDiv.innerHTML = '<p>No transactions yet</p>';
        return;
    }
    
    let html = '';
    data.transactions.slice(0, 10).forEach(tx => {
        html += `
            <div class="crypto-item">
                <div>
                    <strong>${tx.type} ${tx.crypto}</strong>
                    <p>${tx.date}</p>
                </div>
                <div>
                    <p>$${tx.amount.toFixed(2)}</p>
                    <small>@${tx.price.toFixed(2)}</small>
                </div>
            </div>
        `;
    });
    
    transactionsDiv.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBalance();
    loadCryptoList();
    updatePortfolio();
    updateTransactions();
    
    // Simulate price changes
    setInterval(() => {
        Object.keys(cryptos).forEach(code => {
            const change = (Math.random() - 0.5) * 0.02; // ±1% max change
            cryptos[code].price *= (1 + change);
        });
        loadCryptoList();
    }, 5000);
});
