// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
	//ctx.save();
var w = canvas.width;
var h = canvas.height;
var delta;
var ANCHURA_LADRILLO = 16,
  	ALTURA_LADRILLO = 8;
var music;
var sound;

// var frames = 30;

function inicializarGestorTeclado(inputStates) {
    document.onkeydown = function (e) {
        // Arrow Key Codes
        // 32 - spacebar
        // 37 - left
        // 38 - up
        // 39 - right
        // 40 - down
        if (e.keyCode === 37) {
            // izquierda
            inputStates.left = true;
        }
        if (e.keyCode === 39) {
            // derecha
            inputStates.right = true;
        }
        if (e.keyCode === 32) {
            // disparo
            inputStates.space = true;
        }
        if (e.keyCode === 16) {
            // moverse con precision (lento)
            inputStates.shift = true;
        }
    };

    // Para que se mueva hasta que se suelte la tecla
    document.onkeyup = function (e) {
        if (e.keyCode === 37) {
            inputStates.left = false;
        }
        if (e.keyCode === 39) {
            inputStates.right = false;
        }
        if (e.keyCode === 32) {
            inputStates.space = false;
        }
        if (e.keyCode === 16) {
            inputStates.shift = false;
        }
    }
}

function spawnBall(balls, paddle) {
    var BALLDIAMETER = 6;
    var sticky = true;
    var coorX = (2*paddle.x+paddle.width)/2;
    var coorY = paddle.y-BALLDIAMETER/2-1;
    var randomSpeed = Math.floor(Math.random()*50+40);
    var randomAngle = Math.floor(Math.random()*2+1);
    if (randomAngle === 1)
        randomAngle = Math.PI/4;
    else if (randomAngle === 2)
        randomAngle = Math.PI*3/4;

    var bola = new Ball(coorX, coorY, randomAngle, randomSpeed, BALLDIAMETER, sticky);
    balls.push(bola);
}

function intersects(left, up, right, bottom, cx, cy, radius ) {
   var closestX = (cx < left ? left : (cx > right ? right : cx));
   var closestY = (cy < up ? up : (cy > bottom ? bottom : cy));
   var dx = closestX - cx;
   var dy = closestY - cy;
   var side;

   var dt = Math.abs(up - cy);
   var db = Math.abs(bottom - cy);
   var dr = Math.abs(right - cx);
   var dl = Math.abs(left - cx);
   var dm = Math.min(dt, db, dr, dl);
   switch (dm) {
     case dt:
      side = "top";
	  break;
     case db:
	  side = "bottom";
	  break;
     case dr:
	  side = "right";
	  break;
     case dl:
	  side = "left";
	  break;
   }

   return result = { c : ( dx * dx + dy * dy ) <= radius * radius, d : side  };
}

function testCollisionWithWalls(ball, w, h) {
    // @return  TRUE si toca borde inferior
    //          FALSE en cualquier otro caso

    var ret = false;


    if ((ball.x + ball.radius) >= w) {      // toca borde derecho
        ball.x = w-ball.radius;             // recolocar derecha -- 150 - 3 = 147 px
        ball.angle = -ball.angle + Math.PI;
        sound.play('wallhit');
    }

    if ((ball.x - ball.radius) <= 0) {      // toca borde izquierdo
        ball.x = ball.radius;               // recolocar izquierda -- 3 px
        ball.angle = -ball.angle + Math.PI;
        sound.play('wallhit');
    }

    if ((ball.y - ball.radius) <= 0) {      // toca borde superior
        ball.y = ball.radius;               // recolocar arriba -- 3 px
        ball.angle = -ball.angle;
        sound.play('wallhit');
    }

    if ((ball.y + ball.radius) >= h ) {     // toca borde inferior
        ball.y = h-ball.radius;             // recolocar debajo -- 150 - 3 = 147 px
        ball.angle = -ball.angle;
        ret = true;
    }
    return ret;
}

