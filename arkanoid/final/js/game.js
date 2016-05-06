// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
	//ctx.save();
var w = canvas.width;
var h = canvas.height;
var delta;
var ANCHURA_LADRILLO = 42,
  	ALTURA_LADRILLO = 20;
var SPRITES = 'img/bigsprites.png';
var graphics = "high";
var audio = "on";
var music;
var sound;

var ieedge = /MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d+/i.test(navigator.userAgent);

if (ieedge) {
   // if internet explorer 9, 10, 11 or MS-Edge.
   graphics = "low";
   audio = "off";
   document.getElementById("volumen").value = 0;
   document.getElementById("volumen").disabled = true;
}

function cambiarVolumen() {
    // get value from HTML input range and assign it.
    var vol = document.getElementById("volumen").value / 100;
    Howler.volume(vol);
    document.getElementById("volumentxt").innerHTML = vol;
}

function inicializarGestorTeclado(inputStates) {
    document.onkeydown = function (e) {
        // Arrow Key Codes
        // 32 - spacebar
        // 37 - left
        // 38 - up
        // 39 - right
        // 40 - down
        // 80/112 - p/P key pause
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
        }
        if (e.keyCode === 16) {
            // moverse con precision (lento)
            inputStates.shift = true;
        }
    };

    // Para que se mueva hasta que se suelte la tecla
    document.onkeyup = function (e) {
        if (e.keyCode === 37) {
            // izquierda
            inputStates.left = false;
        }
        if (e.keyCode === 39) {
            // derecha
            inputStates.right = false;
        }
        if (e.keyCode === 32) {
            // disparo
            inputStates.space = true;
            inputStates.pause = true;
        }
        if (e.keyCode === 16) {
            // moverse con precision (lento)
            inputStates.shift = false;
        }
        if (e.keyCode === 80 || e.keyCode === 112) {
            // pause
            inputStates.pause = true;
        }
        if (e.keyCode === 71 || e.keyCode === 103) {
            // graphics (G/g)
            if (!ieedge) {
                inputStates.graphics = true;
            }
        }
    }
}

function spawnBall(balls, paddle) {
    var BALLDIAMETER = 6;
    var coorX = (2*paddle.x+paddle.width)/2;
    var coorY = paddle.y-BALLDIAMETER/2-1;
    var randomSpeed = Math.floor(Math.random()*80+120);
    var randomAngle = Math.floor(Math.random()*2+1);
    if (randomAngle === 1)
        randomAngle = Math.PI/4;
    else if (randomAngle === 2)
        randomAngle = Math.PI*3/4;

    var bola = new Ball(coorX, coorY, randomAngle, randomSpeed, BALLDIAMETER);
    bola.stop(); // iniciamos la bola parada
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
    }

    if ((ball.x - ball.radius) <= 0) {      // toca borde izquierdo
        ball.x = ball.radius;               // recolocar izquierda -- 3 px
        ball.angle = -ball.angle + Math.PI;
    }

    if ((ball.y - ball.radius) <= 0) {      // toca borde superior
        ball.y = ball.radius;               // recolocar arriba -- 3 px
        ball.angle = -ball.angle;
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
    this.color = color;
    var coords = {
        "red"   :   [0,25], // red
        "pink"  :   [44,25], // pink
        "blue"  :   [88,25], // blue
        "green" :   [132,25], // green
        "yellow":   [176,25], // yellow
        "grey"  :   [220,25]  // silver
    };
    this.sprite = new Sprite(SPRITES, coords[this.color], [ANCHURA_LADRILLO,ALTURA_LADRILLO], 16, [0]);
}

Brick.prototype = {
    draw : function(ctx) {
        ctx.restore();
        if (graphics === "high") {
            ctx.translate(this.x,this.y);
            this.sprite.render(ctx);
            ctx.resetTransform();
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, ANCHURA_LADRILLO, ALTURA_LADRILLO);
        }
        ctx.save();
	}
};


// Función auxiliar
var calcDistanceToMove = function(delta, speed) {
    // speed = 300 pixeles por segundo
    // delta = 16,66 ms = 0,01666 segundos
    return num_pixels_frame = (speed * delta) / 1000; // 5 pixeles por frame
};


function Ball(x, y, angle, v, diameter) {

    // atributos
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = v;
    this.initialSpeed = v; // this never changes
    this.radius = diameter/2;

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

        incX = this.speed * Math.cos(this.angle);
        incY = this.speed * Math.sin(this.angle);
        this.x = this.x + calcDistanceToMove(delta, incX);
        if (this.y > 0) {
            this.y = this.y - calcDistanceToMove(delta, incY);
        }

    };

    this.stop = function() {
        this.speed = 0;
    }

    this.play = function() {
        this.speed = this.initialSpeed;
    }

}

