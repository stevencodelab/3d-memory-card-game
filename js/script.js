 // Create floating particles
 function createParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = (Math.random() * 15 + 5) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        particles.appendChild(particle);
    }
}

const emojis = ['🌟', '🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎢', '🎸', '🎹', '🎺', '🎻', '🎬', '🎤', '🎧', '🎵', '🎩', '🎰'];
let cards = [];
let moves = 0;
let matches = 0;
let flippedCards = [];
let canFlip = true;
let timerInterval;
let startTime;
let gameActive = false;

function shuffleCards() {
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const selectedEmojis = emojis.slice(0, difficulty);
    cards = [...selectedEmojis, ...selectedEmojis];
    
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function updateGridLayout() {
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const gameGrid = document.getElementById('gameGrid');
    const columns = difficulty === 18 ? 6 : 4;
    gameGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
    `;
    card.dataset.index = index;
    card.addEventListener('click', () => flipCard(card));
    return card;
}

function startTimer() {
    if (!gameActive) {
        gameActive = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

function flipCard(card) {
    if (!canFlip || flippedCards.includes(card) || card.classList.contains('matched')) return;
    
    startTimer();
    card.classList.add('flipped');
    card.style.transform = 'rotateY(180deg) translateZ(20px)';
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;
        canFlip = false;

        const [card1, card2] = flippedCards;
        const match = cards[card1.dataset.index] === cards[card2.dataset.index];

        if (match) {
            matches++;
            document.getElementById('matches').textContent = matches;
            flippedCards.forEach(card => {
                card.classList.add('matched');
                card.style.animation = 'matchedPulse 0.5s ease-in-out';
            });
            flippedCards = [];
            canFlip = true;

            if (matches === cards.length / 2) {
                clearInterval(timerInterval);
                gameActive = false;
                document.getElementById('finalMoves').textContent = moves;
                document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
                document.getElementById('winScreen').classList.add('active');
                createConfetti();
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach(card => {
                    card.classList.remove('flipped');
                    card.style.transform = '';
                });
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
}

function initializeGame() {
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '';
    updateGridLayout();
    shuffleCards();
    cards.forEach((emoji, index) => {
        gameGrid.appendChild(createCard(emoji, index));
    });
}

function restartGame() {
    moves = 0;
    matches = 0;
    flippedCards = [];
    canFlip = true;
    gameActive = false;
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('winScreen').classList.remove('active');
    clearInterval(timerInterval);
    
    // Remove all existing confetti
    const confetti = document.querySelectorAll('.confetti');
    confetti.forEach(c => c.remove());
    
    initializeGame();

    // Add animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animation = `dealCard 0.5s ease-out ${index * 0.1}s`;
    });
}

// Add card dealing animation
const style = document.createElement('style');
style.textContent = `
    @keyframes dealCard {
        from {
            opacity: 0;
            transform: translateY(-50px) scale(0.5);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;
document.head.appendChild(style);

document.getElementById('difficulty').addEventListener('change', restartGame);
createParticles();
initializeGame();

// Sound Effects
const sounds = {
    flip: document.getElementById('flipSound'),
    match: document.getElementById('matchSound'),
    win: document.getElementById('winSound'),
    bgm: document.getElementById('bgMusic')
};

let isSoundEnabled = true;
let currentTheme = 'default';

Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
})

// Theme Management
function changeTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    currentTheme = themeName;
    localStorage.setItem('gameTheme', themeName);
}

// Sound Management
function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    const soundButton = document.getElementById('soundToggle');
    const soundIcon = soundButton.querySelector('.sound-icon');
    
    if (isSoundEnabled) {
        soundIcon.textContent = '🔊';
        sounds.bgm.play();
    } else {
        soundIcon.textContent = '🔇';
        sounds.bgm.pause();
    }
    
    localStorage.setItem('soundEnabled', isSoundEnabled);
}

function playSound(soundName) {
    if (isSoundEnabled && sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play();
    }
}


// High Scores Management
function showHighScores() {
    const highScoresScreen = document.getElementById('highScores');
    updateHighScoresDisplay();
    highScoresScreen.style.display = 'block';
}

function closeHighScores() {
    const highScoresScreen = document.getElementById('highScores');
    highScoresScreen.style.display = 'none';
}

// High Score Management
function saveHighScore(difficulty, moves, time) {
    const difficultyMap = {
        '8': 'easy',
        '12': 'medium',
        '18': 'hard'
    };
    
    const difficultyName = difficultyMap[difficulty];
    const scores = JSON.parse(localStorage.getItem(`highScores_${difficultyName}`) || '[]');
    
    scores.push({ moves, time });
    scores.sort((a, b) => a.moves - b.moves || 
        convertTimeToSeconds(a.time) - convertTimeToSeconds(b.time));
    scores.splice(5); // Keep only top 5 scores
    
    localStorage.setItem(`highScores_${difficultyName}`, JSON.stringify(scores));
    updateHighScoresDisplay();
}

function convertTimeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
}

function updateHighScoresDisplay() {
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const scores = JSON.parse(localStorage.getItem(`highScores_${difficulty}`) || '[]');
        const scoresList = document.querySelector(`#${difficulty}Scores ul`);
        scoresList.innerHTML = scores.map((score, index) => 
            `<li>${index + 1}. Moves: ${score.moves} | Time: ${score.time}</li>`
        ).join('');
        
        // If no scores, show message
        if (scores.length === 0) {
            scoresList.innerHTML = '<li>No scores yet</li>';
        }
    });
}

// Initialize features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    isSoundEnabled = soundEnabled;
    const soundButton = document.getElementById('soundToggle');
    const soundIcon = soundButton.querySelector('.sound-icon');
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    
    // Add sound toggle event listener
    soundButton.addEventListener('click', toggleSound);
    
    // Initialize theme
    const savedTheme = localStorage.getItem('gameTheme') || 'default';
    document.body.className = `theme-${savedTheme}`;
    document.getElementById('theme').value = savedTheme;
    
    // Add theme change event listener
    document.getElementById('theme').addEventListener('change', (e) => {
        document.body.className = `theme-${e.target.value}`;
        localStorage.setItem('gameTheme', e.target.value);
    });
    
    // Initialize high scores display
    updateHighScoresDisplay();
});

// Update your existing game logic to include these features
function checkForMatch() {
    moves++;
    document.getElementById('moves').textContent = moves;
    
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;
    
    if (isMatch) {
        playSound('match');
        disableCards();
        updateMatches();
        
        if (matches === totalPairs) {
            setTimeout(() => {
                handleWin();
            }, 500);
        }
    } else {
        unflipCards();
    }
}


function handleCardClick(card) {
    if (canFlipCard(card)) {
        playSound('flip');
        flipCard(card);
        
        if (firstCard === null) {
            firstCard = card;
        } else {
            secondCard = card;
            checkForMatch();
        }
    }
}

function handleWin() {
    playSound('win');
    const finalTime = document.getElementById('timer').textContent;
    const difficulty = document.getElementById('difficulty').value;
    
    saveHighScore(difficulty, moves, finalTime);
    
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('winScreen').classList.add('active');
}