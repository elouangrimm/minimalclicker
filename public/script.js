let points = parseInt(localStorage.getItem('points')) || 0;
let clickers = JSON.parse(localStorage.getItem('clickers')) || Array(10).fill(0);
let clickerCPSValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]; // CPS values for each clicker
let upgrades = JSON.parse(localStorage.getItem('upgrades')) || Array(10).fill(0);
let upgradeClickBonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Bonus per click for each upgrade
let achievementStatus = JSON.parse(localStorage.getItem('achievementStatus')) || Array(10).fill(false);
let resetCounter = 0;

let clickerBasePrices = [10, 50, 200, 1000, 5000, 25000, 100000, 500000, 2500000, 10000000];
let upgradeBasePrices = [50, 200, 1000, 5000, 25000, 100000, 500000, 2500000, 10000000, 50000000];

let clickerCosts = clickerBasePrices.map((basePrice, i) => Math.round(basePrice * Math.pow(1.5, i)));
let upgradeCosts = upgradeBasePrices.map((basePrice, i) => Math.round(basePrice * Math.pow(1.5, i)));

// Customizable names for clickers and upgrades
let clickerNames = [
    "Clicker",
    "Roomba",
    "Astrobot",
    "MechSuit",
    "Nanobot",
    "Quantum Computer",
    "NeuraLink",
    "Particle Accelerator",
    "Singularity Generator",
    "Dyson Swarm"
];

let upgradeNames = [
    "Duct Tape Mod",
    "Overclock",
    "Turbo Charger",
    "AI Assistant",
    "Quantum Boost",
    "HyperDrive",
    "Dimensional Shift",
    "Zero-Point Energy",
    "Temporal Distortion",
    "Cosmic Fusion"
];

