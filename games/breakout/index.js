var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d");
var rect = canvas.getBoundingClientRect();
var ballRadius = 10;
var x = rect.width / 2;
var y = rect.height / 2;
var speed = 2;
var dx, dy;
var paddleHeight = 17;
var paddleWidth = 80;
var paddleX = (rect.width - paddleWidth) / 2;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 6;
var brickColumnCount = Math.floor(Math.random() * 6 + 1);
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 50;
var brickOffsetLeft = 50;
var score = 0;
var totalScore = 0;
var lives = 3;
let gameState = 'start';


var bricks = [];

function loadBricks({ brickColumnCount, brickRowCount }) {
    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: "#" + Math.floor(Math.random() * 16777215).toString(16) };
        }
    }
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener('mousedown', () => {
    if (gameState == 'start') {

        if(brickColumnCount * brickRowCount == score){
            lives += 1;
            score = 0;
            brickColumnCount = Math.floor(Math.random() * 6 + 1);
            loadBricks({ brickColumnCount, brickRowCount });
            drawBricks({ brickColumnCount, brickRowCount });
        }

        gameState = gameState == 'start' ? 'play' : 'start';
        if (lives <= 0) {
            lives = 3;
            brickColumnCount = Math.floor(Math.random() * 6 + 1);
            loadBricks({ brickColumnCount, brickRowCount });
            drawBricks({ brickColumnCount, brickRowCount });
        }
        if (gameState === 'win') {
            gameState = 'play';
            loadBricks({ brickColumnCount: Math.floor(Math.random() * 6 + 1), brickRowCount });
            drawBricks({ brickColumnCount: Math.floor(Math.random() * 6 + 1), brickRowCount });
        }
        dx = Math.random() < 0.5 ? speed : -speed;
        dy = Math.random() < 0.5 ? speed : -speed;
    }
});

function keyDownHandler(e) {
    if (e.key === 'Enter' && gameState !== 'play') {
        
        if(brickColumnCount * brickRowCount == score){
            lives += 1;
            score = 0;
            brickColumnCount = Math.floor(Math.random() * 6 + 1);
            loadBricks({ brickColumnCount, brickRowCount });
            drawBricks({ brickColumnCount, brickRowCount });
        }

        gameState = gameState == 'start' ? 'play' : 'start';
        if (lives <= 0) {
            lives = 3;
            brickColumnCount = Math.floor(Math.random() * 6 + 1);
            loadBricks({ brickColumnCount, brickRowCount });
            drawBricks({ brickColumnCount, brickRowCount });
        }
        if (gameState === 'win') {
            gameState = 'play';
            loadBricks({ brickColumnCount: Math.floor(Math.random() * 6 + 1), brickRowCount });
            drawBricks({ brickColumnCount: Math.floor(Math.random() * 6 + 1), brickRowCount });
        }
        dx = Math.random() < 0.5 ? speed : -speed;
        dy = Math.random() < 0.5 ? speed : -speed;
    }
    if (e.key == "d" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if (e.key == "a" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "d" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key == "a" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - rect.left + paddleWidth / 2;
    if (relativeX > paddleWidth && relativeX < rect.width) {
        paddleX = relativeX - paddleWidth;
    }

}
function collisionDetection({ brickColumnCount, brickRowCount }) {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    totalScore++;
                    if (score == brickRowCount * brickColumnCount) {
                        x = rect.width / 2;
                        y = rect.height / 2;
                        dx = 0;
                        dy = 0;
                    }
                }
            }
        }
    }
}
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, rect.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
function drawBricks({ brickColumnCount, brickRowCount }) {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
function drawScore() {
    ctx.font = "28px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + totalScore, 8, 30);
}
function drawLives() {
    ctx.font = "28px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, rect.width - 135, 30);
}
function drawGameOver() {
    ctx.font = "28px Arial";
    ctx.fillStyle = "#0095DD";
    let msg = 'Game Over. You Lose';
    ctx.fillText(msg, rect.width / 2 - msg.length * 7, rect.height / 2 + 50);
}
function drawVictory() {
    ctx.font = "28px Arial";
    ctx.fillStyle = "#0095DD";
    let msg = 'Good Job. You win!';
    ctx.fillText(msg, rect.width / 2 - msg.length * 7, rect.height / 2 + 50);
}

loadBricks({ brickColumnCount, brickRowCount });
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks({ brickColumnCount, brickRowCount });
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection({ brickColumnCount, brickRowCount });



    if (gameState === 'play') {

        if (x + dx > rect.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        }
        else if (y + dy > rect.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
                dy += dy > 0 ? 0.5 : -0.5;
            }
            else {
                lives--;
                x = rect.width / 2;
                y = rect.height / 2;
                dx = 0;
                dy = 0;
                gameState = 'start';
                paddleX = (rect.width - paddleWidth) / 2;
            }
        }

        if (rightPressed && paddleX < rect.width - paddleWidth) {
            paddleX += 7;
        }
        else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
    }
    if (lives <= 0) {
        drawGameOver();
        score = 0;
        totalScore = 0;
        gameState = 'start';
        // message.innerHTML = 'Press Enter to Play Pong';
    }
    
    if (brickColumnCount * brickRowCount == score) {
        drawVictory();
        gameState = 'start';
        // message.innerHTML = 'Press Enter to Play Pong';
    }
    requestAnimationFrame(animate);
}

animate();