function Brick(x,y,color) {
    // Atributos
    this.x = x;
    this.y = y;
    var coords = {
        "green" :   [16,8], // green
        "pink"  :   [48,0], // pink
        "blue"  :   [32,8], // blue
        "yellow":   [16,0], // yellow
        "red"   :   [0,0], // red
        "grey"  :   [48,8]  // silver
    };
    this.sprite = new Sprite('img/sprites.png', coords[color], [ANCHURA_LADRILLO,ALTURA_LADRILLO], 16, [0]);
}

Brick.prototype = {
    draw : function(ctx) {
        ctx.restore();
        ctx.translate(this.x,this.y);
        this.sprite.render(ctx);
        ctx.resetTransform();
        ctx.save();
	}
};


// Función auxiliar
var calcDistanceToMove = function(delta, speed) {
    // speed = 300 pixeles por segundo
    // delta = 16,66 ms = 0,01666 segundos
    return num_pixels_frame = (speed * delta) / 1000; // 5 pixeles por frame
};


function Ball(x, y, angle, v, diameter, sticky) {

    // atributos
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = v;
    this.radius = diameter/2;
    this.sticky = sticky;

    this.draw = function(ctx) {
        ctx.restore();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.save();
    };

    this.move = function(x, y) {
        var incX = 0;
        var incY = 0;

        if ((x != undefined) && (y != undefined)) {
            this.x = x;
            this.y = y;
        }
        if (this.sticky === false) {
            incX = this.speed * Math.cos(this.angle);
            incY = this.speed * Math.sin(this.angle);
            this.x = this.x + calcDistanceToMove(delta, incX);
            if (this.y > 0) {
                this.y = this.y - calcDistanceToMove(delta, incY);
            }
        }
    };

    this.setSticky = function(value){
        this.sticky = value;
    }

}

// GAME FRAMEWORK STARTS HERE
var GF = function() {

  // vars for counting frames/s, used by the measureFPS function
  var frameCount = 0;
  var lastTime;
  var fpsContainer;
  var fps, oldTime = 0;
  var terrainPattern;
  var balls = [];
  var bricks = [];
  var bricksLeft;

  var lifes = 3;
  var gameStates = {
    gameRunning: false,
    gameOver: false
  };

  // vars for handling inputs
  var inputStates = {
      	left: false,
        right: false,
        space: false,
        shift: false
  };

    var paddle = {
        dead: true,
        x: 10,
        y: 130,
        width: 32,
        height: 8,
        speed: 300,     // pixels/s
        sticky: false,  // path/2/sprite        x,y      h,w   delta  frameNumbers
        sprite: new Sprite('img/sprites.png', [224,40], [32,8], 16, [0,1])
    };

  var ladrillos = [
    // grey - 13 bricks each row
    {x: 11, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO), y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 20, c: 'grey'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 20, c: 'grey'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 20, c: 'grey'},
    // red
    {x: 11, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO), y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 28, c: 'red'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 28, c: 'red'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 28, c: 'red'},
    // yellow
    {x: 11, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO), y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 36, c: 'yellow'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 36, c: 'yellow'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 36, c: 'yellow'},
    // blue
    {x: 11, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO), y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 44, c: 'blue'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 44, c: 'blue'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 44, c: 'blue'},
    // pink
    {x: 11, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO), y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 52, c: 'pink'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 52, c: 'pink'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 52, c: 'pink'},
    // green
    {x: 11, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO), y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO)+16*2, y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16*3, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO)+16*4, y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16*5, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO)+16*6, y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16*7, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO)+16*8, y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16*9, y: 60, c: 'green'}, {x: (11+ANCHURA_LADRILLO)+16*10, y: 60, c: 'green'},
    {x: (11+ANCHURA_LADRILLO)+16*11, y: 60, c: 'green'}
  ];


    var createBricks = function(){
        for (var i = ladrillos.length - 1; i >= 0; i--) {
            var ladrillo = ladrillos[i];
            bricks.push(new Brick(ladrillo.x, ladrillo.y, ladrillo.c));
        }
        bricksLeft = bricks.length;
    }

    var drawBricks = function(){
        for (var i = bricks.length - 1; i >= 0; i--) {
            var ladrillo = bricks[i];
            ladrillo.draw(ctx);
        }
    };

  var measureFPS = function(newTime) {

    // test for the very first invocation
    if (lastTime === undefined) {
      lastTime = newTime;
      return;
    }

    //calculate the difference between last & current frame
    var diffTime = newTime - lastTime;

    if (diffTime >= 1000) {

      fps = frameCount;
      frameCount = 0;
      lastTime = newTime;
    }

    //and display it in an element we appended to the
    // document in the start() function
    fpsContainer.innerHTML = 'FPS: ' + fps;
    frameCount++;
  };

  // clears the canvas content
  function clearCanvas() {
    ctx.restore();
    ctx.fillStyle = terrainPattern;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
  }

  function testBrickCollision(ball) {
    // Para cada ladrillo
    for (var i = bricks.length - 1; i >= 0; i--) {
        var ladrillo = bricks[i];
        var result = intersects(ladrillo.x, ladrillo.y, ladrillo.x+ANCHURA_LADRILLO, ladrillo.y+ALTURA_LADRILLO, ball.x, ball.y, ball.radius);
        if (result.c) {
            switch(result.d) {
                case "top":
                    ball.angle = -ball.angle;
                    ball.y = ladrillo.y - ball.radius;
                    break;
                case "bottom":
                    ball.angle = -ball.angle;
                    ball.y = ladrillo.y + ALTURA_LADRILLO;
                    break;
                case "right":
                    ball.angle = -ball.angle + Math.PI;
                    ball.x = ladrillo.x + ANCHURA_LADRILLO + ball.radius;
                    break;
                case "left":
                    ball.angle = -ball.angle + Math.PI;
                    ball.x = ladrillo.x - ball.radius;
                    break;
            }
            ball.speed += 5;
            bricks.splice(i, 1);
            sound.play('brickhit');
            }
    }
    // devuelve el número de ladrillos que quedan
    return bricks.length;
  }

  // Función para pintar la raqueta Vaus
  function drawVaus(x, y) {
        // Función para pintar la raqueta Vaus
        ctx.restore();
        ctx.translate(x,y);
        paddle.sprite.render(ctx);
        ctx.resetTransform();
        ctx.save();
  }

