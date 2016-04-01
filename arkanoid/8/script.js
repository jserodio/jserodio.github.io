// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
	ctx.save();
var w = canvas.width;
var h = canvas.height;
var x = 130,
  	y = 135; // posición inicial de Vaus
var delta;
var ANCHURA_LADRILLO = 20,
  	ALTURA_LADRILLO = 10;

// var frames = 30;

function spawnBall(balls){
    // TO-DO: mejorar y aleatorizar
    var bola = new Ball(30, 100, Math.PI*7/4, 15, 6, false);      // bola diagonal
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
}

Brick.prototype = {
	 draw : function(ctx) {
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x+ANCHURA_LADRILLO,this.y);
        ctx.lineTo(this.x+ANCHURA_LADRILLO,this.y+ALTURA_LADRILLO);
        ctx.lineTo(this.x, this.y+ALTURA_LADRILLO);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
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
        ctx.fillStyle = "green";
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

}

// GAME FRAMEWORK STARTS HERE
var GF = function() {

  // vars for counting frames/s, used by the measureFPS function
  var frameCount = 0;
  var lastTime;
  var fpsContainer;
  var fps, oldTime = 0;

  var speed = 300; // px/s
  var vausWidth = 30,
      vausHeight = 10;

  var balls = [];
  var bricks = [];
  var bricksLeft;

  var lifes = 3;

  // vars for handling inputs
  var inputStates = {
      	left: false,
        right: false,
        space: false,
        shift: false
  };


  var ladrillos = [
    // grey
    {
      x: 20,
      y: 20,
      c: 'grey'
    }, {
      x: (20 * 2 + ANCHURA_LADRILLO),
      y: 20,
      c: 'grey'
    }, {
      x: 20 * 3 + ANCHURA_LADRILLO * 2,
      y: 20,
      c: 'grey'
    }, {
      x: 20 * 4 + ANCHURA_LADRILLO * 3,
      y: 20,
      c: 'grey'
    }, {
      x: 20 * 5 + ANCHURA_LADRILLO * 4,
      y: 20,
      c: 'grey'
    },
    // red
    {
      x: 20,
      y: 42,
      c: 'red'
    }, {
      x: 20 * 2 + ANCHURA_LADRILLO,
      y: 42,
      c: 'red'
    }, {
      x: 20 * 3 + ANCHURA_LADRILLO * 2,
      y: 42,
      c: 'red'
    }, {
      x: 20 * 4 + ANCHURA_LADRILLO * 3,
      y: 42,
      c: 'red'
    }, {
      x: 20 * 5 + ANCHURA_LADRILLO * 4,
      y: 42,
      c: 'red'
    }
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
    ctx.clearRect(0, 0, w, h);
    // ctx.fillStyle = "rgba(0, 128, 0, 0.45)";
    // ctx.fillRect(0, 0, w, h);
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
            }
    }
    // devuelve el número de ladrillos que quedan
    return bricks.length;
  }

  // Función para pintar la raqueta Vaus
  function drawVaus(x, y) {
        // Función para pintar la raqueta Vaus
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+vausWidth,y);
        ctx.lineTo(x+vausWidth,y+vausHeight);
        ctx.lineTo(x, y+vausHeight);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.save();
  }

function displayLifes() {
    ctx.restore();
    ctx.font = "12px Open Sans";
    ctx.fillStyle = "red";
    ctx.fillText("Lifes: " + lifes,w-45, 15);
    ctx.save();
}

  var updatePaddlePosition = function() {

        var incX = Math.ceil(calcDistanceToMove(delta, speed));
        var limiteDerecha = false;
        var limiteIzquierda = false;

        // Si pulsa shift, se mueve con precision, más despacio
        if (inputStates.shift) {
            incX = incX / 4;
        }


        if ( (x+vausWidth) >= w ) {
            //llego al limite
            limiteDerecha = true;
        } else if (x <= 0) {
            //llego al limite
            limiteIzquierda = true;
        }

        if (inputStates.left && !limiteIzquierda) {
            // si pulsa izquierda y no sobrepasa el limite izquierdo
            x = x - incX;
        }

        if (inputStates.right && !limiteDerecha) {
            // si pulsa derecha y no sobrepasa el limite derecho
            x = x + incX;
        }

        if (inputStates.space) {
            // hacer algo
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
                lifes--;
                if (lifes != 0){
                    spawnBall(balls);
                }
            }

        }

        bricksLeft = testBrickCollision(ball);

        var hit = intersects(x, y, x+vausWidth, y+vausHeight, ball.x, ball.y, ball.radius);
        if (hit.c) {
            // Si hay un toque, comprobamos
            switch(result.d) {
                case "top":                                 // toca por arriba
                    ball.y = y - ball.radius;
                    ball.angle = -ball.angle;
                    break;
                case "right":                               // toca por derecha
                    ball.x = x + vausWidth + ball.radius;
                    ball.angle = ball.angle + Math.PI;
                    break;
                case "left":                                // toca por izquierda
                    ball.x = x - ball.radius;
                    ball.angle = ball.angle + Math.PI;
                    break;
            }
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
    drawVaus(x, y);

    // dibujar ladrillos
    drawBricks();

    // dibujar HUD vidas
    displayLifes();

    // call the animation loop every 1/60th of second
    requestAnimationFrame(mainLoop);
  };

    var start = function() {
    // adds a div for displaying the fps value
    fpsContainer = document.createElement('div');
    document.body.appendChild(fpsContainer);

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
                console.log("¡bang! ¡pam, pam! ¡paiummm! 🔫");
                console.log("");
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

    spawnBall(balls);

	createBricks();

    // start the animation
    requestAnimationFrame(mainLoop);

    test('Comprobar vidas', function(assert) {
        var done = assert.async();
        setTimeout(function() {
            assert.ok(lifes < 3, "Passed!");
            done();
        }, 10000);
    });

    };

  //our GameFramework returns a public API visible from outside its scope
  return {
    start: start
  };
};


var game = new GF();
game.start();