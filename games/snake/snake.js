const playBoard = document.querySelector(".play-board");

const scoreElement = document.querySelector(".score");
const highscoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const message = document.getElementById("message");

let gameState = 'start';
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let snakeBody = [];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;
let highscore = localStorage.getItem("high-score") || 0;
highscoreElement.innerText = `High Score: ${highscore}`;
const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

const changeDirection = (e) => {

    if (gameState != 'play' && e.key === 'Enter') {
        gameState = 'play';
    }

    if (gameState === 'play') {
        if ((e.key === "ArrowUp" || e.key === "w") && velocityY != 1) {
            velocityX = 0;
            velocityY = -1;
        } else if ((e.key === "ArrowDown" || e.key === "s") && velocityY != -1) {
            velocityX = 0;
            velocityY = 1;
        } else if ((e.key === "ArrowLeft" || e.key === "a") && velocityX != 1) {
            velocityX = -1;
            velocityY = 0;
        } else if ((e.key === "ArrowRight" || e.key === "d") && velocityX != -1) {
            velocityX = 1;
            velocityY = 0;
        }
    }
}

controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));



const handleGameOver = () => {
    clearInterval(setIntervalId);
    message.innerHTML = 'Game Over! Press Enter To Play Again';

    document.addEventListener('click', () => {
        location.reload();
    });


    document.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            location.reload();

        }
    });
}

const initGame = () => {
    if (gameState === 'gameover') {
        return handleGameOver();
    }
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX} "></div>`;
    if(gameState === 'start'){
        message.innerHTML = 'Press Enter to Play';
    } else{
        message.innerHTML = '';

    }

    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        score++;

        highscore = score >= highscore ? score : highscore;
        localStorage.setItem("high-score", highscore);
        scoreElement.innerText = `Score: ${score}`;
        highscoreElement.innerText = `High Score: ${highscore}`;

    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameState = 'gameover';
    }

    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]} "></div>`;

        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameState = 'gameover';
        }
    }

    playBoard.innerHTML = htmlMarkup;
}
changeFoodPosition();
setIntervalId = setInterval(initGame, 125);
document.addEventListener('click', () => gameState = 'play');
document.addEventListener("keyup", changeDirection);