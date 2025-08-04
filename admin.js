// Load admin data
function loadAdminData() {
    const data = JSON.parse(localStorage.getItem('cryptoSimData')) || { balance: 1000, portfolio: {}, transactions: [] };
    document.getElementById('adminBalance').textContent = `$${data.balance.toFixed(2)}`;
    
    // Calculate portfolio value
    let portfolioValue = 0;
    Object.entries(data.portfolio).forEach(([code, amount]) => {
        const crypto = {
            BTC: { price: 45000 },
            ETH: { price: 3000 },
            BNB: { price: 350 },
            ADA: { price: 0.45 },
            SOL: { price: 120 }
        }[code];
        portfolioValue += amount * crypto.price;
    });
    
    document.getElementById('portfolioValue').textContent = `$${portfolioValue.toFixed(2)}`;
    document.getElementById('totalTransactions').textContent = data.transactions.length;
}

// Add balance
function addBalance() {
    const amount = parseFloat(document.getElementById('addAmount').value);
    if (!amount || amount <= 0) {
        alert('Please enter valid amount');
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('cryptoSimData')) || { balance: 1000 };
    data.balance += amount;
    localStorage.setItem('cryptoSimData', JSON.stringify(data));
    
    document.getElementById('addAmount').value = '';
    loadAdminData();
    alert(`Added $${amount} to balance`);
}

// Reset all data
function resetData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('cryptoSimData');
        loadAdminData();
        alert('All data has been reset');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadAdminData);
