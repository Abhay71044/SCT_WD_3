// ===================================
// TIC TAC TOE GAME - JAVASCRIPT
// ===================================

/**
 * Game State Variables
 * These variables track the current state of the game
 */
let board = Array(9).fill(null); // 3x3 grid represented as array of 9 elements
let currentPlayer = "X"; // Current player (X or O)
let gameMode = null; // Game mode: 'pvp' (Player vs Player) or 'ai' (Player vs AI)
let winner = null; // Stores the winner (X, O, or null)
let isDraw = false; // Flag to check if game ended in a draw
let turnCount = 0; // Number of turns taken
let isAIThinking = false; // Flag to prevent moves while AI is thinking

/**
 * DOM Element References
 * Cache references to frequently accessed DOM elements
 */
const modeSelection = document.getElementById('mode-selection');
const gameScreen = document.getElementById('game-screen');
const pvpBtn = document.getElementById('pvp-btn');
const aiBtn = document.getElementById('ai-btn');
const restartBtn = document.getElementById('restart-btn');
const changeModeBtn = document.getElementById('change-mode-btn');
const gameStatus = document.getElementById('game-status');
const turnCountDisplay = document.getElementById('turn-count');
const gameModeLabel = document.getElementById('game-mode-label');
const cells = document.querySelectorAll('.cell');

/**
 * All possible winning combinations on a tic-tac-toe board
 * Each sub-array represents indices of three cells that form a winning line
 */
const WINNING_COMBINATIONS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal: top-left to bottom-right
    [2, 4, 6]  // Diagonal: top-right to bottom-left
];

/**
 * Initialize Event Listeners
 * Set up click handlers for all buttons and cells
 */
function initializeEventListeners() {
    // Mode selection buttons
    pvpBtn.addEventListener('click', () => startGame('pvp'));
    aiBtn.addEventListener('click', () => startGame('ai'));
    
    // Game control buttons
    restartBtn.addEventListener('click', resetGame);
    changeModeBtn.addEventListener('click', backToMenu);
    
    // Game board cells
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
}

/**
 * Start a new game with the selected mode
 * @param {string} mode - Either 'pvp' or 'ai'
 */
function startGame(mode) {
    gameMode = mode;
    
    // Update UI labels
    if (mode === 'ai') {
        gameModeLabel.textContent = 'Player vs AI';
    } else {
        gameModeLabel.textContent = 'Player vs Player';
    }
    
    // Show game screen and hide mode selection
    modeSelection.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Reset the game state
    resetGame();
}

/**
 * Reset the game to initial state
 * Clears the board and resets all variables
 */
function resetGame() {
    // Reset game state
    board = Array(9).fill(null);
    currentPlayer = "X";
    winner = null;
    isDraw = false;
    turnCount = 0;
    isAIThinking = false;
    
    // Reset all cells
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'player-x', 'player-o');
        cell.disabled = false;
    });
    
    // Update display
    updateGameStatus();
    updateTurnCount();
}

/**
 * Return to mode selection screen
 */
function backToMenu() {
    gameScreen.classList.add('hidden');
    modeSelection.classList.remove('hidden');
    gameMode = null;
    resetGame();
}

/**
 * Handle click event on a game board cell
 * @param {number} index - Index of the clicked cell (0-8)
 */
function handleCellClick(index) {
    // Prevent move if:
    // - Cell is already filled
    // - Game is over (winner or draw)
    // - AI is currently thinking
    if (board[index] !== null || winner || isDraw || isAIThinking) {
        return;
    }
    
    // Make the move
    makeMove(index, currentPlayer);
    
    // Check for game end conditions
    if (checkForWinner()) {
        winner = currentPlayer;
        endGame();
        return;
    }
    
    if (checkForDraw()) {
        isDraw = true;
        endGame();
        return;
    }
    
    // Switch to next player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateGameStatus();
    
    // If playing against AI and it's AI's turn, make AI move
    if (gameMode === 'ai' && currentPlayer === 'O') {
        isAIThinking = true;
        updateGameStatus();
        
        // Add delay to make AI feel more natural
        setTimeout(() => {
            const aiMove = getAIMove();
            makeMove(aiMove, 'O');
            
            // Check for winner after AI move
            if (checkForWinner()) {
                winner = 'O';
                endGame();
                return;
            }
            
            // Check for draw after AI move
            if (checkForDraw()) {
                isDraw = true;
                endGame();
                return;
            }
            
            // Switch back to player
            currentPlayer = 'X';
            isAIThinking = false;
            updateGameStatus();
        }, 500); // 500ms delay for better UX
    }
}

