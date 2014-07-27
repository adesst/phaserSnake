/**
 * Created by zosia on 26/12/13.
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'snake', {preload: preload, create: create, update: update});

var snakePart;
var snake = [];
var snakeLength = 5;
var food = {};
var grid = 20;
var velocity = 80;
var direction = 'right';
var headPosition = [];
var play = true;
var score = 0;
var scoreText;
var showFrame = false;
var availableXpos = [];
var availableYpos = [];
var refresh = false;
var keyboardInput = null
var gTicks = 400;

function preload() {
	game.stage.backgroundColor = '#98ED00';
	game.load.image('snakeBody', 'img/snake.gif');
	game.load.image('snakeHead', 'img/snakehead.gif');
	game.load.image('fruit', 'img/fruit.gif');
}

function create() {
	genAvailableFoodPositions();
	initSnake();
	initFood();

	scoreText = game.add.text(10, 566, 'Score : ' + score, { fontSize: '30px', fill: '#fff' });

}

function genAvailableFoodPositions() {
	var i;
	var j;

	for (i = 0; i < game.width; i++) {
		if (i % grid === 0) {
			availableXpos.push(i);
		}
	}

	for (j = 0; j < game.height; j++) {
		if (j % grid === 0) {
			availableYpos.push(j);
		}
	}
}

function initSnake() {
	var i;

	for(i = 0; i <= snakeLength - 1; i++) {
		if (i === snakeLength - 1) {
			headPosition = {
				x: i * grid,
				y: 0
			};
			snakePart = game.add.sprite(i * grid, 0, 'snakeBody');
		}
		else {
			snakePart = game.add.sprite(i * grid, 0, 'snakeBody');
		}
		snake.push(snakePart);
	}
}

function initFood() {
	var x;
	var y;

	do {
		x = availableXpos[Math.floor(Math.random() * availableXpos.length)];
		y = availableYpos[Math.floor(Math.random() * availableYpos.length)];
	} while (compareWithSnake(x,y)); //check if generated food's position is not the same as snake's body

	food = game.add.sprite(x, y, 'fruit');
	food.body.customSeparateX = true;
	food.body.customSeparateY = true;
}

function compareWithSnake(x, y) {
	var collision = false;

	snake.forEach(function(item) {
		if (item.body.x === x && item.body.y === y) {
			collision = true;
			return false;
		}
	});

	return collision;
}

function moveHeadPosition() {
	if (direction === 'left') {
		headPosition.x -= grid;
	}
	else if (direction === 'right') {
		headPosition.x += grid;
	}
	else if (direction === 'down') {
		headPosition.y += grid;
	}
	else if (direction === 'up') {
		headPosition.y -= grid;
	}
}

function detectCollision() {
	//could be done better? not sure if 100% works
	//detect collision with boundaries
	if ((snake[snakeLength - 1].body.x) >= game.width
		|| ((snake[snakeLength - 1].body.x + grid) <= 0)
		|| ((snake[snakeLength - 1].body.y + grid) <= 0)
		|| ((snake[snakeLength - 1].body.y ) >= game.height)) {
        play = false;
	}
	//detect collision with snake parts
	snake.forEach(function(item, index) {
		if (index !== (snakeLength - 1)
			&& ((snake[snakeLength - 1].body.x) === item.body.x)
			&& ((snake[snakeLength - 1].body.y) === item.body.y)) {
            play = false;
			return false;
		}
	});
	//detect collision with food
	game.physics.collide(snake[snakeLength-1], food, foodCollisionHandler, null, this);
}

function foodCollisionHandler(snakeHead, food) {
	var newSnakePart;

	moveHeadPosition();
	newSnakePart = game.add.sprite(headPosition.x, headPosition.y, 'snakeBody');
	snake.push(
		newSnakePart
	);
	score += 100;
	snakeLength++;
	food.destroy();
	initFood();
	scoreText.setText('Score : ' + score);
}

function gameStart()
{
    updateRefresh();
}

function updateRefresh()
{
    refresh = true;
    setTimeout(function(){updateRefresh(); }, gTicks);
}

function update() {

    if( game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) )
    {
        updateRefresh();
    }

    if ( keyboardInput == null)
    {
        if( game.input.keyboard.isDown(Phaser.Keyboard.LEFT) )
            keyboardInput = 'left';

        if( game.input.keyboard.isDown(Phaser.Keyboard.DOWN) )
            keyboardInput = 'down';

        if( game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) )
            keyboardInput = 'right';

        if( game.input.keyboard.isDown(Phaser.Keyboard.UP) )
            keyboardInput = 'up';
    }

	if (showFrame) {
		if (play) {

            if ( !refresh )
                return;

			if (keyboardInput == 'left' && direction !== 'right')
			{
				direction = 'left';
			}
			else if (keyboardInput == 'down' && direction !== 'up')
			{
				direction = 'down';
			}
			else if (keyboardInput == 'up' && direction !== 'down')
			{
				direction = 'up';
			}
			else if (keyboardInput == 'right' && direction !== 'left')
			{
				direction = 'right';
			}

            keyboardInput = null;

			moveHeadPosition();

			var tail = snake.shift(); //remove first position, tail of the snake
			tail.body.x = headPosition.x; //to check collisions
			tail.body.y = headPosition.y;

			//add new position to the beginning of the array
			snake.push(tail);

			//detect collision with boundaries or snake part
			detectCollision();
            refresh = false;
            errorCorrection = 1;
		}
		else {
			game.stage.backgroundColor = '#FF4540';
		}
		showFrame = false;
	}
	else {
		showFrame = true;
	}
}

