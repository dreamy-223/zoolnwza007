let puzzleCount = 1;
let playerHP = 100;
let enemyHP = 100;
let currentPuzzle = null;
let timerSeconds = 7;
let timerInterval = null;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateReflexPuzzle() {
    const type = Math.random() < 0.5 ? 'missing' : 'operator';
    const a = randomInt(1, 30);
    const b = randomInt(1, 30);
    const operators = ['+', '-', '*'];
    const op = operators[randomInt(0, operators.length - 1)];

    if (type === 'missing') {
        let left = a;
        let right = b;
        let result;

        if (op === '+') {
            result = left + right;
        } else if (op === '-') {
            if (left < right) [left, right] = [right, left];
            result = left - right;
        } else {
            result = left * right;
        }

        return {
            type,
            prompt: `${left} ${op} ? = ${result}`,
            answer: String(right),
        };
    }

    let left = a;
    let right = b;
    let result;

    if (op === '+') {
        result = left + right;
    } else if (op === '-') {
        if (left < right) [left, right] = [right, left];
        result = left - right;
    } else {
        result = left * right;
    }

    return {
        type,
        prompt: `${left} [?] ${right} = ${result}`,
        answer: op,
    };
}

function updateUIState(message = '') {
    const levelLabel = document.getElementById('levelLabel');
    const puzzleText = document.getElementById('puzzleText');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const timerFill = document.getElementById('timerFill');
    const scoreValue = document.getElementById('scoreValue');
    const timeValue = document.getElementById('timeValue');
    const answerInput = document.getElementById('answerInput');
    const playerHPText = document.getElementById('playerHP');
    const enemyHPText = document.getElementById('enemyHP');

    levelLabel.textContent = `Puzzle ${puzzleCount}`;
    puzzleText.textContent = currentPuzzle.prompt;
    feedbackMessage.textContent = message;
    timerFill.style.width = `${(timerSeconds / 7) * 100}%`;
    scoreValue.textContent = `Player HP: ${playerHP}`;
    timeValue.textContent = `${timerSeconds}s`;
    playerHPText.textContent = `HP: ${playerHP}`;
    enemyHPText.textContent = `HP: ${enemyHP}`;
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
}

function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = 7;
    updateUIState();

    timerInterval = setInterval(() => {
        timerSeconds -= 1;
        document.getElementById('timerFill').style.width = `${(timerSeconds / 7) * 100}%`;
        document.getElementById('timeValue').textContent = `${timerSeconds}s`;

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            playerHP -= 20;
            updateUIState('Time is up!');
            if (playerHP <= 0) {
                showResultOverlay(false);
                return;
            }
            puzzleCount += 1;
            currentPuzzle = generateReflexPuzzle();
            updateUIState('Time is up. Next puzzle.');
            shakeScreen();
            startTimer();
        }
    }, 1000);
}

function shakeScreen() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 350);
}

function showResultOverlay(victory) {
    const overlay = document.getElementById('resultOverlay');
    const resultText = document.getElementById('resultText');
    const playerImage = document.getElementById('playerImage');
    const bossImage = document.getElementById('bossImage');

    overlay.classList.add('visible');
    overlay.classList.toggle('victory', victory);
    overlay.classList.toggle('defeat', !victory);
    resultText.textContent = victory ? 'จับโจรได้แล้ว' : 'โจรหนีไปแล้ว';

    playerImage.src = victory ? 'ตำรวจ.jpg' : 'rabbit-officer-dead.png';
    bossImage.src = victory ? 'โจร-dead.jpg' : 'โจร.jpg';
    playerImage.classList.toggle('attack-animation', victory);
    bossImage.classList.remove('attack-animation');

    document.getElementById('answerInput').disabled = true;
    document.getElementById('answerSubmit').disabled = true;

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);
}

function validatePuzzleAnswer() {
    const input = document.getElementById('answerInput').value.trim();
    if (!input) {
        updateUIState('Type an answer first.');
        return;
    }

    const correctAnswer = currentPuzzle.answer.toLowerCase().trim();
    const userAnswer = input.toLowerCase().trim();
    const isCorrect = currentPuzzle.type === 'operator'
        ? userAnswer === correctAnswer
        : userAnswer === correctAnswer;

    if (isCorrect) {
        enemyHP -= 20;
    } else {
        playerHP -= 20;
    }

    updateUIState();

    if (enemyHP <= 0) {
        showResultOverlay(true);
        return;
    }

    if (playerHP <= 0) {
        showResultOverlay(false);
        return;
    }

    puzzleCount += 1;
    currentPuzzle = generateReflexPuzzle();
    updateUIState(isCorrect ? 'Correct! Next puzzle.' : 'Wrong answer. Next puzzle.');

    if (!isCorrect) {
        shakeScreen();
    }

    startTimer();
}

window.addEventListener('DOMContentLoaded', () => {
    currentPuzzle = generateReflexPuzzle();
    updateUIState();
    startTimer();

    document.getElementById('answerSubmit').addEventListener('click', validatePuzzleAnswer);
    document.getElementById('answerInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            validatePuzzleAnswer();
        }
    });

    document.getElementById('exitButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});