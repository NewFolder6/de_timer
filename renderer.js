// No need to require electron directly when using contextIsolation
const timerElement = document.getElementById('timer');
const timerContainer = document.getElementById('timer-container');
let timerInterval;
let bombPlanted = false;

const C4_TIMER_SECONDS = 40;
const GSI_DELAY_COMPENSATION = 1.0; // Compensate for ~1 second GSI delay

// Show timer container by default with 0.00
timerContainer.style.display = 'block';
timerElement.innerText = '0.00';

function updateTimerColor(timeLeft) {
    const seconds = timeLeft / 100;
    
    // Remove all existing classes
    timerContainer.classList.remove('safe', 'warning', 'danger');
    
    if (seconds > 10) {
        timerContainer.classList.add('safe');
    } else if (seconds > 5) {
        timerContainer.classList.add('warning');
    } else {
        timerContainer.classList.add('danger');
    }
}

function startTimer() {
    // Don't restart if timer is already running or bomb already planted
    if (timerInterval || bombPlanted) {
        return;
    }
    
    bombPlanted = true;
    timerContainer.style.display = 'block';
    // Compensate for GSI delay by reducing initial time
    let timeLeft = (C4_TIMER_SECONDS - GSI_DELAY_COMPENSATION) * 100; // Convert to centiseconds
    
    // Immediately show the starting time
    timerElement.innerText = (timeLeft / 100).toFixed(2);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerText = (timeLeft / 100).toFixed(2);
        updateTimerColor(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            bombPlanted = false;
            timerElement.innerText = '0.00';
        }
    }, 10); // Update every 10ms
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    bombPlanted = false;
    timerContainer.style.display = 'block';
    timerElement.innerText = '0.00';
}

// Use the exposed electronAPI from preload.js
window.electronAPI.onC4Planted((_event) => {
    console.log('C4 planted event received');
    startTimer();
});

window.electronAPI.onRoundOver((_event) => {
    console.log('Round over event received');
    stopTimer();
});

// Add keyboard shortcut to quit (optional)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.electronAPI.quitApp();
    }
});