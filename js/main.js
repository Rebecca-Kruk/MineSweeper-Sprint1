'use strict';

const MINE = '💣';
const FLAG = '⛳'
const EMPTY = '';

var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1
};
var gLifeCounter;
var gTimeInterval;
var gFirstClick;


function initGame() {
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gFirstClick = true;
    gLifeCounter = gLevel.LIVES;
    gBoard = buildBoard(gLevel.SIZE);
    clearInterval(gTimeInterval);
    console.log('gBoard:', gBoard);
    // DOM:
    renderBoard(gBoard, '.board-container');
    renderSmiley('😀');
    renderLives();
    document.querySelector('.timer').innerHTML = '0';
}


// Board Size
function setBoardSize(SIZE, MINES, LIVES) {
    gLevel = {
        SIZE,
        MINES,
        LIVES
    };
    initGame();
}


// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard(size) {
    var board = [];

    for (var i = 0; i < size; i++) {
        var row = [];

        for (var j = 0; j < size; j++) {
            var cell = [i][j];
            cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };

            row.push(cell);
        }
        board.push(row);
    }

    return board;
}


// Set the Mines on the Board
function placeMines() {
    gBoard = buildBoard(gLevel.SIZE);

    for (var i = 0; i < gLevel.MINES;) {
        var randomCell = getRandomCell(gLevel.SIZE);

        if (gBoard[randomCell.i][randomCell.j].isMine) continue;

        gBoard[randomCell.i][randomCell.j] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        };

        i++;
    }
}


// Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countMinesNegs(i, j, board);
        }
    }
}


// Render Board
function renderBoard(board, selector) {
    var strHTML = '<table><tbody>\n';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';

        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];

            if (board[i][j].isMine) {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell-${i}-${j} mine" onclick="cellClicked(${i}, ${j})">
                        <span hidden class="mineS">${MINE}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            }
            else if (board[i][j].minesAroundCount === 0) {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell-${i}-${j}" onclick="cellClicked(${i}, ${j})">
                        <span hidden>${EMPTY}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            } else {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell-${i}-${j}" onclick="cellClicked(${i}, ${j})">
                        <span hidden>${cell.minesAroundCount}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            }
        }
        strHTML += '</tr>\n';
    }

    strHTML += '</tbody></table>';
    const elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


// Called when a cell (td) is clicked
function cellClicked(i, j) {
    if (!gGame.isOn) return;

    if (gFirstClick) {
        placeMines();

        while (gBoard[i][j].isMine) {
            placeMines();
        }

        setMinesNegsCount(gBoard);
        renderBoard(gBoard, '.board-container');
    }

    if (gBoard[i][j].isMarked) return;

    var elCurrCell = document.querySelector(`.cell-${i}-${j}`);

    // Start Timer
    if (!gGame.secsPassed) {
        gTimeInterval = setInterval(startTimer, 1000);
        gGame.secsPassed++;
    }

    // You stepped on a Mine
    if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        gLifeCounter--;

        // DOM Lives Count
        renderLives();

        if (gLifeCounter === 0) {
            // Model:
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    if (gBoard[i][j].isMine) {
                        gBoard[i][j].isShown = true;
                    }
                }
            }

            // Dom:
            var elMine = document.querySelectorAll('.mineS');

            for (var i = 0; i < elMine.length; i++) {
                elMine[i].hidden = false;
                document.querySelectorAll('.mine')[i].style.backgroundColor = 'antiquewhite';
                elCurrCell.style.backgroundColor = 'red';
                document.querySelectorAll('.mine .flag')[i].hidden = true;
            }

            // Restart the Game
            gGame.isOn = false;
            clearInterval(gTimeInterval);
            renderSmiley('😭');
            return;
        }
    }

    // You stepped on an Empty Cell or Not
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCurrCell, i, j);
    } else {
        // Model:
        gBoard[i][j].isShown = true;
        // Dom:
        elCurrCell.querySelector(`span`).hidden = false;
        elCurrCell.style.backgroundColor = 'antiquewhite';
    }

    gFirstClick = false;
    checkGameOver();
}


// Place a FLAG - Called on right click to mark a cell (suspected to be a mine)
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    oncontextmenu = (e) => { e.preventDefault() };

    if (gBoard[i][j].isShown) return;
    else {
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
        elCell.querySelector('span.flag').hidden = !elCell.querySelector('span.flag').hidden;
    }

    checkGameOver();
}


// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    gGame.markedCount = 0;
    gGame.shownCount = 0;

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isMine === true && (cell.isShown === true || cell.isMarked === true)) {
                gGame.markedCount++;
            }
            if (cell.isShown) {
                gGame.shownCount++;
            }
        }
    }

    // Restart the Game
    if ((gGame.markedCount === gLevel.MINES) && (gGame.shownCount >= (gLevel.SIZE ** 2) - gLevel.MINES) && (gLifeCounter > 0)) {
        gGame.isOn = false;
        clearInterval(gTimeInterval);
        renderSmiley('🥳');
    }
}


// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors
function expandShown(board, elCell, i, j) {
    // Update Current Cell 
    // Model:
    board[i][j].isShown = true;
    // Dom:
    elCell.querySelector('span').hidden = false;
    elCell.style.backgroundColor = 'antiquewhite';

    // Update Neighbors 
    for (var r = i - 1; r <= i + 1; r++) {
        if (r < 0 || r >= board.length) continue;

        for (var c = j - 1; c <= j + 1; c++) {
            if (r === i && c === j) continue;
            if (c < 0 || c >= board[r].length) continue;
            if (board[r][c].isMine) continue;
            if (board[r][c].isMarked) continue;

            // Model:
            board[r][c].isShown = true;
            // Dom:
            var currCell = document.querySelector(`.cell-${r}-${c}`);
            currCell.querySelector('span').hidden = false;
            currCell.style.backgroundColor = 'antiquewhite';
        }
    }
}


// Render Restart Button
function renderSmiley(smiley) {
    document.querySelector('.restart').innerHTML = `${smiley}`;
}


// Render Lives Count
function renderLives() {
    var strHTML = '';

    for (var i = 0; i < gLifeCounter; i++) {
        strHTML += '🤍';
    }

    document.querySelector('.lives').innerHTML = strHTML;
}


// Timer
function startTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = `${gGame.secsPassed}`;
    gGame.secsPassed++;
}