function Bonus() {
    this.type = "L";
    this.x = 50;
    this.y = 50;
    this.width = 44;
    this.height = 22;
    this.speed = 80;                    // XY   w,h     DELTA   FRAMES
    this.sprite =  new Sprite(SPRITES, [0,47], [44,22], 0.008, [0,1,2,3,4,5,6,7]);
}
Bonus.prototype = {
    draw : function(ctx) {
        ctx.save();
        if (graphics === "high") {
            ctx.translate(this.x, this.y);
            this.sprite.render(ctx);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    },
    move : function() {
        this.sprite.update(delta);  // aim to the new frame animation
        this.y += calcDistanceToMove(delta, this.speed); // move bonus down
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
  var bonuses = [];
  var bricksLeft;

  var lives = {
    count: 3,
    sprite: new Sprite(SPRITES, [178,0], [35,9], 16, [0])
  }

  var gameStates = {
    gameRunning: false,
    gameOver: false
  };

  // vars for handling inputs
  var inputStates = {
      	left: false,
        right: false,
        space: false,
        shift: false,
        pause: false,
        graphics: false
  };

    var paddle = {
        dead: true,
        x: 100,
        y: 450,
        width: 88,
        height: 22,
        speed: 340,     // pixels/s
        //           x,y    w, h  delta frameNumbers
        sprite: new Sprite(SPRITES, [0,0], [88,22], 16, [0,1])
    };

  var ladrillos = [
    // grey - 13 bricks each row
    // 20 pixels of horizonal separation // starting at x=50
    // 25 pixels of vertical separation // starting at y=25
    {x: 50, y: 25, c: 'grey'},{x: 50+(ANCHURA_LADRILLO+20)*1, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y: 25, c: 'grey'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*4, y: 25, c: 'grey'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y: 25, c: 'grey'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y: 25, c: 'grey'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y: 25, c: 'grey'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y: 25, c: 'grey'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y: 25, c: 'grey'},
    // red
    {x: 50, y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*1, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*4 , y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y:  25+(ALTURA_LADRILLO+25), c: 'red'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y:  25+(ALTURA_LADRILLO+25), c: 'red'},
    // yellow
    {x: 50, y: 25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*1, y: 25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*4 , y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y:  25+(ALTURA_LADRILLO+25)*2, c: 'yellow'},
    // // blue
    {x: 50, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*1, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*4 , y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y:  25+(ALTURA_LADRILLO+25)*3, c: 'blue'},
    // // pink
    {x: 50, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*1, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*4 , y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y: 25+(ALTURA_LADRILLO+25)*4, c: 'pink'},
    // // green
    {x: 50, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*1, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*2, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*3, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*4 , y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*5, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*6, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*7, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*8, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*9, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*10, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}, {x: 50+(ANCHURA_LADRILLO+20)*11, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'},
    {x: 50+(ANCHURA_LADRILLO+20)*12, y: 25+(ALTURA_LADRILLO+25)*5, c: 'green'}
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

    if (graphics === "high") {
        ctx.fillStyle = terrainPattern;
    } else {
        ctx.fillStyle = "Navy";
    }

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
            ball.speed += 2;
            bricks.splice(i, 1);

            if (audio === "on") {
                sound.play('brickhit');
            }

            // bonus

            }
    }
    // devuelve el número de ladrillos que quedan
    return bricks.length;
  }

  // Función para pintar la raqueta Vaus
  function drawVaus(x, y) {
        // Función para pintar la raqueta Vaus
        ctx.restore();
        if (graphics === "high") {
            ctx.translate(x,y);
            paddle.sprite.render(ctx);
            ctx.resetTransform();
        } else {
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, paddle.width, paddle.height);
        }
        ctx.save();
  }

function displayLives() {
    ctx.restore();
    if (graphics === "high") {
        ctx.font = "18px Open Sans";
        ctx.fillStyle = "white";
        ctx.fillText("Lives: ",w-200, h-10);

        if (lives.count >= 1) {
            ctx.translate(w-150,h-20);
            lives.sprite.render(ctx);
            ctx.resetTransform();
        }
        if (lives.count >= 2) {
            ctx.translate(w-110,h-20);
            lives.sprite.render(ctx);
            ctx.resetTransform();
        }

        if (lives.count >= 3) {
            ctx.translate(w-70,h-20);
            lives.sprite.render(ctx);
            ctx.resetTransform();
        }

    } else {
        ctx.font = "18px Open Sans";
        ctx.fillStyle = "white";
        ctx.fillText("Lives: " + lives.count,w-110, h-10);
    }
    ctx.save();
}

function displayMsg(msg, x, y, color) {
    ctx.restore();
    ctx.font = "24px Open Sans";
    ctx.fillStyle = color;
    ctx.fillText(msg, x, y);
    ctx.save();
}

function pause(gameStates, balls) {
    if (inputStates.space) {
        if (!gameStates.gameRunning) {
            // console.log("resume game");
            for (var i = balls.length - 1; i >= 0; i--) {
                    balls[i].play();
                }
            gameStates.gameRunning = true;
        }
        inputStates.space = false;
    } else {
        if (gameStates.gameRunning) {
            // console.log("pausing game");
            for (var i = balls.length - 1; i >= 0; i--) {
                    balls[i].stop();
                }
            gameStates.gameRunning = false;
        } else {
            // console.log("resume game");
            for (var i = balls.length - 1; i >= 0; i--) {
                    balls[i].play();
                }
            gameStates.gameRunning = true;
        }
        blur();
    }
    inputStates.pause = false;
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

        if (inputStates.graphics) {
            if (graphics === "high") {
                graphics = "low";
            } else {
                graphics = "high";
            }
            inputStates.graphics = false;
        }

        if (inputStates.space) {
            // disparo
        }

        if (inputStates.pause) {
            pause(gameStates, balls);
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
                lives.count--;
                gameStates.gameRunning = false; // pause
                if (lives.count <= 0){
                    gameStates.gameOver = true;
                }
            }

            if (audio === "on") {
                sound.play('die');
            }
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
            // spin effect
            if (inputStates.right) {
                ball.angle *= (ball.angle < 0 ? 1 : 1.5);
            } else if (inputStates.left) {
                ball.angle *= (ball.angle > 0 ? 1 : 1.5);
            }

            if (audio === "on") {
                sound.play('vaushit');
            }
        }
        ball.draw(ctx);
      }
    }

    function updateBonus() {
        for (var i = bonuses.length - 1; i >= 0; i--) {
            var bonus = bonuses[i];
            bonus.draw(ctx, 50, 50);
            bonus.move();
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

    updateBonus();

    // draw Vaus
    drawVaus(paddle.x, paddle.y);

    // dibujar ladrillos
    drawBricks();

    // dibujar HUD vidas
    displayLives();

    // gameStates.gameOver se actualiza en ctr+f -> die
    if (paddle.dead && !gameStates.gameOver) {
        spawnBall(balls, paddle);
        paddle.dead = false;
    }

    if (!gameStates.gameRunning) {   // pause (game not running)
        if (gameStates.gameOver) {
            ctx.restore();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            displayMsg("Game Over.", w/2.2, h/2+10, "white");
            return 0;
        } else {
            displayMsg("Press space button.", w/2.6, h*3/4, "white");
        }
    }

    if (bricksLeft <= 0) {
        ctx.restore();
        ctx.fillStyle = "Navy";
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        displayMsg("You won!!.", w/2.2, h/2+10, "white");
        return 0;
     }

    // call the animation loop every 1/60th of second
    requestAnimationFrame(mainLoop);
  };

    var loadAssets = function() {
        if (audio === "on") {
            music = new Howl({
                urls: ['assets/Game_Start.ogg'],
                volume: 0.2,
                onload: function() {
                    sound = new Howl({
                        urls: ['assets/sounds.mp3'],
                        volume: 0.2,
                        buffer: true,
                        sprite: {
                            die: [1120, 1010],      // 1.120 start, 1.010 duration
                            laser: [12485, 290],    // 12.485 start, 0.290 duration
                            vaushit: [16816, 770],  // 16.816 start, 0.770 duration
                            brickhit: [18616, 770]  // 18.616 start, 0.770 duration
                        },
                        onload: function() {
                            init(); // when every music or sound is loaded
                        }
                    });
                }
            });
        } else {
            init();
        }
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
        // add bonus
        bonuses.push(new Bonus());
        // play initial music
        if (audio === "on") {
            music.play();
        }
    };

    var initTerrain = function(){
        // this will just initialize the background
        // but each update the window will be cleared,
        // so look for (Ctrl+F) clearCanvas()
        ctx.restore();
        if (graphics === "high") {
            var terrain = new Sprite(SPRITES, [0, 71], [24, 32]);
            terrainPattern = ctx.createPattern(terrain.image(),'repeat');
        }
        ctx.save();
    };

    var start = function() {
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
        // start keyboard listeners
        inicializarGestorTeclado(inputStates);
        // start loading sprites
        resources.load([SPRITES]);
        // when ready jump to init function.
        resources.onReady(loadAssets);
        // when window loses focus, it pauses the game
        //window.onblur = function(){inputStates.pause = true;};
        // change volume
        document.getElementById("volumen").onchange = cambiarVolumen;
        // call change volume function for the first time
        cambiarVolumen();
    };

  //our GameFramework returns a public API visible from outside its scope
  return {
    start: start
  };
};


var game = new GF();
game.start();
