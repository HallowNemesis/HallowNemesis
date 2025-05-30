document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const flagsLeft = document.querySelector('#flags-left');
    const result = document.querySelector('#result');

    const width = 10;
    let bombAmount = 20;
    let flags = 0;
    let squares = [];
    let isGameover = false;
    
    function createBoard() {

        flagsLeft.innerHTML = bombAmount;

        const bombArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array(width * width - bombAmount).fill('valid');
        const gameArray = emptyArray.concat(bombArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let index = 0; index < width * width; index++) {
            const square = document.createElement('div');
            square.id = index;
            square.classList.add(shuffledArray[index]);
            grid.appendChild(square);
            squares.push(square);

            square.addEventListener('click', function () {
                click(square);
            });

            square.addEventListener('contextmenu', function (e) {
                e.preventDefault(); 
                addFlag(square);
            });
        }

        for (let index = 0; index < squares.length; index++) {
            let total = 0;
            const isLeftEdge = (index % width === 0);
            const isRightEdge = (index % width === width - 1);

            if (squares[index].classList.contains('valid')) {
                if (index > 0 && !isLeftEdge && squares[index - 1].classList.contains('bomb')) {
                    total++;
                }
                if (index > 9 && !isRightEdge && squares[index + 1 - width].classList.contains('bomb')) {
                    total++;
                }
                if (index > 10 && squares[index - width].classList.contains('bomb')) {
                    total++;
                }
                if (index > 11 && !isLeftEdge && squares[index - width - 1].classList.contains('bomb')) {
                    total++;
                }
                if (index < 99 && !isRightEdge && squares[index + 1].classList.contains('bomb')) {
                    total++;
                }
                if (index < 90 && !isLeftEdge && squares[index - 1 + width].classList.contains('bomb')) {
                    total++;
                }
                if (index < 88 && !isRightEdge && squares[index + 1 + width].classList.contains('bomb')) {
                    total++;
                }
                if (index < 89 && squares[index + width].classList.contains('bomb')) {
                    total++;
                }
                squares[index].setAttribute('data', total);
            }

        }
    }
    createBoard();

    function addFlag(square) {
        if (isGameover) return;
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag');
                flags++;
                square.innerHTML = '🚩';
                flagsLeft.innerHTML = bombAmount - flags;
                checkWin();
            } else {
                square.classList.remove('flag');
                flags--;
                flagsLeft.innerHTML = bombAmount - flags;

            }
        }
    }

    function click(square) {
        if (isGameover || square.classList.contains('checked') || square.classList.contains('flag')) {
            return;
        }
        if (square.classList.contains('bomb')) {
            gameOver();
        } else {
            let total = square.getAttribute('data')
            if (total != 0) {
                if (total == 1) {
                    square.classList.add('one');
                }
                if (total == 2) {
                    square.classList.add('two');
                }
                if (total == 3) {
                    square.classList.add('three');
                }
                if (total == 4) {
                    square.classList.add('four');
                }
                square.innerHTML = total;
                return
            }
            checkSquare(square);
        }
        square.classList.add('checked');
    }

    function checkSquare(square) {
        const currentId = square.id;
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);

        setTimeout(function () {
            if (currentId > 0 && !isLeftEdge) {
                const newId = parseInt(currentId) - 1;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 9 && !isRightEdge) {
                const newId = parseInt(currentId) + 1 - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 10) {
                const newId = parseInt(currentId) - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 11 && !isLeftEdge) {
                const newId = parseInt(currentId) - 1 - width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 98 && !isRightEdge) {
                const newId = parseInt(currentId) + 1;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 90 && !isLeftEdge) {
                const newId = parseInt(currentId) - 1 + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 88 && !isRightEdge) {
                const newId = parseInt(currentId) + 1 + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 89) {
                const newId = parseInt(currentId) + width;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
        });
    }

    function checkWin() {
        let matches = 0;
        for (let index = 0; index < squares.length; index++) {
            if(squares[index].classList.contains('flag') && squares[index].classList.contains('bomb')){
                matches++;
            }
            if(matches === bombAmount){
                result.innerHTML = 'YOU WIN!';
                isGameover = true;
            }
        }
    }

    function gameOver() {
        result.innerHTML = "BOOM! Game Over!";
        isGameover = true;

        squares.forEach(function (square) {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣';
                square.classList.remove('bomb');
                square.classList.add('checked');
            }
        });
    }

});

