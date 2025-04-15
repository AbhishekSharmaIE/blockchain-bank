// Contract ABI and address
const contractABI = [
    {
        "inputs": [],
        "name": "createAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contractAddress = "0x1234567890123456789012345678901234567890"; // Replace with your contract address

// Initialize wallet handler
const wallet = new WalletHandler();

// DOM Elements
const createAccountBtn = document.getElementById('create-account');
const depositBtn = document.getElementById('deposit');
const withdrawBtn = document.getElementById('withdraw');
const amountInput = document.getElementById('amount');
const transactionHistory = document.getElementById('transaction-history');
const balanceDisplay = document.getElementById('balance');

// Event Listeners
createAccountBtn.addEventListener('click', createAccount);
depositBtn.addEventListener('click', deposit);
withdrawBtn.addEventListener('click', withdraw);

// Functions
async function createAccount() {
    try {
        if (!wallet.connected) {
            throw new Error('Please connect your wallet first');
        }
        
        const tx = await wallet.contract.createAccount();
        await tx.wait();
        addTransaction('Account Created', 'Successfully created a new bank account');
        updateBalance();
    } catch (error) {
        showError(error.message);
    }
}

async function deposit() {
    try {
        if (!wallet.connected) {
            throw new Error('Please connect your wallet first');
        }

        const amount = amountInput.value;
        if (!amount || amount <= 0) {
            throw new Error('Please enter a valid amount');
        }

        const tx = await wallet.contract.deposit({
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        addTransaction('Deposit', `Deposited ${amount} ETH`);
        updateBalance();
    } catch (error) {
        showError(error.message);
    }
}

async function withdraw() {
    try {
        if (!wallet.connected) {
            throw new Error('Please connect your wallet first');
        }

        const amount = amountInput.value;
        if (!amount || amount <= 0) {
            throw new Error('Please enter a valid amount');
        }

        const tx = await wallet.contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        addTransaction('Withdrawal', `Withdrew ${amount} ETH`);
        updateBalance();
    } catch (error) {
        showError(error.message);
    }
}

async function updateBalance() {
    try {
        if (!wallet.connected) return;
        
        const balance = await wallet.contract.getBalance();
        const formattedBalance = ethers.utils.formatEther(balance);
        balanceDisplay.textContent = `${formattedBalance} ETH`;
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

function addTransaction(type, description) {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.innerHTML = `
        <strong>${type}</strong>
        <p>${description}</p>
        <small>${new Date().toLocaleString()}</small>
    `;
    transactionHistory.insertBefore(transactionItem, transactionHistory.firstChild);
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Initialize contract when wallet is connected
wallet.onConnect = async () => {
    await wallet.initializeContract(contractAddress, contractABI);
    updateBalance();
};

// Update UI when wallet is disconnected
wallet.onDisconnect = () => {
    balanceDisplay.textContent = '0 ETH';
    transactionHistory.innerHTML = '';
}; 