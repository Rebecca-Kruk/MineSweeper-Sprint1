'use strict';

function countMinesNegs(cellI, cellJ, board) {
    var neighborsCount = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }

    return neighborsCount;
}

function getRandomCell(size) {
    var cells = [];

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var cell = { i, j };
            cells.push(cell);
        }
    }

    var randomCell = drawCell(cells);
    return randomCell;
}

function drawCell(cells) {
    var randIdx = getRandomInt(0, cells.length);
    var cellLocation = cells[randIdx];
    cells.splice(randIdx, 1);
    return cellLocation;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
