const canvas = document.getElementById('game');
const gameStart = document.getElementById('startScreen');
const gameOver = document.getElementById('gameoverScreen');
const scoreboard = document.getElementById('scoreBoard');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;

const aiSpeed = 1.25;
const paddleSpeed = 6;
const ballSpeed = 5;
var animate = true;

var score1 = 0; // Right Paddle Score
var score2 = 0; // Left Paddle Score
document.getElementById('p1').innerHTML = score1;
document.getElementById('p2').innerHTML = score2; 

function startGame(){
  gameStart.style.display = "none";
  canvas.style.display = "flex";
  gameOver.style.display ="none";
  scoreboard.style.display = "inline"; 
  
  score1 = 0;
  score2 = 0;
  document.getElementById('p1').innerHTML = score1;
  document.getElementById('p2').innerHTML = score2;

  if (animate == false) {
    animate = true;
    requestAnimationFrame(requestAnimationFrame);
  }
}

function endGame(){
  gameStart.style.display = "none";
  canvas.style.display ="none";
  gameOver.style.display ="block";
  scoreboard.style.display = "none";

  
  animate = false;
}

function checkScore(){
  if((score1 >= 7) || (score2 >=7)){
    endGame();
  }
}

function aiMovement(ball, rightPaddle){
  if(ball.dx > 0){
    if(ball.y > rightPaddle.y){
      rightPaddle.dy = aiSpeed;
      rightPaddle.y += rightPaddle.dy;

      if(rightPaddle.y + rightPaddle.heightight >= maxPaddleY){
        rightPaddle.y = maxPaddleY - paddleHeight;
      }
    }

    if(ball.y < rightPaddle.y){
      rightPaddle.dy = -aiSpeed;
      rightPaddle.y += rightPaddle.dy;
  
      if(rightPaddle.y <= grid){
        rightPaddle.y = grid;
      }
    }
  }
}

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  aiMovement(ball, rightPaddle);

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }
  
  // Score Builder
  context.font ="50px solid";
  context.fillText(score2, 150, 100);

  context.font ="50px solid";
  context.fillText(score1, 550, 100);

  // draw paddles
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;
    
    if(ball.x < 0) {
    ++score1; // Right Paddle Score
    document.getElementById('p1').innerHTML = score1;
    }
    if(ball.x > canvas.width) {
    ++score2; // Left Paddle Score
    document.getElementById('p2').innerHTML = score2; 
    }

    //aiMovement(ball, rightPaddle);

    checkScore();

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  aiMovement(ball, rightPaddle);

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {
  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
});

// start the game
if(animate == true){
  requestAnimationFrame(loop);
}
