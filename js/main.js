'use strict';

const MINE = '💣';
const FLAG = '⛳'
const EMPTY = '';

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gTimer;
var gInterval;


function initGame() {
    gGame.isOn = true;
    gTimer = 0;
    gBoard = buildBoard(gLevel.SIZE);
    console.log(gBoard);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, '.board-container');
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

    for (var i = 0; i < gLevel.MINES; i++) {
        var randomCell = getRandomCell(size);
        // this condition in case if the randomCell is the same (how to expand the loop in such case) ?
        if (board[randomCell.i][randomCell.j].isMine) return;

        board[randomCell.i][randomCell.j] = {
            minesAroundCount: 0,
            isShown: false,
            isMine: true,
            isMarked: false
        };
        console.log('randomCell:', randomCell);
    }

    return board;
}


// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            // if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = countNeighbors(i, j, board);
        }
    }
}


function renderBoard(board, selector) {
    var strHTML = '<table><tbody>\n';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';

        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];

            if (board[i][j].isMine) {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell" onclick="cellClicked(this, ${i}, ${j})">
                        <span hidden>${MINE}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            }
            else if (board[i][j].minesAroundCount === 0) {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell" onclick="cellClicked(this, ${i}, ${j})">
                        <span hidden>${EMPTY}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            } else {
                strHTML += `<td oncontextmenu="cellMarked(this, ${i}, ${j})" class="cell" onclick="cellClicked(this, ${i}, ${j})">
                        <span hidden>${cell.minesAroundCount}</span><span hidden class="flag">${FLAG}</span></td>\n`;
            }
        }
        strHTML += '</tr>\n';
    }

    strHTML += '</tbody></table>';
    const elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;

    // console.log('strHTML:', strHTML);
}


// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isMarked) return;
    if (!gTimer) {
        gInterval = setInterval(startTimer, 1000);
        gTimer++;
        console.log('timer');
    }
    
    gBoard[i][j].isShown = true;
    elCell.querySelector('span').hidden = false;
    elCell.style.backgroundColor = 'antiquewhite';
}


// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
    oncontextmenu = (e) => { e.preventDefault() };

    if (gBoard[i][j].isShown) return;
    if (!gBoard[i][j].isShown) {
        // how to update the Model without adding location parameters ?
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
        elCell.querySelector('span.flag').hidden = !elCell.querySelector('span.flag').hidden;
    }
}


// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine && cell.isMarked) { }
        }
    }
}


// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, i, j) {

}


function startTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = `${gTimer}`;
    gTimer++;
}

