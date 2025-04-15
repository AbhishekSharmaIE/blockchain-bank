import * as THREE from 'three';
import { ethers } from 'ethers';

// Bank contract ABI
const bankABI = [
    "function createAccount() public",
    "function deposit() public payable",
    "function withdraw(uint256 amount) public",
    "function getBalance() public view returns(uint256)",
    "function getAccountInfo() public view returns(uint256 balance, uint256 lastTransaction)"
];

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Create a more detailed bank vault
const vaultGeometry = new THREE.BoxGeometry(5, 3, 2);
const vaultMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x808080,
    shininess: 100,
    specular: 0x111111
});
const vault = new THREE.Mesh(vaultGeometry, vaultMaterial);
scene.add(vault);

// Add vault door
const doorGeometry = new THREE.PlaneGeometry(1, 2);
const doorMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x333333,
    side: THREE.DoubleSide
});
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 0, 1.01);
scene.add(door);

camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    vault.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// Blockchain interaction
let provider;
let signer;
let bankContract;

async function connectWallet() {
    if (window.ethereum) {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            // Get and display account
            const address = await signer.getAddress();
            document.getElementById('account-address').textContent = 
                `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            
            // Initialize contract
            bankContract = new ethers.Contract(
                process.env.CONTRACT_ADDRESS,
                bankABI,
                signer
            );
            
            // Update UI
            updateBalance();
            document.getElementById('create-account').style.display = 'block';
            document.getElementById('deposit').style.display = 'block';
            document.getElementById('withdraw').style.display = 'block';
            
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Error connecting wallet. Please make sure MetaMask is installed and unlocked.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function createAccount() {
    try {
        const tx = await bankContract.createAccount();
        await tx.wait();
        alert("Account created successfully!");
        updateBalance();
    } catch (error) {
        console.error("Error creating account:", error);
        alert("Error creating account. Make sure you have enough ETH for gas.");
    }
}

async function deposit() {
    const amount = document.getElementById('amount').value;
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    try {
        const tx = await bankContract.deposit({
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        updateBalance();
        alert(`Successfully deposited ${amount} ETH`);
    } catch (error) {
        console.error("Error depositing:", error);
        alert("Error making deposit. Make sure you have enough ETH for the deposit and gas.");
    }
}

async function withdraw() {
    const amount = document.getElementById('amount').value;
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    try {
        const tx = await bankContract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        updateBalance();
        alert(`Successfully withdrew ${amount} ETH`);
    } catch (error) {
        console.error("Error withdrawing:", error);
        alert("Error making withdrawal. Make sure you have enough balance and ETH for gas.");
    }
}

async function updateBalance() {
    try {
        const balance = await bankContract.getBalance();
        const formattedBalance = ethers.utils.formatEther(balance);
        document.getElementById('balance').textContent = `${formattedBalance} ETH`;
    } catch (error) {
        console.error("Error getting balance:", error);
        document.getElementById('balance').textContent = "Error loading balance";
    }
}

// Event listeners
document.getElementById('connect-wallet').addEventListener('click', connectWallet);
document.getElementById('create-account').addEventListener('click', createAccount);
document.getElementById('deposit').addEventListener('click', deposit);
document.getElementById('withdraw').addEventListener('click', withdraw);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 