// Function to make elements draggable with boundary constraints
function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        // Ensure drag does not interfere with button clicks
        if (e.target.classList.contains('upgrade-button')) return;

        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            // Get window size and element size
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;

            // Boundary checks
            const minX = 0;
            const maxX = windowWidth - elementWidth;
            const minY = 0;
            const maxY = windowHeight - elementHeight;

            // Apply constraints
            const constrainedX = Math.min(Math.max(x, minX), maxX);
            const constrainedY = Math.min(Math.max(y, minY), maxY);

            element.style.position = 'absolute';
            element.style.left = `${constrainedX}px`;
            element.style.top = `${constrainedY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        element.style.cursor = 'grab';
    });

    // Initial setup for cursor
    element.style.cursor = 'grab';
}

// Apply draggable functionality with boundary constraints to all floating windows
document.querySelectorAll('.floating-window').forEach(makeDraggable);

// Calculate CPS
function calculateCPS() {
    return clickers.reduce((total, quantity, index) => total + (quantity * clickerCPSValues[index]), 0);
}

// Prevent right-click context menu
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Add points on click
document.getElementById('clicker').addEventListener('click', () => {
    points += (1 + upgrades.reduce((total, quantity, index) => total + (quantity * upgradeClickBonuses[index]), 0));
    updateUI();
    checkAchievements();
    saveGame();
});

function buyUpgrade(index) {
    if (points >= upgradeCosts[index]) {
        points -= upgradeCosts[index];
        upgrades[index]++;
        upgradeCosts[index] = Math.round(upgradeCosts[index] * 1.2); // Increase cost
        updateUI(); // Update the UI to reflect changes
    }
}

function buyClicker(index) {
    if (points >= clickerCosts[index]) {
        points -= clickerCosts[index];
        clickers[index]++;
        clickerCosts[index] = Math.round(clickerCosts[index] * 1.2); // Increase cost
        updateUI(); // Update the UI to reflect changes
    }
}

// Handle keydown events for clicking and resetting
document.addEventListener('keydown', (event) => {
    // Trigger a click on any key press
    document.getElementById('clicker').click();
    
    // Handle reset with 'r' key press
    if (event.key.toLowerCase() === 'r') {
        resetCounter++;
        if (resetCounter === 3) {
            if (confirm("Are you sure you want to reset the game?")) {
                resetGame();
            }
        }
    } else {
        resetCounter = 0; // Reset counter if any other key is pressed
    }
});

function updateUI() {
    const cps = calculateCPS();
    document.getElementById('points-counter').textContent = `${points}`;
    document.getElementById('cps-counter').textContent = `${cps} CPS`;

    const clickerList = document.getElementById('clicker-list');
    const upgradeList = document.getElementById('upgrade-list');
    const achievementList = document.getElementById('achievement-list');

    clickerList.innerHTML = clickers.map((quantity, i) => `
        <button class="upgrade-button" id="clicker${i}" ${i > 0 && clickers[i - 1] === 0 ? 'style="display:none;"' : ''}>
            ${clickerNames[i]} ($${clickerCosts[i]}, Quantity: ${quantity}, +${clickerCPSValues[i]} CPS)
        </button>
    `).join('');

    upgradeList.innerHTML = upgrades.map((quantity, i) => `
        <button class="upgrade-button" id="upgrade${i}" ${i > 0 && upgrades[i - 1] === 0 ? 'style="display:none;"' : ''}>
            ${upgradeNames[i]} ($${upgradeCosts[i]}, +${upgradeClickBonuses[i]} Clicks)
        </button>
    `).join('');

    achievementList.innerHTML = `
        <div class="achievement ${achievementStatus[0] ? 'achieved' : ''}" id="ach1">Beginner</div>
        <div class="achievement ${achievementStatus[1] ? 'achieved' : ''}" id="ach2">Novice</div>
        <div class="achievement ${achievementStatus[2] ? 'achieved' : ''}" id="ach3">Almost Pro</div>
        <div class="achievement ${achievementStatus[3] ? 'achieved' : ''}" id="ach4">First Clicker</div>
        <div class="achievement ${achievementStatus[4] ? 'achieved' : ''}" id="ach5">First Upgrade</div>
        <div class="achievement ${achievementStatus[5] ? 'achieved' : ''}" id="ach6">5 Clickers</div>
        <div class="achievement ${achievementStatus[6] ? 'achieved' : ''}" id="ach7">100 Clickers</div>
        <div class="achievement ${achievementStatus[7] ? 'achieved' : ''}" id="ach8">Secret Achievement</div>
        <div class="achievement ${achievementStatus[8] ? 'achieved' : ''}" id="ach9">1000 Upgrades</div>
        <div class="achievement ${achievementStatus[9] ? 'achieved' : ''}" id="ach10">Easter Egg</div>
    `;

    // Add event listeners for clickers and upgrades
    clickers.forEach((_, i) => {
        document.getElementById(`clicker${i}`).addEventListener('click', () => buyClicker(i));
    });

    upgrades.forEach((_, i) => {
        document.getElementById(`upgrade${i}`).addEventListener('click', () => buyUpgrade(i));
    });
}

function saveGame() {
    localStorage.setItem('points', points);
    localStorage.setItem('clickers', JSON.stringify(clickers));
    localStorage.setItem('upgrades', JSON.stringify(upgrades));
    localStorage.setItem('achievementStatus', JSON.stringify(achievementStatus));
}

function resetGame() {
    points = 0;
    clickers = Array(10).fill(0);
    clickerCosts = Array.from({ length: 10 }, (_, i) => Math.round(10 * Math.pow(1.5, i)));
    upgrades = Array(10).fill(0);
    upgradeCosts = Array.from({ length: 10 }, (_, i) => Math.round(50 * Math.pow(1.5, i)));
    achievementStatus = Array(10).fill(false);
    resetCounter = 0;
    saveGame();
    updateUI();
    checkAchievements();
}

function checkAchievements() {
    if (points > 0 && !achievementStatus[0]) achievementStatus[0] = true;
    if (points >= 50 && !achievementStatus[1]) achievementStatus[1] = true;
    if (points >= 1000 && !achievementStatus[2]) achievementStatus[2] = true;
    if (clickers[0] > 0 && !achievementStatus[3]) achievementStatus[3] = true;
    if (upgrades[0] > 0 && !achievementStatus[4]) achievementStatus[4] = true;
    if (clickers.reduce((sum, qty) => sum + qty, 0) >= 5 && !achievementStatus[5]) achievementStatus[5] = true;
    if (clickers.reduce((sum, qty) => sum + qty, 0) >= 100 && !achievementStatus[6]) achievementStatus[6] = true;
    if (clickers[7] > 0 && !achievementStatus[7]) achievementStatus[7] = true;
    if (upgrades.reduce((sum, qty) => sum + qty, 0) >= 1000 && !achievementStatus[8]) achievementStatus[8] = true;
    if (points >= 2000 && !achievementStatus[9]) achievementStatus[9] = true;

    updateUI();
    saveGame();
}

// Initialize UI and start game logic
updateUI();
checkAchievements();
setInterval(autoClick, 1000);

function autoClick() {
    let totalCPS = calculateCPS();
    points += totalCPS;
    updateUI();
    checkAchievements();
    saveGame();
}