function displayLifes() {
    ctx.restore();
    ctx.font = "12px Open Sans";
    ctx.fillStyle = "red";
    ctx.fillText("Lifes: " + lifes,w-45, 15);
    ctx.save();
}

function displayMsg(msg, x, y, color) {
    ctx.restore();
    ctx.font = "12px Open Sans";
    ctx.fillStyle = color;
    ctx.fillText(msg, x, y);
    ctx.save();
}

  var updatePaddlePosition = function() {
        // update sprite
        paddle.sprite.update(delta);
        var incX = Math.ceil(calcDistanceToMove(delta, paddle.speed));
        var limiteDerecha = false;
        var limiteIzquierda = false;

        // Si pulsa shift, se mueve con precision, más despacio
        if (inputStates.shift) {
            incX = incX / 4;
        }

        if ( (paddle.x+paddle.width) >= w ) {
            //llego al limite
            limiteDerecha = true;
        } else if (paddle.x <= 0) {
            //llego al limite
            limiteIzquierda = true;
        }

        if (inputStates.left && !limiteIzquierda & gameStates.gameRunning) {
            // si pulsa izquierda y no sobrepasa el limite izquierdo
            paddle.x = paddle.x - incX;
        }

        if (inputStates.right && !limiteDerecha && gameStates.gameRunning) {
            // si pulsa derecha y no sobrepasa el limite derecho
            paddle.x = paddle.x + incX;
        }

        if (inputStates.space) {
            // disparar o sacar la bola
             for (var i = balls.length - 1; i >= 0; i--) {
                 balls[i].setSticky(false);
                 gameStates.gameRunning = true;
             }
        }
  };


  function updateBalls() {
    for (var i = balls.length - 1; i >= 0; i--) {
        var ball = balls[i];
        ball.move();
        var die = testCollisionWithWalls(ball, w, h);

        if (die) {
            balls.splice(i,1);
            if (balls.length === 0) {
                paddle.dead = true;
                lifes--;
                gameStates.gameRunning = false; // pause
                if (lifes <= 0){
                    gameStates.gameOver = true;
                }
            }
            sound.play('die');
        }

        bricksLeft = testBrickCollision(ball);

        var hit = intersects(paddle.x, paddle.y, paddle.x+paddle.width, paddle.y+paddle.height, ball.x, ball.y, ball.radius);
        if (hit.c) {
            // Si hay un toque, comprobamos
            switch(result.d) {
                case "top":                                 // toca por arriba
                    ball.y = paddle.y - ball.radius;
                    ball.angle = -ball.angle;
                    break;
                case "right":                               // toca por derecha
                    ball.x = paddle.x + paddle.width + ball.radius;
                    ball.angle = ball.angle + Math.PI;
                    break;
                case "left":                                // toca por izquierda
                    ball.x = paddle.x - ball.radius;
                    ball.angle = ball.angle + Math.PI;
                    break;
            }
            if (inputStates.right) {
                ball.angle *= (ball.angle < 0 ? 0.5 : 1.5);
            } else if (inputStates.left) {
                ball.angle *= (ball.angle > 0 ? 0.5 : 1.5);
            }
            sound.play('vaushit');
        }
        ball.draw(ctx);
      }
    }

  function timer(currentTime) {
    var aux = currentTime - oldTime;
    oldTime = currentTime;
    return aux;
  }

  var mainLoop = function(time) {
    //main function, called each frame
    measureFPS(time);

    // number of ms since last frame draw
    delta = timer(time);

    // Clear the canvas
    clearCanvas();

    // Mover Vaus de izquierda a derecha
    updatePaddlePosition();

    updateBalls();

    // draw Vaus
    drawVaus(paddle.x, paddle.y);

    // dibujar ladrillos
    drawBricks();

    // dibujar HUD vidas
    displayLifes();

    // gameStates.gameOver se actualiza en ctr+f -> die
    if (paddle.dead && !gameStates.gameOver) {
        spawnBall(balls, paddle);
        paddle.dead = false;
    }

    if (!gameStates.gameRunning) {   // pause (game not running)
        if (!gameStates.gameOver) {
            displayMsg("Press space button.", w/4, h*3/4, "white");
        } else {
            ctx.restore();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            displayMsg("Game Over.", w/3+5, h/2+10, "white");
        }

    }

    // call the animation loop every 1/60th of second
    requestAnimationFrame(mainLoop);
  };

    var loadAssets = function() {
        // load sound using howler.js
        music = new Howl({
            urls: ['assets/Game_Start.ogg'],
            volume: 0.2,
            onload: function() {
               sound = new Howl({
                    urls: ['assets/sounds.mp3'],
                    volume: 0.2,
                    buffer: true,
                    sprite: {
                        wallhit: [0, 700],
                        die: [1000, 1700],
                        laser: [3000, 700],
                        vaushit: [17000, 500],
                        brickhit: [18500, 500]
                    },
                    onload: function() {
                        init(); // when every music or sound is loaded
                    }
                });
            }
        });
    };

    var init = function() {
        startNewGame();
        // start the animation
        requestAnimationFrame(mainLoop);
    };

    var startNewGame = function() {
        // create wall bricks
        createBricks();
        // init background sprite
        initTerrain();
        music.play();
    };

    var initTerrain = function(){
        var terrain = new Sprite('img/sprites.png', [0, 80], [24, 32]);
        terrainPattern = ctx.createPattern(terrain.image(),'repeat');
    };

    var start = function() {
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
        // start keyboard listeners
        inicializarGestorTeclado(inputStates);
        // start loading sprites
        resources.load(['img/sprites.png']);
        // when ready jump to init function.
        resources.onReady(loadAssets);
    };

  //our GameFramework returns a public API visible from outside its scope
  return {
    start: start
  };
};


var game = new GF();
game.start();