const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');

const gridSize = 32; // Size of each grid cell
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const gridCols = canvasWidth / gridSize;
const gridRows = canvasHeight / gridSize;

const pieces = [
    [
        [1,1],
        [1,1]
    ],
    [
        [0,2,0,0],
        [0,2,0,0],
        [0,2,0,0],
        [0,2,0,0]
    ],
    [
        [0,0,0],
        [3,3,3],
        [0,0,3]
    ],
    [
        [0,0,0],
        [4,4,4],
        [4,0,0]
    ],
    [
        [0,0,0],
        [5,5,5],
        [0,0,5]
    ],
    [
        [0,0,0],
        [6,6,0],
        [0,6,6]
    ],
    [
        [0,0,0],
        [7,7,7],
        [0,7,0]
    ]
];

const colors = [
    '#000000', // 0 - Empty
    '#FFFF00', // 1 - Yellow (O)
    '#00FFFF', // 2 - Cyan (I)
    '#800080', // 3 - Purple (T)
    '#FFA500', // 4 - Orange (L)
    '#0000FF', // 5 - Blue (J)
    '#00FF00', // 6 - Green (S)
    '#FF0000'  // 7 - Red (Z)
];


let board = createBoard();
let currentPiece = generatePiece();
let pieceX = 3;
let pieceY = 0;
let dropCounter = 0;
let dropInterval = 1000; // Milliseconds

function createBoard() {
    return Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));
}

function generatePiece() {
    const pieceIndex = Math.floor(Math.random() * pieces.length);
    return {
        shape: pieces[pieceIndex],
        colorIndex: pieceIndex + 1
    };
}

function drawGrid() {
    context.strokeStyle = '#ccc';
    for (let x = 0; x < gridCols; x++) {
        for (let y = 0; y < gridRows; y++) {
            context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }
}


function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                context.strokeStyle = '#000';
                context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize); // Grid lines for blocks
            }
        });
    });
}

function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[currentPiece.colorIndex];
                context.fillRect((pieceX + x) * gridSize, (pieceY + y) * gridSize, gridSize, gridSize);
                context.strokeStyle = '#000';
                context.strokeRect((pieceX + x) * gridSize, (pieceY + y) * gridSize, gridSize, gridSize); // Grid lines for blocks
            }
        });
    });
}


function draw() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid();
    drawBoard();
    drawPiece();
}

function gameLoop(timestamp = 0) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        pieceY++;
        if (checkCollision()) {
            pieceY--;
            freezePiece();
            clearLines();
            currentPiece = generatePiece();
            pieceX = 3;
            pieceY = 0;
            if (checkGameOver()) {
                board = createBoard(); // Reset board for new game
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

let lastTime = 0;
gameLoop();


function checkCollision() {
    return currentPiece.shape.find((row, y) => {
        return row.find((value, x) => {
            if (value !== 0) {
                let boardX = pieceX + x;
                let boardY = pieceY + y;
                return (
                    boardX < 0 ||
                    boardX >= gridCols ||
                    boardY >= gridRows ||
                    (boardY >= 0 && board[boardY][boardX] !== 0)
                );
            }
            return false;
        });
    });
}


function freezePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[pieceY + y][pieceX + x] = currentPiece.colorIndex;
            }
        });
    });
}

function clearLines() {
    for (let y = gridRows - 1; y >= 0; --y) {
        if (board[y].every(value => value !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(gridCols).fill(0));
        }
    }
}

function checkGameOver() {
    return checkCollision(); // If new piece immediately collides, game over
}


document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        movePieceHorizontally(-1);
    } else if (event.key === 'ArrowRight') {
        movePieceHorizontally(1);
    } else if (event.key === 'ArrowDown') {
        movePieceDown();
    } else if (event.key === 'ArrowUp') {
        rotatePiece();
    }
});

function movePieceHorizontally(direction) {
    const originalX = pieceX;
    pieceX += direction;
    if (checkCollision()) {
        pieceX = originalX;
    }
}

function movePieceDown() {
    pieceY++;
    if (checkCollision()) {
        pieceY--;
        freezePiece();
        clearLines();
        currentPiece = generatePiece();
        pieceX = 3;
        pieceY = 0;
        if (checkGameOver()) {
            board = createBoard(); // Reset board for new game
        }
    }
    dropCounter = 0; // Reset drop counter when manually moved down
}


function rotatePiece() {
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotateMatrix(currentPiece.shape);
    if (checkCollision()) {
        currentPiece.shape = originalShape; // Revert rotation if collision
    }
}


function rotateMatrix(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    return result;
}