/**
 * Make a move on the board
 * @param {number} index - Cell index (0-8)
 * @param {string} player - Player making the move ('X' or 'O')
 */
function makeMove(index, player) {
    // Update game state
    board[index] = player;
    turnCount++;
    
    // Update cell display
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('filled');
    cell.classList.add(player === 'X' ? 'player-x' : 'player-o');
    cell.disabled = true;
    
    // Update turn counter
    updateTurnCount();
}

/**
 * Check if there's a winner
 * @returns {boolean} - True if there's a winner, false otherwise
 */
function checkForWinner() {
    // Check each winning combination
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (
            board[a] !== null &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Check if the game is a draw
 * @returns {boolean} - True if board is full and no winner
 */
function checkForDraw() {
    return board.every(cell => cell !== null) && !checkForWinner();
}

/**
 * AI move logic - uses simple strategy:
 * 1. Win if possible
 * 2. Block player from winning
 * 3. Take center if available
 * 4. Take a corner if available
 * 5. Take any available spot
 * @returns {number} - Index of the chosen move
 */
function getAIMove() {
    // Get all empty cell indices
    const availableMoves = board
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
    
    // Strategy 1: Check if AI can win in the next move
    for (const move of availableMoves) {
        board[move] = 'O'; // Test the move
        if (checkForWinner()) {
            board[move] = null; // Undo test move
            return move;
        }
        board[move] = null; // Undo test move
    }
    
    // Strategy 2: Block player from winning
    for (const move of availableMoves) {
        board[move] = 'X'; // Test opponent's move
        if (checkForWinner()) {
            board[move] = null; // Undo test move
            return move; // Block this winning move
        }
        board[move] = null; // Undo test move
    }
    
    // Strategy 3: Take center if available (index 4)
    if (board[4] === null) {
        return 4;
    }
    
    // Strategy 4: Take a corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => board[index] === null);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Strategy 5: Take any available spot
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Handle game end (win or draw)
 * Disables all cells and updates status
 */
function endGame() {
    // Disable all cells
    cells.forEach(cell => {
        cell.disabled = true;
    });
    
    // Update status display
    updateGameStatus();
}

/**
 * Update the game status message
 */
function updateGameStatus() {
    if (winner) {
        // Winner message
        if (gameMode === 'ai' && winner === 'O') {
            gameStatus.textContent = '🤖 AI Wins!';
        } else {
            gameStatus.textContent = `🎉 Player ${winner} Wins!`;
        }
        gameStatus.classList.add('winner');
        gameStatus.classList.remove('draw');
    } else if (isDraw) {
        // Draw message
        gameStatus.textContent = '🤝 It\'s a Draw!';
        gameStatus.classList.add('draw');
        gameStatus.classList.remove('winner');
    } else {
        // Current turn message
        if (isAIThinking) {
            gameStatus.textContent = 'AI is thinking...';
        } else if (gameMode === 'ai' && currentPlayer === 'O') {
            gameStatus.textContent = 'AI\'s Turn';
        } else {
            gameStatus.textContent = `Player ${currentPlayer}'s Turn`;
        }
        gameStatus.classList.remove('winner', 'draw');
    }
}

/**
 * Update the turn counter display
 */
function updateTurnCount() {
    turnCountDisplay.textContent = `Turn: ${turnCount}`;
}

/**
 * Initialize the game when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});