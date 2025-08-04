// Data Management
class CryptoData {
    constructor() {
        this.assets = {
            BTC: { name: 'Bitcoin', price: 45234.56, change: 2.34, icon: '₿' },
            ETH: { name: 'Ethereum', price: 3012.89, change: -1.23, icon: 'Ξ' },
            BNB: { name: 'BNB', price: 412.34, change: 3.45, icon: 'B' },
            ADA: { name: 'Cardano', price: 0.452, change: 0.56, icon: 'A' },
            SOL: { name: 'Solana', price: 98.76, change: -2.11, icon: 'S' }
        };
        
        this.userData = this.loadUserData();
    }

    loadUserData() {
        const saved = localStorage.getItem('binanceCloneData');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            balance: { USDT: 1000, BTC: 0, ETH: 0, BNB: 0 },
            openOrders: [],
            transactionHistory: [],
            recurringBuys: []
        };
    }

    saveUserData() {
        localStorage.setItem('binanceCloneData', JSON.stringify(this.userData));
    }

    updatePrice(symbol) {
        const asset = this.assets[symbol];
        const change = (Math.random() - 0.5) * 0.02;
        asset.price *= (1 + change);
        asset.change = change * 100;
    }

    getTotalBalance() {
        let total = 0;
        Object.keys(this.userData.balance).forEach(asset => {
            if (asset === 'USDT') {
                total += this.userData.balance[asset];
            } else if (this.assets[asset]) {
                total += this.userData.balance[asset] * this.assets[asset].price;
            }
        });
        return total;
    }
}

// Initialize Crypto Data
window.cryptoData = new CryptoData();
